import type { Skill, ModelRequest, ExecutionResult } from '@skillspace/schema';
import type { ModelAdapter, RuntimeConfig } from './base.js';

/**
 * Anthropic Claude adapter.
 * Maps skill instructions to the Anthropic Messages API format.
 * https://docs.anthropic.com/en/api/messages
 */
export class ClaudeAdapter implements ModelAdapter {
  readonly providerId = 'anthropic';
  readonly providerName = 'Anthropic Claude';
  readonly supportsStreaming = true;

  buildRequest(skill: Skill, input: string, config: RuntimeConfig): ModelRequest {
    const userMessage = skill.instructions.user_template.replace('{{input}}', input);

    return {
      url: config.baseUrl || 'https://api.anthropic.com/v1/messages',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: {
        model: config.modelId,
        max_tokens: config.maxTokens ?? skill.config.max_tokens,
        temperature: config.temperature ?? skill.config.temperature,
        system: skill.instructions.system,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      },
      stream: false,
    };
  }

  parseResponse(raw: unknown): ExecutionResult {
    const response = raw as {
      content: Array<{ type: string; text: string }>;
      usage: { input_tokens: number; output_tokens: number };
      model: string;
    };

    const textContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return {
      output: textContent,
      usage: {
        promptTokens: response.usage?.input_tokens ?? 0,
        completionTokens: response.usage?.output_tokens ?? 0,
      },
      model: response.model,
      duration_ms: 0, // set by executor
      status: 'success',
    };
  }

  parseStreamChunk(chunk: string): string | null {
    // Anthropic SSE format: event: content_block_delta, data: { delta: { text: "..." } }
    if (!chunk.startsWith('data: ')) return null;
    const data = chunk.slice(6);
    if (data === '[DONE]') return null;
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
        return parsed.delta.text;
      }
      return null;
    } catch {
      return null;
    }
  }
}
