import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpManager } from '../src/mcp.js';
import * as fs from 'node:fs';

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    readdirSync: vi.fn(),
  };
});

// Mock fetch for registry testing
global.fetch = vi.fn();

describe('McpManager', () => {
  let manager: McpManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new McpManager();
  });

  describe('installServer', () => {
    it('should install using the hardcoded fallback if fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
      
      await expect(manager.installServer('sqlite')).resolves.not.toThrow();
      
      const args = vi.mocked(fs.writeFileSync).mock.calls[0];
      expect(args[0]).toContain('mcp.json');
      expect(JSON.parse(args[1] as string).name).toBe('sqlite');
    });

    it('should install from a local file if --from is provided', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
        name: 'custom-server',
        version: '1.0.0',
        transport: 'stdio'
      }));

      await expect(manager.installServer('custom-server', './my-server.json')).resolves.not.toThrow();
      
      const args = vi.mocked(fs.writeFileSync).mock.calls[0];
      expect(args[0]).toContain('mcp.json');
      expect(JSON.parse(args[1] as string).name).toBe('custom-server');
    });

    it('should install from the registry successfully', async () => {
      // Mock index.json
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            servers: {
              testserver: { config_url: 'testserver.json' }
            }
          })
        })
        // Mock testserver.json
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            name: 'testserver',
            version: '2.0.0',
            transport: 'stdio'
          })
        });

      await expect(manager.installServer('testserver')).resolves.not.toThrow();
      
      const args = vi.mocked(fs.writeFileSync).mock.calls[0];
      expect(args[0]).toContain('mcp.json');
      expect(JSON.parse(args[1] as string).name).toBe('testserver');
    });
  });

  describe('listServers', () => {
    it('should list installed servers by reading the mcp servers directory', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      
      // Mock readdirSync to return two directories
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'sqlite', isDirectory: () => true },
        { name: 'github', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false }, // Should be ignored
      ] as any);

      // Mock readFileSync for each server's mcp.json
      vi.mocked(fs.readFileSync)
        .mockReturnValueOnce(JSON.stringify({ name: 'sqlite', version: '1.0.0' }))
        .mockReturnValueOnce(JSON.stringify({ name: 'github', version: '1.2.0' }));

      const servers = manager.listServers();
      expect(servers).toHaveLength(2);
      expect(servers[0].name).toBe('sqlite');
      expect(servers[1].name).toBe('github');
    });
  });
});
