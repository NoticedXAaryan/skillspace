# Chapter 24: Step-by-Step Tutorial: Building a Custom MCP Server

While SkillSpace can automatically connect to existing Model Context Protocol (MCP) servers, you will frequently need to build custom servers to interface with your organization's proprietary databases or internal APIs. This chapter walks through building a custom MCP server from scratch using TypeScript and the official `@modelcontextprotocol/sdk`.

---

## 1. Project Setup

Create a new standalone directory for your MCP server. While it *can* live inside the SkillSpace monorepo, MCP servers are designed to be independent processes.

```bash
mkdir my-custom-mcp
cd my-custom-mcp
npm init -y
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node
npx tsc --init
```

Update your `package.json` to enable ES Modules, as the MCP SDK heavily relies on modern JS features.
```json
{
  "name": "my-custom-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## 2. Instantiating the Server

Create `src/index.ts`. We will set up the server to communicate over `stdio` (Standard Input/Output), which is the most reliable transport for local integrations.

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize the server with basic metadata
const server = new Server(
  {
    name: "my-custom-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // This declares that we support tool calling
    },
  }
);
```

---

## 3. Registering Tools (ListTools)

The LLM needs to know what tools your server provides. We must handle the `ListToolsRequestSchema` request. Let's create a tool that queries an internal employee directory.

```typescript
// Define the shape of our tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_employee_info",
        description: "Fetch details about an employee by their email address.",
        inputSchema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              description: "The corporate email address of the employee",
            },
          },
          required: ["email"],
        },
      },
    ],
  };
});
```
When SkillSpace's `McpRegistry` connects to this server, it will issue a `listTools` command, receive this schema, prefix it (e.g., `mcp_my-custom-mcp_get_employee_info`), and pass it to the LLM.

---

## 4. Executing the Tool (CallTool)

Next, we handle the actual execution when the LLM decides to use the tool.

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "get_employee_info") {
    throw new Error("Unknown tool");
  }

  const { email } = request.params.arguments as { email: string };

  try {
    // In a real application, you would query your database here.
    // We will simulate a response.
    const mockDatabase: Record<string, any> = {
      "alice@acme.com": { name: "Alice Smith", department: "Engineering", title: "Senior Dev" },
      "bob@acme.com": { name: "Bob Jones", department: "Sales", title: "Account Executive" }
    };

    const employee = mockDatabase[email];

    if (!employee) {
      return {
        content: [{ type: "text", text: `Error: No employee found with email ${email}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(employee, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Server error: ${(error as Error).message}` }],
      isError: true,
    };
  }
});
```

---

## 5. Starting the Transport

Finally, we must hook the server up to the standard I/O streams and start listening.

```typescript
async function main() {
  // Use Stdio transport for local execution
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Custom MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server crashed:", error);
  process.exit(1);
});
```
> **Note:** We use `console.error` for logging because `console.log` writes to `stdout`, which interferes with the strict JSON-RPC protocol messages being passed over the stdio transport!

---

## 6. Testing the Server with SkillSpace

Build the server using `npm run build`. 
To use this in SkillSpace, define it in a `skill.yaml`:

```yaml
mcpServers:
  - name: my-employee-directory
    transport: stdio
    # Point the command to the transpiled JS file
    command: node /path/to/my-custom-mcp/dist/index.js
```

When you run this skill, the SkillSpace executor will automatically spawn the node process, request the `get_employee_info` tool schema, and pass email arguments to it whenever the LLM requests employee details.
