# Development

**Status:** Accurate as of 2026-06-17

Everything you need to run SkillSpace locally and contribute.

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** 10 (`npm i -g pnpm`)
- **PostgreSQL** — local, Docker, or a free [Neon](https://neon.tech) database

---

## First-time setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local
#   Edit .env.local — DATABASE_URL and BETTER_AUTH_SECRET are required.
#   Generate a secret:  openssl rand -base64 32

# 3. Create the database schema
cd packages/database
npx prisma generate
npx prisma db push          # applies schema to your DB (no migration files needed for dev)
cd ../..

# 4. (Optional) Seed example skills
npx tsx scripts/seed-registry.ts
```

## Running the apps

```bash
pnpm dev                    # runs all apps in parallel via Turborepo
```

To run a single app:

```bash
pnpm --filter @skillspace/registry dev      # web app on :3000
pnpm --filter @skillspace/cli dev           # CLI (watch build)
```

The registry is at `http://localhost:3000`.

---

## Build, test, lint

```bash
pnpm build        # build every package + app
pnpm test         # run every test suite
pnpm lint         # eslint across the monorepo
pnpm format       # prettier write
pnpm format:check # prettier check (CI gate)
```

### Per-package

```bash
pnpm --filter @skillspace/schema build
pnpm --filter @skillspace/runtime test
pnpm --filter @skillspace/registry build
pnpm --filter @skillspace/cli test
pnpm --filter @skillspace/sdk build
```

### Expected results on a clean tree

- Build: 8/8 tasks pass
- Tests: 83 passing (74 runtime + 4 sdk + 3 cli + 2 registry)

---

## Database

Schema lives in `packages/database/prisma/schema.prisma`.

```bash
# After changing the schema:
cd packages/database
npx prisma generate          # regenerate the client
npx prisma db push           # sync schema to DB (dev only)
# For production migrations:
npx prisma migrate dev --name <change>   # creates a migration file
npx prisma migrate deploy                # applies migrations (CI/prod)
```

**Important:** the Prisma client must be generated before the registry will
typecheck. `pnpm install` does this automatically via the `prebuild` script, but
if you pull new schema changes run `npx prisma generate` manually.

---

## Git workflow

This project deploys to Vercel on every push to `master`. Keep `master` green.

1. **Branch** off `master` for any non-trivial work:
   ```bash
   git checkout -b feat/github-source
   ```
2. **Commit** with a conventional prefix:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation only
   - `chore:` tooling, deps, config
   - `refactor:` code change that neither fixes a bug nor adds a feature
3. **Verify** before pushing: `pnpm build && pnpm test`
4. **Push** and open a PR. The maintainer merges to `master`, which triggers
   Vercel.

There is no separate `develop` branch. `master` is the deploy target.

---

## Code style

- TypeScript strict mode everywhere (`packages/config-typescript`).
- Prettier + ESLint enforced (`packages/config-eslint`).
- No `any` types in new code — the codebase has a few historical ones being
  removed over time.
- Match the surrounding code's naming and comment density.

---

## Adding a new package to the monorepo

1. Create `packages/<name>/` with `package.json` (`"name": "@skillspace/<name>"`).
2. Add to `pnpm-workspace.yaml` globs if not already covered.
3. Add a `tsconfig.json` extending `@skillspace/config-typescript/base`.
4. If other packages depend on it, add `"@skillspace/<name>": "workspace:*"`.
5. `pnpm install` to wire it up.

---

## Troubleshooting

**`PrismaClient` not exported / typecheck errors in registry**
→ Run `npx prisma generate` from `packages/database`. The client isn't checked in.

**`Cannot find module '@skillspace/schema'`**
→ Build the schema package first: `pnpm --filter @skillspace/schema build`.

**pnpm prompts about modules purge on every install**
→ This is the OneDrive workspace interfering. Use `pnpm install` non-interactively,
or move the repo off OneDrive-synced storage if it recurs.

**Vercel build fails with type errors locally absent**
→ Ensure `prisma generate` runs in `prebuild` (it does in `registry/package.json`).
Check that env vars are set in the Vercel dashboard.
