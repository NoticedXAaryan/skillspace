import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import YAML from 'yaml';
import { SkillCache } from '../src/cache.js';
import { SkillResolver, SkillNotFoundError, VersionNotFoundError } from '../src/resolver.js';

describe('SkillResolver', () => {
  let tempDir: string;
  let cache: SkillCache;
  let resolver: SkillResolver;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillspace-resolver-test-'));
    cache = new SkillCache(tempDir);
    resolver = new SkillResolver(cache);

    // Setup some test skills
    const versions = ['1.0.0', '1.0.1', '1.1.0', '2.0.0'];
    
    for (const version of versions) {
      const skillYaml = YAML.stringify({
        name: 'test-skill',
        version: version,
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
        permissions: [],
      });
      const files = new Map<string, Buffer>();
      files.set('skill.yaml', Buffer.from(skillYaml));
      await cache.installPackage('test-skill', version, files);
    }
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('resolves exact versions', () => {
    const skill = resolver.resolve('test-skill', '1.0.1');
    expect(skill.version).toBe('1.0.1');
  });

  it('resolves ^ range to highest minor/patch', () => {
    const skill = resolver.resolve('test-skill', '^1.0.0');
    // Highest 1.x.x is 1.1.0
    expect(skill.version).toBe('1.1.0');
  });

  it('resolves ~ range to highest patch', () => {
    const skill = resolver.resolve('test-skill', '~1.0.0');
    // Highest 1.0.x is 1.0.1
    expect(skill.version).toBe('1.0.1');
  });

  it('resolves latest if no range is provided', () => {
    const skill = resolver.resolve('test-skill');
    expect(skill.version).toBe('2.0.0');
  });

  it('resolves latest if * is provided', () => {
    const skill = resolver.resolve('test-skill', '*');
    expect(skill.version).toBe('2.0.0');
  });

  it('resolves latest if "latest" is provided', () => {
    const skill = resolver.resolve('test-skill', 'latest');
    expect(skill.version).toBe('2.0.0');
  });

  it('throws SkillNotFoundError if skill is completely missing', () => {
    expect(() => resolver.resolve('missing-skill')).toThrow(SkillNotFoundError);
    expect(() => resolver.resolve('missing-skill')).toThrow(/missing-skill/);
  });

  it('throws VersionNotFoundError if range cannot be satisfied', () => {
    expect(() => resolver.resolve('test-skill', '^3.0.0')).toThrow(VersionNotFoundError);
    expect(() => resolver.resolve('test-skill', '^3.0.0')).toThrow(/3\.0\.0/);
  });

  it('resolveWithVersion returns both', () => {
    const result = resolver.resolveWithVersion('test-skill', '^1.0.0');
    expect(result.skill.name).toBe('test-skill');
    expect(result.version).toBe('1.1.0');
  });

  it('isAvailable returns true if available', () => {
    expect(resolver.isAvailable('test-skill', '^1.0.0')).toBe(true);
  });

  it('isAvailable returns false if missing', () => {
    expect(resolver.isAvailable('test-skill', '^3.0.0')).toBe(false);
    expect(resolver.isAvailable('missing-skill')).toBe(false);
  });
});
