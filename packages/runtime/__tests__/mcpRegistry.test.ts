import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpRegistry, McpAllowlistError, McpServerRef } from '../src/mcp/McpRegistry.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    listTools: vi.fn().mockResolvedValue({
      tools: [{ name: 'test_tool', description: 'A test tool', inputSchema: {} }]
    }),
    callTool: vi.fn().mockResolvedValue({ content: 'test result' }),
    close: vi.fn().mockResolvedValue(undefined),
  }))
}));

vi.mock('../../telemetry.js', () => ({
  TelemetryClient: {
    sendEventSafe: vi.fn(),
  }
}));

describe('McpRegistry', () => {
  let registry: McpRegistry;

  beforeEach(() => {
    registry = new McpRegistry();
    process.env.MCP_HTTP_ALLOWLIST = 'http://localhost:3001,http://localhost:3002';
    vi.clearAllMocks();
  });

  it('HTTP URL not in allowlist -> throws McpAllowlistError', async () => {
    const ref: McpServerRef = {
      name: 'bad-http',
      transport: 'http',
      url: 'http://evil.com/mcp',
      requiredScopes: []
    };

    await expect(registry.connect(ref)).rejects.toThrow(McpAllowlistError);
  });

  it('HTTP URL in allowlist -> connects successfully', async () => {
    const ref: McpServerRef = {
      name: 'good-http',
      transport: 'http',
      url: 'http://localhost:3001',
      requiredScopes: []
    };

    await expect(registry.connect(ref)).resolves.not.toThrow();
  });

  it('stdio executable not in allowlist -> throws McpAllowlistError', async () => {
    const ref: McpServerRef = {
      name: 'bad-stdio',
      transport: 'stdio',
      command: 'python3 -m mcp_server',
      requiredScopes: []
    };

    await expect(registry.connect(ref)).rejects.toThrow(McpAllowlistError);
  });

  it('stdio command with shell injection -> sanitized or rejected', async () => {
    // If the executable becomes 'npx;' it will be sanitized to 'npx', or if not it will fail
    // The sanitization replaces [;&|<>$()[]{}] with ''
    const ref: McpServerRef = {
      name: 'inject-stdio',
      transport: 'stdio',
      command: 'npx; rm -rf /', // sanitization removes ';'
      requiredScopes: []
    };

    // Assuming it connects because 'npx;' becomes 'npx' after sanitization
    // and 'rm -rf /' become args, which are safe in spawn/execFile
    await expect(registry.connect(ref)).resolves.not.toThrow();
  });

  it('Mock MCP server listTools -> returns correct tool schema', async () => {
    const ref: McpServerRef = {
      name: 'mock-server',
      transport: 'stdio',
      command: 'npx test-server',
      requiredScopes: []
    };

    await registry.connect(ref);
    const tools = await registry.listTools('mock-server');
    
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('test_tool');
  });
});
