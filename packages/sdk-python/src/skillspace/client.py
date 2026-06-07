import os
import httpx
from typing import Optional, Dict, Any, Union

class SkillSpaceClient:
    """
    Official Python SDK for the SkillSpace Platform.
    Allows interacting with the SkillSpace API from Python applications.
    """

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """
        Initialize the SkillSpace client.
        :param api_key: API key. Defaults to SKILLSPACE_API_KEY env var.
        :param base_url: Registry URL. Defaults to SKILLSPACE_REGISTRY_URL or https://registry.skillspace.ai
        """
        self.api_key = api_key or os.environ.get("SKILLSPACE_API_KEY")
        self.base_url = base_url or os.environ.get("SKILLSPACE_REGISTRY_URL", "https://registry.skillspace.ai")
        
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "skillspace-python-sdk/0.1.0"
        }
        
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            
        self._client = httpx.Client(base_url=self.base_url, headers=headers)

    def run_skill(self, package: str, input_data: Union[str, Dict[str, Any]], model: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute a skill package remotely.
        """
        payload = {
            "skill": package,
            "input": input_data
        }
        if model:
            payload["model"] = model
            
        response = self._client.post("/api/run", json=payload)
        response.raise_for_status()
        return response.json()

    def get_package_info(self, package: str) -> Dict[str, Any]:
        """
        Fetch package details from the registry.
        """
        response = self._client.get(f"/api/packages/{package}")
        response.raise_for_status()
        return response.json()

    def close(self):
        """Close the underlying HTTP client."""
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
