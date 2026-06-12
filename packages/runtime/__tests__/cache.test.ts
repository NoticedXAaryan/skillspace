import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import YAML from 'yaml';
import { SkillCache } from '../src/cache.js';
import { mockInstallPackage } from './test-utils.js';

describe('SkillCache', () => {
  let tempDir: string;
  let cache: SkillCache;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillspace-cache-test-'));
    cache = new SkillCache(tempDir);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const sampleSkillYaml = YAML.stringify({
    schemaVersion: 2,
    name: '@test/test-skill',
    version: '1.0.0',
    description: 'A test skill',
    author: 'tester',
    license: 'MIT',
    persona: {
      system_prompt: 'You are a helpful test assistant.',
      behavioral_guidelines: [],
      capabilities: [],
    },
    tags: ['test'],
  });

  it('installs a package correctly', async () => {
    const files = new Map<string, Buffer>();
    files.set('skill.yaml', Buffer.from(sampleSkillYaml));
    files.set('README.md', Buffer.from('# Test Skill'));

    const pkgDir = await mockInstallPackage(cache, '@test/test-skill', '1.0.0', files);

    expect(fs.existsSync(pkgDir)).toBe(true);
    expect(fs.existsSync(path.join(pkgDir, 'skill.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(pkgDir, 'README.md'))).toBe(true);
    
    // Check isInstalled
    expect(cache.isInstalled('@test/test-skill', '1.0.0')).toBe(true);
    expect(cache.isInstalled('@test/test-skill', '2.0.0')).toBe(false);
  });

  it('validates checksum during installation', async () => {
    // Tests for checksum were tied to the removed `installPackage` logic
    // We will verify the new `preparePackageDir` method instead
    const files = new Map<string, Buffer>();
    files.set('skill.yaml', Buffer.from(sampleSkillYaml));
    const fakeBuffer = Buffer.from('fake tarball');
    
    // Should succeed if no checksum is provided
    await expect(
      cache.preparePackageDir('@test/test-skill', '1.0.0', fakeBuffer)
    ).resolves.not.toThrow();

    // Should fail with invalid checksum
    await expect(
      cache.preparePackageDir('@test/test-skill', '1.0.1', fakeBuffer, 'sha256:invalid')
    ).rejects.toThrow(/Checksum mismatch/);
  });

  it('loads a skill from cache', async () => {
    const files = new Map<string, Buffer>();
    files.set('skill.yaml', Buffer.from(sampleSkillYaml));
    await mockInstallPackage(cache, '@test/test-skill', '1.0.0', files);

    const skill = cache.loadSkill('@test/test-skill', '1.0.0');
    expect(skill.name).toBe('@test/test-skill');
    expect(skill.version).toBe('1.0.0');
    expect(skill.persona.system_prompt).toBe('You are a helpful test assistant.');
  });

  it('throws when loading a non-existent skill', () => {
    expect(() => cache.loadSkill('missing-skill', '1.0.0')).toThrow(/not installed locally/);
  });

  it('removes a package', async () => {
    const files = new Map<string, Buffer>();
    files.set('skill.yaml', Buffer.from(sampleSkillYaml));
    await mockInstallPackage(cache, '@test/test-skill', '1.0.0', files);

    expect(cache.isInstalled('@test/test-skill', '1.0.0')).toBe(true);

    cache.removePackage('@test/test-skill', '1.0.0');

    expect(cache.isInstalled('@test/test-skill', '1.0.0')).toBe(false);
  });

  it('lists installed packages and versions', async () => {
    const files1 = new Map<string, Buffer>();
    files1.set('skill.yaml', Buffer.from(sampleSkillYaml));

    const skillYaml2 = sampleSkillYaml.replace('version: "1.0.0"', 'version: "2.0.0"');
    const files2 = new Map<string, Buffer>();
    files2.set('skill.yaml', Buffer.from(skillYaml2));

    await mockInstallPackage(cache, '@test/test-skill', '1.0.0', files1);
    await mockInstallPackage(cache, '@test/test-skill', '2.0.0', files2);

    const installed = cache.listInstalled();
    expect(installed).toHaveLength(2);
    expect(installed.map(p => p.version)).toContain('1.0.0');
    expect(installed.map(p => p.version)).toContain('2.0.0');

    const versions = cache.getInstalledVersions('@test/test-skill');
    expect(versions).toEqual(expect.arrayContaining(['1.0.0', '2.0.0']));
  });
  
  it('gets readme', async () => {
    const files = new Map<string, Buffer>();
    files.set('skill.yaml', Buffer.from(sampleSkillYaml));
    files.set('README.md', Buffer.from('# Hello Readme'));
    await mockInstallPackage(cache, '@test/test-skill', '1.0.0', files);
    
    expect(cache.getReadme('@test/test-skill', '1.0.0')).toBe('# Hello Readme');
    expect(cache.getReadme('@test/test-skill', '2.0.0')).toBeNull();
  });
});
