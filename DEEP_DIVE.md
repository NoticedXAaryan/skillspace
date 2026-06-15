# SkillSpace — Complete Project Deep Dive

**Last Updated:** 2026-06-14  
**Total Source Files:** ~156 | **Total Lines:** ~33,000+  
**Monorepo:** pnpm workspaces + Turborepo | **Apps:** 3 | **Packages:** 9

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Apps](#3-apps)
   - 3.1 [CLI (`apps/cli`)](#31-cli-appscli)
   - 3.2 [Registry Web App (`apps/registry`)](#32-registry-web-app-appsregistry)
   - 3.3 [VSCode Extension (`apps/vscode`)](#33-vscode-extension-appsvscode)
4. [Packages](#4-packages)
   - 4.1 [Runtime (`packages/runtime`)](#41-runtime-packagesruntime)
   - 4.2 [Schema (`packages/schema`)](#42-schema-packagesschema)
   - 4.3 [Database (`packages/database`)](#43-database-packagesdatabase)
   - 4.4 [TypeScript SDK (`packages/sdk-ts`)](#44-typescript-sdk-packagessdk-ts)
   - 4.5 [Python SDK (`packages/sdk-python`)](#45-python-sdk-packagessdk-python)
   - 4.6 [LSP (`packages/lsp`)](#46-lsp-packageslsp)
   - 4.7 [Memory MCP (`packages/memory-mcp`)](#47-memory-mcp-packagesmemory-mcp)
   - 4.8 [Shared Configs](#48-shared-configs)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [CLI Commands](#7-cli-commands)
8. [Runtime Architecture](#8-runtime-architecture)
9. [Test Coverage](#9-test-coverage)
10. [Documentation](#10-documentation)
11. [Configuration & Deployment](#11-configuration--deployment)
12. [Examples](#12-examples)
13. [Known Issues & Technical Debt](#13-known-issues--technical-debt)
14. [File Inventory](#14-file-inventory)

---

## 1. Project Overview

**SkillSpace** is "The Universal Runtime & Registry for AI Capabilities" — essentially **npm for AI prompts, agents, and workflows**.

**Core problems solved:**
1. **Prompt Drift** — AI prompts scattered across Notion, Slack, personal files with no versioning
2. **Platform Lock-In** — A Claude prompt doesn't work on GPT-4 without rewriting
3. **Discoverability** — No way to discover and share AI capabilities across teams

**Success metric:** `skillspace install security-review` works in < 60 seconds.

**Tech Stack:**

| Layer | Technology |
|---|---|
| Monorepo | pnpm 10.11 + Turborepo 2.9 |
| Language | TypeScript 5.7 (strict, ESM) |
| Frontend | Next.js 15 App Router + React 19 + Tailwind 3.4 |
| UI Components | shadcn/ui + Radix UI + Framer Motion + Recharts |
| Backend | Next.js API routes |
| Database | PostgreSQL 15 (Neon) via Prisma 6.9 |
| Auth | BetterAuth (email/password + GitHub OAuth + 2FA) |
| Storage | S3-compatible (MinIO local, Cloudflare R2 prod) |
| CLI | Commander.js + @clack/prompts + chalk |
| Runtime | Custom SSR with Model Adapter Layer |
| AI Models | Anthropic Claude, OpenAI, Google Gemini, Ollama (4 adapters) |
| MCP | @modelcontextprotocol/sdk |
| LSP | vscode-languageserver |
| Memory | SQLite FTS5 via better-sqlite3 |
| Validation | Zod 3.23 |
| Testing | Vitest 3.2 |
| Deployment | Docker + Google Cloud Build + Cloud Run + Vercel |

---

## 2. Monorepo Structure

```
skillspace/
├── apps/
│   ├── cli/                  # @skillspace/cli — CLI binary (Commander.js)
│   ├── registry/             # @skillspace/registry — Next.js web app
│   └── vscode/               # skillspace-vscode — VSCode extension
│
├── packages/
│   ├── schema/               # @skillspace/schema — Zod schemas
│   ├── runtime/              # @skillspace/runtime — Core execution engine
│   ├── database/             # @skillspace/database — Prisma schema + migrations
│   ├── sdk-ts/               # @skillspace/sdk — TypeScript SDK
│   ├── sdk-python/           # skillspace-sdk — Python SDK
│   ├── lsp/                  # @skillspace/lsp — YAML validation LSP
│   ├── memory-mcp/           # @skillspace/memory-mcp — SQLite FTS5 memory server
│   ├── config-typescript/    # Shared TypeScript config
│   └── config-eslint/        # Shared ESLint config
│
├── examples/                 # 10 example skills
├── scripts/                  # Seed data generators
├── docs/                     # Documentation (book + guides)
├── testing-sandbox/          # Test skill YAMLs
├── UI_UX/                    # UI/UX design docs
│
├── package.json              # Workspace root
├── turbo.json                # Turborepo config
├── pnpm-workspace.yaml       # Workspace packages
├── tsconfig.base.json        # Shared TypeScript config
├── docker-compose.yml        # Local dev stack
├── cloudbuild.yaml           # Google Cloud Build
├── prd.md                    # Full PRD (1,422 lines)
├── TASK.MD                   # v2 Technical Blueprint (1,623 lines)
├── TECHNICAL_AUDIT.md        # Technical audit
└── FUTURE_PLAN.md            # Implementation roadmap
```

---

## 3. Apps

### 3.1 CLI (`apps/cli`)

**Package:** `@skillspace/cli` v0.1.0 | **Binary:** `skillspace` | **Entry:** `src/index.ts`

#### Commands (21 total)

| Command | File | Lines | Description |
|---|---|---|---|
| `init` | `commands/init.ts` | 184 | Scaffold skill/agent/MCP project |
| `run` | `commands/run.ts` | 162 | Execute skill (REPL) or agent (task) |
| `install` | `commands/install.ts` | 206 | Install package from registry |
| `uninstall` | `commands/uninstall.ts` | 78 | Remove installed package |
| `publish` | `commands/publish.ts` | 126 | Publish to registry |
| `search` | `commands/search.ts` | 51 | Search registry |
| `list` | `commands/list.ts` | 32 | List installed packages |
| `info` | `commands/info.ts` | 66 | View package details |
| `login` | `commands/login.ts` | 211 | Authenticate (login/register/logout/whoami) |
| `model` | `commands/model.ts` | 207 | Configure AI model providers |
| `config` | `commands/config.ts` | 57 | Manage CLI configuration |
| `benchmark` | `commands/benchmark.ts` | 134 | Run benchmark test suites |
| `agent` | `commands/agent.ts` | 82 | Agent run/install/list |
| `mcp` | `commands/mcp.ts` | 67 | MCP install/list/update |
| `workflow` | `commands/workflow.ts` | 78 | Workflow run/list |
| `org` | `commands/org.ts` | 96 | Org create/invite/join |
| `env` | `commands/environment.ts` | 175 | Env variable management |
| `migrate` | `commands/migrate.ts` | 91 | v1 → v2 skill migration |
| `export` | `commands/export.ts` | 74 | Export skill as pasteable text |
| `link` | `commands/link.ts` | 200 | Link CLI to dashboard |
| `dashboard` | `commands/link.ts` | — | Open dashboard in browser |
| `help` | `commands/help.ts` | 252 | Interactive docs explorer |

#### Utilities

| File | Lines | Purpose |
|---|---|---|
| `utils/api.ts` | 184 | `RegistryClient` HTTP client (register, login, search, publish, etc.) |
| `utils/packager.ts` | 107 | Create/extract `.skillpkg` tar.gz archives with SHA-256 checksums |
| `utils/output.ts` | 74 | Legacy output helpers (table, key-value, section headers) |

#### Terminal UI Design System

| File | Lines | Purpose |
|---|---|---|
| `ui/tokens/colors.ts` | 31 | Color palette (brand, semantic, neutral, special) |
| `ui/tokens/chars.ts` | 38 | Unicode characters (box-drawing, icons, spinner frames) |
| `ui/states/intro.ts` | 20 | Command header with diamond icon |
| `ui/states/outro.ts` | 41 | Footer with duration + version |
| `ui/states/loader.ts` | 23 | Animated spinner with succeed/fail |
| `ui/states/success.ts` | 38 | Three success tiers (minor/standard/critical) |
| `ui/states/error.ts` | 55 | Error display (inline/operational) |
| `ui/states/warning.ts` | 10 | Warning message |
| `ui/layout/box.ts` | 39 | Unicode box renderer |
| `ui/layout/divider.ts` | 7 | Horizontal divider |
| `ui/layout/utils.ts` | 13 | Constants + ANSI strip + label padding |

**Total CLI:** ~23 command files + 3 utils + 9 UI files ≈ **3,100 lines**

---

### 3.2 Registry Web App (`apps/registry`)

**Package:** `@skillspace/registry` v0.1.0 | **Framework:** Next.js 15 App Router

#### Pages (30 routes)

| Route | File | Lines | Type | Description |
|---|---|---|---|---|
| `/` | `app/page.tsx` | 516 | Server | Landing page (hero, features, trending, CTA) |
| `/login` | `app/login/page.tsx` | 117 | Client | Login (email + GitHub OAuth) |
| `/register` | `app/register/page.tsx` | 164 | Client | Registration (strength indicator, 2FA) |
| `/packages` | `app/packages/page.tsx` | 240 | Client | Package browser (search, filter, sort, pagination) |
| `/packages/[name]` | `app/packages/[name]/page.tsx` | 335 | Server | Package detail (README, tabs, metadata) |
| `/packages/[name]/[version]` | `app/packages/[name]/[version]/page.tsx` | 278 | Server | Specific version view |
| `/search` | `app/search/page.tsx` | 44 | Server | Global search |
| `/analytics` | `app/analytics/page.tsx` | 169 | Server | Ecosystem analytics (real Prisma data) |
| `/trending` | `app/trending/page.tsx` | 73 | Server | Trending packages |
| `/showcase` | `app/showcase/page.tsx` | 98 | Server | Community showcase |
| `/roadmap` | `app/roadmap/page.tsx` | 86 | Server | Product roadmap with voting |
| `/contributors` | `app/contributors/page.tsx` | 145 | Server | Contributor leaderboard |
| `/requests` | `app/requests/page.tsx` | 99 | Server | Skill requests/bounties |
| `/hackathons` | `app/hackathons/page.tsx` | 160 | Server | Hackathons & challenges |
| `/collections` | `app/collections/page.tsx` | 70 | Server | Curated collections |
| `/create` | `app/create/page.tsx` | 375 | Client | 6-step package creation wizard |
| `/playground` | `app/playground/page.tsx` | 19 | Server | Public playground |
| `/examples` | `app/examples/page.tsx` | 20 | Server | Example skills |
| `/learn` | `app/learn/page.tsx` | 131 | Server | Documentation (7 sections) |
| `/learn/path/[level]` | `app/learn/path/[level]/page.tsx` | 53 | Server | Learning path |
| `/docs` | `app/docs/layout.tsx` | 16 | Layout | MDX docs (3-column) |
| `/docs/[[...slug]]` | `app/docs/[[...slug]]/page.tsx` | 60 | Dynamic | Dynamic doc pages |
| `/organization` | `app/organization/page.tsx` | 228 | Client | Org management |
| `/profile` | `app/profile/page.tsx` | 210 | Client | User profile |
| `/profile/[username]` | `app/profile/[username]/page.tsx` | 50 | Server | Public profile |
| `/profile/2fa` | `app/profile/2fa/page.tsx` | 50 | Client | 2FA setup |
| `/dashboard` | `app/dashboard/page.tsx` | 113 | Server | Dashboard overview |
| `/dashboard/packages` | `app/dashboard/packages/page.tsx` | 85 | Server | User's packages |
| `/dashboard/playground` | `app/dashboard/playground/page.tsx` | 31 | Server | Dashboard playground |
| `/dashboard/activity` | `app/dashboard/activity/page.tsx` | 30 | Server | CLI activity feed |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | 23 | Server | Account settings |
| `/dashboard/keys` | `app/dashboard/keys/page.tsx` | 31 | Server | API key management |

#### API Routes (18 endpoints)

| Endpoint | Methods | Lines | Description |
|---|---|---|---|
| `/api/auth/[...all]` | GET, POST | 4 | BetterAuth catch-all |
| `/api/packages` | GET, POST | 249 | List/publish packages |
| `/api/packages/[name]` | GET | 65 | Package detail + download increment |
| `/api/packages/[name]/versions` | GET | 23 | Version list |
| `/api/packages/[name]/[version]/download` | GET | 49 | Download package binary |
| `/api/packages/link-github` | POST | 88 | Link GitHub repo to package |
| `/api/search` | GET | 57 | Full-text search |
| `/api/profile` | GET | 40 | User profile |
| `/api/settings` | GET, PUT | 76 | User settings (API keys) |
| `/api/playground/run` | POST | 128 | Execute skill in playground (SSE) |
| `/api/telemetry` | POST | 54 | CLI telemetry ingestion |
| `/api/analytics` | GET, POST | 82 | Execution logs |
| `/api/health` | GET | 5 | Health check |
| `/api/benchmarks` | POST | 65 | Benchmark score storage |
| `/api/orgs` | GET, POST | 80 | Organization CRUD |
| `/api/orgs/[slug]/members` | GET, POST | 93 | Member management |
| `/api/orgs/[slug]/invites` | POST | 43 | Generate invite tokens |
| `/api/orgs/invites/accept` | POST | 49 | Accept invite |
| `/api/onboarding` | GET, POST | 49 | Onboarding state |
| `/api/v1/users` | GET | 50 | Public user search |
| `/api/v1/packages` | GET | 52 | Public package search |

#### Components (16+ files)

| Component | Lines | Description |
|---|---|---|
| `Navbar.tsx` | 304 | Full nav with mega menus, search dock, auth |
| `CommandPalette.tsx` | 157 | Cmd+K palette with trending, nav, CLI commands |
| `AnimatedTerminal.tsx` | 102 | Framer-motion terminal typing demo |
| `PackageCard.tsx` | 108 | Package display card with hover animation |
| `ActivationWidget.tsx` | 123 | Onboarding progress widget |
| `OnboardingModal.tsx` | 194 | 6-step onboarding dialog |
| `Footer.tsx` | 46 | 4-column footer |
| `EmptyState.tsx` | 34 | Reusable empty state |
| `CodeBlock.tsx` | 38 | Syntax highlighting (Shiki) |
| `CodeBlockClient.tsx` | 73 | Code block with copy/run buttons |
| `InstallCard.tsx` | 42 | Quick install command card |
| `VersionPicker.tsx` | 76 | Dropdown version picker |
| `TableOfContents.tsx` | 77 | Sticky sidebar ToC |
| `ArchitectureDiagram.tsx` | 62 | Animated architecture diagrams |
| `dashboard/Sidebar.tsx` | 80 | Dashboard sidebar (6 nav items) |
| `dashboard/ActivityFeedClient.tsx` | 115 | Real-time execution history |

#### UI Component Library (shadcn/ui — 30+ components)

`button`, `card`, `badge`, `input`, `label`, `textarea`, `select`, `dialog`, `dropdown-menu`, `sheet`, `command`, `navigation-menu`, `accordion`, `not-found`, `ai-chat`, `expanding-search-dock`, `hero-odyssey`, `package-type`, `bento-grid`, `typewriter-effect`, `sparkles`, `container-scroll-animation`, `floating-dock`, `lamp`, `pixel-trail`, `gooey-filter`, `orbiting-avatars`, `animated-terminal`, `features-8`, `leaderboard-card`, `leaderboard-podium`, `leaderboard-rankings`, `assisted-password-confirmation`

#### Utilities

| File | Lines | Purpose |
|---|---|---|
| `lib/auth.ts` | 79 | BetterAuth config + `getUserFromRequest()` |
| `lib/auth-client.ts` | 9 | BetterAuth React client |
| `lib/prisma.ts` | 6 | Singleton Prisma client |
| `lib/utils.ts` | 6 | `cn()` (clsx + tailwind-merge) |
| `lib/storage.ts` | 54 | S3/MinIO storage (store, check, read) |
| `lib/github.ts` | 135 | GitHub API (parse URL, fetch file, verify repo) |
| `lib/rate-limit.ts` | 56 | In-memory rate limiting |
| `lib/api-response.ts` | 21 | Standardized API responses |
| `lib/invites.ts` | 37 | Org invite management |
| `hooks/use-debounced-dimensions.ts` | 40 | Element dimension tracking |
| `hooks/use-screen-size.ts` | 77 | Responsive screen size hook |

**Total Registry:** ~30 pages + 18 APIs + 16 components + 30 UI + 11 utils ≈ **8,500 lines**

---

### 3.3 VSCode Extension (`apps/vscode`)

**Package:** `skillspace-vscode` v0.1.0 | **Entry:** `src/extension.ts` (59 lines)

Activates LSP client for `skill.yaml` and `agent.yaml` files. Connects to `packages/lsp/dist/server.js` via IPC transport. Supports debug mode with inspect port 6009.

---

## 4. Packages

### 4.1 Runtime (`packages/runtime`)

**Package:** `@skillspace/runtime` v0.1.0 | **29 source files** | **~3,738 lines**

The core execution engine. Everything wraps this.

#### Core Executors

| File | Lines | Purpose |
|---|---|---|
| `executor.ts` | 535 | v1 skill execution pipeline (resolve → permissions → adapter → API → response) |
| `agent-executor.ts` | 338 | Agent execution with tool-use loops (max 10 steps) |
| `repl-executor.ts` | 304 | Interactive REPL for v2 personas (readline-based chat) |
| `agent-orchestrator.ts` | 106 | Sub-agent DAG execution (parallel waves, dependency resolution) |

#### Model Adapters

| File | Lines | Provider | API |
|---|---|---|---|
| `adapters/base.ts` | 63 | Interface | `ModelAdapter` interface + `RuntimeConfig` |
| `adapters/registry.ts` | 88 | All | Adapter registry singleton |
| `adapters/claude.ts` | 81 | Anthropic | `POST /v1/messages` (SSE streaming) |
| `adapters/openai.ts` | 108 | OpenAI | `POST /v1/chat/completions` (tool calling) |
| `adapters/gemini.ts` | 87 | Google | `POST /v1beta/models/{id}:generateContent` |
| `adapters/ollama.ts` | 97 | Local | `POST /api/chat` at localhost:11434 |

#### Security

| File | Lines | Purpose |
|---|---|---|
| `firewall/persona-firewall.ts` | 129 | 8-rule regex injection detection (critical/high/medium/low) |
| `firewall/injectionFirewall.ts` | 15 | Firewall interface definitions |
| `firewall/LocalModelScreener.ts` | 91 | Local LLM-based injection screener (Ollama) |
| `permissions.ts` | 106 | Runtime permission enforcement |
| `sandbox.ts` | 115 | Filesystem + network sandboxing (path traversal, SSRF) |

#### Infrastructure

| File | Lines | Purpose |
|---|---|---|
| `config.ts` | 213 | `~/.skillspace/` config management |
| `cache.ts` | 222 | Local package cache (install, load, list) |
| `resolver.ts` | 127 | v1 skill resolution (semver) |
| `agent-resolver.ts` | 123 | Agent resolution with dependencies |
| `workflow.ts` | 206 | Workflow execution engine (JEXL expressions) |
| `workflow-resolver.ts` | 136 | Tiered workflow resolution (4 tiers) |
| `mcp.ts` | 277 | MCP server management (install, start, call tools) |
| `mcp/McpRegistry.ts` | 149 | MCP connection registry (v1 executor) |
| `env.ts` | 116 | Environment variable store |
| `lockfile.ts` | 111 | Lock file management |
| `session.ts` | 47 | Session persistence |
| `telemetry.ts` | 42 | Fire-and-forget telemetry |
| `model-resolver.ts` | 115 | v2 model resolution chain |
| `index.ts` | 98 | Barrel exports |

---

### 4.2 Schema (`packages/schema`)

**Package:** `@skillspace/schema` v0.1.0 | **11 files** | **~829 lines**

| File | Lines | Exports |
|---|---|---|
| `persona.schema.ts` | 79 | `PersonaSchema`, `PersonaRefSchema`, `SCHEMA_VERSION` (=2) |
| `skill.schema.ts` | 42 | `SkillSchema`, `isLegacyV1Skill()` |
| `agent.schema.ts` | 177 | `AgentSchema`, `SubAgentRefSchema`, `MCPRefSchema` |
| `workflow.schema.ts` | 60 | `WorkflowSchema`, `ActionStepSchema`, `ParallelStepSchema` |
| `lockfile.schema.ts` | 56 | `LockFileSchema` |
| `manifest.schema.ts` | 38 | `ManifestSchema` |
| `benchmark.schema.ts` | 31 | `BenchmarkSuiteSchema`, `BenchmarkTestCaseSchema` |
| `chat.schema.ts` | 62 | `ToolSchema`, `ChatMessageSchema`, `ChatHistorySchema` |
| `types.ts` | 101 | TypeScript type definitions |
| `validators.ts` | 140 | Validation functions (JSON + YAML) |
| `index.ts` | 63 | Barrel exports |

---

### 4.3 Database (`packages/database`)

**Package:** `@skillspace/database` | **Prisma 6.9** | **29 models** | **424 lines**

#### Models by Domain

**Auth (5 models):**
- `User` — Core user (email, username, plan, storage quota 10GB, social links)
- `Session` — BetterAuth sessions (token, expiry, IP tracking)
- `Account` — OAuth accounts (GitHub)
- `Verification` — Email verification tokens
- `TwoFactor` — 2FA secrets + backup codes

**User (2 models):**
- `UserSettings` — API keys (OpenAI/Anthropic/Google), Ollama URL, default model
- `UserOnboarding` — 5-step onboarding progress

**Packages (3 models):**
- `Package` — type, name (unique), scope, owner, downloads, verified, GitHub link
- `PackageVersion` — version, manifest, storagePath, checksum, size
- `BenchmarkScore` — suite scores per package/version

**Registry (2 models):**
- `ExecutionLog` — model, duration, tokens, status, error
- `RateLimit` — key-based rate limiting

**Organizations (5 models):**
- `Organization` — slug, name, plan
- `OrgMember` — role (admin/member)
- `Invite` — token with expiry
- `PackageAllowlist` — enterprise approved packages
- `AccessPolicy` — RBAC policies

**Social (6 models):**
- `Star` — Package stars
- `Follower` — User follow graph (self-referential)
- `Collection` + `CollectionPackage` — Curated package lists
- `Review` — 1-5 rating + comment
- `Discussion` + `DiscussionComment` — Threaded discussions

**Community (5 models):**
- `SkillRequest` — Feature requests with bounty status
- `ShowcaseProject` — Portfolio projects
- `RoadmapItem` + `RoadmapVote` — Product roadmap with voting

**Other (2 models):**
- `PlaygroundSession` — Browser-based skill testing (auto-expire 24h)

---

### 4.4 TypeScript SDK (`packages/sdk-ts`)

**Package:** `@skillspace/sdk` v0.1.0 | **1 file** | **67 lines**

- `defineSkill(config)` — Type-safe skill builder (placeholder)
- `testSkill(skill, input)` — NOT YET IMPLEMENTED
- `SkillSpaceClient` — HTTP client with `packages.search()` and `users.search()`

**Status:** ~30% complete (placeholder)

---

### 4.5 Python SDK (`packages/sdk-python`)

**Package:** `skillspace-sdk` v0.1.0 | **2 files** | **64 lines**

- `SkillSpaceClient` — HTTP client with `httpx`
- Methods: `run_skill()`, `get_package_info()`, `close()`
- Context manager support

**Status:** Minimal implementation

---

### 4.6 LSP (`packages/lsp`)

**Package:** `@skillspace/lsp` v0.1.0 | **1 file** | **143 lines**

VSCode Language Server for `skill.yaml` and `agent.yaml`. Provides real-time YAML validation with Zod schema checking and exact error location reporting via AST node mapping.

---

### 4.7 Memory MCP (`packages/memory-mcp`)

**Package:** `@skillspace/memory-mcp` v0.1.0 | **2 files** | **199 lines**

MCP server providing long-term memory storage via stdio transport.

- **Tools:** `save_memory`, `search_memory`
- **Storage:** SQLite FTS5 at `~/.skillspace/memory.db`
- **Search:** Keyword-based (FTS5 MATCH), falls back to recency

---

### 4.8 Shared Configs

| Package | Files | Purpose |
|---|---|---|
| `config-typescript` | 4 files | Base, React, Next.js TypeScript configs |
| `config-eslint` | 2 files | Shared ESLint flat config |

---

## 5. Database Schema

### ER Diagram Summary

```
User ──┬── Session
       ├── Account
       ├── TwoFactor
       ├── UserSettings
       ├── UserOnboarding
       ├── Package (owner) ──── PackageVersion
       │                 ├── ExecutionLog
       │                 ├── BenchmarkScore
       │                 ├── Star ──── User
       │                 ├── CollectionPackage ──── Collection
       │                 ├── Review ──── User
       │                 └── Discussion ──── DiscussionComment
       ├── Organization ──── OrgMember ──── User
       │                ├── Invite
       │                ├── PackageAllowlist
       │                └── AccessPolicy
       ├── Follower (self-referential)
       ├── SkillRequest
       ├── ShowcaseProject
       └── RoadmapItem ──── RoadmapVote
```

### Key Relationships

| Relation | Type | Cascade |
|---|---|---|
| Package → User (owner) | Many-to-One | — |
| PackageVersion → Package | One-to-Many | Delete cascade |
| ExecutionLog → Package | Many-to-One | Delete cascade |
| OrgMember → Organization + User | Junction | — |
| Star → User + Package | Junction | — |
| Collection → User | Many-to-One | — |
| Discussion → Package | Many-to-One | — |

---

## 6. API Reference

### Authentication

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/sign-up/email` | POST | None | Register |
| `/api/auth/sign-in/email` | POST | None | Login |
| `/api/auth/sign-out` | POST | Session | Logout |
| `/api/auth/*` | * | — | BetterAuth catch-all |

### Packages

| Endpoint | Method | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `/api/packages` | GET | Optional | 100/min | List packages (type, search, sort, pagination) |
| `/api/packages` | POST | Required | 15/min | Publish package (multipart form) |
| `/api/packages/[name]` | GET | Optional | — | Package detail (increments downloads) |
| `/api/packages/[name]/versions` | GET | Optional | — | List versions |
| `/api/packages/[name]/[version]/download` | GET | Optional | — | Download binary (S3 proxy) |
| `/api/packages/link-github` | POST | Required | — | Link GitHub repo |

### Search & Discovery

| Endpoint | Method | Description |
|---|---|---|
| `/api/search` | GET | Full-text search (name + description) |
| `/api/v1/packages` | GET | Public package search (v1 compat) |
| `/api/v1/users` | GET | Public user search (v1 compat) |

### User & Settings

| Endpoint | Method | Description |
|---|---|---|
| `/api/profile` | GET | Authenticated user profile |
| `/api/settings` | GET/PUT | API key management (redacted on read) |
| `/api/onboarding` | GET/POST | Onboarding progress |

### Execution

| Endpoint | Method | Description |
|---|---|---|
| `/api/playground/run` | POST | Execute skill (SSE streaming, 30s timeout) |
| `/api/analytics` | GET/POST | Execution logs |
| `/api/telemetry` | POST | CLI telemetry ingestion |
| `/api/benchmarks` | POST | Benchmark score storage |

### Organizations

| Endpoint | Method | Description |
|---|---|---|
| `/api/orgs` | GET/POST | List/create organizations |
| `/api/orgs/[slug]/members` | GET/POST | List/add members |
| `/api/orgs/[slug]/invites` | POST | Generate invite token |
| `/api/orgs/invites/accept` | POST | Accept invite |

### System

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | `{ status: 'ok', version: '0.1.0' }` |

---

## 7. CLI Commands

### Execution
| Command | Description |
|---|---|
| `skillspace run <package>` | Execute skill (REPL) or agent (task) |
| `skillspace agent run <agent>` | Execute agent with session support |
| `skillspace workflow run <name>` | Execute workflow pipeline |

### Package Management
| Command | Description |
|---|---|
| `skillspace install <package>` | Install from registry |
| `skillspace uninstall <package>` | Remove installed package |
| `skillspace list` | List installed packages |
| `skillspace info <package>` | View package details |
| `skillspace search <query>` | Search registry |

### Creator Tools
| Command | Description |
|---|---|
| `skillspace init` | Scaffold skill/agent/MCP project |
| `skillspace publish` | Publish to registry |
| `skillspace benchmark <suite>` | Run benchmark tests |
| `skillspace export <skill>` | Export as pasteable text (5 formats) |
| `skillspace migrate` | v1 → v2 migration |

### Account & Config
| Command | Description |
|---|---|
| `skillspace login` | Authenticate |
| `skillspace register` | Create account |
| `skillspace logout` | Clear credentials |
| `skillspace whoami` | Show current user |
| `skillspace model add/list/test` | Configure AI providers |
| `skillspace config set/get/list` | Manage CLI config |
| `skillspace env set/list/unset` | Manage env variables |

### Dashboard
| Command | Description |
|---|---|
| `skillspace link` | Link CLI to dashboard |
| `skillspace dashboard` | Open dashboard in browser |

### Advanced
| Command | Description |
|---|---|
| `skillspace mcp install/list/update` | MCP server management |
| `skillspace org create/invite/join` | Organization management |
| `skillspace help` | Interactive docs explorer |

---

## 8. Runtime Architecture

### Execution Pipeline

```
User calls: skillspace run security-review --model claude
                          │
                    SkillSpace Runtime (SSR)
                          │
              ┌───────────┴──────────────┐
              │     Skill Resolver       │  Loads skill.yaml from cache
              └───────────┬──────────────┘
                          │
              ┌───────────┴──────────────┐
              │   Model Adapter Layer    │  Transforms to provider format
              │   (Claude/OpenAI/        │
              │    Gemini/Ollama)        │
              └───────────┬──────────────┘
                          │
              ┌───────────┴──────────────┐
              │  Permission Enforcer     │  Checks declared permissions
              └───────────┬──────────────┘
                          │
              ┌───────────┴──────────────┐
              │    Persona Firewall      │  Injection detection (8 rules)
              └───────────┬──────────────┘
                          │
              ┌───────────┴──────────────┐
              │    Model API Client      │  Calls OpenAI / Anthropic / etc.
              │    (with retry logic)    │  Exponential backoff on 429/5xx
              └───────────┬──────────────┘
                          │
              ┌───────────┴──────────────┐
              │   MCP Tool Loop          │  Tool calls → MCP servers
              │   (max 10 steps)         │  Auto-healing on failure
              └───────────┬──────────────┘
                          │
                      Response
```

### Agent Execution

```
Agent = Persona + MCPs + Memory + Sub-Agents

1. Resolve agent + dependencies
2. Combine permissions
3. Resolve model (CLI → skill → user config → system default)
4. Load session memory (if session_id)
5. Start MCP servers
6. Generate tools: skill_*, mcp_*, builtin_*
7. Chat loop (max 10 steps)
8. Tool dispatch (builtin → skill → MCP)
9. Save session
```

### Model Resolution Chain

```
CLI flag (--model)
  → skill preferred_model
    → user config default_model
      → system default (anthropic/claude-haiku-4-5)
```

### Security Layers

1. **Persona Firewall** — 8 regex rules (instruction override, privilege escalation, exfiltration URLs, jailbreak keywords)
2. **Permission Enforcer** — Runtime check of declared permissions vs required actions
3. **FileSystem Sandbox** — Path traversal prevention
4. **Network Sandbox** — Blocks localhost, private IPs, AWS metadata endpoint
5. **MCP Allowlist** — HTTP URL and stdio executable allowlists
6. **Rate Limiting** — IP-based and key-based limits
7. **Package Checksum** — SHA-256 integrity verification

---

## 9. Test Coverage

### Test Files (17 files, ~1,468 lines)

| Package | File | Tests | Lines |
|---|---|---|---|
| CLI | `cli.test.ts` | 3 | 54 |
| Registry | `api.test.ts` | 2 | 91 |
| Runtime | `executor.test.ts` | 5 | 187 |
| Runtime | `agent-executor.test.ts` | 3 | 140 |
| Runtime | `agent-resolver.test.ts` | 4 | 106 |
| Runtime | `resolver.test.ts` | 9 | 106 |
| Runtime | `cache.test.ts` | 7 | 129 |
| Runtime | `sandbox.test.ts` | 5 | 86 |
| Runtime | `mcpRegistry.test.ts` | 5 | 93 |
| Runtime | `firewall.test.ts` | 4 | 71 |
| Runtime | `workflow.test.ts` | 3 | 74 |
| Runtime | `mcp.test.ts` | 3 | 105 |
| Runtime | `adapters.test.ts` | 13 | 171 |
| Runtime | `permissions.test.ts` | 8 | 80 |
| Schema | `skill.schema.test.ts` | 11 | 125 |
| SDK | `dummy.test.ts` | 1 | 7 |
| Runtime | `test-utils.ts` | — | 21 |

**Total: 86 tests across 16 test files**

---

## 10. Documentation

### Root Docs

| File | Lines | Content |
|---|---|---|
| `README.md` | 54 | Project overview, quick start |
| `prd.md` | 1,422 | Full PRD (phases, personas, architecture, API spec) |
| `TASK.MD` | 1,623 | v2 Technical Blueprint (schemas, runtime, CLI updates) |
| `TECHNICAL_AUDIT.md` | 111 | Technical audit summary |
| `FUTURE_PLAN.md` | 583 | 6-phase implementation roadmap |

### Book (`docs/`)

| File | Lines | Content |
|---|---|---|
| `BOOK.md` | 8,602 | Complete technical guide (25 chapters) |
| `book/` (25 chapters) | ~8,602 | Chapter-by-chapter documentation |
| `CLI_COMMANDS.md` | 267 | Complete CLI command reference |
| `AI_GUIDELINES.md` | 56 | AI development guidelines |
| `REBUILD_PLAN.md` | 224 | Rebuild plan (5 phases) |
| `technical_debt_and_roadmap.md` | 39 | Technical debt items |
| `USER_PERSONA_TESTS.md` | 198 | 5 user persona simulations |

**Total docs: ~18,000 lines**

---

## 11. Configuration & Deployment

### Environment Variables

| Category | Variables |
|---|---|
| Database | `DATABASE_URL` (Neon PostgreSQL) |
| Auth | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` |
| GitHub | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| Storage | `STORAGE_BUCKET`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY` |
| Models | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY` |
| Firewall | `FIREWALL_ENABLED`, `FIREWALL_MODEL` |
| MCP | `MCP_ALLOWED_TRANSPORTS`, `MCP_HTTP_ALLOWLIST` |

### Docker Stack

- **registry** — Next.js app on port 3000
- **db** — PostgreSQL 15 Alpine on port 5432
- **minio** — S3-compatible storage (console: 9001, API: 9000)
- **createbuckets** — Init container (packages + avatars buckets)

### Cloud Deployment

- **Google Cloud Build** → Container Registry → Cloud Run (us-central1)
- **Vercel** — Next.js deployment

---

## 12. Examples

### 10 Example Skills

| Skill | Category | Key Traits |
|---|---|---|
| `bash-expert` | devops | Converts English to bash one-liners |
| `code-reviewer` | code | Git diff analysis, severity ratings |
| `doc-generator` | writing | Generates API docs with code blocks |
| `git-commit-gen` | devops | Conventional commit messages |
| `json-formatter` | code | Validates and pretty-prints JSON |
| `sentiment-analyzer` | analysis | Structured emotional analysis |
| `sql-optimizer` | analysis | SQL query optimization |
| `unit-test-gen` | code | Jest unit test generation |
| `ux-copywriter` | writing | UI copy for buttons, errors |
| `security-review` | security | OWASP Top 10, JSON output, requires filesystem.read |

All use v2 persona-based format with `@skillspace/` scoped names.

---

## 13. Known Issues & Technical Debt

### Critical

1. **No CI/CD** — No GitHub Actions, only Cloud Build config
2. **.env.local committed** — Contains live Neon DB credentials
3. **No CONTRIBUTING.md** — Referenced in plan but never created
4. **No .github/ directory** — No issue templates, no PR templates

### High

5. **SDK placeholder** — TypeScript SDK ~30% complete, Python SDK minimal
6. **Analytics mocked** — Charts previously used hardcoded data (now fixed in Phase 1)
7. **Playground mocked** — AIChat previously returned mock responses (now fixed)
8. **testing-sandbox** — Mix of v1 and broken v2 format files

### Medium

9. **No version diff visualization** — Package versions show no diff
10. **Empty profile tabs** — Collections, Followers, Achievements are placeholders
11. **No team workspace** — Orgs exist but no team dashboard views
12. **In-memory rate limiting** — Not distributed (fine for single instance)

### Low

13. **Legacy output.ts** — Old chalk/cli-table3 helpers still in codebase
14. **InstallCard inline CSS** — Previously had inline styles (now fixed)
15. **Book chapter 25** — 5,973-line source code appendix (auto-generated)

---

## 14. File Inventory

### By Package

| Package | Source Files | Lines | Test Files | Test Lines |
|---|---|---|---|---|
| `apps/cli` | 29 | ~3,100 | 1 | 54 |
| `apps/registry` | 73 | ~8,500 | 1 | 91 |
| `apps/vscode` | 1 | ~59 | 0 | 0 |
| `packages/runtime` | 29 | ~3,738 | 12 | ~1,260 |
| `packages/schema` | 11 | ~829 | 1 | 125 |
| `packages/database` | 3 | ~687 | 0 | 0 |
| `packages/sdk-ts` | 1 | ~67 | 1 | 7 |
| `packages/sdk-python` | 2 | ~64 | 0 | 0 |
| `packages/lsp` | 1 | ~143 | 0 | 0 |
| `packages/memory-mcp` | 2 | ~199 | 0 | 0 |
| `packages/config-*` | 6 | ~84 | 0 | 0 |
| **TOTAL** | **158** | **~17,470** | **16** | **~1,537** |

### By Category

| Category | Files | Lines |
|---|---|---|
| Source code | 158 | ~17,470 |
| Tests | 16 | ~1,537 |
| Documentation | 32 | ~18,000 |
| Examples | 20 | ~445 |
| Config files | 15 | ~450 |
| Scripts | 3 | ~328 |
| Plans | 4 | ~1,066 |
| **GRAND TOTAL** | **248** | **~39,296** |

---

*This document is a living record of the SkillSpace codebase. Update it as the project evolves.*
