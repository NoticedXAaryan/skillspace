import type { Command } from 'commander';
import { SkillCache } from '@skillspace/runtime';
import { box } from '../ui/layout/box.js';
import { c } from '../ui/tokens/colors.js';

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .alias('ls')
    .description('List all locally installed skill packages')
    .action(() => {
      const cache = new SkillCache();
      const installed = cache.listInstalled();

      if (installed.length === 0) {
        console.log(box(['No packages installed.', 'Run `air install <package>` to install one.'], {
          title: 'Installed Packages',
          colorFn: c.border
        }));
        return;
      }

      const rows = installed.map(pkg => 
        `${c.brand(pkg.name)}@${c.textFaint(pkg.version)} | ${c.textMuted(pkg.path)}`
      );

      console.log(box(rows, {
        title: `Installed Packages (${installed.length})`,
        colorFn: c.successDim
      }));
    });
}
