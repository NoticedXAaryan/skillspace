import { execSync } from 'node:child_process';
import { Executor, SkillResolver, startPersonaREPL } from '@skillspace/runtime';
import { SkillSchema, type Persona, type Skill } from '@skillspace/schema';

export type DefineSkillInput = {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  tags?: string[];
  persona: Persona;
};

export type PackageSearchResult = {
  id: string;
  name: string;
  description: string;
  owner: string;
  latestVersion: string;
  downloads: number;
  createdAt: string;
  tags: string[];
};

export type UserSearchResult = {
  id: string;
  username: string | null;
  bio: string | null;
  joinedAt: string;
  stats: {
    packagesPublished: number;
  };
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string | { message?: string };
};

export function defineSkill(config: DefineSkillInput): Skill {
  return SkillSchema.parse({
    schemaVersion: 2,
    license: 'MIT',
    tags: [],
    ...config,
  });
}

export function validateSkill(skill: unknown): Skill {
  return SkillSchema.parse(skill);
}

export class SkillSpaceClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config?: { baseUrl?: string; fetch?: typeof fetch }) {
    this.baseUrl = (config?.baseUrl ?? 'https://registry.skillspace.ai/api/v1').replace(/\/$/, '');
    this.fetchImpl = config?.fetch ?? fetch;
  }

  packages = {
    search: async (query: string, limit = 20): Promise<PackageSearchResult[]> => {
      const params = new URLSearchParams({ q: query, limit: String(limit) });
      return this.request<PackageSearchResult[]>(`/packages?${params}`);
    },
  };

  users = {
    search: async (username: string, limit = 20): Promise<UserSearchResult[]> => {
      const params = new URLSearchParams({ username, limit: String(limit) });
      return this.request<UserSearchResult[]>(`/users?${params}`);
    },
  };

  private async request<T>(path: string): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`);
    const body = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;

    if (!res.ok || body.success === false) {
      const message =
        typeof body.error === 'string'
          ? body.error
          : (body.error?.message ?? `SkillSpace API request failed with ${res.status}`);
      throw new Error(message);
    }

    if (!('data' in body)) {
      throw new Error('SkillSpace API response did not include data');
    }

    return body.data as T;
  }
}

// Re-export runtime classes for execution
export { Executor, SkillResolver, startPersonaREPL };

/**
 * Convenience method to resolve a package by name locally
 */
export function resolvePackage(name: string): Skill {
  return new SkillResolver().resolve(name) as Skill;
}

/**
 * Install a package by wrapping the skillspace CLI headless mode.
 */
export function installPackage(name: string, version?: string): boolean {
  try {
    const cmd = `npx skillspace install ${name}${version ? ` -v ${version}` : ''} --yes --json`;
    const result = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    const parsed = JSON.parse(result);
    return parsed.success === true;
  } catch (err) {
    throw new Error(`Failed to install package ${name}: ${(err as Error).message}`);
  }
}

/**
 * Run an agent against a given input.
 * `model` is a provider model id like "anthropic/claude-haiku-4-5".
 */
export async function runAgent(name: string, input: string, model: string) {
  const executor = new Executor();
  return executor.run({ skill: name, input, model });
}

export type { Persona, Skill };
