import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Command } from 'commander';
import YAML from 'yaml';
import { ensureSkillspaceDir } from '@skillspace/runtime';
import { select, text, isCancel } from '@clack/prompts';
import { intro } from '../ui/states/intro.js';
import { outro } from '../ui/states/outro.js';
import { createLoader } from '../ui/states/loader.js';
import { successCritical, successStandard } from '../ui/states/success.js';
import { errorInline, errorOperational } from '../ui/states/error.js';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new AIR project (Skill, Agent, or MCP Server)')
    .option('-y, --yes', 'Skip prompts and use defaults (or provided flags) for headless execution')
    .option('-t, --type <type>', 'Project type (skill, agent, mcp)')
    .option('-n, --name <name>', 'Project name')
    .option('-d, --description <description>', 'Project description')
    .option('-c, --category <category>', 'Project category')
    .option('-a, --author <author>', 'Project author')
    .action(async (opts) => {
      const startTime = Date.now();
      const cwd = process.cwd();
      let projectType = opts.type;

      if (!opts.yes && !projectType) {
        intro('init', 'Project scaffolder');
        const typePrompt = await select({
          message: 'What do you want to create?',
          options: [
            { value: 'skill', label: 'Skill', hint: 'Single-shot prompt template' },
            { value: 'agent', label: 'Agent', hint: 'Autonomous loop with tools and memory' },
            { value: 'mcp', label: 'MCP Server', hint: 'Typescript boilerplate for tools' },
          ],
        });
        if (isCancel(typePrompt)) { 
          errorInline('Operation cancelled.'); 
          process.exit(0); 
        }
        projectType = typePrompt as string;
      }

      if (!projectType) projectType = 'skill';

      if (projectType === 'skill' || projectType === 'agent') {
        const ext = projectType === 'agent' ? 'agent.yaml' : 'skill.yaml';
        const manifestPath = path.join(cwd, ext);

        if (fs.existsSync(manifestPath)) {
          errorOperational('File conflict', { 
            message: `${ext} already exists in this directory.`,
            hint: 'Change directories or remove the file first.'
          });
          process.exit(1);
        }

        let projectName = opts.name || path.basename(cwd);
        let description = opts.description || `An AIR ${projectType}`;
        let author = opts.author || process.env.USER || process.env.USERNAME || 'unknown';
        let category = opts.category || 'other';

        if (!opts.yes) {
          if (opts.type) intro('init', `AIR ${projectType.toUpperCase()} Setup`);

          const namePrompt = await text({ message: 'Project name:', initialValue: projectName, placeholder: projectName });
          if (isCancel(namePrompt)) { errorInline('Cancelled.'); process.exit(0); }
          projectName = namePrompt;

          const descPrompt = await text({ message: 'Description:', initialValue: description, placeholder: description });
          if (isCancel(descPrompt)) { errorInline('Cancelled.'); process.exit(0); }
          description = descPrompt;

          const authorPrompt = await text({ message: 'Author:', initialValue: author, placeholder: author });
          if (isCancel(authorPrompt)) { errorInline('Cancelled.'); process.exit(0); }
          author = authorPrompt;

          const categoryPrompt = await select({
            message: 'Category:',
            options: [
              { value: 'code', label: 'Code' },
              { value: 'writing', label: 'Writing' },
              { value: 'analysis', label: 'Analysis' },
              { value: 'security', label: 'Security' },
              { value: 'devops', label: 'DevOps' },
              { value: 'other', label: 'Other' },
            ],
            initialValue: category,
          });
          if (isCancel(categoryPrompt)) { errorInline('Cancelled.'); process.exit(0); }
          category = categoryPrompt as string;
        }

        const loader = !opts.yes ? createLoader(`Generating ${ext}`) : null;

        let manifest: any;
        if (projectType === 'skill') {
          manifest = {
            name: projectName,
            version: '1.0.0',
            description,
            author,
            license: 'MIT',
            tags: [category],
            category,
            instructions: {
              system: `You are an expert at ${projectName}.`,
              user_template: `{{input}}`,
              output_format: 'text'
            },
            permissions: []
          };
        } else {
          manifest = {
            name: projectName,
            version: '1.0.0',
            description,
            author,
            type: 'agent',
            instructions: `You are an autonomous agent for ${projectName}.`,
            model: 'ollama/llama3.2',
            skills: []
          };
        }

        fs.writeFileSync(manifestPath, YAML.stringify(manifest), 'utf-8');
        ensureSkillspaceDir();

        if (loader) {
          loader.succeed(`Generated ${ext}`);
          successCritical('Project initialized.', `${projectName} has been scaffolded successfully.`, [
            ['Publish', `air publish`],
            ['Run locally', `air run ${projectName}`]
          ]);
          outro(Date.now() - startTime);
        } else {
          successStandard(`Initialized AIR ${projectType} "${projectName}"`, {
            'Created file': ext
          });
        }
      } else if (projectType === 'mcp') {
        const pkgJsonPath = path.join(cwd, 'package.json');
        if (fs.existsSync(pkgJsonPath)) {
          errorOperational('File conflict', { 
            message: 'package.json already exists in this directory.',
            hint: 'Change directories or remove the file first.'
          });
          process.exit(1);
        }

        let projectName = opts.name || path.basename(cwd);
        let description = opts.description || 'An MCP Server';
        
        if (!opts.yes) {
          if (opts.type) intro('init', 'AIR MCP Server Setup');
          
          const namePrompt = await text({ message: 'Project name:', initialValue: projectName, placeholder: projectName });
          if (isCancel(namePrompt)) { errorInline('Cancelled.'); process.exit(0); }
          projectName = namePrompt;

          const descPrompt = await text({ message: 'Description:', initialValue: description, placeholder: description });
          if (isCancel(descPrompt)) { errorInline('Cancelled.'); process.exit(0); }
          description = descPrompt;
        }

        const loader = !opts.yes ? createLoader('Scaffolding MCP Server project') : null;

        const pkgJson = {
          name: projectName,
          version: "1.0.0",
          description: description,
          type: "module",
          bin: {
            [projectName]: "./build/index.js"
          },
          scripts: {
            "build": "tsc",
            "start": "node build/index.js"
          },
          dependencies: {
            "@modelcontextprotocol/sdk": "latest"
          },
          devDependencies: {
            "@types/node": "^20.0.0",
            "typescript": "^5.0.0"
          }
        };

        const tsconfig = {
          compilerOptions: {
            target: "ES2022",
            module: "Node16",
            moduleResolution: "Node16",
            outDir: "./build",
            rootDir: "./src",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
          },
          include: ["src/**/*"]
        };

        const indexTs = `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: '${projectName}', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'hello_world',
        description: 'A simple hello world tool',
        inputSchema: { type: 'object', properties: {} },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'hello_world') {
    return { content: [{ type: 'text', text: 'Hello from MCP!' }] };
  }
  throw new Error('Tool not found');
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
`;

        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2), 'utf-8');
        fs.writeFileSync(path.join(cwd, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2), 'utf-8');
        fs.mkdirSync(path.join(cwd, 'src'), { recursive: true });
        fs.writeFileSync(path.join(cwd, 'src', 'index.ts'), indexTs, 'utf-8');

        if (loader) {
          loader.succeed('Scaffolded MCP Server');
          successCritical('MCP Server initialized.', `Your Typescript boilerplate is ready.`, [
            ['Install', 'npm install'],
            ['Build', 'npm run build'],
            ['Start', 'npm start']
          ]);
          outro(Date.now() - startTime);
        } else {
          successStandard(`Initialized MCP Server "${projectName}"`, {
            'Created files': 'package.json, tsconfig.json, src/index.ts'
          });
        }
      } else {
        errorInline(`Unknown type: ${projectType}`);
        process.exit(1);
      }
    });
}
