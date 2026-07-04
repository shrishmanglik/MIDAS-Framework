from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TemplateListResponse(BaseModel):
    id: UUID
    name: str
    category: str
    description: str
    jurisdiction: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TemplateDetailResponse(BaseModel):
    id: UUID
    name: str
    category: str
    description: str
    template_content: str
    jurisdiction: str
    variables_schema: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentGenerateRequest(BaseModel):
    template_id: UUID
    variables: dict
    title: str | None = None


class DocumentGenerateResponse(BaseModel):
    id: UUID
    title: str
    content: str
    template_id: UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}
