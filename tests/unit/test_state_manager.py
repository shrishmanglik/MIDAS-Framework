"""Tests for midas_core.state.manager."""

import pytest
from mds_common.exceptions.base import StateTransitionError
from mds_common.schemas.workflow import StepSpec, WorkflowSpec
from mds_common.types.enums import StepStatus, StepType
from midas_core.state.manager import StateManager
from midas_core.state.persistence import InMemoryStateStore


def _make_workflow(*step_names: str, deps: dict[str, list[str]] | None = None) -> WorkflowSpec:
    """Helper to create a simple test workflow."""
    deps = deps or {}
    steps = [
        StepSpec(
            name=name,
            step_type=StepType.DETERMINISTIC,
            depends_on=deps.get(name, []),
        )
        for name in step_names
    ]
    return WorkflowSpec(name="test-workflow", studio="dev", steps=steps)


class TestStateManager:
    @pytest.fixture
    async def manager(self) -> StateManager:
        store = InMemoryStateStore()
        workflow = _make_workflow("step-a", "step-b", deps={"step-b": ["step-a"]})
        mgr = StateManager(store, workflow)
        await mgr.initialize_run("run-001")
        return mgr

    async def test_initialize_run(self, manager: StateManager) -> None:
        assert manager.get_step("step-a") is not None
        assert manager.get_step("step-b") is not None
        assert manager.get_step("step-a").status == StepStatus.PENDING  # type: ignore[union-attr]

    async def test_valid_transition(self, manager: StateManager) -> None:
        step = await manager.transition("step-a", StepStatus.RUNNING)
        assert step.status == StepStatus.RUNNING
        assert step.started_at is not None

    async def test_complete_sets_immutable(self, manager: StateManager) -> None:
        await manager.transition("step-a", StepStatus.RUNNING)
        step = await manager.transition("step-a", StepStatus.COMPLETED)
        assert step.is_immutable is True
        assert step.completed_at is not None

    async def test_invalid_transition_raises(self, manager: StateManager) -> None:
        with pytest.raises(StateTransitionError, match="Invalid transition"):
            await manager.transition("step-a", StepStatus.COMPLETED)

    async def test_immutable_step_raises(self, manager: StateManager) -> None:
        await manager.transition("step-a", StepStatus.RUNNING)
        await manager.transition("step-a", StepStatus.COMPLETED)
        with pytest.raises(StateTransitionError, match="immutable"):
            await manager.transition("step-a", StepStatus.RUNNING)

    async def test_nonexistent_step_raises(self, manager: StateManager) -> None:
        with pytest.raises(StateTransitionError, match="not found"):
            await manager.transition("nonexistent", StepStatus.RUNNING)

    async def test_failed_records_error(self, manager: StateManager) -> None:
        await manager.transition("step-a", StepStatus.RUNNING)
        step = await manager.transition(
            "step-a", StepStatus.FAILED, error="something broke"
        )
        assert step.error == "something broke"
        assert step.retry_count == 1

    async def test_get_ready_steps(self, manager: StateManager) -> None:
        # Only step-a is ready (step-b depends on step-a)
        ready = manager.get_ready_steps()
        assert ready == ["step-a"]

    async def test_get_ready_steps_after_completion(self, manager: StateManager) -> None:
        await manager.transition("step-a", StepStatus.RUNNING)
        await manager.transition("step-a", StepStatus.COMPLETED)
        ready = manager.get_ready_steps()
        assert ready == ["step-b"]

    async def test_is_complete(self, manager: StateManager) -> None:
        assert manager.is_complete() is False
        await manager.transition("step-a", StepStatus.RUNNING)
        await manager.transition("step-a", StepStatus.COMPLETED)
        assert manager.is_complete() is False
        await manager.transition("step-b", StepStatus.RUNNING)
        await manager.transition("step-b", StepStatus.COMPLETED)
        assert manager.is_complete() is True

    async def test_outputs_accumulated(self, manager: StateManager) -> None:
        await manager.transition("step-a", StepStatus.RUNNING)
        await manager.transition(
            "step-a", StepStatus.COMPLETED,
            outputs={"requirements": "data"},
        )
        step = manager.get_step("step-a")
        assert step is not None
        assert step.outputs == {"requirements": "data"}
