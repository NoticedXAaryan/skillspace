import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import YAML from 'yaml';
import { AgentResolver, AgentNotFoundError } from '../src/agent-resolver.js';
import { SkillCache } from '../src/cache.js';
import { mockInstallPackage } from './test-utils.js';

describe('AgentResolver', () => {
  let tempDir: string;
  let cache: SkillCache;
  let resolver: AgentResolver;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillspace-agent-resolver-test-'));
    cache = new SkillCache(tempDir);
    resolver = new AgentResolver(cache);

    // Install a mock skill
    const skillYaml = YAML.stringify({
      schemaVersion: 2,
      name: '@test/test-skill',
      version: '1.0.0',
      description: 'A test skill',
      author: 'tester',
      license: 'MIT',
      persona: {
        system_prompt: 'You are a test assistant.',
        behavioral_guidelines: [],
        capabilities: [],
      },
      tags: [],
    });

    const skillFiles = new Map<string, Buffer>();
    skillFiles.set('skill.yaml', Buffer.from(skillYaml));
    await mockInstallPackage(cache, '@test/test-skill', '1.0.0', skillFiles);

    // Install a mock agent
    const agentYaml = YAML.stringify({
      schemaVersion: 2,
      name: '@test/test-agent',
      version: '1.0.0',
      description: 'A test agent',
      author: 'tester',
      license: 'MIT',
      persona: {
        ref: '@test/test-skill',
      },
      mcps: [],
      permissions: [],
      sub_agents: [],
    });

    const agentFiles = new Map<string, Buffer>();
    agentFiles.set('agent.yaml', Buffer.from(agentYaml));
    await mockInstallPackage(cache, '@test/test-agent', '1.0.0', agentFiles);
    
    // Install a newer version of the agent
    const agentYamlV2 = YAML.stringify({
      schemaVersion: 2,
      name: '@test/test-agent',
      version: '2.0.0',
      description: 'A test agent v2',
      author: 'tester',
      license: 'MIT',
      persona: {
        ref: '@test/test-skill',
      },
      mcps: [],
      permissions: [],
      sub_agents: [],
    });
    const agentFilesV2 = new Map<string, Buffer>();
    agentFilesV2.set('agent.yaml', Buffer.from(agentYamlV2));
    await mockInstallPackage(cache, '@test/test-agent', '2.0.0', agentFilesV2);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('resolves the latest agent when no version is specified', () => {
    const agent = resolver.resolve('@test/test-agent');
    expect(agent.version).toBe('2.0.0');
  });

  it('resolves a specific version of an agent', () => {
    const agent = resolver.resolve('@test/test-agent', '1.0.0');
    expect(agent.version).toBe('1.0.0');
  });

  it('throws AgentNotFoundError for uninstalled agents', () => {
    expect(() => resolver.resolve('non-existent')).toThrowError(AgentNotFoundError);
  });

  it('resolves agent with dependencies correctly', () => {
    const { agent, skills } = resolver.resolveWithDependencies('@test/test-agent', '1.0.0');
    expect(agent.version).toBe('1.0.0');
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('@test/test-skill');
  });
});
