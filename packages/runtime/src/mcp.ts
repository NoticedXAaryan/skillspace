import * as fs from 'node:fs';
import * as path from 'node:path';
import { getSkillspacePath } from './config.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';

export interface McpServerConfig {
  name: string;
  version: string;
  transport: 'stdio' | 'http';
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
}

// Option 1 fallback bundle
const FALLBACK_CATALOG: Record<string, McpServerConfig> = {
  sqlite: {
    name: 'sqlite',
    version: '1.0.0',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite', '--', 'test.db']
  },
  filesystem: {
    name: 'filesystem',
    version: '1.0.0',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '--', process.cwd()]
  },
  github: {
    name: 'github',
    version: '1.0.0',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github']
  }
};

export class McpManager {
  private mcpDir: string;
  private activeClients: Map<string, Client> = new Map();
  private availableTools: Map<string, McpTool[]> = new Map();

  constructor() {
    this.mcpDir = path.join(getSkillspacePath(), 'mcp');
    if (!fs.existsSync(this.mcpDir)) {
      fs.mkdirSync(this.mcpDir, { recursive: true });
    }
  }

  /**
   * Install an MCP server configuration (Option 3 with Option 2 and 1 fallbacks)
   */
  async installServer(name: string, from?: string): Promise<void> {
    const serversDir = path.join(this.mcpDir, 'servers', name);
    if (!fs.existsSync(serversDir)) {
      fs.mkdirSync(serversDir, { recursive: true });
    }
    const configPath = path.join(serversDir, 'mcp.json');

    let config: McpServerConfig | null = null;

    if (from) {
      // Option 2: Local or remote explicit URL
      if (from.startsWith('http://') || from.startsWith('https://')) {
        const res = await fetch(from);
        if (!res.ok) throw new Error(`Failed to fetch config from ${from}`);
        config = await res.json() as McpServerConfig;
      } else {
        const localPath = path.resolve(process.cwd(), from);
        if (!fs.existsSync(localPath)) throw new Error(`Config file not found at ${localPath}`);
        config = JSON.parse(fs.readFileSync(localPath, 'utf-8')) as McpServerConfig;
      }
    } else {
      // Option 3: Registry fetch
      try {
        const registryUrl = process.env.SKILLSPACE_MCP_REGISTRY_URL || 'https://raw.githubusercontent.com/skillspace-ai/skillspace-registry/main/registry';
        const indexRes = await fetch(`${registryUrl}/index.json`);
        if (!indexRes.ok) throw new Error(`Failed to fetch MCP index from registry`);
        
        const index = await indexRes.json() as { servers: Record<string, { config_url: string }> };
        const serverMeta = index.servers[name];
        
        if (!serverMeta) throw new Error(`Server ${name} not found in registry`);
        
        const configRes = await fetch(`${registryUrl}/${serverMeta.config_url}`);
        if (!configRes.ok) throw new Error(`Failed to fetch config for ${name}`);
        
        config = await configRes.json() as McpServerConfig;
      } catch (err) {
        console.warn(`Registry fetch failed: ${err instanceof Error ? err.message : String(err)}. Falling back to hardcoded catalog.`);
        config = FALLBACK_CATALOG[name];
      }
    }

    if (!config) {
      throw new Error(`MCP Server "${name}" could not be resolved.`);
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * Get an installed server config
   */
  getServerConfig(name: string): McpServerConfig {
    const configPath = path.join(this.mcpDir, 'servers', name, 'mcp.json');
    if (!fs.existsSync(configPath)) {
      throw new Error(`MCP Server "${name}" is not installed.`);
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as McpServerConfig;
  }

  /**
   * List all installed MCP servers
   */
  listServers(): McpServerConfig[] {
    const serversDir = path.join(this.mcpDir, 'servers');
    if (!fs.existsSync(serversDir)) return [];
    
    const entries = fs.readdirSync(serversDir, { withFileTypes: true });
    const servers: McpServerConfig[] = [];
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        servers.push(this.getServerConfig(entry.name));
      } catch {
        // Ignore invalid directories
      }
    }
    
    return servers;
  }

  /**
   * Start an MCP server and initialize the client
   */
  async startServer(name: string): Promise<void> {
    if (this.activeClients.has(name)) {
      return; // Already running
    }

    const config = this.getServerConfig(name);
    
    if (config.transport === 'http') {
      throw new Error('HTTP transport not yet implemented for MCP Client');
    }

    if (!config.command) {
      throw new Error(`MCP Server "${name}" is missing a start command.`);
    }

    // Stdio transport
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args || [],
      env: { ...(process.env as Record<string, string>), ...(config.env || {}) }
    });

    const client = new Client(
      { name: 'skillspace', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);
    this.activeClients.set(name, client);

    // Fetch and cache tools
    const toolsResponse = await client.listTools();
    this.availableTools.set(name, toolsResponse.tools);
  }

  /**
   * Stop an MCP server
   */
  async stopServer(name: string): Promise<void> {
    const client = this.activeClients.get(name);
    if (client) {
      await client.close();
      this.activeClients.delete(name);
      this.availableTools.delete(name);
    }
  }

  /**
   * Get the status of an MCP server
   */
  getServerStatus(name: string): 'running' | 'stopped' {
    return this.activeClients.has(name) ? 'running' : 'stopped';
  }

  /**
   * Get all tools from all attached MCP servers
   */
  getAttachedTools(): Array<{ serverName: string; tool: McpTool }> {
    const allTools: Array<{ serverName: string; tool: McpTool }> = [];
    for (const [serverName, tools] of this.availableTools.entries()) {
      for (const t of tools) {
        allTools.push({ serverName, tool: t });
      }
    }
    return allTools;
  }

  /**
   * Execute a tool on a specific server
   */
  async callTool(serverName: string, toolName: string, args: Record<string, unknown>): Promise<string> {
    const client = this.activeClients.get(serverName);
    if (!client) {
      throw new Error(`MCP Server "${serverName}" is not running`);
    }

    const result = await client.callTool({
      name: toolName,
      arguments: args
    });

    if (result.isError) {
      throw new Error(`Tool execution error: ${JSON.stringify(result.content)}`);
    }

    return JSON.stringify(result.content);
  }
}
