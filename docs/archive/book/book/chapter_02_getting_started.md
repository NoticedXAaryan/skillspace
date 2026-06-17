# Chapter 2: Getting Started — Your Development Environment

This chapter provides a step-by-step guide to cloning, configuring, and running the SkillSpace monorepo locally. Because SkillSpace encompasses a Next.js Registry Server, a Node.js/Bun CLI, and shared runtime libraries, strict adherence to these setup procedures is crucial. We assume no prior context; if you follow these steps, you will have a fully functioning local environment.

---

## 1. Prerequisites

Before touching the codebase, ensure that your local machine meets the following strict requirements. The monorepo heavily relies on specific toolchain versions.

*   **Node.js (>= 20.0.0):** Required for the Next.js server, CLI, and general TypeScript compilation. Use `nvm` or `fnm` to manage this.
*   **pnpm (>= 11.5.0):** SkillSpace strictly uses `pnpm` for workspace management. Do not use `npm` or `yarn`. 
*   **PostgreSQL:** Required for the local Registry Server backend. You can install it locally via Homebrew/apt, or run it via Docker (`docker run --name skillspace-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`).
*   **Docker (Optional but recommended):** For spinning up isolated database and S3/MinIO instances.
*   **Bun (Optional but recommended):** While the CLI can run on Node, Bun is highly recommended for faster execution and is used internally for bundling the final binaries.

---

## 2. Cloning and Initial Setup

Clone the repository and install the dependencies. The `pnpm install` command will resolve all workspace packages (`@skillspace/runtime`, `@skillspace/schema`, etc.) and link them appropriately.

```bash
# 1. Clone the repository
git clone https://github.com/skillspace/skillspace.git
cd skillspace

# 2. Install workspace dependencies
pnpm install

# 3. Build all shared packages to ensure types are generated
pnpm run build
```

> **Note:** If `pnpm run build` fails immediately after cloning, ensure you are on Node 20+ and that your `pnpm` version is at least 11.5.0.

---

## 3. Environment Configuration

SkillSpace relies on environment variables for both global security features and local registry database connections. 

**Global Environment Configuration (`.env`)**
Copy the `.env.example` in the root of the project to `.env`. This controls the execution sandbox and Model Context Protocol (MCP) bounds.

| Variable | Default Value | Description | What Breaks if Wrong |
| :--- | :--- | :--- | :--- |
| `FIREWALL_ENABLED` | `true` | Enables the `LocalModelScreener` which intercepts inputs looking for LLM injection attacks. | If `true` but `FIREWALL_MODEL` is misconfigured, execution halts with a `FirewallBlockedError`. |
| `FIREWALL_MODEL` | `ollama/llama3` | The model used exclusively for inspecting incoming requests for malicious content. | The screener will fail to instantiate. |
| `MCP_ALLOWED_TRANSPORTS`| `stdio,http` | The transport layers authorized for local MCP tools. | MCP server connections will be refused. |
| `MCP_HTTP_ALLOWLIST` | `http://localhost:3001...` | Comma-separated list of allowed URLs for remote MCP servers. | Remote MCP tools will be blocked by the `McpRegistry`. |

**Registry Environment Configuration (`apps/registry/.env`)**
You must also configure the Registry Server. Create a `.env` inside `apps/registry/`:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | Your local PostgreSQL connection string (e.g., `postgresql://postgres:password@localhost:5432/skillspace`). |
| `JWT_SECRET` | Yes | A 32+ character random string used for signing authentication tokens. |

---

## 4. Database Setup (Registry Server)

Once your `DATABASE_URL` is configured, you must initialize the database schema using Prisma.

```bash
cd apps/registry

# 1. Push the schema to the database (creates tables)
npx prisma db push

# 2. (Optional) Generate the Prisma client explicitly
npx prisma generate
```

> **Tip:** We use `db push` for local development to quickly prototype schema changes. For production deployments, we strictly use `npx prisma migrate deploy`.

---

## 5. Running the Development Server

Because this is a Turborepo, you can spin up the entire development environment from the project root using a single command.

```bash
# From the project root:
pnpm run dev
```

**What this command does:**
1.  **Starts the Next.js Registry Server** on `http://localhost:3000`. Watch the terminal for `ready - started server on 0.0.0.0:3000`.
2.  **Starts the TypeScript compilers** in watch mode for `@skillspace/runtime`, `@skillspace/schema`, and the `apps/cli`.
3.  Any changes made to the `packages/runtime/src/executor.ts` will instantly trigger a recompilation, making those changes immediately testable via the CLI.

---

## 6. Testing the CLI Locally

To test the CLI locally without installing the compiled binary globally, use the `pnpm` executable within the `apps/cli` package, or invoke it directly via Node/Bun.

```bash
cd apps/cli

# Use tsx or bun to run the CLI directly from source:
npx tsx src/index.ts list
npx tsx src/index.ts search "security"
```

To configure your local models (like Ollama or OpenAI) to test the `run` command:

```bash
npx tsx src/index.ts model add openai
npx tsx src/index.ts model test openai
```

---

## 7. Running Tests

SkillSpace employs both unit tests and end-to-end (E2E) integration tests.

```bash
# Run all unit tests across all packages
pnpm run test

# Run the End-to-End CLI tests sequentially
pnpm run test:e2e
```

**What does a passing run look like?**
A passing E2E test suite will spin up a mock registry, simulate user logins, publish a mock skill, install it, and execute it using a mocked HTTP adapter. You should see 100% pass rates across Jest suites.

---

## 8. Common Setup Problems and Solutions

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| **`PrismaClientInitializationError`** | The Next.js API cannot reach the database. | Ensure PostgreSQL is running on port 5432 and the credentials in `apps/registry/.env` are correct. |
| **`Cannot find module '@skillspace/schema'`** | Monorepo symlinks are broken or the package hasn't been built. | Run `pnpm install` then `pnpm run build` from the root. |
| **`EADDRINUSE: address already in use :3000`** | Another service is using port 3000. | Kill the process using port 3000, or change the Next.js port in `package.json`. |
| **`API key not configured for "openai"`** | Missing CLI configuration. | Run `skillspace model add openai` to store your key in `~/.skillspace/config.yaml`. |
| **`Checksum mismatch` during `install`** | Corrupted local cache or manipulated `.skillpkg`. | Run `skillspace uninstall <package>` and try installing again. |

---

## 9. Editor Setup

We heavily recommend **Visual Studio Code (VS Code)** or **Cursor**. 

**Recommended Extensions:**
*   `Prisma` (for `.prisma` syntax highlighting)
*   `Prettier - Code formatter`
*   `ESLint`
*   `YAML` (by RedHat, for editing `skill.yaml` manifests)

Ensure your editor is configured to use the workspace's TypeScript version rather than its bundled version to prevent false-positive type errors.

---

## 10. The Development Loop

The typical inner loop for a developer contributing to SkillSpace looks like this:

1.  **Start Watchers:** Run `pnpm run dev` in the root.
2.  **Make Changes:** Edit a core file (e.g., `packages/runtime/src/executor.ts`). The watcher recompiles it in milliseconds.
3.  **Observe Results:** Run the CLI locally (`npx tsx apps/cli/src/index.ts run test-skill`) to observe the execution change.
4.  **Run Tests:** Execute `pnpm run test` to ensure your change didn't break existing parsing logic.
5.  **Commit:** Stage changes and write a Conventional Commit message (e.g., `feat(runtime): add support for streaming chunk limits`).
