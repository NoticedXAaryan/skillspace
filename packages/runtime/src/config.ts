import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import YAML from 'yaml';

// ---------------------------------------------------------------------------
// SkillSpace config directory: ~/.skillspace/
// ---------------------------------------------------------------------------

const SKILLSPACE_DIR = process.env.SKILLSPACE_HOME || path.join(os.homedir(), '.skillspace');
const CONFIG_FILE = path.join(SKILLSPACE_DIR, 'config.yaml');
const CREDENTIALS_FILE = path.join(SKILLSPACE_DIR, 'credentials');
const REGISTRY_DIR = path.join(SKILLSPACE_DIR, 'registry');

// ---------------------------------------------------------------------------
// Config types
// ---------------------------------------------------------------------------

export interface SkillSpaceConfig {
  default_model?: string;
  registry_url: string;
  registries?: string[]; // Ordered list of registry URLs for fallback
  models: Record<
    string,
    {
      api_key: string;
      base_url?: string;
    }
  >;
}

const DEFAULT_CONFIG: SkillSpaceConfig = {
  registry_url: 'http://localhost:3000',
  registries: ['http://localhost:3000', 'https://registry.skillspace.ai'],
  models: {},
};

// ---------------------------------------------------------------------------
// Directory setup
// ---------------------------------------------------------------------------

/**
 * Ensures the ~/.skillspace/ directory structure exists.
 */
export function ensureSkillspaceDir(): void {
  const dirs = [SKILLSPACE_DIR, REGISTRY_DIR, path.join(SKILLSPACE_DIR, 'mcp')];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  // Create config file if missing
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, YAML.stringify(DEFAULT_CONFIG), 'utf-8');
  }
}

// ---------------------------------------------------------------------------
// Config read / write
// ---------------------------------------------------------------------------

/**
 * Load the SkillSpace config from ~/.skillspace/config.yaml
 */
export function loadConfig(): SkillSpaceConfig {
  ensureSkillspaceDir();
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = YAML.parse(raw) as Partial<SkillSpaceConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (err) {
    console.error('Failed to load config:', err);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Save config to ~/.skillspace/config.yaml
 */
export function saveConfig(config: SkillSpaceConfig): void {
  ensureSkillspaceDir();
  fs.writeFileSync(CONFIG_FILE, YAML.stringify(config), 'utf-8');
}

// ---------------------------------------------------------------------------
// API key management
// ---------------------------------------------------------------------------

/**
 * Get the API key for a model provider.
 */
export function getApiKey(provider: string): string | undefined {
  const config = loadConfig();
  return config.models[provider]?.api_key;
}

/**
 * Set the API key for a model provider.
 */
export function setApiKey(provider: string, apiKey: string, baseUrl?: string): void {
  const config = loadConfig();
  config.models[provider] = {
    api_key: apiKey,
    ...(baseUrl ? { base_url: baseUrl } : {}),
  };
  saveConfig(config);
}

/**
 * Get the base URL for a model provider.
 */
export function getBaseUrl(provider: string): string | undefined {
  const config = loadConfig();
  return config.models[provider]?.base_url;
}

/**
 * Get the default model ID.
 */
export function getDefaultModel(): string {
  const config = loadConfig();
  return config.default_model ?? 'ollama/llama3.2';
}

/**
 * Set the default model ID.
 */
export function setDefaultModel(modelId: string): void {
  const config = loadConfig();
  config.default_model = modelId;
  saveConfig(config);
}

/**
 * Get the registry URL.
 */
export function getRegistryUrl(): string {
  const config = loadConfig();
  return config.registry_url;
}

/**
 * Get all configured registries for priority-based fallback resolution.
 */
export function getRegistries(): string[] {
  const config = loadConfig();
  if (config.registries && config.registries.length > 0) {
    return config.registries;
  }
  return [config.registry_url || 'http://localhost:3000', 'https://registry.skillspace.ai'];
}

/**
 * List all configured model providers.
 */
export function listConfiguredModels(): Array<{ provider: string; hasKey: boolean; baseUrl?: string }> {
  const config = loadConfig();
  return Object.entries(config.models).map(([provider, conf]) => ({
    provider,
    hasKey: !!conf.api_key,
    baseUrl: conf.base_url,
  }));
}

// ---------------------------------------------------------------------------
// Credentials (JWT token)
// ---------------------------------------------------------------------------

/**
 * Store auth token in ~/.skillspace/credentials
 */
export function saveCredentials(token: string): void {
  ensureSkillspaceDir();
  fs.writeFileSync(CREDENTIALS_FILE, token, 'utf-8');
}

/**
 * Load auth token from ~/.skillspace/credentials
 */
export function loadCredentials(): string | undefined {
  try {
    return fs.readFileSync(CREDENTIALS_FILE, 'utf-8').trim();
  } catch {
    return undefined;
  }
}

/**
 * Clear stored credentials.
 */
export function clearCredentials(): void {
  try {
    fs.unlinkSync(CREDENTIALS_FILE);
  } catch {
    // ignore if file doesn't exist
  }
}

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

export function getSkillspacePath(): string {
  return SKILLSPACE_DIR;
}

export function getRegistryPath(): string {
  return REGISTRY_DIR;
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
