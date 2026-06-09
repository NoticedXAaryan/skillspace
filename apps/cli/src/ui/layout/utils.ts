export const INDENT      = '   ';         // 3 spaces — inside-box indent
export const LIST_INDENT = '  ';         // 2 spaces — list items
export const MAX_WIDTH   = 80;           // content column width
export const LABEL_WIDTH = 28;           // label column for key/value tables

export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[\d+m/g, '');
}

export function padLabel(str: string): string {
  return str.padEnd(LABEL_WIDTH);
}
