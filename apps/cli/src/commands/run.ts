import type { Command } from 'commander';
import { Executor, AgentExecutor, AgentResolver, resolveEnvForPackage } from '@skillspace/runtime';
import { text, isCancel } from '@clack/prompts';
import { intro } from '../ui/states/intro.js';
import { createLoader } from '../ui/states/loader.js';
import { successStandard } from '../ui/states/success.js';
import { errorOperational, errorInline } from '../ui/states/error.js';
import { c } from '../ui/tokens/colors.js';

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
    .option('-y, --yes', 'Headless mode (strictly bypass interactive prompts)')
    .action(async (skillName: string, opts) => {
      const executor = new Executor();

      let input = opts.input;
      const isInteractive = !input;

      if (isInteractive && opts.yes) {
        errorOperational('Input required', {
          message: `Input is required for "${skillName}" in headless mode.`,
          hint: 'Use --input "your input".'
        });
        process.exit(1);
      }

      if (isInteractive) {
        intro('run', skillName);
        console.log(c.textFaint('Type "exit" or "quit" to stop.\n'));
      }

      // --- ENVIRONMENT INJECTION ---
      const pkgEnv = resolveEnvForPackage(skillName);
      Object.assign(process.env, pkgEnv);
      // -----------------------------

      try {
        do {
          if (isInteractive) {
            const inputPrompt = await text({
              message: c.brand('❯'),
            });
            if (isCancel(inputPrompt)) { 
              errorInline('Session ended.'); 
              process.exit(0); 
            }
            input = (inputPrompt as string).trim();
            
            if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
              successStandard('Session ended.');
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
              if (isInteractive) {
                errorInline(`Streaming mode is not yet supported for agents.`);
              } else {
                errorOperational('Streaming error', { message: 'Streaming mode (--stream) is not yet supported for agents.' });
              }
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
            const loader = !opts.yes ? createLoader(`Executing ${skillName}`) : null;

            if (isAgent) {
              const agentExecutor = new AgentExecutor();
              result = await agentExecutor.run({
                agent: skillName,
                input: input,
              });
            } else {
              result = await executor.run(runOptions);
            }

            if (loader) loader.succeed('Execution complete');

            if (!opts.yes) {
              console.log('\n' + result.output + '\n');
              successStandard('Execution Stats', {
                'Model': result.model,
                'Duration': `${result.duration_ms}ms`,
                'Tokens': `${result.usage.promptTokens} in / ${result.usage.completionTokens} out`,
                'Status': result.status
              });
            } else {
              console.log(result.output);
            }
          }
        } while (isInteractive);
      } catch (err) {
        errorOperational('Execution failed', {
          message: err instanceof Error ? err.message : String(err)
        });
        process.exit(1);
      }
    });
}
