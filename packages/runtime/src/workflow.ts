import type { Workflow, ExecutionResult } from '@skillspace/schema';
import { Executor, ExecutionError } from './executor.js';
import { AgentExecutor } from './agent-executor.js';

export interface WorkflowRunOptions {
  workflow: Workflow;
  input: string;
}

export interface WorkflowContext {
  input: string;
  steps: Record<string, { output: string; status: 'success' | 'error'; error?: string }>;
}

export class WorkflowEngine {
  private skillExecutor: Executor;
  private agentExecutor: AgentExecutor;

  constructor(skillExecutor?: Executor, agentExecutor?: AgentExecutor) {
    this.skillExecutor = skillExecutor ?? new Executor();
    this.agentExecutor = agentExecutor ?? new AgentExecutor();
  }

  /**
   * Run a workflow
   */
  async run(options: WorkflowRunOptions): Promise<Record<string, string>> {
    const context: WorkflowContext = {
      input: options.input,
      steps: {},
    };

    const outputs: Record<string, string> = {};

    for (let i = 0; i < options.workflow.steps.length; i++) {
      const step = options.workflow.steps[i]!;
      const stepId = step.id || i.toString();

      try {
        if ('parallel' in step) {
          // Parallel step
          const promises = step.parallel.map(async (subStep, index) => {
            const subStepId = subStep.id || `${stepId}_${index}`;
            return this.executeStep(subStep, context, subStepId);
          });
          await Promise.all(promises);
          context.steps[stepId] = { output: 'parallel execution completed', status: 'success' };
        } else {
          // Action step
          await this.executeStep(step, context, stepId);
        }
      } catch (err) {
        if (step.on_failure === 'fail') {
          throw new ExecutionError(`Workflow failed at step "${stepId}": ${err}`, 'WORKFLOW_ERROR');
        } else {
          console.warn(`Step "${stepId}" failed but continuing: ${err}`);
        }
      }
    }

    // Resolve final outputs
    if (options.workflow.outputs) {
      for (const [key, expr] of Object.entries(options.workflow.outputs)) {
        outputs[key] = this.resolveVariables(expr, context);
      }
    } else {
      // By default, return the output of the last step
      const lastStepId = options.workflow.steps[options.workflow.steps.length - 1]?.id || (options.workflow.steps.length - 1).toString();
      if (context.steps[lastStepId]) {
        outputs['result'] = context.steps[lastStepId].output;
      }
    }

    return outputs;
  }

  private async executeStep(step: any, context: WorkflowContext, stepId: string): Promise<void> {
    if (step.condition) {
      // Very basic condition evaluation (stub)
      const isTrue = this.resolveVariables(step.condition, context) === 'true';
      if (!isTrue) {
        context.steps[stepId] = { output: '', status: 'success' }; // Skipped
        return;
      }
    }

    const resolvedInput = this.resolveVariables(step.input || context.input, context);

    let result: ExecutionResult;

    // Try skill first, if fails try agent. In a real scenario, step definition would specify type.
    try {
      result = await this.skillExecutor.run({
        skill: step.run,
        input: resolvedInput,
        model: step.model,
      });
    } catch (err) {
      // Fallback to agent executor
      result = await this.agentExecutor.run({
        agent: step.run,
        input: resolvedInput,
      });
    }

    context.steps[stepId] = { output: result.output, status: 'success' };
  }

  /**
   * Resolves {{steps.X.output}} and {{input}} variables
   */
  private resolveVariables(text: string, context: WorkflowContext): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
      const trimmed = expr.trim();
      if (trimmed === 'input') {
        return context.input;
      }
      if (trimmed.startsWith('steps.')) {
        const parts = trimmed.split('.');
        if (parts.length === 3 && parts[2] === 'output') {
          const stepId = parts[1];
          return context.steps[stepId]?.output || '';
        }
      }
      return match;
    });
  }
}
