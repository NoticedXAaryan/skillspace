# Chapter 13: Security Guide

This chapter outlines the threat models and security boundaries inherent in the SkillSpace ecosystem. As an execution engine that feeds untrusted inputs to non-deterministic AI models—which can then call local system tools via MCP—security is the highest priority.

---

## 1. Security Model Overview

The system is divided into strict trust boundaries:

1.  **Untrusted:** User input strings, downloaded `.skillpkg` payloads, and raw text returned by LLMs.
2.  **Trusted:** The core SkillSpace Runtime (SSR), the Zod validation schemas, and the explicit permission manifests (`skill.yaml`).

The fundamental rule of SkillSpace is: **Default Deny.** A skill cannot read a file, make a network request, or access a local tool unless it explicitly declares that intent, and the runtime verifies that the user context permits it.

---

## 2. Authentication and Authorization (Registry)

The Next.js Registry Server handles user authentication.

*   **Token Lifecycle:** When a user runs `skillspace login`, the backend validates credentials and issues a JSON Web Token (JWT) signed with `JWT_SECRET`. The token is valid for 30 days.
*   **Storage:** The CLI stores the token in plain text at `~/.skillspace/credentials`.
*   **Authorization:** When `skillspace publish` is called, the backend decodes the JWT. It checks the `Package` table. If the package name exists, it verifies that the JWT `userId` matches the `ownerId` (or the user is a member of the owning `Organization`). If not, it returns `403 Forbidden`.

---

## 3. Execution Sandboxing (Runtime)

The SSR does not use virtual machines or Docker containers for sandboxing. Instead, it uses **Application-Level Capability Enforcement**.

### The Permission Enforcer
Before any I/O operation is performed, the `Executor` calls the `PermissionEnforcer`:
```typescript
const enforcer = new PermissionEnforcer(skill.name, skill.permissions);
```
If the user executes `skillspace run code-analyzer --input ./src`, the Executor detects that `./src` is a directory. Before executing `fs.readdirSync`, it calls `enforcer.check('filesystem.read')`.
If the `skill.yaml` did not include `- filesystem.read` in its `permissions` array, the system throws a `PermissionDeniedError` and halts.

### MCP Tool Sandboxing
When the LLM hallucinates or intentionally attempts to call an MCP tool (e.g., `mcp_terminal_execute`), the runtime checks the specific `mcpServers` definition in the `skill.yaml`.
If the specific MCP server block requires `tools.terminal`, the enforcer validates this against the global permission block. This prevents a skill from silently hijacking a broadly permissive MCP server.

---

## 4. The Firewall: Preventing Prompt Injection

One of the most dangerous vulnerabilities in AI systems is Prompt Injection—where malicious input commands the LLM to ignore its system prompt and execute an attacker's payload.

SkillSpace combats this using the **LocalModelScreener** (enabled via `FIREWALL_ENABLED=true`).

**How it works:**
1.  The user provides an input string.
2.  Before the main LLM (e.g., GPT-4) is called, the input is sent to a fast, localized model (like `ollama/llama3`).
3.  The local model evaluates the input strictly to determine if it contains instructional overrides, jailbreaks, or payload obfuscation.
4.  If the local model returns an unsafe verdict with high confidence (>0.85), the `Executor` throws a `FirewallBlockedError`.
5.  Telemetry is optionally dispatched to log the blocked attempt.

---

## 5. Input Validation and Sanitization

There are two layers of structural validation:
1.  **Manifest Validation:** Every `skill.yaml` is parsed by `zod` (`@skillspace/schema`). If an attacker uploads a `.skillpkg` with malicious injection in the version string, the Zod regex (`/^\d+\.\d+\.\d+$/`) instantly rejects it.
2.  **Output Schema Validation:** If a skill expects `output_format: json`, the runtime attempts `JSON.parse()`. If an attacker manipulates the LLM into returning a malicious script tag instead of JSON, the parser fails, preventing the script from being executed by downstream systems.

---

## 6. Security Checklist

When deploying or contributing to SkillSpace, ensure the following:

*   ✅ **JWT_SECRET is secure:** Must be 32+ random characters.
*   ✅ **API Keys are not hardcoded:** Never commit `.env` or `config.yaml`.
*   ✅ **Checksums are enforced:** Never bypass the `cache.ts` checksum validation during installation.
*   ✅ **Dependencies are audited:** Regularly run `pnpm audit` to check for vulnerabilities in underlying libraries (like `express` or `yaml`).
*   ✅ **MCP Allowlist is strict:** Keep `MCP_HTTP_ALLOWLIST` as tight as possible to prevent SSRF via malicious remote tools.
