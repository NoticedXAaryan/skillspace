# SkillSpace Improvement Worklog

> Working-notes doc (the "context method"). Read this to re-orient after any
> interruption. Update it as context changes. Remove docs not in the active
> dev flow (see §6).

**Last updated:** 2026-06-19
**Active session:** Packet 2 (ESLint flat-config rollout) — DEBUGGING

---

## §1. What this engagement is

Three packets, executed in sequence, each with a green checkpoint:
1. **Packet 1 ✅ DONE** — `pnpm format:check` was RED on 17 files → CI failing.
   Fixed with `pnpm format`. Verified build (8 tasks) + test (13 tasks) green.
2. **Packet 2 🔄 IN PROGRESS** — Lint is a no-op (`echo 'lint skipped'` in
   registry; no other package even has a lint script). Restore REAL flat-config
   linting.
3. **Packet 3 ⏳ PENDING** — TypeScript SDK is partly broken.

## §2. Verified project health (ground truth, 2026-06-19)

- Builds: schema, runtime, registry, cli, sdk — all green.
- Tests: schema 11, runtime 75, registry 7, cli 3, sdk 4 — all pass.
- Phase 0 (GitHub packages) genuinely done: download serves tar.gz (`apps/registry/src/app/api/packages/[name]/[version]/download/route.ts`), `verified: true` set in `github/route.ts` + `link-github/route.ts`, `build-skillpkg.ts` + tests exist.
- `doctor` has 6 real checks; `publish --github` real; `install` unverified-check real; 5/6 commands have `--json`. NOT stubs.
- Node v22.21.0, pnpm 10.11.0, Windows/OneDrive paths, `cmd.exe`.

## §3. Packet 2 plan (the current focus)

Approach: **ESLint flat config.**
- Make `packages/config-eslint` a consumable workspace package exporting a
  reusable flat-config factory. ✅ done (function `skillSpaceBase(...overrides)`).
- Library packages (schema, runtime, sdk, lsp, database, memory-mcp) + CLI =
  pure TS → use `typescript-eslint` flat config via the shared factory.
- Registry = Next.js app → React/JSX rules (separate config, see §4).
- Pinned **eslint ^9.0.0** for libraries (stable flat-config baseline; v9.39.4
  resolved). Registry keeps eslint 10 for Next plugin compat.

## §4. CURRENT BLOCKER — `Unexpected token '*'`

**Symptom:** `pnpm --filter @skillspace/schema lint` (ESLint 9.39.4) fails:
```
SyntaxError: Unexpected token '*'
    at compileSourceTextModule (node:internal/modules/esm/utils:346:16)
    at ModuleLoader.moduleStrategy ...
```
Same error when importing `@skillspace/config-eslint` from Node directly.

**Ruled out:**
- My `eslint.config.mjs` source is syntactically valid (hex dump confirms no
  BOM, content parses; Node 22 supports the syntax).
- `import tseslint from 'typescript-eslint'` loads fine from the
  `config-eslint` dir (returns `function`).
- Not a CRLF/encoding issue in my file (bytes 0-2 = `696d70` = "imp").

**ROOT CAUSE FOUND (2026-06-19):** `typescript-eslint` is NOT resolvable from
consuming packages. pnpm's strict node_modules means `typescript-eslint` (a dep
of `@skillspace/config-eslint`) lives only in `config-eslint/node_modules`. When
schema's config imports the shared factory, which top-level-imports
`typescript-eslint`, Node tries to resolve `typescript-eslint` relative to the
*schema importer* → `ERR_MODULE_NOT_FOUND`. The "Unexpected token '*'" was a
masking red herring.

**FIX (chosen):** Each consuming package gets `typescript-eslint` + `eslint` as
**direct devDependencies** (the official typescript-eslint shared-config
pattern). The shared `@skillspace/config-eslint` factory still owns the rules
and ignores, but consumers supply the `tseslint` instance to it, OR consumers
import typescript-eslint directly. Simplest robust approach: shared config is a
plain rules-array builder that does NOT import typescript-eslint at module load;
consumers spread `...tseslint.configs.recommended` + call the builder.

## §5. Packet 3 plan (not started)

SDK at `packages/sdk-ts/src/index.ts`:
- Fix module system: `require(...)` in ESM-emitted code → top-level `import`.
- Fix base URL: `registry.skillspace.ai/api/v1` → match CLI `skillspace-registry.vercel.app/api`.
- Fix envelope: SDK wants `{success,data}`; canonical is `{data}`/`{error:{...}}`. Accept both.
- Add 4 methods: `getPackage`, `install`, `publish`, `publishFromGitHub` (mirror `apps/cli/src/utils/api.ts:114-170`).
- Tests: extend `__tests__/sdk.test.ts` (uses injected `fetch` mock pattern).

## §6. Docs cleanup status

- `docs/archive/` — historical only, not authoritative (per AGENTS.md). Keep but
  not part of active flow.
- To review for removal/consolidation after packets done.

## §7. Key file:line references

- Registry no-op lint: `apps/registry/package.json:10`
- Orphaned flat config (now wired): `packages/config-eslint/eslint.config.mjs`
- Registry legacy config (incompatible w/ ESLint 10): `apps/registry/.eslintrc.json`
- CI runs lint+format: `.github/workflows/ci.yml:29-30`
- CLI API client (mirror target for SDK): `apps/cli/src/utils/api.ts:114-170`
- Canonical envelope: `apps/registry/src/lib/api-response.ts`

## §8. Code graph (graphify) — navigation aid

> **Pick-up guide for any new instance:** if you have no context, run the two
> commands below first. The graph lets you answer "where is X / who calls X /
> what does changing X break" without grepping blindly.

### ⚡ 30-second onboarding for a fresh instance

```bash
# 1. Is the graph present and fresh? (gitignored, lives in graphify-out/)
ls graphify-out/graph.json                       # present?
git rev-parse HEAD                               # compare to build commit below

# 2. If missing OR build commit != HEAD, rebuild (AST-only, ~seconds, no API key):
graphify update .
#    add --force only after a refactor that DELETED code (graph otherwise shrinks)
```

Then orient with these (node = any function/type/file/class name):

```bash
graphify explain "getUserFromRequest"            # what is this + its neighbors
graphify path "installCommand" "buildSkillpkgFromManifest"   # how A reaches B
graphify query "how is a package published from github"      # BFS answer
graphify affected "parseGitHubUrl"               # what breaks if I change X
```

Open `graphify-out/graph.html` in a browser for the interactive force-graph, or
read `graphify-out/GRAPH_REPORT.md` for the god-nodes / communities summary.

### What the graph IS and ISN'T

- **IS:** an AST-level index of 474 code files → 3460 nodes / 4554 edges. Edges
  are `calls`, `imports`, `contains`. ~99% EXTRACTED, ~1% INFERRED (flagged).
- **IS:** gitignored (`graphify-out/` in `.gitignore`) — never committed, never
  conflicts, rebuildable anywhere.
- **IS:** cached in `graphify-out/cache/` so `update` only re-extracts changed
  files.
- **ISN'T:** authoritative truth — always confirm a finding by reading the cited
  `file:line`. INFERRED edges can be wrong.
- **ISN'T:** a substitute for the tests in §2 / AGENTS.md verification matrix.

### When to rebuild

- After **any** code edit that adds/removes/renames a symbol: `graphify update .`
- After a **delete-heavy refactor**: `graphify update . --force`
- Community labels stay as "Community N" unless you run `graphify label .`
  (needs an API key; not required for navigation).

---

A `graphify` code graph was built on 2026-06-19 to orient quickly after
context loss. `graphify-out/` is gitignored (see `.gitignore`).

- **Build cmd:** `graphify update .` (no LLM/API cost; AST-only).
- **Result:** 3460 nodes · 4554 edges · 316 communities · 474 files · ~294k
  words. Built from commit `28da7e05`.
- **Outputs:** `graphify-out/graph.json` (machine), `graphify-out/graph.html`
  (visual), `graphify-out/GRAPH_REPORT.md` (report), `graphify-out/cache/`
  (incremental cache).
- **After code changes:** re-run `graphify update .`. Use `--force` if a
  refactor deletes code (graph would otherwise shrink). The report stamps the
  build commit; compare with `git rev-parse HEAD` to detect staleness.
- **Useful subcommands:**
  - `graphify query "<question>"` — BFS traversal for a question.
  - `graphify explain "<node>"` — node + its neighbors.
  - `graphify path "A" "B"` — shortest path between two nodes.
  - `graphify affected "X"` — reverse traversal; what X impacts.
  - `graphify tree` — collapsible-tree HTML view.

### God nodes (core abstractions, by edge count)

1. `cn()` (67) — `apps/registry/src/lib/utils.ts`, the `cn()` class-merge util
   used everywhere in the registry UI.
2. `getUserFromRequest()` (34) — `apps/registry/src/lib/auth.ts:48`, the
   authenticated-route helper (AGENTS.md rule #9).
3. `Button` (30) — registry UI primitive.
4. `SkillCache` (25) — `packages/runtime` resolver cache.
5. `RegistryClient` (24) — registry HTTP client (CLI side).
6. `errorOperational()` (23) — CLI error envelope.

### Key communities (sanity-checked against §2 ground truth)

- **C8 (cohesion 0.10):** Model adapters — `ModelAdapter`, `ClaudeAdapter`,
  `GeminiAdapter`, `OllamaAdapter`, `OpenAIAdapter`, `AdapterRegistry`.
- **C10:** Runtime firewall — `INJECTION_RULES`, `ScanFinding`, `ScanResult`,
  `applyInputMapping()` (relevant to Packet: Phase E / Packet 008).
- **C11:** Resolvers — `AgentResolver`, `SkillResolver`, `SkillCache`,
  `VersionNotFoundError`.
- **C12:** v2 schema — `Agent`, `AgentSchema`, `MCPRef`, `Persona`, `PersonaRef`
  (the ontology AGENTS.md says to preserve).
- **C18/C19:** Runtime + CLI dependency surfaces (schema, MCP sdk, semver,
  commander, @clack/prompts).
- **C31:** CLI config/credentials — `CONFIG_FILE`, `CREDENTIALS_FILE`,
  `getDefaultModel()` (relevant to Packet D / `doctor`).
- **C35 (cohesion 0.17):** Executors — `AgentExecutor`, `WorkflowEngine`,
  `getApiKey()`.
- **C63:** GitHub package path — `parseGitHubUrl()`, `fetchGitHubFile()`,
  `fetchPackageFromGitHub()`, `getFileCommitSha()` (Phase A core loop).
- **C94:** Download path — `buildSkillpkgFromManifest()`, `readPackage()`,
  `packageExists()`, storage helpers (Phase A core loop).

### Verified core-loop wiring (via graph traversal)

`graphify query "How does a GitHub-backed package get downloaded and served as a
.skillpkg?"` returns a coherent BFS that confirms the WORKLOG §2 claims:

- `download/route.ts` `GET()` → `buildSkillpkgFromManifest()` (C94) and
  `fetchGitHubFile()` (C63). ✅ matches Packet 002 acceptance.
- `github/route.ts` + `link-github/route.ts` `POST()` → `fetchGitHubFile()` /
  `fetchPackageFromGitHub()`. ✅ Phase A steps 2–3.
- `build-skillpkg.test.ts` imports `buildSkillpkgFromManifest`. ✅ tests exist.
- `parseGitHubUrl()` in `apps/registry/src/lib/github.ts:38`. ✅ Packet 002.

### Surprising connections (graph flagged, INFERRED)

Registry `POST()` handlers call `scanPersona()` (persona-firewall) — this is
the publish-time scan path. Worth keeping in mind for the security/trust
packets (Phase E): publish routes touch the runtime firewall directly.

### Import cycles

None detected — the `schema -> runtime -> cli / registry / sdk-ts / lsp`
dependency graph in AGENTS.md is acyclic as claimed.

### Notes / caveats

- Community labels are placeholder names ("Community N"). `graphify label .`
  would LLM-name them but requires an API key and is not needed for
  navigation. Leave as-is for now.
- `graphify-out/cache/` makes incremental `update` runs fast (only changed
  files re-extract).
