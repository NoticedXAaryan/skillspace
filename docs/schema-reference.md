# Schema Reference

**Status:** Accurate as of 2026-06-17

The authoritative definitions live in `packages/schema/src/*.schema.ts` as Zod
schemas. This document is a human-readable summary. When in doubt, the code wins.

---

## The v2 ontology

Three concepts, strictly separated:

```
Persona  ── embedded in ──▶  Skill   (publishable persona blueprint)
Persona  ── embedded in ──▶  Agent   (executor: persona + tools + memory + sub-agents)
                                │
                                └── calls ──▶  MCP  (tool server)
```

**Invariants:**
- A `Skill` MUST NOT declare `mcps`, `sub_agents`, or `memory`. It is a stateless persona.
- An `Agent` MUST declare a `persona`. There is no personality-less agent.
- An MCP is never addressed directly; the Agent mediates all tool access.

---

## PersonaSchema

The behavioral blueprint. Defines HOW an AI speaks and acts, not what it can do.

| Field | Type | Required | Notes |
|---|---|---|---|
| `system_prompt` | string (min 10) | yes | The core instruction. Injected as the system prompt. |
| `tone` | string | no | Natural-language tone hint. e.g. "Pirate — full dialect". |
| `behavioral_guidelines` | string[] | no (default `[]`) | Ordered hard rules, appended as a numbered list. |
| `greeting` | string | no | First message sent when a REPL session starts. |
| `preferred_model` | string | no | `provider/model-id`. e.g. `anthropic/claude-haiku-4-5`. Treated as a hint. |
| `capabilities` | string[] | no (default `[]`) | Declared intents like `["read:files"]`. Informational; enforced on the Agent. |

---

## SkillSchema (v2)

A publishable Persona Blueprint. Deliberately has no tools, memory, or sub-agents.

| Field | Type | Required | Notes |
|---|---|---|---|
| `schemaVersion` | literal `2` | yes | Must be exactly `2`. |
| `name` | string `@scope/name` | yes | Scoped package name. Regex: `^@[\w-]+\/[\w-]+$` |
| `version` | string | yes | Semver: `MAJOR.MINOR.PATCH...` |
| `description` | string | no | One-line summary. |
| `author` | string | no | |
| `license` | string | no | Default `MIT`. |
| `tags` | string[] | no | Default `[]`. |
| `persona` | PersonaSchema | yes | The behavioral blueprint. |

### Example `skill.yaml`

```yaml
schemaVersion: 2
name: "@skillspace/code-reviewer"
version: "1.0.0"
description: "Reviews a git diff for bugs, performance, and best practices."
author: skillspace
license: MIT
tags: [code-review, quality]
persona:
  system_prompt: |
    You are an expert code reviewer. Analyze the provided git diff and
    suggest improvements. Focus on security, performance, and readability.
  behavioral_guidelines:
    - "Respond in markdown with clear sections"
    - "Rate each finding by severity: critical, high, medium, low"
  capabilities: []
```

### Legacy v1 detection

`isLegacyV1Skill(raw)` returns `true` for old v1 files (missing `schemaVersion`,
or containing `instructions` / `entrypoint`). The CLI uses this to offer
`skillspace migrate`.

---

## AgentSchema (v2)

Formula: **Agent = Persona + MCPs + Memory + Orchestration.**

| Field | Type | Required | Notes |
|---|---|---|---|
| `schemaVersion` | literal `2` | yes | |
| `name` | string `@scope/name` | yes | |
| `version` | string | yes | Semver. |
| `description`, `author`, `license`, `tags` | | no | As in Skill. |
| `persona` | PersonaRef | yes | Either an inline PersonaSchema **or** `{ ref: "@scope/name@version" }`. |
| `mcps` | MCPRef[] | no (default `[]`) | MCP servers the agent may call. |
| `memory` | object | no | `{ enabled, backend: sqlite\|postgres\|in-memory, ttl_hours? }`. |
| `permissions` | string[] | no | e.g. `["read:files", "write:github"]`. Enforced at runtime. |
| `sub_agents` | SubAgentRef[] | no | Orchestration graph. |

### SubAgentRef — orchestration node

| Field | Type | Default | Notes |
|---|---|---|---|
| `agent` | string | — | Registry ref to delegate to. |
| `role` | string | — | Unique label within this agent. e.g. `"frontend"`. |
| `execution` | `parallel` \| `sequential` \| `on_event` | `sequential` | |
| `depends_on` | string[] | — | Role names this agent waits for. |
| `timeout_ms` | int > 0 | `30000` | |
| `on_failure` | `abort` \| `continue` \| `retry` | `abort` | |
| `retry_count` | int 0–5 | `0` | Used when `on_failure: retry`. |
| `input_mapping` | record | — | `{ inputKey: "context.<role>.<outputKey>" }`. |

### MCPRef

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | — | Registry or npm name. |
| `transport` | `stdio` \| `sse` | `stdio` | |
| `config` | record | — | Provider-specific config. `$VAR` values resolve from env. |

---

## Other schemas

- **WorkflowSchema** — multi-step skill orchestration with conditions and output
  passing.
- **LockFileSchema** — `skillspace.lock`, pins installed versions.
- **ManifestSchema** — `.skillpkg` manifest inside an uploaded package.
- **BenchmarkSuiteSchema** — declarative benchmark definitions.

See `packages/schema/src/` for the exact Zod definitions.

---

## Validators

Convenience helpers in `packages/schema`:

```ts
import { validateSkill, validateAgent, isLegacyV1Skill } from '@skillspace/schema';

const skill = validateSkill(rawJson);   // throws ZodError on invalid
const agent = validateAgent(rawJson);
if (isLegacyV1Skill(raw)) { /* offer migrate */ }
```

YAML variants exist for `.yaml` inputs: `validateSkillYaml`, `validateAgentYaml`.
