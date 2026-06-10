// @skillspace/schema — Shared types and validators

// v2 Schemas
export { PersonaSchema, PersonaRefSchema, SCHEMA_VERSION } from './persona.schema.js';
export { SkillSchema, isLegacyV1Skill } from './skill.schema.js';
export { AgentSchema, SubAgentRefSchema, MCPRefSchema } from './agent.schema.js';

// Other Schemas
export { LockFileSchema } from './lockfile.schema.js';
export { ManifestSchema } from './manifest.schema.js';
export { WorkflowSchema } from './workflow.schema.js';
export { BenchmarkSuiteSchema, validateBenchmark } from './benchmark.schema.js';
export {
  ToolSchema,
  ToolParameterSchema,
  ChatMessageSchema,
  SystemMessageSchema,
  UserMessageSchema,
  AssistantMessageSchema,
  ToolCallSchema,
  ToolResultMessageSchema,
  ChatHistorySchema
} from './chat.schema.js';

// Validators
export {
  validateSkill,
  validateAgent,
  validateLockFile,
  validateManifest,
  validateSkillYaml,
  validateAgentYaml,
  validateLockFileYaml,
  validateWorkflow,
  validateWorkflowYaml,
} from './validators.js';

// Types
export type {
  Persona,
  PersonaRef,
  Skill,
  Agent,
  SubAgentRef,
  MCPRef,
  Workflow,
  LockFile,
  Manifest,
  PackageType,
  SkillConfig,
  ExecutionResult,
  ModelRequest,
  RunOptions,
  ApiResponse,
  ApiError,
  Tool,
  ToolCall,
  ChatMessage,
  SystemMessage,
  UserMessage,
  AssistantMessage,
  ToolResultMessage,
} from './types.js';
