"""Tests for pulse.knowledge_engine and midas_core.knowledge.store."""

from mds_common.schemas.knowledge import KnowledgeEntry, KnowledgeQuery
from mds_common.types.enums import KnowledgeDomain
from pulse.knowledge_engine import InMemoryKnowledgeStore


class TestInMemoryKnowledgeStore:
    async def test_store_and_query(self) -> None:
        store = InMemoryKnowledgeStore()
        entry = KnowledgeEntry(
            domain=KnowledgeDomain.ARCH,
            title="FastAPI patterns",
            content="Use dependency injection for services",
            tags=["fastapi", "patterns"],
        )
        entry_id = await store.store(entry)
        assert isinstance(entry_id, str)
        assert len(entry_id) > 0

        results = await store.query(KnowledgeQuery(
            query="fastapi",
            domains=[KnowledgeDomain.ARCH],
        ))
        assert len(results) == 1
        assert results[0].title == "FastAPI patterns"

    async def test_query_by_domain_filter(self) -> None:
        store = InMemoryKnowledgeStore()
        await store.store(KnowledgeEntry(
            domain=KnowledgeDomain.ARCH,
            title="Backend tip",
            content="Use async handlers",
            tags=["backend"],
        ))
        await store.store(KnowledgeEntry(
            domain=KnowledgeDomain.DSGN,
            title="Frontend tip",
            content="Use React components",
            tags=["frontend"],
        ))
        # Query for "tip" but only in ARCH domain
        results = await store.query(KnowledgeQuery(
            query="tip",
            domains=[KnowledgeDomain.ARCH],
        ))
        assert len(results) == 1
        assert results[0].title == "Backend tip"

    async def test_query_by_tags(self) -> None:
        store = InMemoryKnowledgeStore()
        await store.store(KnowledgeEntry(
            domain=KnowledgeDomain.DPLY,
            title="Docker best practices",
            content="Use multi-stage builds",
            tags=["docker", "containers"],
        ))
        await store.store(KnowledgeEntry(
            domain=KnowledgeDomain.DPLY,
            title="K8s patterns",
            content="Use namespaces",
            tags=["kubernetes"],
        ))
        # Query matches tag "docker"
        results = await store.query(KnowledgeQuery(
            query="docker",
            domains=[KnowledgeDomain.DPLY],
        ))
        assert len(results) == 1
        assert results[0].title == "Docker best practices"

    async def test_promote(self) -> None:
        store = InMemoryKnowledgeStore()
        entry = KnowledgeEntry(
            domain=KnowledgeDomain.ARCH,
            title="Design pattern",
            content="Use hexagonal architecture",
            tags=["architecture"],
        )
        entry_id = await store.store(entry)
        await store.promote(entry_id)

        # Query promoted only
        results = await store.query(KnowledgeQuery(
            query="hexagonal",
            promoted_only=True,
        ))
        assert len(results) == 1
        assert results[0].title == "Design pattern"
        assert results[0].is_promoted is True

    async def test_query_empty_store(self) -> None:
        store = InMemoryKnowledgeStore()
        results = await store.query(KnowledgeQuery(
            query="anything",
            domains=[KnowledgeDomain.ARCH],
        ))
        assert len(results) == 0

    async def test_store_multiple_same_domain(self) -> None:
        store = InMemoryKnowledgeStore()
        for i in range(5):
            await store.store(KnowledgeEntry(
                domain=KnowledgeDomain.QUAL,
                title=f"Test tip {i}",
                content=f"Tip content {i}",
                tags=["testing"],
            ))
        results = await store.query(KnowledgeQuery(
            query="tip",
            domains=[KnowledgeDomain.QUAL],
        ))
        assert len(results) == 5

    async def test_query_by_content(self) -> None:
        store = InMemoryKnowledgeStore()
        await store.store(KnowledgeEntry(
            domain=KnowledgeDomain.COST,
            title="Budgeting",
            content="Always track token usage per step",
            tags=["cost"],
        ))
        results = await store.query(KnowledgeQuery(query="token"))
        assert len(results) == 1
        assert results[0].title == "Budgeting"
