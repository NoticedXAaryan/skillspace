import type { ModelAdapter } from './base.js';
import { ClaudeAdapter } from './claude.js';
import { OpenAIAdapter } from './openai.js';
import { GeminiAdapter } from './gemini.js';
import { OllamaAdapter } from './ollama.js';

// ---------------------------------------------------------------------------
// Adapter Registry
// ---------------------------------------------------------------------------

/**
 * Maps model ID strings (e.g. "anthropic/claude-3-5-sonnet", "ollama/llama3.2")
 * to the correct ModelAdapter instance.
 *
 * Model ID format: "<provider>/<model-name>" or just "<provider>" for default.
 */
export class AdapterRegistry {
  private adapters: Map<string, ModelAdapter> = new Map();

  constructor() {
    this.register(new ClaudeAdapter());
    this.register(new OpenAIAdapter());
    this.register(new GeminiAdapter());
    this.register(new OllamaAdapter());
  }

  /**
   * Register a new adapter.
   */
  register(adapter: ModelAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  /**
   * Resolve the correct adapter from a model ID string.
   *
   * Accepts formats:
   *   - "anthropic/claude-3-5-sonnet" → AnthropicAdapter
   *   - "openai/gpt-4o" → OpenAIAdapter
   *   - "ollama/llama3.2" → OllamaAdapter
   *   - "gemini/gemini-2.0-flash" → GeminiAdapter
   *   - "ollama" → OllamaAdapter (default model for provider)
   *
   * Returns [adapter, modelName].
   */
  getAdapter(modelId: string): { adapter: ModelAdapter; modelName: string } {
    const parts = modelId.split('/');
    const providerId = parts[0]!;
    const modelName = parts.slice(1).join('/') || this.getDefaultModel(providerId);

    const adapter = this.adapters.get(providerId);
    if (!adapter) {
      const available = Array.from(this.adapters.keys()).join(', ');
      throw new Error(
        `Unknown model provider "${providerId}". Available providers: ${available}`,
      );
    }

    return { adapter, modelName };
  }

  /**
   * List all registered provider IDs.
   */
  listProviders(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Check if a provider is registered.
   */
  hasProvider(providerId: string): boolean {
    return this.adapters.has(providerId);
  }

  private getDefaultModel(providerId: string): string {
    const defaults: Record<string, string> = {
      anthropic: 'claude-3-5-sonnet-20241022',
      openai: 'gpt-4o',
      gemini: 'gemini-2.0-flash',
      ollama: 'llama3.2',
    };
    return defaults[providerId] ?? providerId;
  }
}

// Singleton instance
export const adapterRegistry = new AdapterRegistry();
