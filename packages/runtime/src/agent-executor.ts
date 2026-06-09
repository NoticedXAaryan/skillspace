import * as fs from 'node:fs';
import { AgentResolver } from './agent-resolver.js';
import { PermissionEnforcer } from './permissions.js';
import { adapterRegistry } from './adapters/registry.js';
import { loadConfig, getApiKey, getBaseUrl } from './config.js';
import { ExecutionError, Executor } from './executor.js';
import type { RuntimeConfig } from './adapters/base.js';
import { SessionManager } from './session.js';
import { McpManager } from './mcp.js';
import { TelemetryClient } from './telemetry.js';
import { FileSystemSandbox, NetworkSandbox } from './sandbox.js';
import { type Tool, type ChatMessage, type ExecutionResult } from '@skillspace/schema';

export interface AgentRunOptions {
  agent: string;
  input: string;
  session_id?: string;
}

export class AgentExecutor {
  private resolver: AgentResolver;
  private sessionManager: SessionManager;
  private skillExecutor: Executor;
  private mcpManager: McpManager;

  constructor(resolver?: AgentResolver, sessionManager?: SessionManager, mcpManager?: McpManager) {
    this.resolver = resolver ?? new AgentResolver();
    this.sessionManager = sessionManager ?? new SessionManager();
    this.skillExecutor = new Executor();
    this.mcpManager = mcpManager ?? new McpManager();
  }

  async run(options: AgentRunOptions): Promise<ExecutionResult> {
    const startTime = Date.now();

    // 1. Resolve agent
    const { agent, skills } = this.resolver.resolveWithDependencies(options.agent);

    // 2. Determine permissions and enforce for input reading
    const combinedPermissions = new Set(agent.permissions);
    for (const skill of skills) {
      for (const p of skill.permissions) {
        combinedPermissions.add(p);
      }
    }
    const enforcer = new PermissionEnforcer(agent.name, Array.from(combinedPermissions) as string[]);
    this.enforceInputPermissions(enforcer, options);

    // 3. Resolve model and adapter
    const modelId = agent.model.id || loadConfig().default_model || 'ollama/llama3.2';
    const { adapter, modelName } = adapterRegistry.getAdapter(modelId);

    if (!adapter.buildChatRequest) {
      throw new ExecutionError(`Adapter ${adapter.providerName} does not support Chat/Agent functionality yet.`, 'UNSUPPORTED_ADAPTER');
    }

    const provider = modelId.split('/')[0]!;
    const apiKey = getApiKey(provider) ?? '';
    if (!apiKey && provider !== 'ollama') {
      throw new ExecutionError(`No API key configured for "${provider}".`, 'AUTH_ERROR');
    }

    const runtimeConfig: RuntimeConfig = {
      apiKey,
      modelId: modelName,
      temperature: agent.model.config?.temperature ?? 0.7,
      maxTokens: agent.model.config?.max_tokens ?? 4000,
      timeoutSeconds: 60,
      baseUrl: getBaseUrl(provider),
    };
    console.error(`[AgentExecutor] Provider: ${provider}, BaseURL: ${runtimeConfig.baseUrl}, from config: ${JSON.stringify(loadConfig())}`);

    const fsSandbox = new FileSystemSandbox();
    const input = this.resolveInput(options.input, enforcer, fsSandbox);

    // 4. Session memory
    let messages: ChatMessage[] = [];
    if (options.session_id) {
      messages = this.sessionManager.loadSession(options.session_id);
    }
    
    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content: `You are an agent named ${agent.name}.\n${agent.description}`
      });
    }

    messages.push({
      role: 'user',
      content: input
    });

    // 5. Start declared MCP servers
    for (const srv of agent.mcp_servers || []) {
      try {
        await this.mcpManager.startServer(srv.name);
      } catch (err) {
        console.warn(`Warning: Failed to start MCP server ${srv.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 6. Generate tools from agent's skill dependencies + MCP servers + builtins
    const tools: Tool[] = skills.map(s => ({
      name: `skill_${s.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`, // prefix to avoid collisions
      description: s.description,
      parameters: {
        input: {
          type: 'string',
          description: s.instructions.user_template
        }
      },
      required: ['input']
    }));

    const mcpTools = this.mcpManager.getAttachedTools();
    for (const { serverName, tool } of mcpTools) {
      // Create a clean tool name for the LLM
      const safeToolName = tool.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      tools.push({
        name: `mcp_${serverName}_${safeToolName}`,
        description: tool.description || `Tool from ${serverName}`,
        parameters: (tool.inputSchema?.properties || {}) as any,
        required: tool.inputSchema?.required || []
      });
    }

    // Add Builtin Tools based on permissions
    if (combinedPermissions.has('filesystem.read')) {
      tools.push({
        name: 'builtin_filesystem_read',
        description: 'Read the contents of a local file',
        parameters: { path: { type: 'string', description: 'Absolute or relative path to the file' } },
        required: ['path']
      });
    }
    if (combinedPermissions.has('filesystem.write')) {
      tools.push({
        name: 'builtin_filesystem_write',
        description: 'Write content to a local file',
        parameters: { 
          path: { type: 'string', description: 'Absolute or relative path to the file' },
          content: { type: 'string', description: 'Content to write to the file' }
        },
        required: ['path', 'content']
      });
    }
    if (combinedPermissions.has('network.fetch')) {
      tools.push({
        name: 'builtin_network_fetch',
        description: 'Fetch content from a URL',
        parameters: { url: { type: 'string', description: 'The URL to fetch' } },
        required: ['url']
      });
    }

    // Execution loop
    const MAX_STEPS = 10;
    let stepCount = 0;
    let finalResult: ExecutionResult | null = null;

    while (stepCount < MAX_STEPS) {
      stepCount++;
      const request = adapter.buildChatRequest(messages, tools, runtimeConfig);
      const rawResponse = await this.callWithRetry(request, runtimeConfig.timeoutSeconds ?? 60);
      const result = adapter.parseResponse(rawResponse);
      
      const assistantMsg = result.message;
      if (!assistantMsg) {
        throw new ExecutionError('Adapter returned no assistant message', 'API_ERROR');
      }

      messages.push(assistantMsg);

      if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
        // Handle tool calls
        for (const tc of assistantMsg.tool_calls) {
          try {
            const args = JSON.parse(tc.function.arguments);
            
            if (tc.function.name.startsWith('builtin_')) {
              // Built-in tools
              if (tc.function.name === 'builtin_filesystem_read') {
                enforcer.check('filesystem.read');
                const content = fsSandbox.readFileSync(args.path, 'utf-8');
                messages.push({ role: 'tool', tool_call_id: tc.id, content });
              } else if (tc.function.name === 'builtin_filesystem_write') {
                enforcer.check('filesystem.write');
                fsSandbox.writeFileSync(args.path, args.content, 'utf-8');
                messages.push({ role: 'tool', tool_call_id: tc.id, content: `Successfully wrote to ${args.path}` });
              } else if (tc.function.name === 'builtin_network_fetch') {
                enforcer.check('network.fetch');
                const res = await NetworkSandbox.fetch(args.url);
                const text = await res.text();
                messages.push({ role: 'tool', tool_call_id: tc.id, content: text });
              } else {
                messages.push({ role: 'tool', tool_call_id: tc.id, content: `Error: Unknown builtin tool ${tc.function.name}` });
              }
            } else if (tc.function.name.startsWith('skill_')) {
              // It's a Skill
              const skillName = tc.function.name.substring(6);
              const toolSkill = skills.find(s => s.name.replace(/[^a-zA-Z0-9_-]/g, '_') === skillName);
              
              if (!toolSkill) {
                messages.push({ role: 'tool', tool_call_id: tc.id, content: `Error: Unknown skill tool ${tc.function.name}` });
                continue;
              }

              const toolResult = await this.skillExecutor.run({
                skill: toolSkill.name,
                input: typeof args.input === 'string' ? args.input : JSON.stringify(args),
                model: modelId
              });

              messages.push({
                role: 'tool',
                tool_call_id: tc.id,
                content: toolResult.output
              });

            } else if (tc.function.name.startsWith('mcp_')) {
              // It's an MCP tool
              // Format is mcp_serverName_toolName
              const parts = tc.function.name.split('_');
              const serverName = parts[1];
              // Reconstruct original tool name by matching against our known MCP tools
              const originalTool = mcpTools.find(m => m.serverName === serverName && m.tool.name.replace(/[^a-zA-Z0-9_-]/g, '_') === parts.slice(2).join('_'));
              
              if (!originalTool) {
                messages.push({ role: 'tool', tool_call_id: tc.id, content: `Error: Unknown MCP tool ${tc.function.name}` });
                continue;
              }

              // Execute via MCP Manager
              const toolResult = await this.mcpManager.callTool(serverName!, originalTool.tool.name, args);
              
              messages.push({
                role: 'tool',
                tool_call_id: tc.id,
                content: toolResult
              });
            } else {
              messages.push({ role: 'tool', tool_call_id: tc.id, content: `Error: Unknown tool type ${tc.function.name}` });
            }
            
          } catch (err) {
            messages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: `Error executing tool: ${err instanceof Error ? err.message : String(err)}`
            });
          }
        }
        // Loop back and call model again with the tool results
      } else {
        // Finished
        finalResult = result;
        break;
      }
    }

    if (!finalResult) {
      throw new ExecutionError('Agent execution exceeded max steps (infinite tool loop detected)', 'MAX_STEPS_EXCEEDED');
    }

    // Save session
    if (options.session_id) {
      this.sessionManager.saveSession(options.session_id, messages);
    }

    finalResult.duration_ms = Date.now() - startTime;
    
    TelemetryClient.sendEventSafe({
      packageId: agent.name,
      version: agent.version,
      modelId,
      durationMs: finalResult.duration_ms,
      status: 'success'
    });

    return finalResult;
  }

  private enforceInputPermissions(enforcer: PermissionEnforcer, options: AgentRunOptions): void {
    if (options.input && fs.existsSync(options.input)) {
      enforcer.check('filesystem.read');
    }
  }

  private resolveInput(input: string, _enforcer: PermissionEnforcer, fsSandbox: FileSystemSandbox): string {
    if (fsSandbox.existsSync(input)) {
      const stat = fsSandbox.statSync(input);
      if (stat.isFile()) {
        return fsSandbox.readFileSync(input, 'utf-8');
      }
    }
    return input;
  }

  private async callWithRetry(
    request: { url: string; headers: Record<string, string>; body: unknown },
    timeoutSeconds: number,
  ): Promise<unknown> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

      try {
        const response = await fetch(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify(request.body),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new ExecutionError(`Model API error: ${response.status} ${errText}`, 'API_ERROR');
        }

        return await response.json();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (lastError.name === 'AbortError') {
          throw new ExecutionError(`Request timed out after ${timeoutSeconds} seconds`, 'TIMEOUT');
        }
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      } finally {
        clearTimeout(timeout);
      }
    }
    throw new ExecutionError(`Failed after 3 attempts: ${lastError?.message ?? 'Unknown error'}`, 'MAX_RETRIES');
  }
}
