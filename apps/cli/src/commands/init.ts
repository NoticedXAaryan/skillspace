import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Command } from 'commander';
import YAML from 'yaml';
import { ensureSkillspaceDir } from '@skillspace/runtime';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new SkillSpace project in the current directory')
    .option('-n, --name <name>', 'Project name')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .action(async (opts) => {
      const cwd = process.cwd();
      const manifestPath = path.join(cwd, 'skillspace.yaml');

      if (fs.existsSync(manifestPath)) {
        console.error('✗ skillspace.yaml already exists in this directory.');
        process.exit(1);
      }

      const projectName = opts.name || path.basename(cwd);

      const manifest = {
        name: projectName,
        version: '1.0.0',
        description: 'A SkillSpace project',
        default_model: 'ollama/llama3.2',
        skills: {},
        agents: {},
      };

      fs.writeFileSync(manifestPath, YAML.stringify(manifest), 'utf-8');
      ensureSkillspaceDir();

      console.log(`✓ Initialized SkillSpace project "${projectName}"`);
      console.log(`  Created: skillspace.yaml`);
      console.log('');
      console.log('  Next steps:');
      console.log('    skillspace model add ollama   # Configure model provider');
      console.log('    skillspace install <skill>    # Install a skill');
      console.log('    skillspace run <skill>        # Run a skill');
    });
}
