"""Tests for pulse.cost_tracker."""

import pytest
from mds_common.schemas.cost import CostRecord, TokenUsage
from mds_common.types.enums import CostTier, ModelTier
from pulse.cost_tracker import CostTracker


class TestCostTracker:
    def test_record_and_total(self) -> None:
        tracker = CostTracker(total_budget=10.0, run_id="run-1")
        record = CostRecord(
            step_name="step-a",
            run_id="run-1",
            model_tier=ModelTier.SONNET,
            cost_tier=CostTier.FULL_LLM,
            tokens=TokenUsage(input_tokens=100, output_tokens=50),
            cost_usd=0.05,
        )
        tracker.record(record)
        assert tracker.total_spent == pytest.approx(0.05)

    def test_multiple_records(self) -> None:
        tracker = CostTracker(total_budget=10.0, run_id="run-1")
        for i in range(3):
            tracker.record(CostRecord(
                step_name=f"step-{i}",
                run_id="run-1",
                model_tier=ModelTier.HAIKU,
                cost_tier=CostTier.RULES,
                tokens=TokenUsage(input_tokens=10, output_tokens=10),
                cost_usd=0.01,
            ))
        assert tracker.total_spent == pytest.approx(0.03)

    def test_is_over_budget(self) -> None:
        tracker = CostTracker(total_budget=0.02, run_id="run-1")
        tracker.record(CostRecord(
            step_name="expensive",
            run_id="run-1",
            model_tier=ModelTier.OPUS,
            cost_tier=CostTier.FULL_LLM,
            tokens=TokenUsage(input_tokens=1000, output_tokens=500),
            cost_usd=0.05,
        ))
        assert tracker.is_over_budget is True

    def test_not_over_budget(self) -> None:
        tracker = CostTracker(total_budget=10.0, run_id="run-1")
        tracker.record(CostRecord(
            step_name="cheap",
            run_id="run-1",
            model_tier=ModelTier.HAIKU,
            cost_tier=CostTier.TEMPLATE,
            tokens=TokenUsage(input_tokens=10, output_tokens=10),
            cost_usd=0.001,
        ))
        assert tracker.is_over_budget is False

    def test_get_snapshot(self) -> None:
        tracker = CostTracker(total_budget=5.0, run_id="run-1")
        tracker.record(CostRecord(
            step_name="step-a",
            run_id="run-1",
            model_tier=ModelTier.SONNET,
            cost_tier=CostTier.FULL_LLM,
            tokens=TokenUsage(input_tokens=100, output_tokens=50),
            cost_usd=1.0,
        ))
        snapshot = tracker.get_snapshot()
        assert snapshot.total_spent == pytest.approx(1.0)
        assert snapshot.total_budget == pytest.approx(5.0)
        assert snapshot.remaining == pytest.approx(4.0)

    def test_step_costs_in_snapshot(self) -> None:
        tracker = CostTracker(total_budget=10.0, run_id="run-1")
        tracker.record(CostRecord(
            step_name="step-a",
            run_id="run-1",
            model_tier=ModelTier.SONNET,
            cost_tier=CostTier.FULL_LLM,
            tokens=TokenUsage(input_tokens=100, output_tokens=50),
            cost_usd=0.05,
        ))
        tracker.record(CostRecord(
            step_name="step-a",
            run_id="run-1",
            model_tier=ModelTier.SONNET,
            cost_tier=CostTier.FULL_LLM,
            tokens=TokenUsage(input_tokens=200, output_tokens=100),
            cost_usd=0.10,
        ))
        tracker.record(CostRecord(
            step_name="step-b",
            run_id="run-1",
            model_tier=ModelTier.HAIKU,
            cost_tier=CostTier.RULES,
            tokens=TokenUsage(input_tokens=10, output_tokens=10),
            cost_usd=0.001,
        ))
        snapshot = tracker.get_snapshot()
        assert snapshot.step_costs["step-a"] == pytest.approx(0.15)
        assert snapshot.step_costs["step-b"] == pytest.approx(0.001)
