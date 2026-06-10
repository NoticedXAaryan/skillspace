# SkillSpace AI Development Guidelines

Welcome, fellow AI Assistant! You are working in the SkillSpace monorepo. This document is a critical system prompt that defines the architecture of SkillSpace and instructs you on how to scaffold and manage projects.

## The SkillSpace Ontology

You must strictly adhere to these definitions when reasoning about or writing code:

1. **MCP Server**: The raw integration layer (Model Context Protocol).
   - **What it is:** A standard server (via `stdio` or SSE) that exposes **Tools** and **Resources**. 
   - **What it is NOT:** It does NOT have memory, LLM prompts, or agentic loop behaviors. It is simply a dumb capability interface.
   - **Implementation:** Typically written in TypeScript using `@modelcontextprotocol/sdk`.

2. **Skill**: A packaged capability wrapped in a `skill.yaml` manifest.
   - **What it is:** A stateless, single-shot execution unit. It contains a prompt template (e.g. `{{input}}`) and can optionally link to an MCP server to provide tools to the LLM during execution.
   - **What it is NOT:** It is not an autonomous loop. It runs exactly once per invocation.

3. **Agent**: An autonomous orchestrator wrapped in an `agent.yaml` manifest.
   - **What it is:** A continuous loop entity with a persona, memory/state, and access to a list of Skills. It decides when to invoke skills to accomplish a goal.
   - **What it is NOT:** It does not expose raw tools itself. It consumes Skills.

## Development Workflows

When the user asks you to "create a skill", "create an agent", or "create an MCP server", follow these workflows:

### 1. Creating an MCP Server + Skill Wrapper
If the user wants a new capability that requires code (like browser automation, file reading, etc.), you must create an MCP server and wrap it in a Skill.
1. Use the CLI: `air init -t mcp <project-name>`
2. This will scaffold a folder `project-name/` containing:
   - `package.json`, `tsconfig.json`, `src/index.ts` (The MCP server boilerplate)
   - `skill.yaml` (The Skill manifest linking to the local MCP server)
3. Implement the tools inside `src/index.ts`.
4. Run `npm install` and `npm run build` inside the folder.
5. You can test it locally via `air run .\skill.yaml --input "test instruction"`.

### 2. Creating a Prompt-Only Skill
If the user wants a stateless transformation capability without code (e.g., a summarizer, a code reviewer).
1. Use the CLI: `air init -t skill <project-name>`
2. This will scaffold a folder with just a `skill.yaml`.
3. Edit the `instructions.system` and `instructions.user_template` inside the `skill.yaml`.
4. Test it via `air run .\skill.yaml --input "test"`.

### 3. Creating an Agent
If the user wants an autonomous entity to perform complex, multi-step tasks.
1. Use the CLI: `air init -t agent <project-name>`
2. This scaffolds an `agent.yaml` inside a folder.
3. Edit the `instructions` to define the persona.
4. Add required skills to the `skills: []` array in the YAML.
5. Run it via `air run .\agent.yaml`.

## Troubleshooting the CLI
- **Local Testing**: The `air run` command accepts local paths (e.g., `.\skill.yaml`). It will automatically read the local file and execute it. You do *not* need to publish it first.
- **Module Warnings**: Ensure any new workspaces or packages you add have `"type": "module"` in their `package.json` to prevent Node.js warnings.

## Note on "Vibe Coding"
The user prefers "vibe coding." When they give high-level, vague instructions, rely on this document to enforce architectural rigor. Do not let the boundary between Agent and Skill blur. 
