const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '../testing-sandbox/seed-data');

if (!fs.existsSync(SEED_DIR)) {
  fs.mkdirSync(SEED_DIR, { recursive: true });
}

// 5 Skills
const skills = [
  { name: 'web-scraper', desc: 'Advanced headless browser scraping persona', tools: ['puppeteer_nav', 'extract_dom'] },
  { name: 'data-analyst', desc: 'Pandas & SQL expert for data insights', tools: ['run_sql', 'plot_chart'] },
  { name: 'security-auditor', desc: 'Finds vulnerabilities in Node/React codebases', tools: ['run_npm_audit', 'sast_scan'] },
  { name: 'seo-expert', desc: 'Analyzes pages for SEO improvements', tools: ['fetch_html', 'analyze_meta'] },
  { name: 'copywriter', desc: 'Generates high-converting marketing copy', tools: ['search_trends', 'generate_text'] }
];

// 5 Agents
const agents = [
  { name: 'dev-team-lead', desc: 'Orchestrates frontend and backend agents', skills: ['@air/code-reviewer', '@air/project-manager'] },
  { name: 'qa-automation', desc: 'Writes and runs e2e tests automatically', skills: ['@air/web-scraper', '@air/tester'] },
  { name: 'growth-hacker', desc: 'Runs A/B tests and analyzes SEO', skills: ['@air/seo-expert', '@air/copywriter'] },
  { name: 'infra-ops', desc: 'Monitors AWS and manages Terraform', skills: ['@air/aws-expert'] },
  { name: 'research-assistant', desc: 'Deep dive literature reviews and summarization', skills: ['@air/data-analyst'] }
];

// 5 MCPs
const mcps = [
  { name: 'github-mcp', desc: 'Connects to GitHub API for PRs and Issues', url: 'http://localhost:8000/github' },
  { name: 'postgres-mcp', desc: 'Direct database access layer', url: 'http://localhost:8000/postgres' },
  { name: 'slack-mcp', desc: 'Sends and reads messages from Slack channels', url: 'http://localhost:8000/slack' },
  { name: 'stripe-mcp', desc: 'Manages subscriptions and payments', url: 'http://localhost:8000/stripe' },
  { name: 'linear-mcp', desc: 'Issue tracking and sprint management', url: 'http://localhost:8000/linear' }
];

function generateYaml(type, data) {
  let yaml = `name: "@air/${data.name}"
version: "1.0.0"
description: "${data.desc}"
type: "${type}"
`;

  if (type === 'skill') {
    yaml += `persona:
  system_prompt: "You are the ${data.name} expert."
  guidelines:
    - "Do your job perfectly."
  tone: "professional"
capabilities:
  tools:
${data.tools.map(t => `    - name: "${t}"`).join('\n')}
  mcpServers: []
`;
  } else if (type === 'agent') {
    yaml += `persona:
  system_prompt: "You are an agent managing ${data.name} workflows."
  guidelines:
    - "Coordinate skills effectively."
  tone: "orchestrator"
capabilities:
  skills:
${data.skills.map(s => `    - "${s}"`).join('\n')}
  mcpServers: []
`;
  } else if (type === 'mcp') {
    yaml += `mcp:
  url: "${data.url}"
  authType: "bearer"
`;
  }

  return yaml;
}

const allData = [
  ...skills.map(s => ({ type: 'skill', ...s })),
  ...agents.map(a => ({ type: 'agent', ...a })),
  ...mcps.map(m => ({ type: 'mcp', ...m }))
];

allData.forEach(item => {
  const itemDir = path.join(SEED_DIR, item.name);
  if (!fs.existsSync(itemDir)) {
    fs.mkdirSync(itemDir, { recursive: true });
  }
  const yamlContent = generateYaml(item.type, item);
  fs.writeFileSync(path.join(itemDir, 'skill.yaml'), yamlContent);
  fs.writeFileSync(path.join(itemDir, 'README.md'), `# @air/${item.name}\n\n${item.desc}`);
});

console.log('Successfully generated 15 seed packages in testing-sandbox/seed-data');
