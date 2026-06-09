import { Command } from 'commander';
import { WorkflowEngine, WorkflowResolver } from '@skillspace/runtime';

export const workflowCommand = new Command('workflow')
  .description('Manage and run multi-step workflows');

workflowCommand
  .command('run <name>')
  .description('Run a workflow defined in workflow.yaml')
  .option('-i, --input <string>', 'Input to the workflow')
  .action(async (name, options) => {
    try {
      const resolver = new WorkflowResolver();
      console.log(`Resolving workflow "${name}"...`);
      const workflow = await resolver.resolve(name);
      
      const engine = new WorkflowEngine();
      const result = await engine.run({
        workflow,
        input: options.input || '',
      });
      
      console.log('\n--- Workflow Result ---');
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(`\n❌ Workflow Execution Failed: ${err instanceof Error ? err.message : String(err)}`);
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
      { name: 'Local Project (workflows/)', path: path.join(cwd, 'workflows') },
      { name: 'Local Project (.air/workflows/)', path: path.join(cwd, '.air', 'workflows') },
      { name: 'Global (~/.air/workflows/)', path: path.join(getSkillspacePath(), 'workflows') },
    ];

    let foundAny = false;

    for (const dir of dirs) {
      if (fs.existsSync(dir.path)) {
        const files = fs.readdirSync(dir.path).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
        if (files.length > 0) {
          console.log(`\n📂 ${dir.name}:`);
          for (const file of files) {
            console.log(`  - ${file.replace(/\.yaml$/, '').replace(/\.yml$/, '')}`);
          }
          foundAny = true;
        }
      }
    }

    if (!foundAny) {
      console.log('No workflows found locally or globally.');
      console.log('Create a workflow file in ./workflows/ or ~/.air/workflows/.');
    }
  });
