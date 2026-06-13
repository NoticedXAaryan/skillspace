import * as fs from 'node:fs';
import * as path from 'node:path';
import YAML from 'yaml';
import { createLoader } from '../ui/states/loader.js';
import { successCritical, successStandard } from '../ui/states/success.js';
import { errorOperational } from '../ui/states/error.js';
import { outro } from '../ui/states/outro.js';

export async function scaffoldMcpServer(
  targetDir: string,
  projectName: string,
  finalProjectName: string,
  description: string,
  author: string,
  lang: string,
  isHeadless: boolean,
  startTime: number
) {
  let primaryConflictFile = '';
  switch (lang) {
    case 'typescript':
    case 'javascript':
      primaryConflictFile = 'package.json';
      break;
    case 'python':
      primaryConflictFile = 'requirements.txt';
      break;
    case 'go':
      primaryConflictFile = 'go.mod';
      break;
    case 'rust':
      primaryConflictFile = 'Cargo.toml';
      break;
    case 'java':
      primaryConflictFile = 'pom.xml';
      break;
    default:
      errorOperational('Invalid language', { message: `Language ${lang} is not supported for MCP servers.` });
      process.exit(1);
  }

  const conflictPath = path.join(targetDir, primaryConflictFile);
  if (fs.existsSync(conflictPath)) {
    errorOperational('File conflict', { 
      message: `${primaryConflictFile} already exists in this directory.`,
      hint: 'Change directories or remove the file first.'
    });
    process.exit(1);
  }

  const loader = !isHeadless ? createLoader(`Scaffolding MCP Server project in ${lang}`) : null;

  let createdFiles: string[] = [];
  let command = '';

  if (lang === 'typescript') {
    const pkgJson = {
      name: finalProjectName,
      version: "1.0.0",
      description: description,
      type: "module",
      bin: { [finalProjectName]: "./build/index.js" },
      scripts: { "build": "tsc", "start": "node build/index.js" },
      dependencies: { "@modelcontextprotocol/sdk": "latest" },
      devDependencies: { "@types/node": "^20.0.0", "typescript": "^5.0.0" }
    };
    const tsconfig = {
      compilerOptions: {
        target: "ES2022", module: "Node16", moduleResolution: "Node16",
        outDir: "./build", rootDir: "./src", strict: true, esModuleInterop: true,
        skipLibCheck: true, forceConsistentCasingInFileNames: true
      },
      include: ["src/**/*"]
    };
    const indexTs = `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: '${finalProjectName}', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{ name: 'hello_world', description: 'A simple hello world tool', inputSchema: { type: 'object', properties: {} } }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'hello_world') return { content: [{ type: 'text', text: 'Hello from MCP!' }] };
  throw new Error('Tool not found');
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server running on stdio');
}

main().catch((error) => { console.error('Server error:', error); process.exit(1); });
`;
    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkgJson, null, 2), 'utf-8');
    fs.writeFileSync(path.join(targetDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2), 'utf-8');
    fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'src', 'index.ts'), indexTs, 'utf-8');
    createdFiles = ['package.json', 'tsconfig.json', 'src/index.ts', 'skill.yaml'];
    command = 'npx tsx src/index.ts';
  } else if (lang === 'javascript') {
    const pkgJson = {
      name: finalProjectName,
      version: "1.0.0",
      description: description,
      type: "module",
      bin: { [finalProjectName]: "./src/index.js" },
      scripts: { "start": "node src/index.js" },
      dependencies: { "@modelcontextprotocol/sdk": "latest" }
    };
    const indexJs = `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: '${finalProjectName}', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{ name: 'hello_world', description: 'A simple hello world tool', inputSchema: { type: 'object', properties: {} } }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'hello_world') return { content: [{ type: 'text', text: 'Hello from MCP!' }] };
  throw new Error('Tool not found');
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server running on stdio');
}

main().catch((error) => { console.error('Server error:', error); process.exit(1); });
`;
    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkgJson, null, 2), 'utf-8');
    fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'src', 'index.js'), indexJs, 'utf-8');
    createdFiles = ['package.json', 'src/index.js', 'skill.yaml'];
    command = 'node src/index.js';
  } else if (lang === 'python') {
    const reqs = `mcp\n`;
    const serverPy = `from mcp.server import Server, NotificationOptions
from mcp.server.stdio import stdio_server
import mcp.types as types
import asyncio

app = Server("${finalProjectName}")

@app.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="hello_world",
            description="A simple hello world tool",
            inputSchema={"type": "object", "properties": {}},
        )
    ]

@app.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    if name == "hello_world":
        return [types.TextContent(type="text", text="Hello from Python MCP!")]
    raise ValueError(f"Unknown tool: {name}")

async def main():
    import sys
    print("MCP Server running on stdio", file=sys.stderr)
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())
`;
    fs.writeFileSync(path.join(targetDir, 'requirements.txt'), reqs, 'utf-8');
    fs.writeFileSync(path.join(targetDir, 'server.py'), serverPy, 'utf-8');
    createdFiles = ['requirements.txt', 'server.py', 'skill.yaml'];
    command = 'python server.py';
  } else if (lang === 'go') {
    const goMod = `module ${finalProjectName}\n\ngo 1.21\n\nrequire github.com/mark3labs/mcp-go v0.4.0\n`;
    const mainGo = `package main

import (
	"context"
	"fmt"
	"os"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

func main() {
	s := server.NewMCPNode("${finalProjectName}", "1.0.0")

	tool := mcp.NewTool("hello_world",
		mcp.WithDescription("A simple hello world tool"),
	)
	s.AddTool(tool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		return mcp.NewToolResultText("Hello from Go MCP!"), nil
	})

	fmt.Fprintln(os.Stderr, "MCP Server running on stdio")
	if err := server.ServeStdio(s); err != nil {
		fmt.Fprintf(os.Stderr, "Server error: %v\\n", err)
		os.Exit(1)
	}
}
`;
    fs.writeFileSync(path.join(targetDir, 'go.mod'), goMod, 'utf-8');
    fs.writeFileSync(path.join(targetDir, 'main.go'), mainGo, 'utf-8');
    createdFiles = ['go.mod', 'main.go', 'skill.yaml'];
    command = 'go run main.go';
  } else if (lang === 'rust') {
    const cargoToml = `[package]
name = "${finalProjectName}"
version = "1.0.0"
edition = "2021"

[dependencies]
# Note: You can use mcp-sdk or implement basic JSON-RPC manually
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.30", features = ["full"] }
`;
    const mainRs = `use std::io::{self, BufRead};

#[tokio::main]
async fn main() {
    eprintln!("MCP Server running on stdio");
    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        let _line = line.unwrap();
        // TODO: Implement JSON-RPC parsing for MCP here
    }
}
`;
    fs.writeFileSync(path.join(targetDir, 'Cargo.toml'), cargoToml, 'utf-8');
    fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'src', 'main.rs'), mainRs, 'utf-8');
    createdFiles = ['Cargo.toml', 'src/main.rs', 'skill.yaml'];
    command = 'cargo run -q';
  } else if (lang === 'java') {
    const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.skillspace</groupId>
    <artifactId>${finalProjectName}</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>
</project>
`;
    const mainJava = `package com.skillspace;

public class Main {
    public static void main(String[] args) {
        System.err.println("MCP Server running on stdio");
        // TODO: Implement JSON-RPC parsing for MCP here
    }
}
`;
    fs.writeFileSync(path.join(targetDir, 'pom.xml'), pomXml, 'utf-8');
    const javaDir = path.join(targetDir, 'src', 'main', 'java', 'com', 'skillspace');
    fs.mkdirSync(javaDir, { recursive: true });
    fs.writeFileSync(path.join(javaDir, 'Main.java'), mainJava, 'utf-8');
    createdFiles = ['pom.xml', 'src/main/java/com/skillspace/Main.java', 'skill.yaml'];
    command = 'mvn compile exec:java -Dexec.mainClass="com.skillspace.Main"';
  }

  const skillYaml = {
    name: finalProjectName,
    version: '1.0.0',
    description,
    author,
    license: 'MIT',
    tags: ['mcp', lang],
    category: 'other',
    instructions: {
      system: `You are an expert at ${finalProjectName}. You have access to the tools provided by this MCP server.`,
      user_template: `{{input}}`,
      output_format: 'text'
    },
    mcpServers: [
      {
        name: finalProjectName,
        transport: 'stdio',
        command: command,
        requiredScopes: []
      }
    ],
    permissions: []
  };

  fs.writeFileSync(path.join(targetDir, 'skill.yaml'), YAML.stringify(skillYaml), 'utf-8');

  if (loader) {
    loader.succeed(`Scaffolded MCP Server in ${lang}`);
    const nextSteps = [];
    nextSteps.push(['Go to folder', `cd ${projectName === '.' ? '.' : projectName}`]);
    if (lang === 'typescript' || lang === 'javascript') {
      nextSteps.push(['Install', 'npm install']);
      if (lang === 'typescript') nextSteps.push(['Build', 'npm run build']);
    } else if (lang === 'python') {
      nextSteps.push(['Install', 'pip install -r requirements.txt']);
    } else if (lang === 'go') {
      nextSteps.push(['Tidy', 'go mod tidy']);
    }
    nextSteps.push(['Test skill', `skillspace run .\\skill.yaml`]);
    
    successCritical('MCP Server initialized.', `Your boilerplate is ready.`, nextSteps as any);
    outro(Date.now() - startTime);
  } else {
    successStandard(`Initialized MCP Server "${finalProjectName}"`, {
      'Language': lang,
      'Created files': createdFiles.join(', ')
    });
  }
}
