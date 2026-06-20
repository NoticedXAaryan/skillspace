# SkillSpace Web UI Rebuild — Context & Contract

> Source of truth for the web UI rebuild. Read this before touching any
> `apps/registry` UI file. Kept concise to avoid confusion.

## 1. What we are doing

Blind rebuild of the **registry web UI** (`apps/registry`). Strip the current
"black + cyan glow, rounded-3xl, backdrop-blur, GSAP spectacle, magic-ui bento
grids" aesthetic and replace it with a **restrained, professional, technical
registry** — shadcn/ui primitives, dense information design, real product data,
zero invented metrics.

Guided by `AGENTS.md` "Design And UI/UX Standard" section, which explicitly
lists the current risks we are removing.

## 2. Stack (already installed — DO NOT add deps)

From `apps/registry/package.json`:

- Next.js 15 App Router, React 19, TypeScript
- Tailwind 3.4 + `tailwindcss-animate`
- shadcn-style primitives via Radix: `@radix-ui/react-{accordion,dialog,
  dropdown-menu,icons,label,navigation-menu,select,slot}`
- `class-variance-authority`, `clsx`, `tailwind-merge` (→ `cn()` in
  `src/lib/utils.ts`)
- `lucide-react` (icons), `cmdk` (command palette / combobox), `sonner` (toasts)
- `framer-motion` (motion — keep, but use sparingly for opacity/transform only)
- `recharts` (charts for analytics/dashboard)
- `next-mdx-remote` + `marked` + `shiki` (docs rendering)
- `better-auth` (auth), `zod` (validation)
- Fonts via `next/font/google`: **Inter** (sans) + **JetBrains Mono** (mono)

**No new dependencies.** "Externity UI / cool AI platforms / other MCPs" → we
use what ships. shadcn/ui + Radix + tailwindcss-animate + lucide + recharts is
already a complete professional design system. We rebuild the components to a
cohesive standard rather than pulling scattered third-party "magic-ui" widgets.

## 3. Design language (the new standard)

- **Theme:** dark-first, single mode. Pure-black background is out — use a
  near-black surface system with subtle elevation, NOT glows.
- **Color tokens** (HSL, in `globals.css`). Replace the cyan-glow palette with a
  restrained neutral + one confident accent. New tokens:
  - `--background` 0 0% 3.5% (near-black, not pure)
  - `--foreground` 0 0% 98%
  - `--card` 0 0% 5%, `--card-foreground` 0 0% 96%
  - `--muted` 0 0% 11%, `--muted-foreground` 0 0% 63%
  - `--border` 0 0% 14%, `--input` 0 0% 14%
  - `--primary` 142 71% 45% (emerald — "verified/safe" reads as brand)
  - `--primary-foreground` 0 0% 100%
  - `--accent` 217 91% 60% (blue — for links/interactive highlights)
  - `--destructive` 0 72% 51%
  - chart-1..5 semantic set
- **Radius:** `--radius: 0.5rem` max for operational UI; cards 0.5rem, not 3xl.
- **Borders:** 1px subtle `border`, no blur halos, no gradient hero bars.
- **Motion:** framer-motion only. Animate opacity + translateY, ≤300ms. Respect
  `prefers-reduced-motion`. Remove all GSAP + ScrollTrigger usage.
- **Type scale:** Inter, tight tracking on headings, JetBrains Mono for code,
  package names, versions, checksums, commands.
- **Density:** registry/dashboard use tables and structured rows, not nested
  glowing cards.

## 4. Component system (`src/components/ui/`)

Rebuild to shadcn standard. Keep existing good primitives (`button`, `badge`,
`input`, `card`, etc.), fix variants. Add the missing standard set so every
page composes from the same kit:

button, badge, card, input, label, textarea, select, dialog, sheet,
dropdown-menu, navigation-menu, accordion, tabs, tooltip, separator, skeleton,
avatar, table, checkbox, switch, sonner(toaster), command(cmdk), alert,
scroll-area, tooltip, progress, alert-dialog, breadcrumb, popover, radio-group,
form (react-hook-form not installed — use native + zod, or skip form wrapper).

A standardized **Badge** variant map is mandatory (AGENTS.md C1.7):
`verified | unverified | github | registry | model | deprecated | private |
scan-warning | type(skill/agent/workflow/mcp)`.

## 5. Shared building blocks (new, in `src/components/`)

- `<SiteHeader />` / `<SiteFooter />` — replace Navbar/Footer. Header = logo,
  primary nav (Browse, Docs, Playground, Pricing-anchor), search trigger, auth
  menu. NOT a floating pill. Standard sticky bar with `border-b`.
- `<PackageCard />` — meets AGENTS.md "Package Card Requirements": name, type
  badge, description, author, version, downloads, verification, source type,
  model compat, capped tags, copy-install command. No hover-only reveals.
- `<PackageRow />` — dense table row variant for browse/dashboard.
- `<InstallCommand />` — copy-to-clipboard mono block, reused everywhere.
- `<TrustBadges />` — verified/source/model/scan composite.
- `<EmptyState />` — title + reason + CTA (AGENTS.md "Empty State Requirements").
- `<StatCard />` / `<PageHeader />` / `<Section />` — layout primitives.
- `<ThemeToggle />` (optional, dark-only is fine for v1).

## 6. Data contracts (the backend we must match — DO NOT change)

Prisma models (`packages/database/prisma/schema.prisma`):

- **Package**: id, type(`skill|agent|workflow|mcp|knowledge`), name (unique,
  scoped `@scope/name`), scope, ownerId→User, orgId→Organization, description,
  tags(JSON string), downloads, verified, isPrivate, githubUrl, githubBranch
  (default `main`), githubPath, verifiedBy, verifiedAt, createdAt. Relations:
  owner, versions, executions, benchmarks, stars, reviews, discussions.
- **PackageVersion**: packageId, version, manifest(string), storagePath,
  checksum(`sha256:…`), size, deprecated, githubCommit, publishedAt.
  `@@unique([packageId, version])`.
- **User**: id, name, email, image, username, plan(`free|…`), bio, banner,
  github, website, twitter, storageUsed/Quota, twoFactorEnabled, onboarding.
- **ExecutionLog**, **BenchmarkScore**, **Star**, **Review**, **Collection**,
  **Discussion(+Comments)**, **ShowcaseProject**, **RoadmapItem(+Vote)**,
  **Organization(+OrgMember, Invite, AccessPolicy, PackageAllowlist)**,
  **PlaygroundSession**.

API helpers (`src/lib/api-response.ts`):
- `success(data, meta?)` → `{ data, meta:{page,limit,total}? }`
- `error(code, message, status, details?)` → `{ error:{code,message,details} }`
- `unauthorized`, `notFound`, `rateLimited`.

Auth (`src/lib/auth.ts`): Better Auth. Server: `auth.api.getSession({headers})`.
Route helper: `getUserFromRequest(req)` → `{userId, username, email} | null`.
Client: `authClient` from `src/lib/auth-client.ts`, `authClient.useSession()`.

`GET /api/packages` query: `type, sort(popular|recent|name), search|q, page,
limit`. Response item: full Package + `tags[]` + `latestVersion`, meta paginate.

`inferModelCompatibility(manifest)` → `string[]` (`claude|openai|gemini|ollama`).

## 7. Routes to rebuild (page list)

Public/marketing: `/` (landing). Registry: `/packages`, `/packages/[name]`,
`/packages/[name]/[version]`, `/packages/[name]/[version]/diff`, `/search`,
`/trending`, `/showcase`, `/analytics`, `/roadmap`. Dev: `/docs`, `/docs/[...]`,
`/playground`. Create: `/create`. Auth: `/login`, `/register`. App:
`/dashboard` (+ subroutes: packages, playground, settings, api-keys, activity,
analytics, collections, organizations). Misc: `/terms`, `/privacy`, `/security`.

## 8. The "perfect dashboard" bar

User quote: *"screams professionally built … no edge cases unhandled … perfect
down to the minutest detail."* Concretely this means:

- Server-rendered, auth-guarded, redirect-to-login when unauthenticated.
- Full dashboard **shell** with persistent sidebar nav + top bar (consistent
  across all `/dashboard/*`).
- Pages: Overview, Packages, Analytics, Playground, API Keys, Settings
  (profile + provider keys + security/2FA), Activity, Collections,
  Organizations.
- Every page: loading skeletons, empty states, error boundaries, optimistic +
  confirmed actions via `sonner` toasts, accessible focus rings, working forms
  with inline zod validation, responsive at 320/375/414/768/1024/1440.
- Tables with sort/pagination, copy buttons, confirm dialogs for destructive
  actions, keyboard-reachable controls.
- Real data only; honest empty states; no invented numbers.

## 9. Non-negotiables (from AGENTS.md)

- Keep core loop: publish, browse, install, run.
- Do NOT rewrite unrelated files; smallest set per task.
- Do NOT delete tests/docs/migrations.
- Do NOT add paid infra as a hard requirement.
- Do NOT invent metrics/testimonials/adoption claims.
- No `new PrismaClient()` in pages/routes — use `@/lib/prisma`.
- Use `@/lib/api-response.ts` helpers for API responses.
- Use `getUserFromRequest(req)` for authenticated routes.
- Preserve v2 ontology: Skill/Agent/MCP/Workflow/Persona/Lockfile.
- Keep pages usable with empty DB and absent/expired auth.
- Deterministic install/download for scoped names.
- Vercel Hobby-viable: no Redis, no long jobs, GitHub as source of truth.
