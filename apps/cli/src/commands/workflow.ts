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
  .action(() => {
    // Basic stub, a real implementation would scan directories
    console.log(`Listing workflows not fully implemented. Check your local ./workflows/ or ~/.skillspace/workflows/ directory.`);
  });
