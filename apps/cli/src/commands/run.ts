import type { Command } from 'commander';
import { Executor } from '@skillspace/runtime';

export function registerRunCommand(program: Command): void {
  program
    .command('run <skill>')
    .description('Execute a skill against an input')
    .requiredOption('-i, --input <input>', 'Input text or file path')
    .option('-m, --model <model>', 'Model to use (e.g., ollama/llama3.2)')
    .option('-o, --output <file>', 'Write output to file')
    .option('-t, --temperature <temp>', 'Override temperature', parseFloat)
    .option('--max-tokens <tokens>', 'Override max tokens', parseInt)
    .option('--stream', 'Stream output in real-time')
    .action(async (skillName: string, opts) => {
      const executor = new Executor();

      try {
        const runOptions = {
          skill: skillName,
          input: opts.input,
          model: opts.model,
          output: opts.output,
          config: {
            ...(opts.temperature !== undefined && { temperature: opts.temperature }),
            ...(opts.maxTokens !== undefined && { max_tokens: opts.maxTokens }),
          },
        };

        if (opts.stream) {
          // Streaming mode
          process.stdout.write('');
          for await (const chunk of executor.runStream(runOptions)) {
            process.stdout.write(chunk);
          }
          process.stdout.write('\n');
        } else {
          // Normal mode
          console.log(`⟳ Running "${skillName}"...`);
          const result = await executor.run(runOptions);

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
      } catch (err) {
        console.error(`✗ Execution failed: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });
}
