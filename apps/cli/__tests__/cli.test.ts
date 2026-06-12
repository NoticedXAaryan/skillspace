import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

describe('CLI E2E', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'air-cli-test-'));
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const runCli = async (args: string) => {
    const cliPath = path.resolve(__dirname, '../src/index.ts');
    const tsxPath = path.resolve(__dirname, '../node_modules/.bin/tsx');
    return execAsync(`${tsxPath} ${cliPath} ${args}`, { cwd: tempDir });
  };

  it('init command creates skill.yaml', async () => {
    const { stdout } = await runCli('init --yes');
    expect(stdout).toContain('Initialized');
    expect(stdout).toContain('skill');
    // Init creates a subdirectory based on project name
    const skillPath = path.join(tempDir, 'my-air-project', 'skill.yaml');
    const altPath = path.join(tempDir, 'skill.yaml');
    expect(fs.existsSync(skillPath) || fs.existsSync(altPath)).toBe(true);
  });

  it('init command fails if skill.yaml already exists', async () => {
    try {
      await runCli('init --yes');
      expect(true).toBe(false);
    } catch (err: any) {
      const output = (err.stderr || '') + (err.stdout || '');
      expect(output.toLowerCase()).toContain('already');
    }
  });

  it('list command works', async () => {
    const { stdout } = await runCli('list');
    expect(stdout).toMatch(/Installed|No packages/);
  });

});
