import { z } from 'zod';
import { SkillSchema } from './skill.schema.js';
import { AgentSchema } from './agent.schema.js';
import { LockFileSchema } from './lockfile.schema.js';
import { ManifestSchema } from './manifest.schema.js';

// ---------------------------------------------------------------------------
// Inferred TypeScript types from Zod schemas
// ---------------------------------------------------------------------------

/** A fully validated skill definition */
export type Skill = z.infer<typeof SkillSchema>;

/** A fully validated agent definition */
export type Agent = z.infer<typeof AgentSchema>;

/** A fully validated workflow definition */
export type Workflow = z.infer<typeof import('./workflow.schema.js').WorkflowSchema>;

/** A fully validated lock file */
export type LockFile = z.infer<typeof LockFileSchema>;

/** A fully validated package manifest */
export type Manifest = z.infer<typeof ManifestSchema>;

/** Valid permission strings */
export type Permission = z.infer<typeof import('./skill.schema.js').PermissionSchema>;

/** Valid output format */
export type OutputFormat = z.infer<typeof import('./skill.schema.js').OutputFormatSchema>;

/** Valid category */
export type Category = z.infer<typeof import('./skill.schema.js').CategorySchema>;

/** Package types */
export type PackageType = 'skill' | 'agent' | 'workflow' | 'mcp' | 'knowledge';

/** Skill runtime config */
export type SkillConfig = {
  temperature: number;
  max_tokens: number;
  timeout_seconds: number;
};

/** Execution result from SSR */
export interface ExecutionResult {
  output: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  model: string;
  duration_ms: number;
  status: 'success' | 'error' | 'timeout';
}

/** Model request payload (generic) */
export interface ModelRequest {
  url: string;
  headers: Record<string, string>;
  body: unknown;
  stream?: boolean;
}

/** Run options for the executor */
export interface RunOptions {
  skill: string;
  input: string;
  model: string;
  config?: Partial<SkillConfig>;
  output?: string;
  stream?: boolean;
}

/** API response wrapper */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

/** API error shape */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
