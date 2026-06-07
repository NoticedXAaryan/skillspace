import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import type { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';
import { TelemetryClient } from '../telemetry.js';

export class McpAllowlistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpAllowlistError';
  }
}

export type McpServerRef = {
  name: string;
  transport: 'stdio' | 'http';
  command?: string;
  url?: string;
  requiredScopes: string[];
};

export type McpConnection = {
  client: Client;
  serverName: string;
};

export class McpRegistry {
  private connections = new Map<string, McpConnection>();

  async connect(serverRef: McpServerRef): Promise<McpConnection> {
    if (this.connections.has(serverRef.name)) {
      return this.connections.get(serverRef.name)!;
    }

    let transport;

    if (serverRef.transport === 'http') {
      const allowlistStr = process.env.MCP_HTTP_ALLOWLIST || '';
      const allowlist = allowlistStr.split(',').map(s => s.trim()).filter(Boolean);
      
      if (!serverRef.url || !allowlist.includes(serverRef.url)) {
        throw new McpAllowlistError(`HTTP URL not in allowlist: ${serverRef.url}`);
      }

      transport = new SSEClientTransport(new URL(serverRef.url));
    } else if (serverRef.transport === 'stdio') {
      if (!serverRef.command) {
        throw new Error('Command is required for stdio transport');
      }

      // Basic sanitization: strip shell metacharacters
      const sanitizedCommand = serverRef.command.replace(/[;&|<>$\(\)\[\]\{\}]/g, '');
      const parts = sanitizedCommand.split(/\s+/).filter(Boolean);
      const executable = parts[0];

      if (executable !== 'npx' && executable !== 'node') {
        throw new McpAllowlistError(`Executable not in allowlist: ${executable}`);
      }

      transport = new StdioClientTransport({
        command: executable,
        args: parts.slice(1),
        env: process.env as Record<string, string>,
      });
    } else {
      throw new Error(`Unsupported transport: ${serverRef.transport}`);
    }

    const client = new Client(
      { name: 'skillspace-mcp-registry', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);
    
    const connection: McpConnection = { client, serverName: serverRef.name };
    this.connections.set(serverRef.name, connection);
    return connection;
  }

  async listTools(serverName: string): Promise<McpTool[]> {
    const connection = this.connections.get(serverName);
    if (!connection) throw new Error(`MCP Server "${serverName}" is not connected`);

    const response = await connection.client.listTools();
    return response.tools;
  }

  async callTool(serverName: string, toolName: string, args: unknown): Promise<unknown> {
    const connection = this.connections.get(serverName);
    if (!connection) throw new Error(`MCP Server "${serverName}" is not connected`);

    const startTime = Date.now();

    TelemetryClient.sendEventSafe({
      packageId: 'mcp-registry',
      version: '1.0.0',
      modelId: serverName,
      durationMs: 0,
      status: 'success',
      errorMessage: `Calling MCP Tool: ${toolName}`
    });

    try {
      // 10 second timeout
      const result = await Promise.race([
        connection.client.callTool({ name: toolName, arguments: args as any }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('MCP Tool call timed out')), 10000))
      ]);

      TelemetryClient.sendEventSafe({
        packageId: 'mcp-registry',
        version: '1.0.0',
        modelId: serverName,
        durationMs: Date.now() - startTime,
        status: 'success',
        errorMessage: `Completed MCP Tool: ${toolName}`
      });

      return result;
    } catch (e) {
      TelemetryClient.sendEventSafe({
        packageId: 'mcp-registry',
        version: '1.0.0',
        modelId: serverName,
        durationMs: Date.now() - startTime,
        status: 'error',
        errorMessage: `Failed MCP Tool: ${toolName} - ${(e as Error).message}`
      });
      throw e;
    }
  }

  async disconnect(serverName: string): Promise<void> {
    const connection = this.connections.get(serverName);
    if (connection) {
      await connection.client.close();
      this.connections.delete(serverName);
    }
  }

  async disconnectAll(): Promise<void> {
    const promises = [];
    for (const serverName of this.connections.keys()) {
      promises.push(this.disconnect(serverName));
    }
    await Promise.all(promises);
  }
}
