from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ClauseResponse(BaseModel):
    id: UUID
    clause_type: str
    name: str
    description: str
    risk_level: str
    example_text: str

    model_config = {"from_attributes": True}


class RiskAssessment(BaseModel):
    overall_score: float
    risk_level: str  # low, medium, high
    factors: list[str]


class ContractUploadResponse(BaseModel):
    id: UUID
    filename: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ClauseFound(BaseModel):
    clause_type: str
    name: str
    risk_level: str
    excerpt: str


class ContractReviewResponse(BaseModel):
    id: UUID
    filename: str
    status: str
    risk_score: float | None
    risk_assessment: RiskAssessment | None
    summary: str | None
    clauses_found: list[ClauseFound]
    missing_clauses: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
