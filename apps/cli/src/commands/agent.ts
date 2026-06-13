import { Command } from 'commander';
import { AgentExecutor, ExecutionError } from '@skillspace/runtime';
import { createLoader } from '../ui/states/loader.js';
import { errorOperational } from '../ui/states/error.js';
import { warn } from '../ui/states/warning.js';
import { box } from '../ui/layout/box.js';
import { c } from '../ui/tokens/colors.js';

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
      errorOperational('Missing Input', { message: 'Must provide --input or --task' });
      process.exit(1);
    }

    const loader = createLoader(`Starting agent "${agentName}"...`);
    try {
      const executor = new AgentExecutor();
      loader.update('Executing task...');
      const result = await executor.run({
        agent: agentName,
        input: input,
        session_id: options.session,
      });

      loader.succeed('Task completed');
      console.log(result.output);
    } catch (err) {
      loader.fail('Agent execution failed');
      if (err instanceof ExecutionError) {
        errorOperational('Execution Error', { message: err.message });
      } else {
        errorOperational('System Error', { message: String(err) });
      }
      process.exit(1);
    }
  });

agentCommand
  .command('install <agent>')
  .description('Install an agent and its dependencies')
  .action(async (agentName) => {
    warn('Deprecated Command', [
      'To install an agent, use the unified install command:',
      `  ${c.brand(`skillspace install ${agentName}`)}`
    ]);
  });

agentCommand
  .command('list')
  .description('List installed agents')
  .action(async () => {
    const { SkillCache } = await import('@skillspace/runtime');
    const cache = new SkillCache();
    const installed = cache.listInstalledAgents();

    if (installed.length === 0) {
      console.log(box(['No agents installed.'], { colorFn: c.border }));
      return;
    }

    const rows: string[] = [];
    for (const pkg of installed) {
      rows.push(`${c.brand(pkg.name)} ${c.textFaint(`@${pkg.version}`)}`);
      rows.push(`  ${c.textFaint('Path:')} ${c.textMuted(pkg.path)}`);
      rows.push('');
    }

    console.log(box(rows, { title: `Installed Agents (${installed.length})`, colorFn: c.successDim }));
  });
