"""Knowledge accumulation schemas."""

from datetime import UTC, datetime

from pydantic import BaseModel, Field

from mds_common.types.enums import KnowledgeDomain


class KnowledgeEntry(BaseModel):
    """A single knowledge entry for accumulation and retrieval."""

    id: str = ""
    domain: KnowledgeDomain
    title: str
    content: str
    source_project: str = ""
    source_step: str = ""
    confidence: float = Field(default=0.5, ge=0, le=1)
    tags: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    is_promoted: bool = False


class KnowledgeQuery(BaseModel):
    """Query parameters for knowledge retrieval."""

    query: str
    domains: list[KnowledgeDomain] | None = None
    min_confidence: float = 0.0
    limit: int = 10
    promoted_only: bool = False
