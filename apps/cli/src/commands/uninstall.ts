import type { Command } from 'commander';
import {
  SkillCache,
  readLockFile,
  writeLockFile,
  removeSkillFromLockFile,
} from '@skillspace/runtime';

export function registerUninstallCommand(program: Command): void {
  program
    .command('uninstall <package>')
    .alias('remove')
    .description('Remove a locally installed skill package')
    .option('-v, --version <version>', 'Specific version to remove (removes all if omitted)')
    .action((pkgName: string, opts) => {
      const cache = new SkillCache();
      const versions = cache.getInstalledVersions(pkgName);

      if (versions.length === 0) {
        console.error(`✗ Package "${pkgName}" is not installed.`);
        process.exit(1);
      }

      const versionsToRemove = opts.version ? [opts.version] : versions;

      for (const version of versionsToRemove) {
        if (!cache.isInstalled(pkgName, version)) {
          console.warn(`⚠ ${pkgName}@${version} is not installed, skipping.`);
          continue;
        }

        cache.removePackage(pkgName, version);
        console.log(`✓ Removed ${pkgName}@${version}`);
      }

      // Update lock file
      const cwd = process.cwd();
      const lock = readLockFile(cwd);
      if (lock) {
        const updated = removeSkillFromLockFile(lock, pkgName);
        writeLockFile(cwd, updated);
      }
    });
}
