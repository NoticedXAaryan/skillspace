import chalk from 'chalk';
import { c } from '../tokens/colors.js';
import { CHARS } from '../tokens/chars.js';

export function warn(headline: string, lines: string[] = []): void {
  console.log();
  console.log('  ' + c.warning(CHARS.WARN) + '  ' + c.text(chalk.bold(headline)));
  lines.forEach(l => console.log('     ' + c.textMuted(l)));
  console.log();
}
