import { Command } from 'commander';
import { AgentExecutor, ExecutionError } from '@skillspace/runtime';

export const agentCommand = new Command('agent')
  .description('Manage and execute agents');

agentCommand
  .command('run <agent> [positionalInput...]')
  .description('Run an agent')
  .option('-i, --input <input>', 'Input text or file path')
  .option('-t, --task <task>', 'Task description (alias for --input)')
  .option('-s, --session <sessionId>', 'Resume or start a session by ID')
  .action(async (agentName, positionalInput, options) => {
    let input = options.input || options.task;
    if (positionalInput && positionalInput.length > 0) {
      input = input ? `${input} ${positionalInput.join(' ')}` : positionalInput.join(' ');
    }
    if (!input) {
      console.error('Error: Must provide --input or --task');
      process.exit(1);
    }

    try {
      const executor = new AgentExecutor();
      const result = await executor.run({
        agent: agentName,
        input: input,
        session_id: options.session,
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
    console.log(`To install an agent, use the unified install command:`);
    console.log(`  air install ${agentName}`);
  });

agentCommand
  .command('list')
  .description('List installed agents')
  .action(async () => {
    const { SkillCache } = await import('@skillspace/runtime');
    const cache = new SkillCache();
    const installed = cache.listInstalledAgents();

    if (installed.length === 0) {
      console.log('No agents installed.');
      return;
    }

    console.log(`Installed agents (${installed.length}):\n`);

    for (const pkg of installed) {
      console.log(`  ${pkg.name}@${pkg.version}`);
      console.log(`    Path: ${pkg.path}`);
    }
  });
