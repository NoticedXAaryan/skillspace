import { describe, expect, it, vi } from 'vitest';
import { defineSkill, SkillSpaceClient, validateSkill } from '../src/index.js';

const persona = {
  system_prompt: 'You review code changes and explain concrete risks.',
  tone: 'Direct and practical',
  behavioral_guidelines: ['Prioritize correctness issues.', 'Avoid unrelated refactors.'],
  capabilities: ['read:files'],
};

describe('defineSkill', () => {
  it('creates a schemaVersion 2 skill', () => {
    const skill = defineSkill({
      name: '@skillspace/code-reviewer',
      version: '1.0.0',
      description: 'Reviews code changes for bugs and regressions.',
      tags: ['review', 'code'],
      persona,
    });

    expect(skill.schemaVersion).toBe(2);
    expect(skill.license).toBe('MIT');
    expect(skill.persona.system_prompt).toContain('review code');
  });

  it('rejects legacy unscoped package names', () => {
    expect(() =>
      defineSkill({
        name: 'code-reviewer',
        version: '1.0.0',
        persona,
      }),
    ).toThrow();
  });
});

describe('validateSkill', () => {
  it('parses existing v2 skill definitions', () => {
    const skill = validateSkill({
      schemaVersion: 2,
      name: '@skillspace/sql-optimizer',
      version: '1.2.3',
      persona,
    });

    expect(skill.name).toBe('@skillspace/sql-optimizer');
  });
});

describe('SkillSpaceClient', () => {
  it('reads package search results from the public API envelope', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            id: 'pkg_1',
            name: '@skillspace/code-reviewer',
            description: 'Reviews code',
            owner: 'skillspace',
            latestVersion: '1.0.0',
            downloads: 10,
            createdAt: '2026-06-17T00:00:00.000Z',
            tags: ['review'],
          },
        ],
      }),
    });

    const client = new SkillSpaceClient({
      baseUrl: 'https://registry.example.test/api/v1/',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(client.packages.search('review', 5)).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith('https://registry.example.test/api/v1/packages?q=review&limit=5');
  });
});
