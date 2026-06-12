# SkillSpace Rebuild Plan

**Date:** 2025-06-12
**Status:** Ready for execution

---

## Executive Summary

SkillSpace has the right architecture (monorepo, v2 schema, runtime, registry) but the frontend is overloaded with animations and components that don't serve the product, many pages link to routes that don't exist, and the examples are all v1 format. This plan strips away the noise, rebuilds the UI with purpose, and creates a clear path from "codebase" to "product."

---

## Phase 1: Foundation Cleanup (Days 1-3)

### 1.1 Naming & Package Cleanup
- [ ] Rename CLI binary from `air` to `skillspace` (or decide final name)
- [ ] Standardize all package names: `@skillspace/*` (drop `@air/*`)
- [ ] Remove unused CLI dependencies: `picocolors`, `ora`, `inquirer`, `node-fetch`
- [ ] Delete dead code: `apps/cli/src/utils/output.ts`
- [ ] Delete stale directories: `@air/test-skill3/`, `testing-sandbox/`
- [ ] Remove `.env` from repo, add to `.gitignore`
- [ ] Add `BETTER_AUTH_SECRET` to `.env.example`

### 1.2 Prisma Connection Pooling
- [ ] Fix 5 pages that create `new PrismaClient()` directly:
  - `search/page.tsx`
  - `showcase/page.tsx`
  - `roadmap/page.tsx`
  - `contributors/page.tsx`
  - `requests/page.tsx`
- [ ] All should import from `@/lib/prisma` singleton

### 1.3 Example Skills Migration
- [ ] Convert all 10 example skills from v1 to v2 format (persona-based)
- [ ] Add `schemaVersion: 2` to each
- [ ] Replace `instructions:` with `persona:` blocks
- [ ] Use scoped names `@skillspace/<name>`

### 1.4 Commit & Push
- [ ] Commit all Phase 1 changes
- [ ] Push to GitHub

---

## Phase 2: Landing Page Rebuild (Days 4-7)

### Problem
The current landing page has 8+ animation components (HeroSection, DynamicGooeyBackground, ContainerScroll, AhaSection, HowItWorksTimeline, FeaturesSection, LampCTA, GithubCommunityCTA). It's visually impressive but:
- Loads slowly (Framer Motion + particles + sparkles)
- Doesn't communicate the product clearly
- Too many visual effects distract from the message

### New Landing Page Structure

**Remove:** DynamicGooeyBackground, ContainerScroll, AhaSection, LampCTA, GithubCommunityCTA, SparklesCore, TypewriterEffect

**Keep & Improve:** HeroSection (simplified), WorksWithStrip, FeaturesSection, HowItWorksTimeline

**New sections:**

```
1. NAV — Sticky, blur backdrop, clean links
2. HERO — "Install AI capabilities like npm packages"
   - Subhead: "Share, version, and run AI skills across any model"
   - CTA: "Get Started" + "Browse Registry"
   - Terminal demo: skillspace install @skillspace/security-review
3. HOW IT WORKS — 3 steps
   - Install → Run → Share
   - Each with code example
4. FEATURES — 3 cards
   - Cross-model portability
   - Version control for AI
   - Team collaboration
5. EXAMPLES — Live skill cards from registry
6. CTA — "Start building with SkillSpace"
```

### Design Principles (from UI_UX/SKILL.md)
- Dark theme, clean typography
- No stock imagery, no AI-generated visuals
- Code blocks as hero visuals
- Max 3 sections above the fold
- Sticky navbar with blur backdrop

---

## Phase 3: Registry Pages Rebuild (Days 8-14)

### 3.1 Package Listing Page (`/packages`)
- [ ] Clean card layout: name, description, version, downloads, tags
- [ ] Filter by type: Skills, Agents, MCPs
- [ ] Sort: Popular, Recent, Name
- [ ] Pagination
- [ ] Empty state with CTA

### 3.2 Package Detail Page (`/packages/[name]`)
- [ ] Header: name, version, author, downloads, stars
- [ ] Tabs: README, Versions, Examples
- [ ] Install command: `skillspace install @scope/name`
- [ ] Version history table
- [ ] Related packages

### 3.3 Search Page (`/search`)
- [ ] Full-text search with instant results
- [ ] Filter by type, tags
- [ ] Search result cards

### 3.4 Create/Publish Page (`/create`)
- [ ] Wire up to real `POST /api/packages` endpoint
- [ ] Step 1: Choose type (Skill/Agent/MCP)
- [ ] Step 2: Fill metadata (name, description, tags)
- [ ] Step 3: Upload `.skillpkg` file
- [ ] Step 4: Review & publish
- [ ] Success page with install command

### 3.5 Dashboard (`/dashboard`)
- [ ] Stats: packages published, total downloads, recent executions
- [ ] Package list with actions (view, deprecate)
- [ ] Quick links: publish, browse registry

### 3.6 Playground (`/playground`)
- [ ] Select a skill from registry
- [ ] Enter input
- [ ] Run and see output
- [ ] This is the "try before you install" feature

---

## Phase 4: Auth & User Flows (Days 15-17)

### 4.1 Login/Register
- [ ] BetterAuth email/password + GitHub OAuth working
- [ ] Session-based auth (cookies)
- [ ] Redirect to dashboard after login

### 4.2 Profile Page
- [ ] User info, published packages
- [ ] Public profile at `/profile/[username]`

### 4.3 Organization Management
- [ ] Create org, invite members
- [ ] Org-scoped packages

---

## Phase 5: Production Readiness (Days 18-21)

### 5.1 Dockerfile Fix
- [ ] Enable `output: 'standalone'` in `next.config.ts`
- [ ] Fix Dockerfile to work with standalone output

### 5.2 Environment Configuration
- [ ] `.env.example` with all required vars
- [ ] `BETTER_AUTH_SECRET` generation
- [ ] Database connection pooling config

### 5.3 Error Handling
- [ ] Global error boundary
- [ ] 404 page improvement
- [ ] Loading states for all async pages

### 5.4 SEO & Meta
- [ ] OG images for package pages
- [ ] Meta tags for all pages
- [ ] Sitemap generation

### 5.5 Final Commit & Push
- [ ] All changes committed
- [ ] Full test suite passing
- [ ] Production build verified

---

## What Makes SkillSpace Useful

The core value proposition is: **AI capabilities should be as portable and reproducible as software packages.**

Right now, prompts live in Notion docs, Slack messages, personal files. Different team members use different versions. There's no lock file, no diff, no rollback.

SkillSpace solves this by:
1. **Versioning** — Every AI capability has a semver version
2. **Portability** — A skill works on Claude, GPT-4, Gemini with zero changes
3. **Discovery** — `skillspace search security` finds what you need
4. **Reproducibility** — `skillspace.lock` ensures identical environments
5. **Security** — Permissions are declared and enforced at runtime

The CLI is the primary interface:
```
skillspace install @skillspace/security-review
skillspace run security-review --input ./src
skillspace publish
```

The registry is the discovery layer:
- Browse packages
- See examples and documentation
- Track downloads and usage

---

## Execution Priority

| Priority | What | Why |
|----------|------|-----|
| P0 | Phase 1 (Cleanup) | Foundation must be clean before building |
| P0 | Phase 2 (Landing) | First impression determines adoption |
| P1 | Phase 3 (Registry) | Core product value |
| P1 | Phase 4 (Auth) | Required for publishing |
| P2 | Phase 5 (Production) | Deployment readiness |

---

## Success Criteria

After this plan is executed:
1. `pnpm build` passes with zero errors
2. `pnpm test` passes with zero failures
3. Landing page clearly communicates the product value
4. Users can browse, search, and install packages
5. Users can publish packages (with auth)
6. The app deploys to Vercel/production without issues
7. All example skills are v2 format
8. No dead code, no unused dependencies
