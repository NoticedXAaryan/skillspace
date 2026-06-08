# Chapter 17: Error Handling and Resilience

SkillSpace operates in a highly volatile environment: network requests to LLMs frequently fail due to rate limits or capacity issues, MCP servers crash, and users provide malformed inputs. This chapter explains the unified error handling architecture.

---

## 1. The `ExecutionError` Class

All errors thrown by the runtime extend a custom `ExecutionError` class. This class provides structured metadata that the CLI uses to render helpful, actionable error messages rather than raw stack traces.

```typescript
export class ExecutionError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
    public details?: any
  ) {
    super(message);
    this.name = 'ExecutionError';
  }
}
```

### Common Error Codes

| Code | Description | Retryable? | CLI Action |
| :--- | :--- | :--- | :--- |
| `VALIDATION_FAILED` | The `skill.yaml` or JSON output failed Zod validation. | No | Halts. Shows exact validation path. |
| `PERMISSION_DENIED` | The skill attempted an I/O op without declaring the permission. | No | Halts. Explains the security breach. |
| `FIREWALL_BLOCKED` | The `LocalModelScreener` detected an injection attack. | No | Halts. Logs the threat. |
| `AUTH_ERROR` | Missing or invalid API key for the LLM provider. | No | Prompts user to run `skillspace model add`. |
| `RATE_LIMITED` | HTTP 429 from OpenAI/Anthropic. | **Yes** | Engages exponential backoff. |
| `SERVICE_UNAVAILABLE`| HTTP 503 from OpenAI/Anthropic. | **Yes** | Engages exponential backoff. |
| `MCP_CRASH` | The local MCP child process died unexpectedly. | No | Halts. Suggests checking the MCP server logs. |

---

## 2. Exponential Backoff

The `callWithRetry` utility in `packages/runtime/src/utils.ts` is wrapped around every external LLM API call.

```typescript
// Simplified logic
let attempt = 0;
while (attempt < MAX_RETRIES) {
  try {
    return await adapter.execute(payload);
  } catch (error) {
    if (error instanceof ExecutionError && error.retryable) {
      const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      console.log(`Rate limited. Retrying in ${waitTime}ms...`);
      await sleep(waitTime);
      attempt++;
    } else {
      throw error; // Fatal error, bubble up
    }
  }
}
```

This ensures that ephemeral API blips do not crash a complex, long-running workflow.

---

## 3. Fail-Safe Parsing

When a skill specifies `output_format: json`, the runtime must parse the LLM's text output. LLMs frequently hallucinate markdown blocks around JSON (e.g., \`\`\`json { ... } \`\`\`).

The runtime employs a robust extraction regex before attempting `JSON.parse()`:
```typescript
const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
const cleanText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
return JSON.parse(cleanText);
```
If the parse still fails, it throws a `VALIDATION_FAILED` error, detailing exactly where the JSON was malformed.

---

## 4. MCP Zombie Process Prevention

As noted in Chapter 6, `stdio` MCP servers are spawned as detached child processes. If the CLI is forcefully killed (`Ctrl+C` / `SIGINT`), these processes could remain alive.

To prevent this, the CLI registers process-level event listeners:
```typescript
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down MCP servers...');
  await mcpRegistry.disconnectAll();
  process.exit(0);
});
```
Furthermore, the `Executor` wraps all execution in `try...finally { await mcpRegistry.disconnectAll(); }` ensuring that even if an unhandled exception occurs, the runtime cleans up its IPC sockets and child processes before dying.
