# Chapter 18: Module-by-Module Source Code Tour

This chapter provides a guided tour of the most important files in the repository. If you are a new developer onboarding to the project, read these files in this exact order to build your mental model.

---

## 1. The Core Data Structures
**Start here.** Everything in SkillSpace revolves around these shapes.

*   `packages/schema/src/skill.schema.ts`
    *   Defines the `SkillSchema` using Zod. Look at how `permissions` and `mcpServers` are strictly constrained.
*   `packages/schema/src/agent.schema.ts`
    *   Defines multi-skill agents. Notice the `skills` array which creates the dependency graph.

## 2. The Command Line Interface
**How users interact with the system.**

*   `apps/cli/src/index.ts`
    *   The main entry point. Sets up `commander.js` and wires up the subcommands.
*   `apps/cli/src/commands/run.ts`
    *   Parses input flags, hydrates the config, and calls the `Executor`.
*   `apps/cli/src/commands/install.ts`
    *   The recursive logic for querying the registry, verifying checksums, and unpacking `.skillpkg` files.

## 3. The Execution Engine (The Heart)
**Where the magic happens.**

*   `packages/runtime/src/executor.ts`
    *   Read the `run()` and `runStream()` methods. This file contains the LLM loop, the MCP hydration, and the parsing logic.
*   `packages/runtime/src/permissions.ts`
    *   The `PermissionEnforcer` class. See how it checks the declared `skill.permissions` before allowing operations.

## 4. The Model Adapter Layer (MAL)
**How we talk to LLMs.**

*   `packages/runtime/src/adapters/base.ts`
    *   The `ModelAdapter` interface. Every provider must implement this.
*   `packages/runtime/src/adapters/claude.ts`
    *   The Anthropic implementation. Pay special attention to how it maps the generic `mcpServers` schema into Anthropic's specific `tools` array.

## 5. The Registry Server
**How packages are stored and found.**

*   `apps/registry/prisma/schema.prisma`
    *   The entire relational database schema. Look at `Package`, `PackageVersion`, and `Organization`.
*   `apps/registry/app/api/packages/route.ts`
    *   The Next.js App Router endpoint for `POST /api/packages`. Read how it validates the JWT, parses the uploaded buffer, and interacts with S3.
*   `apps/registry/app/api/packages/[name]/[version]/download/route.ts`
    *   The endpoint that issues the HTTP 302 Redirect to the S3 presigned URL.

## 6. Security and Firewalls
**How we prevent prompt injection.**

*   `packages/runtime/src/firewall/LocalModelScreener.ts`
    *   The code that intercepts input, constructs a metaprompt asking the local model to evaluate for safety, and throws a `FirewallBlockedError` if necessary.
