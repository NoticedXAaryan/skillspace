import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentExecutor } from '../src/agent-executor.js';
import { AgentResolver } from '../src/agent-resolver.js';
import { SessionManager } from '../src/session.js';
import { adapterRegistry } from '../src/adapters/registry.js';
import type { ModelAdapter, RuntimeConfig } from '../src/adapters/base.js';
import type { Agent, Skill, ChatMessage, ExecutionResult } from '@skillspace/schema';
import * as config from '../src/config.js';

vi.mock('../src/config.js', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../src/config.js')>();
  return {
    ...mod,
    getApiKey: vi.fn().mockReturnValue('mock-api-key'),
    loadConfig: vi.fn().mockReturnValue({ default_model: 'mock/model' }),
  };
});

describe('AgentExecutor', () => {
  let mockResolver: AgentResolver;
  let mockSessionManager: SessionManager;
  let executor: AgentExecutor;
  let mockAdapter: ModelAdapter;

  beforeEach(() => {
    mockResolver = {
      resolveWithDependencies: vi.fn().mockReturnValue({
        agent: {
          name: 'test-agent',
          version: '1.0.0',
          description: 'A mock agent',
          author: 'tester',
          license: 'MIT',
          model: { id: 'mock/model' },
          skills: [{ name: 'test-skill', version: '1.0.0' }],
          tools: [],
          mcp_servers: [],
          permissions: [],
          memory: { type: 'session' },
          workflows: []
        } as Agent,
        skills: [{
          name: 'test-skill',
          version: '1.0.0',
          description: 'Test skill',
          author: 'tester',
          license: 'MIT',
          instructions: { system: 'sys', user_template: '{{input}}', output_format: 'text' },
          tags: [],
          category: 'other',
          permissions: [],
          compatibility: { models: [] },
          config: { temperature: 0, max_tokens: 100, timeout_seconds: 10 }
        } as Skill]
      }),
      resolve: vi.fn(),
    } as unknown as AgentResolver;

    mockSessionManager = {
      loadSession: vi.fn().mockReturnValue([]),
      saveSession: vi.fn(),
      deleteSession: vi.fn(),
    } as unknown as SessionManager;

    mockAdapter = {
      providerId: 'mock',
      providerName: 'Mock',
      supportsStreaming: false,
      buildRequest: vi.fn(),
      buildChatRequest: vi.fn().mockReturnValue({ url: 'mock', headers: {}, body: {} }),
      parseResponse: vi.fn().mockReturnValue({
        output: 'Mock Response',
        message: { role: 'assistant', content: 'Mock Response' },
        usage: { promptTokens: 0, completionTokens: 0 },
        model: 'mock/model',
        duration_ms: 0,
        status: 'success'
      } as ExecutionResult),
    };

    adapterRegistry.register(mockAdapter);

    // Mock fetch for the executor callWithRetry
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
      text: vi.fn()
    });

    executor = new AgentExecutor(mockResolver, mockSessionManager);
  });

  it('loads and saves session if session_id is provided', async () => {
    const res = await executor.run({
      agent: 'test-agent',
      input: 'hello',
      session_id: 'session-123'
    });

    expect(mockSessionManager.loadSession).toHaveBeenCalledWith('session-123');
    expect(mockSessionManager.saveSession).toHaveBeenCalledWith('session-123', expect.any(Array));
    expect(res.output).toBe('Mock Response');
  });

  it('adds system and user messages correctly for new sessions', async () => {
    await executor.run({
      agent: 'test-agent',
      input: 'hello',
    });

    expect(mockAdapter.buildChatRequest).toHaveBeenCalledWith(
      [
        { role: 'system', content: expect.stringContaining('test-agent') },
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'Mock Response' }
      ],
      expect.any(Array),
      expect.any(Object)
    );
  });

  it('maps skills to tools for the adapter', async () => {
    await executor.run({
      agent: 'test-agent',
      input: 'hello',
    });

    expect(mockAdapter.buildChatRequest).toHaveBeenCalledWith(
      expect.any(Array),
      [
        expect.objectContaining({
          name: 'test-skill',
          description: 'Test skill',
          required: ['input']
        })
      ],
      expect.any(Object)
    );
  });
});
