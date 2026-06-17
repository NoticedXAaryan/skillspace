# Chapter 19: Complete Dependency Reference

This chapter categorizes and justifies every major third-party dependency used in the monorepo. Before adding a new dependency to `package.json`, consult this list to see if we already have a library that serves the purpose.

---

## 1. Global Monorepo Tooling
Defined in the root `package.json`.

| Package | Purpose | Why we use it |
| :--- | :--- | :--- |
| `turbo` | Build Orchestration | Drastically reduces CI times via caching. Handles monorepo task topology. |
| `typescript` | Language Core | Enforces type safety. |
| `prettier` | Formatting | Standardizes code style automatically. |
| `eslint` | Linting | Catches programmatic errors (e.g., floating promises, unused variables). |
| `jest` | Testing | The standard runner for unit and E2E tests. |

---

## 2. Shared Packages (`@skillspace/schema`, `@skillspace/runtime`)

| Package | Purpose | Why we use it |
| :--- | :--- | :--- |
| `zod` | Schema Validation | The absolute best TypeScript-first schema validation library. Guarantees runtime data shapes match compile-time types. |
| `yaml` | Parsing | Used to parse and stringify `skill.yaml` and `config.yaml`. Supports YAML 1.2. |

---

## 3. The CLI (`apps/cli`)

| Package | Purpose | Why we use it |
| :--- | :--- | :--- |
| `commander` | CLI Framework | Robust, typed argument parsing and auto-generated `--help` menus. |
| `inquirer` | Interactive Prompts | Used during `skillspace init` and `skillspace login` to collect user input securely. |
| `ora` | Terminal Spinners | Provides visual feedback during long-running tasks like downloading packages or waiting for the LLM. |
| `chalk` | Terminal Styling | Used to colorize error messages (red) and success messages (green). |
| `tar` | Archive Extraction | Used to pack and unpack the `.skillpkg` tarballs. |

---

## 4. The Registry Backend (`apps/registry`)

| Package | Purpose | Why we use it |
| :--- | :--- | :--- |
| `next` | Application Framework | Powers both the React dashboard and the `/api/` endpoints in a single deployment. |
| `@prisma/client` | Database ORM | Provides strict type-safety for PostgreSQL queries, syncing perfectly with the frontend. |
| `jsonwebtoken` | Auth | Used to sign and verify the tokens issued to the CLI for publishing. |
| `@aws-sdk/client-s3` | Object Storage | Used to generate presigned URLs and upload `.skillpkg` buffers to S3 or Cloudflare R2. |
