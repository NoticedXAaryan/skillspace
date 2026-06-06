import { Command } from 'commander';
import { AgentExecutor, ExecutionError } from '@skillspace/runtime';

export const agentCommand = new Command('agent')
  .description('Manage and execute agents');

agentCommand
  .command('run <agent>')
  .description('Run an agent')
  .option('-i, --input <input>', 'Input text or file path')
  .option('-t, --task <task>', 'Task description (alias for --input)')
  .action(async (agentName, options) => {
    const input = options.input || options.task;
    if (!input) {
      console.error('Error: Must provide --input or --task');
      process.exit(1);
    }

    try {
      const executor = new AgentExecutor();
      const result = await executor.run({
        agent: agentName,
        input: input,
      });

      console.log(result.output);
    } catch (err) {
      if (err instanceof ExecutionError) {
        console.error(`Error: ${err.message}`);
      } else {
        console.error('Unexpected error:', err);
      }
      process.exit(1);
    }
  });

agentCommand
  .command('install <agent>')
  .description('Install an agent and its dependencies')
  .action(async (agentName) => {
    // TODO: Connect to registry and fetch agent and skills
    console.log(`Installing agent ${agentName}... (registry connection stubbed)`);
  });

agentCommand
  .command('list')
  .description('List installed agents')
  .action(async () => {
    // TODO: Use cache to list agents
    console.log('Installed agents: (stub)');
  });
