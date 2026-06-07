import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as zlib from 'node:zlib';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PackageFile {
  path: string;
  content: Buffer;
}

// ---------------------------------------------------------------------------
// Create a .skillpkg archive
// ---------------------------------------------------------------------------

/**
 * Reads a skill directory, bundles relevant files into a gzipped package,
 * and returns the buffer, file list, and overall checksum.
 */
export function createSkillPackage(dir: string): { buffer: Buffer; files: PackageFile[]; checksum: string } {
  const files: PackageFile[] = [];
  const requiredFiles = ['skill.yaml'];
  const optionalFiles = ['README.md', 'CHANGELOG.md', 'workflow.yaml', 'agent.js', 'index.js'];
  const optionalDirs = ['adapters', 'knowledge', 'tests'];

  // Read required files
  for (const file of requiredFiles) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file missing: ${file}`);
    }
    files.push({ path: file, content: fs.readFileSync(filePath) });
  }

  // Read optional files
  for (const file of optionalFiles) {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
      files.push({ path: file, content: fs.readFileSync(filePath) });
    }
  }

  // Read optional directories recursively
  for (const dirName of optionalDirs) {
    const dirPath = path.join(dir, dirName);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      readDirRecursive(dirPath, dirName, files);
    }
  }

  // Compute per-file checksums and an overall hash
  const hash = crypto.createHash('sha256');
  const manifestFiles = files.map(f => {
    hash.update(f.path);
    hash.update(f.content);
    return {
      path: f.path,
      size: f.content.length,
      checksum: `sha256:${crypto.createHash('sha256').update(f.content).digest('hex')}`,
    };
  });
  const checksum = `sha256:${hash.digest('hex')}`;

  // Build a JSON manifest and append it to the file list
  const manifest = JSON.stringify(
    { files: manifestFiles, checksum, created: new Date().toISOString() },
    null,
    2,
  );
  files.push({ path: 'manifest.json', content: Buffer.from(manifest) });

  // Serialize: JSON array of { path, content(base64) } → gzip
  const serialized = JSON.stringify(
    files.map(f => ({ path: f.path, content: f.content.toString('base64') })),
  );
  const buffer = zlib.gzipSync(Buffer.from(serialized));

  return { buffer, files, checksum };
}

// ---------------------------------------------------------------------------
// Extract a .skillpkg archive
// ---------------------------------------------------------------------------

export function extractSkillPackage(buffer: Buffer): Map<string, Buffer> {
  const decompressed = zlib.gunzipSync(buffer);
  const entries = JSON.parse(decompressed.toString()) as Array<{ path: string; content: string }>;
  const files = new Map<string, Buffer>();
  for (const entry of entries) {
    files.set(entry.path, Buffer.from(entry.content, 'base64'));
  }
  return files;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readDirRecursive(dirPath: string, prefix: string, files: PackageFile[]): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = `${prefix}/${entry.name}`;
    if (entry.isFile()) {
      files.push({ path: relativePath, content: fs.readFileSync(fullPath) });
    } else if (entry.isDirectory()) {
      readDirRecursive(fullPath, relativePath, files);
    }
  }
}
