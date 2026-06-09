import type { Command } from 'commander';
import {
  SkillCache,
  readLockFile,
  writeLockFile,
  createEmptyLockFile,
  addSkillToLockFile,
  getRegistries,
  getGlobalEnv,
  getPackageEnv,
  setPackageEnv
} from '@skillspace/runtime';
import { RegistryClient } from '../utils/api.js';
import { extractSkillPackage } from '../utils/packager.js';
import { intro } from '../ui/states/intro.js';
import { createLoader } from '../ui/states/loader.js';
import { successCritical, successStandard } from '../ui/states/success.js';
import { errorOperational, errorInline } from '../ui/states/error.js';
import { text, confirm, isCancel } from '@clack/prompts';
import { c } from '../ui/tokens/colors.js';
import { warn } from '../ui/states/warning.js';

export function registerInstallCommand(program: Command): void {
  program
    .command('install <package>')
    .description('Install a skill package from the registry')
    .option('-v, --version <version>', 'Specific version to install')
    .option('-y, --yes', 'Headless mode (suppresses UI output)')
    .action(async (pkgName: string, opts) => {
      const cache = new SkillCache();
      const registries = getRegistries();
      const cwd = process.cwd();
      let lock = readLockFile(cwd) || createEmptyLockFile();

      if (!opts.yes) {
        intro('install', `AIR Registry Installer`);
      }

      let loader = !opts.yes ? createLoader(`Resolving ${pkgName}...`) : null;
      let installedCount = 0;

      async function installRecursively(name: string, requestedVersion?: string): Promise<void> {
        if (loader) loader.update(`Resolving ${name}...`);
        
        let pkgInfo: any = null;
        let activeClient: RegistryClient | null = null;
        let fetchError: Error | null = null;

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

        // --- VERIFIED PACKAGE CHECK ---
        const isVerified = pkgInfo.data.verified === true;
        if (!isVerified) {
          if (opts.yes) {
            console.warn(`\n[WARN] Installing unverified package: ${name}`);
          } else {
            if (loader) loader.succeed('Pending verification...');
            warn(`The package "${name}" is not verified.`);
            const shouldInstall = await confirm({
              message: 'Are you sure you want to install this unverified package?',
              initialValue: false
            });
            
            if (isCancel(shouldInstall) || !shouldInstall) {
              errorInline('Installation aborted by user.');
              process.exit(1);
            }
            if (!opts.yes) loader = createLoader(`Downloading ${name}@${version}...`);
          }
        }
        // ------------------------------

        if (cache.isInstalled(name, version)) {
          return; // Already installed
        }

        if (loader) loader.update(`Downloading ${name}@${version}...`);
        
        const { buffer, checksum } = await activeClient!.downloadPackage(name, version);

        if (checksum) {
          const crypto = await import('node:crypto');
          const computed = `sha256:${crypto.createHash('sha256').update(buffer).digest('hex')}`;
          if (computed !== checksum) {
            throw new Error(`Checksum mismatch for ${name}@${version}. Expected: ${checksum}, Got: ${computed}`);
          }
        }

        if (loader) loader.update(`Extracting ${name}@${version}...`);
        
        const pkgDir = await cache.preparePackageDir(name, version, buffer, checksum);
        await extractSkillPackage(buffer, pkgDir);
        installedCount++;

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

            // --- ENVIRONMENT INTERCEPTION ---
            if (parsed.env && typeof parsed.env === 'object') {
              for (const [envKey, envDesc] of Object.entries(parsed.env)) {
                const isGlobalSet = getGlobalEnv(envKey) !== undefined;
                const isPkgSet = getPackageEnv(name, envKey) !== undefined;

                if (!isGlobalSet && !isPkgSet) {
                  if (loader) loader.succeed(`Configuration required for ${name}`);
                  if (opts.yes) {
                    console.warn(`[WARN] Missing required environment variable for ${name}: ${envKey}`);
                  } else {
                    const input = await text({
                      message: `Provide ${c.brand(envKey)} (${envDesc}):`,
                    });
                    if (isCancel(input)) {
                      errorInline('Installation aborted by user.');
                      process.exit(1);
                    }
                    setPackageEnv(name, envKey, input as string);
                  }
                  if (!opts.yes) loader = createLoader(`Continuing installation...`);
                }
              }
            }
            // --------------------------------

            if (parsed.type === 'agent' || path.basename(manifestPath) === 'agent.yaml') {
              const agent = cache.loadAgent(name, version);
              if (agent.skills && agent.skills.length > 0) {
                for (const skillDep of agent.skills) {
                  await installRecursively(skillDep.name, skillDep.version.replace('^', '').replace('~', ''));
                }
              }
            }
          } catch (e) {
            if (!opts.yes && loader) loader.fail(`Failed parsing manifest for ${name}`);
            console.error(e);
          }
        }
      }

      try {
        await installRecursively(pkgName, opts.version);
        writeLockFile(cwd, lock);
        
        if (loader) {
          loader.succeed(`Installation complete`);
          successCritical('Dependencies resolved.', `${pkgName} is installed and configured.`, [
            ['Run agent', `air run ${pkgName}`],
            ['View env config', `air env list`]
          ]);
        } else {
          successStandard(`Successfully installed ${pkgName}`);
        }
      } catch (err) {
        if (loader) loader.fail('Installation failed');
        errorOperational('Install Error', {
          message: err instanceof Error ? err.message : String(err)
        });
        process.exit(1);
      }
    });
}
