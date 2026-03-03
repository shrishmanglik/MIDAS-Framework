"""Cost tracker — tracks per-call, per-step, and per-workflow costs."""

from collections import defaultdict

import structlog
from mds_common.schemas.cost import BudgetSnapshot, CostRecord

logger = structlog.get_logger()


class CostTracker:
    """Tracks per-call, per-step, and per-workflow costs."""

    def __init__(self, total_budget: float, run_id: str) -> None:
        self._total_budget = total_budget
        self._run_id = run_id
        self._records: list[CostRecord] = []
        self._step_costs: dict[str, float] = defaultdict(float)
        self._total_spent: float = 0.0

    def record(self, record: CostRecord) -> None:
        """Record a cost-incurring operation."""
        self._records.append(record)
        self._step_costs[record.step_name] += record.cost_usd
        self._total_spent += record.cost_usd
        logger.info(
            "cost_recorded",
            step=record.step_name,
            cost=f"${record.cost_usd:.6f}",
            total=f"${self._total_spent:.4f}",
        )

    def get_snapshot(self) -> BudgetSnapshot:
        """Get a point-in-time snapshot of budget status."""
        return BudgetSnapshot(
            run_id=self._run_id,
            total_budget=self._total_budget,
            total_spent=self._total_spent,
            remaining=self._total_budget - self._total_spent,
            step_costs=dict(self._step_costs),
            is_exceeded=self._total_spent > self._total_budget,
            warning_threshold_hit=self._total_spent > self._total_budget * 0.8,
        )

    @property
    def total_spent(self) -> float:
        """Total cost spent so far."""
        return self._total_spent

    @property
    def is_over_budget(self) -> bool:
        """Whether total spend has exceeded the budget."""
        return self._total_spent > self._total_budget
