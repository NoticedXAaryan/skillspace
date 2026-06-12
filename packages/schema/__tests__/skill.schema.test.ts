import { describe, it, expect } from 'vitest';
import { validateSkill, validateSkillYaml } from '../src/index.js';

const validSkill = {
  schemaVersion: 2 as const,
  name: '@skillspace/security-review',
  version: '2.1.0',
  description: 'Analyze code for security vulnerabilities',
  author: 'skillspace',
  license: 'MIT',
  tags: ['security', 'code-review'],
  persona: {
    system_prompt: 'You are a security reviewer. Analyze the provided code for vulnerabilities and output findings as structured JSON.',
    tone: 'Professional and precise',
    behavioral_guidelines: [
      'Always output findings in JSON format',
      'Rate each finding by severity: critical, high, medium, low',
    ],
    preferred_model: 'anthropic/claude-sonnet-4-6',
    capabilities: ['read:files'],
  },
};

const validSkillYaml = `
schemaVersion: 2
name: "@skillspace/security-review"
version: "2.1.0"
description: Analyze code for security vulnerabilities
author: skillspace
license: MIT
tags:
  - security
persona:
  system_prompt: "You are a security reviewer. Analyze code for vulnerabilities."
  tone: "Professional"
  behavioral_guidelines:
    - "Output findings as JSON"
  capabilities:
    - "read:files"
`;

describe('SkillSchema', () => {
  it('validates a correct skill object', () => {
    const result = validateSkill(validSkill);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('@skillspace/security-review');
      expect(result.data.version).toBe('2.1.0');
      expect(result.data.schemaVersion).toBe(2);
    }
  });

  it('applies defaults for optional fields', () => {
    const minimal = {
      schemaVersion: 2 as const,
      name: '@test/minimal-skill',
      version: '1.0.0',
      persona: {
        system_prompt: 'You are a helpful assistant.',
      },
    };
    const result = validateSkill(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.license).toBe('MIT');
      expect(result.data.persona.behavioral_guidelines).toEqual([]);
      expect(result.data.persona.capabilities).toEqual([]);
    }
  });

  it('rejects missing required fields', () => {
    const result = validateSkill({});
    expect(result.success).toBe(false);
  });

  it('rejects non-scoped name', () => {
    const result = validateSkill({ ...validSkill, name: 'security-review' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid semver version', () => {
    const result = validateSkill({ ...validSkill, version: '1.0' });
    expect(result.success).toBe(false);
  });

  it('rejects missing persona', () => {
    const result = validateSkill({
      schemaVersion: 2,
      name: '@test/skill',
      version: '1.0.0',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty persona system_prompt', () => {
    const result = validateSkill({
      ...validSkill,
      persona: { ...validSkill.persona, system_prompt: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid schemaVersion', () => {
    const result = validateSkill({ ...validSkill, schemaVersion: 1 });
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
