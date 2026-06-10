import type { ModelRequest, ExecutionResult } from '@skillspace/schema';
// NOTE: buildRequest() accepts a v1 Skill shape (with instructions, config).
// The v2 schema has a different Skill shape. The type is `any` here for compat.

// ---------------------------------------------------------------------------
// Model Adapter Interface
// ---------------------------------------------------------------------------

/**
 * A ModelAdapter transforms a model-agnostic skill definition into
 * a model-specific API request and parses the model's response back
 * into a generic ExecutionResult.
 */
export interface ModelAdapter {
  /** Provider identifier, e.g. 'openai', 'anthropic', 'ollama', 'gemini' */
  readonly providerId: string;

  /** Human-friendly provider name */
  readonly providerName: string;

  /** Whether this adapter supports streaming responses */
  readonly supportsStreaming: boolean;

  /**
   * Build a model-specific API request from skill instructions and user input.
   */
  buildRequest(
    skill: any,
    input: string,
    config: RuntimeConfig,
  ): ModelRequest;

  /**
   * Build a model-specific API request from chat history and available tools.
   */
  buildChatRequest?(
    messages: import('@skillspace/schema').ChatMessage[],
    tools: import('@skillspace/schema').Tool[],
    config: RuntimeConfig,
  ): ModelRequest;

  /**
   * Parse the raw model response into a generic ExecutionResult.
   */
  parseResponse(raw: unknown): ExecutionResult;

  /**
   * Parse a single streaming chunk into text content.
   */
  parseStreamChunk?(chunk: string): string | null;
}

/**
 * Runtime configuration for executing a skill.
 */
export interface RuntimeConfig {
  apiKey: string;
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  timeoutSeconds?: number;
  baseUrl?: string;
}
