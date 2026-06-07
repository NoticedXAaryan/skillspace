import { Command } from 'commander';
import { McpManager } from '@skillspace/runtime';

export const mcpCommand = new Command('mcp')
  .description('Manage MCP servers');

mcpCommand
  .command('install <server>')
  .description('Install an MCP server configuration')
  .option('--from <path_or_url>', 'Install from a local file path or remote URL')
  .action(async (serverName, options) => {
    const manager = new McpManager();
    console.log(`Installing MCP server "${serverName}"...`);
    try {
      await manager.installServer(serverName, options.from);
      console.log(`✅ Successfully installed MCP server "${serverName}".`);
    } catch (err) {
      console.error(`❌ Failed to install MCP server: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
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
    const manager = new McpManager();
    console.log(`Updating MCP server "${serverName}"...`);
    try {
      // Re-installing from the registry will fetch the latest config
      await manager.installServer(serverName);
      console.log(`✅ Successfully updated MCP server "${serverName}".`);
    } catch (err) {
      console.error(`❌ Failed to update MCP server: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });
