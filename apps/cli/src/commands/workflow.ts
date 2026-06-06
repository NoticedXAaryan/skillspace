import { Command } from 'commander';
import * as fs from 'node:fs';
import { WorkflowEngine } from '@skillspace/runtime';
import { validateWorkflowYaml } from '@skillspace/schema';

export const workflowCommand = new Command('workflow')
  .description('Manage and execute workflows');

workflowCommand
  .command('run <workflowFile>')
  .description('Run a local workflow definition')
  .option('-i, --input <input>', 'Input text')
  .action(async (workflowFile, options) => {
    if (!fs.existsSync(workflowFile)) {
      console.error(`Workflow file not found: ${workflowFile}`);
      process.exit(1);
    }

    const raw = fs.readFileSync(workflowFile, 'utf-8');
    const validation = validateWorkflowYaml(raw);

    if (!validation.success) {
      console.error(`Invalid workflow file:\n${validation.errors.message}`);
      process.exit(1);
    }

    const engine = new WorkflowEngine();
    console.log(`Executing workflow ${validation.data.name}...`);
    
    try {
      const outputs = await engine.run({
        workflow: validation.data,
        input: options.input || '',
      });

      console.log('Workflow Output:');
      console.log(JSON.stringify(outputs, null, 2));
    } catch (err) {
      console.error('Workflow failed:', err);
      process.exit(1);
    }
  });

workflowCommand
  .command('list')
  .description('List installed workflows')
  .action(async () => {
    console.log('Installed workflows: (stub)');
  });
