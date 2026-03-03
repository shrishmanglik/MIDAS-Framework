"""Cost tracking and budget schemas."""

from datetime import UTC, datetime
from uuid import uuid4

from pydantic import BaseModel, Field

from mds_common.types.enums import CostTier, ModelTier


class TokenUsage(BaseModel):
    """Token usage breakdown for an LLM call."""

    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    cache_write_tokens: int = 0


class CostRecord(BaseModel):
    """Record of a single cost-incurring operation."""

    id: str = Field(default_factory=lambda: uuid4().hex)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    step_name: str
    run_id: str
    model_tier: ModelTier
    cost_tier: CostTier
    tokens: TokenUsage = Field(default_factory=TokenUsage)
    cost_usd: float = 0.0
    latency_ms: float = 0.0


class BudgetSnapshot(BaseModel):
    """Point-in-time snapshot of budget status."""

    run_id: str
    total_budget: float
    total_spent: float = 0.0
    remaining: float = 0.0
    step_costs: dict[str, float] = Field(default_factory=dict)
    is_exceeded: bool = False
    warning_threshold_hit: bool = False
