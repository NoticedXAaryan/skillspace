import type { Command } from 'commander';
import { Executor, AgentExecutor, AgentResolver, SkillResolver, resolveEnvForPackage, startPersonaREPL } from '@skillspace/runtime';
import { isLegacyV1Skill } from '@skillspace/schema';
import { text, isCancel } from '@clack/prompts';
import { intro } from '../ui/states/intro.js';
import { createLoader } from '../ui/states/loader.js';
import { successStandard } from '../ui/states/success.js';
import { errorOperational, errorInline } from '../ui/states/error.js';
import { c } from '../ui/tokens/colors.js';

export function registerRunCommand(program: Command): void {
  program
    .command('run <package>')
    .description('Execute a Skill or Agent')
    .option('-i, --input <input>', 'Input text or file path (v1 skills and agents only)')
    .option('-m, --model <model>', 'Model to use (e.g., ollama/llama3.2)')
    .option('-o, --output <file>', 'Write output to file (v1 skills and agents only)')
    .option('-t, --temperature <temp>', 'Override temperature', parseFloat)
    .option('--max-tokens <tokens>', 'Override max tokens', parseInt)
    .option('--stream', 'Stream output in real-time (v1 skills only)')
    .option('-y, --yes', 'Headless mode (strictly bypass interactive prompts)')
    .action(async (packageName: string, opts) => {
      // --- ENVIRONMENT INJECTION ---
      const pkgEnv = resolveEnvForPackage(packageName);
      Object.assign(process.env, pkgEnv);

      // --- RESOLUTION & ROUTING ---
      let resolvedPackage: any;
      let packageType: 'agent' | 'v1-skill' | 'v2-skill' = 'v1-skill';

      try {
        const agentResolver = new AgentResolver();
        resolvedPackage = agentResolver.resolve(packageName);
        packageType = 'agent';
      } catch {
        try {
          const skillResolver = new SkillResolver();
          resolvedPackage = skillResolver.resolve(packageName);
          packageType = isLegacyV1Skill(resolvedPackage) ? 'v1-skill' : 'v2-skill';
        } catch (err) {
          errorOperational('Package not found', {
            message: `Could not resolve "${packageName}" as a skill or agent.`,
            hint: 'Run `skillspace list` to see installed packages.'
          });
          process.exit(1);
        }
      }

      // --- ROUTE: V2 SKILL (REPL) ---
      if (packageType === 'v2-skill') {
        if (opts.yes || opts.input) {
          errorOperational('Unsupported mode', {
            message: 'v2 Skills are personas that run in an interactive REPL.',
            hint: 'Remove --yes and --input flags to start the session.'
          });
          process.exit(1);
        }

        await startPersonaREPL(resolvedPackage, {
          modelOverride: opts.model,
          stream: opts.stream !== false,
        });
        return; // REPL handles its own exit
      }

      // --- ROUTE: AGENT OR V1 SKILL (Single-shot / Batch) ---
      let input = opts.input;
      const isInteractive = !input;

      if (isInteractive && opts.yes) {
        errorOperational('Input required', {
          message: `Input is required for "${packageName}" in headless mode.`,
          hint: 'Use --input "your input".'
        });
        process.exit(1);
      }

      if (isInteractive) {
        intro('run', packageName);
        console.log(c.textFaint('Type "exit" or "quit" to stop.\n'));
      }

      try {
        do {
          if (isInteractive) {
            const inputPrompt = await text({ message: c.brand('❯') });
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
            skill: packageName,
            input: input,
            model: opts.model,
            output: opts.output,
            config: {
              ...(opts.temperature !== undefined && { temperature: opts.temperature }),
              ...(opts.maxTokens !== undefined && { max_tokens: opts.maxTokens }),
            },
          };

          if (opts.stream || isInteractive) {
            if (packageType === 'agent') {
              if (isInteractive) {
                errorInline(`Streaming mode is not yet supported for agents.`);
              } else {
                errorOperational('Streaming error', { message: 'Streaming mode (--stream) is not yet supported for agents.' });
              }
              process.exit(1);
            }
            // Streaming mode for v1-skill
            const executor = new Executor();
            for await (const chunk of executor.runStream(runOptions)) {
              process.stdout.write(chunk);
            }
            process.stdout.write('\n\n');
          } else {
            // Normal mode
            let result;
            const loader = !opts.yes ? createLoader(`Executing ${packageName}`) : null;

            if (packageType === 'agent') {
              const agentExecutor = new AgentExecutor();
              result = await agentExecutor.run({ agent: packageName, input: input });
            } else {
              const executor = new Executor();
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

