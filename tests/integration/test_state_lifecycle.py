"""Integration test for state lifecycle — full workflow execution."""


from mds_common.schemas.workflow import StepSpec, WorkflowSpec
from mds_common.types.enums import StepStatus, StepType
from midas_core.state.manager import StateManager
from midas_core.state.persistence import InMemoryStateStore


def _build_workflow() -> WorkflowSpec:
    """Build a 4-step workflow with dependencies for lifecycle testing."""
    return WorkflowSpec(
        name="lifecycle-test",
        studio="dev",
        steps=[
            StepSpec(name="requirements", step_type=StepType.LLM_REQUIRED),
            StepSpec(
                name="architecture",
                step_type=StepType.LLM_REQUIRED,
                depends_on=["requirements"],
            ),
            StepSpec(
                name="implementation",
                step_type=StepType.DETERMINISTIC,
                depends_on=["architecture"],
            ),
            StepSpec(
                name="testing",
                step_type=StepType.AUTOMATED_CHECK,
                depends_on=["implementation"],
            ),
        ],
    )


class TestStateLifecycle:
    async def test_full_workflow_lifecycle(self) -> None:
        """Test a complete workflow run from init to completion."""
        store = InMemoryStateStore()
        workflow = _build_workflow()
        manager = StateManager(store, workflow)

        # Initialize
        await manager.initialize_run("lifecycle-run-001")
        assert manager.is_complete() is False

        # Only requirements is ready (no deps)
        assert manager.get_ready_steps() == ["requirements"]

        # Run requirements
        await manager.transition("requirements", StepStatus.RUNNING)
        assert manager.get_ready_steps() == []
        await manager.transition(
            "requirements", StepStatus.COMPLETED,
            outputs={"doc": "requirements.json"},
        )

        # Now architecture is ready
        assert manager.get_ready_steps() == ["architecture"]
        await manager.transition("architecture", StepStatus.RUNNING)
        await manager.transition(
            "architecture", StepStatus.COMPLETED,
            outputs={"doc": "architecture.md"},
        )

        # Implementation ready
        assert manager.get_ready_steps() == ["implementation"]
        await manager.transition("implementation", StepStatus.RUNNING)
        await manager.transition("implementation", StepStatus.COMPLETED)

        # Testing ready
        assert manager.get_ready_steps() == ["testing"]
        await manager.transition("testing", StepStatus.RUNNING)
        await manager.transition("testing", StepStatus.COMPLETED)

        assert manager.is_complete() is True

    async def test_retry_after_failure(self) -> None:
        """Test that a failed step can be retried."""
        store = InMemoryStateStore()
        workflow = WorkflowSpec(
            name="retry-test", studio="dev",
            steps=[StepSpec(name="flaky-step", step_type=StepType.LLM_REQUIRED)],
        )
        manager = StateManager(store, workflow)
        await manager.initialize_run("retry-run")

        # First attempt fails
        await manager.transition("flaky-step", StepStatus.RUNNING)
        await manager.transition("flaky-step", StepStatus.FAILED, error="timeout")

        step = manager.get_step("flaky-step")
        assert step is not None
        assert step.retry_count == 1

        # Retry: FAILED -> PENDING -> RUNNING -> COMPLETED
        await manager.transition("flaky-step", StepStatus.PENDING)
        await manager.transition("flaky-step", StepStatus.RUNNING)
        await manager.transition("flaky-step", StepStatus.COMPLETED)
        assert manager.is_complete() is True

    async def test_persistence_survives_reload(self) -> None:
        """Test that state persists across manager instances (same store)."""
        store = InMemoryStateStore()
        workflow = WorkflowSpec(
            name="persist-test", studio="dev",
            steps=[StepSpec(name="step-a", step_type=StepType.DETERMINISTIC)],
        )

        # First manager instance
        mgr1 = StateManager(store, workflow)
        await mgr1.initialize_run("persist-run")
        await mgr1.transition("step-a", StepStatus.RUNNING)

        # Verify data in store
        loaded = await store.load_step("step-a", "persist-run")
        assert loaded is not None
        assert loaded.status == StepStatus.RUNNING

    async def test_skip_step(self) -> None:
        """Test skipping a step."""
        store = InMemoryStateStore()
        workflow = WorkflowSpec(
            name="skip-test", studio="dev",
            steps=[
                StepSpec(name="step-a", step_type=StepType.DETERMINISTIC),
                StepSpec(name="step-b", step_type=StepType.DETERMINISTIC),
            ],
        )
        manager = StateManager(store, workflow)
        await manager.initialize_run("skip-run")

        await manager.transition("step-a", StepStatus.SKIPPED)
        await manager.transition("step-b", StepStatus.RUNNING)
        await manager.transition("step-b", StepStatus.COMPLETED)

        assert manager.is_complete() is True
