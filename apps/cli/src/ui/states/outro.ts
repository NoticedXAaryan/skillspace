import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { c } from '../tokens/colors.js';
import { CHARS } from '../tokens/chars.js';
import { divider } from '../layout/divider.js';

function getVersion(): string {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(__dirname, '../../../../package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return pkg.version || '0.0.0';
    }
    return '0.0.0';
  } catch (e) {
    return '0.0.0';
  }
}

export function outro(durationMs: number, hints: string[] = []): void {
  const secs = (durationMs / 1000).toFixed(1) + 's';
  const version = getVersion();
  
  console.log();
  console.log('  ' + divider(50, false));
  console.log();
  console.log(
    '    ' + c.textFaint('Done in ' + secs) +
    '   ' + c.textFaint(CHARS.DOT) + '   ' +
    c.textFaint('air v' + version)
  );
  if (hints.length) {
    console.log();
    hints.forEach(h => console.log('    ' + c.brand(CHARS.ARROW) + '  ' + c.info(h)));
  }
  console.log();
  console.log('  ' + divider(50, false));
  console.log();
}
