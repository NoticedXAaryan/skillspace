# SkillSpace CLI Commands


## `skillspace init`

`	ext
Usage: skillspace init [options]

Initialize a new SkillSpace project in the current directory

Options:
  -y, --yes   Skip prompts and use defaults
  -h, --help  display help for command
``n

## `skillspace login`

`	ext
Usage: skillspace login [options]

Authenticate with the SkillSpace registry

Options:
  -e, --email <email>        Your email address
  -p, --password <password>  Your password
  -h, --help                 display help for command
``n

## `skillspace register`

`	ext
Usage: skillspace register [options]

Create a new SkillSpace account

Options:
  -u, --username <username>  Username (3-39 chars, alphanumeric)
  -e, --email <email>        Your email address
  -p, --password <password>  Password (min 8 chars)
  -h, --help                 display help for command
``n

## `skillspace logout`

`	ext
Usage: skillspace logout [options]

Clear stored credentials

Options:
  -h, --help  display help for command
``n

## `skillspace whoami`

`	ext
Usage: skillspace whoami [options]

Show currently authenticated user

Options:
  -h, --help  display help for command
``n

## `skillspace model`

`	ext
Usage: skillspace model [options] [command]

Manage model provider configurations

Options:
  -h, --help                display help for command

Commands:
  add [options] <provider>  Configure an API key for a model provider (openai,
                            anthropic, gemini, ollama)
  list                      List all configured model providers
  default <modelId>         Set the default model (e.g., ollama/llama3.2)
  test <modelId>            Test a model by sending a simple prompt
  help [command]            display help for command
``n

## `skillspace install`

`	ext
Usage: skillspace install [options] <package>

Install a skill package from the registry

Options:
  -v, --version <version>  Specific version to install
  -h, --help               display help for command
``n

## `skillspace run`

`	ext
Usage: skillspace run [options] <skill>

Execute a skill or agent against an input

Options:
  -i, --input <input>       Input text or file path
  -m, --model <model>       Model to use (e.g., ollama/llama3.2)
  -o, --output <file>       Write output to file
  -t, --temperature <temp>  Override temperature
  --max-tokens <tokens>     Override max tokens
  --stream                  Stream output in real-time
  -h, --help                display help for command
``n

## `skillspace search`

`	ext
Usage: skillspace search [options] <query>

Search for skills in the registry

Options:
  -t, --type <type>  Filter by type (skill, agent, workflow)
  -h, --help         display help for command
``n

## `skillspace publish`

`	ext
Usage: skillspace publish [options]

Publish the current directory as a skill package

Options:
  -d, --dir <dir>  Directory to publish (default: ".")
  --private        Publish as a private package (requires org scope) (default:
                   false)
  -h, --help       display help for command
``n

## `skillspace list`

`	ext
Usage: skillspace list|ls [options]

List all locally installed skill packages

Options:
  -h, --help  display help for command
``n

## `skillspace uninstall`

`	ext
Usage: skillspace uninstall|remove [options] <package>

Remove a locally installed skill package

Options:
  -v, --version <version>  Specific version to remove (removes all if omitted)
  -h, --help               display help for command
``n

## `skillspace info`

`	ext
Usage: skillspace info [options] <package>

Show detailed information about a package

Options:
  -h, --help  display help for command
``n

## `skillspace benchmark`

`	ext
Usage: skillspace benchmark [options] <suite_path>

Run a benchmark test suite against a package

Options:
  -h, --help  display help for command
``n

## `skillspace agent`

`	ext
Usage: skillspace agent [options] [command]

Manage and execute agents

Options:
  -h, --help                                  display help for command

Commands:
  run [options] <agent> [positionalInput...]  Run an agent
  install <agent>                             Install an agent and its dependencies
  list                                        List installed agents
  help [command]                              display help for command
``n

## `skillspace mcp`

`	ext
Usage: skillspace mcp [options] [command]

Manage MCP servers

Options:
  -h, --help                  display help for command

Commands:
  install [options] <server>  Install an MCP server configuration
  list                        List installed MCP servers
  update <server>             Update an MCP server
  help [command]              display help for command
``n

## `skillspace workflow`

`	ext
Usage: skillspace workflow [options] [command]

Manage and run multi-step workflows

Options:
  -h, --help            display help for command

Commands:
  run [options] <name>  Run a workflow defined in workflow.yaml
  list                  List available workflows
  help [command]        display help for command
``n

## `skillspace org`

`	ext
Usage: skillspace org [options] [command]

Manage organizations and teams

Options:
  -h, --help               display help for command

Commands:
  create [options] <name>  Create a new organization
  invite [options] <slug>  Generate an invite link for an organization
  join <token>             Join an organization using an invite token
  help [command]           display help for command
``n

## `skillspace environment`

`	ext
Usage: skillspace environment|env [options] [command]

Manage skillspace environments

Options:
  -h, --help        display help for command

Commands:
  export [options]  Export the currently installed capabilities to
                    environment.yaml
  import <file>     Install all capabilities listed in an environment.yaml
  help [command]    display help for command
``n

