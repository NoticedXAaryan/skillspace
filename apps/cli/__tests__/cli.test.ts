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
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillspace-cli-test-'));
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const runCli = async (args: string) => {
    // Run the CLI using tsx in the current directory
    const cliPath = path.resolve(__dirname, '../src/index.ts');
    const tsxPath = path.resolve(__dirname, '../node_modules/.bin/tsx');
    return execAsync(`${tsxPath} ${cliPath} ${args}`, { cwd: tempDir });
  };

  it('init command creates skill.yaml', async () => {
    const { stdout } = await runCli('init --yes');
    expect(stdout).toContain('Initialized SkillSpace project');
    expect(fs.existsSync(path.join(tempDir, 'skill.yaml'))).toBe(true);
  });

  it('init command fails if skill.yaml already exists', async () => {
    try {
      await runCli('init --yes');
      expect(true).toBe(false); // Should not reach here
    } catch (err: any) {
      expect(err.stderr).toContain('skill.yaml already exists');
    }
  });

  it('list command works', async () => {
    const { stdout } = await runCli('list');
    expect(stdout).toMatch(/Installed Packages|No packages installed/);
  });

});
