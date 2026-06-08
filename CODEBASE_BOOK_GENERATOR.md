# 📚 Codebase Book Generator Prompt

> **A reusable, AI-executable prompt that scans any codebase and generates a deeply detailed
> technical book in Markdown — modeled after "The Rust Programming Language" and similar
> authoritative, chapter-by-chapter engineering books. Target output: 5,000+ lines.**

---

## How to Use

1. **Open your AI coding assistant** (Claude Code, Cursor, Windsurf, Aider, etc.) with full access to your project root.
2. **Copy everything inside the `─── PROMPT START ───` / `─── PROMPT END ───` fence** below.
3. **Paste it as a single message** (or a `AGENTS.md` / first-turn instruction).
4. The AI will scan your project, build a mental model, then write the book chapter by chapter.
5. **Pipe or save the output** to `docs/BOOK.md` (e.g. `claude < prompt.txt > docs/BOOK.md`).

> **Tip for Claude Code:** Prefix with `--print` flag for non-interactive output, or run it inside a
> long-context session with `--max-tokens 32000`.

---

```
─── PROMPT START ──────────────────────────────────────────────────────────────
```

# MISSION: Write a Complete Technical Book About This Codebase

You are a **world-class technical writer, software architect, and educator** — a combination of
the authors of "The Rust Programming Language," "Designing Data-Intensive Applications," and
"Clean Code." Your singular mission is to **read every meaningful file in this repository** and
then produce a **comprehensive, publication-quality technical book** about the project in
Markdown format.

The book must be **genuinely useful** — not a glorified README, not auto-generated boilerplate,
but a real book that a **new engineer** could pick up on day one and a **senior engineer** could
use as an authoritative reference. Every chapter must be grounded in the actual source code.
Quote real function signatures. Reference real file paths. Show real configuration keys.

**Minimum output: 5,000 lines of Markdown.** There is no maximum. If the project is large,
write more.

---

## PHASE 1 — RECONNAISSANCE (do this silently before writing a single word of the book)

Before writing anything, execute ALL of the following discovery steps. Do not skip any.
Think of this as research a journalist does before writing a story.

### 1.1 — Map the Repository

```
- List every file and directory from the project root (tree or equivalent)
- Identify the primary programming language(s) and frameworks
- Find the entry point(s): main(), index.ts, app.py, cmd/, bin/, etc.
- Locate all configuration files: .env.example, docker-compose.yml, Makefile,
  package.json / Cargo.toml / pyproject.toml / go.mod / build.gradle, etc.
- Find CI/CD definitions: .github/workflows/, .gitlab-ci.yml, Jenkinsfile, etc.
- Locate all test directories and understand the testing strategy
- Identify any docs/, wiki/, ADR/, or RFC/ folders
```

### 1.2 — Understand the Architecture

```
- Read every file in src/, lib/, app/, packages/, services/, or equivalent
- Trace the request/data lifecycle from entry point to persistence layer and back
- Identify all major modules and their public interfaces (exports, pub fn, __init__.py)
- Detect architectural patterns: MVC, hexagonal, event-driven, microservices, monorepo,
  CQRS, repository pattern, dependency injection, etc.
- Find all inter-module dependencies and draw a mental dependency graph
- Identify shared utilities, helper layers, and cross-cutting concerns
```

### 1.3 — Understand the Data Model

```
- Read every database schema file: *.sql, schema.prisma, models.py, *.migration.*,
  entity files, ORM model definitions
- Map every table/collection/document type and its fields + constraints
- Identify relationships: foreign keys, references, embedded documents
- Find all data transformation layers (DTOs, serializers, mappers)
```

### 1.4 — Understand the API Surface

```
- Read every route/handler/controller file
- List every endpoint with its HTTP method, path, request shape, and response shape
- Identify authentication and authorization mechanisms
- Find rate limiting, validation, and middleware layers
- Read any OpenAPI / Swagger / GraphQL schema files
```

### 1.5 — Understand the Deployment Story

```
- Read Dockerfile(s), docker-compose files, Kubernetes manifests, Helm charts
- Find environment variable usage (grep for process.env, os.environ, env!, config())
- Identify all external services and dependencies (databases, queues, object storage,
  third-party APIs, feature flags)
- Find monitoring, logging, and alerting setup
```

### 1.6 — Understand the Developer Workflow

```
- Read CONTRIBUTING.md, DEVELOPMENT.md, or equivalent
- Find all scripts in package.json scripts, Makefile targets, or justfile recipes
- Understand the branching and release strategy if documented
- Find linting, formatting, and pre-commit hook configuration
```

### 1.7 — Understand Quality & Safety

```
- Read test files deeply — understand what scenarios are covered
- Find security-sensitive code: authentication, token handling, encryption, input validation
- Identify error handling patterns and how failures propagate
- Find any rate limiting, CORS, CSP, or other security headers configuration
```

---

## PHASE 2 — BOOK WRITING

Now write the book. Follow this exact chapter structure. **Every chapter must be long, deeply
detailed, and directly tied to the actual code.** Do not write a chapter if the concept does not
apply to this project — instead, explicitly state why and skip it. But for every concept that
DOES apply, be exhaustive.

Use these Markdown conventions throughout:
- `# Chapter N: Title` for chapters
- `## Section Title` for major sections
- `### Subsection Title` for subsections
- Triple-backtick fenced code blocks with language tags for all code
- `> **Note:**`, `> **Warning:**`, `> **Tip:**` for callout boxes
- `---` horizontal rules between chapters
- Tables for comparisons and reference material
- Numbered lists for sequential steps, bullet lists for non-sequential items

---

### FRONT MATTER

Write the following before Chapter 1:

```markdown
# [Derived Project Name]: A Complete Technical Guide

*From First Principles to Production*

---

**About This Book**

[2–3 paragraphs describing what this book covers, who it is for, and how to use it.
Derive these from what you found in the codebase, not generic text.]

**Who This Book Is For**

[Describe the reader: a new team member, an open-source contributor, a developer
building on top of this project, etc. Be specific to this codebase.]

**How This Book Is Organized**

[A one-paragraph summary of each part/section of the book.]

**Conventions Used in This Book**

[Explain Markdown conventions: code blocks, callout boxes, file path format, etc.]

---

## Table of Contents

[Auto-generate a two-level TOC with all chapters and major sections]

---
```

---

### PART I — FOUNDATIONS

---

#### CHAPTER 1: The Project — What It Is and Why It Exists

This is the "executive overview" chapter. Write it so a technical reader unfamiliar with the
domain can understand the project in full by the end of the chapter.

Required sections:
1. **The Problem This Project Solves** — What real-world problem does this software address?
   Derive from README, domain language in the code, entity names, route names.
2. **The Solution at a Glance** — What does the software actually do? What are its core
   capabilities? What can a user/client/system do with it?
3. **Key Design Decisions** — What major architectural or technology choices were made?
   Example: "Uses PostgreSQL instead of a document store because…", "Chose a monorepo
   because…". Infer from the code if not documented.
4. **Technology Stack** — A detailed table listing every technology, library, and framework
   used, with a one-sentence explanation of the role each plays in the project.
5. **High-Level System Diagram** — A Mermaid or ASCII diagram showing the major components
   and how they connect. Use actual component names from the code.
6. **Repository Structure Explained** — Walk through the top-level directory tree and explain
   what each directory contains and why it exists.
7. **Glossary of Domain Terms** — List every domain-specific term, acronym, or concept used in
   the codebase (entity names, business logic terms, internal jargon) with definitions.

---

#### CHAPTER 2: Getting Started — Your Development Environment

Write this chapter so a brand-new engineer can clone the repo, set up their environment, and
run the project locally with zero prior context. Be explicit. Assume nothing.

Required sections:
1. **Prerequisites** — Every tool that must be installed before anything else. Include exact
   versions if pinned in the project. Include: runtime (Node/Python/Go/Rust/JVM), package
   manager, database, Docker version, any global CLI tools.
2. **Cloning and Initial Setup** — Step-by-step with exact commands.
3. **Environment Configuration** — Walk through every environment variable found in
   `.env.example` or equivalent. For each variable: what it controls, valid values,
   where to get the value (generate locally? from a third-party dashboard? from a teammate?),
   and what breaks if it's wrong.
4. **Installing Dependencies** — Exact commands. Explain what happens under the hood
   (e.g. "This runs `npm install` which downloads X packages into `node_modules/`…").
5. **Database Setup** — How to create the local database, run migrations, and optionally
   seed with test data. Show every command.
6. **Running the Development Server** — Exact command(s). What ports does it listen on?
   What URLs are available? What log output should you expect to confirm it started?
7. **Running Tests** — How to run the full test suite, specific test files, and individual
   tests. What does a passing run look like?
8. **Common Setup Problems and Solutions** — List at least 5 common errors a new developer
   might encounter (derived from the code's requirements: version mismatches, missing env
   vars, port conflicts, migration issues, permission errors) and how to fix each one.
9. **Editor Setup** — Recommended extensions/plugins for VS Code or other editors.
   Reference any `.vscode/` or `.editorconfig` files found.
10. **The Development Loop** — Describe the typical inner loop: make a change → observe
    result → run tests → commit. Mention hot reloading, watch modes, etc.

---

#### CHAPTER 3: Architecture Deep Dive

This is the most important chapter. It must be extremely long and detailed.

Required sections:

1. **Architectural Style** — Name and explain the architectural pattern(s) used. Is this
   a layered architecture? Hexagonal/ports-and-adapters? Event-driven? Domain-driven?
   Show how the codebase reflects the pattern with real directory and file examples.

2. **The Dependency Graph** — Show how modules depend on each other. Use a Mermaid diagram.
   Identify the "core" modules with no external dependencies and the "infrastructure" modules
   that depend on external services.

3. **Request Lifecycle Walkthrough** — Pick the most representative request in the application
   (e.g., a user creating a resource, a data pipeline job, a CLI command) and trace it
   completely from entry point to persistence and back to the caller.
   - Show every function call along the path with file paths and line references
   - Show every transformation the data undergoes
   - Show every I/O operation (DB query, cache read, external HTTP call)
   - Show error handling at each step

4. **Module Breakdown** — For EVERY major module/package/service in the project:
   - Purpose and responsibilities
   - Public interface (what it exports / exposes)
   - Internal structure
   - Key design decisions
   - Dependencies (what it imports / calls)
   - Real code examples

5. **Cross-Cutting Concerns** — Explain how these are handled:
   - Logging: what logger is used, log levels, log format, what is logged
   - Error handling: error types, propagation, how errors reach the user
   - Configuration: how config is loaded, validated, and accessed
   - Authentication/Authorization: mechanisms, token lifecycle, permission checks
   - Validation: where and how input is validated
   - Transactions: how database transactions are managed

6. **State Management** — Where does state live? What is stateful vs. stateless?
   In-memory state, database state, cache state, session state.

7. **Concurrency Model** — How does the application handle concurrent operations?
   Threads, async/await, goroutines, worker pools, queues?

8. **The Twelve Factors Audit** — Evaluate the codebase against each of the 12-factor
   app principles. Be honest. Mark each as ✅ Compliant, ⚠️ Partial, or ❌ Not implemented.

---

#### CHAPTER 4: The Data Model

Required sections:

1. **Data Model Overview** — High-level description of the data model. What are the core
   entities? What is the primary data store? What are secondary stores (cache, search index)?

2. **Entity Reference** — For EVERY table/collection/model:
   ```
   ### EntityName
   **File:** `path/to/model/file`
   **Purpose:** [What real-world concept does this represent?]

   | Field | Type | Nullable | Default | Description |
   |-------|------|----------|---------|-------------|
   | id    | uuid | No       | gen()   | Primary key |
   | ...   | ...  | ...      | ...     | ...         |

   **Indexes:** [List all indexes and why they exist]
   **Constraints:** [Unique constraints, check constraints, foreign keys]
   **Relationships:** [How it relates to other entities]
   **Business Rules:** [Any application-level rules about this entity]
   ```

3. **Entity Relationship Diagram** — A Mermaid ERD showing all entities and their
   relationships with cardinality.

4. **Migration Strategy** — How are database changes applied? What is the migration
   workflow for development and production? Show example migration commands.

5. **Data Access Patterns** — For each entity, what are the most common queries?
   Show the actual ORM calls or raw SQL. Explain any N+1 problems that exist or have
   been avoided.

6. **Data Validation** — At what layer(s) is data validated before writing to the store?
   Show real validation code.

7. **Soft Deletes / Audit Trails** — Does the application use soft deletes, audit columns
   (`created_at`, `updated_at`, `deleted_at`), or versioning? Explain the pattern.

---

### PART II — FEATURE DEEP DIVES

---

#### CHAPTER 5: [Primary Feature Area 1]

> **Instruction:** Identify the 4–6 most significant feature areas in this project. Name each
> chapter after the feature. Examples: "Authentication & Authorization", "The Payment Flow",
> "Real-Time Messaging", "The Job Queue", "Media Processing", "The Admin Dashboard".
> Write one full chapter per feature area.

Required sections for every feature chapter:

1. **Feature Overview** — What does this feature do from the user's perspective?
2. **Data Model for This Feature** — Which entities and fields are involved?
3. **API Endpoints / Interface** — Every route, command, event, or function that is part
   of this feature, with full request/response documentation.
4. **Implementation Walkthrough** — Trace the code for the primary happy path in detail.
5. **Edge Cases and Error Handling** — What can go wrong? How is it handled?
6. **Security Considerations** — What security properties does this feature have or need?
7. **Testing This Feature** — What tests exist? What scenarios are covered? Show example
   test code.
8. **Known Limitations** — What does this feature NOT do? What are the known issues?
9. **Code Examples** — Working, copy-pasteable examples of using this feature.

---

#### CHAPTER 6: [Primary Feature Area 2]

*(Same structure as Chapter 5)*

---

#### CHAPTER 7: [Primary Feature Area 3]

*(Same structure as Chapter 5)*

---

#### CHAPTER 8: [Primary Feature Area 4]

*(Same structure as Chapter 5)*

---

#### CHAPTER 9: [Primary Feature Area 5 — if applicable]*

*(Same structure as Chapter 5)*

---

### PART III — THE API REFERENCE

---

#### CHAPTER 10: Complete API Reference

Write this chapter so it can serve as a standalone API reference document. Cover EVERY
endpoint / exported function / CLI command in the project.

Required sections:

1. **API Overview** — Base URL, versioning scheme, content types, authentication scheme.

2. **Authentication** — How to obtain credentials. How to include them in requests.
   Token lifecycle: obtain → use → refresh → revoke. Show real request examples.

3. **Error Responses** — The global error format. Every error code and what it means.
   Show real error response examples.

4. **Rate Limiting and Quotas** — If applicable, explain the rate limiting strategy.

5. **Endpoint Reference** — For EVERY endpoint:
   ```
   ### METHOD /path/to/endpoint
   **Description:** [What this endpoint does]
   **Authentication:** Required / Optional / None
   **Rate Limit:** [If applicable]

   **Path Parameters:**
   | Parameter | Type   | Description |
   |-----------|--------|-------------|
   | id        | string | Resource ID |

   **Query Parameters:**
   | Parameter | Type    | Required | Default | Description |
   |-----------|---------|----------|---------|-------------|
   | limit     | integer | No       | 20      | Max results |

   **Request Body:** (if applicable)
   ```json
   {
     "field": "value"
   }
   ```

   **Response (200 OK):**
   ```json
   {
     "field": "value"
   }
   ```

   **Error Responses:**
   | Status | Code              | Description           |
   |--------|-------------------|-----------------------|
   | 400    | VALIDATION_ERROR  | Invalid request body  |
   | 404    | NOT_FOUND         | Resource not found    |

   **Example:**
   ```bash
   curl -X METHOD https://api.example.com/path \
     -H "Authorization: Bearer TOKEN" \
     -d '{"field": "value"}'
   ```
   ```

6. **Pagination** — If the API uses cursor or offset pagination, explain the pattern and
   show how to paginate through a full result set.

7. **Webhook Reference** — If the project emits webhooks, document every event type,
   its payload shape, and how to verify signatures.

---

### PART IV — CONFIGURATION & OPERATIONS

---

#### CHAPTER 11: Configuration Reference

Required sections:

1. **Configuration Architecture** — How is configuration loaded? What is the priority order
   (environment variables vs. config files vs. defaults)? What library/pattern is used?

2. **Complete Environment Variable Reference** — For EVERY environment variable in the project:
   ```
   | Variable                 | Required | Default       | Description                          |
   |--------------------------|----------|---------------|--------------------------------------|
   | DATABASE_URL             | Yes      | —             | PostgreSQL connection string          |
   | JWT_SECRET               | Yes      | —             | Secret for signing JWTs (min 32 chars)|
   | PORT                     | No       | 3000          | HTTP server port                      |
   ```

   Below the table, write a full prose section for EVERY variable that has non-obvious
   behavior: valid value formats, security implications, how to generate good values,
   what breaks if it's misconfigured.

3. **Configuration for Different Environments** — Development vs. staging vs. production
   configuration differences. What changes between environments?

4. **Secrets Management** — How to handle secrets safely. What should NEVER be committed.
   Recommendations for secret rotation.

5. **Feature Flags** — If the project has feature flags, document every flag, its purpose,
   and its default state.

---

#### CHAPTER 12: Testing Strategy

Required sections:

1. **Testing Philosophy** — What is the project's approach to testing? What testing pyramid
   does it follow?

2. **Test Infrastructure** — What testing frameworks and libraries are used?
   How is the test database set up? Are there test fixtures or factories?

3. **Unit Tests** — Where are unit tests? What do they test? Show representative examples
   from the actual test files.

4. **Integration Tests** — Where are integration tests? What do they test? Show examples.
   How do they interact with real databases or services?

5. **End-to-End Tests** — If E2E tests exist, explain the setup and show examples.

6. **Test Coverage** — What coverage does the project have? How is it measured? What areas
   are well-covered vs. under-tested?

7. **Running Tests in CI** — Show the exact CI commands. Explain how the test environment
   is set up in CI vs. locally.

8. **Writing New Tests** — A practical guide: how to add a new test for a new feature.
   Templates and patterns used in the project.

9. **Testing Difficult Things** — How does the project test: async operations, external
   services (mocks? VCR? test doubles?), time-dependent code, file system operations?

---

#### CHAPTER 13: Deployment Guide

Required sections:

1. **Deployment Architecture** — What does the production deployment look like?
   Draw a Mermaid diagram showing services, load balancers, databases, caches.

2. **Docker / Containerization** — Walk through every `Dockerfile` in the project.
   Explain every instruction. Explain multi-stage builds if present.
   Show how to build and run containers locally.

3. **Docker Compose** — Walk through `docker-compose.yml` service by service.
   Explain every service, port mapping, volume, and network configuration.

4. **Infrastructure as Code** — If Kubernetes, Helm, Terraform, Pulumi, or similar files
   exist, explain them in detail.

5. **CI/CD Pipeline** — Walk through the entire CI/CD pipeline. Show every job and step.
   Explain what triggers deployments. Explain rollback procedures.

6. **Environment Promotion** — How does code go from development → staging → production?
   What gates exist (manual approvals, automated checks)?

7. **Database Migrations in Production** — How are migrations applied safely in production?
   Zero-downtime migration strategies.

8. **Scaling** — How does the application scale horizontally? What is stateful and must
   be handled carefully during scaling?

9. **Health Checks and Readiness** — What health check endpoints exist? What do they check?
   How are they used by load balancers or orchestrators?

10. **Monitoring and Observability** — What metrics, logs, and traces are emitted?
    What dashboards or alerts should be set up? What does a healthy system look like in
    metrics?

11. **Runbook: Common Operations** — Step-by-step procedures for:
    - Deploying a new version
    - Rolling back a bad deployment
    - Running a database migration
    - Restarting a service
    - Rotating a secret
    - Investigating a performance issue
    - Handling a database connection pool exhaustion

---

#### CHAPTER 14: Security Guide

Required sections:

1. **Security Model Overview** — What are the security boundaries of this application?
   What is trusted? What is untrusted? What data is sensitive?

2. **Authentication Deep Dive** — The complete authentication flow. Token types, storage,
   expiry, refresh, and revocation. Show the actual code.

3. **Authorization Deep Dive** — How permissions are checked. Role-based access control,
   attribute-based access control, or ad-hoc checks? Show the actual middleware/guards.

4. **Input Validation and Sanitization** — Where and how is all user input validated?
   Show validation schemas. What injection attacks are defended against?

5. **Secrets and Sensitive Data** — How are secrets handled in code? How is sensitive
   data stored? Is PII encrypted at rest?

6. **HTTP Security Headers** — What security headers does the application set?
   CORS policy, CSP, HSTS, X-Frame-Options, etc.

7. **Dependency Security** — How are dependency vulnerabilities tracked? Is there
   automated scanning (Dependabot, Snyk, `npm audit`)?

8. **Security Checklist** — A checklist of security properties, marked as ✅ Implemented,
   ⚠️ Partial, or ❌ Missing.

9. **Known Security Considerations** — What are the known security trade-offs or areas
   that need attention?

---

### PART V — DEVELOPER GUIDE

---

#### CHAPTER 15: Code Style and Conventions

Required sections:

1. **Language-Specific Style** — What style guide does the project follow?
   What linter/formatter is configured? Show `.eslintrc`, `rustfmt.toml`, `pyproject.toml`
   formatting config, etc.

2. **Naming Conventions** — How are files, directories, functions, variables, types,
   constants, and database fields named? Give examples from the actual code.

3. **File Organization Conventions** — How are files organized within modules?
   What goes in `index.ts` / `mod.rs` / `__init__.py`? How are imports ordered?

4. **Error Handling Conventions** — How should new errors be created and propagated?
   Show the pattern with real examples.

5. **Logging Conventions** — What should be logged? At what level? In what format?
   Show examples of good log statements from the codebase.

6. **Comment and Documentation Conventions** — When should code be commented?
   What documentation style is used (JSDoc, rustdoc, docstring)?

7. **Testing Conventions** — How should tests be named? How should test files be
   organized? What patterns are used (AAA, Given/When/Then)?

---

#### CHAPTER 16: Contributing to This Project

Required sections:

1. **Development Workflow** — The full contribution workflow from start to finish:
   fork → branch → develop → test → lint → PR → review → merge.

2. **Branching Strategy** — What branch naming conventions are used? What is the
   main/develop/release branch structure?

3. **Commit Message Format** — What commit message format is expected?
   Conventional Commits? Custom format? Show examples.

4. **Pull Request Process** — What does a good PR look like? What must be included?
   What is the review process?

5. **Adding a New Feature — Step by Step** — A complete walkthrough of how to add a
   realistic new feature to this codebase, following all conventions. Trace every file
   that needs to be touched: route → controller → service → repository → model → test.

6. **Adding a New API Endpoint — Step by Step** — Similar walkthrough for a new endpoint.

7. **Adding a Database Migration — Step by Step** — Exact commands and file changes needed
   to add a new migration.

8. **Code Review Checklist** — What reviewers should check before approving a PR.

---

### PART VI — INTERNALS & ADVANCED TOPICS

---

#### CHAPTER 17: Performance Guide

Required sections:

1. **Performance Characteristics** — What are the known performance constraints of the
   application? Where are the bottlenecks?

2. **Database Query Performance** — Show the most expensive queries. Explain the indexes
   that optimize them. How to use EXPLAIN/ANALYZE.

3. **Caching Strategy** — What is cached? How? What is the cache invalidation strategy?
   Cache hit/miss patterns.

4. **Connection Pooling** — How are database connections pooled? What are the pool settings?
   How to tune them.

5. **Async and I/O Patterns** — How does the application maximize I/O concurrency?
   Patterns for parallel vs. sequential async operations.

6. **Profiling and Benchmarking** — How to profile the application locally. What tools
   to use. How to run benchmarks.

7. **Performance Checklist** — Known optimizations implemented and known improvements
   still needed.

---

#### CHAPTER 18: Error Handling and Resilience

Required sections:

1. **Error Type Hierarchy** — What error types exist? Show the type definitions.
   How do domain errors differ from infrastructure errors?

2. **Error Propagation** — How do errors flow from the deepest layer to the API response?
   Show the full chain with real code.

3. **User-Facing Error Messages** — How are internal errors translated to safe, meaningful
   messages for end users?

4. **Retry Logic** — Are there any retry mechanisms? What operations are retried?
   What backoff strategy is used?

5. **Circuit Breakers and Fallbacks** — Are there circuit breakers for external calls?
   What is the fallback behavior?

6. **Graceful Shutdown** — How does the application shut down cleanly? What signals does
   it handle? What cleanup happens?

7. **Observability of Errors** — How are errors tracked in production? Sentry, Datadog,
   custom logging?

---

#### CHAPTER 19: Module-by-Module Source Code Tour

This is the "code reading" chapter. Walk through the source code file by file (for every
significant file), explaining:

- What the file does
- Why it exists as a separate file
- The key functions/classes/types defined
- How it interacts with other files
- Interesting implementation details or non-obvious decisions
- Any technical debt or TODOs worth noting

Format each file as:

```markdown
### `path/to/file.ext`

**Purpose:** [One sentence]
**Imports from:** [Other project files this depends on]
**Exported symbols:** [Functions, types, constants exported]

[Explanation of the key code with inline quotes]

**Key function: `functionName(param: Type): ReturnType`**
[Explain what this function does, its algorithm, edge cases]

**Note:** [Any important design decisions or gotchas]
```

---

### PART VII — REFERENCE

---

#### CHAPTER 20: Complete Dependency Reference

For EVERY external dependency in `package.json`, `Cargo.toml`, `requirements.txt`,
`go.mod`, etc.:

| Package | Version | Role | Why This Package |
|---------|---------|------|-----------------|
| express | 4.18.2 | HTTP framework | Routing and middleware |
| ... | ... | ... | ... |

For any dependency where the choice is non-obvious (e.g., "Why Zod and not Yup?",
"Why Prisma and not TypeORM?"), explain the reasoning if it can be inferred from the code
or surrounding context.

---

#### CHAPTER 21: Scripts and Tooling Reference

For EVERY script in `package.json`, `Makefile`, `justfile`, or similar:

| Script | Command | Description | When to Use |
|--------|---------|-------------|-------------|
| dev | npm run dev | Start dev server | During development |
| ... | ... | ... | ... |

For every significant script, show what the underlying command does and how it works.

---

#### CHAPTER 22: Troubleshooting Guide

A comprehensive troubleshooting reference. For every type of problem that can arise:

1. **Application Won't Start** — Checklist of causes and fixes.
2. **Database Connection Failures** — Diagnose and fix connection issues.
3. **Authentication Not Working** — How to debug token issues.
4. **Tests Failing** — Common test failure patterns and fixes.
5. **Slow Queries** — How to identify and fix slow database queries.
6. **Memory Leaks** — How to detect and investigate.
7. **Build Failures** — Common build errors and fixes.
8. **Docker Issues** — Container startup, networking, and volume problems.
9. **CI Failures** — Common CI failure patterns.
10. **Production Incidents** — How to approach common production issues.

Each problem should include: **Symptoms**, **Likely Causes**, **Diagnostic Steps**,
**Resolution**.

---

#### CHAPTER 23: Changelog and Evolution

If the project has a `CHANGELOG.md`, `HISTORY.md`, commit history, or ADR folder:

1. **Project History** — How did the project evolve? What were major versions/milestones?
2. **Architectural Decisions** — What major decisions were made and why? (Read any ADR
   files. If no ADRs exist, infer from the code structure.)
3. **Known Technical Debt** — What are the known shortcuts, TODOs, and areas for
   improvement? Derive from comments and TODO/FIXME/HACK markers in the code.
4. **Future Roadmap** — If any roadmap or milestone documents exist, summarize them.

---

### BACK MATTER

---

#### APPENDIX A: Quick Reference Card

A one-page summary (but in Markdown) with:
- The most-used commands (dev, test, build, deploy)
- Key environment variables
- Important file paths
- Useful debugging commands
- Contact/team information (if in README)

---

#### APPENDIX B: Glossary

An alphabetically sorted complete glossary of all technical terms, domain terms, and
project-specific jargon encountered in the codebase. Every term should have a 1–3 sentence
definition in plain English. Aim for 50+ terms.

---

#### APPENDIX C: Index of Source Files

A complete alphabetical listing of every source file in the project with a one-line
description of its purpose. Format:

```
src/auth/middleware.ts — JWT verification middleware; validates Bearer tokens on protected routes
src/auth/service.ts    — Authentication business logic; handles login, registration, refresh
...
```

---

#### APPENDIX D: Frequently Asked Questions

Generate at least 20 realistic FAQs that a new developer might have about this project.
Derive them from the code's complexity, unusual patterns, or configuration requirements.
Format as Q&A pairs.

---

#### APPENDIX E: External Resources

Any external documentation, RFCs, specifications, blog posts, or papers referenced in the
code (from comments, README links, or `package.json` homepage fields).

---

## QUALITY REQUIREMENTS

These are non-negotiable. Do not submit output that violates any of them.

1. **Grounded in reality:** Every code example, file path, function name, and configuration
   key must come from the actual codebase. Do NOT invent examples.

2. **Completeness:** Every chapter listed above must be written. A chapter may be short
   (with explanation of why) but it must be present.

3. **Depth:** Surface-level descriptions are unacceptable. The reader must understand HOW
   things work, not just WHAT they are.

4. **No filler:** Do not pad sections with generic advice unrelated to this project. Every
   sentence should teach the reader something specific about THIS codebase.

5. **Working code examples:** All code examples must be syntactically correct and reflect
   the actual codebase idioms.

6. **Honest assessment:** If the project has technical debt, security gaps, or incomplete
   features, say so clearly. A book that pretends the codebase is perfect is useless.

7. **Length:** The book must be at least 5,000 lines of Markdown. More is better.
   There is no maximum.

8. **One output:** Produce the entire book in a single continuous Markdown output, suitable
   for saving directly as `BOOK.md`.

---

BEGIN. Start with the front matter, then work through every chapter in order.
Do not ask clarifying questions. If something is ambiguous in the code, state your assumption
and proceed. The goal is a complete book, not a perfect one.

```
─── PROMPT END ────────────────────────────────────────────────────────────────
```

---

## Tips for Best Results

### For Claude Code
```bash
# Run non-interactively and save output
claude --print < CODEBASE_BOOK_GENERATOR.md > docs/BOOK.md

# Or in an interactive session, paste the prompt then:
# > pipe output to docs/BOOK.md
```

### For Cursor / Windsurf
- Open the prompt in the AI chat panel
- Make sure "codebase context" or "full repo" indexing is enabled
- Use the `@codebase` or `@workspace` prefix if available

### For Aider
```bash
aider --message "$(cat CODEBASE_BOOK_GENERATOR.md)" \
      --no-auto-commits \
      --output docs/BOOK.md
```

### For OpenAI Assistants / GPT-4
- Upload the entire codebase as a file attachment or use the Files API
- Paste the prompt as the user message
- Set `max_tokens` to the maximum available (prefer 32k+ context)

---

## Customization

You can add project-specific context before the `BEGIN.` line to help the AI:

```
## ADDITIONAL CONTEXT

- This is a B2B SaaS product for logistics companies
- The primary users are warehouse managers, not developers
- "Order" and "Shipment" are the two core domain entities
- The team uses Conventional Commits and trunk-based development
- There is a companion mobile app (not in this repo) that consumes this API
```

The more context you provide, the better the "why" sections of each chapter will be.

---

## Expected Output Structure

When complete, your `BOOK.md` should have roughly this structure:

```
Front Matter (~100 lines)
Table of Contents (~80 lines)
Part I: Foundations
  Chapter 1: Project Overview (~300 lines)
  Chapter 2: Getting Started (~400 lines)
  Chapter 3: Architecture (~600 lines)
  Chapter 4: Data Model (~400 lines)
Part II: Feature Deep Dives
  Chapter 5–9: Features (~300 lines each = ~1,500 lines)
Part III: API Reference
  Chapter 10: API (~500 lines)
Part IV: Configuration & Operations
  Chapter 11: Configuration (~200 lines)
  Chapter 12: Testing (~300 lines)
  Chapter 13: Deployment (~400 lines)
  Chapter 14: Security (~250 lines)
Part V: Developer Guide
  Chapter 15: Code Style (~150 lines)
  Chapter 16: Contributing (~300 lines)
Part VI: Internals
  Chapter 17: Performance (~200 lines)
  Chapter 18: Error Handling (~200 lines)
  Chapter 19: Source Code Tour (~400 lines)
Part VII: Reference
  Chapter 20: Dependencies (~200 lines)
  Chapter 21: Scripts (~100 lines)
  Chapter 22: Troubleshooting (~300 lines)
  Chapter 23: Changelog (~150 lines)
Appendices A–E (~400 lines)
─────────────────────────────
Total: ~7,630 lines minimum
```

---

*Generated by Claude · Anthropic · 2026*
*This prompt may be freely modified and reused for any project.*
