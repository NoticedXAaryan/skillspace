import { z } from 'zod'
import { PersonaRefSchema, SCHEMA_VERSION } from './persona.schema.js'

/**
 * SubAgentRefSchema — a node in the agent orchestration graph.
 *
 * Each entry defines a sub-agent to delegate work to AND the semantics
 * of that delegation (execution order, failure handling, input mapping).
 * A flat string array is NOT sufficient; the orchestrator in packages/runtime
 * needs these fields to build an executable dependency graph.
 */
export const SubAgentRefSchema = z.object({
  /**
   * Registry reference to the agent to delegate to.
   * Example: "@skillspace/ui-upgrader"
   */
  agent: z.string(),

  /**
   * Human-readable role label used internally for depends_on references and logging.
   * Must be unique within this agent's sub_agents list.
   * Examples: "frontend", "backend", "reviewer", "qa"
   */
  role: z.string(),

  /**
   * Execution strategy for this sub-agent relative to its siblings.
   *
   * - "parallel"   : Start immediately alongside all other parallel agents.
   * - "sequential" : Wait for all agents in depends_on to complete first.
   * - "on_event"   : Start only when a named event is emitted (future: event bus).
   */
  execution: z.enum(['parallel', 'sequential', 'on_event']).default('sequential'),

  /**
   * List of role names this agent must wait for before starting.
   * Only meaningful when execution is "sequential" or "on_event".
   * References must match the `role` field of other sub_agents entries.
   */
  depends_on: z.array(z.string()).optional(),

  /**
   * Milliseconds before this sub-agent is considered timed out.
   * The parent agent's on_failure policy determines what happens next.
   */
  timeout_ms: z.number().int().positive().default(30_000),

  /**
   * What the parent orchestrator does if this sub-agent fails or times out.
   *
   * - "abort"    : Cancel all pending sub-agents and fail the parent task.
   * - "continue" : Log the failure and continue with remaining sub-agents.
   * - "retry"    : Retry up to retry_count times before applying abort/continue.
   */
  on_failure: z.enum(['abort', 'continue', 'retry']).default('abort'),

  /**
   * Number of automatic retry attempts when on_failure is "retry".
   * Capped at 5 to prevent runaway API costs.
   */
  retry_count: z.number().int().min(0).max(5).default(0),

  /**
   * Maps keys from the parent agent's output context into this sub-agent's input.
   * Allows passing results from one sub-agent to another without manual wiring.
   *
   * Example: { "target_url": "context.repo.url" }
   * Meaning: This sub-agent's "target_url" input = parent context's "repo.url" output.
   */
  input_mapping: z.record(z.string()).optional(),
})

export type SubAgentRef = z.infer<typeof SubAgentRefSchema>

/**
 * MCPRefSchema — a reference to a Model Context Protocol server.
 * The runtime will start or connect to this MCP server at agent boot.
 */
export const MCPRefSchema = z.object({
  /**
   * Registry or npm package name of the MCP server.
   * Examples: "@skillspace/mcp-github", "@modelcontextprotocol/server-filesystem"
   */
  name: z.string(),

  /**
   * Transport protocol.
   * - "stdio" : The MCP server runs as a local child process. Most common.
   * - "sse"   : The MCP server is a remote HTTP SSE endpoint.
   */
  transport: z.enum(['stdio', 'sse']).default('stdio'),

  /**
   * Optional configuration object passed to the MCP server at startup.
   * Values are provider-specific (e.g. { "token": "$GITHUB_TOKEN" }).
   * Values starting with "$" are resolved from environment variables.
   */
  config: z.record(z.unknown()).optional(),
})

export type MCPRef = z.infer<typeof MCPRefSchema>

/**
 * AgentSchema v2 — a Task Executor.
 *
 * Formula: Agent = Persona + MCPs + Memory + Orchestration (sub_agents)
 *
 * An agent accepts a task, uses its tools (from MCPs) to complete it,
 * and can delegate sub-tasks to other agents. It always has a Persona
 * because every AI interaction has an implicit behavioral context;
 * SkillSpace makes that context explicit and portable.
 */
export const AgentSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  name: z
    .string()
    .regex(/^@[\w-]+\/[\w-]+$/, 'Must be a scoped package name: @scope/name'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+/, 'Must be valid semver'),
  description: z.string().optional(),
  author: z.string().optional(),
  license: z.string().default('MIT'),
  tags: z.array(z.string()).default([]),

  /**
   * REQUIRED. Every agent has a persona — either inline or a ref to a published Skill.
   * This is what separates a SkillSpace Agent from a raw LLM API call.
   *
   * Use a ref when you want a community-reviewed persona:
   *   { "ref": "@skillspace/senior-engineer" }
   *
   * Use inline for agent-specific personality:
   *   { "system_prompt": "You are a focused refactoring agent...", ... }
   */
  persona: PersonaRefSchema,

  /**
   * MCP servers this agent is authorized to call.
   * Each entry will be started or connected to at agent boot by the MCP runtime.
   */
  mcps: z.array(MCPRefSchema).default([]),

  /**
   * Memory configuration. When enabled, the agent maintains a persistent
   * conversation/task history across calls, stored in the specified backend.
   */
  memory: z
    .object({
      enabled: z.boolean().default(false),
      backend: z.enum(['sqlite', 'postgres', 'in-memory']).default('in-memory'),
      /**
       * Time-to-live in hours for memory entries. Omit for indefinite retention.
       */
      ttl_hours: z.number().positive().optional(),
    })
    .default({ enabled: false, backend: 'in-memory' }),

  /**
   * Declared permission scopes. Enforced at runtime by packages/runtime/src/permissions.ts.
   * Agents without the required permission for an MCP tool call will be rejected.
   * Examples: ["read:files", "write:github", "web:search"]
   */
  permissions: z.array(z.string()).default([]),

  /**
   * Sub-agent orchestration graph.
   * Each entry is a node in a dependency graph that the orchestrator resolves
   * before executing. Parallel agents are started simultaneously; sequential
   * agents wait for their depends_on list.
   *
   * The orchestrator in packages/runtime/src/agent-orchestrator.ts reads this.
   */
  sub_agents: z.array(SubAgentRefSchema).default([]),
})

export type Agent = z.infer<typeof AgentSchema>
