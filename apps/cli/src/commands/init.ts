import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Command } from 'commander';
import YAML from 'yaml';
import { ensureSkillspaceDir } from '@skillspace/runtime';
import inquirer from 'inquirer';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new SkillSpace project in the current directory')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .action(async (opts) => {
      const cwd = process.cwd();
      const manifestPath = path.join(cwd, 'skill.yaml');

      if (fs.existsSync(manifestPath)) {
        console.error('✗ skill.yaml already exists in this directory.');
        process.exit(1);
      }

      let projectName = path.basename(cwd);
      let author = 'unknown';
      let description = 'A SkillSpace project';
      let category = 'other';

      if (!opts.yes) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Project name:',
            default: projectName,
          },
          {
            type: 'input',
            name: 'description',
            message: 'Description:',
            default: description,
          },
          {
            type: 'input',
            name: 'author',
            message: 'Author:',
            default: process.env.USER || process.env.USERNAME || author,
          },
          {
            type: 'list',
            name: 'category',
            message: 'Category:',
            choices: ['code', 'writing', 'analysis', 'security', 'devops', 'other'],
            default: 'other',
          }
        ]);
        projectName = answers.name;
        description = answers.description;
        author = answers.author;
        category = answers.category;
      }

      const manifest = {
        name: projectName,
        version: '1.0.0',
        description,
        author,
        license: 'MIT',
        tags: [category],
        category,
        instructions: {
          system: `You are an expert at ${projectName}.`,
          user_template: `{{input}}`,
          output_format: 'text'
        },
        permissions: []
      };

      fs.writeFileSync(manifestPath, YAML.stringify(manifest), 'utf-8');
      ensureSkillspaceDir();

      console.log(`\n✓ Initialized SkillSpace project "${projectName}"`);
      console.log(`  Created: skill.yaml`);
      console.log('');
      console.log('  Next steps:');
      console.log('    skillspace publish            # Publish your skill');
      console.log('    skillspace run <skill>        # Run a skill');
    });
}
