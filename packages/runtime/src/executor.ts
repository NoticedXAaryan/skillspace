import type { ExecutionResult, RunOptions } from '@skillspace/schema';
import { SkillResolver } from './resolver.js';
import { PermissionEnforcer } from './permissions.js';
import { adapterRegistry } from './adapters/registry.js';
import { loadConfig, getApiKey, getBaseUrl } from './config.js';
import type { RuntimeConfig } from './adapters/base.js';
import { TelemetryClient } from './telemetry.js';
import { LocalModelScreener } from './firewall/LocalModelScreener.js';
import { McpRegistry } from './mcp/McpRegistry.js';
import { FileSystemSandbox } from './sandbox.js';
import type { Tool, ChatMessage } from '@skillspace/schema';

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class ExecutionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = 'ExecutionError';
  }
}

export class FirewallBlockedError extends ExecutionError {
  constructor(message: string) {
    super(message, 'FIREWALL_BLOCKED', false);
    this.name = 'FirewallBlockedError';
  }
}

// ---------------------------------------------------------------------------
// Executor — the core SSR pipeline
// ---------------------------------------------------------------------------

/**
 * The Executor is the heart of SkillSpace Runtime (SSR).
 * Pipeline: resolve skill → select adapter → enforce permissions → build request → call API → return response
 */
export class Executor {
  private resolver: SkillResolver;

  constructor(resolver?: SkillResolver) {
    this.resolver = resolver ?? new SkillResolver();
  }

  /**
   * Execute a skill against an input and return the result.
   */
  async run(options: RunOptions): Promise<ExecutionResult> {
    const startTime = Date.now();

    // 1. Resolve skill from local cache
    const skill = this.resolver.resolve(options.skill);

    // 2. Determine required permissions and enforce
    const enforcer = new PermissionEnforcer(skill.name, skill.permissions);
    const fsSandbox = new FileSystemSandbox();
    this.enforceInputPermissions(enforcer, options, fsSandbox);

    // 3. Resolve model and adapter
    const modelId = options.model || loadConfig().default_model || 'ollama/llama3.2';
    const { adapter, modelName } = adapterRegistry.getAdapter(modelId);

    // 4. Get API key (Ollama doesn't need one)
    const provider = modelId.split('/')[0]!;
    const apiKey = getApiKey(provider) ?? '';
    if (!apiKey && provider !== 'ollama') {
      throw new ExecutionError(
        `No API key configured for "${provider}". Run \`skillspace model add ${provider}\` to set one.`,
        'AUTH_ERROR',
      );
    }

    // 5. Build runtime config
    const runtimeConfig: RuntimeConfig = {
      apiKey,
      modelId: modelName,
      temperature: options.config?.temperature ?? skill.config.temperature,
      maxTokens: options.config?.max_tokens ?? skill.config.max_tokens,
      timeoutSeconds: options.config?.timeout_seconds ?? skill.config.timeout_seconds,
      baseUrl: getBaseUrl(provider),
    };

    // 6. Read input (file path or string)
    const input = this.resolveInput(options.input, enforcer, fsSandbox);

    // Firewall Screening
    if (process.env.FIREWALL_ENABLED === 'true') {
      const firewall = new LocalModelScreener();
      const verdict = await firewall.screen(input, {
        skillName: skill.name,
        requestedScopes: skill.permissions || [],
      });

      if (!verdict.safe && verdict.confidence > 0.85) {
        TelemetryClient.sendEventSafe({
          packageId: skill.name,
          version: skill.version,
          modelId: 'firewall',
          durationMs: 0,
          status: 'error',
          errorMessage: `Firewall blocked: ${verdict.reason}`
        });
        throw new FirewallBlockedError(
          `Input blocked by injection firewall: ${verdict.reason}`
        );
      }
    }

    const mcpRegistry = new McpRegistry();
    let finalResult: import('@skillspace/schema').ExecutionResult | null = null;

    try {
      const hasMcp = skill.mcpServers && skill.mcpServers.length > 0;
      const tools: Tool[] = [];

      if (hasMcp) {
        if (!adapter.buildChatRequest) {
          throw new ExecutionError(`Adapter ${adapter.providerName} does not support Chat required for MCP`, 'UNSUPPORTED_ADAPTER');
        }
        for (const srv of skill.mcpServers!) {
          await mcpRegistry.connect(srv);
          const serverTools = await mcpRegistry.listTools(srv.name);
          for (const t of serverTools) {
            tools.push({
              name: `mcp_${srv.name}_${t.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
              description: t.description || `Tool from ${srv.name}`,
              parameters: (t.inputSchema?.properties || {}) as any,
              required: t.inputSchema?.required || []
            });
          }
        }

        const messages: ChatMessage[] = [
          { role: 'system', content: skill.instructions.system },
          { role: 'user', content: skill.instructions.user_template.replace('{{input}}', input) }
        ];

        let stepCount = 0;
        const MAX_STEPS = 10;
        while (stepCount < MAX_STEPS) {
          stepCount++;
          const request = adapter.buildChatRequest(messages, tools, runtimeConfig);
          const rawResponse = await this.callWithRetry(request, runtimeConfig.timeoutSeconds ?? 30);
          const result = adapter.parseResponse(rawResponse);
          const assistantMsg = result.message;

          if (!assistantMsg) {
            finalResult = result;
            break;
          }

          messages.push(assistantMsg);

          if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
            for (const tc of assistantMsg.tool_calls) {
              try {
                const args = JSON.parse(tc.function.arguments);
                if (tc.function.name.startsWith('mcp_')) {
                  const parts = tc.function.name.split('_');
                  const serverName = parts[1];
                  const originalToolName = parts.slice(2).join('_');
                  
                  // Enforce permissions explicitly required by this server
                  const srv = skill.mcpServers!.find((s: any) => s.name === serverName);
                  if (srv && srv.requiredScopes) {
                    for (const scope of srv.requiredScopes) {
                      enforcer.check(scope);
                    }
                  }

                  const toolResult = await mcpRegistry.callTool(serverName!, originalToolName, args);
                  messages.push({ role: 'tool', tool_call_id: tc.id, content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult) });
                } else {
                  messages.push({ role: 'tool', tool_call_id: tc.id, content: `Error: Unknown tool type` });
                }
              } catch (err) {
                messages.push({ role: 'tool', tool_call_id: tc.id, content: `Error executing tool: ${(err as Error).message}` });
              }
            }
          } else {
            finalResult = result;
            break;
          }
        }
        if (!finalResult) {
          throw new ExecutionError('Skill execution exceeded max steps', 'MAX_STEPS_EXCEEDED');
        }
      } else {
        // Normal execution path
        const request = adapter.buildRequest(skill, input, runtimeConfig);
        const rawResponse = await this.callWithRetry(request, runtimeConfig.timeoutSeconds ?? 30);
        finalResult = adapter.parseResponse(rawResponse);
      }

      finalResult.duration_ms = Date.now() - startTime;
      const result = finalResult;
      result.duration_ms = Date.now() - startTime;

      // 10. Validate output schema if specified
      if (skill.instructions.output_format === 'json' && skill.instructions.output_schema) {
        try {
          JSON.parse(result.output);
        } catch {
          // If output_format is json but output is not valid JSON, mark as warning
          console.warn(`Warning: Expected JSON output but received plain text from model.`);
        }
      }

      // 11. Write output to file if specified
      if (options.output) {
        enforcer.check('filesystem.write');
        fsSandbox.writeFileSync(options.output, result.output, 'utf-8');
      }

      TelemetryClient.sendEventSafe({
        packageId: skill.name,
        version: skill.version,
        modelId,
        durationMs: result.duration_ms || 0,
        status: 'success'
      });

      return result;
    } catch (e) {
      TelemetryClient.sendEventSafe({
        packageId: skill.name,
        version: skill.version,
        modelId,
        durationMs: Date.now() - startTime,
        status: 'error'
      });
      throw e;
    } finally {
      await mcpRegistry.disconnectAll();
    }
  }

  /**
   * Execute a skill with streaming output.
   */
  async *runStream(options: RunOptions): AsyncGenerator<string> {
    // 1. Resolve skill
    const skill = this.resolver.resolve(options.skill);

    // 2. Enforce permissions
    const enforcer = new PermissionEnforcer(skill.name, skill.permissions);
    const fsSandbox = new FileSystemSandbox();
    this.enforceInputPermissions(enforcer, options, fsSandbox);

    // 3. Resolve model and adapter
    const modelId = options.model || loadConfig().default_model || 'ollama/llama3.2';
    const { adapter, modelName } = adapterRegistry.getAdapter(modelId);

    if (!adapter.supportsStreaming || !adapter.parseStreamChunk) {
      throw new ExecutionError(
        `Provider "${adapter.providerId}" does not support streaming.`,
        'STREAMING_NOT_SUPPORTED',
      );
    }

    // 4. Build request with streaming enabled
    const provider = modelId.split('/')[0]!;
    const apiKey = getApiKey(provider) ?? '';

    const runtimeConfig: RuntimeConfig = {
      apiKey,
      modelId: modelName,
      temperature: options.config?.temperature ?? skill.config.temperature,
      maxTokens: options.config?.max_tokens ?? skill.config.max_tokens,
      timeoutSeconds: options.config?.timeout_seconds ?? skill.config.timeout_seconds,
      baseUrl: getBaseUrl(provider),
    };

    const input = this.resolveInput(options.input, enforcer, fsSandbox);

    // Firewall Screening
    if (process.env.FIREWALL_ENABLED === 'true') {
      const firewall = new LocalModelScreener();
      const verdict = await firewall.screen(input, {
        skillName: skill.name,
        requestedScopes: skill.permissions || [],
      });

      if (!verdict.safe && verdict.confidence > 0.85) {
        TelemetryClient.sendEventSafe({
          packageId: skill.name,
          version: skill.version,
          modelId: 'firewall',
          durationMs: 0,
          status: 'error',
          errorMessage: `Firewall blocked: ${verdict.reason}`
        });
        throw new FirewallBlockedError(
          `Input blocked by injection firewall: ${verdict.reason}`
        );
      }
    }

    const request = adapter.buildRequest(skill, input, runtimeConfig);

    // Enable streaming in the request body
    if (typeof request.body === 'object' && request.body !== null) {
      (request.body as Record<string, unknown>).stream = true;
    }

    // 5. Make streaming request
    const controller = new AbortController();
      let timeout = setTimeout(
        () => controller.abort(),
        (runtimeConfig.timeoutSeconds ?? 30) * 1000,
      );

      const startTime = Date.now();

      try {
        const response = await fetch(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify(request.body),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new ExecutionError(
            `Model API returned ${response.status}: ${response.statusText}`,
            'API_ERROR',
          );
        }

        if (!response.body) {
          throw new ExecutionError('No response body for streaming', 'STREAMING_ERROR');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          clearTimeout(timeout);
          timeout = setTimeout(() => controller.abort(), (runtimeConfig.timeoutSeconds ?? 30) * 1000);
          const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const text = adapter.parseStreamChunk(line);
          if (text) yield text;
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        const text = adapter.parseStreamChunk(buffer);
        if (text) yield text;
      }
      
      TelemetryClient.sendEventSafe({
        packageId: skill.name,
        version: skill.version,
        modelId,
        durationMs: Date.now() - startTime,
        status: 'success'
      });
    } catch (e) {
      TelemetryClient.sendEventSafe({
        packageId: skill.name,
        version: skill.version,
        modelId,
        durationMs: Date.now() - startTime,
        status: 'error'
      });
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }

  // -------------------------------------------------------------------------
  // Private methods
  // -------------------------------------------------------------------------

  /**
   * Check permissions for the input type.
   */
  private enforceInputPermissions(enforcer: PermissionEnforcer, options: RunOptions, fsSandbox: FileSystemSandbox): void {
    // If input looks like a file path and file exists, require filesystem.read
    if (options.input && fsSandbox.existsSync(options.input)) {
      enforcer.check('filesystem.read');
    }
    if (options.output) {
      enforcer.check('filesystem.write');
    }
  }

  /**
   * Resolve input — if it's a file path, read the file contents.
   */
  private resolveInput(input: string, _enforcer: PermissionEnforcer, fsSandbox: FileSystemSandbox): string {
    if (fsSandbox.existsSync(input)) {
      const stat = fsSandbox.statSync(input);
      if (stat.isFile()) {
        return fsSandbox.readFileSync(input, 'utf-8');
      }
      if (stat.isDirectory()) {
        // Read all files in directory (shallow)
        return this.readDirectoryContents(input, fsSandbox);
      }
    }
    return input;
  }

  /**
   * Read all text files in a directory for input.
   */
  private readDirectoryContents(dirPath: string, fsSandbox: FileSystemSandbox): string {
    const entries = fsSandbox.readdirSync(dirPath, { withFileTypes: true });
    const contents: string[] = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const filePath = `${dirPath}/${entry.name}`;
      try {
        const content = fsSandbox.readFileSync(filePath, 'utf-8');
        contents.push(`--- ${entry.name} ---\n${content}`);
      } catch {
        // Skip binary / unreadable files
      }
    }

    return contents.join('\n\n');
  }

  /**
   * Call model API with retry logic for rate limits.
   */
  private async callWithRetry(
    request: { url: string; headers: Record<string, string>; body: unknown },
    timeoutSeconds: number,
    maxRetries: number = 3,
  ): Promise<unknown> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          timeoutSeconds * 1000,
        );

        const response = await fetch(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify(request.body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          return await response.json();
        }

        // Handle specific error codes
        if (response.status === 429) {
          // Rate limited — retry with backoff
          const retryAfter = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.warn(
            `Rate limited by ${request.url}. Retrying in ${retryAfter / 1000}s...`,
          );
          await this.sleep(retryAfter);
          continue;
        }

        if (response.status === 401 || response.status === 403) {
          const provider = new URL(request.url).hostname;
          throw new ExecutionError(
            `Invalid API key for ${provider}. Run \`skillspace model add\` to reconfigure.`,
            'AUTH_ERROR',
          );
        }

        const errorBody = await response.text();
        throw new ExecutionError(
          `Model API error (${response.status}): ${errorBody}`,
          'API_ERROR',
          response.status >= 500, // Server errors are retryable
        );
      } catch (error) {
        if (error instanceof ExecutionError && !error.retryable) {
          throw error;
        }

        lastError = error instanceof Error ? error : new Error(String(error));

        if (lastError.name === 'AbortError') {
          throw new ExecutionError(
            `Request timed out after ${timeoutSeconds} seconds`,
            'TIMEOUT',
          );
        }

        // Retry for network errors
        if (attempt < maxRetries - 1) {
          const retryAfter = Math.pow(2, attempt) * 1000;
          await this.sleep(retryAfter);
        }
      }
    }

    throw new ExecutionError(
      `Failed after ${maxRetries} attempts: ${lastError?.message ?? 'Unknown error'}`,
      'MAX_RETRIES',
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
