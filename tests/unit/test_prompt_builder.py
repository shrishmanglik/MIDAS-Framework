"""Tests for midas_core.agents.prompt_builder."""

from mds_common.schemas.agent import AgentPersona, AgentSpec
from midas_core.agents.prompt_builder import PromptBuilder


def _make_agent() -> AgentSpec:
    return AgentSpec(
        id="test-pm",
        name="Product Manager",
        role="Requirements engineering",
        persona=AgentPersona(
            backstory="You are a seasoned product manager.",
            communication_style="Structured and precise.",
            expertise_areas=["requirements", "user stories"],
        ),
        capabilities=["Parse briefs", "Generate user stories"],
        constraints=["Never write code", "Always flag assumptions"],
    )


class TestPromptBuilder:
    def test_build_system_prompt(self) -> None:
        builder = PromptBuilder()
        agent = _make_agent()
        prompt = builder.build_system_prompt(agent)
        assert "Product Manager" in prompt
        assert "Requirements engineering" in prompt
        assert "seasoned product manager" in prompt
        assert "Parse briefs" in prompt
        assert "Never write code" in prompt

    def test_build_task_prompt_basic(self) -> None:
        builder = PromptBuilder()
        prompt = builder.build_task_prompt("Parse the bookstore brief")
        assert "## Task" in prompt
        assert "Parse the bookstore brief" in prompt
        assert "## Instructions" in prompt

    def test_build_task_prompt_with_context(self) -> None:
        builder = PromptBuilder()
        prompt = builder.build_task_prompt(
            "Analyze requirements",
            context={"project": "bookstore", "domain": "e-commerce"},
        )
        assert "## Context" in prompt
        assert "bookstore" in prompt

    def test_build_task_prompt_with_upstream(self) -> None:
        builder = PromptBuilder()
        prompt = builder.build_task_prompt(
            "Design architecture",
            upstream_outputs={"requirements": "User can browse books"},
        )
        assert "## Inputs from Previous Steps" in prompt
        assert "User can browse books" in prompt
