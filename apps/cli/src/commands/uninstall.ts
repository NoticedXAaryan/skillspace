import type { Command } from 'commander';
import {
  SkillCache,
  readLockFile,
  writeLockFile,
  removeSkillFromLockFile,
} from '@skillspace/runtime';
import { intro } from '../ui/states/intro.js';
import { outro } from '../ui/states/outro.js';
import { successStandard } from '../ui/states/success.js';
import { errorOperational } from '../ui/states/error.js';
import { warn } from '../ui/states/warning.js';

export function registerUninstallCommand(program: Command): void {
  program
    .command('uninstall <package>')
    .alias('remove')
    .description('Remove a locally installed skill package')
    .option('-v, --version <version>', 'Specific version to remove (removes all if omitted)')
    .option('-y, --yes', 'Headless mode')
    .action((pkgName: string, opts) => {
      const startTime = Date.now();
      const cache = new SkillCache();
      const versions = cache.getInstalledVersions(pkgName);

      if (!opts.yes) {
        intro('uninstall', 'SkillSpace Package Removal');
      }

      if (versions.length === 0) {
        if (!opts.yes) {
          errorOperational('Package not found', { message: `Package "${pkgName}" is not installed.` });
          process.exit(1);
        } else {
          console.error(`✗ Package "${pkgName}" is not installed.`);
          process.exit(1);
        }
      }

      const versionsToRemove = opts.version ? [opts.version] : versions;
      let removedCount = 0;

      for (const version of versionsToRemove) {
        if (!cache.isInstalled(pkgName, version)) {
          if (!opts.yes) {
            warn('Version not found', [`Version ${version} of ${pkgName} is not installed, skipping.`]);
          } else {
            console.warn(`⚠ ${pkgName}@${version} is not installed, skipping.`);
          }
          continue;
        }

        cache.removePackage(pkgName, version);
        removedCount++;
        if (opts.yes) console.log(`✓ Removed ${pkgName}@${version}`);
      }

      // Update lock file
      const cwd = process.cwd();
      const lock = readLockFile(cwd);
      if (lock) {
        const updated = removeSkillFromLockFile(lock, pkgName);
        writeLockFile(cwd, updated);
      }

      if (!opts.yes) {
        if (removedCount > 0) {
          successStandard('Uninstalled Successfully', {
            Package: pkgName,
            Versions: removedCount.toString()
          });
          outro(Date.now() - startTime);
        } else {
          warn('Nothing was removed', ['No matching versions were found to remove.']);
        }
      }
    });
}
