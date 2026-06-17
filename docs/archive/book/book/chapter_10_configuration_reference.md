# Chapter 10: Configuration Reference

This chapter details the two layers of configuration within SkillSpace: the Local Configuration (which governs the CLI and Runtime behavior for an individual developer) and the Environment Configuration (which governs the Next.js Registry Server and execution boundaries).

---

## 1. Local Configuration (`~/.skillspace/config.yaml`)

This file is created automatically when you run `skillspace init` or `skillspace model add`. It stores your personal preferences and API credentials. **Never commit this file to version control.**

### Structure
```yaml
default_model: anthropic/claude-3-5-sonnet
providers:
  openai:
    api_key: sk-proj-...
  anthropic:
    api_key: sk-ant-...
  ollama:
    base_url: http://localhost:11434
```

### Reference Table

| Key | Type | Description |
| :--- | :--- | :--- |
| `default_model` | string | The model ID used if the `--model` flag is omitted during `skillspace run`. |
| `providers.<name>.api_key` | string | The secret key required for authenticated endpoints. |
| `providers.<name>.base_url` | string | Overrides the default API URL. Crucial for local models like Ollama or enterprise proxies. |

---

## 2. Skill Configuration (`skill.yaml`)

Capabilities can define their own runtime bounds. These are defaults that the CLI user can override via the `--config` flag.

```yaml
config:
  temperature: 0.3
  max_tokens: 4000
  timeout_seconds: 60
```

*   **`temperature` (0.0 - 2.0):** Controls the randomness of the LLM. 0.0 is deterministic, 2.0 is highly creative.
*   **`max_tokens`:** The upper limit on the number of tokens the LLM is allowed to generate in a single response.
*   **`timeout_seconds`:** If the LLM does not return a complete response within this window, the `Executor` aborts the request and throws an `ExecutionError`.

---

## 3. Global Environment Variables (`.env`)

These variables govern the security posture of the SkillSpace runtime and the operational state of the Next.js backend.

### Registry Backend Variables (`apps/registry/.env`)
These are strictly required for the backend to start.
*   `DATABASE_URL`: Your PostgreSQL connection string. 
    *   *Example:* `postgresql://postgres:password@localhost:5432/skillspace`
*   `JWT_SECRET`: A secure string used to sign authentication tokens. Must be at least 32 characters.

### Runtime Security Variables (Global)
These variables can be set in your terminal environment (e.g., `export FIREWALL_ENABLED=true`) to wrap the `Executor` in strict security boundaries.

*   `FIREWALL_ENABLED` (boolean): If `true`, the `LocalModelScreener` is activated. Every input payload is passed to a local LLM to screen for injection attacks before the primary LLM is invoked.
*   `FIREWALL_MODEL` (string): The model used by the screener. *Default: `ollama/llama3`*.
*   `MCP_ALLOWED_TRANSPORTS` (comma-separated string): The transport layers the runtime is allowed to use for MCP. *Default: `stdio,http`*.
*   `MCP_HTTP_ALLOWLIST` (comma-separated string): A strict allowlist of URLs permitted for remote MCP HTTP connections. If an `mcpServer` requests a URL not on this list, the connection is instantly rejected.

---

## 4. Secrets Management

SkillSpace enforces strict separation of concerns for secrets.
1.  **API Keys** (OpenAI, Anthropic) are stored in `~/.skillspace/config.yaml`.
2.  **Publishing Tokens** (SkillSpace JWT) are stored in `~/.skillspace/credentials`.
3.  **Database Credentials** are stored in `.env` and are strictly excluded via `.gitignore`.

When building capabilities, **never** hardcode API keys into a `skill.yaml` system prompt. If a skill requires access to an external API (e.g., a weather API), it should either require the user to pass the key via `--input`, or rely on an MCP server that is configured locally with its own secrets.
