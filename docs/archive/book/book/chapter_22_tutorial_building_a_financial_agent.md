# Chapter 22: Step-by-Step Tutorial: Building a Financial Agent

This chapter serves as an exhaustive, line-by-line tutorial for building a complex, multi-tool AI capability using SkillSpace. We will build a `financial-analyst` agent that can read SEC filings from the filesystem, query stock prices via a custom MCP server, and generate a markdown report.

---

## 1. Project Initialization

Begin by creating a new directory and initializing the project.

```bash
mkdir financial-analyst
cd financial-analyst
skillspace init
```

This generates our base `skill.yaml`. We are going to build an Agent, so rename it to `agent.yaml`. Agents are similar to Skills but can orchestrate multiple sub-skills. For the sake of this tutorial, we will stick to a complex `skill.yaml` to demonstrate MCP integration. Let's rename it back to `skill.yaml`.

---

## 2. Defining the Manifest

Open `skill.yaml` in your editor. We need to define the metadata, the required permissions, and the MCP servers.

```yaml
name: financial-analyst
version: 1.0.0
description: An autonomous agent that reads local financial documents and queries real-time stock data.
author: tutorial-user
license: MIT
```

### 2.1 The Instructions Block

The core of our capability is the system prompt. We need to be extremely specific about the persona and the required output structure.

```yaml
instructions:
  system: |
    You are an elite Wall Street financial analyst. Your job is to analyze the provided documents 
    and cross-reference them with real-time stock data using your available tools.

    RULES:
    1. Always use the `mcp_filesystem_read_file` tool to read the contents of the file provided by the user.
    2. Always use the `mcp_stock_api_get_price` tool to check the current stock price of any ticker symbols mentioned.
    3. Synthesize the findings into a comprehensive markdown report.
    4. You must include a "Risk Factors" section.

  user_template: |
    Please analyze the following financial document located at:
    {{input}}
```

Notice the use of `{{input}}`. When the user runs `skillspace run financial-analyst --input ./q3-earnings.pdf`, the string `./q3-earnings.pdf` replaces `{{input}}`.

### 2.2 Permissions and MCP Servers

This is the most critical part. Our LLM needs to read from the local filesystem and query an external API. We must explicitly declare these intents.

```yaml
permissions:
  - filesystem.read
  - network.fetch

mcpServers:
  - name: filesystem
    transport: stdio
    command: npx -y @modelcontextprotocol/server-filesystem /Users/notic/Documents/financials
    requiredScopes:
      - filesystem.read

  - name: stock-api
    transport: http
    url: http://localhost:8080/mcp
    requiredScopes:
      - network.fetch
```

**Security Analysis of this block:**
1.  We declared `filesystem.read` globally.
2.  We defined an `mcpServer` named `filesystem`. We restricted it to only have access to `/Users/notic/Documents/financials`.
3.  We declared `network.fetch` globally.
4.  We defined an HTTP MCP server that points to a local stock API wrapper we assume is running.

---

## 3. Creating the Local Stock API MCP Server

To make this tutorial work, we need an MCP server running on port 8080 that provides stock data. Let's write a simple Node.js server.

Create a file `stock-server.js`:

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/mcp') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const payload = JSON.parse(body);
      
      // Handle Tool Listing
      if (payload.method === 'listTools') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          tools: [{
            name: 'get_price',
            description: 'Get the current stock price for a ticker',
            inputSchema: {
              type: 'object',
              properties: { ticker: { type: 'string' } },
              required: ['ticker']
            }
          }]
        }));
        return;
      }

      // Handle Tool Execution
      if (payload.method === 'callTool' && payload.params.name === 'get_price') {
        const { ticker } = payload.params.arguments;
        // Mock data
        const price = ticker === 'AAPL' ? 150.25 : 100.00;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          content: [{ type: 'text', text: `The current price of ${ticker} is $${price}` }]
        }));
        return;
      }
    });
  }
});

server.listen(8080, () => console.log('MCP Stock Server running on 8080'));
```

Run this server in a separate terminal: `node stock-server.js`.

---

## 4. Execution Walkthrough

Now, we will execute our newly created skill.

Create a mock financial document `/Users/notic/Documents/financials/q3-earnings.txt`:
```text
Apple Inc. (AAPL) reported strong Q3 earnings today, driven by services revenue.
However, supply chain constraints remain a risk factor for the upcoming holiday season.
```

Run the skill:
```bash
skillspace run . --input /Users/notic/Documents/financials/q3-earnings.txt --model anthropic/claude-3-5-sonnet
```

### What happens under the hood?
1.  **Parsing:** The runtime parses `skill.yaml`.
2.  **MCP Connections:** 
    *   It spawns `npx @modelcontextprotocol/server-filesystem` via `stdio`.
    *   It establishes a connection to `http://localhost:8080/mcp`.
3.  **LLM Call 1:** The `ClaudeAdapter` constructs a payload. It injects the system prompt, the user template with the file path, and the two tools (`mcp_filesystem_read_file` and `mcp_stock_api_get_price`).
4.  **LLM Response 1:** Claude realizes it needs the file contents. It returns a `tool_call` for `mcp_filesystem_read_file` with the path.
5.  **Tool Execution 1:** The SkillSpace Executor intercepts the call, verifies `filesystem.read` is allowed, and passes the request to the `stdio` child process. The child process returns the text file contents.
6.  **LLM Call 2:** The Executor appends the file contents to the message array and calls Claude again.
7.  **LLM Response 2:** Claude reads the text, identifies the ticker "AAPL", and decides to call `mcp_stock_api_get_price` with `{"ticker": "AAPL"}`.
8.  **Tool Execution 2:** The Executor sends an HTTP POST to our local Node.js server, receiving `$150.25` in response.
9.  **LLM Call 3:** The Executor appends the stock price to the message history.
10. **LLM Final Response:** Claude generates the final markdown report, synthesizing the earnings data and the real-time stock price. It streams this back to the CLI.
11. **Cleanup:** The Executor kills the `npx` child process.

---

## 5. Publishing the Capability

To share this financial analyst with your team, you must evaluate and publish it.

```bash
skillspace publish
```

Because we require an external HTTP MCP server, it is best practice to include a `README.md` in the directory explaining how to stand up the stock server before running the capability. 

Once published, your colleagues can run:
```bash
skillspace install financial-analyst
skillspace run financial-analyst --input ./their-file.txt
```
