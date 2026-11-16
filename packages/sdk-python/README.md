# SkillSpace Python SDK

Early Python client for [SkillSpace](https://skillspace.aaaryan.space). The package is not published to PyPI. Install it from this repository when you need it:

```bash
pip install -e packages/sdk-python
```

## Quick start

```python
from skillspace import SkillSpaceClient

with SkillSpaceClient() as client:
    info = client.get_package_info("@skillspace/code-reviewer")
    print(info)
```

`get_package_info` calls `GET /api/packages/{name}` on the registry.

`run_skill` posts to `/api/run`. That route is not implemented in the registry. Run a package locally with the `skillspace` CLI instead.

## Configuration

- `SKILLSPACE_API_KEY`: bearer token for a private registry.
- `SKILLSPACE_REGISTRY_URL`: registry origin. Defaults to `https://skillspace.aaaryan.space`.

```python
client = SkillSpaceClient(
    api_key="your_token",
    base_url="http://localhost:3000",
)
```

## License

MIT
