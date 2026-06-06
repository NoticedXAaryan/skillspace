import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import YAML from 'yaml';
import { Executor, ExecutionError } from '../src/executor.js';
import { SkillResolver } from '../src/resolver.js';
import { SkillCache } from '../src/cache.js';

describe('Executor', () => {
  let tempDir: string;
  let cache: SkillCache;
  let resolver: SkillResolver;
  let executor: Executor;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillspace-executor-test-'));
    cache = new SkillCache(tempDir);
    resolver = new SkillResolver(cache);
    executor = new Executor(resolver);

    const skillYaml = YAML.stringify({
      name: 'test-skill',
      version: '1.0.0',
      description: 'A test skill',
      author: 'tester',
      license: 'MIT',
      instructions: {
        system: 'System prompt',
        user_template: '{{input}}',
        output_format: 'text',
      },
      tags: ['test'],
      category: 'other',
      permissions: ['filesystem.write', 'filesystem.read'],
      config: {
        temperature: 0.5,
        max_tokens: 1000,
        timeout_seconds: 5,
      }
    });

    const files = new Map<string, Buffer>();
    files.set('skill.yaml', Buffer.from(skillYaml));
    await cache.installPackage('test-skill', '1.0.0', files);
    
    // Mock config load to provide dummy API keys
    vi.mock('../src/config.js', async (importOriginal) => {
      const actual = await importOriginal<typeof import('../src/config.js')>();
      return {
        ...actual,
        loadConfig: vi.fn(() => ({ default_model: 'openai/gpt-4o' })),
        getApiKey: vi.fn(() => 'dummy-api-key'),
        getBaseUrl: vi.fn(() => undefined),
      };
    });

    // Mock global fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('executes a skill successfully', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Mocked response' } }]
      })
    });

    const result = await executor.run({
      skill: 'test-skill',
      input: 'Hello world',
      model: 'openai/gpt-4o'
    });

    expect(result.output).toBe('Mocked response');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchArgs = (global.fetch as Mock).mock.calls[0];
    expect(fetchArgs[0]).toContain('api.openai.com');
  });

  it('enforces input permissions for files', async () => {
    // Write a dummy file to read
    const inputFile = path.join(tempDir, 'input.txt');
    fs.writeFileSync(inputFile, 'File content');

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Mocked file response' } }]
      })
    });

    const result = await executor.run({
      skill: 'test-skill',
      input: inputFile,
      model: 'openai/gpt-4o'
    });

    expect(result.output).toBe('Mocked file response');
    // Ensure the content of the file was actually sent in the request
    const fetchArgs = (global.fetch as Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchArgs[1].body);
    const messages = requestBody.messages;
    expect(messages.some((m: any) => m.content.includes('File content'))).toBe(true);
  });

  it('throws ExecutionError when API is unauthorized', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized'
    });

    await expect(executor.run({
      skill: 'test-skill',
      input: 'Hello',
      model: 'openai/gpt-4o'
    })).rejects.toThrowError(/Invalid API key/);
  });

  it('retries on 429 rate limit', async () => {
    // Return 429 twice, then succeed
    (global.fetch as Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit'
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit'
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Success after retry' } }]
        })
      });

    // We should speed up the sleep for tests
    vi.spyOn(executor as any, 'sleep').mockResolvedValue(undefined);

    const result = await executor.run({
      skill: 'test-skill',
      input: 'Hello',
      model: 'openai/gpt-4o'
    });

    expect(result.output).toBe('Success after retry');
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('throws ExecutionError on max retries', async () => {
    (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Server error'
      });

    vi.spyOn(executor as any, 'sleep').mockResolvedValue(undefined);

    await expect(executor.run({
      skill: 'test-skill',
      input: 'Hello',
      model: 'openai/gpt-4o'
    })).rejects.toThrowError(/Failed after/);
    
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
