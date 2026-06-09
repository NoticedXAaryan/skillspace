import { z } from 'zod';
import { PermissionSchema } from './skill.schema.js';

// ---------------------------------------------------------------------------
// Memory types
// ---------------------------------------------------------------------------
const MemoryTypeSchema = z.enum(['none', 'session', 'persistent']);

const MemorySchema = z.object({
  type: MemoryTypeSchema.default('none'),
  config: z.record(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Tool reference
// ---------------------------------------------------------------------------
const ToolRefSchema = z.object({
  name: z.string().min(1),
  config: z.record(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// MCP server reference
// ---------------------------------------------------------------------------
const McpServerRefSchema = z.object({
  name: z.string().min(1),
  config: z.record(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Skill dependency within an agent
// ---------------------------------------------------------------------------
const SkillRefSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Model config for agent
// ---------------------------------------------------------------------------
const ModelConfigSchema = z.object({
  id: z.string().min(1),
  config: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      max_tokens: z.number().int().positive().optional(),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Workflow reference
// ---------------------------------------------------------------------------
const WorkflowRefSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Kebab-case name validation
// ---------------------------------------------------------------------------
const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// Main Agent Schema
// ---------------------------------------------------------------------------
export const AgentSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(214)
    .regex(kebabCaseRegex, 'Name must be kebab-case'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must be valid semver'),
  description: z.string().min(1).max(200),
  author: z.string().min(1),
  license: z.string().min(1),

  model: ModelConfigSchema,

  skills: z.array(SkillRefSchema).default([]),
  tools: z.array(ToolRefSchema).default([]),
  mcp_servers: z.array(McpServerRefSchema).default([]),

  permissions: z.array(PermissionSchema).default([]),
  env: z.record(z.string()).default({}),

  memory: MemorySchema.default({ type: 'none' }),

  workflows: z.array(WorkflowRefSchema).default([]),
});

// ---------------------------------------------------------------------------
// Validation function
// ---------------------------------------------------------------------------
export type AgentValidationResult =
  | { success: true; data: z.infer<typeof AgentSchema> }
  | { success: false; errors: z.ZodError };

export function validateAgent(data: unknown): AgentValidationResult {
  const result = AgentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
