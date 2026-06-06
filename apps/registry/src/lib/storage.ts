import * as fs from 'node:fs';
import * as path from 'node:path';

const STORAGE_DIR = path.join(process.cwd(), '.storage');

export function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export function storePackage(name: string, version: string, data: Buffer): string {
  ensureStorageDir();
  const filePath = path.join(STORAGE_DIR, `${name}-${version}.skillpkg`);
  fs.writeFileSync(filePath, data);
  return filePath;
}

export function getPackagePath(name: string, version: string): string {
  return path.join(STORAGE_DIR, `${name}-${version}.skillpkg`);
}

export function packageExists(name: string, version: string): boolean {
  return fs.existsSync(getPackagePath(name, version));
}

export function readPackage(name: string, version: string): Buffer {
  return fs.readFileSync(getPackagePath(name, version));
}
