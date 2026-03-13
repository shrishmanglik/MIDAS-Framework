"""Tests for mds_common.schemas."""

import pytest
from mds_common.schemas.agent import AgentPersona, AgentSpec
from mds_common.schemas.cost import BudgetSnapshot, CostRecord, TokenUsage
from mds_common.schemas.knowledge import KnowledgeEntry, KnowledgeQuery
from mds_common.schemas.state import StepExecutionState
from mds_common.schemas.workflow import StepSpec, WorkflowSpec
from mds_common.types.enums import (
    AgentType,
    CostTier,
    KnowledgeDomain,
    ModelTier,
    StepStatus,
    StepType,
)
from pydantic import ValidationError


class TestAgentSpec:
    def test_valid_agent(self) -> None:
        spec = AgentSpec(
            id="product-manager",
            name="Product Manager",
            role="Requirements engineering",
            persona=AgentPersona(
                backstory="Experienced PM",
                communication_style="Structured and precise",
            ),
        )
        assert spec.id == "product-manager"
        assert spec.type == AgentType.WORKER
        assert spec.model_preference == ModelTier.SONNET

    def test_invalid_id_pattern(self) -> None:
        with pytest.raises(ValidationError):
            AgentSpec(
                id="Product-Manager",  # Must start with lowercase
                name="PM",
                role="PM",
                persona=AgentPersona(
                    backstory="b", communication_style="s"
                ),
            )

    def test_default_values(self) -> None:
        spec = AgentSpec(
            id="test-agent",
            name="Test",
            role="Testing",
            persona=AgentPersona(
                backstory="b", communication_style="s"
            ),
        )
        assert spec.cost_limit_per_task == 0.05
        assert spec.fallback_model == ModelTier.HAIKU
        assert spec.capabilities == []
        assert spec.tools == []


class TestWorkflowSpec:
    def _make_step(self, name: str, **kwargs: object) -> StepSpec:
        defaults = {"step_type": StepType.DETERMINISTIC}
        defaults.update(kwargs)
        return StepSpec(name=name, **defaults)  # type: ignore[arg-type]

    def test_valid_workflow(self) -> None:
        wf = WorkflowSpec(
            name="test-workflow",
            studio="dev",
            steps=[
                self._make_step("step-a"),
                self._make_step("step-b", depends_on=["step-a"]),
            ],
        )
        assert len(wf.steps) == 2

    def test_missing_dependency(self) -> None:
        with pytest.raises(ValidationError, match="depends on 'nonexistent'"):
            WorkflowSpec(
                name="bad",
                studio="dev",
                steps=[
                    self._make_step("step-a", depends_on=["nonexistent"]),
                ],
            )

    def test_cycle_detection(self) -> None:
        with pytest.raises(ValidationError, match="Cycle detected"):
            WorkflowSpec(
                name="cycle",
                studio="dev",
                steps=[
                    self._make_step("step-a", depends_on=["step-b"]),
                    self._make_step("step-b", depends_on=["step-a"]),
                ],
            )

    def test_empty_steps(self) -> None:
        with pytest.raises(ValidationError):
            WorkflowSpec(name="empty", studio="dev", steps=[])


class TestStepSpec:
    def test_defaults(self) -> None:
        step = StepSpec(name="my-step", step_type=StepType.LLM_REQUIRED)
        assert step.budget == 0.01
        assert step.timeout_seconds == 300
        assert step.max_retries == 2
        assert step.depends_on == []

    def test_invalid_name(self) -> None:
        with pytest.raises(ValidationError):
            StepSpec(name="My Step", step_type=StepType.DETERMINISTIC)


class TestCostRecord:
    def test_auto_id(self) -> None:
        r1 = CostRecord(
            step_name="test", run_id="run-1",
            model_tier=ModelTier.SONNET, cost_tier=CostTier.FULL_LLM,
        )
        r2 = CostRecord(
            step_name="test", run_id="run-1",
            model_tier=ModelTier.SONNET, cost_tier=CostTier.FULL_LLM,
        )
        assert r1.id != r2.id
        assert len(r1.id) == 32

    def test_token_usage_defaults(self) -> None:
        t = TokenUsage()
        assert t.input_tokens == 0
        assert t.output_tokens == 0


class TestBudgetSnapshot:
    def test_exceeded(self) -> None:
        snap = BudgetSnapshot(
            run_id="run-1",
            total_budget=0.50,
            total_spent=0.60,
            remaining=-0.10,
            is_exceeded=True,
        )
        assert snap.is_exceeded is True


class TestStepExecutionState:
    def test_defaults(self) -> None:
        state = StepExecutionState(step_name="init", run_id="run-1")
        assert state.status == StepStatus.PENDING
        assert state.is_immutable is False
        assert state.outputs == {}

    def test_immutable_flag(self) -> None:
        state = StepExecutionState(
            step_name="done", run_id="run-1",
            status=StepStatus.COMPLETED, is_immutable=True,
        )
        assert state.is_immutable is True


class TestKnowledgeEntry:
    def test_defaults(self) -> None:
        entry = KnowledgeEntry(
            domain=KnowledgeDomain.ARCH,
            title="Test Pattern",
            content="Content here",
        )
        assert entry.confidence == 0.5
        assert entry.is_promoted is False
        assert entry.tags == []


class TestKnowledgeQuery:
    def test_defaults(self) -> None:
        q = KnowledgeQuery(query="test")
        assert q.limit == 10
        assert q.promoted_only is False
        assert q.domains is None
