import { Command } from 'commander';
import { McpManager } from '@skillspace/runtime';
import { createLoader } from '../ui/states/loader.js';
import { errorOperational } from '../ui/states/error.js';
import { successStandard } from '../ui/states/success.js';
import { box } from '../ui/layout/box.js';
import { c } from '../ui/tokens/colors.js';

export const mcpCommand = new Command('mcp')
  .description('Manage MCP servers');

mcpCommand
  .command('install <server>')
  .description('Install an MCP server configuration')
  .option('--from <path_or_url>', 'Install from a local file path or remote URL')
  .action(async (serverName, options) => {
    const manager = new McpManager();
    const loader = createLoader(`Installing MCP server "${serverName}"...`);
    try {
      await manager.installServer(serverName, options.from);
      loader.succeed(`Installed ${serverName}`);
      successStandard('MCP Server Installed', { Server: serverName });
    } catch (err) {
      loader.fail('Installation failed');
      errorOperational('Install Error', { message: err instanceof Error ? err.message : String(err) });
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
      console.log(box(['No MCP servers installed.'], { colorFn: c.border }));
      return;
    }
    
    const rows: string[] = [];
    for (const s of servers) {
      rows.push(`${c.brand(s.name)} ${c.textFaint(`v${s.version || 'unknown'}`)}`);
      rows.push(`  ${c.textFaint('Transport:')} ${c.text(s.transport)}`);
      rows.push('');
    }
    
    console.log(box(rows, { title: 'Installed MCP Servers', colorFn: c.successDim }));
  });

mcpCommand
  .command('update <server>')
  .description('Update an MCP server')
  .action(async (serverName) => {
    const manager = new McpManager();
    const loader = createLoader(`Updating MCP server "${serverName}"...`);
    try {
      await manager.installServer(serverName);
      loader.succeed(`Updated ${serverName}`);
      successStandard('MCP Server Updated', { Server: serverName });
    } catch (err) {
      loader.fail('Update failed');
      errorOperational('Update Error', { message: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
  });
