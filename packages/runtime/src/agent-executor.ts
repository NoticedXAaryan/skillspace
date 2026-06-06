import * as fs from 'node:fs';
import type { ExecutionResult } from '@skillspace/schema';
import { AgentResolver } from './agent-resolver.js';
import { PermissionEnforcer } from './permissions.js';
import { adapterRegistry } from './adapters/registry.js';
import { loadConfig, getApiKey, getBaseUrl } from './config.js';
import { ExecutionError } from './executor.js';
import type { RuntimeConfig } from './adapters/base.js';

export interface AgentRunOptions {
  agent: string;
  input: string;
  session_id?: string;
}

export class AgentExecutor {
  private resolver: AgentResolver;

  constructor(resolver?: AgentResolver) {
    this.resolver = resolver ?? new AgentResolver();
  }

  async run(options: AgentRunOptions): Promise<ExecutionResult> {
    const startTime = Date.now();

    // 1. Resolve agent
    const { agent, skills } = this.resolver.resolveWithDependencies(options.agent);

    // 2. Determine permissions and enforce
    // Agent execution inherits permissions from its definition and its skills
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

    const provider = modelId.split('/')[0]!;
    const apiKey = getApiKey(provider) ?? '';
    if (!apiKey && provider !== 'ollama') {
      throw new ExecutionError(
        `No API key configured for "${provider}".`,
        'AUTH_ERROR',
      );
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

    // 4. MCP Servers attachment (Placeholder for now)
    if (agent.mcp_servers.length > 0) {
      console.log(`Agent declared MCP servers: ${agent.mcp_servers.map((s) => s.name).join(', ')}`);
      // TODO: initialize MCP clients and inject their tools into the prompt/adapter
    }

    // 5. Execute with the agent context (simplified without stateful session history for now)
    // We mock building a skill request to reuse the adapter layer
    const pseudoSkill = {
      name: agent.name,
      version: agent.version,
      description: agent.description,
      author: agent.author,
      license: agent.license,
      instructions: {
        system: `You are an agent named ${agent.name}.\n${agent.description}`,
        user_template: '{{input}}',
        output_format: 'text' as const,
      },
      tags: [],
      category: 'other' as const,
      examples: [{ input: 'test', expected_output: 'test', model: 'test' }],
      permissions: Array.from(combinedPermissions),
      compatibility: { models: [] },
      config: { temperature: 0.7, max_tokens: 4000, timeout_seconds: 60 }
    };

    const request = adapter.buildRequest(pseudoSkill, input, runtimeConfig);

    const rawResponse = await this.callWithRetry(request, runtimeConfig.timeoutSeconds ?? 60);

    const result = adapter.parseResponse(rawResponse);
    result.duration_ms = Date.now() - startTime;

    return result;
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
