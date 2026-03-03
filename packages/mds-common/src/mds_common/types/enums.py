"""Core enumerations for the MIDAS framework."""

from enum import StrEnum


class StepStatus(StrEnum):
    """Status of a workflow step execution."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    BLOCKED = "blocked"
    AWAITING_HUMAN = "awaiting_human"


class StepType(StrEnum):
    """Type of workflow step determining execution strategy."""

    DETERMINISTIC = "deterministic"
    LLM_REQUIRED = "llm_required"
    HUMAN_GATE = "human_gate"
    AUTOMATED_CHECK = "automated_check"


class ModelTier(StrEnum):
    """LLM model tier for cost/capability routing."""

    HAIKU = "haiku"
    SONNET = "sonnet"
    OPUS = "opus"


class AgentType(StrEnum):
    """Agent role classification."""

    WORKER = "worker"
    MANAGER = "manager"
    ORCHESTRATOR = "orchestrator"


class ExecutionPattern(StrEnum):
    """How steps within a group execute."""

    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    CONDITIONAL = "conditional"


class QualityGateSeverity(StrEnum):
    """Severity level for quality gate findings."""

    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class KnowledgeDomain(StrEnum):
    """Knowledge domains for classification and retrieval."""

    ARCH = "architecture"
    ORCH = "orchestration"
    PROM = "prompt_engineering"
    QUAL = "quality_testing"
    COST = "cost_optimization"
    DPLY = "deployment"
    PROD = "product_strategy"
    DSGN = "design_ux"
    DATA = "database_data"
    FAIL = "failure_patterns"
    FLOW = "workflow"
    SCALE = "scaling"


class CostTier(StrEnum):
    """Three-tier execution model for cost optimization."""

    TEMPLATE = "template"
    RULES = "rules"
    FULL_LLM = "full_llm"
