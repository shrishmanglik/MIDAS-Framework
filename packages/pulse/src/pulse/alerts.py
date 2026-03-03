"""Budget and system alerts via structlog."""

import structlog
from mds_common.schemas.cost import BudgetSnapshot

logger = structlog.get_logger()


def emit_budget_warning(snapshot: BudgetSnapshot) -> None:
    """Emit a budget warning when threshold is hit."""
    logger.warning(
        "budget_warning_threshold",
        run_id=snapshot.run_id,
        spent=f"${snapshot.total_spent:.4f}",
        budget=f"${snapshot.total_budget:.4f}",
        remaining=f"${snapshot.remaining:.4f}",
        pct_used=f"{(snapshot.total_spent / snapshot.total_budget * 100):.1f}%",
    )


def emit_budget_exceeded(snapshot: BudgetSnapshot) -> None:
    """Emit a critical budget exceeded alert."""
    logger.error(
        "budget_exceeded",
        run_id=snapshot.run_id,
        spent=f"${snapshot.total_spent:.4f}",
        budget=f"${snapshot.total_budget:.4f}",
        overage=f"${snapshot.total_spent - snapshot.total_budget:.4f}",
    )


def emit_step_complete(step_name: str, cost_usd: float, run_id: str) -> None:
    """Emit a step completion alert."""
    logger.info(
        "step_completed",
        step=step_name,
        cost=f"${cost_usd:.6f}",
        run_id=run_id,
    )
