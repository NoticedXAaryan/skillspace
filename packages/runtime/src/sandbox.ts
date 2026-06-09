import * as fs from 'node:fs';
import * as path from 'node:path';

export class SandboxError extends Error {
  constructor(message: string, public readonly type: 'filesystem' | 'network') {
    super(message);
    this.name = 'SandboxError';
  }
}

export class FileSystemSandbox {
  private workspaceDir: string;

  constructor(workspaceDir?: string) {
    // Default to the current working directory, but resolve it to an absolute path
    this.workspaceDir = path.resolve(workspaceDir || process.cwd());
  }

  /**
   * Resolves a path and ensures it does not escape the workspace directory.
   */
  private resolveAndEnforce(targetPath: string): string {
    const resolved = path.resolve(this.workspaceDir, targetPath);
    
    // Check if the resolved path starts with the workspace directory
    // Adding a trailing separator ensures we don't match partial folder names
    // e.g. /workspace-hack/ isn't allowed if workspaceDir is /workspace
    const workspacePrefix = this.workspaceDir + path.sep;
    
    if (resolved !== this.workspaceDir && !resolved.startsWith(workspacePrefix)) {
      throw new SandboxError(`Path traversal blocked. Access denied to: ${targetPath}`, 'filesystem');
    }

    return resolved;
  }

  public readFileSync(targetPath: string, encoding: BufferEncoding = 'utf-8'): string {
    const safePath = this.resolveAndEnforce(targetPath);
    return fs.readFileSync(safePath, encoding);
  }

  public writeFileSync(targetPath: string, content: string | Buffer, encoding: BufferEncoding = 'utf-8'): void {
    const safePath = this.resolveAndEnforce(targetPath);
    fs.writeFileSync(safePath, content, { encoding });
  }

  public existsSync(targetPath: string): boolean {
    try {
      const safePath = this.resolveAndEnforce(targetPath);
      return fs.existsSync(safePath);
    } catch {
      return false; // If it escapes sandbox, we pretend it doesn't exist
    }
  }

  public statSync(targetPath: string): fs.Stats {
    const safePath = this.resolveAndEnforce(targetPath);
    return fs.statSync(safePath);
  }

  public readdirSync(targetPath: string, options: { withFileTypes: true }): fs.Dirent[] {
    const safePath = this.resolveAndEnforce(targetPath);
    return fs.readdirSync(safePath, options);
  }
}

export class NetworkSandbox {
  private static readonly BLOCKED_DOMAINS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '169.254.169.254' // AWS Metadata
  ];

  /**
   * Check if a URL is safe to fetch. Blocks local and private IP ranges.
   */
  private static isSafeUrl(targetUrl: string): boolean {
    try {
      const parsed = new URL(targetUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return false;
      }
      
      const hostname = parsed.hostname.toLowerCase();
      
      if (this.BLOCKED_DOMAINS.includes(hostname)) {
        return false;
      }

      // Block private IP ranges (basic regex checks for IPv4)
      // 10.0.0.0 - 10.255.255.255
      if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
      // 172.16.0.0 - 172.31.255.255
      if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
      // 192.168.0.0 - 192.168.255.255
      if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
      
      return true;
    } catch {
      return false; // Invalid URL
    }
  }

  /**
   * A sandboxed wrapper around fetch.
   */
  public static async fetch(targetUrl: string, init?: RequestInit): Promise<Response> {
    if (!this.isSafeUrl(targetUrl)) {
      throw new SandboxError(`Network request blocked for safety: ${targetUrl}`, 'network');
    }
    return fetch(targetUrl, init);
  }
}
