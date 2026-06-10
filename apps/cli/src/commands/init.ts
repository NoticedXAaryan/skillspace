import * as fs from 'node:fs';
import * as path from 'node:path';
import { scaffoldMcpServer } from './mcp-scaffold.js';
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
    .description('Initialize a new SkillSpace project (Skill, Agent, or MCP Server)')
    .option('-y, --yes', 'Skip prompts and use defaults (or provided flags) for headless execution')
    .option('-t, --type <type>', 'Project type (skill, agent, mcp)')
    .option('-n, --name <name>', 'Project name')
    .option('-d, --description <description>', 'Project description')
    .option('-c, --category <category>', 'Project category')
    .option('-a, --author <author>', 'Project author')
    .option('-l, --lang <lang>', 'Language for MCP server (typescript, javascript, python, go, rust, java)')
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

      let lang = opts.lang;
      if (projectType === 'mcp' && !lang && !opts.yes) {
        const langPrompt = await select({
          message: 'Choose a language for your MCP Server:',
          options: [
            { value: 'typescript', label: 'TypeScript (Node)' },
            { value: 'javascript', label: 'JavaScript (Node)' },
            { value: 'python', label: 'Python' },
            { value: 'go', label: 'Go' },
            { value: 'rust', label: 'Rust' },
            { value: 'java', label: 'Java' },
          ],
        });
        if (isCancel(langPrompt)) { errorInline('Cancelled.'); process.exit(0); }
        lang = langPrompt as string;
      }
      if (projectType === 'mcp' && !lang) lang = 'typescript';

      let projectName = opts.name || 'my-air-project';
      let description = opts.description || (projectType === 'mcp' ? 'An MCP Server' : `An SkillSpace ${projectType}`);
      let author = opts.author || process.env.USER || process.env.USERNAME || 'unknown';
      let category = opts.category || 'other';

      if (!opts.yes) {
        if (opts.type) intro('init', `SkillSpace ${projectType.toUpperCase()} Setup`);

        const namePrompt = await text({ message: 'Project name (or . for current dir):', initialValue: projectName, placeholder: projectName });
        if (isCancel(namePrompt)) { errorInline('Cancelled.'); process.exit(0); }
        projectName = namePrompt;

        const descPrompt = await text({ message: 'Description:', initialValue: description, placeholder: description });
        if (isCancel(descPrompt)) { errorInline('Cancelled.'); process.exit(0); }
        description = descPrompt;

        if (projectType !== 'mcp') {
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
      }

      const targetDir = projectName === '.' ? cwd : path.join(cwd, projectName);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const finalProjectName = projectName === '.' ? path.basename(cwd) : projectName;

      if (projectType === 'skill' || projectType === 'agent') {
        const ext = projectType === 'agent' ? 'agent.yaml' : 'skill.yaml';
        const manifestPath = path.join(targetDir, ext);

        if (fs.existsSync(manifestPath)) {
          errorOperational('File conflict', { 
            message: `${ext} already exists in ${targetDir}.`,
            hint: 'Change directories or remove the file first.'
          });
          process.exit(1);
        }

        const loader = !opts.yes ? createLoader(`Generating ${ext}`) : null;

        let manifest: any;
        if (projectType === 'skill') {
          manifest = {
            schemaVersion: 2,
            name: finalProjectName,
            version: '1.0.0',
            description,
            author,
            license: 'MIT',
            tags: [category],
            category,
            persona: {
              system_prompt: `You are an expert at ${finalProjectName}.`,
              guidelines: [
                "Always be helpful and concise"
              ],
              tone: "professional"
            },
            capabilities: {
              tools: [],
              mcpServers: []
            }
          };
        } else {
          manifest = {
            name: finalProjectName,
            version: '1.0.0',
            description,
            author,
            license: 'MIT',
            type: 'agent',
            model: { id: 'ollama/llama3.2' },
            skills: []
          };
        }

        fs.writeFileSync(manifestPath, YAML.stringify(manifest), 'utf-8');
        ensureSkillspaceDir();

        if (loader) {
          loader.succeed(`Generated ${ext}`);
          successCritical('Project initialized.', `${finalProjectName} has been scaffolded successfully.`, [
            ['Publish', `air publish`],
            ['Run locally', `air run ${projectName === '.' ? ext : path.join(projectName, ext)}`]
          ]);
          outro(Date.now() - startTime);
        } else {
          successStandard(`Initialized SkillSpace ${projectType} "${finalProjectName}"`, {
            'Created file': ext
          });
        }
      } else if (projectType === 'mcp') {
        await scaffoldMcpServer(targetDir, projectName, finalProjectName, description, author, lang as string, !!opts.yes, startTime);
      } else {
        errorInline(`Unknown type: ${projectType}`);
        process.exit(1);
      }
    });
}
