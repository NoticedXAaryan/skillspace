import { Command } from 'commander';
import { loadConfig, saveConfig } from '@skillspace/runtime';
import { successStandard } from '../ui/states/success.js';
import { errorOperational } from '../ui/states/error.js';
import { c } from '../ui/tokens/colors.js';
import { box } from '../ui/layout/box.js';

export const configCommand = new Command('config')
  .description('Manage global SkillSpace CLI configuration');

configCommand
  .command('set <key> <value>')
  .description('Set a configuration key (e.g. registry_url)')
  .action((key, value) => {
    try {
      const config = loadConfig() as any;
      config[key] = value;
      saveConfig(config);
      successStandard('Configuration updated', { [key]: value });
    } catch (err) {
      errorOperational('Failed to set config', { message: err instanceof Error ? err.message : String(err) });
    }
  });

configCommand
  .command('get <key>')
  .description('Get a configuration key')
  .action((key) => {
    try {
      const config = loadConfig() as any;
      console.log(config[key]);
    } catch (err) {
      errorOperational('Failed to get config', { message: err instanceof Error ? err.message : String(err) });
    }
  });

configCommand
  .command('list')
  .description('List all configuration keys')
  .action(() => {
    try {
      const config = loadConfig();
      const rows = [];
      for (const [key, value] of Object.entries(config)) {
        if (typeof value !== 'object') {
          rows.push([c.brand(key), c.text(String(value))]);
        }
      }
      
      console.log(box(rows.map(r => r.join(' : ')), {
        title: 'Global Configuration',
        colorFn: c.successDim
      }));
    } catch (err) {
      errorOperational('Failed to list config', { message: err instanceof Error ? err.message : String(err) });
    }
  });
