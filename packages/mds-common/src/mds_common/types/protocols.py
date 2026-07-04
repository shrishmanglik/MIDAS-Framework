"""Protocol interfaces for MIDAS backend abstractions."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Protocol

if TYPE_CHECKING:
    from mds_common.schemas.knowledge import KnowledgeEntry, KnowledgeQuery
    from mds_common.schemas.state import StepExecutionState


class StateStore(Protocol):
    """Interface for state persistence backends."""

    async def save_step(self, step: StepExecutionState) -> None:
        """Persist a step execution state."""
        ...

    async def load_step(self, step_id: str, run_id: str) -> StepExecutionState | None:
        """Load a single step state by ID and run ID."""
        ...

    async def load_workflow_steps(self, run_id: str) -> list[StepExecutionState]:
        """Load all step states for a workflow run."""
        ...

    async def save_project_state(self, project_id: str, state: dict[str, Any]) -> None:
        """Persist project-level state."""
        ...

    async def load_project_state(self, project_id: str) -> dict[str, Any] | None:
        """Load project-level state."""
        ...


class KnowledgeStore(Protocol):
    """Interface for knowledge accumulation backend."""

    async def store(self, entry: KnowledgeEntry) -> str:
        """Store a knowledge entry and return its ID."""
        ...

    async def query(self, query: KnowledgeQuery) -> list[KnowledgeEntry]:
        """Query knowledge entries."""
        ...

    async def promote(self, entry_id: str) -> None:
        """Promote a knowledge entry from raw to validated pattern."""
        ...
