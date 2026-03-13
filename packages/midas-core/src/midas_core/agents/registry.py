"""Agent registry — loads and manages agent definitions from YAML."""

from pathlib import Path

import structlog
from mds_common.exceptions.base import AgentError
from mds_common.schemas.agent import AgentSpec
from mds_common.utils.yaml_loader import load_yaml

logger = structlog.get_logger()


class AgentRegistry:
    """Loads and manages agent definitions from YAML files."""

    def __init__(self) -> None:
        self._agents: dict[str, AgentSpec] = {}

    def load_from_directory(self, agent_dir: Path) -> int:
        """Load all .yaml agent definitions from a directory."""
        count = 0
        for yaml_file in sorted(agent_dir.glob("*.yaml")):
            try:
                raw = load_yaml(yaml_file)
                spec = AgentSpec(**raw)
                self._agents[spec.id] = spec
                count += 1
                logger.debug("agent_loaded", agent_id=spec.id, file=str(yaml_file))
            except Exception as e:
                logger.error("agent_load_failed", file=str(yaml_file), error=str(e))
                raise AgentError(f"Failed to load agent from {yaml_file}: {e}") from e
        logger.info("agents_loaded", count=count, directory=str(agent_dir))
        return count

    def get(self, agent_id: str) -> AgentSpec:
        """Get an agent spec by ID."""
        if agent_id not in self._agents:
            raise AgentError(f"Agent '{agent_id}' not registered")
        return self._agents[agent_id]

    def list_agents(self) -> list[str]:
        """List all registered agent IDs."""
        return list(self._agents.keys())

    @property
    def count(self) -> int:
        """Number of registered agents."""
        return len(self._agents)
