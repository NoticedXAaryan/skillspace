import type { Command } from 'commander';
import { Executor, AgentExecutor, AgentResolver } from '@skillspace/runtime';
import inquirer from 'inquirer';

export function registerRunCommand(program: Command): void {
  program
    .command('run <skill>')
    .description('Execute a skill or agent against an input')
    .option('-i, --input <input>', 'Input text or file path')
    .option('-m, --model <model>', 'Model to use (e.g., ollama/llama3.2)')
    .option('-o, --output <file>', 'Write output to file')
    .option('-t, --temperature <temp>', 'Override temperature', parseFloat)
    .option('--max-tokens <tokens>', 'Override max tokens', parseInt)
    .option('--stream', 'Stream output in real-time')
    .action(async (skillName: string, opts) => {
      const executor = new Executor();

      let input = opts.input;
      const isInteractive = !input;

      if (isInteractive) {
        console.log(`Starting interactive session with "${skillName}". Type "exit" or "quit" to stop.\n`);
      }

      try {
        do {
          if (isInteractive) {
            const answers = await inquirer.prompt([
              {
                type: 'input',
                name: 'input',
                message: '❯',
              }
            ]);
            input = answers.input.trim();
            if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
              break;
            }
            if (!input) continue;
          }

          const runOptions = {
            skill: skillName,
            input: input,
            model: opts.model,
            output: opts.output,
            config: {
              ...(opts.temperature !== undefined && { temperature: opts.temperature }),
              ...(opts.maxTokens !== undefined && { max_tokens: opts.maxTokens }),
            },
          };

          // Determine if this is an agent or a skill
          let isAgent = false;
          try {
            const agentResolver = new AgentResolver();
            agentResolver.resolve(skillName);
            isAgent = true;
          } catch {
            // Not an agent — will run as skill
          }

          if (opts.stream || isInteractive) {
            if (isAgent) {
              console.error(`✗ Error: Streaming mode (--stream) is not yet supported for agents.`);
              process.exit(1);
            }
            // Streaming mode
            for await (const chunk of executor.runStream(runOptions)) {
              process.stdout.write(chunk);
            }
            process.stdout.write('\n\n');
          } else {
          // Normal mode

          let result;
          if (isAgent) {
            const agentExecutor = new AgentExecutor();
            result = await agentExecutor.run({
              agent: skillName,
              input: input,
            });
          } else {
            result = await executor.run(runOptions);
          }

          console.log('');
          console.log(result.output);
          console.log('');
          console.log('─'.repeat(50));
          console.log(`  Model: ${result.model}`);
          console.log(`  Duration: ${result.duration_ms}ms`);
          console.log(`  Tokens: ${result.usage.promptTokens} in / ${result.usage.completionTokens} out`);
          console.log(`  Status: ${result.status}`);

          if (opts.output) {
            console.log(`  Output saved to: ${opts.output}`);
          }
        }
        } while (isInteractive);
      } catch (err) {
        console.error(`✗ Execution failed: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });
}
