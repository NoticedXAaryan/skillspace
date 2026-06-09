import chalk from 'chalk';
import { c } from '../tokens/colors.js';
import { CHARS } from '../tokens/chars.js';
import { padLabel } from '../layout/utils.js';
import { box } from '../layout/box.js';

export function successMinor(message: string): void {
  console.log('  ' + c.success(CHARS.TICK) + '  ' + c.text(message));
}

export function successStandard(message: string, fields: Record<string, string> = {}): void {
  console.log();
  console.log('  ' + c.success(CHARS.TICK) + '  ' + c.text(chalk.bold(message)));
  console.log();
  const lines = Object.entries(fields).map(([k, v]) =>
    c.textMuted(padLabel(k)) + c.text(v)
  );
  if (lines.length > 0) {
    console.log(box(lines, { title: 'Summary' }));
    console.log();
  }
}

export function successCritical(headline: string, body: string, hints: [string, string][] = []): void {
  console.log();
  const lines = [
    c.brand(chalk.bold(CHARS.BULLET_DONE + '  ' + headline)),
    '',
    ...body.split('\n').map(l => c.text(l)),
  ];
  console.log(box(lines, { colorFn: c.brandDim }));
  console.log();
  hints.forEach(([label, value]) => {
    console.log('  ' + c.brand(CHARS.ARROW) + '  ' +
      c.textMuted(padLabel(label)) + c.info(value));
  });
  console.log();
}
