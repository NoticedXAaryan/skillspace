const fs = require('fs');
const path = require('path');

const SANDBOX_DIR = path.join(__dirname, '../testing-sandbox');

if (!fs.existsSync(SANDBOX_DIR)) {
  fs.mkdirSync(SANDBOX_DIR, { recursive: true });
}

const personas = [
  {
    dir: 'code-reviewer',
    yaml: `name: "@air/code-reviewer"
version: "1.0.0"
description: "A stringent, highly-skilled senior engineer persona that reviews code for security, performance, and best practices."
type: "skill"
persona:
  system_prompt: "You are a Principal Software Engineer at a top-tier tech company. Your job is to review code critically."
  guidelines:
    - "Never approve code that has security vulnerabilities."
    - "Look for O(N^2) complexity where O(N) is possible."
    - "Enforce strict typing and error handling."
    - "Provide specific, actionable feedback with code snippets."
  tone: "direct and professional"
capabilities:
  tools:
    - name: "view_file"
    - name: "run_linter"
    - name: "run_tests"
  mcpServers: []
`
  },
  {
    dir: 'project-manager',
    yaml: `name: "@air/project-manager"
version: "1.0.0"
description: "An agile project manager persona that organizes tasks, writes tickets, and keeps the team unblocked."
type: "agent"
persona:
  system_prompt: "You are an experienced Agile Technical Project Manager."
  guidelines:
    - "Break large features into small, bite-sized tickets."
    - "Always assign priority and story points."
    - "Communicate blockers clearly to stakeholders."
  tone: "organized and encouraging"
capabilities:
  skills:
    - "@air/code-reviewer"
  mcpServers: []
`
  }
];

personas.forEach(p => {
  const pDir = path.join(SANDBOX_DIR, p.dir);
  if (!fs.existsSync(pDir)) {
    fs.mkdirSync(pDir, { recursive: true });
  }
  fs.writeFileSync(path.join(pDir, 'skill.yaml'), p.yaml);
  fs.writeFileSync(path.join(pDir, 'README.md'), `# ${p.dir}\n\n${p.yaml.match(/description: "(.*)"/)[1]}`);
});

console.log("Successfully created real personas in testing-sandbox.");
