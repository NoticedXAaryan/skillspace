# Chapter 5: Skill Execution and Runtime

This chapter explores the beating heart of SkillSpace: `packages/runtime/src/executor.ts`. The Executor is entirely stateless and handles the entire lifecycle of a single request—from reading the local cache to enforcing security bounds, negotiating with Model Context Protocol (MCP) servers, and finally yielding output to the user.

---

## 1. Feature Overview

The Execution pipeline ensures that developers can run `skillspace run <skill> --input <file>` and predictably receive a response, regardless of the underlying LLM provider. The Executor hides the complexity of HTTP calls, token streaming, tool call orchestration, and retry logic.

Key capabilities of the Executor include:
*   **Dynamic Input Resolution:** Reading plain text or walking directories to construct the prompt.
*   **Security Interception:** Failing fast if a skill attempts to read a file without the `filesystem.read` permission, or if the `LocalModelScreener` detects malicious prompt injection.
*   **Model Agnosticism:** Converting the skill's instructions into the exact structure demanded by the target provider (via the Model Adapter Layer).
*   **Autonomous Tool Looping:** Processing recursive tool calls (up to 10 iterations) from an LLM to an MCP server without user intervention.

---

## 2. Implementation Walkthrough: The Core Execution Flow

When the `run()` function is invoked, the Executor follows a strict sequence:

### Step 1: Cache Resolution
```typescript
const skill = this.resolver.resolve(options.skill);
```
The `SkillResolver` checks `~/.skillspace/registry/` for the exact version of the skill. If not found locally, the CLI would have failed in the install step.

### Step 2: Permission Enforcement
```typescript
const enforcer = new PermissionEnforcer(skill.name, skill.permissions);
this.enforceInputPermissions(enforcer, options);
```
If `--input` is a file path, the enforcer verifies `filesystem.read`. If `--output` is provided, it verifies `filesystem.write`.

### Step 3: Adapter & Credential Hydration
```typescript
const { adapter, modelName } = adapterRegistry.getAdapter(modelId);
const apiKey = getApiKey(provider) ?? '';
```
The runtime determines which Model Adapter (`ClaudeAdapter`, `OpenAIAdapter`, etc.) to use based on the `modelId` (e.g., `anthropic/claude-3-5-sonnet`).

### Step 4: Firewall Screening (The Guardrail)
```typescript
if (process.env.FIREWALL_ENABLED === 'true') {
  const firewall = new LocalModelScreener();
  const verdict = await firewall.screen(input, ...);
  if (!verdict.safe) throw new FirewallBlockedError(...);
}
```
If the enterprise firewall is enabled, the input payload is silently passed to a fast local model (e.g., `ollama/llama3`) before reaching the primary LLM. The local model checks for prompt injection semantics.

### Step 5: MCP Hydration and Execution Loop
If the skill specifies `mcpServers`, the runtime enters a specialized execution path:
1.  **Connection:** `mcpRegistry.connect(srv)` establishes stdio/HTTP links to the requested MCP servers.
2.  **Tool Collection:** `mcpRegistry.listTools()` pulls the JSON Schema of every available tool.
3.  **The While Loop:** The runtime loops up to `MAX_STEPS` (10). 
    *   It sends the payload + tool schemas to the LLM.
    *   If the LLM responds with a `tool_call` (e.g., `mcp_github_search`), the runtime intercepts it.
    *   The runtime calls the MCP server with the arguments, appends the result to the message history, and loops back to the LLM.
    *   If the LLM responds with text, the loop breaks and yields the final result.

### Step 6: Output Validation
If the `skill.yaml` specifies `output_format: json`, the runtime attempts a `JSON.parse(result.output)`. A warning is emitted if the model hallucinated markdown formatting around the JSON payload.

---

## 3. Streaming Support (`runStream`)

For interactive CLI usage, waiting 30 seconds for a response is unacceptable. The Executor implements an asynchronous generator `runStream()`.

Instead of buffering the entire HTTP response, `runStream` utilizes the Web Fetch API's `ReadableStream`:
1.  It forces the adapter payload to include `"stream": true`.
2.  It decodes the HTTP chunks in real-time.
3.  It passes raw lines to `adapter.parseStreamChunk(line)`.
4.  It `yield`s the parsed tokens directly to the CLI, which writes them to `process.stdout.write()`.

> **Note:** Streaming bypasses complex MCP tool looping in Phase 1. If MCP tools are required, the runtime falls back to synchronous execution to manage the multi-step context window.

---

## 4. Edge Cases and Error Handling

The runtime is designed to be highly resilient against network failures.

**Rate Limiting & Retries (`callWithRetry`)**
The LLM APIs (especially OpenAI and Anthropic) aggressively rate-limit requests. The runtime catches `HTTP 429` (Too Many Requests) and implements exponential backoff:
```typescript
const retryAfter = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
await this.sleep(retryAfter);
```
Server errors (500, 502, 503) are also marked as `retryable = true`.

**Authentication Errors**
If the runtime receives an `HTTP 401` or `403`, it instantly throws an `ExecutionError` with code `AUTH_ERROR` instructing the user to run `skillspace model add <provider>`. These are *not* retryable.

**Graceful Disconnection**
Regardless of success, failure, or a user aborting the CLI (`Ctrl+C`), the executor guarantees cleanup via a `finally` block:
```typescript
finally {
  await mcpRegistry.disconnectAll();
}
```
This ensures no orphaned Node.js `stdio` processes are left running in the background.

---

## 5. Security Considerations

The Executor is the boundary between untrusted inputs and dangerous APIs.
1.  **No Arbitrary Code Execution:** The runtime does *not* `eval()` or `exec()` code. All logic is restricted strictly to HTTP calls and defined MCP tools.
2.  **Tool Scoping:** When a tool call is intercepted (`tc.function.name.startsWith('mcp_')`), the Executor checks the specific `requiredScopes` for that server against the skill's declared permissions before routing the call. If a skill tries to use a filesystem MCP server without `filesystem.read`, it fails dynamically.
