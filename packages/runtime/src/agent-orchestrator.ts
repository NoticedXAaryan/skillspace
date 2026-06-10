import type { SubAgentRef } from '@skillspace/schema'

export interface OrchestratorContext {
  /** Key/value store of outputs from completed agents, keyed by role. */
  outputs: Record<string, unknown>
}

/**
 * buildExecutionPlan — resolves a sub_agents list into an ordered execution plan.
 *
 * Returns execution waves: each wave is a group of agents that can run in parallel.
 * Sequential agents that depend on prior waves appear in later waves.
 *
 * Example input:
 *   [
 *     { role: "backend",  execution: "parallel" },
 *     { role: "frontend", execution: "sequential", depends_on: ["backend"] },
 *     { role: "qa",       execution: "sequential", depends_on: ["frontend"] },
 *   ]
 *
 * Example output (waves):
 *   Wave 0: [backend]
 *   Wave 1: [frontend]
 *   Wave 2: [qa]
 */
export function buildExecutionPlan(subAgents: SubAgentRef[]): SubAgentRef[][] {
  const waves: SubAgentRef[][] = []
  const completed = new Set<string>()

  // Parallel agents always go in wave 0
  const parallelAgents = subAgents.filter(a => a.execution === 'parallel')
  if (parallelAgents.length > 0) {
    waves.push(parallelAgents)
    parallelAgents.forEach(a => completed.add(a.role))
  }

  // Resolve sequential agents in dependency order
  const remaining = subAgents.filter(a => a.execution !== 'parallel')
  let safety = 0

  while (remaining.length > 0) {
    if (safety++ > 100) {
      throw new Error('Circular dependency detected in sub_agents graph')
    }

    const ready = remaining.filter(a =>
      !a.depends_on || a.depends_on.every(dep => completed.has(dep))
    )

    if (ready.length === 0 && remaining.length > 0) {
      const unresolved = remaining.map(a => a.role).join(', ')
      throw new Error(
        `Sub-agent dependency deadlock. Unresolved agents: [${unresolved}]\n` +
        `Check depends_on references for typos or circular dependencies.`
      )
    }

    waves.push(ready)
    ready.forEach(a => {
      completed.add(a.role)
      remaining.splice(remaining.indexOf(a), 1)
    })
  }

  return waves
}

/**
 * applyInputMapping — resolves input_mapping references against the current context.
 *
 * Mapping syntax: "context.role.outputKey"
 * Example: { "repo_url": "context.backend.repo_url" }
 *          → looks up context.outputs["backend"]["repo_url"]
 */
export function applyInputMapping(
  mapping: Record<string, string>,
  context: OrchestratorContext,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}

  for (const [inputKey, contextPath] of Object.entries(mapping)) {
    const parts = contextPath.split('.')
    // Expected format: context.<role>.<outputKey>
    if (parts[0] !== 'context' || parts.length < 3) {
      throw new Error(
        `Invalid input_mapping path "${contextPath}". ` +
        `Use format: "context.<role>.<outputKey>"`
      )
    }

    const [, role, ...outputKeyParts] = parts
    const outputKey = outputKeyParts.join('.')
    const roleOutput = context.outputs[role] as Record<string, unknown> | undefined

    if (!roleOutput) {
      throw new Error(
        `input_mapping references role "${role}" but that role has no output in context yet. ` +
        `Check depends_on ordering.`
      )
    }

    resolved[inputKey] = roleOutput[outputKey]
  }

  return resolved
}
