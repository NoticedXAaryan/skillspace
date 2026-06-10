import { z } from 'zod'

export const SCHEMA_VERSION = 2 as const

/**
 * PersonaSchema — the behavioral blueprint for a Skill.
 *
 * A Persona defines HOW an AI speaks and acts, not WHAT it can do.
 * It is stateless and model-agnostic; the MAL in packages/runtime
 * handles translation to each provider's specific format.
 */
export const PersonaSchema = z.object({
  /**
   * Core instruction injected as the system prompt at session start.
   * This is the single most important field. Write it as if you are
   * briefing a professional actor taking on a role.
   */
  system_prompt: z.string().min(10, 'system_prompt must be at least 10 characters'),

  /**
   * Natural-language description of tone.
   * Used by the MAL to append a tone hint to the system prompt when the
   * provider does not natively support structured persona fields.
   * Examples: "Professional and terse", "Pirate — full dialect", "Sarcastic but helpful"
   */
  tone: z.string().optional(),

  /**
   * Ordered list of hard behavioral rules.
   * These are appended to the system prompt as a numbered list so the
   * model treats them as explicit instructions, not suggestions.
   */
  behavioral_guidelines: z.array(z.string()).default([]),

  /**
   * Optional first message the persona sends when a REPL session starts.
   * If absent, the CLI will not print an opening message.
   */
  greeting: z.string().optional(),

  /**
   * Preferred model for this persona. Treated as a hint, not a requirement.
   * Format: "<provider>/<model-id>"
   * Examples: "anthropic/claude-3-5-sonnet-20241022", "openai/gpt-4o", "google/gemini-1.5-pro"
   * The CLI model resolution chain may override this. See Section 4.1.
   */
  preferred_model: z.string().optional(),

  /**
   * Declared capability intentions (e.g. ["read:files", "web:search"]).
   * Informational only at the Skill layer. Enforced by the Agent that
   * embeds this Persona via packages/runtime/src/permissions.ts.
   */
  capabilities: z.array(z.string()).default([]),
})

export type Persona = z.infer<typeof PersonaSchema>

/**
 * A Persona reference inside an Agent can be either:
 *   - An inline PersonaSchema definition
 *   - A reference to a published Skill by registry name
 */
export const PersonaRefSchema = z.union([
  PersonaSchema,
  z.object({
    /**
     * Registry reference to a published Skill.
     * The runtime will resolve and fetch this Skill at agent startup.
     * Examples: "@skillspace/java-expert", "@skillspace/pirate@1.2.0"
     */
    ref: z.string().regex(
      /^@[\w-]+\/[\w-]+(@[\d.]+)?$/,
      'Ref must be scoped: @scope/name or @scope/name@version'
    ),
  }),
])

export type PersonaRef = z.infer<typeof PersonaRefSchema>
