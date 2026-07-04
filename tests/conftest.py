"""MIDAS test configuration and shared fixtures."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

FIXTURES_DIR = Path(__file__).parent / "fixtures"


class MockLLMProvider:
    """Mock LLM provider for testing. Implements the LLMProvider protocol.

    Returns canned responses from fixture files based on the agent ID
    extracted from the system prompt. Falls back to a generic response.
    """

    def __init__(self, fixture_map: dict[str, str] | None = None) -> None:
        """Initialize with optional agent-id -> fixture-file mapping."""
        self._fixture_map = fixture_map or {}
        self._calls: list[dict[str, Any]] = []

    async def complete(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
    ) -> dict[str, Any]:
        """Return canned response based on agent identity in system prompt."""
        self._calls.append({
            "model": model,
            "system_prompt": system_prompt,
            "user_prompt": user_prompt,
        })

        # Try to match agent from system prompt
        for agent_key, fixture_file in self._fixture_map.items():
            if agent_key.lower() in system_prompt.lower():
                fixture_path = FIXTURES_DIR / fixture_file
                if fixture_path.exists():
                    return json.loads(fixture_path.read_text())

        # Generic fallback response
        return {
            "content": f"Mock response for prompt: {user_prompt[:100]}...",
            "input_tokens": 100,
            "output_tokens": 50,
            "cost": 0.001,
        }

    @property
    def call_count(self) -> int:
        """Number of calls made to this provider."""
        return len(self._calls)

    @property
    def calls(self) -> list[dict[str, Any]]:
        """All recorded calls."""
        return self._calls


@pytest.fixture()
def mock_provider() -> MockLLMProvider:
    """Create a MockLLMProvider with bookstore fixture mappings."""
    return MockLLMProvider(fixture_map={
        "product manager": "pm_response.json",
        "systems architect": "architect_response.json",
        "backend developer": "developer_response.json",
        "frontend developer": "developer_response.json",
        "database engineer": "architect_response.json",
        "qa engineer": "developer_response.json",
        "devops engineer": "developer_response.json",
    })


@pytest.fixture()
def fixtures_dir() -> Path:
    """Path to the test fixtures directory."""
    return FIXTURES_DIR
