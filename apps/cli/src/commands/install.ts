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
import { getRegistries } from '@skillspace/runtime';

export function registerInstallCommand(program: Command): void {
  program
    .command('install <package>')
    .description('Install a skill package from the registry')
    .option('-v, --version <version>', 'Specific version to install')
    .action(async (pkgName: string, opts) => {
      const cache = new SkillCache();
      const registries = getRegistries();
      const cwd = process.cwd();
      let lock = readLockFile(cwd) || createEmptyLockFile();

      async function installRecursively(name: string, requestedVersion?: string): Promise<void> {
        console.log(`⟳ Resolving ${name}...`);
        
        let pkgInfo: any = null;
        let activeClient: RegistryClient | null = null;
        let fetchError: Error | null = null;

        // Priority-based resolution: loop through registries
        for (const url of registries) {
          const client = new RegistryClient(url);
          try {
            const info = await client.getPackage(name);
            if (!info.error) {
              pkgInfo = info;
              activeClient = client;
              break;
            }
          } catch (err) {
            fetchError = err instanceof Error ? err : new Error(String(err));
          }
        }

        if (!pkgInfo) {
          throw fetchError || new Error(`Package "${name}" not found in any configured registry.`);
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
        const { buffer, checksum } = await activeClient!.downloadPackage(name, version);

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
          resolved: `${activeClient!['baseUrl']}/api/packages/${name}/${version}/download`,
          checksum: checksum || 'unknown',
        });

        const fs = await import('node:fs');
        const path = await import('node:path');
        let manifestPath = path.join(pkgDir, 'agent.yaml');
        if (!fs.existsSync(manifestPath)) {
          manifestPath = path.join(pkgDir, 'skill.yaml');
        }

        if (fs.existsSync(manifestPath)) {
          try {
            const raw = fs.readFileSync(manifestPath, 'utf-8');
            const YAML = await import('yaml');
            const parsed = YAML.parse(raw);
            if (parsed.type === 'agent' || path.basename(manifestPath) === 'agent.yaml') {
              const agent = cache.loadAgent(name, version);
              if (agent.skills && agent.skills.length > 0) {
                console.log(`⟳ Resolving dependencies for agent ${name}@${version}...`);
                for (const skillDep of agent.skills) {
                  await installRecursively(skillDep.name, skillDep.version.replace('^', '').replace('~', ''));
                }
              }
            }
          } catch (e) {
            console.warn(`Warning: Could not parse manifest for ${name}@${version}:`, e);
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
