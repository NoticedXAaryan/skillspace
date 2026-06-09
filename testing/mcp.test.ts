import { runCli, testEnv } from './setup';

describe('MCP E2E Integration', () => {
  it('installs a mock MCP server via CLI', async () => {
    // Uses the hardcoded fallback which has 'github'
    const out = await runCli(['mcp', 'install', 'github']);
    expect(out).toContain('Successfully installed MCP server "github"');
  });

  it('lists installed MCP servers', async () => {
    const out = await runCli(['mcp', 'list']);
    expect(out).toContain('github');
  });
});
