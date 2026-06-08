# Chapter 20: Scripts and Tooling Reference

This chapter catalogs the `pnpm` scripts defined across the monorepo. Due to the Turborepo architecture, you rarely need to execute scripts within a specific sub-folder; instead, you trigger them from the root.

---

## 1. Root Scripts (`/package.json`)

These commands orchestrate tasks across all packages using Turborepo.

*   **`pnpm run dev`**
    *   Starts the Next.js registry on port 3000 and spins up the TypeScript compiler in `--watch` mode for `@skillspace/runtime` and `@skillspace/schema`.
*   **`pnpm run build`**
    *   Compiles all packages. Generates `.d.ts` declaration files for the schema and runtime, and creates the Next.js production build.
*   **`pnpm run test`**
    *   Executes all unit tests (`*.test.ts`) across all packages.
*   **`pnpm run test:e2e`**
    *   Executes the heavy integration tests located in `/e2e`. Requires a local PostgreSQL database to be running.
*   **`pnpm run lint`**
    *   Runs ESLint across the entire workspace.
*   **`pnpm run format`**
    *   Runs Prettier, automatically fixing formatting issues in all `.ts`, `.tsx`, and `.yaml` files.
*   **`pnpm run clean`**
    *   Deletes all `dist/`, `.turbo/`, and `node_modules/` directories, completely resetting the workspace state.

---

## 2. Registry Scripts (`apps/registry/package.json`)

While `pnpm run dev` from the root handles standard running, database operations must be run from within the `apps/registry` directory.

*   **`npx prisma db push`** (Development Only)
    *   Synchronizes your local PostgreSQL database with the `schema.prisma` file without generating migration history.
*   **`npx prisma studio`**
    *   Opens a local web UI (usually port 5555) to visually inspect and edit the rows in your local database. Highly recommended for debugging package states.
*   **`npx prisma migrate dev --name <desc>`**
    *   Generates a new `.sql` migration file. Run this before committing schema changes.
*   **`npx prisma migrate deploy`** (Production Only)
    *   Applies pending migrations to a production database.

---

## 3. CLI Scripts (`apps/cli/package.json`)

*   **`pnpm run build`**
    *   Uses Bun (or `esbuild`) to compile the CLI into a single, highly optimized JavaScript file located in `dist/index.js`.
*   **`pnpm run start`**
    *   Executes the compiled `dist/index.js`. Used to test the production artifact locally.
