import { Command } from 'commander';
import { McpManager } from '@skillspace/runtime';

export const mcpCommand = new Command('mcp')
  .description('Manage MCP servers');

mcpCommand
  .command('install <server>')
  .description('Install an MCP server')
  .action(async (serverName) => {
    // TODO: Connect to registry to fetch MCP server config
    // const manager = new McpManager();
    console.log(`Installing MCP server ${serverName}... (stub)`);
    // Example: manager.installServer({ name: serverName, version: '1.0.0', transport: 'stdio' })
  });

mcpCommand
  .command('list')
  .description('List installed MCP servers')
  .action(() => {
    const manager = new McpManager();
    const servers = manager.listServers();
    if (servers.length === 0) {
      console.log('No MCP servers installed.');
    } else {
      console.table(servers, ['name', 'version', 'transport']);
    }
  });

mcpCommand
  .command('update <server>')
  .description('Update an MCP server')
  .action(async (serverName) => {
    console.log(`Updating MCP server ${serverName}... (stub)`);
  });
