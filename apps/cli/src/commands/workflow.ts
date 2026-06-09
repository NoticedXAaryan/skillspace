import { Command } from 'commander';
import { WorkflowEngine, WorkflowResolver } from '@skillspace/runtime';
import { createLoader } from '../ui/states/loader.js';
import { errorOperational } from '../ui/states/error.js';
import { box } from '../ui/layout/box.js';
import { c } from '../ui/tokens/colors.js';

export const workflowCommand = new Command('workflow')
  .description('Manage and run multi-step workflows');

workflowCommand
  .command('run <name>')
  .description('Run a workflow defined in workflow.yaml')
  .option('-i, --input <string>', 'Input to the workflow')
  .action(async (name, options) => {
    const loader = createLoader(`Resolving workflow "${name}"...`);
    try {
      const resolver = new WorkflowResolver();
      const workflow = await resolver.resolve(name);
      
      loader.update('Executing workflow...');
      const engine = new WorkflowEngine();
      const result = await engine.run({
        workflow,
        input: options.input || '',
      });
      
      loader.succeed('Workflow completed');
      
      console.log(box([
        c.text(JSON.stringify(result, null, 2))
      ], { title: 'Workflow Result', colorFn: c.successDim }));
    } catch (err) {
      loader.fail('Workflow failed');
      errorOperational('Execution Error', { message: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
  });

workflowCommand
  .command('list')
  .description('List available workflows')
  .action(async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { getSkillspacePath } = await import('@skillspace/runtime');

    const cwd = process.cwd();
    const dirs = [
      { name: 'Local Project', path: path.join(cwd, 'workflows') },
      { name: 'Local Project (.air)', path: path.join(cwd, '.air', 'workflows') },
      { name: 'Global', path: path.join(getSkillspacePath(), 'workflows') },
    ];

    let foundAny = false;
    const rows: string[] = [];

    for (const dir of dirs) {
      if (fs.existsSync(dir.path)) {
        const files = fs.readdirSync(dir.path).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
        if (files.length > 0) {
          rows.push(`${c.textFaint('Directory:')} ${c.textMuted(dir.path)}`);
          for (const file of files) {
            rows.push(`  ${c.brand(file.replace(/\.yaml$/, '').replace(/\.yml$/, ''))}`);
          }
          rows.push('');
          foundAny = true;
        }
      }
    }

    if (!foundAny) {
      console.log(box(['No workflows found locally or globally.', 'Create a workflow file in ./workflows/ or ~/.air/workflows/.'], { colorFn: c.border }));
      return;
    }

    console.log(box(rows, { title: 'Available Workflows', colorFn: c.brand }));
  });
