<!-- Hallmark pre-emit critique: P5 H5 E4 S5 R4 V5 -->

# SkillSpace Agent Master Plan

Status: root-level agent contract  
Audience: Gemini 3.1 Pro, Codex, Claude Code, human maintainers  
Last updated: 2026-06-17  
Primary tactical plan: `docs/IMPLEMENTATION_PLAN.md`

This file exists so an implementation agent can understand the full product,
not only the next bug. `docs/IMPLEMENTATION_PLAN.md` is the tactical task list.
This root file is the product, architecture, UI, deployment, trust, and
open-source execution contract that should govern every future change.

## The Thesis

SkillSpace can matter because AI capability reuse is still primitive. Teams copy
prompts between chats, paste brittle agent instructions into private repos,
rebuild tool wiring from scratch, and lose trust every time an AI workflow works
on one machine but not another.

The product should become the public package manager for AI capabilities:

- A developer can run `skillspace install @author/security-review` and know what
  will be installed, which model it targets, which permissions it asks for, which
  repo it came from, and whether it was scanned.
- A skill author can publish a plain `skill.yaml` or `agent.yaml` from GitHub and
  receive a package page, version history, install command, docs, and analytics.
- A team can approve a small set of trusted skills, pin versions in a lockfile,
  and run the same capability across CLI, registry playground, SDK, and CI.
- A beginner can browse examples and learn the ontology without understanding
  the internals on day one.
- A maintainer can host the registry on a free or hobby-tier stack while the
  source of truth remains public GitHub repositories.

The revolution is not "another prompt marketplace." The revolution is treating
AI behaviors, agents, workflows, permissions, memory, model preferences, and MCP
tools as inspectable software packages with schemas, versions, checksums,
lockfiles, docs, tests, trust signals, and a runtime.

## Required Reading Order

Every coding agent must read these before making broad changes:

1. `README.md` for the current project promise and quick start.
2. `docs/architecture.md` for monorepo layers and data flow.
3. `docs/schema-reference.md` for the v2 ontology.
4. `docs/api.md` for public route contracts.
5. `docs/development.md` for local setup and expected verification.
6. `docs/IMPLEMENTATION_PLAN.md` for the current tactical phase plan.
7. `packages/database/prisma/schema.prisma` before any registry data change.
8. The exact page, route, package, or command file you are editing.

Historical docs in `docs/archive/` are useful for context, but they are not
authoritative unless this file or `docs/IMPLEMENTATION_PLAN.md` explicitly says
to use them.

## Current Project Shape

SkillSpace is a pnpm and Turborepo monorepo.

- `apps/registry`: Next.js 15 App Router registry, dashboard, docs, playground,
  analytics, package pages, auth, and API routes.
- `apps/cli`: `skillspace` command line tool for install, run, publish, search,
  config, orgs, workflows, MCPs, models, benchmarks, and migration.
- `apps/vscode`: editor support for skill and agent YAML.
- `packages/schema`: Zod schemas, validators, and inferred TypeScript types.
- `packages/runtime`: model adapters, resolver, executor, firewall, sandbox,
  permissions, MCP manager, cache, workflows, and agent orchestration.
- `packages/database`: Prisma schema and migrations.
- `packages/sdk-ts`: TypeScript SDK, currently minimal and should become useful.
- `packages/sdk-python`: early Python SDK.
- `packages/lsp`: language server for schema-aware authoring.
- `packages/memory-mcp`: SQLite-backed memory MCP server.
- `examples`: reference v2 skills.
- `scripts`: registry seeding and operational scripts.

The build order is:

```text
schema -> runtime -> cli / registry / sdk-ts / lsp
```

Do not invert this dependency graph.

## Non-Negotiable Rules

1. Keep the core loop working: publish, browse, install, run.
2. Do not rewrite unrelated files while completing a task.
3. Do not delete tests, docs, examples, or migrations to make checks pass.
4. Do not introduce paid infrastructure as a hard requirement.
5. Do not invent public metrics, testimonials, logos, or adoption claims.
6. Do not commit secrets, `.env`, `.env.local`, provider keys, or session tokens.
7. Do not instantiate `new PrismaClient()` inside registry pages or routes; use
   `apps/registry/src/lib/prisma.ts`.
8. Use `apps/registry/src/lib/api-response.ts` helpers for API responses.
9. Use `getUserFromRequest(req)` from `apps/registry/src/lib/auth.ts` for
   authenticated API routes.
10. Preserve the v2 ontology: Skill is stateless persona; Agent is persona plus
    tools, memory, permissions, and orchestration; MCP is mediated by Agent.
11. Treat GitHub-backed packages as the public-source path and registry uploads
    as a compatibility path.
12. Keep registry pages usable when the database is empty.
13. Keep pages usable when auth is absent, expired, or still loading.
14. Keep install and download behavior deterministic for scoped names like
    `@scope/name`.
15. Run focused tests after each task and full verification after each phase.

## Product Principles

### Utility Before Spectacle

The public site must prove the product works. A developer arriving on the home
page should see:

- The install command.
- A real package card.
- The source repository for the package.
- A verified or unverified trust signal.
- A short explanation of Skill vs Agent vs MCP.
- A path to publish their own package.

Do not hide the product behind a decorative landing page.

### Trust Before Growth

The registry must answer skeptical questions:

- Where did this capability come from?
- What exact version will I install?
- What changed between versions?
- Who published it?
- Is the source public?
- Was it scanned?
- Which permissions does it request?
- Which model providers does it support?
- Can I pin it?
- Can I uninstall it cleanly?

If a UI section does not improve trust, discovery, learning, or execution, it is
probably noise.

### Inspectable By Default

For public packages, GitHub should be the source of truth. The registry should
index metadata, versions, checksums, downloads, analytics, docs, and trust
signals. Users should be able to click from registry to source and from source
back to registry.

### Local-First Developer Experience

The CLI must work from a terminal without requiring a dashboard session. The
dashboard must help users learn, publish, and debug, but it should not be the
only path.

### Cheap To Host

The first public deployment should work on:

- Vercel Hobby for `apps/registry`.
- Neon free tier for Postgres.
- GitHub raw content for GitHub-backed manifests.
- Optional S3-compatible storage only for legacy uploads or future artifact
  needs.
- No Redis, queue workers, cron-heavy background jobs, or separate services for
  the first public release.

## Capability Ontology

Use these definitions everywhere in docs, UI copy, schema validation, and API
responses.

### Persona

The behavioral blueprint. It defines how an AI speaks and acts:

- `system_prompt`
- `tone`
- `behavioral_guidelines`
- `greeting`
- `preferred_model`
- `capabilities`

### Skill

A publishable stateless persona. It must not declare MCPs, sub-agents, memory,
or tool permissions. It is the smallest reusable AI behavior.

### Agent

A runnable executor. It includes a persona plus optional MCPs, memory,
permissions, and sub-agent orchestration.

### MCP

A tool server. It should never be addressed directly by users in normal runtime
flows. Agents mediate MCP access and permissions.

### Workflow

A repeatable multi-step process that chains skills or agents with conditions,
input mapping, and output passing.

### Lockfile

The reproducibility layer. It pins installed package names, versions, checksums,
source, and resolved metadata.

## Public Launch Definition

SkillSpace is public-launch ready only when these are true:

- A visitor can open the registry and understand the product within 20 seconds.
- At least ten example packages are seeded and browseable.
- At least one GitHub-backed package can be published, installed, downloaded as a
  `.skillpkg`, and run from the CLI.
- Package pages show source, version, checksum, install command, author, tags,
  model compatibility, verification state, and latest commit when available.
- Search can filter by type and sort by popular, recent, and name.
- Empty states are useful and point to the next action.
- The playground can run a real seeded skill or clearly explain missing provider
  keys.
- `pnpm build`, `pnpm test`, `pnpm lint`, and `pnpm format:check` pass.
- Vercel deployment succeeds without paid services.
- README, docs, contribution guide, and issue templates exist.

## Agent Operating Procedure

Use this procedure for every implementation session.

### 1. Establish Scope

Read the user request and map it to one of:

- bug fix
- feature implementation
- UI/UX improvement
- docs
- deployment
- tests
- security/trust
- refactor

If the task touches multiple scopes, split it into packets and complete the
lowest-risk packet first.

### 2. Read Before Editing

Read the cited docs and exact files. For registry UI, also read:

- `apps/registry/src/app/layout.tsx`
- `apps/registry/src/app/globals.css`
- `apps/registry/tailwind.config.js`
- `apps/registry/src/components/Navbar.tsx`
- `apps/registry/src/components/Footer.tsx`
- the route or component you are changing

For CLI work, also read:

- `apps/cli/src/index.ts`
- `apps/cli/src/utils/api.ts`
- `apps/cli/src/utils/packager.ts`
- surrounding command files for output conventions

For runtime work, also read:

- `packages/runtime/src/index.ts`
- `packages/runtime/src/executor.ts`
- `packages/runtime/src/repl-executor.ts`
- relevant adapter, resolver, sandbox, or permission files
- existing tests in `packages/runtime/__tests__`

### 3. Protect User Work

Run `git status --short` before editing. If files already have modifications,
work with them. Do not revert unknown changes.

### 4. Make Focused Changes

Keep edits in the smallest set of files that solves the task. Add tests for
changed behavior. Prefer existing utilities, components, and schemas.

### 5. Verify Locally

Run the narrowest useful command first. Examples:

```bash
pnpm --filter @skillspace/schema test
pnpm --filter @skillspace/runtime test
pnpm --filter @skillspace/registry test
pnpm --filter @skillspace/registry build
pnpm --filter @skillspace/cli build
```

At phase boundaries, run:

```bash
pnpm build
pnpm test
pnpm lint
pnpm format:check
```

### 6. Record Follow-Ups

If a bug is discovered but outside scope, document it in the final response or a
TODO only when the codebase already uses TODOs nearby. Do not silently expand
scope.

## Design And UI/UX Standard

The registry is a developer product. It should feel like a serious public index
and operational tool, not a generic AI landing page.

### Current UI Risks To Fix

The current registry UI has several risks visible in the code:

- Too many dark glowing sections and radial gradients.
- Heavy GSAP and framer-motion usage for surfaces that mostly need information.
- Card-heavy layouts where dense comparison would work better.
- Landing sections using generic claims instead of showing real package state.
- Search and package filters diverging between `/packages` and `/search`.
- Some pages rely on visual spectacle while the actual trust data is buried.
- Fake or placeholder visual blocks can look less credible than plain product
  screenshots, tables, logs, and source links.
- The dark/cyan palette is repetitive across nav, landing, package cards, and
  showcase.
- Mobile needs explicit verification at 320, 375, 414, and 768 px.
- Buttons and interactive elements need consistent focus, loading, error, and
  success states.

### Design Direction

Move toward a restrained technical registry:

- Keep dark mode if it remains the brand, but reduce glow, blur, and decorative
  gradients.
- Use information density for registry and dashboard pages.
- Use real product artifacts: install command, package metadata, trust badges,
  version table, diff, source repo, execution logs.
- Prefer page bands and structured layouts over nested cards.
- Keep border radius at 8 px or less for operational UI unless an existing
  component requires otherwise.
- Use icons for commands and status, but do not use icons as decoration.
- Make copy specific and verifiable.
- Avoid inflated hero claims. Say what the system does.
- Keep motion short and purposeful. Animate opacity and transform only.
- Support `prefers-reduced-motion`.
- Use visible `:focus-visible` states everywhere.

### Suggested Registry Information Architecture

Public routes should serve distinct jobs:

- `/`: explain the product, show real packages, show install/run/publish loop.
- `/packages`: dense browse page with filters, sorting, package cards/table, and
  quick install copy.
- `/packages/[name]`: trust and usage page for one package.
- `/search`: global search, optionally merged into `/packages` later.
- `/trending`: sorted by an explainable score, not random.
- `/showcase`: real projects built with SkillSpace; empty state should invite
  submission but not pretend there is adoption.
- `/docs`: stable learning surface.
- `/playground`: run a package or explain missing setup.
- `/create`: publish wizard for file upload and GitHub source.
- `/dashboard`: user-owned packages, API keys, activity, playground, settings.
- `/analytics`: public ecosystem stats, not vanity metrics.
- `/roadmap`: transparent community roadmap.

### Package Card Requirements

Every package card should show:

- package name
- type badge
- description
- author or organization
- latest version
- downloads
- verification state
- source type: GitHub or registry upload
- model compatibility when inferable
- tags, capped and stable
- quick copy install command

Do not make hover reveal the only path to critical information.

### Package Detail Requirements

The package page should have:

- install command with copy button
- verified or unverified state
- GitHub repo link, branch, path, latest commit when available
- package type and version
- checksum
- permission summary
- model compatibility
- manifest preview
- version history
- version diff
- author profile
- usage examples
- warning area for unverified, deprecated, private, or scan-warning packages

### Empty State Requirements

Every empty state must answer:

- What is empty?
- Why might it be empty?
- What can the user do next?

Examples:

- Empty registry: "No packages published yet. Seed examples locally or publish
  the first GitHub-backed skill."
- Empty search: "No packages match these filters. Clear filters or browse all."
- Empty showcase: "No showcase projects yet. Submit a real SkillSpace-powered
  project."
- Empty dashboard: "You have not published a package yet. Publish from GitHub or
  create a skill."

### Mobile Requirements

Before a UI PR is complete, verify:

- 320 px width
- 375 px width
- 414 px width
- 768 px width
- no horizontal scrolling
- no clipped package names
- no two-line primary nav buttons
- filters are usable without trapping scroll
- dialogs and sheets fit vertically
- command copy buttons remain reachable

## Vercel Hobby Deployment Strategy

The first public deployment must respect hobby-tier limits.

### Registry

Deploy only `apps/registry` to Vercel.

Recommended Vercel build command:

```bash
pnpm install --frozen-lockfile && pnpm --filter @skillspace/registry build
```

Recommended output:

```text
apps/registry/.next
```

Use `BUILD_STANDALONE=true` only if the deployment setup expects standalone
output.

### Database

Use Neon Postgres free tier.

Required env vars:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `MINIO_*` or S3-compatible variables for upload compatibility
- provider API keys only if server-side playground execution is enabled

### Storage

Public GitHub-backed packages should avoid registry storage. For GitHub-backed
packages:

- Store metadata in Postgres.
- Store `githubUrl`, `githubBranch`, `githubPath`, and `githubCommit`.
- Fetch manifest server-side from GitHub.
- Wrap manifest into `.skillpkg` tar.gz at download time.
- Return bytes with checksum and `X-Source: github`.

This avoids paid object storage for the most important public path.

### Serverless Limits

Avoid:

- long-running background jobs
- polling loops inside route handlers
- in-memory queues
- server state that must survive cold starts
- huge package archives
- expensive synchronous scans on list pages

Prefer:

- static docs
- server-rendered public pages
- small serverless API routes
- cached DB reads where safe
- GitHub as source of truth
- explicit user-triggered refresh

### Rate Limits

The current API docs specify:

- public GET: 100/min/IP
- publish POST: 15/min/IP

Keep these cheap and DB-backed or in-memory only for local dev. Do not require
Redis for launch.

## Implementation Roadmap

Follow `docs/IMPLEMENTATION_PLAN.md` first for the immediate tactical tasks.
The phases below wrap that plan into a public-product sequence.

### Phase A: Stabilize The Core Loop

Goal: one GitHub-backed package can be published, indexed, downloaded,
installed, and run.

Tasks:

1. Complete Phase 0 of `docs/IMPLEMENTATION_PLAN.md`.
2. Ensure `POST /api/packages/github` sets `verified: true`.
3. Ensure `POST /api/packages/link-github` sets `verified: true`.
4. Ensure `GET /api/packages/:name/:version/download` returns `.skillpkg` bytes
   for GitHub-backed packages, not a redirect.
5. Create or verify `apps/registry/src/lib/build-skillpkg.ts`.
6. Add tests for `buildSkillpkgFromManifest`.
7. Add tests for `parseGitHubUrl`.
8. Expose `source: "github" | "registry"` in package API responses.
9. Add CLI `publish --github`.
10. Verify `skillspace install @scope/name` works for GitHub-backed packages.
11. Verify package page shows GitHub verified status and source metadata.

Acceptance:

```bash
pnpm --filter @skillspace/registry build
pnpm --filter @skillspace/registry test
pnpm --filter @skillspace/cli build
pnpm test
```

Manual:

- Publish from a public GitHub repo with `skill.yaml`.
- Install it.
- Inspect the downloaded `.skillpkg`.
- Run it if a model key is available.

### Phase B: Make The Repo Public-Contributor Ready

Goal: a stranger can clone, understand, build, test, and contribute.

Tasks:

1. Add `.github/workflows/ci.yml`.
2. Add `CONTRIBUTING.md`.
3. Add issue templates.
4. Add `SECURITY.md` with responsible disclosure instructions.
5. Add or verify `LICENSE`.
6. Add a short `docs/SELF_HOSTED.md`.
7. Make README link to docs, contribution guide, public registry, and examples.
8. Ensure `docs/development.md` matches actual commands.
9. Add CI checks for build, test, lint, and format.
10. Keep `master` deployable.

Acceptance:

```bash
pnpm build
pnpm test
pnpm lint
pnpm format:check
```

### Phase C: Registry UI/UX Rebuild

Goal: the web registry proves the product is real.

Task packet C1: design system cleanup.

1. Audit `apps/registry/src/app/globals.css`.
2. Preserve Tailwind directives.
3. Keep existing HSL token compatibility.
4. Define a smaller semantic token set for operational pages.
5. Reduce repeated cyan glow usage.
6. Standardize focus rings.
7. Standardize badge variants for verified, unverified, GitHub, registry upload,
   model compatibility, deprecated, private, and scan warning.
8. Standardize skeleton loading states.
9. Standardize empty states.
10. Verify dark mode contrast.

Task packet C2: navigation and footer.

1. Simplify nav around primary jobs: Browse, Docs, Publish, Playground, GitHub.
2. Keep search reachable on desktop and mobile.
3. Make auth loading state explicit.
4. Ensure mobile sheet does not overflow.
5. Remove non-existent legal links or create those pages.
6. Replace decorative footer glow with a practical footer.
7. Add status link only if backed by real health status; otherwise remove "All
   systems operational."

Task packet C3: home page.

1. Replace generic AI-product spectacle with a product-led hero.
2. Show a real install command.
3. Show one real package card or seeded sample.
4. Explain Skill, Agent, MCP in one compact section.
5. Show the publish flow: GitHub repo -> registry index -> install.
6. Show trust model: source, version, checksum, permissions.
7. Avoid invented adoption stats when DB is empty.
8. Keep the first viewport focused on the actual product.
9. Reduce motion to at most three primitives.
10. Verify mobile.

Task packet C4: packages browse.

1. Decide whether `/search` remains separate or `/packages` becomes the main
   search surface.
2. Use one source of truth for filters.
3. Add type, source, verified, model, tag, and sort controls.
4. Keep filters keyboard accessible.
5. Support query params for shareable searches.
6. Make package cards dense enough for scanning.
7. Keep install command visible without hover-only reveal.
8. Add loading, error, and empty states.
9. Add pagination that preserves filters.
10. Verify API and UI sorting match.

Task packet C5: package detail.

1. Put install command and source trust above the fold.
2. Add GitHub source panel.
3. Add version table.
4. Add manifest preview.
5. Add model compatibility.
6. Add permissions summary.
7. Add checksum.
8. Add version diff.
9. Add author card.
10. Add warnings for unverified and deprecated packages.

Task packet C6: create/publish.

1. Make GitHub publish the default path.
2. Keep file upload as secondary path.
3. Validate auth before submission.
4. Add `credentials: "include"` to same-origin authenticated fetch calls.
5. Preview parsed manifest before publish.
6. Show what will become public.
7. Show source, branch, path, package name, type, version, and tags.
8. Explain verification.
9. Handle GitHub fetch failures clearly.
10. Give next steps after publish: view page, install, copy command.

Task packet C7: playground.

1. Make selected package explicit.
2. Show model/provider requirement.
3. Stream output.
4. Save playground session only when useful.
5. Handle missing API key.
6. Handle package not found.
7. Handle scan-blocked persona.
8. Show sample input from package docs when available.
9. Keep serverless runtime within Vercel limits.
10. Avoid pretending local MCP tools can run in the hosted browser unless they
    actually can.

Task packet C8: showcase.

1. Keep the empty state honest.
2. Add submission flow only if authenticated and backed by API.
3. Require real URL and optional image.
4. Add moderation state if public submissions are accepted.
5. Show project, author, package(s) used, and source when available.
6. Avoid generic stock imagery.
7. Link to real package pages.
8. Make cards stable at all viewport sizes.
9. Add admin approval path later, not before core loop works.
10. Do not claim community projects exist before they do.

Acceptance:

```bash
pnpm --filter @skillspace/registry build
pnpm --filter @skillspace/registry test
```

Manual UI QA:

- 320, 375, 414, 768, 1024, 1440 px widths.
- Keyboard tab through nav, filters, package cards, dialogs, and publish form.
- Reduced motion enabled.
- Empty DB.
- Seeded DB.
- Logged out.
- Logged in.

### Phase D: CLI Developer Experience

Goal: the terminal flow feels reliable enough for daily use.

Tasks:

1. Complete `skillspace doctor`.
2. Add `--json` output to scriptable commands.
3. Ensure `install`, `publish`, `search`, `list`, and `info` have predictable
   stdout/stderr behavior.
4. Make auth errors actionable.
5. Make registry URL configurable.
6. Make config path visible in `doctor`.
7. Validate local `skill.yaml` and `agent.yaml`.
8. Add better scoped-name error messages.
9. Add install warning for unverified packages.
10. Add checksum verification on install.
11. Add clean uninstall behavior.
12. Add lockfile update tests.
13. Verify Windows paths, OneDrive paths, spaces in paths, and non-admin shell.

Acceptance:

```bash
pnpm --filter @skillspace/cli build
pnpm --filter @skillspace/cli test
```

Manual:

```bash
skillspace doctor
skillspace search security --json
skillspace install @skillspace/security-review
skillspace list
skillspace info @skillspace/security-review
skillspace uninstall @skillspace/security-review
```

### Phase E: Runtime Trust And Safety

Goal: installed capabilities cannot silently exceed their declared contract.

Tasks:

1. Review `packages/runtime/src/permissions.ts`.
2. Review `packages/runtime/src/sandbox.ts`.
3. Review `packages/runtime/src/firewall`.
4. Define canonical permission names.
5. Block undeclared filesystem access.
6. Block undeclared network access.
7. Block undeclared MCP tool calls.
8. Surface permission errors clearly in CLI.
9. Surface scan warnings clearly in registry.
10. Store scan result metadata if schema supports it; if not, defer DB changes
    until migration is planned.
11. Add tests for blocked and allowed permission cases.
12. Add tests for persona injection warnings and blocks.
13. Add tests for model resolver priority.
14. Add tests for agent cycle detection.
15. Add tests for MCP startup failure cleanup.

Acceptance:

```bash
pnpm --filter @skillspace/runtime test
```

### Phase F: SDKs And Integrations

Goal: SkillSpace is usable beyond the first-party CLI.

Tasks:

1. Complete minimal TypeScript SDK.
2. Add mocked fetch tests.
3. Mirror API envelope types from registry.
4. Add `search`, `getPackage`, `install`, `publish`, `publishFromGitHub`.
5. Keep SDK free of CLI UI dependencies.
6. Add README examples.
7. Bring Python SDK to parity after TS SDK is stable.
8. Add GitHub Action for skill validation.
9. Add VSCode/LSP validation docs.
10. Add schema examples for skill, agent, workflow, and MCP references.

Acceptance:

```bash
pnpm --filter @skillspace/sdk-ts test
pnpm --filter @skillspace/sdk-ts build
```

### Phase G: Community And Governance

Goal: open source contributors know how to help without needing private context.

Tasks:

1. Add `CONTRIBUTING.md`.
2. Add `SECURITY.md`.
3. Add issue templates.
4. Add PR template.
5. Add a "good first issue" list in docs or GitHub issues.
6. Add code ownership notes if maintainers grow.
7. Add governance section after external contributors appear.
8. Add roadmap page that mirrors real project milestones.
9. Add examples contribution guide.
10. Add package quality guidelines.

### Phase H: Observability And Analytics

Goal: know if the product works without collecting unnecessary private data.

Tasks:

1. Keep execution logs minimal.
2. Avoid storing prompt inputs by default unless user explicitly saves a
   playground session.
3. Track downloads, publish events, install failures, and run failures.
4. Show public aggregate analytics only.
5. Add admin-only operational views later.
6. Add package-level analytics for owners.
7. Add clear privacy note.
8. Add rate-limit visibility in API errors.
9. Add health route checks.
10. Add Vercel deployment smoke checks.

## Detailed Backlog For Gemini

Use these packets when handing work to Gemini 3.1 Pro. Each packet is designed
to be independently executable.

### Packet 001: Repository Hygiene Baseline

Objective: make the repo ready for public contributors.

Steps:

1. Read `docs/development.md`.
2. Check whether `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`,
   `.github/workflows/ci.yml`, `.github/ISSUE_TEMPLATE`, and PR template exist.
3. Create missing files only.
4. Keep each document concise and link to existing docs.
5. Add no new runtime dependencies.
6. Run `pnpm format:check`.
7. Run `pnpm build` if dependencies are already installed.

Done when:

- Contributor docs exist.
- CI exists.
- No existing docs are duplicated wholesale.

### Packet 002: GitHub Package Download Reliability

Objective: GitHub-backed packages install correctly.

Steps:

1. Read `docs/IMPLEMENTATION_PLAN.md` Phase 0.
2. Read `apps/registry/src/app/api/packages/[name]/[version]/download/route.ts`.
3. Read `apps/registry/src/lib/github.ts`.
4. Implement or verify `buildSkillpkgFromManifest`.
5. Ensure the route fetches GitHub manifest server-side.
6. Ensure the route returns tar.gz bytes.
7. Ensure `X-Checksum` and `X-Source` headers are set.
8. Ensure downloads increment once per successful download.
9. Add tests.
10. Run registry tests.

Edge cases:

- GitHub URL invalid.
- Branch missing.
- Path missing.
- GitHub fetch returns 404.
- Package version has `githubCommit`.
- Manifest path ends in `agent.yaml`.
- Scoped name includes slash and is URL encoded.

### Packet 003: CLI Publish From GitHub

Objective: authors can publish a GitHub package without browser wizard.

Steps:

1. Read `apps/cli/src/commands/publish.ts`.
2. Read `apps/cli/src/utils/api.ts`.
3. Add `publishFromGitHub`.
4. Add `--github <url>`.
5. Enforce login.
6. Print actionable success output.
7. Print actionable API error output.
8. Respect `--yes` and `--json` if implemented.
9. Build CLI.

Edge cases:

- Not logged in.
- Invalid GitHub URL.
- Repo has no manifest.
- Package already exists.
- Version already exists.
- Network failure.

### Packet 004: Public Registry Browse

Objective: `/packages` becomes the main discovery surface.

Steps:

1. Read `apps/registry/src/app/packages/page.tsx`.
2. Read `apps/registry/src/app/api/packages/route.ts`.
3. Read `apps/registry/src/components/PackageCard.tsx`.
4. Add or verify API support for `type`, `sort`, `search`, `page`, `limit`.
5. Add source and verified filters only if API supports them.
6. Ensure query params are preserved.
7. Make package cards show source and trust data.
8. Add robust empty state.
9. Add skeletons.
10. Build registry.

Edge cases:

- Empty DB.
- Query with no results.
- Invalid page number.
- Invalid sort.
- Invalid type.
- Slow network.
- Very long package names.

### Packet 005: Package Detail Trust Page

Objective: package detail page answers install trust questions.

Steps:

1. Read `apps/registry/src/app/packages/[name]/page.tsx`.
2. Read `apps/registry/src/app/packages/[name]/PackageTabs.tsx`.
3. Read package API response.
4. Put install command near top.
5. Add copy button.
6. Add verified status.
7. Add source panel.
8. Add version table.
9. Add manifest preview.
10. Add checksum and latest commit.
11. Add warnings for unverified packages.
12. Build registry.

Edge cases:

- Package not found.
- Private package.
- Missing latest version.
- Tags stored as malformed JSON.
- No GitHub URL.
- Deprecated version.
- Long manifest.

### Packet 006: Create Publish Wizard

Objective: browser publish flow is honest, authenticated, and reliable.

Steps:

1. Read `apps/registry/src/app/create/page.tsx`.
2. Identify GitHub and upload modes.
3. Check auth state before publishing.
4. Add `credentials: "include"` to same-origin authenticated fetch calls.
5. Parse and preview manifest before submit.
6. Show source branch/path.
7. Show package name/version/type.
8. Handle 401 with link to `/login`.
9. Handle validation errors inline.
10. Build registry.

Edge cases:

- Logged out.
- Session expired.
- Invalid YAML.
- GitHub repo private or unreachable.
- Version collision.
- Scope ownership failure.

### Packet 007: Playground Reality Check

Objective: playground runs real skills or clearly explains why it cannot.

Steps:

1. Read `apps/registry/src/app/playground/page.tsx`.
2. Read `apps/registry/src/app/playground/PlaygroundClient.tsx`.
3. Read `apps/registry/src/app/api/playground/run/route.ts`.
4. Verify package selection.
5. Verify request body.
6. Verify streaming behavior.
7. Add missing API key error.
8. Add package not found error.
9. Add loading and cancellation states.
10. Build registry.

Edge cases:

- No packages.
- No provider key.
- Model provider unavailable.
- Skill scan blocked.
- Runtime throws.
- Stream interrupted.

### Packet 008: Runtime Permission Enforcement

Objective: runtime blocks undeclared capabilities.

Steps:

1. Read `packages/runtime/src/permissions.ts`.
2. Read `packages/runtime/src/sandbox.ts`.
3. Read `packages/runtime/__tests__/permissions.test.ts`.
4. Define canonical permission mapping.
5. Block undeclared filesystem reads.
6. Block undeclared filesystem writes.
7. Block undeclared network fetch.
8. Block undeclared MCP tools.
9. Add tests.
10. Run runtime tests.

Edge cases:

- Permission aliases.
- Agent with no permissions.
- Skill trying to declare permissions.
- MCP with config env vars.
- Error message leaking secret values.

### Packet 009: Vercel Deployment Pass

Objective: deploy `apps/registry` on Vercel Hobby.

Steps:

1. Read `apps/registry/package.json`.
2. Read `apps/registry/next.config.ts`.
3. Read `turbo.json`.
4. Verify Prisma generation in `prebuild`.
5. Verify required env vars are documented.
6. Ensure build does not require local MinIO.
7. Ensure build does not require provider API keys.
8. Ensure pages tolerate DB connection failure where public pages can fallback.
9. Add `docs/DEPLOYMENT_VERCEL.md` if missing.
10. Build registry.

Edge cases:

- `DATABASE_URL` missing at build.
- Prisma client not generated.
- Server components querying DB during build.
- Dynamic pages needing `force-dynamic`.
- Vercel function timeout.

### Packet 010: Examples And Seeding

Objective: public demo has real packages.

Steps:

1. Read `examples/*/skill.yaml`.
2. Read `scripts/seed-registry.ts`.
3. Ensure all examples validate with v2 schema.
4. Ensure seeding creates users or owner records deterministically.
5. Ensure seeding is idempotent.
6. Set verified only where appropriate.
7. Add GitHub URLs if examples live in this repo.
8. Run seed locally when DB is configured.
9. Verify `/packages` shows examples.
10. Document seed process.

Edge cases:

- DB already has package.
- Owner missing.
- Invalid YAML.
- Tags malformed.
- Missing versions.

### Packet 011: Search And Trending

Objective: users can find useful capabilities.

Steps:

1. Read `apps/registry/src/app/api/search/route.ts`.
2. Read `apps/registry/src/app/search/SearchClient.tsx`.
3. Read `apps/registry/src/app/trending/page.tsx`.
4. Implement explainable sorting.
5. Use server-side filters where possible.
6. Avoid loading all packages into client for large registry.
7. Add type/source/verified filters.
8. Add empty states.
9. Add tests for scoring helper.
10. Build registry.

Edge cases:

- Search query empty.
- Search query with slash or scope.
- Zero downloads.
- New package boost.
- Private packages.

### Packet 012: Version Diff

Objective: users can inspect package changes.

Steps:

1. Read package detail and tabs files.
2. Choose basic text diff implementation.
3. Compare manifest strings between consecutive versions.
4. Show added and removed lines.
5. Keep diff readable for YAML.
6. Do not add heavy diff dependency unless necessary.
7. Add empty state for single-version package.
8. Build registry.

Edge cases:

- One version only.
- Very large manifest.
- Malformed manifest JSON/string.
- Deprecated version.

### Packet 013: Documentation In Registry

Objective: docs teach the product without leaving the site.

Steps:

1. Read `apps/registry/src/content/docs/*.mdx`.
2. Compare with root `docs/*.md`.
3. Keep content aligned.
4. Add "Skill vs Agent vs MCP" page if missing.
5. Add "Publish from GitHub" page.
6. Add "Trust and permissions" page.
7. Add "Vercel/self-host" page.
8. Add CLI examples.
9. Avoid duplicating long API tables unless maintained.
10. Build registry.

### Packet 014: Dashboard Owner Workflow

Objective: package owners can understand and manage their packages.

Steps:

1. Read dashboard layout and client files.
2. Show owned packages.
3. Show package health: source linked, verified, latest version, downloads.
4. Show next action for empty dashboard.
5. Add owner-only edit affordance.
6. Ensure auth guard is clear.
7. Keep dashboard dense and utilitarian.
8. Build registry.

### Packet 015: Accessibility Pass

Objective: registry is usable by keyboard and screen readers.

Steps:

1. Audit nav.
2. Audit package cards.
3. Audit filters.
4. Audit dialogs/sheets.
5. Audit publish wizard.
6. Audit playground.
7. Add aria labels only where visual text is absent.
8. Ensure focus visible.
9. Ensure color contrast.
10. Verify reduced motion.

## Edge Case Ledger

Use this checklist before calling the product production-ready.

### Package Names

- `@scope/name`
- uppercase input should be rejected or normalized consistently
- names with hyphens
- URL-encoded scoped package names
- route params containing slash
- duplicate package names
- organization scope vs user scope

### Versions

- semver increments
- duplicate version publish
- deprecated versions
- missing latest version
- install specific version
- version diff between adjacent versions

### GitHub Source

- shorthand `owner/repo`
- full repo URL
- tree URL with branch and path
- non-main branch
- nested path
- `skill.yaml`
- `agent.yaml`
- repo missing manifest
- private repo
- rate limited GitHub response
- commit SHA stored on version
- branch updated after publish

### Registry Storage

- legacy upload path
- missing storage object
- checksum mismatch
- large upload rejected
- quota exceeded

### Auth

- logged out browser
- expired browser session
- CLI token missing
- CLI token invalid
- user without username
- org member vs owner
- 2FA enabled user

### Runtime

- missing provider key
- unsupported model ID
- provider timeout
- streaming interruption
- invalid persona
- prompt-injection warning
- prompt-injection block
- undeclared permission
- MCP startup failure
- cyclic sub-agent graph
- sub-agent timeout

### UI

- empty DB
- slow API
- failed API
- long package names
- long descriptions
- malformed tags JSON
- mobile filters
- keyboard navigation
- reduced motion
- high contrast
- no JavaScript for public content where possible

### Deployment

- Vercel build without optional env vars
- Neon connection pooling
- Prisma generation
- dynamic routes on build
- function timeouts
- cold starts
- CORS if SDK is browser-used
- sitemap with many packages
- robots

## Verification Matrix

Use this matrix after major changes.

| Area       | Command                                    | Manual check                |
| ---------- | ------------------------------------------ | --------------------------- |
| Schema     | `pnpm --filter @skillspace/schema test`    | Validate example YAML       |
| Runtime    | `pnpm --filter @skillspace/runtime test`   | Run one local skill         |
| Registry   | `pnpm --filter @skillspace/registry build` | Open home, packages, detail |
| CLI        | `pnpm --filter @skillspace/cli build`      | `skillspace doctor`         |
| SDK TS     | `pnpm --filter @skillspace/sdk-ts test`    | Import client in sample     |
| Full repo  | `pnpm build && pnpm test`                  | Core loop E2E               |
| Formatting | `pnpm format:check`                        | No markdown churn           |
| Lint       | `pnpm lint`                                | No new warnings             |

## Suggested Public Demo Script

This is the demo that should work before launch.

1. Open the public registry.
2. Browse `/packages`.
3. Open `@skillspace/security-review`.
4. See GitHub source, version, checksum, install command, and trust badge.
5. Copy install command.
6. In terminal:

```bash
skillspace install @skillspace/security-review
skillspace run @skillspace/security-review --input ./src
```

7. Return to registry.
8. Open `/create`.
9. Publish a new package from `owner/repo`.
10. Open package page.
11. Install that package.
12. Show lockfile pinning.
13. Show `skillspace doctor`.

If this script fails, fix the failure before building community features.

## Prompt For Gemini 3.1 Pro

Use this prompt when handing off an implementation session:

```text
You are implementing SkillSpace, a pnpm/Turborepo monorepo for a public AI
capability registry and runtime.

First read:
- AGENTS.md
- README.md
- docs/architecture.md
- docs/schema-reference.md
- docs/api.md
- docs/development.md
- docs/IMPLEMENTATION_PLAN.md

Then complete exactly one packet from AGENTS.md or one numbered task from
docs/IMPLEMENTATION_PLAN.md. Do not skip verification. Do not refactor unrelated
code. Do not delete tests. Preserve the v2 ontology: Skill is stateless Persona;
Agent is Persona plus tools/memory/permissions/orchestration; MCP is mediated by
Agent. Keep Vercel Hobby deployment viable.

Before editing, run git status and read the exact files you will touch. After
editing, run the narrowest relevant tests and report the result.
```

## Final North Star

SkillSpace succeeds when a skeptical developer can say:

"I can inspect this AI capability, install a pinned version, understand its
permissions, run it locally or in CI, publish my own from GitHub, and trust that
the registry is an index of software artifacts rather than a pile of prompts."

Everything else is secondary.
