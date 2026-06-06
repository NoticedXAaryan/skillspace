import { z } from 'zod';

const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// Step definition for a workflow
// ---------------------------------------------------------------------------
const BaseStepSchema = z.object({
  id: z.string().min(1).optional(),
  condition: z.string().optional(),
  on_failure: z.enum(['fail', 'continue']).default('fail'),
});

export const ActionStepSchema = BaseStepSchema.extend({
  run: z.string().min(1),
  input: z.string().optional(),
  model: z.string().optional(), // Optional model override
});

export const ParallelStepSchema = BaseStepSchema.extend({
  parallel: z.array(ActionStepSchema).min(1),
});

export const WorkflowStepSchema = z.union([ActionStepSchema, ParallelStepSchema]);

// ---------------------------------------------------------------------------
// Main Workflow Schema
// ---------------------------------------------------------------------------
export const WorkflowSchema = z.object({
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

  steps: z.array(WorkflowStepSchema).min(1),
  
  outputs: z.record(z.string()).optional(), // Maps output keys to expressions e.g., {{steps.1.output}}
});

// ---------------------------------------------------------------------------
// Validation function
// ---------------------------------------------------------------------------
export type WorkflowValidationResult =
  | { success: true; data: z.infer<typeof WorkflowSchema> }
  | { success: false; errors: z.ZodError };

export function validateWorkflow(data: unknown): WorkflowValidationResult {
  const result = WorkflowSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
