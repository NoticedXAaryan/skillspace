import YAML from 'yaml';
import { ZodError, ZodIssueCode } from 'zod';
import { validateSkill, type SkillValidationResult } from './skill.schema.js';
import { validateAgent, type AgentValidationResult } from './agent.schema.js';
import { validateLockFile, type LockFileValidationResult } from './lockfile.schema.js';
import { validateManifest, type ManifestValidationResult } from './manifest.schema.js';
import { validateWorkflow, type WorkflowValidationResult } from './workflow.schema.js';

// Re-export all validation functions
export { validateSkill, validateAgent, validateLockFile, validateManifest, validateWorkflow };

// Re-export result types
export type {
  SkillValidationResult,
  AgentValidationResult,
  LockFileValidationResult,
  ManifestValidationResult,
  WorkflowValidationResult,
};

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
