"""Integration test for knowledge accumulation across workflow steps."""

from __future__ import annotations

from mds_common.schemas.knowledge import KnowledgeQuery
from mds_common.types.enums import KnowledgeDomain
from midas_core.knowledge.accumulator import KnowledgeAccumulator
from midas_core.knowledge.store import InMemoryKnowledgeStore


class TestKnowledgeAccumulation:
    async def test_accumulate_across_steps(self) -> None:
        """Test that knowledge accumulates as steps complete."""
        store = InMemoryKnowledgeStore()
        accumulator = KnowledgeAccumulator(store)

        # Step 1: Requirements produce product knowledge
        await accumulator.record_learning(
            source_step="parse-requirements",
            domain=KnowledgeDomain.PROD,
            title="Bookstore requirements",
            content="5 P0 user stories, PostgreSQL backend, FastAPI + Next.js",
            tags=["requirements", "bookstore"],
        )

        # Step 2: Architecture produces architecture knowledge
        await accumulator.record_learning(
            source_step="design-architecture",
            domain=KnowledgeDomain.ARCH,
            title="Bookstore architecture",
            content="FastAPI backend, PostgreSQL, JWT auth, Redis cache",
            tags=["architecture", "bookstore"],
        )

        # Step 3: Implementation produces coding knowledge
        await accumulator.record_learning(
            source_step="generate-backend",
            domain=KnowledgeDomain.FLOW,
            title="FastAPI CRUD pattern",
            content="Service layer separates business logic from route handlers",
            tags=["fastapi", "patterns"],
        )

        # Query by domain
        arch_results = await store.query(KnowledgeQuery(
            query="bookstore",
            domains=[KnowledgeDomain.ARCH],
        ))
        assert len(arch_results) == 1
        assert arch_results[0].title == "Bookstore architecture"

        # Query across all domains
        all_results = await store.query(KnowledgeQuery(query="bookstore"))
        assert len(all_results) == 2  # requirements + architecture

    async def test_promote_learning(self) -> None:
        """Test promoting a learning to validated pattern."""
        store = InMemoryKnowledgeStore()
        accumulator = KnowledgeAccumulator(store)

        entry_id = await accumulator.record_learning(
            source_step="generate-backend",
            domain=KnowledgeDomain.FLOW,
            title="Error handling pattern",
            content="Use custom exception handlers with structured error responses",
            tags=["patterns", "error-handling"],
        )

        # Promote to validated pattern
        await store.promote(entry_id)

        # Query promoted only
        promoted = await store.query(KnowledgeQuery(
            query="error",
            promoted_only=True,
        ))
        assert len(promoted) == 1
        assert promoted[0].is_promoted is True

    async def test_knowledge_persists_across_queries(self) -> None:
        """Test that stored knowledge is persistent."""
        store = InMemoryKnowledgeStore()
        accumulator = KnowledgeAccumulator(store)

        for i in range(10):
            await accumulator.record_learning(
                source_step=f"step-{i}",
                domain=KnowledgeDomain.QUAL,
                title=f"Testing tip {i}",
                content=f"Quality testing insight number {i}",
                tags=["testing"],
            )

        results = await store.query(KnowledgeQuery(
            query="testing",
            domains=[KnowledgeDomain.QUAL],
            limit=5,
        ))
        assert len(results) == 5  # Limited to 5
