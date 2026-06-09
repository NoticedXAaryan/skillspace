import { CHARS } from '../tokens/chars.js';
import { c } from '../tokens/colors.js';

export function createLoader(message: string) {
  let i = 0;
  const frames = CHARS.SPINNER;
  const interval = setInterval(() => {
    const frame = c.brand(frames[i++ % frames.length]);
    process.stdout.write(`\r  ${frame}  ${c.textMuted(message + '…')}`);
  }, 80);

  return {
    succeed: (msg: string) => {
      clearInterval(interval);
      process.stdout.write(`\r  ${c.success(CHARS.TICK)}  ${c.text(msg)}\n`);
    },
    fail: (msg: string) => {
      clearInterval(interval);
      process.stdout.write(`\r  ${c.error(CHARS.CROSS)}  ${c.text(msg)}\n`);
    },
    update: (newMsg: string) => { message = newMsg; }
  };
}
