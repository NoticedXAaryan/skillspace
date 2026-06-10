import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export type Provider = 'anthropic' | 'openai' | 'google' | 'ollama'

export interface ResolvedModel {
  provider: Provider
  modelId: string
  /** Name of the environment variable that must hold the API key. Empty for ollama. */
  apiKeyEnv: string
}

export interface UserConfig {
  default_model?: string
  [key: string]: unknown
}

/**
 * SYSTEM_DEFAULT is used only when no other model preference is found.
 * It deliberately uses a fast, inexpensive model to avoid surprise costs.
 */
const SYSTEM_DEFAULT: ResolvedModel = {
  provider: 'anthropic',
  modelId: 'claude-haiku-4-5',
  apiKeyEnv: 'ANTHROPIC_API_KEY',
}

/**
 * resolveModel — determines which model to use for a session.
 *
 * Priority chain (first defined wins):
 *   1. CLI flag: `skillspace run @skill/pirate --model anthropic/claude-sonnet-4-6`
 *   2. Skill/Persona preferred_model field
 *   3. User config: ~/.skillspace/config.json → default_model
 *   4. System default: anthropic/claude-haiku-4-5
 *
 * Model strings use the format: "provider/model-id"
 * Examples: "anthropic/claude-sonnet-4-6", "openai/gpt-4o", "google/gemini-1.5-pro", "ollama/llama3"
 */
export function resolveModel(
  cliFlag?: string,
  skillPreferredModel?: string,
  userConfig?: UserConfig,
): ResolvedModel {
  const rawModelString = cliFlag ?? skillPreferredModel ?? userConfig?.default_model

  if (!rawModelString) {
    return SYSTEM_DEFAULT
  }

  return parseModelString(rawModelString)
}

function parseModelString(raw: string): ResolvedModel {
  const slashIndex = raw.indexOf('/')
  if (slashIndex === -1) {
    throw new Error(
      `Invalid model string "${raw}". Use format: provider/model-id\n` +
      `Examples: "anthropic/claude-sonnet-4-6", "openai/gpt-4o", "ollama/llama3"`
    )
  }

  const provider = raw.slice(0, slashIndex).toLowerCase()
  const modelId = raw.slice(slashIndex + 1)

  const providerMap: Record<string, Omit<ResolvedModel, 'modelId'>> = {
    anthropic: { provider: 'anthropic', apiKeyEnv: 'ANTHROPIC_API_KEY' },
    openai:    { provider: 'openai',    apiKeyEnv: 'OPENAI_API_KEY'    },
    google:    { provider: 'google',    apiKeyEnv: 'GOOGLE_API_KEY'    },
    gemini:    { provider: 'google',    apiKeyEnv: 'GOOGLE_API_KEY'    }, // alias
    ollama:    { provider: 'ollama',    apiKeyEnv: ''                  }, // no key needed
  }

  const base = providerMap[provider]
  if (!base) {
    throw new Error(
      `Unknown provider "${provider}" in model string "${raw}".\n` +
      `Supported providers: anthropic, openai, google, ollama`
    )
  }

  return { ...base, modelId }
}

/**
 * Reads the user's SkillSpace config file.
 * Returns an empty object if the file does not exist.
 */
export function readUserConfig(): UserConfig {
  const configPath = path.join(os.homedir(), '.skillspace', 'config.json')
  if (!fs.existsSync(configPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as UserConfig
  } catch {
    return {}
  }
}

/**
 * Validates that the required API key environment variable is set.
 * Throws an actionable error if missing.
 */
export function assertApiKey(model: ResolvedModel): void {
  if (!model.apiKeyEnv) return // ollama needs no key

  const key = process.env[model.apiKeyEnv]
  if (!key) {
    throw new Error(
      `Missing API key for provider "${model.provider}".\n` +
      `Set the environment variable: ${model.apiKeyEnv}\n` +
      `Or configure a default model in ~/.skillspace/config.json`
    )
  }
}
