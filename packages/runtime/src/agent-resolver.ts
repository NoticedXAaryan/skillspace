import * as fs from 'node:fs';
import YAML from 'yaml';
import * as semver from 'semver';
import { type Agent, AgentSchema } from '@skillspace/schema';

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


  constructor(cache?: SkillCache) {
    this.cache = cache ?? new SkillCache();
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
   * Resolves the agent. In v2, agents embed personas directly or by ref,
   * rather than declaring a skills dependency array.
   * This method is preserved for backward compatibility.
   */
  resolveWithDependencies(name: string, versionRange?: string): { agent: Agent; skills: any[] } {
    const agent = this.resolve(name, versionRange);
    const resolvedSkills: any[] = [];

    // v2 agents embed personas via ref or inline — resolve refs
    if (agent.persona && typeof agent.persona === 'object' && 'ref' in agent.persona) {
      const ref = (agent.persona as any).ref;
      const match = ref.match(/^@([\w-]+)\/([\w-]+)(?:@([\d.]+))?$/);
      if (match) {
        const skillName = `@${match[1]}/${match[2]}`;
        const skillVersion = match[3];
        try {
          const versions = this.cache.getInstalledVersions(skillName);
          if (versions.length > 0) {
            const resolved = skillVersion
              ? versions.find(v => v === skillVersion) ?? versions.sort(semver.rcompare)[0]
              : versions.sort(semver.rcompare)[0];
            const skill = this.cache.loadSkill(skillName, resolved);
            resolvedSkills.push(skill);
          }
        } catch {
          // Skill not available locally — leave empty
        }
      }
    }

    // v1 agents may still declare a skills array
    const v1Skills = (agent as any).skills;
    if (Array.isArray(v1Skills)) {
      for (const s of v1Skills) {
        try {
          const skill = this.cache.loadSkill(s.name, s.version ?? 'latest');
          resolvedSkills.push(skill);
        } catch {
          // Skill not available
        }
      }
    }

    return { agent, skills: resolvedSkills };
  }
}

