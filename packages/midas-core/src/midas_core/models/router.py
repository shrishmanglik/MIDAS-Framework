"""Model router — routes tasks to appropriate LLM models."""

import structlog
from mds_common.schemas.agent import AgentSpec
from mds_common.schemas.workflow import StepSpec
from mds_common.types.enums import CostTier, ModelTier, StepType

logger = structlog.get_logger()

# Model string mappings (litellm format)
MODEL_MAP: dict[ModelTier, str] = {
    ModelTier.HAIKU: "anthropic/claude-haiku-4-5-20251001",
    ModelTier.SONNET: "anthropic/claude-sonnet-4-5-20250929",
    ModelTier.OPUS: "anthropic/claude-opus-4-6",
}

# Approximate cost per 1K tokens (input, output)
COST_PER_1K: dict[ModelTier, tuple[float, float]] = {
    ModelTier.HAIKU: (0.0008, 0.004),
    ModelTier.SONNET: (0.003, 0.015),
    ModelTier.OPUS: (0.015, 0.075),
}


class ModelRouter:
    """Routes tasks to appropriate models based on step type and agent preferences."""

    def route(
        self, step: StepSpec, agent: AgentSpec | None = None
    ) -> tuple[str, CostTier]:
        """Determine model and cost tier for a step."""
        if step.step_type == StepType.DETERMINISTIC:
            logger.debug("route_deterministic", step=step.name)
            return "", CostTier.TEMPLATE

        if step.step_type == StepType.AUTOMATED_CHECK:
            model = MODEL_MAP[ModelTier.HAIKU]
            logger.debug("route_automated", step=step.name, model=model)
            return model, CostTier.RULES

        if step.step_type == StepType.HUMAN_GATE:
            return "", CostTier.TEMPLATE

        # LLM-required: use agent preference, or step preference
        tier = ModelTier.SONNET
        if agent:
            tier = agent.model_preference
        if step.model_preference:
            tier = step.model_preference

        model = MODEL_MAP[tier]
        cost_tier = CostTier.RULES if tier == ModelTier.HAIKU else CostTier.FULL_LLM
        logger.debug("route_llm", step=step.name, model=model, tier=tier.value)
        return model, cost_tier

    def get_model_string(self, tier: ModelTier) -> str:
        """Get the litellm model string for a tier."""
        return MODEL_MAP[tier]

    def estimate_cost(
        self, tier: ModelTier, input_tokens: int, output_tokens: int
    ) -> float:
        """Estimate cost for a model call."""
        input_rate, output_rate = COST_PER_1K[tier]
        return (input_tokens / 1000 * input_rate) + (output_tokens / 1000 * output_rate)
