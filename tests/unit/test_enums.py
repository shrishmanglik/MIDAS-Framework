"""Tests for mds_common.types.enums."""

from mds_common.types.enums import (
    AgentType,
    CostTier,
    ExecutionPattern,
    KnowledgeDomain,
    ModelTier,
    QualityGateSeverity,
    StepStatus,
    StepType,
)


class TestStepStatus:
    def test_all_values(self) -> None:
        assert StepStatus.PENDING == "pending"
        assert StepStatus.RUNNING == "running"
        assert StepStatus.COMPLETED == "completed"
        assert StepStatus.FAILED == "failed"
        assert StepStatus.SKIPPED == "skipped"
        assert StepStatus.BLOCKED == "blocked"
        assert StepStatus.AWAITING_HUMAN == "awaiting_human"

    def test_string_serialization(self) -> None:
        assert StepStatus.PENDING.value == "pending"
        assert str(StepStatus.PENDING) == "pending"  # StrEnum returns value


class TestStepType:
    def test_all_values(self) -> None:
        assert len(StepType) == 4
        assert StepType.DETERMINISTIC == "deterministic"
        assert StepType.LLM_REQUIRED == "llm_required"
        assert StepType.HUMAN_GATE == "human_gate"
        assert StepType.AUTOMATED_CHECK == "automated_check"


class TestModelTier:
    def test_all_tiers(self) -> None:
        assert ModelTier.HAIKU == "haiku"
        assert ModelTier.SONNET == "sonnet"
        assert ModelTier.OPUS == "opus"


class TestAgentType:
    def test_all_types(self) -> None:
        assert AgentType.WORKER == "worker"
        assert AgentType.MANAGER == "manager"
        assert AgentType.ORCHESTRATOR == "orchestrator"


class TestCostTier:
    def test_three_tiers(self) -> None:
        assert CostTier.TEMPLATE == "template"
        assert CostTier.RULES == "rules"
        assert CostTier.FULL_LLM == "full_llm"


class TestKnowledgeDomain:
    def test_all_domains(self) -> None:
        assert len(KnowledgeDomain) == 12
        assert KnowledgeDomain.ARCH == "architecture"
        assert KnowledgeDomain.FAIL == "failure_patterns"


class TestQualityGateSeverity:
    def test_all_severities(self) -> None:
        assert QualityGateSeverity.CRITICAL == "critical"
        assert QualityGateSeverity.WARNING == "warning"
        assert QualityGateSeverity.INFO == "info"


class TestExecutionPattern:
    def test_all_patterns(self) -> None:
        assert ExecutionPattern.SEQUENTIAL == "sequential"
        assert ExecutionPattern.PARALLEL == "parallel"
        assert ExecutionPattern.CONDITIONAL == "conditional"
