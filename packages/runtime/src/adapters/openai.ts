import type { ModelRequest, ExecutionResult } from '@skillspace/schema';
import type { ModelAdapter, RuntimeConfig } from './base.js';

/**
 * OpenAI adapter.
 * Maps skill instructions to the OpenAI Chat Completions API format.
 * https://platform.openai.com/docs/api-reference/chat/create
 */
export class OpenAIAdapter implements ModelAdapter {
  readonly providerId = 'openai';
  readonly providerName = 'OpenAI';
  readonly supportsStreaming = true;

  buildRequest(skill: any, input: string, config: RuntimeConfig): ModelRequest {
    const userMessage = skill.instructions.user_template.replace('{{input}}', input);

    return {
      url: config.baseUrl || 'https://api.openai.com/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: config.modelId,
        max_tokens: config.maxTokens ?? skill.config.max_tokens,
        temperature: config.temperature ?? skill.config.temperature,
        messages: [
          { role: 'system', content: skill.instructions.system },
          { role: 'user', content: userMessage },
        ],
      },
      stream: false,
    };
  }

  buildChatRequest(
    messages: import('@skillspace/schema').ChatMessage[],
    tools: import('@skillspace/schema').Tool[],
    config: RuntimeConfig,
  ): ModelRequest {
    return {
      url: config.baseUrl || 'https://api.openai.com/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: config.modelId,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: messages,
        tools: tools.length > 0 ? tools.map(t => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: {
              type: 'object',
              properties: t.parameters || {},
              required: t.required || []
            }
          }
        })) : undefined
      },
      stream: false,
    };
  }

  parseResponse(raw: unknown): ExecutionResult {
    const response = raw as {
      choices: Array<{ message: { role: string; content: string | null; tool_calls?: import('@skillspace/schema').ToolCall[] } }>;
      usage: { prompt_tokens: number; completion_tokens: number };
      model: string;
    };

    const msg = response.choices[0]?.message;

    return {
      output: msg?.content ?? '',
      message: msg && msg.role === 'assistant' ? {
        role: 'assistant',
        content: msg.content,
        tool_calls: msg.tool_calls
      } : undefined,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
      },
      model: response.model,
      duration_ms: 0,
      status: 'success',
    };
  }

  parseStreamChunk(chunk: string): string | null {
    if (!chunk.startsWith('data: ')) return null;
    const data = chunk.slice(6);
    if (data === '[DONE]') return null;
    try {
      const parsed = JSON.parse(data);
      return parsed.choices?.[0]?.delta?.content ?? null;
    } catch {
      return null;
    }
  }
}
