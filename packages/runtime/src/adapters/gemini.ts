import type { ModelRequest, ExecutionResult } from '@skillspace/schema';
import type { ModelAdapter, RuntimeConfig } from './base.js';

/**
 * Google Gemini adapter.
 * Maps skill instructions to the Gemini API format.
 * https://ai.google.dev/api/generate-content
 */
export class GeminiAdapter implements ModelAdapter {
  readonly providerId = 'gemini';
  readonly providerName = 'Google Gemini';
  readonly supportsStreaming = true;

  buildRequest(skill: any, input: string, config: RuntimeConfig): ModelRequest {
    const systemPrompt = skill.persona?.system_prompt ?? skill.instructions?.system ?? '';
    const userTemplate = skill.instructions?.user_template ?? '{{input}}';
    const userMessage = userTemplate.replace('{{input}}', input);
    const modelId = config.modelId;
    const baseUrl =
      config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';

    return {
      url: `${baseUrl}/models/${modelId}:generateContent`,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.apiKey,
      },
      body: {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          temperature: config.temperature ?? skill.config.temperature,
          maxOutputTokens: config.maxTokens ?? skill.config.max_tokens,
        },
      },
      stream: false,
    };
  }

  parseResponse(raw: unknown): ExecutionResult {
    const response = raw as {
      candidates: Array<{
        content: { parts: Array<{ text: string }> };
      }>;
      usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
      };
      modelVersion?: string;
    };

    const text =
      response.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .join('') ?? '';

    return {
      output: text,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
      model: response.modelVersion ?? 'gemini',
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
      return parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch {
      return null;
    }
  }
}
