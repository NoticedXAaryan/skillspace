# SkillSpace Technical Audit

**Repo:** github.com/NoticedXAaryan/skillspace | **Branch:** master | **Build:** 8/8 tasks, 79/79 tests passing

## Executive Summary

SkillSpace = npm for AI capabilities. Monorepo (pnpm + Turborepo) with registry, runtime, CLI, and VSCode extension. ~65% production-ready. Schema/runtime layers are solid; registry and CLI are feature-rich but need testing polish and deployment config.

**Stats:** 9 packages/apps, 24 Prisma models (424 lines), 21 CLI commands, 27+ registry pages, 4 model adapters, ~27k LoC.

---

## Architecture

**Dependency graph:** `schema` (leaf) → `runtime` (depends on schema) → `cli`, `registry`, `sdk-ts` (depend on both). Standalone: `database`, `lsp`, `memory-mcp`, `config-*`, `vscode`.

**Toolchain:** pnpm 10.11, Turborepo 2.9, TypeScript 5.7, Vitest 3.2, Prettier 3.3.

**Build order:** schema → runtime → (cli, registry, sdk-ts, lsp parallel)

---

## Packages

### packages/schema (95% — complete)
11 Zod schema files. Key exports:
- **PersonaSchema**: system_prompt, tone, behavioral_guidelines, greeting, preferred_model, capabilities
- **SkillSchema**: schemaVersion=2, name (@scope/name), version (semver), persona
- **AgentSchema**: persona (inline or ref), mcps[], memory{}, permissions[], sub_agents[] (DAG orchestration with depends_on, execution order, timeout, on_failure, input_mapping)
- **WorkflowSchema**, **LockFileSchema**, **ManifestSchema**, **BenchmarkSuiteSchema**, **ChatMessage** types
- Validators: validateSkill(), validateAgent(), YAML validators, isLegacyV1Skill()
- Missing: tests for agent/workflow/lockfile/manifest schemas

### packages/runtime (85% — core engine)
22 source files, 12 test files (74 tests). Key components:
- **Executor** (v1 legacy): resolve → permissions → model → firewall → adapter → API → response (uses `any` types for v1/v2 compat)
- **REPL Executor** (v2): scanPersona → resolveModel → composeSystemPrompt → readline loop
- **Agent Executor** (v2): resolve persona → resolve MCPs → buildExecutionPlan → execute waves
- **Model Adapter Layer**: ModelAdapter interface with 4 implementations (Claude/OpenAI/Gemini/Ollama). Each builds provider-specific API requests from model-agnostic skill definitions
- **Agent Orchestrator**: DAG resolver — builds execution waves from sub_agents[], handles parallel/sequential, dependency ordering, circular detection, input_mapping
- **Persona Firewall**: 8 regex rules (critical/high/medium/low) scanning for prompt injection. Returns SAFE/WARNING/BLOCKED
- **PermissionEnforcer**: Runtime enforcement of declared permissions (filesystem.read/write, network.fetch, tools.*)
- **Model Resolution Chain**: CLI flag > persona.preferred_model > user config > system default (claude-haiku-4-5)
- **Other**: SkillCache, SkillResolver, AgentResolver, WorkflowResolver, WorkflowEngine, McpManager, FileSystemSandbox, TelemetryClient, SessionManager

### packages/database (90%)
24 Prisma models: User, Session, Account, TwoFactor, Verification, UserSettings, UserOnboarding, Organization, OrgMember, Package, PackageVersion, ExecutionLog, BenchmarkScore, RateLimit, Invite, PackageAllowlist, AccessPolicy, PlaygroundSession, Star, Follower, Collection, Review, Discussion, SkillRequest, ShowcaseProject, RoadmapItem. Only 1 migration exists (needs prisma migrate dev).

### packages/sdk-ts (30% — placeholder)
Only defineSkill() and SkillSpaceClient stub. Needs real implementation.

### packages/lsp (90%)
YAML validation LSP for skill.yaml/agent.yaml. Used by VSCode extension.

### packages/memory-mcp (80%)
SQLite FTS5 MCP server with save_memory/search_memories tools. Keyword-only search (no semantic).

### packages/config-typescript, config-eslint (complete)
Shared TS config (base/nextjs/react) + ESLint flat config.

---

## Applications

### apps/cli — @skillspace/cli (80%)
21 commands: init, install, uninstall, run, search, info, list, publish, login, whoami, model (add/test/list), agent (status/kill), mcp (inspect/install/list), workflow (run/list), org (create/invite/join), env, benchmark, config, help, migrate, export.
Binary: `skillspace`. Uses commander + @clack/prompts. 3 E2E tests. Needs: per-command tests, --json flag.

### apps/registry — @skillspace/registry (70%)
Next.js 15 App Router + Tailwind + Prisma + BetterAuth. 27+ pages (landing, packages, search, create, login, register, profile, dashboard, playground, docs, collections, trending, examples, analytics, organization, etc). 12+ API routes (packages CRUD with rate limiting, auth, search, analytics, benchmarks, playground, orgs, health).
- **Auth**: BetterAuth — email/password + GitHub OAuth + 2FA. Session cookies (browser) + Bearer tokens (CLI). Config issue: useSecureCookies=false + sameSite="none".
- **Storage**: S3-compatible (MinIO local, R2 production). 50MB limit, 10GB/user quota.
- **Security**: Rate limits (100/min read, 15/min publish), SHA-256 checksums, prompt injection scanning, org membership checks.
- **Issues**: Some pages may use new PrismaClient() directly. No sitemap/OG images.

### apps/vscode (90%)
VSCode extension connecting to LSP for skill.yaml/agent.yaml validation.

---

## Data Flows

**Install:** CLI → GET /api/packages/:name → GET .../download → extract to ~/.skillspace/registry/ → write skillspace.lock
**Execute (v2 Skill):** CLI → load skill.json → SkillSchema.parse → startPersonaREPL → scanPersona → resolveModel → composeSystemPrompt → adapter.complete() → stream
**Publish:** CLI → validate skill.yaml → createSkillPackage (.skillpkg) → POST /api/packages (multipart) → rate limit → auth → metadata parse → scanPersona → S3 upload → DB upsert
**Agent:** CLI → AgentSchema.parse → resolve persona/MCPs → buildExecutionPlan (DAG) → execute waves → aggregate results

---

## Critical Issues

1. **Auth config** — useSecureCookies=false + sameSite="none" breaks in production HTTPS
2. **Missing migrations** — 1 migration for 24 models (run prisma migrate dev)
3. **Executor any-types** — v1/v2 compat hack needs proper typing
4. **SDK placeholder** — No real implementation
5. **No CI/CD** — No GitHub Actions, only Cloud Build config
6. **Example skills v1** — Need conversion to v2 persona format
7. **No e2e tests** — Only unit tests exist

## Deployment Options

**Vercel (recommended):** Deploy registry. Needs DATABASE_URL (Neon), BETTER_AUTH_SECRET, R2 storage. Prisma generate at build. Standalone output via BUILD_STANDALONE=true.
**Docker:** docker-compose.yml with app + PostgreSQL 15 + MinIO. Multi-stage Dockerfile.
**CLI:** tsc or Bun compile to single binary. Targets: macOS arm64/x64, Linux x64.

## Next Sprint Priorities

1. **Ship to Vercel (1-2d):** prisma migrate dev → deploy → Neon PostgreSQL → R2 → test e2e
2. **CLI polish (2-3d):** --json flag, command tests, wire v2 REPL executor, cross-model testing
3. **Content (1-2d):** Convert 10 examples to v2, write docs, seed registry, test user journey
4. **Production hardening (3-5d):** GitHub Actions CI, error boundary, sitemap/OG, auth review, Playwright e2e
