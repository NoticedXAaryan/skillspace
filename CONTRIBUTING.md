# Contributing to SkillSpace

Welcome! SkillSpace is an MIT-licensed public package manager for AI capabilities. We welcome community contributions.

## Prerequisites

- Node.js 20+
- pnpm 10
- PostgreSQL (local or remote, e.g., Neon free tier)

## Setup

1. **Clone and install dependencies:**

   ```bash
   git clone https://github.com/skillspace/skillspace.git
   cd skillspace
   pnpm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env.local` and configure your database and authentication secrets.
   - `DATABASE_URL` — PostgreSQL connection string
   - `BETTER_AUTH_SECRET` — run `openssl rand -base64 32` to generate

3. **Initialize the Database:**

   ```bash
   cd packages/database
   npx prisma generate
   npx prisma db push
   ```

4. **Start the Development Server:**
   ```bash
   cd ../../
   pnpm dev
   ```

## Project Structure

SkillSpace is a Turborepo monorepo:

- `apps/registry/` — Next.js web application
- `apps/cli/` — CLI tool for developers
- `apps/vscode/` — VSCode extension for authoring skills
- `packages/schema/` — Shared Zod schemas
- `packages/runtime/` — Execution engine
- `packages/database/` — Prisma ORM schema and migrations

## Making Changes

- Create a feature branch off `master`.
- Use conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Run focused tests locally as you develop.

## Before Submitting a PR

Run the verification commands from the repository root and ensure all pass:

```bash
pnpm build
pnpm test
pnpm lint
pnpm format:check
```

## Implementation Plan

If you're picking up new tasks or want to understand our roadmap, please refer to the `docs/IMPLEMENTATION_PLAN.md`.

## Good First Issues

Looking for a place to start? We recommend:

- Adding unit tests for missing components.
- Improving documentation.
- Adding `--json` output support for CLI commands.
