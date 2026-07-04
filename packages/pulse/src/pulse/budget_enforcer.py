"""Budget enforcer — enforces budget limits with hard halt on exceed."""

import structlog
from mds_common.exceptions.base import BudgetExceededError

from pulse.cost_tracker import CostTracker

logger = structlog.get_logger()


class BudgetEnforcer:
    """Enforces budget limits. Hard halt on exceed."""

    def __init__(self, tracker: CostTracker) -> None:
        self._tracker = tracker

    def check_before(self, step_name: str, estimated_cost: float) -> None:
        """Check if we can afford this step BEFORE executing."""
        snapshot = self._tracker.get_snapshot()
        if snapshot.remaining < estimated_cost:
            raise BudgetExceededError(
                f"Step '{step_name}' estimated at ${estimated_cost:.4f} but only "
                f"${snapshot.remaining:.4f} remaining",
                context={
                    "step": step_name,
                    "estimated": estimated_cost,
                    "remaining": snapshot.remaining,
                    "total_spent": snapshot.total_spent,
                },
            )
        if snapshot.warning_threshold_hit:
            logger.warning(
                "budget_warning",
                spent=f"${snapshot.total_spent:.4f}",
                budget=f"${snapshot.total_budget:.4f}",
                remaining=f"${snapshot.remaining:.4f}",
            )

    def check_after(self, step_name: str) -> None:
        """Verify budget after step execution."""
        snapshot = self._tracker.get_snapshot()
        if snapshot.is_exceeded:
            raise BudgetExceededError(
                f"Budget exceeded after step '{step_name}': "
                f"${snapshot.total_spent:.4f} / ${snapshot.total_budget:.4f}",
                context={
                    "step": step_name,
                    "total_spent": snapshot.total_spent,
                    "budget": snapshot.total_budget,
                },
            )
