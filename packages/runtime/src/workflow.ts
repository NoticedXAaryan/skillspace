import type { Workflow, ExecutionResult } from '@skillspace/schema';
import { Executor, ExecutionError } from './executor.js';
import { AgentExecutor } from './agent-executor.js';
import jexl from 'jexl';

export interface WorkflowRunOptions {
  workflow: Workflow;
  input: string;
}

export type ContextType = {
  input: string;
  steps: Record<string, { output: string; status: 'success' | 'error' | 'skipped' }>;
};

export class WorkflowEngine {
  private skillExecutor: Executor;
  private agentExecutor: AgentExecutor;

  constructor(skillExecutor?: Executor, agentExecutor?: AgentExecutor) {
    this.skillExecutor = skillExecutor ?? new Executor();
    this.agentExecutor = agentExecutor ?? new AgentExecutor();
  }

  /**
   * Traverse AST to pre-validate variable references
   */
  public preflightValidation(workflow: Workflow): void {
    const definedStepIds = new Set<string>();
    
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      if (step.id) definedStepIds.add(step.id);
      else definedStepIds.add(i.toString());
      
      if ('parallel' in step) {
        step.parallel.forEach((p: any, idx: number) => {
          if (p.id) definedStepIds.add(p.id);
          else definedStepIds.add(`${step.id || i.toString()}_${idx}`);
        });
      }
    }

    const validateExpression = (expr: string) => {
      // Just check if it compiles without throwing
      jexl.compile(expr);
      
      // Simple string-based extraction for MVP pre-flight missing steps
      const matches = expr.match(/steps\.([^.]+)\./g);
      if (matches) {
        for (const match of matches) {
          const stepId = match.split('.')[1];
          if (!definedStepIds.has(stepId)) {
            throw new Error(`Compile Error: Reference to undefined step "${stepId}" in expression: "${expr}"`);
          }
        }
      }
    };

    // Check all conditions and inputs
    for (const step of workflow.steps) {
      if (step.condition) validateExpression(step.condition);
      if ('run' in step && step.input) {
        const matches = step.input.match(/\{\{(.*?)\}\}/g);
        if (matches) {
          for (const match of matches) {
            validateExpression(match.replace(/[{}]/g, '').trim());
          }
        }
      }
      if ('parallel' in step) {
        for (const pStep of step.parallel) {
          if (pStep.condition) validateExpression(pStep.condition);
          if (pStep.input) {
            const matches = pStep.input.match(/\{\{(.*?)\}\}/g);
            if (matches) {
              for (const match of matches) {
                validateExpression(match.replace(/[{}]/g, '').trim());
              }
            }
          }
        }
      }
    }

    if (workflow.outputs) {
      for (const expr of Object.values(workflow.outputs) as string[]) {
        const matches = expr.match(/\{\{(.*?)\}\}/g);
        if (matches) {
          for (const match of matches) {
            validateExpression(match.replace(/[{}]/g, '').trim());
          }
        } else {
          validateExpression(expr);
        }
      }
    }
  }

  /**
   * Run a workflow
   */
  async run(options: WorkflowRunOptions): Promise<Record<string, string>> {
    const context: ContextType = {
      input: options.input,
      steps: {},
    };

    console.log(`[Workflow] Validating workflow "${options.workflow.name}"...`);
    this.preflightValidation(options.workflow);
    console.log(`[Workflow] Compilation successful. Starting execution.`);

    for (let i = 0; i < options.workflow.steps.length; i++) {
      const step = options.workflow.steps[i]!;
      const stepId = step.id || i.toString();

      try {
        if ('parallel' in step) {
          const promises = step.parallel.map(async (subStep: any, index: number) => {
            const subStepId = subStep.id || `${stepId}_${index}`;
            return this.executeStep(subStep, context, subStepId);
          });
          await Promise.all(promises);
          context.steps[stepId] = { output: 'parallel execution completed', status: 'success' };
        } else {
          await this.executeStep(step, context, stepId);
        }
      } catch (err) {
        if (step.on_failure === 'continue') {
          console.warn(`[Workflow] Step "${stepId}" failed but continuing: ${err}`);
        } else {
          throw new ExecutionError(`Workflow failed at step "${stepId}": ${err instanceof Error ? err.message : String(err)}`, 'WORKFLOW_ERROR');
        }
      }
    }

    console.log(`[Workflow] Completed successfully.`);

    const outputs: Record<string, string> = {};
    if (options.workflow.outputs) {
      for (const [key, expr] of Object.entries(options.workflow.outputs) as [string, string][]) {
        if (!expr.includes('{{')) {
          try {
            outputs[key] = String(jexl.evalSync(expr, context));
          } catch {
            outputs[key] = expr;
          }
        } else {
          outputs[key] = this.resolveVariables(expr, context);
        }
      }
    } else {
      const lastStepId = options.workflow.steps[options.workflow.steps.length - 1]?.id || (options.workflow.steps.length - 1).toString();
      if (context.steps[lastStepId]) {
        outputs['result'] = context.steps[lastStepId]!.output;
      }
    }

    return outputs;
  }

  private async executeStep(step: any, context: ContextType, stepId: string): Promise<void> {
    if (step.condition) {
      try {
        const isTrue = !!jexl.evalSync(step.condition, context);
        if (!isTrue) {
          console.log(`[Workflow] Skipping step "${stepId}" (Condition not met)`);
          context.steps[stepId] = { output: '', status: 'skipped' };
          return;
        }
      } catch (err) {
        throw new Error(`Failed to evaluate condition "${step.condition}": ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    console.log(`[Workflow] Executing step "${stepId}"...`);
    const resolvedInput = this.resolveVariables(step.input || '{{input}}', context);

    let result: ExecutionResult;
    try {
      result = await this.skillExecutor.run({
        skill: step.run,
        input: resolvedInput,
        model: step.model || 'default',
      });
    } catch (err) {
      result = await this.agentExecutor.run({
        agent: step.run,
        input: resolvedInput,
      });
    }

    context.steps[stepId] = { output: result.output, status: 'success' };
  }

  private resolveVariables(text: string, context: ContextType): string {
    return text.replace(/\{\{(.*?)\}\}/g, (match, expr) => {
      try {
        const val = jexl.evalSync(expr.trim(), context);
        return val !== undefined ? String(val) : match;
      } catch {
        return match;
      }
    });
  }
}
