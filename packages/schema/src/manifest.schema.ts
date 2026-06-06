import { z } from 'zod';

// ---------------------------------------------------------------------------
// File entry in manifest
// ---------------------------------------------------------------------------
const ManifestFileSchema = z.object({
  path: z.string(),
  size: z.number().int().nonnegative(),
  checksum: z.string(),
});

// ---------------------------------------------------------------------------
// Manifest Schema (manifest.json inside .skillpkg)
// ---------------------------------------------------------------------------
export const ManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  type: z.enum(['skill', 'agent', 'workflow', 'mcp', 'knowledge']),
  created: z.string().datetime(),
  checksum: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  files: z.array(ManifestFileSchema),
  dependencies: z.record(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Validation function
// ---------------------------------------------------------------------------
export type ManifestValidationResult =
  | { success: true; data: z.infer<typeof ManifestSchema> }
  | { success: false; errors: z.ZodError };

export function validateManifest(data: unknown): ManifestValidationResult {
  const result = ManifestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
