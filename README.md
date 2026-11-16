# SkillSpace

**SkillSpace** is a package registry and local runtime for versioned AI skills, agents, and workflows.

Install a capability the way you install a library. The registry records who published it, which version you pinned, where the source lives, and which permissions it asks for. The CLI and runtime run that same package on your machine.

**Live registry:** [skillspace.aaaryan.space](https://skillspace.aaaryan.space)

## Highlights

- Publish a `skill.yaml` or `agent.yaml` from a public GitHub repo, or upload a package from the CLI.
- Browse, search, and open a package page with version, checksum, source, and install command.
- `skillspace install @scope/name` downloads a `.skillpkg` and records it in a local lockfile.
- Run a skill against Anthropic, OpenAI, Gemini, or a local model through one executor.
- Skills stay stateless. Agents add tools, memory, permissions, and orchestration. MCP servers are reached through an agent.

## Tech stack

| Layer    | Stack                                                              |
| -------- | ------------------------------------------------------------------ |
| Registry | Next.js 15 App Router, React 19, Tailwind CSS, Better Auth         |
| Data     | PostgreSQL, Prisma                                                 |
| Packages | Zod schemas for Skill, Agent, Workflow, and MCP manifests          |
| Runtime  | TypeScript executor, model adapters, permission checks, MCP client |
| CLI      | `skillspace` — install, run, publish, search, doctor               |
| Tooling  | pnpm workspaces, Turborepo, Vitest, ESLint, Prettier               |
| Editor   | VS Code extension and a YAML language server                       |

GitHub is the source of truth for public packages. The registry stores metadata, versions, and checksums, and builds the downloadable archive from the manifest at request time.

## Repository

```text
apps/registry       Next.js registry, docs, playground, and dashboard
apps/cli            skillspace command line
apps/vscode         editor support for skill and agent YAML
packages/schema     Zod schemas and validators
packages/runtime    executor, adapters, permissions, MCP, workflows
packages/database   Prisma schema
packages/sdk-ts     TypeScript SDK
packages/sdk-python Early Python client
packages/lsp        language server
packages/memory-mcp local SQLite memory server
examples            reference v2 skills
```

## Status

The core loop is implemented: validate a manifest, publish it, browse it, download a `.skillpkg`, install it, and run it when a model key is configured.

Also in the tree:

- Registry pages for search, package detail, docs, playground, dashboard, orgs, and analytics.
- CLI commands for install, uninstall, publish (including `--github`), search, info, run, doctor, orgs, workflows, and models.
- Runtime tests for the executor, permissions, sandbox, firewall, MCP startup, and workflows.
- Ten example skills under `examples/`.

Still early:

- The Python SDK is a small client. It is not published to PyPI, and remote `run_skill` calls `/api/run`, which this registry does not implement. Local runs go through the CLI and runtime.
- The TypeScript SDK can define a skill, search the registry, and shell out to the CLI to install. It is not a full publish client.
- `skillspace mcp scaffold` still leaves JSON-RPC parsing as a TODO.
- Prompt-injection scan results are not stored on the package record yet.
- There is no hosted Redis, queue, or paid object storage in the first deploy path. GitHub-backed packages do not need it.

## Setup

Requirements: Node.js 20 or newer, pnpm 10.11.0, and PostgreSQL (local Docker or [Neon](https://neon.tech)).

```bash
pnpm install
cp .env.example .env.local
```

Set `DATABASE_URL` and `BETTER_AUTH_SECRET` (`openssl rand -base64 32`). Provider keys are only needed when you run a model.

```bash
cd packages/database
npx prisma generate
npx prisma db push
cd ../..

pnpm --filter @skillspace/registry dev
```

The registry listens on `http://localhost:3000`. Optional seed:

```bash
npx tsx scripts/seed-registry.ts
```

CLI, from a built checkout:

```bash
pnpm --filter @skillspace/cli build
node apps/cli/dist/index.js doctor
```

## Checks

```bash
pnpm build
pnpm test
pnpm lint
pnpm format:check
```

There is no separate typecheck script. `pnpm build` typechecks each TypeScript package.

## Deployment

Deploy `apps/registry` on Vercel Hobby with Neon Postgres. Required environment variables are `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `NEXT_PUBLIC_APP_URL`. See [docs/SELF_HOSTED.md](docs/SELF_HOSTED.md) and `.env.example`.

The public site is [skillspace.aaaryan.space](https://skillspace.aaaryan.space), a Vercel CNAME. `https://skillspace-registry.vercel.app` currently returns `DEPLOYMENT_NOT_FOUND`. `registry.skillspace.ai` does not resolve. Point new config at the custom domain.

Checked on 16 Nov 2026: static pages such as `/packages` respond. Server routes, including `/` and `/api/health`, return HTTP 500 from that deployment. The Vercel project is not on the team this repository audit could inspect, so function logs were not available from here. A redeploy of `master` with `DATABASE_URL` and `BETTER_AUTH_SECRET` set is the next step on the hosting side.

## Docs

- [Architecture](docs/architecture.md)
- [Schema reference](docs/schema-reference.md)
- [API](docs/api.md)
- [Development](docs/development.md)
- [Self-hosting](docs/SELF_HOSTED.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Examples](examples/)

## License

[MIT](LICENSE)
