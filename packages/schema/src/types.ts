import { z } from 'zod';
import { LockFileSchema } from './lockfile.schema.js';
import { ManifestSchema } from './manifest.schema.js';

// ---------------------------------------------------------------------------
// v2 Schema re-exports
// ---------------------------------------------------------------------------

export { SCHEMA_VERSION } from './persona.schema.js'
export type { Persona, PersonaRef } from './persona.schema.js'
export { PersonaSchema, PersonaRefSchema } from './persona.schema.js'

export type { Skill } from './skill.schema.js'
export { SkillSchema, isLegacyV1Skill } from './skill.schema.js'

export type { Agent, SubAgentRef, MCPRef } from './agent.schema.js'
export { AgentSchema, SubAgentRefSchema, MCPRefSchema } from './agent.schema.js'

// ---------------------------------------------------------------------------
// Other inferred TypeScript types from Zod schemas
// ---------------------------------------------------------------------------

/** A fully validated workflow definition */
export type Workflow = z.infer<typeof import('./workflow.schema.js').WorkflowSchema>;

/** A fully validated lock file */
export type LockFile = z.infer<typeof LockFileSchema>;

/** A fully validated package manifest */
export type Manifest = z.infer<typeof ManifestSchema>;

/** Tool definition */
export type Tool = z.infer<typeof import('./chat.schema.js').ToolSchema>;

/** Chat Messages */
export type ChatMessage = z.infer<typeof import('./chat.schema.js').ChatMessageSchema>;
export type SystemMessage = z.infer<typeof import('./chat.schema.js').SystemMessageSchema>;
export type UserMessage = z.infer<typeof import('./chat.schema.js').UserMessageSchema>;
export type AssistantMessage = z.infer<typeof import('./chat.schema.js').AssistantMessageSchema>;
export type ToolCall = z.infer<typeof import('./chat.schema.js').ToolCallSchema>;
export type ToolResultMessage = z.infer<typeof import('./chat.schema.js').ToolResultMessageSchema>;

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
  message?: AssistantMessage; // The raw assistant message containing text and tool_calls
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
