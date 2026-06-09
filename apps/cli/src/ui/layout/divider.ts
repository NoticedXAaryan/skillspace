import { CHARS } from '../tokens/chars.js';
import { c } from '../tokens/colors.js';

export function divider(width: number = 60, dashed: boolean = false): string {
  const char = dashed ? CHARS.DIV : CHARS.H;
  return c.border(char.repeat(width));
}
