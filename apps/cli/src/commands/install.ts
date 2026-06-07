import type { Command } from 'commander';
import {
  SkillCache,
  readLockFile,
  writeLockFile,
  createEmptyLockFile,
  addSkillToLockFile,
} from '@skillspace/runtime';
import { RegistryClient } from '../utils/api.js';
import { extractSkillPackage } from '../utils/packager.js';

export function registerInstallCommand(program: Command): void {
  program
    .command('install <package>')
    .description('Install a skill package from the registry')
    .option('-v, --version <version>', 'Specific version to install')
    .action(async (pkgName: string, opts) => {
      const cache = new SkillCache();
      const client = new RegistryClient();
      const cwd = process.cwd();
      let lock = readLockFile(cwd) || createEmptyLockFile();

      async function installRecursively(name: string, requestedVersion?: string): Promise<void> {
        console.log(`⟳ Resolving ${name}...`);
        const pkgInfo = await client.getPackage(name);

        if (pkgInfo.error) {
          throw new Error(pkgInfo.error.message);
        }

        const version = requestedVersion || pkgInfo.data.latestVersion?.version;
        if (!version) {
          throw new Error('No versions available for this package.');
        }

        if (cache.isInstalled(name, version)) {
          console.log(`✓ ${name}@${version} is already installed.`);
          return;
        }

        console.log(`⟳ Downloading ${name}@${version}...`);
        const { buffer, checksum } = await client.downloadPackage(name, version);

        if (checksum) {
          const crypto = await import('node:crypto');
          const computed = `sha256:${crypto.createHash('sha256').update(buffer).digest('hex')}`;
          if (computed !== checksum) {
            throw new Error(`Checksum mismatch for ${name}@${version}. Expected: ${checksum}, Got: ${computed}`);
          }
        }

        console.log(`⟳ Installing ${name}@${version}...`);
        const files = extractSkillPackage(buffer);
        const pkgDir = await cache.installPackage(name, version, files);

        lock = addSkillToLockFile(lock, name, {
          version,
          resolved: `${client['baseUrl']}/api/packages/${name}/${version}/download`,
          checksum: checksum || 'unknown',
        });

        // Check if it's an agent and install dependencies
        const fs = await import('node:fs');
        const path = await import('node:path');
        if (fs.existsSync(path.join(pkgDir, 'skill.yaml'))) {
          try {
            const raw = fs.readFileSync(path.join(pkgDir, 'skill.yaml'), 'utf-8');
            const YAML = await import('yaml');
            const parsed = YAML.parse(raw);
            if (parsed.type === 'agent') {
              const agent = cache.loadAgent(name, version);
              if (agent.skills && agent.skills.length > 0) {
                console.log(`⟳ Resolving dependencies for ${name}@${version}...`);
                for (const skillDep of agent.skills) {
                  await installRecursively(skillDep.name, skillDep.version.replace('^', '').replace('~', ''));
                }
              }
            }
          } catch {
            // Ignore if it fails to parse or is not an agent
          }
        }
        console.log(`✓ Installed ${name}@${version}`);
      }

      try {
        await installRecursively(pkgName, opts.version);
        writeLockFile(cwd, lock);
        console.log(`🎉 Successfully installed ${pkgName} and its dependencies.`);
      } catch (err) {
        console.error(`✗ Install failed: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });
}
