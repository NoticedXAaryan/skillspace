import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkflowEngine } from '../src/workflow.js';
import { WorkflowResolver } from '../src/workflow-resolver.js';
import type { Workflow } from '@skillspace/schema';

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
    // Mock the executors so we don't actually invoke agents or skills
    (engine as any).skillExecutor.run = vi.fn().mockResolvedValue({ output: 'mocked skill output' });
    (engine as any).agentExecutor.run = vi.fn().mockResolvedValue({ output: 'mocked agent output' });
  });

  it('should run a sequential workflow and resolve outputs', async () => {
    const workflow: Workflow = {
      name: 'test-sequential',
      version: '1.0.0',
      description: 'Test',
      author: 'dev',
      license: 'MIT',
      steps: [
        { id: 'step1', run: 'mock-skill', input: 'Hello' },
        { id: 'step2', run: 'mock-skill', input: 'Greeting: {{steps.step1.output}}' },
      ],
      outputs: {
        final: '{{steps.step2.output}}',
      }
    };

    const result = await engine.run({ workflow, input: '' });
    
    expect((engine as any).skillExecutor.run).toHaveBeenCalledTimes(2);
    expect((engine as any).skillExecutor.run).toHaveBeenNthCalledWith(2, expect.objectContaining({
      input: 'Greeting: mocked skill output'
    }));
    
    expect(result).toEqual({ final: 'mocked skill output' });
  });

  it('should evaluate conditions correctly and skip step if false', async () => {
    const workflow: Workflow = {
      name: 'test-condition',
      version: '1.0.0',
      description: 'Test',
      author: 'dev',
      license: 'MIT',
      steps: [
        { id: 's1', run: 's', input: '' },
        { id: 's2', run: 's', input: '', condition: 'steps.s1.output == "nonexistent"' },
      ],
    };

    await engine.run({ workflow, input: '' });
    
    expect((engine as any).skillExecutor.run).toHaveBeenCalledTimes(1); // Second step should be skipped
  });

  it('should throw compile error during preflight if referencing missing step', async () => {
    const workflow: Workflow = {
      name: 'test-bad-ref',
      version: '1.0.0',
      description: 'Test',
      author: 'dev',
      license: 'MIT',
      steps: [
        { id: 's1', run: 's', input: '{{steps.missing.output}}' },
      ],
    };

    await expect(engine.run({ workflow, input: '' })).rejects.toThrow(/Compile Error/);
  });
});
