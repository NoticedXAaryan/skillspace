#!/usr/bin/env node
import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerLoginCommand, registerWhoamiCommand } from './commands/login.js';
import { registerModelCommand } from './commands/model.js';
import { registerInstallCommand } from './commands/install.js';
import { registerRunCommand } from './commands/run.js';
import { registerSearchCommand } from './commands/search.js';
import { registerPublishCommand } from './commands/publish.js';
import { registerListCommand } from './commands/list.js';
import { registerUninstallCommand } from './commands/uninstall.js';
import { registerInfoCommand } from './commands/info.js';
import { agentCommand } from './commands/agent.js';
import { mcpCommand } from './commands/mcp.js';
import { workflowCommand } from './commands/workflow.js';
import { orgCommand } from './commands/org.js';
import { envCommand } from './commands/environment.js';
import { registerBenchmarkCommand } from './commands/benchmark.js';

const program = new Command();

program
  .name('skillspace')
  .description('The universal runtime and registry for AI capabilities')
  .version('0.2.0');

registerInitCommand(program);
registerLoginCommand(program);
registerWhoamiCommand(program);
registerModelCommand(program);
registerInstallCommand(program);
registerRunCommand(program);
registerSearchCommand(program);
registerPublishCommand(program);
registerListCommand(program);
registerUninstallCommand(program);
registerInfoCommand(program);
registerBenchmarkCommand(program);

program.addCommand(agentCommand);
program.addCommand(mcpCommand);
program.addCommand(workflowCommand);
program.addCommand(orgCommand);
program.addCommand(envCommand);

program.parse();
