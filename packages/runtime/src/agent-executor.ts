import * as fs from 'node:fs';
import type { ExecutionResult, ChatMessage, Tool, Agent } from '@skillspace/schema';
import { AgentResolver } from './agent-resolver.js';
import { PermissionEnforcer } from './permissions.js';
import { adapterRegistry } from './adapters/registry.js';
import { loadConfig, getApiKey, getBaseUrl } from './config.js';
import { ExecutionError, Executor } from './executor.js';
import type { RuntimeConfig, ModelAdapter } from './adapters/base.js';
import { SessionManager } from './session.js';

export interface AgentRunOptions {
  agent: string;
  input: string;
  session_id?: string;
}

export class AgentExecutor {
  private resolver: AgentResolver;
  private sessionManager: SessionManager;
  private skillExecutor: Executor;

  constructor(resolver?: AgentResolver, sessionManager?: SessionManager) {
    this.resolver = resolver ?? new AgentResolver();
    this.sessionManager = sessionManager ?? new SessionManager();
    this.skillExecutor = new Executor();
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
    const enforcer = new PermissionEnforcer(agent.name, Array.from(combinedPermissions));
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

    const input = this.resolveInput(options.input, enforcer);

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

    // 5. Generate tools from agent's skill dependencies
    const tools: Tool[] = skills.map(s => ({
      name: s.name.replace(/[^a-zA-Z0-9_-]/g, '_'), // ensure valid tool name format
      description: s.description,
      parameters: {
        input: {
          type: 'string',
          description: s.instructions.user_template
        }
      },
      required: ['input']
    }));

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
            const toolSkill = skills.find(s => s.name.replace(/[^a-zA-Z0-9_-]/g, '_') === tc.function.name);
            
            if (!toolSkill) {
              messages.push({ role: 'tool', tool_call_id: tc.id, content: `Error: Unknown tool ${tc.function.name}` });
              continue;
            }

            // Verify permissions inside the executor internally, just run it
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
          } catch (err) {
            messages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: `Error executing tool: ${err instanceof Error ? err.message : err}`
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
    return finalResult;
  }

  private enforceInputPermissions(enforcer: PermissionEnforcer, options: AgentRunOptions): void {
    if (options.input && fs.existsSync(options.input)) {
      enforcer.check('filesystem.read');
    }
  }

  private resolveInput(input: string, _enforcer: PermissionEnforcer): string {
    if (fs.existsSync(input)) {
      const stat = fs.statSync(input);
      if (stat.isFile()) {
        return fs.readFileSync(input, 'utf-8');
      }
    }
    return input;
  }

  private async callWithRetry(
    request: { url: string; headers: Record<string, string>; body: unknown },
    timeoutSeconds: number,
  ): Promise<unknown> {
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
    } finally {
      clearTimeout(timeout);
    }
  }
}
