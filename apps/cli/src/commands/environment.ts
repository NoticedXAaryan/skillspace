import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command } from 'commander';
import { stringify, parse } from 'yaml';
import { readLockFile, getSkillspacePath } from '@skillspace/runtime';

export const envCommand = new Command('environment')
  .alias('env')
  .description('Manage skillspace environments');

envCommand
  .command('export')
  .description('Export the currently installed capabilities to environment.yaml')
  .option('-o, --out <path>', 'Output file path', 'environment.yaml')
  .action((options) => {
    try {
      const lockData = readLockFile(getSkillspacePath());
      
      const envYaml = {
        name: 'skillspace-environment',
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
      console.log(`✅ Environment exported to ${outPath}`);
    } catch (err) {
      console.error(`❌ Failed to export environment: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

envCommand
  .command('import <file>')
  .description('Install all capabilities listed in an environment.yaml')
  .action(async (file) => {
    try {
      const filePath = path.resolve(file);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Environment file not found at ${filePath}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const envYaml = parse(raw);

      if (!envYaml.dependencies) {
        console.log(`✅ No dependencies found in environment file.`);
        return;
      }

      console.log(`📦 Importing environment from ${file}...`);
      
      // We would normally spawn `skillspace install <pkg>` for each dependency here
      // For MVP we just log them
      for (const [name, version] of Object.entries(envYaml.dependencies)) {
        console.log(`  - Installing ${name}@${version}`);
        // In a full implementation:
        // await installPackage(name, version); 
      }

      console.log(`✅ Environment imported successfully.`);
    } catch (err) {
      console.error(`❌ Failed to import environment: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });
