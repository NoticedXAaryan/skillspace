import { describe, it, expect } from 'vitest';
import { adapterRegistry, OllamaAdapter, OpenAIAdapter, ClaudeAdapter, GeminiAdapter } from '../src/index.js';
import type { Skill } from '@skillspace/schema';

// ---------------------------------------------------------------------------
// Fixture skill
// ---------------------------------------------------------------------------
const testSkill: Skill = {
  name: 'test-skill',
  version: '1.0.0',
  description: 'A test skill',
  author: 'test',
  license: 'MIT',
  instructions: {
    system: 'You are a helpful assistant.',
    user_template: 'Answer this: {{input}}',
    output_format: 'text',
  },
  tags: [],
  category: 'other',
  examples: [],
  permissions: [],
  config: {
    temperature: 0.5,
    max_tokens: 2000,
    timeout_seconds: 30,
  },
};

describe('AdapterRegistry', () => {
  it('resolves ollama adapter from model ID', () => {
    const { adapter, modelName } = adapterRegistry.getAdapter('ollama/llama3.2');
    expect(adapter).toBeInstanceOf(OllamaAdapter);
    expect(modelName).toBe('llama3.2');
  });

  it('resolves openai adapter', () => {
    const { adapter, modelName } = adapterRegistry.getAdapter('openai/gpt-4o');
    expect(adapter).toBeInstanceOf(OpenAIAdapter);
    expect(modelName).toBe('gpt-4o');
  });

  it('resolves anthropic adapter', () => {
    const { adapter, modelName } = adapterRegistry.getAdapter('anthropic/claude-3-5-sonnet');
    expect(adapter).toBeInstanceOf(ClaudeAdapter);
    expect(modelName).toBe('claude-3-5-sonnet');
  });

  it('resolves gemini adapter', () => {
    const { adapter, modelName } = adapterRegistry.getAdapter('gemini/gemini-2.0-flash');
    expect(adapter).toBeInstanceOf(GeminiAdapter);
    expect(modelName).toBe('gemini-2.0-flash');
  });

  it('uses default model when only provider given', () => {
    const { adapter, modelName } = adapterRegistry.getAdapter('ollama');
    expect(adapter).toBeInstanceOf(OllamaAdapter);
    expect(modelName).toBe('llama3.2');
  });

  it('throws for unknown provider', () => {
    expect(() => adapterRegistry.getAdapter('unknown/model')).toThrow('Unknown model provider');
  });

  it('lists all providers', () => {
    const providers = adapterRegistry.listProviders();
    expect(providers).toContain('openai');
    expect(providers).toContain('anthropic');
    expect(providers).toContain('ollama');
    expect(providers).toContain('gemini');
  });
});

describe('OllamaAdapter', () => {
  const adapter = new OllamaAdapter();

  it('builds correct request payload', () => {
    const request = adapter.buildRequest(testSkill, 'What is 2+2?', {
      apiKey: '',
      modelId: 'llama3.2',
    });

    expect(request.url).toBe('http://localhost:11434/api/chat');
    expect(request.headers['Content-Type']).toBe('application/json');

    const body = request.body as Record<string, unknown>;
    expect(body.model).toBe('llama3.2');

    const messages = body.messages as Array<{ role: string; content: string }>;
    expect(messages[0]!.role).toBe('system');
    expect(messages[0]!.content).toBe('You are a helpful assistant.');
    expect(messages[1]!.role).toBe('user');
    expect(messages[1]!.content).toContain('What is 2+2?');
  });

  it('replaces {{input}} in user template', () => {
    const request = adapter.buildRequest(testSkill, 'test input here', {
      apiKey: '',
      modelId: 'llama3.2',
    });
    const body = request.body as Record<string, unknown>;
    const messages = body.messages as Array<{ role: string; content: string }>;
    expect(messages[1]!.content).toBe('Answer this: test input here');
  });

  it('parses response correctly', () => {
    const raw = {
      message: { role: 'assistant', content: 'The answer is 4.' },
      model: 'llama3.2',
      eval_count: 10,
      prompt_eval_count: 20,
    };
    const result = adapter.parseResponse(raw);
    expect(result.output).toBe('The answer is 4.');
    expect(result.model).toBe('llama3.2');
    expect(result.usage.promptTokens).toBe(20);
    expect(result.usage.completionTokens).toBe(10);
    expect(result.status).toBe('success');
  });
});

describe('OpenAIAdapter', () => {
  const adapter = new OpenAIAdapter();

  it('builds correct request payload', () => {
    const request = adapter.buildRequest(testSkill, 'Hello', {
      apiKey: 'sk-test',
      modelId: 'gpt-4o',
    });

    expect(request.url).toBe('https://api.openai.com/v1/chat/completions');
    expect(request.headers['Authorization']).toBe('Bearer sk-test');

    const body = request.body as Record<string, unknown>;
    expect(body.model).toBe('gpt-4o');

    const messages = body.messages as Array<{ role: string; content: string }>;
    expect(messages[0]!.role).toBe('system');
    expect(messages[1]!.role).toBe('user');
  });

  it('parses response correctly', () => {
    const raw = {
      choices: [{ message: { content: 'Hello back!' } }],
      usage: { prompt_tokens: 15, completion_tokens: 5 },
      model: 'gpt-4o-2024-08-06',
    };
    const result = adapter.parseResponse(raw);
    expect(result.output).toBe('Hello back!');
    expect(result.model).toBe('gpt-4o-2024-08-06');
  });
});

describe('ClaudeAdapter', () => {
  const adapter = new ClaudeAdapter();

  it('builds correct request payload', () => {
    const request = adapter.buildRequest(testSkill, 'Hi', {
      apiKey: 'sk-ant-test',
      modelId: 'claude-3-5-sonnet-20241022',
    });

    expect(request.url).toBe('https://api.anthropic.com/v1/messages');
    expect(request.headers['x-api-key']).toBe('sk-ant-test');
    expect(request.headers['anthropic-version']).toBe('2023-06-01');

    const body = request.body as Record<string, unknown>;
    expect(body.model).toBe('claude-3-5-sonnet-20241022');
    expect(body.system).toBe('You are a helpful assistant.');
  });
});
