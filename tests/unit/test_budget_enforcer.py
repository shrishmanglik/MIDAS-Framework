"""Tests for pulse.budget_enforcer."""

import pytest
from mds_common.exceptions.base import BudgetExceededError
from mds_common.schemas.cost import CostRecord, TokenUsage
from mds_common.types.enums import CostTier, ModelTier
from pulse.budget_enforcer import BudgetEnforcer
from pulse.cost_tracker import CostTracker


class TestBudgetEnforcer:
    def test_check_before_ok(self) -> None:
        tracker = CostTracker(total_budget=10.0, run_id="run-1")
        enforcer = BudgetEnforcer(tracker)
        # Should not raise — plenty of budget remaining
        enforcer.check_before("step-a", estimated_cost=0.01)

    def test_check_before_insufficient_remaining(self) -> None:
        tracker = CostTracker(total_budget=0.05, run_id="run-1")
        tracker.record(CostRecord(
            step_name="prior",
            run_id="run-1",
            model_tier=ModelTier.OPUS,
            cost_tier=CostTier.FULL_LLM,
            tokens=TokenUsage(input_tokens=1000, output_tokens=500),
            cost_usd=0.04,
        ))
        enforcer = BudgetEnforcer(tracker)
        # Only $0.01 remaining, but step estimated at $0.05
        with pytest.raises(BudgetExceededError):
            enforcer.check_before("step-b", estimated_cost=0.05)

    def test_check_after_ok(self) -> None:
        tracker = CostTracker(total_budget=10.0, run_id="run-1")
        tracker.record(CostRecord(
            step_name="step-a",
            run_id="run-1",
            model_tier=ModelTier.HAIKU,
            cost_tier=CostTier.TEMPLATE,
            tokens=TokenUsage(input_tokens=10, output_tokens=10),
            cost_usd=0.001,
        ))
        enforcer = BudgetEnforcer(tracker)
        # Should not raise — well within budget
        enforcer.check_after("step-a")

    def test_check_after_over_budget(self) -> None:
        tracker = CostTracker(total_budget=0.01, run_id="run-1")
        tracker.record(CostRecord(
            step_name="step-a",
            run_id="run-1",
            model_tier=ModelTier.OPUS,
            cost_tier=CostTier.FULL_LLM,
            tokens=TokenUsage(input_tokens=1000, output_tokens=500),
            cost_usd=0.05,
        ))
        enforcer = BudgetEnforcer(tracker)
        with pytest.raises(BudgetExceededError):
            enforcer.check_after("step-a")

    def test_warning_threshold_does_not_halt(self) -> None:
        """Budget at 85% should still pass check_before."""
        tracker = CostTracker(total_budget=1.0, run_id="run-1")
        tracker.record(CostRecord(
            step_name="prior",
            run_id="run-1",
            model_tier=ModelTier.SONNET,
            cost_tier=CostTier.FULL_LLM,
            tokens=TokenUsage(input_tokens=500, output_tokens=200),
            cost_usd=0.85,
        ))
        enforcer = BudgetEnforcer(tracker)
        # Not over budget yet — $0.15 remaining, enough for $0.01 step
        enforcer.check_before("next-step", estimated_cost=0.01)
