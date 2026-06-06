import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { getSkillspacePath } from './config.js';

export interface McpServerConfig {
  name: string;
  version: string;
  transport: 'stdio' | 'http';
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
}

export class McpManager {
  private mcpDir: string;
  private activeServers: Map<string, ChildProcess> = new Map();

  constructor() {
    this.mcpDir = path.join(getSkillspacePath(), 'mcp');
    if (!fs.existsSync(this.mcpDir)) {
      fs.mkdirSync(this.mcpDir, { recursive: true });
    }
  }

  /**
   * Install an MCP server configuration
   */
  installServer(config: McpServerConfig): void {
    const serverDir = path.join(this.mcpDir, config.name);
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }
    const configPath = path.join(serverDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * Get an installed server config
   */
  getServerConfig(name: string): McpServerConfig {
    const configPath = path.join(this.mcpDir, name, 'config.json');
    if (!fs.existsSync(configPath)) {
      throw new Error(`MCP Server "${name}" is not installed.`);
    }
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw) as McpServerConfig;
  }

  /**
   * List all installed MCP servers
   */
  listServers(): McpServerConfig[] {
    if (!fs.existsSync(this.mcpDir)) return [];
    
    const entries = fs.readdirSync(this.mcpDir, { withFileTypes: true });
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
   * Start an MCP server (only applicable for stdio transport)
   */
  startServer(name: string): void {
    if (this.activeServers.has(name)) {
      return; // Already running
    }

    const config = this.getServerConfig(name);
    if (config.transport === 'http') {
      return; // HTTP servers don't need to be started locally
    }

    if (!config.command) {
      throw new Error(`MCP Server "${name}" is missing a start command.`);
    }

    const proc = spawn(config.command, config.args || [], {
      env: { ...process.env, ...(config.env || {}) },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    proc.on('error', (err) => {
      console.error(`MCP Server "${name}" failed to start:`, err);
      this.activeServers.delete(name);
    });

    proc.on('exit', (code) => {
      console.log(`MCP Server "${name}" exited with code ${code}`);
      this.activeServers.delete(name);
    });

    this.activeServers.set(name, proc);
  }

  /**
   * Stop an MCP server
   */
  stopServer(name: string): void {
    const proc = this.activeServers.get(name);
    if (proc) {
      proc.kill('SIGTERM');
      this.activeServers.delete(name);
    }
  }

  /**
   * Get the status of an MCP server
   */
  getServerStatus(name: string): 'running' | 'stopped' {
    return this.activeServers.has(name) ? 'running' : 'stopped';
  }

  /**
   * Auto-attach servers for an agent
   */
  autoAttach(servers: Array<{ name: string; config?: Record<string, unknown> }>): void {
    for (const srv of servers) {
      this.startServer(srv.name);
    }
  }
}
