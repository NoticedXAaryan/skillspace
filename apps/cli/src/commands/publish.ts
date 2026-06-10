import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Command } from 'commander';
import { validateSkillYaml, validateAgentYaml } from '@skillspace/schema';
import { loadCredentials } from '@skillspace/runtime';
import { RegistryClient } from '../utils/api.js';
import { createSkillPackage } from '../utils/packager.js';
import { intro } from '../ui/states/intro.js';
import { outro } from '../ui/states/outro.js';
import { createLoader } from '../ui/states/loader.js';
import { successCritical, successStandard } from '../ui/states/success.js';
import { errorOperational } from '../ui/states/error.js';

export function registerPublishCommand(program: Command): void {
  program
    .command('publish')
    .description('Publish the current directory as a skill package')
    .option('-d, --dir <dir>', 'Directory to publish', '.')
    .option('--private', 'Publish as a private package (requires org scope)', false)
    .option('-y, --yes', 'Headless mode (suppresses UI output)')
    .action(async (opts) => {
      const startTime = Date.now();
      const dir = path.resolve(opts.dir);
      const skillYamlPath = path.join(dir, 'skill.yaml');
      const agentYamlPath = path.join(dir, 'agent.yaml');

      if (!opts.yes) {
        intro('publish', 'SkillSpace Registry Publisher');
      }

      // 1. Check auth
      const token = loadCredentials();
      if (!token) {
        errorOperational('Authentication required', {
          message: 'You must be logged in to publish packages.',
          hint: 'Run `air login` to authenticate.'
        });
        process.exit(1);
      }

      // 2. Detect manifest
      let manifestPath = '';
      let isAgent = false;

      if (fs.existsSync(skillYamlPath)) {
        manifestPath = skillYamlPath;
      } else if (fs.existsSync(agentYamlPath)) {
        manifestPath = agentYamlPath;
        isAgent = true;
      } else {
        errorOperational('Manifest not found', {
          message: 'No skill.yaml or agent.yaml found in the current directory.',
          hint: 'Run `air init` to scaffold a new project.'
        });
        process.exit(1);
      }

      // 3. Validate manifest
      const raw = fs.readFileSync(manifestPath, 'utf-8');
      const validation = isAgent ? validateAgentYaml(raw) : validateSkillYaml(raw);
      
      if (!validation.success) {
        // @ts-ignore - type mismatch handle generically
        const issues = validation.errors?.issues || [];
        const cause = issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join('\n');
        
        errorOperational(`Invalid ${isAgent ? 'agent.yaml' : 'skill.yaml'}`, {
          message: 'The manifest failed schema validation.',
          cause: cause
        });
        process.exit(1);
      }

      const skill = validation.data;
      const loader = !opts.yes ? createLoader(`Packaging ${skill.name}@${skill.version}`) : null;

      // 4. Create package
      const os = await import('node:os');
      const tmpPath = path.join(os.tmpdir(), `air-pkg-${Date.now()}.tar.gz`);
      const checksum = await createSkillPackage(dir, tmpPath);
      
      const buffer = fs.readFileSync(tmpPath);
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      
      if (loader) {
        loader.succeed(`Packaged successfully`);
        successStandard('Package created', {
          'Package Size': `${(buffer.length / 1024).toFixed(1)} KB`,
          'Checksum': checksum
        });
        loader.update('Publishing to registry');
      }

      // 5. Publish to registry
      const client = new RegistryClient();
      const result = await client.publish(buffer, {
        name: skill.name,
        version: skill.version,
        description: skill.description,
        tags: (skill as any).tags || [],
        category: (skill as any).category || 'Other',
        isPrivate: opts.private,
      });

      if (result.error) {
        if (loader) loader.fail('Publish failed');
        errorOperational('Publish failed', {
          code: 'REGISTRY_ERROR',
          message: result.error.message,
          hint: 'Check your network connection or package name.'
        });
        process.exit(1);
      }

      if (loader) {
        loader.succeed(`Published ${skill.name}@${skill.version}`);
        successCritical('Agent is live.', `${skill.name} has been published to the SkillSpace registry.`, [
          ['Install remotely', `air install ${skill.name}`],
          ['View registry', `air.dev/agents/${skill.name}`]
        ]);
        outro(Date.now() - startTime);
      } else {
        successStandard(`Published ${skill.name}@${skill.version}`);
      }
    });
}
