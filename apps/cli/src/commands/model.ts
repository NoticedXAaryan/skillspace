import type { Command } from 'commander';
import {
  setApiKey,
  getApiKey,
  getDefaultModel,
  setDefaultModel,
  listConfiguredModels,
  adapterRegistry,
} from '@skillspace/runtime';
import { intro, password as passwordPrompt, isCancel, cancel, outro, spinner } from '@clack/prompts';
import pc from 'picocolors';

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
      const providers = adapterRegistry.listProviders();
      if (!providers.includes(provider)) {
        if (!opts.yes) cancel(`Unknown provider "${provider}". Available: ${providers.join(', ')}`);
        else console.error(`✗ Unknown provider "${provider}". Available: ${providers.join(', ')}`);
        process.exit(1);
      }

      let key = opts.key;
      let url = opts.url;

      if (!opts.yes && !key && provider !== 'ollama') {
        intro(pc.bgCyan(pc.black(` AIR Model Setup: ${provider} `)));
        
        const keyInput = await passwordPrompt({
          message: `API Key for ${provider}:`,
        });
        if (isCancel(keyInput)) { cancel('Operation cancelled.'); process.exit(0); }
        key = keyInput;
      }

      if (!key && provider !== 'ollama') {
        if (!opts.yes) cancel('API key is required.');
        else console.error('✗ API key is required.');
        process.exit(1);
      }

      setApiKey(provider, key || '', url);
      
      if (!opts.yes) {
        let msg = `✓ Provider configured: "${provider}"`;
        if (url) msg += `\n  Base URL: ${url}`;
        outro(pc.green(msg));
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
        console.log('No models configured. Run `air model add <provider> -k <key>`');
        return;
      }

      console.log('Configured Models:');
      console.log('─'.repeat(50));
      for (const m of models) {
        const isDefault = defaultModel.startsWith(m.provider) ? ' (default)' : '';
        const keyStatus = m.hasKey ? '✓ key set' : '✗ no key';
        console.log(`  ${m.provider}${isDefault}`);
        console.log(`    Status: ${keyStatus}`);
        if (m.baseUrl) console.log(`    URL: ${m.baseUrl}`);
      }

      // Always show Ollama (no key needed)
      if (!models.find((m) => m.provider === 'ollama')) {
        const isDefault = defaultModel.startsWith('ollama') ? ' (default)' : '';
        console.log(`  ollama${isDefault}`);
        console.log('    Status: ✓ no key required');
        console.log('    URL: http://localhost:11434');
      }
    });

  model
    .command('default <modelId>')
    .description('Set the default model (e.g., ollama/llama3.2)')
    .action((modelId: string) => {
      try {
        adapterRegistry.getAdapter(modelId);
        setDefaultModel(modelId);
        console.log(`✓ Default model set to "${modelId}"`);
      } catch (err) {
        console.error(`✗ ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });

  model
    .command('test <modelId>')
    .description('Test a model by sending a simple prompt')
    .option('-y, --yes', 'Headless mode')
    .action(async (modelId: string, opts) => {
      try {
        const { adapter, modelName } = adapterRegistry.getAdapter(modelId);
        const provider = modelId.split('/')[0]!;
        const apiKey = getApiKey(provider) ?? '';

        if (!apiKey && provider !== 'ollama') {
          console.error(`✗ No API key for "${provider}". Run \`air model add ${provider}\``);
          process.exit(1);
        }

        const s = spinner();
        if (!opts.yes) s.start(`Testing ${modelId}...`);
        else console.log(`Testing ${modelId}...`);

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

        const request = adapter.buildRequest(testSkill, 'Say "AIR works!" and nothing else.', {
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
          if (!opts.yes) s.stop('Test failed.');
          console.error(`✗ API returned ${res.status}: ${await res.text()}`);
          process.exit(1);
        }

        const data = await res.json();
        const result = adapter.parseResponse(data);
        
        if (!opts.yes) {
          s.stop('Test complete.');
          outro(pc.green(`✓ Response: ${result.output}\n  Tokens: ${result.usage.promptTokens} prompt + ${result.usage.completionTokens} completion`));
        } else {
          console.log(`✓ Response: ${result.output}`);
          console.log(`  Tokens: ${result.usage.promptTokens} prompt + ${result.usage.completionTokens} completion`);
        }
      } catch (err) {
        console.error(`✗ Test failed: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });
}
