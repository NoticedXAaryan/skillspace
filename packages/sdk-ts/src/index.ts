// @skillspace/sdk-ts — TypeScript SDK for building SkillSpace skills
//
// This package will provide helper functions for skill authors:
// - defineSkill()   — type-safe skill definition builder
// - testSkill()     — local test runner
// - createAdapter() — custom model adapter creation
//
// Phase 2 deliverable — placeholder for now.

export function defineSkill(config: {
  name: string;
  version: string;
  description: string;
  system: string;
  userTemplate: string;
  outputFormat?: 'text' | 'json' | 'markdown' | 'code';
  permissions?: string[];
  tags?: string[];
  category?: string;
}) {
  return {
    ...config,
    author: 'unknown',
    license: 'MIT',
    instructions: {
      system: config.system,
      user_template: config.userTemplate,
      output_format: config.outputFormat || 'text',
    },
    config: {
      temperature: 0.3,
      max_tokens: 4000,
      timeout_seconds: 30,
    },
  };
}

export function testSkill(_skill: ReturnType<typeof defineSkill>, _input: string) {
  // Phase 2: will run the skill locally against Ollama
  throw new Error('testSkill() is not yet implemented. Coming in Phase 2.');
}
