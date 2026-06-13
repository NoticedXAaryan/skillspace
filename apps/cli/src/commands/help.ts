import type { Command } from 'commander';
import { select, isCancel } from '@clack/prompts';
import { c } from '../ui/tokens/colors.js';
import { box } from '../ui/layout/box.js';
import { intro } from '../ui/states/intro.js';

const docs: Record<string, { title: string; desc: string; flags: string[]; examples: string[] }> = {
  run: {
    title: 'skillspace run <target>',
    desc: 'The execution engine. Runs an AI Agent, Skill, or Workflow locally on your machine.',
    flags: [
      '-i, --input <text>   Provide a prompt/input directly',
      '--chat               Start an interactive continuous chat session',
      '-y, --yes            Headless mode for scripts (JSON output)'
    ],
    examples: [
      '$ skillspace run notic/project-auditor',
      '$ skillspace run ./agent.yaml --chat',
      '$ skillspace run summarize-skill -i "Summarize this file"'
    ]
  },
  init: {
    title: 'skillspace init',
    desc: 'The universal scaffolder. Creates a new project in the current directory.',
    flags: [
      '-t, --type <type>    Skip the interactive menu (skill, agent, mcp)',
      '-n, --name <name>    Set the project name instantly',
      '-y, --yes            Headless mode'
    ],
    examples: [
      '$ skillspace init',
      '$ skillspace init --type agent --name my-jarvis'
    ]
  },
  publish: {
    title: 'skillspace publish',
    desc: 'Packages your current directory and uploads it to the global SkillSpace registry.',
    flags: [
      '--private            Publish as a private package (requires Org)',
      '-y, --yes            Headless mode'
    ],
    examples: [
      '$ skillspace publish',
      '$ skillspace publish --private'
    ]
  },
  install: {
    title: 'skillspace install <target>',
    desc: 'Downloads a capability from the registry and installs it locally.',
    flags: [
      '-g, --global         Install globally across all projects'
    ],
    examples: [
      '$ skillspace install notic/database-agent'
    ]
  },
  uninstall: {
    title: 'skillspace uninstall <target>',
    desc: 'Removes an installed package from your local system.',
    flags: [
      '-g, --global         Uninstall from the global registry'
    ],
    examples: [
      '$ skillspace uninstall notic/database-agent'
    ]
  },
  list: {
    title: 'skillspace list',
    desc: 'Lists all locally installed packages and dependencies.',
    flags: [
      '--global             List globally installed packages'
    ],
    examples: [
      '$ skillspace list'
    ]
  },
  info: {
    title: 'skillspace info <target>',
    desc: 'View detailed metadata, version history, and dependencies for a specific package.',
    flags: [],
    examples: [
      '$ skillspace info notic/database-agent'
    ]
  },
  search: {
    title: 'skillspace search <query>',
    desc: 'Search the global SkillSpace registry for existing AI capabilities.',
    flags: [
      '--limit <num>        Limit the number of results returned'
    ],
    examples: [
      '$ skillspace search "security scanner"'
    ]
  },
  login: {
    title: 'skillspace login',
    desc: 'Authenticate your machine with the SkillSpace registry using a web browser or token.',
    flags: [
      '--token <token>      Login headlessly using an API token'
    ],
    examples: [
      '$ skillspace login',
      '$ skillspace login --token xyz_123'
    ]
  },
  benchmark: {
    title: 'skillspace benchmark <target>',
    desc: 'Run automated tests and scoring benchmarks against your agent.',
    flags: [
      '--dataset <id>       Run against a specific dataset'
    ],
    examples: [
      '$ skillspace benchmark ./agent.yaml'
    ]
  },
  model: {
    title: 'skillspace model',
    desc: 'Configure your default AI models (OpenAI, Anthropic, Ollama).',
    flags: [
      '--provider <name>    Set default provider'
    ],
    examples: [
      '$ skillspace model',
      '$ skillspace model set default ollama'
    ]
  },
  org: {
    title: 'skillspace org',
    desc: 'Manage your organization, team access, and private registry scope.',
    flags: [],
    examples: [
      '$ skillspace org create my-company'
    ]
  },
  env: {
    title: 'skillspace env',
    desc: 'Manage environment variables, secrets, and API keys securely.',
    flags: [
      '--set <key>=<val>    Set a variable'
    ],
    examples: [
      '$ skillspace env --set OPENAI_API_KEY=sk-...'
    ]
  },
  agent: {
    title: 'skillspace agent',
    desc: 'Advanced operations for managing autonomous agents.',
    flags: [],
    examples: [
      '$ skillspace agent status',
      '$ skillspace agent kill <id>'
    ]
  },
  mcp: {
    title: 'skillspace mcp',
    desc: 'Advanced operations for Model Context Protocol servers.',
    flags: [],
    examples: [
      '$ skillspace mcp inspect ./server.js'
    ]
  },
  workflow: {
    title: 'skillspace workflow',
    desc: 'Manage multi-agent workflows and pipelines.',
    flags: [],
    examples: [
      '$ skillspace workflow run ./pipeline.yaml'
    ]
  }
};

export function registerHelpCommand(program: Command): void {
  program
    .command('help')
    .description('Launch the interactive documentation explorer')
    .action(async () => {
      console.clear();
      intro('help', 'Interactive Documentation Explorer');

      let looping = true;

      while (looping) {
        const choice = await select({
          message: 'Select a command to explore:',
          maxItems: 12,
          options: [
            { value: 'run', label: c.brand('run'), hint: 'Execute capabilities' },
            { value: 'init', label: c.brand('init'), hint: 'Scaffold projects' },
            { value: 'publish', label: c.brand('publish'), hint: 'Upload to registry' },
            { value: 'install', label: c.brand('install'), hint: 'Download packages' },
            { value: 'uninstall', label: c.brand('uninstall'), hint: 'Remove packages' },
            { value: 'list', label: c.brand('list'), hint: 'View installed packages' },
            { value: 'info', label: c.brand('info'), hint: 'Package metadata' },
            { value: 'search', label: c.brand('search'), hint: 'Find capabilities' },
            { value: 'benchmark', label: c.brand('benchmark'), hint: 'Run tests' },
            { value: 'login', label: c.brand('login'), hint: 'Authentication' },
            { value: 'model', label: c.brand('model'), hint: 'Configure models' },
            { value: 'org', label: c.brand('org'), hint: 'Team management' },
            { value: 'env', label: c.brand('env'), hint: 'Secrets & keys' },
            { value: 'agent', label: c.brand('agent'), hint: 'Advanced agent tools' },
            { value: 'mcp', label: c.brand('mcp'), hint: 'Advanced MCP tools' },
            { value: 'workflow', label: c.brand('workflow'), hint: 'Multi-agent pipelines' },
            { value: 'exit', label: c.textFaint('Exit Explorer') },
          ],
        });

        if (isCancel(choice) || choice === 'exit') {
          looping = false;
          console.log();
          console.log('  ' + c.text('Happy building!'));
          process.exit(0);
        }

        const doc = docs[choice as string];
        if (doc) {
          console.clear();
          intro(doc.title, 'Command deep dive');
          
          const boxLines = [
            c.textMuted('DESCRIPTION'),
            c.text(doc.desc),
            '',
            c.textMuted('FLAGS'),
            ...doc.flags.map(f => c.code(f)),
            '',
            c.textMuted('EXAMPLES'),
            ...doc.examples.map(e => c.info(e))
          ];

          console.log(box(boxLines, { title: 'Deep Dive', colorFn: c.border }));
          console.log();

          const action = await select({
            message: 'What next?',
            options: [
              { value: 'back', label: '← Back to Menu' },
              { value: 'exit', label: 'Exit Explorer' },
            ],
          });

          if (isCancel(action) || action === 'exit') {
            looping = false;
            console.log();
            console.log('  ' + c.text('Happy building!'));
            process.exit(0);
          }
          console.clear();
          intro('help', 'Interactive Documentation Explorer');
        }
      }
    });
}
