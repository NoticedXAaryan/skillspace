import * as fs from 'node:fs';
import YAML from 'yaml';
import * as semver from 'semver';
import { type Skill, SkillSchema } from '@skillspace/schema';
import { SkillCache } from './cache.js';

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class SkillNotFoundError extends Error {
  constructor(public readonly skillName: string) {
    super(
      `Skill "${skillName}" is not installed. Run \`skillspace install ${skillName}\` first.`,
    );
    this.name = 'SkillNotFoundError';
  }
}

export class VersionNotFoundError extends Error {
  constructor(
    public readonly skillName: string,
    public readonly versionRange: string,
    public readonly availableVersions: string[],
  ) {
    const available =
      availableVersions.length > 0
        ? `Available versions: ${availableVersions.join(', ')}`
        : 'No versions installed.';
    super(
      `No version of "${skillName}" matching "${versionRange}" is installed. ${available}`,
    );
    this.name = 'VersionNotFoundError';
  }
}

// ---------------------------------------------------------------------------
// Skill Resolver
// ---------------------------------------------------------------------------

/**
 * Resolves skills by name and version range from the local cache.
 * Supports semver ranges: ^, ~, exact, and latest.
 */
export class SkillResolver {
  private cache: SkillCache;

  constructor(cache?: SkillCache) {
    this.cache = cache ?? new SkillCache();
  }

  /**
   * Resolve a skill by name and optional version range.
   *
   * @param name - The skill name (kebab-case)
   * @param versionRange - Optional semver range (e.g., "^1.0.0", "~2.1.0", "2.1.0", "*", "latest")
   * @returns The resolved Skill object
   */
  resolve(name: string, versionRange?: string): Skill {
    // 1. Check if name is a local file path
    if (name.endsWith('.yaml') || name.startsWith('./') || name.startsWith('.\\') || name.startsWith('/') || name.match(/^[a-zA-Z]:\\/)) {
      if (fs.existsSync(name)) {
        const content = fs.readFileSync(name, 'utf-8');
        const parsed = YAML.parse(content);
        return SkillSchema.parse(parsed);
      }
      throw new Error(`Local skill file not found: ${name}`);
    }

    const versions = this.cache.getInstalledVersions(name);

    if (versions.length === 0) {
      throw new SkillNotFoundError(name);
    }

    // Default to latest if no range specified
    const range = versionRange ?? '*';

    if (range === 'latest' || range === '*') {
      // Get the highest version
      const sorted = versions.sort(semver.rcompare);
      const latest = sorted[0]!;
      return this.cache.loadSkill(name, latest);
    }

    // Try exact match first
    if (semver.valid(range) && versions.includes(range)) {
      return this.cache.loadSkill(name, range);
    }

    // Try semver range matching
    const matching = versions
      .filter((v) => semver.satisfies(v, range))
      .sort(semver.rcompare);

    if (matching.length === 0) {
      throw new VersionNotFoundError(name, range, versions);
    }

    // Return highest matching version
    const bestMatch = matching[0]!;
    return this.cache.loadSkill(name, bestMatch);
  }

  /**
   * Resolve a skill and return both the skill and its resolved version.
   */
  resolveWithVersion(
    name: string,
    versionRange?: string,
  ): { skill: Skill; version: string } {
    const skill = this.resolve(name, versionRange);
    return { skill, version: skill.version };
  }

  /**
   * Check if a skill is available locally.
   */
  isAvailable(name: string, versionRange?: string): boolean {
    try {
      this.resolve(name, versionRange);
      return true;
    } catch {
      return false;
    }
  }
}
