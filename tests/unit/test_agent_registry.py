"""Tests for midas_core.agents.registry."""

from pathlib import Path

import pytest
from mds_common.exceptions.base import AgentError
from midas_core.agents.registry import AgentRegistry

SAMPLE_AGENT_YAML = """\
id: test-agent
name: Test Agent
role: Testing
persona:
  backstory: A test agent for unit tests.
  communication_style: Direct and precise.
  expertise_areas:
    - testing
capabilities:
  - run tests
constraints:
  - never skip tests
model_preference: sonnet
cost_limit_per_task: 0.02
"""


class TestAgentRegistry:
    def test_load_from_directory(self, tmp_path: Path) -> None:
        (tmp_path / "test-agent.yaml").write_text(SAMPLE_AGENT_YAML)
        registry = AgentRegistry()
        count = registry.load_from_directory(tmp_path)
        assert count == 1
        assert registry.count == 1

    def test_get_agent(self, tmp_path: Path) -> None:
        (tmp_path / "test-agent.yaml").write_text(SAMPLE_AGENT_YAML)
        registry = AgentRegistry()
        registry.load_from_directory(tmp_path)
        agent = registry.get("test-agent")
        assert agent.name == "Test Agent"
        assert agent.role == "Testing"
        assert "testing" in agent.persona.expertise_areas

    def test_get_nonexistent_raises(self) -> None:
        registry = AgentRegistry()
        with pytest.raises(AgentError, match="not registered"):
            registry.get("nonexistent")

    def test_list_agents(self, tmp_path: Path) -> None:
        (tmp_path / "test-agent.yaml").write_text(SAMPLE_AGENT_YAML)
        registry = AgentRegistry()
        registry.load_from_directory(tmp_path)
        assert "test-agent" in registry.list_agents()

    def test_invalid_yaml_raises(self, tmp_path: Path) -> None:
        (tmp_path / "bad.yaml").write_text("id: Bad-Id\nname: Bad\n")
        registry = AgentRegistry()
        with pytest.raises(AgentError, match="Failed to load"):
            registry.load_from_directory(tmp_path)

    def test_empty_directory(self, tmp_path: Path) -> None:
        registry = AgentRegistry()
        count = registry.load_from_directory(tmp_path)
        assert count == 0
