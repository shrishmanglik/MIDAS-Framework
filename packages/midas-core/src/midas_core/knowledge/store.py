"""In-memory knowledge store implementation."""

from uuid import uuid4

import structlog
from mds_common.exceptions.base import KnowledgeStoreError
from mds_common.schemas.knowledge import KnowledgeEntry, KnowledgeQuery

logger = structlog.get_logger()


class InMemoryKnowledgeStore:
    """In-memory knowledge store for development and testing."""

    def __init__(self) -> None:
        self._entries: dict[str, KnowledgeEntry] = {}

    async def store(self, entry: KnowledgeEntry) -> str:
        """Store a knowledge entry and return its ID."""
        entry_id = uuid4().hex
        entry.id = entry_id
        self._entries[entry_id] = entry.model_copy(deep=True)
        logger.debug("knowledge_stored", entry_id=entry_id, domain=entry.domain.value)
        return entry_id

    async def query(self, query: KnowledgeQuery) -> list[KnowledgeEntry]:
        """Query knowledge entries by keyword matching."""
        results = []
        query_lower = query.query.lower()
        for entry in self._entries.values():
            if query.promoted_only and not entry.is_promoted:
                continue
            if query.domains and entry.domain not in query.domains:
                continue
            if entry.confidence < query.min_confidence:
                continue
            if (
                query_lower in entry.title.lower()
                or query_lower in entry.content.lower()
                or any(query_lower in tag.lower() for tag in entry.tags)
            ):
                results.append(entry.model_copy(deep=True))
        results.sort(key=lambda e: e.confidence, reverse=True)
        return results[: query.limit]

    async def promote(self, entry_id: str) -> None:
        """Promote a knowledge entry from raw to validated pattern."""
        entry = self._entries.get(entry_id)
        if entry is None:
            raise KnowledgeStoreError(f"Entry '{entry_id}' not found")
        entry.is_promoted = True
        logger.info("knowledge_promoted", entry_id=entry_id)
