import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command } from 'commander';
import { Executor, AgentExecutor } from '@skillspace/runtime';
import { validateBenchmark } from '@skillspace/schema';
import * as YAML from 'yaml';
import { createLoader } from '../ui/states/loader.js';
import { errorOperational } from '../ui/states/error.js';
import { successStandard } from '../ui/states/success.js';
import { box } from '../ui/layout/box.js';
import { c } from '../ui/tokens/colors.js';

export function registerBenchmarkCommand(program: Command): void {
  program
    .command('benchmark <suite_path>')
    .description('Run a benchmark test suite against a package')
    .action(async (suitePath: string) => {
      const loader = createLoader(`Loading benchmark suite from ${suitePath}...`);
      const fullPath = path.resolve(process.cwd(), suitePath);
      
      if (!fs.existsSync(fullPath)) {
        loader.fail('Suite not found');
        errorOperational('File Error', { message: `Benchmark suite not found at ${fullPath}` });
        process.exit(1);
      }

      const raw = fs.readFileSync(fullPath, 'utf-8');
      
      let parsed: unknown;
      try {
        parsed = YAML.parse(raw);
      } catch {
        try {
          parsed = JSON.parse(raw);
        } catch {
          loader.fail('Invalid format');
          errorOperational('Parse Error', { message: 'Benchmark suite must be valid YAML or JSON' });
          process.exit(1);
        }
      }

      const validation = validateBenchmark(parsed);
      if (!validation.success) {
        loader.fail('Schema validation failed');
        errorOperational('Validation Error', { message: 'Invalid benchmark schema' });
        console.error(validation.errors.issues);
        process.exit(1);
      }

      const suite = validation.data;
      loader.succeed(`Loaded ${suite.name}@${suite.version}`);
      
      console.log(box([
        `${c.textFaint('Target Package:')} ${c.brand(suite.target_package)}`,
        `${c.textFaint('Test Cases:')}     ${c.text(suite.tests.length.toString())}`
      ], { title: `Running Benchmark: ${suite.name}`, colorFn: c.successDim }));

      const skillExecutor = new Executor();
      const agentExecutor = new AgentExecutor();

      let passedCount = 0;
      let totalScore = 0;

      for (let i = 0; i < suite.tests.length; i++) {
        const test = suite.tests[i]!;
        const testLoader = createLoader(`Test [${i + 1}/${suite.tests.length}]: ${test.id}`);
        
        let output = '';
        const startTime = Date.now();
        let error = null;

        try {
          try {
            const res = await skillExecutor.run({ skill: suite.target_package, input: test.input, model: 'ollama/llama3.2' });
            output = res.output;
          } catch (e) {
            const res = await agentExecutor.run({ agent: suite.target_package, input: test.input });
            output = res.output;
          }
        } catch (e) {
          error = e;
        }

        const duration = Date.now() - startTime;
        let passed = false;

        if (error) {
          testLoader.fail(`Failed (Execution Error) in ${duration}ms`);
          console.log(box([
            `${c.error('Error:')} ${error instanceof Error ? error.message : String(error)}`
          ], { colorFn: c.error }));
        } else if (test.match_type === 'exact') {
          passed = output.trim() === test.expected_output?.trim();
        } else if (test.match_type === 'contains') {
          passed = output.includes(test.expected_output || '');
        } else if (test.match_type === 'json_schema') {
          try {
            const json = JSON.parse(output);
            passed = typeof json === 'object' && json !== null;
          } catch {
            passed = false;
          }
        }

        if (passed) {
          passedCount++;
          testLoader.succeed(`Passed in ${duration}ms`);
        } else if (!error) {
          testLoader.fail(`Failed (Mismatch) in ${duration}ms`);
          console.log(box([
            `${c.textFaint('Expected:')} ${c.textMuted(test.expected_output?.substring(0, 50))}...`,
            `${c.textFaint('Received:')} ${c.text(output.substring(0, 50))}...`
          ], { colorFn: c.warning }));
        }
      }

      totalScore = (passedCount / suite.tests.length) * 100;
      
      const scoreStr = `${totalScore.toFixed(1)}%`;
      const passRateStr = `${passedCount} / ${suite.tests.length}`;
      
      if (totalScore < 100) {
        errorOperational('Benchmark Failed', {
          message: `Score: ${scoreStr}\nPassed: ${passRateStr}`
        });
        process.exit(1);
      } else {
        successStandard('Benchmark Passed', {
          Score: scoreStr,
          Passed: passRateStr
        });
      }
    });
}
