import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Command } from 'commander';
import { validateSkillYaml } from '@skillspace/schema';
import { loadCredentials } from '@skillspace/runtime';
import { RegistryClient } from '../utils/api.js';
import { createSkillPackage } from '../utils/packager.js';

export function registerPublishCommand(program: Command): void {
  program
    .command('publish')
    .description('Publish the current directory as a skill package')
    .option('-d, --dir <dir>', 'Directory to publish', '.')
    .action(async (opts) => {
      const dir = path.resolve(opts.dir);
      const skillYamlPath = path.join(dir, 'skill.yaml');

      // 1. Check auth
      const token = loadCredentials();
      if (!token) {
        console.error('✗ You must be logged in to publish. Run `skillspace login` first.');
        process.exit(1);
      }

      // 2. Check skill.yaml exists
      if (!fs.existsSync(skillYamlPath)) {
        console.error('✗ No skill.yaml found in the current directory.');
        process.exit(1);
      }

      // 3. Validate skill.yaml
      const raw = fs.readFileSync(skillYamlPath, 'utf-8');
      const validation = validateSkillYaml(raw);
      if (!validation.success) {
        console.error('✗ Invalid skill.yaml:');
        for (const issue of validation.errors.issues) {
          console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        }
        process.exit(1);
      }

      const skill = validation.data;
      console.log(`⟳ Packaging ${skill.name}@${skill.version}...`);

      // 4. Create package
      const { buffer, files, checksum } = createSkillPackage(dir);
      console.log(`  Files: ${files.length}`);
      console.log(`  Size: ${(buffer.length / 1024).toFixed(1)} KB`);
      console.log(`  Checksum: ${checksum}`);

      // 5. Publish to registry
      console.log('⟳ Publishing...');
      const client = new RegistryClient();
      const result = await client.publish(buffer, {
        name: skill.name,
        version: skill.version,
        description: skill.description,
        tags: skill.tags,
        category: skill.category,
      });

      if (result.error) {
        console.error(`✗ Publish failed: ${result.error.message}`);
        process.exit(1);
      }

      console.log(`✓ Published ${skill.name}@${skill.version}`);
      console.log(`  Install: skillspace install ${skill.name}`);
    });
}
