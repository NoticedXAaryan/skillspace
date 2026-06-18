import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import * as tar from 'tar';

/**
 * Wraps a YAML manifest string into a minimal .skillpkg tar.gz buffer.
 * Used when serving GitHub-backed packages through the download API.
 */
export async function buildSkillpkgFromManifest(
  manifestYaml: string,
  filename: 'skill.yaml' | 'agent.yaml' = 'skill.yaml',
): Promise<{ buffer: Buffer; checksum: string }> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillspace-pkg-'));
  const manifestPath = path.join(tmpDir, filename);
  const tarPath = path.join(tmpDir, 'package.tar.gz');

  try {
    fs.writeFileSync(manifestPath, manifestYaml, 'utf-8');

    await tar.c({ gzip: true, cwd: tmpDir, file: tarPath }, [filename]);

    const buffer = fs.readFileSync(tarPath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return { buffer, checksum: `sha256:${hash}` };
  } finally {
    // Cleanup temp files
    try {
      fs.unlinkSync(manifestPath);
    } catch {
      /* ignore */
    }
    try {
      fs.unlinkSync(tarPath);
    } catch {
      /* ignore */
    }
    try {
      fs.rmdirSync(tmpDir);
    } catch {
      /* ignore */
    }
  }
}
