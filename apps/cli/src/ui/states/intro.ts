import chalk from 'chalk';
import { c } from '../tokens/colors.js';
import { CHARS } from '../tokens/chars.js';
import { divider } from '../layout/divider.js';

export function intro(command: string, description?: string): void {
  console.log();
  console.log(
    '  ' + c.brand(CHARS.BULLET_DONE) + '  ' +
    c.text(chalk.bold('skillspace ' + command))
  );
  if (description) {
    console.log(
      '     ' + c.textMuted(description)
    );
  }
  console.log();
  console.log('  ' + divider(50));
  console.log();
}
