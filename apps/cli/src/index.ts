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
import { registerHelpCommand } from './commands/help.js';
import { registerMigrateCommand } from './commands/migrate.js';
import { registerExportCommand } from './commands/export.js';

import chalk from 'chalk';
import { c } from './ui/tokens/colors.js';

const program = new Command();

program
  .name('skillspace')
  .description(c.brand('The universal runtime and registry for AI capabilities'))
  .version('0.2.0');

const customHelp = `
${chalk.bold(c.brand('SkillSpace CLI'))} - The universal runtime and registry for AI capabilities.

${chalk.bold('USAGE')}
  $ skillspace <command> [options]

${chalk.bold('EXECUTION')}
  ${c.code('run')}         Execute an Agent, Skill, or Workflow locally.

${chalk.bold('PACKAGE MANAGEMENT')}
  ${c.code('search')}      Search the global SkillSpace registry for capabilities.
  ${c.code('install')}     Install a package to your local system.
  ${c.code('uninstall')}   Remove an installed package.
  ${c.code('list')}        List all locally installed packages.
  ${c.code('info')}        View detailed metadata about a specific package.

${chalk.bold('CREATOR TOOLS')}
  ${c.code('init')}        Scaffold a new Agent, Skill, or MCP Server project.
  ${c.code('publish')}     Publish your project to the SkillSpace registry.
  ${c.code('benchmark')}   Run automated tests and benchmarks against your agent.

${chalk.bold('ACCOUNT & CONFIG')}
  ${c.code('login')}       Authenticate with your SkillSpace account.
  ${c.code('whoami')}      View your current authentication status.
  ${c.code('config')}      Manage global CLI configuration (e.g. registry URL).
  ${c.code('model')}       Configure your default AI models (OpenAI, Anthropic, Ollama).
  ${c.code('org')}         Manage your organization and team access.
  ${c.code('env')}         Manage environment variables and secrets.

${chalk.bold('ADVANCED')}
  ${c.code('agent')}       Advanced Agent operations.
  ${c.code('mcp')}         Advanced MCP Server operations.
  ${c.code('workflow')}    Advanced Workflow operations.

${c.textFaint('Run `skillspace <command> --help` for detailed information on specific commands.')}
${c.info('Run `skillspace help` to launch the interactive documentation explorer!')}
`;

program.helpInformation = () => customHelp;

registerHelpCommand(program);
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
registerMigrateCommand(program);
registerExportCommand(program);

import { configCommand } from './commands/config.js';

program.addCommand(agentCommand);
program.addCommand(mcpCommand);
program.addCommand(workflowCommand);
program.addCommand(orgCommand);
program.addCommand(envCommand);
program.addCommand(configCommand);

program.parse();
