import { Command } from 'commander';
import { c } from '../ui/tokens/colors.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ensureSkillspaceDir, loadConfig } from '@skillspace/runtime';
import { RegistryClient } from '../utils/api.js';
import { SkillSchema } from '@skillspace/schema';
import YAML from 'yaml';

export const registerDoctorCommand = (program: Command) => {
  program
    .command('doctor')
    .description('Check your environment and SkillSpace setup')
    .action(async () => {
      console.log('\n' + c.brand('◇ SkillSpace Doctor') + '\n');
      let issues = 0;

      // 1. Check Node version
      const nodeVersion = process.version;
      const major = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
      if (major >= 20) {
        console.log(`  ${c.success('✓')} Node.js ${nodeVersion}`);
      } else {
        console.log(`  ${c.error('✗')} Node.js ${nodeVersion} (requires 20.0.0 or higher)`);
        issues++;
      }

      // 2. Check config dir
      try {
        ensureSkillspaceDir();
        const { getConfigPath } = await import('@skillspace/runtime');
        console.log(`  ${c.success('✓')} Config directory exists at ${getConfigPath()}`);
      } catch (err) {
        console.log(`  ${c.error('✗')} Config directory missing or inaccessible`);
        issues++;
      }

      // 3. Check registry reachability
      const client = new RegistryClient();
      try {
        const res = await fetch(`${client.baseUrl}/api/packages?limit=1`);
        if (res.ok) {
          console.log(`  ${c.success('✓')} Registry reachable (${client.baseUrl})`);
        } else {
          console.log(`  ${c.error('✗')} Registry reachable but returned error (${res.status})`);
          issues++;
        }
      } catch (err) {
        console.log(`  ${c.error('✗')} Registry unreachable (${client.baseUrl})`);
        issues++;
      }

      // 4. Check auth status
      try {
        const me = await client.me();
        if (me) {
          console.log(
            `  ${c.success('✓')} Logged in as ${me.user.name || me.user.email || me.user.username}`,
          );
        } else {
          console.log(`  ${c.warning('!')} Not logged in`);
        }
      } catch (err) {
        console.log(`  ${c.warning('!')} Not logged in`);
      }

      // 5. Check API keys
      const config = loadConfig();
      const hasKey =
        process.env.ANTHROPIC_API_KEY ||
        process.env.OPENAI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        Object.keys(config.models || {}).some((k) => config.models[k].api_key);

      if (hasKey) {
        console.log(`  ${c.success('✓')} Model API keys configured`);
      } else {
        console.log(`  ${c.error('✗')} No model API key configured`);
        issues++;
      }

      // 6. Check skill.yaml
      const cwd = process.cwd();
      const yamlPath = path.join(cwd, 'skill.yaml');
      if (fs.existsSync(yamlPath)) {
        try {
          const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
          const parsedYaml = YAML.parse(yamlContent);
          const parsed = SkillSchema.safeParse(parsedYaml);
          if (parsed.success) {
            console.log(`  ${c.success('✓')} skill.yaml valid`);
          } else {
            console.log(`  ${c.error('✗')} skill.yaml invalid: ${parsed.error.errors[0]?.message}`);
            issues++;
          }
        } catch (err) {
          console.log(`  ${c.error('✗')} skill.yaml could not be read`);
          issues++;
        }
      }

      console.log();
      if (issues === 0) {
        console.log(`  ${c.success('All checks passed.')}`);
      } else {
        console.log(
          `  ${c.error(`${issues} issue(s) found.`)} Run \`skillspace config\` or \`skillspace login\` to resolve.`,
        );
        process.exit(1);
      }
    });
};
