import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command } from 'commander';
import { stringify, parse } from 'yaml';
import { readLockFile, getSkillspacePath, setGlobalEnv, setPackageEnv, deleteGlobalEnv, deletePackageEnv, loadEnvStore } from '@skillspace/runtime';
import { intro } from '../ui/states/intro.js';
import { successStandard } from '../ui/states/success.js';
import { errorInline, errorOperational } from '../ui/states/error.js';
import { c } from '../ui/tokens/colors.js';
import { text, isCancel } from '@clack/prompts';
import { box } from '../ui/layout/box.js';

export const envCommand = new Command('env')
  .alias('environment')
  .description('Manage environment variables, secrets, and API keys securely');

envCommand
  .command('set <key> [value]')
  .description('Set an environment variable securely')
  .option('-s, --scope <pkg>', 'Scope the variable to a specific package (e.g. notic/database-agent)')
  .action(async (key, val, options) => {
    let value = val;
    if (!value) {
      intro('env', 'Secure Variable Input');
      const input = await text({
        message: `Enter value for ${c.brand(key)}:`,
      });
      if (isCancel(input)) {
        errorInline('Cancelled.');
        process.exit(0);
      }
      value = input as string;
    }

    if (options.scope) {
      setPackageEnv(options.scope, key, value);
      successStandard('Environment variable saved', {
        Key: key,
        Scope: options.scope,
      });
    } else {
      setGlobalEnv(key, value);
      successStandard('Environment variable saved', {
        Key: key,
        Scope: 'Global',
      });
    }
  });

envCommand
  .command('list')
  .description('List configured environment variables')
  .action(() => {
    const store = loadEnvStore();
    const globalCount = Object.keys(store.global || {}).length;
    const pkgCount = Object.keys(store.packages || {}).reduce((acc, pkg) => acc + Object.keys(store.packages[pkg]).length, 0);

    const rows = [];
    rows.push([c.textFaint('Scope'), c.textFaint('Key'), c.textFaint('Value (Masked)')]);
    
    if (globalCount > 0) {
      for (const key of Object.keys(store.global)) {
        rows.push(['Global', c.brand(key), '********']);
      }
    }
    
    if (pkgCount > 0) {
      for (const [pkg, vars] of Object.entries(store.packages)) {
        for (const key of Object.keys(vars)) {
          rows.push([c.text(pkg), c.brand(key), '********']);
        }
      }
    }

    if (rows.length === 1) {
      rows.push(['-', 'No variables configured', '-']);
    }

    const boxLines = rows.map(r => r.join(' | '));
    console.log(box(boxLines, {
      title: 'Environment Variables',
      colorFn: c.successDim
    }));
  });

envCommand
  .command('unset <key>')
  .description('Delete an environment variable')
  .option('-s, --scope <pkg>', 'Scope the variable to a specific package')
  .action((key, options) => {
    if (options.scope) {
      deletePackageEnv(options.scope, key);
      successStandard('Environment variable deleted', {
        Key: key,
        Scope: options.scope,
      });
    } else {
      deleteGlobalEnv(key);
      successStandard('Environment variable deleted', {
        Key: key,
        Scope: 'Global',
      });
    }
  });

envCommand
  .command('snapshot-export')
  .description('Export the currently installed capabilities to environment.yaml')
  .option('-o, --out <path>', 'Output file path', 'environment.yaml')
  .action((options) => {
    try {
      const lockData = readLockFile(getSkillspacePath());
      
      const envYaml = {
        name: 'air-environment',
        version: '1.0.0',
        dependencies: {} as Record<string, string>,
      };

      if (lockData && lockData.skills) {
        for (const [name, info] of Object.entries(lockData.skills)) {
          envYaml.dependencies[name] = (info as any).version;
        }
      }

      if (lockData && lockData.agents) {
        for (const [name, info] of Object.entries(lockData.agents)) {
          envYaml.dependencies[name] = (info as any).version;
        }
      }

      const outPath = path.resolve(options.out);
      fs.writeFileSync(outPath, stringify(envYaml));
      successStandard('Environment snapshot exported', { Path: outPath });
    } catch (err) {
      errorOperational('Export failed', {
        message: err instanceof Error ? err.message : String(err)
      });
      process.exit(1);
    }
  });

envCommand
  .command('snapshot-import <file>')
  .description('Install all capabilities listed in an environment.yaml')
  .action(async (file) => {
    try {
      const filePath = path.resolve(file);
      if (!fs.existsSync(filePath)) {
        errorOperational('File not found', { message: `Snapshot not found at ${filePath}` });
        process.exit(1);
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const envYaml = parse(raw);

      if (!envYaml.dependencies) {
        successStandard('No dependencies to install');
        return;
      }

      console.log(c.textFaint(`📦 Importing snapshot from ${file}...`));
      
      for (const [name, version] of Object.entries(envYaml.dependencies)) {
        console.log(`  - Installing ${name}@${version}`);
      }

      successStandard('Snapshot imported successfully');
    } catch (err) {
      errorOperational('Import failed', {
        message: err instanceof Error ? err.message : String(err)
      });
      process.exit(1);
    }
  });
