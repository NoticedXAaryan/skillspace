# SkillSpace Python SDK

The official Python SDK for the [SkillSpace](https://skillspace.ai) platform. SkillSpace is a universal runtime and registry for agentic AI capabilities.

## Installation

```bash
pip install skillspace
```

## Quick Start

```python
from skillspace import SkillSpaceClient

# The client automatically picks up SKILLSPACE_API_KEY from your environment
with SkillSpaceClient() as client:
    # Run a skill from the registry
    result = client.run_skill(
        package="sql-optimizer",
        input_data="SELECT * FROM users WHERE age > 20",
        model="openai/gpt-4o"
    )
    
    print(f"Optimized SQL:\n{result['output']}")
    print(f"Tokens used: {result['usage']['total_tokens']}")
```

## Configuration

You can configure the client using environment variables:
- `SKILLSPACE_API_KEY`: Your authentication token (if querying a private registry).
- `SKILLSPACE_REGISTRY_URL`: The base URL of the registry (defaults to `https://registry.skillspace.ai`).

Alternatively, pass them directly to the client:

```python
client = SkillSpaceClient(
    api_key="your_token",
    base_url="http://localhost:3000"
)
```

## License
MIT
