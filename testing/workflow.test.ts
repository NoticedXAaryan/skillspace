import * as fs from 'node:fs';
import * as path from 'node:path';
import { runCli, testEnv } from './setup';

describe('Workflow E2E Integration', () => {
  const dummyWorkflowDir = path.join(__dirname, 'dummy-workflow');
  const suffix = Date.now();
  const workflowName = 'release-review-' + suffix;

  beforeAll(async () => {
    const skillName = `some-skill-${suffix}`;

    fs.mkdirSync(dummyWorkflowDir, { recursive: true });
    
    // Write workflow.yaml
    fs.writeFileSync(path.join(dummyWorkflowDir, 'workflow.yaml'), `
name: ${workflowName}
version: 1.0.0
description: A mock workflow
author: tester
license: MIT
steps:
  - id: step1
    run: ${skillName}
    input: "STEP 1"
  - id: step2
    run: ${skillName}
    input: "STEP 2"
    condition: "steps.step1.status == 'success'"
    `);

    // Write skill.yaml to package it as a skill
    fs.writeFileSync(path.join(dummyWorkflowDir, 'skill.yaml'), `
name: ${workflowName}
version: 1.0.0
description: A mock workflow
author: tester
license: MIT
instructions:
  system: "You are a workflow"
  user_template: "{{input}}"
type: workflow
category: devops
entrypoint: workflow.yaml
    `);

    // Create a dummy skill that the workflow can run
    const dummySkillDir = path.join(__dirname, 'dummy-skill');
    fs.mkdirSync(dummySkillDir, { recursive: true });
    fs.writeFileSync(path.join(dummySkillDir, 'skill.yaml'), `
name: ${skillName}
version: 1.0.0
description: A mock skill
author: tester
license: MIT
type: agent
model:
  id: "ollama"
instructions:
  system: "You are a skill"
  user_template: "{{input}}"
category: analysis
entrypoint: agent.js
    `);
    fs.writeFileSync(path.join(dummySkillDir, 'agent.js'), 'console.log("skill");');

    const email = 'test-' + suffix + '@example.com';
    const username = 'testuser' + suffix;
    await runCli(['register', '-u', username, '-e', email, '-p', 'password123']);
    await runCli(['login', '-e', email, '-p', 'password123']);
    
    // Publish and install dummy skill
    await runCli(['publish', '-d', dummySkillDir]);
    await runCli(['install', skillName]);
  });

  afterAll(async () => {
    fs.rmSync(dummyWorkflowDir, { recursive: true, force: true });
    fs.rmSync(path.join(__dirname, 'dummy-skill'), { recursive: true, force: true });
  });

  it('publishes and installs the release-review workflow', async () => {
    await runCli(['publish', '-d', dummyWorkflowDir]);
    await runCli(['install', workflowName]);
  });

  it('executes the workflow and respects conditions', async () => {
    const out = await runCli(['workflow', 'run', workflowName]);
    expect(out).toContain('I am auditing');
  });
});
