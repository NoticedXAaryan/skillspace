import { describe, it, expect } from 'vitest';
import { validateSkill, validateSkillYaml } from '../src/index.js';

// ---------------------------------------------------------------------------
// Valid skill fixture
// ---------------------------------------------------------------------------
const validSkill = {
  name: 'security-review',
  version: '2.1.0',
  description: 'Analyze code for security vulnerabilities',
  author: 'skillspace',
  license: 'MIT',
  instructions: {
    system: 'You are a security reviewer. Analyze the provided code for vulnerabilities.',
    user_template: 'Review the following code:\n<code>{{input}}</code>',
    output_format: 'json' as const,
  },
  tags: ['security', 'code-review'],
  category: 'security' as const,
  examples: [
    {
      input: 'function login(user, pass) { return db.query("SELECT * FROM users WHERE name=\'" + user + "\'"); }',
      expected_output: { vulnerabilities: ['SQL Injection'] },
      model: 'ollama/llama3.2',
    },
  ],
  permissions: ['filesystem.read' as const],
  config: {
    temperature: 0.3,
    max_tokens: 4000,
    timeout_seconds: 30,
  },
};

const validSkillYaml = `
name: security-review
version: "2.1.0"
description: Analyze code for security vulnerabilities
author: skillspace
license: MIT
instructions:
  system: You are a security reviewer.
  user_template: "Review: {{input}}"
  output_format: text
tags:
  - security
category: security
permissions:
  - filesystem.read
`;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SkillSchema', () => {
  it('validates a correct skill object', () => {
    const result = validateSkill(validSkill);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('security-review');
      expect(result.data.version).toBe('2.1.0');
    }
  });

  it('applies defaults for optional fields', () => {
    const minimal = {
      name: 'minimal-skill',
      version: '1.0.0',
      description: 'A minimal skill',
      author: 'test',
      license: 'MIT',
      instructions: {
        system: 'You are helpful.',
        user_template: 'Do this: {{input}}',
      },
    };
    const result = validateSkill(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.permissions).toEqual([]);
      expect(result.data.tags).toEqual([]);
      expect(result.data.category).toBe('other');
      expect(result.data.config.temperature).toBe(0.3);
      expect(result.data.config.max_tokens).toBe(4000);
    }
  });

  it('rejects missing required fields', () => {
    const result = validateSkill({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.issues.length).toBeGreaterThan(0);
    }
  });

  it('rejects non-kebab-case name', () => {
    const result = validateSkill({ ...validSkill, name: 'MySkill' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.errors.issues.find((i) => i.path.includes('name'));
      expect(nameIssue).toBeDefined();
    }
  });

  it('rejects invalid semver version', () => {
    const result = validateSkill({ ...validSkill, version: '1.0' });
    expect(result.success).toBe(false);
  });

  it('rejects user_template without {{input}} placeholder', () => {
    const result = validateSkill({
      ...validSkill,
      instructions: {
        ...validSkill.instructions,
        user_template: 'No placeholder here',
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid permission strings', () => {
    const result = validateSkill({
      ...validSkill,
      permissions: ['filesystem.read', 'invalid.permission'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 10 tags', () => {
    const tooManyTags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    const result = validateSkill({ ...validSkill, tags: tooManyTags });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = validateSkill({ ...validSkill, category: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('validateSkillYaml', () => {
  it('validates a correct YAML string', () => {
    const result = validateSkillYaml(validSkillYaml);
    expect(result.success).toBe(true);
  });

  it('returns errors for invalid YAML', () => {
    const result = validateSkillYaml('invalid: yaml: : {{{');
    expect(result.success).toBe(false);
  });

  it('returns errors for valid YAML with invalid schema', () => {
    const result = validateSkillYaml('name: 123\nversion: bad');
    expect(result.success).toBe(false);
  });
});
