import { CHARS } from '../tokens/chars.js';
import { c } from '../tokens/colors.js';
import { stripAnsi, MAX_WIDTH } from './utils.js';

interface BoxOptions {
  title?: string;
  variant?: 'default' | 'compact';
  colorFn?: (str: string) => string;
}

export function box(lines: string[], options: BoxOptions = {}): string {
  const { title = '', variant = 'default', colorFn = c.border } = options;
  
  const width = Math.min(
    Math.max(...lines.map((l) => stripAnsi(l).length)) + 6,
    MAX_WIDTH + 2
  );
  const inner = width - 2;

  const top = title
    ? colorFn(CHARS.TL + CHARS.H + ' ') + c.textMuted(title) + ' ' +
      colorFn(CHARS.H.repeat(Math.max(0, inner - title.length - 4)) + CHARS.TR)
    : colorFn(CHARS.TL + CHARS.H.repeat(inner) + CHARS.TR);

  const bottom = colorFn(CHARS.BL + CHARS.H.repeat(inner) + CHARS.BR);
  const border  = colorFn(CHARS.V);
  const pad     = variant === 'compact' ? [] : [''];

  return [
    top,
    ...pad.map(() => border + ' '.repeat(inner) + border),
    ...lines.map((l) => {
      const lineLen = stripAnsi(l).length;
      return border + '   ' + l + ' '.repeat(Math.max(0, inner - 3 - lineLen)) + border;
    }),
    ...pad.map(() => border + ' '.repeat(inner) + border),
    bottom
  ].join('\n');
}
