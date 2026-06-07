import { z } from 'zod';

const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export const BenchmarkTestCaseSchema = z.object({
  id: z.string().min(1),
  input: z.string().min(1),
  expected_output: z.string().optional(),
  expected_schema: z.record(z.unknown()).optional(),
  match_type: z.enum(['exact', 'contains', 'json_schema']).default('exact'),
});

export const BenchmarkSuiteSchema = z.object({
  name: z.string().min(1).max(214).regex(kebabCaseRegex, 'Name must be kebab-case'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be valid semver'),
  description: z.string().min(1).max(200),
  target_package: z.string().min(1), // the name of the skill/agent to benchmark
  tests: z.array(BenchmarkTestCaseSchema).min(1),
});

export type BenchmarkValidationResult =
  | { success: true; data: z.infer<typeof BenchmarkSuiteSchema> }
  | { success: false; errors: z.ZodError };

export function validateBenchmark(data: unknown): BenchmarkValidationResult {
  const result = BenchmarkSuiteSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
