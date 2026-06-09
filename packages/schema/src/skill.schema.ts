import { z } from 'zod';

// ---------------------------------------------------------------------------
// Permission types
// ---------------------------------------------------------------------------
export const VALID_PERMISSIONS = [
  'filesystem.read',
  'filesystem.write',
  'network.fetch',
  'tools.browser',
  'tools.terminal',
] as const;

export const PermissionSchema = z.enum(VALID_PERMISSIONS);

// ---------------------------------------------------------------------------
// Output format
// ---------------------------------------------------------------------------
export const OutputFormatSchema = z.enum(['json', 'text', 'markdown']);

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------
export const CategorySchema = z.enum([
  'code',
  'writing',
  'analysis',
  'security',
  'devops',
  'other',
]);

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------
const InstructionsSchema = z.object({
  system: z.string().min(1, 'System prompt is required'),
  user_template: z
    .string()
    .min(1, 'User template is required')
    .refine((t) => t.includes('{{input}}'), {
      message: 'User template must contain {{input}} placeholder',
    }),
  output_format: OutputFormatSchema.default('text'),
  output_schema: z.record(z.unknown()).optional(),
});

const ExampleSchema = z.object({
  input: z.string(),
  expected_output: z.union([z.string(), z.record(z.unknown())]),
  model: z.string().optional(),
});

const EvaluationSchema = z.object({
  benchmark_dataset: z.string().optional(),
  passing_threshold: z.number().min(0).max(1).optional(),
});

const CompatibilityModelSchema = z.object({
  id: z.string(),
});

const CompatibilitySchema = z.object({
  models: z.array(CompatibilityModelSchema).optional(),
  min_context_tokens: z.number().int().positive().optional(),
});

const SkillConfigSchema = z.object({
  temperature: z.number().min(0).max(2).default(0.3),
  max_tokens: z.number().int().positive().default(4000),
  timeout_seconds: z.number().int().positive().default(30),
});

const McpServerRef = z.object({
  name: z.string(),
  transport: z.enum(['stdio', 'http']),
  command: z.string().optional(),
  url: z.string().url().optional(),
  requiredScopes: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Kebab-case name validation
// ---------------------------------------------------------------------------
const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// Main Skill Schema
// ---------------------------------------------------------------------------
export const SkillSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(1)
    .max(214)
    .regex(kebabCaseRegex, 'Name must be kebab-case (e.g., my-skill-name)'),
  version: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+$/,
      'Version must be valid semver (MAJOR.MINOR.PATCH)',
    ),
  description: z.string().min(1).max(200),
  author: z.string().min(1),
  license: z.string().min(1),

  // Capability definition
  instructions: InstructionsSchema,

  // Metadata
  tags: z.array(z.string()).max(10).default([]),
  category: CategorySchema.default('other'),

  // Examples
  examples: z.array(ExampleSchema).default([]),

  // Evaluation
  evaluation: EvaluationSchema.optional(),

  // Permissions
  permissions: z.array(PermissionSchema).default([]),

  // MCP Servers
  mcpServers: z.array(McpServerRef).optional().default([]),

  // Dependencies
  dependencies: z
    .object({
      skills: z.record(z.string()).optional(),
      knowledge: z.record(z.string()).optional(),
    })
    .optional(),

  // Compatibility
  compatibility: CompatibilitySchema.optional(),

  // Configuration
  config: SkillConfigSchema.default({
    temperature: 0.3,
    max_tokens: 4000,
    timeout_seconds: 30,
  }),

  // Environment requirements
  env: z.record(z.string()).default({}),
});

// ---------------------------------------------------------------------------
// Validation function
// ---------------------------------------------------------------------------
export type SkillValidationResult =
  | { success: true; data: z.infer<typeof SkillSchema> }
  | { success: false; errors: z.ZodError };

export function validateSkill(data: unknown): SkillValidationResult {
  const result = SkillSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
