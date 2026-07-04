from datetime import date
from uuid import UUID

from pydantic import BaseModel


class EmploymentStandardResponse(BaseModel):
    id: UUID
    province: str
    topic: str
    rule_text: str
    effective_date: date | None
    source_url: str | None

    model_config = {"from_attributes": True}


class ChecklistItem(BaseModel):
    item: str
    description: str
    compliant: bool | None = None


class ComplianceChecklistResponse(BaseModel):
    jurisdiction: str
    category: str
    rule_name: str
    description: str
    checklist_items: list[ChecklistItem]


class JurisdictionQuery(BaseModel):
    province: str
    topic: str | None = None
