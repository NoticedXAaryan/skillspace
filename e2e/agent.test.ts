import * as fs from 'node:fs';
import * as path from 'node:path';
import { runCli, testEnv } from './setup';

describe('Agent E2E Integration', () => {
  const dummyAgentDir = path.join(__dirname, 'dummy-agent');
  const dummyRepoDir = path.join(__dirname, 'dummy-repo');
  const suffix = Date.now();
  const agentName = 'code-auditor-' + suffix;

  beforeAll(async () => {
    // 1. Create a dummy agent
    fs.mkdirSync(dummyAgentDir, { recursive: true });
    
    fs.writeFileSync(path.join(dummyAgentDir, 'skill.yaml'), [
      'name: ' + agentName,
      'version: 1.0.0',
      'description: A mock auditor',
      'author: tester',
      'license: MIT',
      'type: agent',
      'model:',
      '  id: ollama',
      'instructions:',
      '  system: "You are an auditor"',
      '  user_template: "{{input}}"',
      'category: analysis',
      'entrypoint: agent.js',
      'permissions:',
      '  - filesystem.read'
    ].join('\n'));

    fs.writeFileSync(path.join(dummyAgentDir, 'agent.js'), 'console.log("I am auditing " + process.env.CWD);');

    // 2. Create a dummy repo
    fs.mkdirSync(dummyRepoDir, { recursive: true });
    fs.writeFileSync(path.join(dummyRepoDir, 'hello.txt'), 'hello world');

    // 3. Register and login
    const suffix = Date.now();
    const email = 'test-' + suffix + '@example.com';
    const username = 'testuser' + suffix;
    await runCli(['register', '-u', username, '-e', email, '-p', 'password123']);
    await runCli(['login', '-e', email, '-p', 'password123']);
  });

  afterAll(async () => {
    fs.rmSync(dummyAgentDir, { recursive: true, force: true });
    fs.rmSync(dummyRepoDir, { recursive: true, force: true });
  });

  it('publishes the code-auditor agent', async () => {
    const out = await runCli(['publish', '-d', dummyAgentDir]);
    expect(out).toContain(`Published ${agentName}@1.0.0`);
  });

  it('installs the code-auditor agent', async () => {
    const out = await runCli(['install', agentName]);
    expect(out).toContain('Successfully installed ' + agentName);
  });

  it('executes the code-auditor agent against a local directory', async () => {
    const out = await runCli(['run', agentName, '-i', dummyRepoDir]);
    expect(out).toContain('I am auditing --- hello.txt ---');
  });

  it('blocks undeclared permissions at runtime', async () => {
    const maliciousAgent = 'malicious-agent-' + Date.now();
    fs.writeFileSync(path.join(dummyAgentDir, 'agent.js'), [
      'const fs = require("fs");',
      'try {',
      '  fs.writeFileSync("unauthorized.txt", "test");',
      '  console.log("WRITE SUCCESS");',
      '} catch (e) {',
      '  console.log("WRITE FAILED: " + e.message);',
      '}'
    ].join('\n'));

    const yamlPath = path.join(dummyAgentDir, 'skill.yaml');
    fs.writeFileSync(yamlPath, [
      'name: ' + maliciousAgent,
      'version: 1.0.1',
      'description: A mock auditor',
      'author: tester',
      'license: MIT',
      'type: agent',
      'model:',
      '  id: ollama',
      'instructions:',
      '  system: "You are an auditor"',
      '  user_template: "{{input}}"',
      'category: analysis',
      'entrypoint: agent.js',
      'permissions: []'
    ].join('\n'));

    await runCli(['publish', '-d', dummyAgentDir]);
    await runCli(['install', maliciousAgent]);

    const out = await runCli(['run', maliciousAgent, '-i', dummyRepoDir]);
    expect(out).toContain('Permission denied');
    // As per the MVP capability validation logic, we can verify it doesn't break the runner completely
    // We expect it either fails to write or throws. 
  });
});
