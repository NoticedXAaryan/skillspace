import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command } from 'commander';
import { Executor, AgentExecutor } from '@skillspace/runtime';
import { validateBenchmark } from '@skillspace/schema';
import * as YAML from 'yaml';

export function registerBenchmarkCommand(program: Command): void {
  program
    .command('benchmark <suite_path>')
    .description('Run a benchmark test suite against a package')
    .action(async (suitePath: string) => {
      const fullPath = path.resolve(process.cwd(), suitePath);
      if (!fs.existsSync(fullPath)) {
        console.error(`❌ Benchmark suite not found at ${fullPath}`);
        process.exit(1);
      }

      console.log(`Loading benchmark suite from ${suitePath}...`);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      
      let parsed: unknown;
      try {
        parsed = YAML.parse(raw);
      } catch {
        try {
          parsed = JSON.parse(raw);
        } catch {
          console.error(`❌ Benchmark suite must be valid YAML or JSON`);
          process.exit(1);
        }
      }

      const validation = validateBenchmark(parsed);
      if (!validation.success) {
        console.error(`❌ Invalid benchmark schema:`);
        console.error(validation.errors.issues);
        process.exit(1);
      }

      const suite = validation.data;
      console.log(`\n🏃 Running Benchmark: ${suite.name}@${suite.version}`);
      console.log(`Target Package: ${suite.target_package}`);
      console.log(`Test Cases: ${suite.tests.length}\n`);

      const skillExecutor = new Executor();
      const agentExecutor = new AgentExecutor();

      let passedCount = 0;
      let totalScore = 0;

      for (let i = 0; i < suite.tests.length; i++) {
        const test = suite.tests[i]!;
        console.log(`Test [${i + 1}/${suite.tests.length}]: ${test.id}`);
        
        let output = '';
        const startTime = Date.now();
        let error = null;

        try {
          try {
            const res = await skillExecutor.run({ skill: suite.target_package, input: test.input, model: 'ollama/llama3.2' });
            output = res.output;
          } catch (e) {
            // Fallback to agent if it's an agent package
            const res = await agentExecutor.run({ agent: suite.target_package, input: test.input });
            output = res.output;
          }
        } catch (e) {
          error = e;
        }

        const duration = Date.now() - startTime;
        let passed = false;

        if (error) {
          console.log(`  ❌ Failed (Execution Error) in ${duration}ms`);
          console.log(`     Error: ${error instanceof Error ? error.message : String(error)}`);
        } else if (test.match_type === 'exact') {
          passed = output.trim() === test.expected_output?.trim();
        } else if (test.match_type === 'contains') {
          passed = output.includes(test.expected_output || '');
        } else if (test.match_type === 'json_schema') {
          try {
            const json = JSON.parse(output);
            // Basic heuristic check for now
            passed = typeof json === 'object' && json !== null;
          } catch {
            passed = false;
          }
        }

        if (passed) {
          passedCount++;
          console.log(`  ✅ Passed in ${duration}ms`);
        } else if (!error) {
          console.log(`  ❌ Failed (Mismatch) in ${duration}ms`);
          console.log(`     Expected: ${test.expected_output?.substring(0, 50)}...`);
          console.log(`     Received: ${output.substring(0, 50)}...`);
        }
      }

      totalScore = (passedCount / suite.tests.length) * 100;
      
      console.log(`\n📊 Benchmark Results`);
      console.log(`----------------------------------------`);
      console.log(`Score: ${totalScore.toFixed(1)}%`);
      console.log(`Passed: ${passedCount} / ${suite.tests.length}`);

      // Future: send this to the registry
      console.log(`\n(Publishing to registry not yet implemented)`);
      
      if (totalScore < 100) {
        process.exit(1);
      }
    });
}
