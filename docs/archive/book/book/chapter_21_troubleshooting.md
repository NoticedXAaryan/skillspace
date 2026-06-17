# Chapter 21: Troubleshooting Guide

This final chapter serves as an index of common errors developers and users encounter, along with their root causes and resolutions.

---

## 1. Local Setup and Build Errors

**Error:** `Cannot find module '@skillspace/schema' or its corresponding type declarations.`
*   **Cause:** You cloned the repo but the TypeScript compiler hasn't generated the `.d.ts` files for the workspace packages.
*   **Fix:** Run `pnpm install` followed immediately by `pnpm run build` at the root.

**Error:** `PrismaClientInitializationError: Can't reach database server at localhost:5432`
*   **Cause:** The Next.js registry or the E2E test suite is trying to query PostgreSQL, but the database isn't running or the `DATABASE_URL` in `apps/registry/.env` is incorrect.
*   **Fix:** Ensure Docker is running your postgres container, or verify your local `.env` string.

---

## 2. CLI Execution Errors

**Error:** `ExecutionError [AUTH_ERROR]: API key not found for provider 'anthropic'`
*   **Cause:** The `skillspace run` command attempted to use a model, but you haven't configured the secret key.
*   **Fix:** Run `skillspace model add anthropic` and provide your key.

**Error:** `PermissionDeniedError: Skill attempted to access filesystem.write but it is not declared in skill.yaml`
*   **Cause:** A user ran a skill with the `--output` flag, or the skill attempted to use a filesystem MCP server, but the capability author did not explicitly request write permissions.
*   **Fix:** If you trust the skill, edit `~/.skillspace/registry/<pkg>/skill.yaml` to include `- filesystem.write` in the permissions array.

**Error:** `FirewallBlockedError: Injection semantics detected in input payload`
*   **Cause:** The global `FIREWALL_ENABLED=true` flag is set, and the local screening model (`ollama/llama3`) determined the user input was malicious (e.g., "ignore all previous instructions").
*   **Fix:** If this is a false positive, you can temporarily disable the firewall by running `FIREWALL_ENABLED=false skillspace run <pkg>`.

**Error:** `Checksum mismatch for package security-review@1.0.0`
*   **Cause:** The CLI downloaded a `.skillpkg` during `install`, but the `sha256` hash of the files did not match the hash reported by the registry. This indicates either a corrupted download or a manipulated file.
*   **Fix:** Run `skillspace uninstall security-review`, then run `skillspace install security-review` to force a fresh download.

---

## 3. Registry and Publishing Errors

**Error:** `HTTP 403 Forbidden` during `skillspace publish`
*   **Cause:** You are trying to publish a package name (e.g., `code-analyzer`) that is already owned by another user, or you are trying to publish to an `@org` namespace you do not belong to.
*   **Fix:** Change the `name` in your `skill.yaml` to something unique, or ask the organization admin to invite you via the Web Dashboard.

**Error:** `HTTP 400 Bad Request: ZodError: Invalid semantic version`
*   **Cause:** The `version` field in your `skill.yaml` is not valid semver (e.g., `1.0` instead of `1.0.0`).
*   **Fix:** Correct the version string and run publish again.
