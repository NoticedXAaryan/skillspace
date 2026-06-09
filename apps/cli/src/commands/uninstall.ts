import type { Command } from 'commander';
import {
  SkillCache,
  readLockFile,
  writeLockFile,
  removeSkillFromLockFile,
} from '@skillspace/runtime';
import { intro, outro, cancel } from '@clack/prompts';
import pc from 'picocolors';

export function registerUninstallCommand(program: Command): void {
  program
    .command('uninstall <package>')
    .alias('remove')
    .description('Remove a locally installed skill package')
    .option('-v, --version <version>', 'Specific version to remove (removes all if omitted)')
    .option('-y, --yes', 'Headless mode')
    .action((pkgName: string, opts) => {
      const cache = new SkillCache();
      const versions = cache.getInstalledVersions(pkgName);

      if (!opts.yes) {
        intro(pc.bgCyan(pc.black(` AIR Uninstall: ${pkgName} `)));
      }

      if (versions.length === 0) {
        if (!opts.yes) cancel(`Package "${pkgName}" is not installed.`);
        else console.error(`✗ Package "${pkgName}" is not installed.`);
        process.exit(1);
      }

      const versionsToRemove = opts.version ? [opts.version] : versions;
      let removedCount = 0;

      for (const version of versionsToRemove) {
        if (!cache.isInstalled(pkgName, version)) {
          if (!opts.yes) console.warn(pc.yellow(`⚠ ${pkgName}@${version} is not installed, skipping.`));
          else console.warn(`⚠ ${pkgName}@${version} is not installed, skipping.`);
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
        if (removedCount > 0) outro(pc.green(`✓ Removed ${removedCount} version(s) of ${pkgName}`));
        else outro('Nothing was removed.');
      }
    });
}
