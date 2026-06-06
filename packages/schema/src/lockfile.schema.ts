import { z } from 'zod';

// ---------------------------------------------------------------------------
// Resolved skill entry in lock file
// ---------------------------------------------------------------------------
const LockedSkillSchema = z.object({
  version: z.string(),
  resolved: z.string().url(),
  checksum: z.string().regex(/^sha256:[a-f0-9]{64}$/, 'Invalid SHA-256 checksum format'),
  dependencies: z.record(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Resolved agent entry in lock file
// ---------------------------------------------------------------------------
const LockedAgentSchema = z.object({
  version: z.string(),
  resolved: z.string().url(),
  checksum: z.string().regex(/^sha256:[a-f0-9]{64}$/, 'Invalid SHA-256 checksum format'),
  dependencies: z.record(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Resolved MCP server entry
// ---------------------------------------------------------------------------
const LockedMcpSchema = z.object({
  version: z.string(),
  resolved: z.string().url(),
  checksum: z.string().regex(/^sha256:[a-f0-9]{64}$/, 'Invalid SHA-256 checksum format'),
});

// ---------------------------------------------------------------------------
// Lock File Schema (skillspace.lock)
// ---------------------------------------------------------------------------
export const LockFileSchema = z.object({
  version: z.literal(1),
  generated: z.string().datetime(),
  skills: z.record(LockedSkillSchema).default({}),
  agents: z.record(LockedAgentSchema).default({}),
  mcp_servers: z.record(LockedMcpSchema).default({}),
});

// ---------------------------------------------------------------------------
// Validation function
// ---------------------------------------------------------------------------
export type LockFileValidationResult =
  | { success: true; data: z.infer<typeof LockFileSchema> }
  | { success: false; errors: z.ZodError };

export function validateLockFile(data: unknown): LockFileValidationResult {
  const result = LockFileSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
