import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { FileSystemSandbox, NetworkSandbox, SandboxError } from '../src/sandbox.js';

describe('FileSystemSandbox', () => {
  let tempWorkspace: string;

  beforeEach(() => {
    tempWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'skillspace-sandbox-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  it('allows access to files within the workspace', () => {
    const sandbox = new FileSystemSandbox(tempWorkspace);
    const testFile = path.join(tempWorkspace, 'test.txt');
    fs.writeFileSync(testFile, 'hello safe world');

    expect(sandbox.existsSync(testFile)).toBe(true);
    expect(sandbox.readFileSync('test.txt')).toBe('hello safe world');
    expect(sandbox.readFileSync(testFile)).toBe('hello safe world');
  });

  it('blocks path traversal outside the workspace', () => {
    const sandbox = new FileSystemSandbox(tempWorkspace);
    const secretFile = path.join(os.tmpdir(), 'secret.txt');
    fs.writeFileSync(secretFile, 'secret data');

    expect(sandbox.existsSync(secretFile)).toBe(false);

    expect(() => sandbox.readFileSync('../secret.txt')).toThrowError(SandboxError);
    expect(() => sandbox.readFileSync(secretFile)).toThrowError(SandboxError);
    
    fs.unlinkSync(secretFile);
  });

  it('blocks writing outside the workspace', () => {
    const sandbox = new FileSystemSandbox(tempWorkspace);
    const outsidePath = path.join(os.tmpdir(), 'hacked.txt');

    expect(() => sandbox.writeFileSync(outsidePath, 'hack')).toThrowError(SandboxError);
    expect(() => sandbox.writeFileSync('../hacked.txt', 'hack')).toThrowError(SandboxError);
  });
});

describe('NetworkSandbox', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allows safe external domains', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    
    await NetworkSandbox.fetch('https://api.openai.com/v1/models');
    
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as Mock).mock.calls[0][0]).toBe('https://api.openai.com/v1/models');
  });

  it('blocks localhost and private IPs', async () => {
    await expect(NetworkSandbox.fetch('http://localhost:3000/api/hack')).rejects.toThrowError(SandboxError);
    await expect(NetworkSandbox.fetch('http://127.0.0.1/admin')).rejects.toThrowError(SandboxError);
    await expect(NetworkSandbox.fetch('http://169.254.169.254/latest/meta-data')).rejects.toThrowError(SandboxError);
    await expect(NetworkSandbox.fetch('http://10.0.0.5/internal')).rejects.toThrowError(SandboxError);
    await expect(NetworkSandbox.fetch('http://192.168.1.100/router')).rejects.toThrowError(SandboxError);
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('blocks non-HTTP protocols', async () => {
    await expect(NetworkSandbox.fetch('file:///etc/passwd')).rejects.toThrowError(SandboxError);
    await expect(NetworkSandbox.fetch('ftp://server.com')).rejects.toThrowError(SandboxError);
    
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
