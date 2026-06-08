# Chapter 6: MCP Integration

This chapter covers the Model Context Protocol (MCP) integration within the SkillSpace runtime. MCP is treated as a first-class citizen in SkillSpace. While a raw MCP setup requires developers to manually wire LLMs to tools, SkillSpace automates this completely through declarative dependencies in `skill.yaml`.

---

## 1. Feature Overview

The Model Context Protocol allows AI models to reach out to external data sources and execution environments. In a standard setup, connecting Claude to an MCP server requires writing a custom integration script. 

SkillSpace changes this paradigm:
1.  **Declarative Dependencies:** A skill author simply lists `mcpServers` in their `skill.yaml` (e.g., `github`, `filesystem`).
2.  **Autonomous Routing:** When `skillspace run` is executed, the runtime automatically connects to the required servers, passes their schemas to the LLM, and orchestrates the back-and-forth tool calls without any custom code.
3.  **Strict Security Fencing:** SkillSpace intercepts tool calls *before* they reach the MCP server. It checks if the skill has the required permissions (e.g., `filesystem.read`) to use the server. 

---

## 2. Implementation Walkthrough: `McpRegistry.ts`

The orchestration logic resides entirely within `packages/runtime/src/mcp/McpRegistry.ts`.

### 2.1 Connection and Initialization

Before an LLM API call is made, the `Executor` must spin up the required MCP servers.
```typescript
const mcpRegistry = new McpRegistry();
for (const srv of skill.mcpServers!) {
  await mcpRegistry.connect(srv);
}
```
The `McpRegistry` supports two transport layers as defined by the MCP specification:
*   **`stdio`:** Standard Input/Output. The registry spawns a child process (e.g., an `npx` command) and communicates over `stdin` and `stdout`. This is the most common layer for local integrations (like file reading or local sqlite databases).
*   **`http`:** For remote or containerized MCP servers.

> **Security Gate:** The global environment variables `MCP_ALLOWED_TRANSPORTS` and `MCP_HTTP_ALLOWLIST` are enforced here. If a skill tries to connect to an unlisted HTTP MCP server, the `McpRegistry` rejects the connection.

### 2.2 Tool Hydration

Once connected, the runtime must extract the tool definitions from the server so the LLM understands what it can do.
```typescript
const serverTools = await mcpRegistry.listTools(srv.name);
```
The registry queries the server, receiving an array of tools complete with their JSON Schemas. SkillSpace wraps these tools to avoid namespace collisions. For example, if two different MCP servers both expose a tool named `search`, SkillSpace prefixes them:
*   `mcp_github_search`
*   `mcp_filesystem_search`

### 2.3 The Execution Loop

As covered in Chapter 5, the Executor operates in a loop (up to 10 iterations). 
When the LLM returns a `tool_call`, the runtime intercepts it:

```typescript
const args = JSON.parse(tc.function.arguments);
if (tc.function.name.startsWith('mcp_')) {
  // 1. Extract server name and original tool name
  // 2. Enforce explicitly required scopes for this specific server
  // 3. Dispatch to the MCP server
  const toolResult = await mcpRegistry.callTool(serverName, originalToolName, args);
  
  // 4. Append result to message history
  messages.push({ role: 'tool', content: JSON.stringify(toolResult) });
}
```

### 2.4 Cleanup and Disconnection

`stdio` MCP servers run as independent child processes. If SkillSpace crashes or exits, these processes could become zombies, consuming memory. 
To prevent this, the `Executor` wraps the entire lifecycle in a `try...finally` block, ensuring `await mcpRegistry.disconnectAll()` is always called. This sends proper termination signals to the child processes.

---

## 3. Sandboxing MCP

The greatest risk of MCP is providing an LLM with unrestricted access to a local filesystem or remote API. SkillSpace mitigates this through **Explicit Scope Required Enforcement**.

In the `skill.yaml`, an `mcpServer` definition includes `requiredScopes`:
```yaml
mcpServers:
  - name: filesystem
    transport: stdio
    command: npx @modelcontextprotocol/server-filesystem /Users/notic/Documents
    requiredScopes:
      - filesystem.read
      - filesystem.write
```

When the LLM attempts to call `mcp_filesystem_read_file`, the `Executor` pauses. It checks if the executing skill actually requested `filesystem.read` in its global `permissions` array. If not, the tool call is blocked and an error message is returned to the LLM context, explaining that the tool failed due to a security violation. 

---

## 4. Known Limitations

*   **No Streaming with Tools:** Currently, if a skill requires MCP servers, the SkillSpace executor falls back to non-streaming execution. The logic required to stream tool call arguments, execute the tool, and stream the subsequent response is highly complex and deferred to a future architecture update.
*   **Max Steps:** To prevent infinite loops (where an LLM keeps calling a tool that returns an error), the runtime hardcodes a `MAX_STEPS = 10` limit. If the LLM doesn't yield a final text response within 10 iterations, an `ExecutionError` is thrown.
