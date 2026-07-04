"""In-memory state store for development and testing."""

from typing import Any

from mds_common.schemas.state import StepExecutionState


class InMemoryStateStore:
    """In-memory state store for development and testing."""

    def __init__(self) -> None:
        self._steps: dict[str, StepExecutionState] = {}
        self._projects: dict[str, dict[str, Any]] = {}

    async def save_step(self, step: StepExecutionState) -> None:
        """Persist a step execution state in memory."""
        key = f"{step.run_id}:{step.step_name}"
        self._steps[key] = step.model_copy(deep=True)

    async def load_step(self, step_id: str, run_id: str) -> StepExecutionState | None:
        """Load a single step state by ID and run ID."""
        return self._steps.get(f"{run_id}:{step_id}")

    async def load_workflow_steps(self, run_id: str) -> list[StepExecutionState]:
        """Load all step states for a workflow run."""
        return [s for k, s in self._steps.items() if k.startswith(f"{run_id}:")]

    async def save_project_state(self, project_id: str, state: dict[str, Any]) -> None:
        """Persist project-level state in memory."""
        self._projects[project_id] = state

    async def load_project_state(self, project_id: str) -> dict[str, Any] | None:
        """Load project-level state from memory."""
        return self._projects.get(project_id)
