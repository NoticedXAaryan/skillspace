# Chapter 8: CLI Commands Deep Dive

This chapter provides an exhaustive breakdown of every command available in the SkillSpace Command Line Interface (`apps/cli`). The CLI is built using `commander.js` and acts as the primary user interface for the entire ecosystem. 

Each command is detailed below, exploring its flags, standard behavior, edge cases, and exactly what happens under the hood in the source code.

---

## 1. Project Initialization & Auth Commands

### `skillspace init`
**Source:** `apps/cli/src/commands/init.ts`
**Purpose:** Bootstraps a new SkillSpace capability project in the current working directory.
**Flags:**
*   `-y, --yes`: Skips the interactive prompts and assumes defaults based on the directory name.

**What happens under the hood:**
1.  The command checks if a `skill.yaml` already exists in `process.cwd()`. If it does, it exits with an error.
2.  It uses `inquirer` to prompt the user for the project name, description, author, and category.
3.  It generates a standard `skill.yaml` manifest containing a basic `instructions.system` prompt and an empty `permissions` array.
4.  It calls `ensureSkillspaceDir()` to ensure the `~/.skillspace` global cache directory exists.

### `skillspace login`
**Source:** `apps/cli/src/commands/login.ts`
**Purpose:** Authenticates the CLI with the Registry Server to allow publishing of packages.

**What happens under the hood:**
The command prompts the user for a Personal Access Token (JWT) retrieved from the Web Dashboard. It then stores this token securely in plain text at `~/.skillspace/credentials`. Subsequent commands (like `publish`) will read this file.

### `skillspace whoami`
**Source:** `apps/cli/src/commands/login.ts`
**Purpose:** Verifies the current authentication state.

**What happens under the hood:**
Reads the `~/.skillspace/credentials` file, extracts the JWT, and makes an HTTP `GET /api/auth/me` request to the registry. It prints the authenticated username.

---

## 2. Configuration Commands

### `skillspace model add <provider>`
**Source:** `apps/cli/src/commands/model.ts`
**Purpose:** Configures an API key for a specific LLM provider (e.g., `openai`, `anthropic`).

**What happens under the hood:**
Prompts the user securely for an API key. It then modifies `~/.skillspace/config.yaml`, inserting the key under the appropriate provider namespace.

### `skillspace model test <provider>`
**Purpose:** Validates that the stored API key is working.
**What happens under the hood:**
The CLI triggers a tiny, hardcoded test payload to the provider's API via the specific `ModelAdapter` inside the SSR. If it returns `200 OK`, it prints a success message.

### `skillspace model list`
**Purpose:** Lists all currently configured providers and your `default_model`.

---

## 3. Package Management Commands

### `skillspace install <package>`
**Source:** `apps/cli/src/commands/install.ts`
**Purpose:** Downloads a capability and its dependencies, making them available for local execution.
**Flags:**
*   `-v, --version <version>`: Explicitly request a specific semver release.

**What happens under the hood:**
1.  Iterates through configured registries (`getRegistries()`).
2.  Fetches the package metadata to resolve the highest matching version.
3.  Downloads the `.skillpkg` tarball into memory.
4.  Computes the `sha256` checksum and verifies it against the registry's reported checksum.
5.  Extracts the files into `~/.skillspace/registry/<name>@<version>/`.
6.  If the manifest is an `agent.yaml`, it recursively parses the `skills` array and recursively triggers the install loop for all dependencies.
7.  Updates or creates a `skillspace.lock` file in the current directory.

### `skillspace uninstall <package>`
**Source:** `apps/cli/src/commands/uninstall.ts`
**Purpose:** Removes a package from the local cache.
**What happens under the hood:**
Simply deletes the specific folder under `~/.skillspace/registry/` and removes the entry from the `skillspace.lock` file.

### `skillspace list`
**Source:** `apps/cli/src/commands/list.ts`
**Purpose:** Shows all capabilities currently cached on your machine.
**What happens under the hood:**
Scans `~/.skillspace/registry/`, reading every `skill.yaml` to extract the versions, rendering them in a formatted table.

---

## 4. Execution Commands

### `skillspace run <package>`
**Source:** `apps/cli/src/commands/run.ts`
**Purpose:** Executes a cached skill or agent against a given input.
**Flags:**
*   `--input <path|string>`: The data to inject into the `{{input}}` block of the skill.
*   `--model <provider/model-id>`: Overrides the `default_model` specified in config.
*   `--output <path>`: Writes the LLM response to a specific file.
*   `--config <key=value>`: Overrides runtime config (e.g., `temperature=0.7`).

**What happens under the hood:**
As extensively covered in Chapter 5, the `run` command is just a wrapper that invokes `Executor.runStream()` or `Executor.run()` from `@skillspace/runtime`. The CLI simply pipes the asynchronous generator output to `process.stdout.write()`.

---

## 5. Discovery & Publishing Commands

### `skillspace search <query>`
**Source:** `apps/cli/src/commands/search.ts`
**Purpose:** Finds packages in the remote registry.
**What happens under the hood:**
Executes an HTTP `GET /api/search?q=<query>`. The registry performs a full-text search against the package name, description, and tags, returning the top 10 results. The CLI renders these in a table.

### `skillspace info <package>`
**Source:** `apps/cli/src/commands/info.ts`
**Purpose:** Displays detailed metadata about a package, including its README and dependencies.
**What happens under the hood:**
Fetches the package manifest and README from the registry and renders the markdown directly in the terminal using a library like `marked-terminal`.

### `skillspace publish`
**Source:** `apps/cli/src/commands/publish.ts`
**Purpose:** Packages the current directory and pushes it to the registry.
**What happens under the hood:**
1.  Reads the local `skill.yaml` and parses it through the strict `validateSkill()` Zod schema. If validation fails, the publish is aborted.
2.  Ensures required fields exist: At least one `example` must be provided, and `tests` must be passing (if evaluation datasets are defined).
3.  Tars and gzips the directory into a `.skillpkg` file.
4.  Sends an authenticated `POST /api/packages` request to the registry containing the buffer.

---

## 6. Advanced Subcommands

The CLI also exposes advanced commands intended for complex use cases:

*   **`skillspace agent ...`**: Similar to `skill`, but operates exclusively on `agent.yaml` files.
*   **`skillspace mcp ...`**: Manages the installation and testing of standalone MCP server packages.
*   **`skillspace workflow ...`**: Manages multi-agent orchestrated workflows.
*   **`skillspace org ...`**: Enterprise commands for managing organization members and Package Allowlists.
*   **`skillspace env ...`**: Commands for exporting and importing `.env` or `skillspace.lock` states across machines.
*   **`skillspace benchmark ...`**: Runs evaluation datasets defined in `skill.yaml` against a target model to calculate a quality score.
