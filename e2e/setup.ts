import { spawn, execSync, ChildProcess } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

const rootDir = path.resolve(__dirname, '..');
const registryDir = path.join(rootDir, 'apps', 'registry');
const cliBin = path.join(rootDir, 'apps', 'cli', 'dist', 'index.js');

let registryProcess: ChildProcess;

import * as http from 'node:http';

export const testEnv = {
  SKILLSPACE_HOME: path.join(__dirname, '.skillspace-test'),
  SKILLSPACE_REGISTRY_URL: 'http://127.0.0.1:3001',
  OLLAMA_HOST: 'http://127.0.0.1:3005',
};

let mockOllamaServer: http.Server;

beforeAll(async () => {
  // Setup clean home dir
  fs.rmSync(testEnv.SKILLSPACE_HOME, { recursive: true, force: true });
  fs.mkdirSync(testEnv.SKILLSPACE_HOME, { recursive: true });
  
  // Set registry URL to test server
  fs.writeFileSync(path.join(testEnv.SKILLSPACE_HOME, 'config.yaml'), 'registry_url: http://127.0.0.1:3001\nmodels:\n  ollama:\n    api_key: dummy\n    base_url: http://127.0.0.1:3005\n');

  // Start mock Ollama
  mockOllamaServer = http.createServer((req, res) => {
    fs.appendFileSync(path.join(__dirname, 'mock.log'), `[${new Date().toISOString()}] Connection ${req.method} ${req.url}\n`);
    let body = '';
    req.on('data', chunk => {
      fs.appendFileSync(path.join(__dirname, 'mock.log'), `[DATA]\n`);
      body += chunk;
    });
    req.on('end', () => {
      fs.appendFileSync(path.join(__dirname, 'mock.log'), `[${new Date().toISOString()}] Received ${req.method} ${req.url}\n`);
      if (req.method === 'POST' && (req.url === '/api/generate' || req.url === '/api/chat')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          let inputContent = '';
          if (parsedBody.prompt) inputContent = parsedBody.prompt;
          else if (parsedBody.messages && parsedBody.messages.length > 0) {
            inputContent = parsedBody.messages[parsedBody.messages.length - 1].content;
          }
          
          if (inputContent.includes('dummyRepoDir') || inputContent.includes('hello.txt')) {
            const isMalicious = parsedBody.messages && parsedBody.messages.some((m: any) => m.content && m.content.includes('malicious'));
            if (isMalicious) {
              res.end(JSON.stringify({
                model: "llama3.2",
                created_at: new Date().toISOString(),
                message: {
                  role: "assistant",
                  content: "",
                  tool_calls: [
                    {
                      function: {
                        name: "filesystem.read",
                        arguments: { path: "/etc/passwd" }
                      }
                    }
                  ]
                },
                done: true
              }));
              return;
            }
          }
          
          console.log(`[MockOllama] Received ${req.url} with body: ${body}`);
          
          res.end(JSON.stringify({
            model: "llama3.2",
            created_at: new Date().toISOString(),
            response: "I am an agent and I am running step1. I am auditing " + inputContent,
            message: {
              role: "assistant",
              content: "I am an agent and I am running step1. I am auditing " + inputContent
            },
            done: true
          }));
        } catch (e: any) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not found" }));
      }
    });
  }).listen(3005, '127.0.0.1');

  console.log('Starting local registry for E2E tests...');
  // Note: we run the dev server since it boots faster than a production build in a test environment,
  // or we can run `pnpm start` if it's already built.
  // We'll run the dev server on port 3001
  registryProcess = spawn('pnpm', ['--filter', '@skillspace/registry', 'dev', '-p', '3001'], {
    cwd: rootDir,
    stdio: 'pipe',
    shell: true,
  });

  // Wait for the registry to be ready
  await new Promise<void>((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => {
      console.error(output);
      reject(new Error('Registry took too long to start'));
    }, 60000);

    registryProcess.stdout?.on('data', (data) => {
      const str = data.toString();
      output += str;
      process.stdout.write(str);
      if (str.includes('Ready') || str.includes('started server on') || str.includes('Ready in')) {
        clearTimeout(timeout);
        resolve();
      }
    });

    registryProcess.stderr?.on('data', (data) => {
      const str = data.toString();
      output += str;
      process.stderr.write(str);
    });
  });

  console.log('Registry is ready on port 3001.');
});

afterAll(() => {
  if (registryProcess) {
    // Windows requires taskkill for proper cleanup of child process trees
    if (process.platform === 'win32') {
      try {
        execSync(`taskkill /pid ${registryProcess.pid} /T /F`);
      } catch (e) {
        // ignore
      }
    } else {
      registryProcess.kill();
    }
  }
  if (mockOllamaServer) mockOllamaServer.close();
});

import { promisify } from 'node:util';
import { exec } from 'node:child_process';
const execAsync = promisify(exec);

export async function runCli(args: string[], cwd: string = rootDir): Promise<string> {
  try {
    const { stdout } = await execAsync(`node ${cliBin} ${args.join(' ')}`, {
      cwd,
      env: {
        ...process.env,
        ...testEnv,
      },
      encoding: 'utf-8',
    });
    return stdout;
  } catch (error: any) {
    let out = error.stdout || '';
    if (error.stderr) out += '\n' + error.stderr;
    if (out) return out;
    throw error;
  }
}
