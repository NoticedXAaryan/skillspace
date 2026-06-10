import * as fs from 'node:fs';
import YAML from 'yaml';
import * as semver from 'semver';
import { type Agent, type Skill, AgentSchema } from '@skillspace/schema';
import { SkillResolver } from './resolver.js';
import { SkillCache } from './cache.js';

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class AgentNotFoundError extends Error {
  constructor(public readonly agentName: string) {
    super(
      `Agent "${agentName}" is not installed. Run \`skillspace agent install ${agentName}\` first.`,
    );
    this.name = 'AgentNotFoundError';
  }
}

// ---------------------------------------------------------------------------
// Agent Resolver
// ---------------------------------------------------------------------------

export class AgentResolver {
  private cache: SkillCache;
  private skillResolver: SkillResolver;

  constructor(cache?: SkillCache, skillResolver?: SkillResolver) {
    this.cache = cache ?? new SkillCache();
    this.skillResolver = skillResolver ?? new SkillResolver(this.cache);
  }

  /**
   * Resolve an agent by name and optional version range.
   */
  resolve(name: string, versionRange?: string): Agent {
    if (name.endsWith('.yaml') || name.startsWith('./') || name.startsWith('.\\') || name.startsWith('/') || name.match(/^[a-zA-Z]:\\/)) {
      if (fs.existsSync(name)) {
        const content = fs.readFileSync(name, 'utf-8');
        const parsed = YAML.parse(content);
        return AgentSchema.parse(parsed);
      }
      throw new Error(`Local agent file not found: ${name}`);
    }

    const versions = this.cache.getInstalledAgentVersions(name);

    if (versions.length === 0) {
      throw new AgentNotFoundError(name);
    }

    const range = versionRange ?? '*';

    if (range === 'latest' || range === '*') {
      const sorted = versions.sort(semver.rcompare);
      const latest = sorted[0]!;
      return this.cache.loadAgent(name, latest);
    }

    if (semver.valid(range) && versions.includes(range)) {
      return this.cache.loadAgent(name, range);
    }

    const matching = versions
      .filter((v) => semver.satisfies(v, range))
      .sort(semver.rcompare);

    if (matching.length === 0) {
      throw new Error(`No version of agent "${name}" matching "${range}" is installed.`);
    }

    const bestMatch = matching[0]!;
    return this.cache.loadAgent(name, bestMatch);
  }

  /**
   * Resolves the agent and all its skill dependencies.
   */
  resolveWithDependencies(name: string, versionRange?: string): { agent: Agent; skills: Skill[] } {
    const agent = this.resolve(name, versionRange);
    const resolvedSkills: Skill[] = [];

    for (const skillRef of agent.skills) {
      const skill = this.skillResolver.resolve(skillRef.name, skillRef.version);
      resolvedSkills.push(skill);
    }

    return { agent, skills: resolvedSkills };
  }
}
