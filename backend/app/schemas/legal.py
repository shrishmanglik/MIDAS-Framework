from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class LegalQARequest(BaseModel):
    question: str = Field(..., min_length=10, max_length=2000, description="Legal question to answer")
    jurisdiction: str = Field("Ontario", description="Jurisdiction context for the question")
    category: str | None = Field(None, description="Legal category (e.g., employment, immigration, contracts)")


class StatuteReference(BaseModel):
    title: str
    section: str
    jurisdiction: str
    excerpt: str


class LegalQAResponse(BaseModel):
    question: str
    answer: str
    statute_references: list[StatuteReference] = []
    cached: bool = False
    created_at: datetime


class LegalQAHistoryItem(BaseModel):
    id: UUID
    question: str
    answer: str
    created_at: datetime
