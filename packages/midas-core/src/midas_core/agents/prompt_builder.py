"""Prompt builder — assembles system and user prompts from agent specs."""

from typing import Any

from mds_common.schemas.agent import AgentSpec


class PromptBuilder:
    """Builds system and user prompts from AgentSpec and task context."""

    def build_system_prompt(self, agent: AgentSpec) -> str:
        """Build a system prompt from an agent specification."""
        parts = [
            f"You are {agent.name}, a {agent.role}.",
            f"\n{agent.persona.backstory}",
            f"\nCommunication style: {agent.persona.communication_style}",
        ]
        if agent.capabilities:
            parts.append(f"\nCapabilities: {', '.join(agent.capabilities)}")
        if agent.constraints:
            parts.append(f"\nConstraints: {', '.join(agent.constraints)}")
        return "\n".join(parts)

    def build_task_prompt(
        self,
        task_description: str,
        context: dict[str, Any] | None = None,
        upstream_outputs: dict[str, Any] | None = None,
    ) -> str:
        """Build a user/task prompt with context and upstream outputs."""
        parts = [f"## Task\n{task_description}"]
        if context:
            parts.append(f"\n## Context\n{_format_dict(context)}")
        if upstream_outputs:
            parts.append(f"\n## Inputs from Previous Steps\n{_format_dict(upstream_outputs)}")
        parts.append("\n## Instructions\nProduce your output. Be precise and complete.")
        return "\n".join(parts)


def _format_dict(d: dict[str, Any]) -> str:
    """Format a dictionary as a markdown list."""
    return "\n".join(f"- **{k}:** {v}" for k, v in d.items())
