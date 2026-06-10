import YAML from 'yaml';
import { z, ZodError, ZodIssueCode } from 'zod';
import { SkillSchema } from './skill.schema.js';
import { AgentSchema } from './agent.schema.js';
import { LockFileSchema } from './lockfile.schema.js';
import { ManifestSchema } from './manifest.schema.js';
import { WorkflowSchema } from './workflow.schema.js';

// ---------------------------------------------------------------------------
// Validation result types
// ---------------------------------------------------------------------------

export type SkillValidationResult =
  | { success: true; data: z.infer<typeof SkillSchema> }
  | { success: false; errors: ZodError };

export type AgentValidationResult =
  | { success: true; data: z.infer<typeof AgentSchema> }
  | { success: false; errors: ZodError };

export type LockFileValidationResult =
  | { success: true; data: z.infer<typeof LockFileSchema> }
  | { success: false; errors: ZodError };

export type ManifestValidationResult =
  | { success: true; data: z.infer<typeof ManifestSchema> }
  | { success: false; errors: ZodError };

export type WorkflowValidationResult =
  | { success: true; data: z.infer<typeof WorkflowSchema> }
  | { success: false; errors: ZodError };

// ---------------------------------------------------------------------------
// Validation functions
// ---------------------------------------------------------------------------

export function validateSkill(data: unknown): SkillValidationResult {
  const result = SkillSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateAgent(data: unknown): AgentValidationResult {
  const result = AgentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateLockFile(data: unknown): LockFileValidationResult {
  const result = LockFileSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateManifest(data: unknown): ManifestValidationResult {
  const result = ManifestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateWorkflow(data: unknown): WorkflowValidationResult {
  const result = WorkflowSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// ---------------------------------------------------------------------------
// Helper to create a ZodError for YAML parse failures
// ---------------------------------------------------------------------------
function makeYamlParseError(err: unknown): ZodError {
  return new ZodError([
    {
      code: ZodIssueCode.custom,
      path: [],
      message: `Invalid YAML: ${err instanceof Error ? err.message : String(err)}`,
    },
  ]);
}

// ---------------------------------------------------------------------------
// YAML validation convenience functions
// ---------------------------------------------------------------------------

/**
 * Parse a raw YAML string and validate it as a skill definition.
 */
export function validateSkillYaml(raw: string): SkillValidationResult {
  try {
    const parsed = YAML.parse(raw);
    return validateSkill(parsed);
  } catch (err) {
    return { success: false, errors: makeYamlParseError(err) };
  }
}

/**
 * Parse a raw YAML string and validate it as an agent definition.
 */
export function validateAgentYaml(raw: string): AgentValidationResult {
  try {
    const parsed = YAML.parse(raw);
    return validateAgent(parsed);
  } catch (err) {
    return { success: false, errors: makeYamlParseError(err) };
  }
}

/**
 * Parse a raw YAML string and validate it as a lock file.
 */
export function validateLockFileYaml(raw: string): LockFileValidationResult {
  try {
    const parsed = YAML.parse(raw);
    return validateLockFile(parsed);
  } catch (err) {
    return { success: false, errors: makeYamlParseError(err) };
  }
}

/**
 * Parse a raw YAML string and validate it as a workflow definition.
 */
export function validateWorkflowYaml(raw: string): WorkflowValidationResult {
  try {
    const parsed = YAML.parse(raw);
    return validateWorkflow(parsed);
  } catch (err) {
    return { success: false, errors: makeYamlParseError(err) };
  }
}
