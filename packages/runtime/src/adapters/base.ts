import type { Skill, ModelRequest, ExecutionResult } from '@skillspace/schema';

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
    skill: Skill,
    input: string,
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
