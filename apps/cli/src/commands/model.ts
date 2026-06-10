import type { Command } from 'commander';
import {
  setApiKey,
  getApiKey,
  getDefaultModel,
  setDefaultModel,
  listConfiguredModels,
  adapterRegistry,
} from '@skillspace/runtime';
import { password as passwordPrompt, isCancel, cancel } from '@clack/prompts';
import { intro } from '../ui/states/intro.js';
import { outro } from '../ui/states/outro.js';
import { successStandard } from '../ui/states/success.js';
import { errorOperational } from '../ui/states/error.js';
import { createLoader } from '../ui/states/loader.js';
import { box } from '../ui/layout/box.js';
import { c } from '../ui/tokens/colors.js';

export function registerModelCommand(program: Command): void {
  const model = program
    .command('model')
    .description('Manage model provider configurations');

  model
    .command('add <provider>')
    .description('Configure an API key for a model provider (openai, anthropic, gemini, ollama)')
    .option('-k, --key <apiKey>', 'API key for the provider')
    .option('-u, --url <baseUrl>', 'Custom base URL for the provider')
    .option('-y, --yes', 'Headless mode')
    .action(async (provider: string, opts) => {
      const startTime = Date.now();
      const providers = adapterRegistry.listProviders();
      if (!providers.includes(provider)) {
        if (!opts.yes) {
          errorOperational('Unknown provider', { message: `Available providers: ${providers.join(', ')}` });
        } else {
          console.error(`✗ Unknown provider "${provider}". Available: ${providers.join(', ')}`);
        }
        process.exit(1);
      }

      let key = opts.key;
      let url = opts.url;

      if (!opts.yes && !key && provider !== 'ollama') {
        intro('model add', `SkillSpace Model Setup: ${provider}`);
        
        const keyInput = await passwordPrompt({
          message: `API Key for ${provider}:`,
        });
        if (isCancel(keyInput)) { cancel('Operation cancelled.'); process.exit(0); }
        key = keyInput;
      }

      if (!key && provider !== 'ollama') {
        if (!opts.yes) {
          errorOperational('API key missing', { message: 'API key is required for this provider.' });
          process.exit(1);
        } else {
          console.error('✗ API key is required.');
          process.exit(1);
        }
      }

      setApiKey(provider, key || '', url);
      
      if (!opts.yes) {
        const details: Record<string, string> = { Provider: provider };
        if (url) details['Base URL'] = url;
        successStandard('Provider Configured', details);
        outro(Date.now() - startTime);
      } else {
        console.log(`✓ Provider configured: "${provider}"`);
        if (url) console.log(`  Base URL: ${url}`);
      }
    });

  model
    .command('list')
    .description('List all configured model providers')
    .action(() => {
      const models = listConfiguredModels();
      const defaultModel = getDefaultModel();

      if (models.length === 0) {
        console.log(box(['No models configured.', 'Run `air model add <provider>`'], { colorFn: c.border }));
        return;
      }

      const rows: string[] = [];
      for (const m of models) {
        const isDefault = defaultModel.startsWith(m.provider) ? c.success(' (default)') : '';
        const keyStatus = m.hasKey ? c.success('✓ key set') : c.error('✗ no key');
        rows.push(`${c.brand(m.provider)}${isDefault}`);
        rows.push(`  ${c.textFaint('Status:')} ${keyStatus}`);
        if (m.baseUrl) rows.push(`  ${c.textFaint('URL:')}    ${c.textMuted(m.baseUrl)}`);
        rows.push('');
      }

      if (!models.find((m) => m.provider === 'ollama')) {
        const isDefault = defaultModel.startsWith('ollama') ? c.success(' (default)') : '';
        rows.push(`${c.brand('ollama')}${isDefault}`);
        rows.push(`  ${c.textFaint('Status:')} ${c.success('✓ no key required')}`);
        rows.push(`  ${c.textFaint('URL:')}    ${c.textMuted('http://localhost:11434')}`);
      }

      console.log(box(rows, { title: 'Configured Models', colorFn: c.successDim }));
    });

  model
    .command('default <modelId>')
    .description('Set the default model (e.g., ollama/llama3.2)')
    .action((modelId: string) => {
      try {
        adapterRegistry.getAdapter(modelId);
        setDefaultModel(modelId);
        successStandard('Default Model Set', { Model: modelId });
      } catch (err) {
        errorOperational('Invalid Model', { message: err instanceof Error ? err.message : String(err) });
        process.exit(1);
      }
    });

  model
    .command('test <modelId>')
    .description('Test a model by sending a simple prompt')
    .option('-y, --yes', 'Headless mode')
    .action(async (modelId: string, opts) => {
      const startTime = Date.now();
      try {
        const { adapter, modelName } = adapterRegistry.getAdapter(modelId);
        const provider = modelId.split('/')[0]!;
        const apiKey = getApiKey(provider) ?? '';

        if (!apiKey && provider !== 'ollama') {
          if (!opts.yes) {
            errorOperational('Missing API Key', { message: `No API key for "${provider}". Run \`air model add ${provider}\`` });
          } else {
            console.error(`✗ No API key for "${provider}".`);
          }
          process.exit(1);
        }

        const loader = !opts.yes ? createLoader(`Testing ${modelId}...`) : null;
        if (opts.yes) console.log(`Testing ${modelId}...`);

        const testSkill = {
          name: 'test',
          version: '1.0.0',
          description: 'test',
          author: 'test',
          license: 'MIT',
          instructions: {
            system: 'You are a helpful assistant.',
            user_template: '{{input}}',
            output_format: 'text' as const,
          },
          tags: [],
          category: 'other' as const,
          examples: [],
          permissions: [],
          mcpServers: [],
          env: {},
          config: { temperature: 0.3, max_tokens: 100, timeout_seconds: 15 },
        };

        const request = adapter.buildRequest(testSkill, 'Say "SkillSpace works!" and nothing else.', {
          apiKey,
          modelId: modelName,
          temperature: 0.3,
          maxTokens: 100,
          timeoutSeconds: 15,
        });

        const res = await fetch(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify(request.body),
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          if (loader) loader.fail('Test failed.');
          errorOperational('API Error', { message: `API returned ${res.status}: ${await res.text()}` });
          process.exit(1);
        }

        const data = await res.json();
        const result = adapter.parseResponse(data);
        
        if (loader) {
          loader.succeed('Test complete');
          successStandard('Model Response', {
            Output: result.output,
            Tokens: `${result.usage.promptTokens} prompt + ${result.usage.completionTokens} completion`
          });
          outro(Date.now() - startTime);
        } else {
          console.log(`✓ Response: ${result.output}`);
          console.log(`  Tokens: ${result.usage.promptTokens} prompt + ${result.usage.completionTokens} completion`);
        }
      } catch (err) {
        errorOperational('Test Failed', { message: err instanceof Error ? err.message : String(err) });
        process.exit(1);
      }
    });
}
