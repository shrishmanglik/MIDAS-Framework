"""Workflow execution state manager."""

from datetime import UTC, datetime
from typing import Any

import structlog
from mds_common.exceptions.base import StateTransitionError
from mds_common.schemas.state import StepExecutionState
from mds_common.schemas.workflow import WorkflowSpec
from mds_common.types.enums import StepStatus
from mds_common.types.protocols import StateStore

from midas_core.state.transitions import VALID_TRANSITIONS

logger = structlog.get_logger()


class StateManager:
    """Manages workflow execution state with persistence."""

    def __init__(self, store: StateStore, workflow: WorkflowSpec) -> None:
        self._store = store
        self._workflow = workflow
        self._steps: dict[str, StepExecutionState] = {}
        self._run_id: str = ""

    async def initialize_run(self, run_id: str) -> None:
        """Initialize all steps as PENDING for a new workflow run."""
        self._run_id = run_id
        for step_spec in self._workflow.steps:
            state = StepExecutionState(
                step_name=step_spec.name,
                run_id=run_id,
            )
            self._steps[step_spec.name] = state
            await self._store.save_step(state)
        logger.info(
            "workflow_run_initialized",
            run_id=run_id,
            step_count=len(self._steps),
        )

    async def transition(
        self,
        step_name: str,
        new_status: StepStatus,
        outputs: dict[str, Any] | None = None,
        error: str | None = None,
    ) -> StepExecutionState:
        """Transition a step to a new status with validation."""
        step = self._steps.get(step_name)
        if step is None:
            raise StateTransitionError(f"Step '{step_name}' not found")
        if step.is_immutable:
            raise StateTransitionError(
                f"Step '{step_name}' is immutable (status: {step.status})"
            )
        if new_status not in VALID_TRANSITIONS.get(step.status, set()):
            raise StateTransitionError(
                f"Invalid transition: {step.status} -> {new_status} for step '{step_name}'"
            )

        step.status = new_status
        if new_status == StepStatus.RUNNING:
            step.started_at = datetime.now(UTC)
        if new_status in {StepStatus.COMPLETED, StepStatus.SKIPPED}:
            step.completed_at = datetime.now(UTC)
            step.is_immutable = True
        if new_status == StepStatus.FAILED:
            step.error = error
            step.retry_count += 1
        if outputs:
            step.outputs.update(outputs)

        await self._store.save_step(step)
        logger.info(
            "step_transition",
            step=step_name,
            status=new_status.value,
            run_id=self._run_id,
        )
        return step

    def get_ready_steps(self) -> list[str]:
        """Return steps whose dependencies are all COMPLETED."""
        ready = []
        for step_spec in self._workflow.steps:
            state = self._steps.get(step_spec.name)
            if state is None or state.status != StepStatus.PENDING:
                continue
            deps_met = all(
                self._steps.get(dep, StepExecutionState(step_name=dep, run_id="")).status
                == StepStatus.COMPLETED
                for dep in step_spec.depends_on
            )
            if deps_met:
                ready.append(step_spec.name)
        return ready

    def get_step(self, step_name: str) -> StepExecutionState | None:
        """Get the current state of a specific step."""
        return self._steps.get(step_name)

    def is_complete(self) -> bool:
        """Check if all steps have reached a terminal state."""
        return all(
            s.status in {StepStatus.COMPLETED, StepStatus.SKIPPED}
            for s in self._steps.values()
        )

    @property
    def run_id(self) -> str:
        """Current run ID."""
        return self._run_id
