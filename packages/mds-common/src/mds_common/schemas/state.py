"""Step execution state schema."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from mds_common.types.enums import StepStatus


class StepExecutionState(BaseModel):
    """Runtime state of a single workflow step execution."""

    step_name: str
    run_id: str
    status: StepStatus = StepStatus.PENDING
    started_at: datetime | None = None
    completed_at: datetime | None = None
    cost_usd: float = 0.0
    outputs: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None
    retry_count: int = 0
    is_immutable: bool = False
