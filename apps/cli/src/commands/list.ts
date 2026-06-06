import type { Command } from 'commander';
import { SkillCache } from '@skillspace/runtime';

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .alias('ls')
    .description('List all locally installed skill packages')
    .action(() => {
      const cache = new SkillCache();
      const installed = cache.listInstalled();

      if (installed.length === 0) {
        console.log('No packages installed.');
        console.log('Run `skillspace install <package>` to install one.');
        return;
      }

      console.log(`Installed packages (${installed.length}):\n`);

      for (const pkg of installed) {
        console.log(`  ${pkg.name}@${pkg.version}`);
        console.log(`    Path: ${pkg.path}`);
      }
    });
}
