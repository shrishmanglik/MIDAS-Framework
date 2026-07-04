"""
Legal Q&A service.

Cache-first approach: checks for existing answers by query hash (SHA256).
If not cached, builds a prompt with relevant statute context and calls the Claude API.
"""

import hashlib
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ResourceNotFoundError
from app.models.legal import LegalAICache, Statute
from app.schemas.legal import LegalQARequest, LegalQAResponse, StatuteReference


class LegalService:
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _hash_query(question: str, jurisdiction: str) -> str:
        """Generate a SHA256 hash of the query for cache lookup."""
        normalized = f"{question.strip().lower()}|{jurisdiction.strip().lower()}"
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    async def _find_relevant_statutes(self, jurisdiction: str, category: str | None, question: str) -> list[Statute]:
        """Find statutes relevant to the question based on jurisdiction and category."""
        query = select(Statute).where(Statute.jurisdiction == jurisdiction)
        if category:
            query = query.where(Statute.category == category)
        query = query.limit(10)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def answer_question(self, request: LegalQARequest) -> LegalQAResponse:
        """
        Answer a legal question. Uses cache-first strategy.

        1. Hash the query.
        2. Check cache for an existing answer.
        3. If cached and not expired, return it.
        4. Otherwise, find relevant statutes, build prompt, call Claude API.
        5. Cache the response.
        """
        query_hash = self._hash_query(request.question, request.jurisdiction)

        # Check cache
        cache_result = await self.session.execute(
            select(LegalAICache).where(LegalAICache.query_hash == query_hash)
        )
        cached = cache_result.scalar_one_or_none()

        if cached is not None:
            # Check if cache entry has expired
            if cached.expires_at is None or cached.expires_at > datetime.now(timezone.utc):
                return LegalQAResponse(
                    question=request.question,
                    answer=cached.response_text,
                    statute_references=[],
                    cached=True,
                    created_at=cached.created_at,
                )

        # Find relevant statutes
        statutes = await self._find_relevant_statutes(
            request.jurisdiction,
            request.category,
            request.question,
        )

        statute_refs = [
            StatuteReference(
                title=s.title,
                section=s.section,
                jurisdiction=s.jurisdiction,
                excerpt=s.content[:500] if s.content else "",
            )
            for s in statutes
        ]

        # Build the prompt
        statute_context = ""
        if statutes:
            statute_context = "\n\nRelevant legal provisions:\n"
            for s in statutes:
                statute_context += f"\n- {s.title}, Section {s.section} ({s.jurisdiction}):\n  {s.content[:800]}\n"

        prompt = (
            f"You are a legal research assistant. Answer the following legal question based on "
            f"Canadian law in the jurisdiction of {request.jurisdiction}.\n\n"
            f"Question: {request.question}\n"
            f"{statute_context}\n\n"
            f"Provide a clear, well-structured answer. Cite specific statutes or legal provisions "
            f"where applicable. Always note that this is for informational purposes only and does "
            f"not constitute legal advice."
        )

        # Call Claude API
        answer = await self._call_claude(prompt)

        # Cache the response
        now = datetime.now(timezone.utc)
        cache_entry = LegalAICache(
            query_hash=query_hash,
            query_text=request.question,
            response_text=answer,
            statute_ids=[str(s.id) for s in statutes],
            created_at=now,
            expires_at=now + timedelta(days=7),
        )
        self.session.add(cache_entry)
        await self.session.flush()

        return LegalQAResponse(
            question=request.question,
            answer=answer,
            statute_references=statute_refs,
            cached=False,
            created_at=now,
        )

    async def _call_claude(self, prompt: str) -> str:
        """Call the Claude API with the constructed prompt."""
        if not settings.CLAUDE_API_KEY:
            return (
                "The AI assistant is not configured. Please set the CLAUDE_API_KEY environment variable. "
                "In the meantime, please consult a licensed legal professional for answers to your legal questions."
            )

        try:
            import anthropic

            client = anthropic.AsyncAnthropic(api_key=settings.CLAUDE_API_KEY)
            message = await client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}],
            )
            return message.content[0].text
        except Exception as exc:
            return (
                f"An error occurred while processing your question: {str(exc)}. "
                f"Please try again later or consult a licensed legal professional."
            )

    async def get_history(self, limit: int = 20) -> list[dict]:
        """Get recent Q&A history from cache."""
        result = await self.session.execute(
            select(LegalAICache).order_by(LegalAICache.created_at.desc()).limit(limit)
        )
        entries = result.scalars().all()

        return [
            {
                "id": str(entry.id),
                "question": entry.query_text,
                "answer": entry.response_text,
                "created_at": entry.created_at.isoformat(),
            }
            for entry in entries
        ]
