"""Agent runtime — executes agents via LLM provider."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

import structlog
from mds_common.schemas.cost import CostRecord, TokenUsage
from mds_common.types.enums import CostTier
from mds_common.utils.timing import timer

if TYPE_CHECKING:
    from mds_common.schemas.agent import AgentSpec

    from midas_core.agents.prompt_builder import PromptBuilder
    from midas_core.models.provider import LLMProvider
    from midas_core.models.router import ModelRouter

logger = structlog.get_logger()


class AgentRuntime:
    """Executes agent tasks by routing to the appropriate LLM provider."""

    def __init__(
        self,
        provider: LLMProvider,
        router: ModelRouter,
        prompt_builder: PromptBuilder,
    ) -> None:
        self._provider = provider
        self._router = router
        self._prompt_builder = prompt_builder

    async def execute(
        self,
        agent: AgentSpec,
        task_description: str,
        run_id: str,
        step_name: str,
        context: dict[str, Any] | None = None,
        upstream_outputs: dict[str, Any] | None = None,
    ) -> tuple[str, CostRecord]:
        """Execute an agent task and return the response with cost record."""
        system_prompt = self._prompt_builder.build_system_prompt(agent)
        user_prompt = self._prompt_builder.build_task_prompt(
            task_description, context, upstream_outputs
        )

        model = self._router.get_model_string(agent.model_preference)

        with timer() as t:
            response = await self._provider.complete(
                model=model,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )

        cost_record = CostRecord(
            step_name=step_name,
            run_id=run_id,
            model_tier=agent.model_preference,
            cost_tier=CostTier.FULL_LLM,
            tokens=TokenUsage(
                input_tokens=response.get("input_tokens", 0),
                output_tokens=response.get("output_tokens", 0),
            ),
            cost_usd=response.get("cost", 0.0),
            latency_ms=t.get("elapsed_ms", 0.0),
        )

        logger.info(
            "agent_executed",
            agent=agent.id,
            step=step_name,
            cost=f"${cost_record.cost_usd:.6f}",
            latency_ms=f"{cost_record.latency_ms:.0f}",
        )

        return response.get("content", ""), cost_record
