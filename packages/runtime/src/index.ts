// @skillspace/runtime — SkillSpace Runtime (SSR) Core

// Executor
export { Executor, ExecutionError } from './executor.js';
export { AgentExecutor, type AgentRunOptions } from './agent-executor.js';

// Adapters
export type { ModelAdapter, RuntimeConfig } from './adapters/base.js';
export { AdapterRegistry, adapterRegistry } from './adapters/registry.js';
export { ClaudeAdapter } from './adapters/claude.js';
export { OpenAIAdapter } from './adapters/openai.js';
export { GeminiAdapter } from './adapters/gemini.js';
export { OllamaAdapter } from './adapters/ollama.js';

// Cache & Resolver
export { SkillCache } from './cache.js';
export { SkillResolver, SkillNotFoundError, VersionNotFoundError } from './resolver.js';
export { AgentResolver, AgentNotFoundError } from './agent-resolver.js';
export { SessionManager } from './session.js';
export { McpManager, type McpServerConfig } from './mcp.js';
export { WorkflowResolver } from './workflow-resolver.js';
export { WorkflowEngine, type WorkflowRunOptions } from './workflow.js';
export * from './env.js';

// Permissions
export { PermissionEnforcer, PermissionDeniedError } from './permissions.js';

// Config
export {
  loadConfig,
  saveConfig,
  getApiKey,
  setApiKey,
  getBaseUrl,
  getDefaultModel,
  setDefaultModel,
  getRegistryUrl,
  getRegistries,
  listConfiguredModels,
  saveCredentials,
  loadCredentials,
  clearCredentials,
  ensureSkillspaceDir,
  getSkillspacePath,
  getRegistryPath,
  getConfigPath,
} from './config.js';
export type { SkillSpaceConfig } from './config.js';

// Lock file
export {
  readLockFile,
  writeLockFile,
  createEmptyLockFile,
  addSkillToLockFile,
  removeSkillFromLockFile,
} from './lockfile.js';

// Firewall
export {
  type FirewallVerdict,
  type FirewallContext,
  type InjectionFirewall,
} from './firewall/injectionFirewall.js';
