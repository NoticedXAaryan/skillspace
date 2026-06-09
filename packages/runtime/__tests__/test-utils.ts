import * as fs from 'node:fs';
import * as path from 'node:path';
import type { SkillCache } from '../src/cache.js';

export async function mockInstallPackage(
  cache: SkillCache,
  name: string,
  version: string,
  files: Map<string, Buffer>
): Promise<string> {
  const pkgDir = cache.getPackageDir(name, version);
  fs.mkdirSync(pkgDir, { recursive: true });

  for (const [filename, content] of files.entries()) {
    const filePath = path.join(pkgDir, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }

  return pkgDir;
}
