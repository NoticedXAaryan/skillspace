import { z } from 'zod'
import { PersonaSchema, SCHEMA_VERSION } from './persona.schema.js'

/**
 * SkillSchema v2 — a versioned, publishable Persona Blueprint.
 *
 * A Skill is the unit of publication in the SkillSpace registry for personas.
 * It is portable across any model via the MAL.
 * It deliberately has NO tools, NO sub_agents, and NO memory.
 * If you need those, you want an Agent.
 */
export const SkillSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  name: z
    .string()
    .regex(/^@[\w-]+\/[\w-]+$/, 'Must be a scoped package name: @scope/name'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+/, 'Must be valid semver: MAJOR.MINOR.PATCH'),
  description: z.string().optional(),
  author: z.string().optional(),
  license: z.string().default('MIT'),
  tags: z.array(z.string()).default([]),
  persona: PersonaSchema,
})

export type Skill = z.infer<typeof SkillSchema>

/**
 * Guard to detect legacy v1 skill.json files at CLI runtime.
 * Used by `skillspace migrate` and `skillspace run` to give clear error messages.
 */
export function isLegacyV1Skill(raw: unknown): boolean {
  if (typeof raw !== 'object' || raw === null) return false
  const obj = raw as Record<string, unknown>
  return (
    !('schemaVersion' in obj) ||
    (typeof obj.schemaVersion === 'number' && obj.schemaVersion < 2) ||
    'instructions' in obj ||
    'entrypoint' in obj
  )
}
