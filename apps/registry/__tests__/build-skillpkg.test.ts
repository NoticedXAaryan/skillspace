import { describe, it, expect } from 'vitest';
import { buildSkillpkgFromManifest } from '../src/lib/build-skillpkg';
import * as tar from 'tar';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('buildSkillpkgFromManifest', () => {
  it('creates a valid tar.gz containing skill.yaml', async () => {
    const yaml = `schemaVersion: 2\nname: "@test/pkg"\nversion: "1.0.0"\ndescription: "test"\npersona:\n  system_prompt: "hi"\n`;
    const { buffer, checksum } = await buildSkillpkgFromManifest(yaml);

    expect(buffer.length).toBeGreaterThan(0);
    expect(checksum).toMatch(/^sha256:[a-f0-9]{64}$/);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillspace-test-'));
    const tarPath = path.join(tmpDir, 'pkg.tar.gz');
    fs.writeFileSync(tarPath, buffer);

    await tar.x({ file: tarPath, cwd: tmpDir });
    const extracted = fs.readFileSync(path.join(tmpDir, 'skill.yaml'), 'utf-8');
    expect(extracted).toContain('schemaVersion: 2');
  });
});
