# Architecture

**Status:** Accurate as of 2026-06-17 · Read alongside `docs/IMPLEMENTATION_PLAN.md`

This document describes how SkillSpace is built today and where it is heading.
For "what to build next," see the implementation plan.

---

## Monorepo layout

SkillSpace is a pnpm + Turborepo monorepo. Four layers, each with a single
responsibility.

```
skillspace/
├── apps/
│   ├── registry/      # Next.js 15 web app — the index + dashboard
│   ├── cli/           # The `skillspace` CLI binary
│   └── vscode/        # VSCode extension (YAML validation via LSP)
├── packages/
│   ├── schema/        # Zod schemas — the contract for what a package is
│   ├── runtime/       # Execution engine — model adapters, firewall, orchestrator
│   ├── database/      # Prisma schema + migrations (shared)
│   ├── sdk-ts/        # TypeScript SDK for skill authors
│   ├── sdk-python/    # Python SDK (early)
│   ├── lsp/           # Language server for skill.yaml / agent.yaml
│   ├── memory-mcp/    # SQLite-backed memory MCP server
│   ├── config-eslint/ # Shared ESLint config
│   └── config-typescript/ # Shared tsconfig
├── examples/          # 10 reference skills (v2 schema)
├── scripts/           # seed-registry.ts and other tooling
└── docs/              # This documentation
```

### Build order (enforced by Turborepo)

```
schema  →  runtime  →  { cli, registry, sdk-ts, lsp }   (parallel)
```

`schema` is the leaf dependency. `runtime` depends on `schema`. Everything else
depends on one or both.

---

## The four layers

### 1. Schema (`packages/schema`)

Zod definitions that are the **single source of truth** for what a valid package
looks like. Imported by both the runtime and the registry.

- `PersonaSchema` — system_prompt, tone, behavioral_guidelines, greeting,
  preferred_model, capabilities. The behavioral blueprint.
- `SkillSchema` (v2) — `schemaVersion: 2`, scoped name (`@scope/name`), semver
  version, a `Persona`. Stateless. No tools, no memory.
- `AgentSchema` (v2) — a `Persona` (inline or ref) + `mcps[]` + `memory` +
  `sub_agents[]` orchestration graph.
- `WorkflowSchema`, `LockFileSchema`, `ManifestSchema` — supporting definitions.

**Key export surface:** `validateSkill`, `validateAgent`, `isLegacyV1Skill`,
plus all the Zod schemas and inferred types.

### 2. Runtime (`packages/runtime`)

The execution engine. Model-agnostic. Given a Skill or Agent definition, it runs
it against any supported provider.

Major subsystems:
- **Model Adapter Layer (MAL)** — one adapter per provider (Anthropic, OpenAI,
  Google, Ollama). Each translates a model-agnostic request into a
  provider-specific API call.
- **Model Resolver** — priority chain: CLI flag → persona.preferred_model → user
  config → system default (`anthropic/claude-haiku-4-5`).
- **Persona Firewall** — 8 regex rules scanning for prompt injection at publish
  time and session start. Returns `SAFE` / `WARNING` / `BLOCKED`.
- **Agent Orchestrator** — resolves the `sub_agents[]` list into execution waves
  (parallel/sequential), handles `depends_on`, detects cycles.
- **Permission Enforcer** — runtime check of declared permissions against MCP
  tool calls.
- **MCP Manager** — starts/connects to MCP servers (stdio or SSE), exposes their
  tools to agents.
- **Skill Resolver / Skill Cache** — resolve package refs from registry or local
  path, cache downloaded skills.

### 3. Registry (`apps/registry`)

Next.js 15 App Router + Prisma + PostgreSQL. **This is the index, not the
store.** (See the implementation plan for the GitHub-backed storage direction.)

Subsystems:
- **Auth** — BetterAuth: email/password + GitHub OAuth + 2FA. Session cookies
  (browser) and Bearer tokens (CLI) via `getUserFromRequest`.
- **Package API** — CRUD with rate limiting, semver validation, prompt-injection
  scanning at publish.
- **Search** — Postgres `ILIKE` across name + description, filterable by type.
- **Dashboard** — owner-only package management, keys, playground, settings.
- **Storage** — S3-compatible (R2 in prod, MinIO locally). Being supplemented by
  GitHub-backed source (Phase 1 of the plan).

### 4. Distribution — GitHub (in progress)

See `docs/IMPLEMENTATION_PLAN.md` §3 Phase 1. Packages will live in author-owned
GitHub repos; the registry indexes and points at them. The Prisma schema already
has `githubUrl`, `githubPath`, `githubBranch`, `githubCommit` fields.

---

## Data flow: install

```
skillspace install @alice/code-reviewer
  → GET /api/packages/@alice/code-reviewer         (metadata)
  → GET /api/packages/@alice/code-reviewer/1.0.0/download
       → today: reads blob from S3
       → Phase 1: 302 redirect to raw.githubusercontent.com
  → extract to ~/.skillspace/registry/
  → write skillspace.lock
```

## Data flow: publish

```
skillspace publish ./skill.yaml
  → validate against SkillSchema
  → POST /api/packages (multipart: file + metadata)
       → rate limit → auth → schema validate → firewall scan
       → store bytes (S3 today; GitHub ref in Phase 1)
       → upsert Package + create PackageVersion
  → CLI confirms with version + checksum
```

## Data flow: run (v2 Skill)

```
skillspace run @alice/code-reviewer
  → load skill.json
  → SkillSchema.parse
  → startPersonaREPL
       → scanPersona (firewall)
       → resolveModel (priority chain)
       → composeSystemPrompt
       → adapter.complete()  → stream tokens
```

---

## Data model highlights

Full schema in `packages/database/prisma/schema.prisma`. Key models:

- **User** — auth + profile (username, plan, storage quota, github handle)
- **Organization** — scoped package ownership (`@org/name`)
- **Package** — the index entry. Has `githubUrl`/`githubPath`/`githubBranch` for
  the source-of-truth pointer, plus `verified`, `downloads`, `tags`.
- **PackageVersion** — one per published version. Has `manifest` (JSON), `checksum`,
  `storagePath`, `githubCommit`.
- **ExecutionLog** — runtime telemetry (provider, model, duration, tokens, status).
- **Star, Follower, Collection, Review, Discussion** — community features.

The storage-related fields (`storageUsed`, `storageQuota` on User) remain for the
file-upload path. GitHub-backed packages do not consume storage quota.

---

## Deployment

- **Registry:** Vercel (Hobby tier), auto-deploys on push to `master`.
  `BUILD_STANDALONE=true` for optimized output.
- **Database:** Neon serverless Postgres (free tier).
- **Auth:** BetterAuth with `trustHost: true`; base URL resolved from
  `VERCEL` / `BETTER_AUTH_URL` env vars.
- **Storage:** Cloudflare R2 (S3-compatible) for file uploads; GitHub for
  source-backed packages (Phase 1).

See `docs/development.md` for local setup.
