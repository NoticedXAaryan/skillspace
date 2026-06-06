import chalk from 'chalk';
import Table from 'cli-table3';

// ---------------------------------------------------------------------------
// Brand colors
// ---------------------------------------------------------------------------

export const brand = chalk.hex('#667eea');
export const accent = chalk.hex('#00d4ff');
export const success_color = chalk.hex('#10b981');
export const warning = chalk.hex('#f59e0b');
export const err = chalk.hex('#ef4444');

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------

export function logo(): string {
  return brand.bold('⚡ SkillSpace');
}

// ---------------------------------------------------------------------------
// Message helpers
// ---------------------------------------------------------------------------

export function successMsg(msg: string): void {
  console.log(success_color('✓') + ' ' + msg);
}

export function errorMsg(msg: string): void {
  console.error(err('✗') + ' ' + msg);
}

export function warnMsg(msg: string): void {
  console.warn(warning('⚠') + ' ' + msg);
}

export function infoMsg(msg: string): void {
  console.log(accent('ℹ') + ' ' + msg);
}

// ---------------------------------------------------------------------------
// Table helper
// ---------------------------------------------------------------------------

export function table(headers: string[], rows: string[][]): void {
  const t = new Table({
    head: headers.map(h => brand.bold(h)),
    style: { head: [], border: ['dim'] },
  });
  rows.forEach(row => t.push(row));
  console.log(t.toString());
}

// ---------------------------------------------------------------------------
// Key-value display (for info panels)
// ---------------------------------------------------------------------------

export function keyValue(pairs: [string, string][]): void {
  const maxKey = Math.max(...pairs.map(([k]) => k.length));
  for (const [key, value] of pairs) {
    console.log(`  ${brand(key.padEnd(maxKey))}  ${value}`);
  }
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

export function section(title: string): void {
  console.log();
  console.log(brand.bold.underline(title));
  console.log();
}
