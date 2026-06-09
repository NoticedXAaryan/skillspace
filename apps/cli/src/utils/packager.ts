import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as tar from 'tar';
import ignore from 'ignore';

// ---------------------------------------------------------------------------
// Create a .skillpkg archive
// ---------------------------------------------------------------------------

/**
 * Creates a tar.gz package from a directory (respecting .gitignore/.airignore)
 * and writes it to outputPath. Returns the SHA256 checksum of the tarball.
 */
export async function createSkillPackage(dir: string, outputPath: string): Promise<string> {
  // Setup the ignorer with critical defaults
  const ig = ignore().add(['node_modules', '.git', '.DS_Store', 'dist', 'build', '.env', '.env.*', '.turbo']);
  
  // Add user ignores
  const gitignorePath = path.join(dir, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    ig.add(fs.readFileSync(gitignorePath, 'utf8'));
  }
  const airignorePath = path.join(dir, '.airignore');
  if (fs.existsSync(airignorePath)) {
    ig.add(fs.readFileSync(airignorePath, 'utf8'));
  }

  // Get all valid files
  const files: string[] = [];
  readDirRecursive(dir, '', files, ig);

  if (files.length === 0) {
    throw new Error('No files found to package. Ensure your directory is not completely ignored.');
  }

  // Stream tar creation directly to file
  await tar.c(
    {
      gzip: true,
      cwd: dir,
      file: outputPath,
      // Pass the relative paths we filtered above
    },
    files
  );

  // Compute checksum of the final tarball
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(outputPath);
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(`sha256:${hash.digest('hex')}`));
    stream.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Extract a .skillpkg archive
// ---------------------------------------------------------------------------

export async function extractSkillPackage(buffer: Buffer, targetDir: string): Promise<void> {
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Create a temporary file to hold the buffer so tar can stream it
  const tmpPath = path.join(targetDir, '.tmp-pkg.tar.gz');
  fs.writeFileSync(tmpPath, buffer);

  try {
    await tar.x({
      file: tmpPath,
      cwd: targetDir,
    });
  } finally {
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readDirRecursive(dirPath: string, prefix: string, files: string[], ig: any): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    // Standardize path for ignore matching (use forward slashes)
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    
    // Check if ignored. The ignore package expects directory paths to end with a slash for dir-specific rules
    if (ig.ignores(relativePath) || (entry.isDirectory() && ig.ignores(relativePath + '/'))) {
      continue;
    }

    if (entry.isFile()) {
      files.push(relativePath);
    } else if (entry.isDirectory()) {
      readDirRecursive(fullPath, relativePath, files, ig);
    }
  }
}
