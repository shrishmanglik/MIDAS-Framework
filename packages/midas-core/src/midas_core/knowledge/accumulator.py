"""Knowledge accumulator — extracts and stores learnings from agent outputs."""

import structlog
from mds_common.schemas.knowledge import KnowledgeEntry
from mds_common.types.enums import KnowledgeDomain
from mds_common.types.protocols import KnowledgeStore

logger = structlog.get_logger()


class KnowledgeAccumulator:
    """Extracts learnings from workflow steps and accumulates knowledge."""

    def __init__(self, store: KnowledgeStore) -> None:
        self._store = store

    async def record_learning(
        self,
        domain: KnowledgeDomain,
        title: str,
        content: str,
        source_project: str = "",
        source_step: str = "",
        tags: list[str] | None = None,
        confidence: float = 0.5,
    ) -> str:
        """Record a learning from a workflow step."""
        entry = KnowledgeEntry(
            domain=domain,
            title=title,
            content=content,
            source_project=source_project,
            source_step=source_step,
            tags=tags or [],
            confidence=confidence,
        )
        entry_id = await self._store.store(entry)
        logger.info(
            "learning_recorded",
            entry_id=entry_id,
            domain=domain.value,
            title=title,
        )
        return entry_id
