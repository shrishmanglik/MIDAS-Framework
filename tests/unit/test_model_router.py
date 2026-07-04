"""Tests for midas_core.models.router."""

from mds_common.schemas.agent import AgentPersona, AgentSpec
from mds_common.schemas.workflow import StepSpec
from mds_common.types.enums import CostTier, ModelTier, StepType
from midas_core.models.router import ModelRouter


def _make_step(name: str = "test-step", step_type: StepType = StepType.LLM_REQUIRED) -> StepSpec:
    return StepSpec(name=name, step_type=step_type)


def _make_agent(
    agent_id: str = "test-agent", model_pref: ModelTier = ModelTier.SONNET
) -> AgentSpec:
    return AgentSpec(
        id=agent_id,
        name="Test",
        role="Testing",
        model_preference=model_pref,
        persona=AgentPersona(backstory="test", communication_style="direct"),
    )


class TestModelRouter:
    def test_deterministic_returns_empty(self) -> None:
        router = ModelRouter()
        model, tier = router.route(_make_step(step_type=StepType.DETERMINISTIC))
        assert model == ""
        assert tier == CostTier.TEMPLATE

    def test_human_gate_returns_empty(self) -> None:
        router = ModelRouter()
        model, tier = router.route(_make_step(step_type=StepType.HUMAN_GATE))
        assert model == ""
        assert tier == CostTier.TEMPLATE

    def test_automated_check_uses_haiku(self) -> None:
        router = ModelRouter()
        model, tier = router.route(_make_step(step_type=StepType.AUTOMATED_CHECK))
        assert "haiku" in model
        assert tier == CostTier.RULES

    def test_llm_required_default_sonnet(self) -> None:
        router = ModelRouter()
        model, tier = router.route(_make_step())
        assert "sonnet" in model
        assert tier == CostTier.FULL_LLM

    def test_agent_preference(self) -> None:
        router = ModelRouter()
        agent = _make_agent(model_pref=ModelTier.OPUS)
        model, tier = router.route(_make_step(), agent)
        assert "sonnet" in model  # Step preference overrides agent
        assert tier == CostTier.FULL_LLM

    def test_get_model_string(self) -> None:
        router = ModelRouter()
        assert "haiku" in router.get_model_string(ModelTier.HAIKU)
        assert "sonnet" in router.get_model_string(ModelTier.SONNET)
        assert "opus" in router.get_model_string(ModelTier.OPUS)

    def test_estimate_cost(self) -> None:
        router = ModelRouter()
        cost = router.estimate_cost(ModelTier.HAIKU, 1000, 500)
        assert cost > 0
        assert cost < 0.01  # Haiku should be cheap

        cost_opus = router.estimate_cost(ModelTier.OPUS, 1000, 500)
        assert cost_opus > cost  # Opus should be more expensive
