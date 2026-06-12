import type { ModelRequest, ExecutionResult } from '@skillspace/schema';
import type { ModelAdapter, RuntimeConfig } from './base.js';

/**
 * Ollama adapter.
 * Maps skill instructions to the Ollama /api/chat format.
 * https://github.com/ollama/ollama/blob/main/docs/api.md
 *
 * This is the default adapter for local development/testing.
 */
export class OllamaAdapter implements ModelAdapter {
  readonly providerId = 'ollama';
  readonly providerName = 'Ollama (Local)';
  readonly supportsStreaming = true;

  buildRequest(skill: any, input: string, config: RuntimeConfig): ModelRequest {
    const systemPrompt = skill.persona?.system_prompt ?? skill.instructions?.system ?? '';
    const userTemplate = skill.instructions?.user_template ?? '{{input}}';
    const userMessage = userTemplate.replace('{{input}}', input);

    return {
      url: `${config.baseUrl || 'http://localhost:11434'}/api/chat`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        model: config.modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        stream: false,
        options: {
          temperature: config.temperature ?? skill.config?.temperature ?? 0.3,
          num_predict: config.maxTokens ?? skill.config?.max_tokens ?? 4000,
        },
      },
      stream: false,
    };
  }

  buildChatRequest(
    messages: import('@skillspace/schema').ChatMessage[],
    _tools: import('@skillspace/schema').Tool[],
    config: RuntimeConfig,
  ): ModelRequest {
    // Basic implementation for testing mock
    return {
      url: `${config.baseUrl || 'http://localhost:11434'}/api/chat`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        model: config.modelId,
        messages,
        stream: false,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens,
        },
      },
      stream: false,
    };
  }

  parseResponse(raw: unknown): ExecutionResult {
    const response = raw as {
      message: { role: string; content: string };
      model: string;
      eval_count?: number;
      prompt_eval_count?: number;
    };

    return {
      output: response.message?.content ?? '',
      message: response.message as any,
      usage: {
        promptTokens: response.prompt_eval_count ?? 0,
        completionTokens: response.eval_count ?? 0,
      },
      model: response.model,
      duration_ms: 0,
      status: 'success',
    };
  }

  parseStreamChunk(chunk: string): string | null {
    // Ollama streams JSON objects, one per line
    try {
      const parsed = JSON.parse(chunk);
      if (parsed.done) return null;
      return parsed.message?.content ?? null;
    } catch {
      return null;
    }
  }
}
