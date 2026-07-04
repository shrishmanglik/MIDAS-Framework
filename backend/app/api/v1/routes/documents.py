from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.documents import (
    DocumentGenerateRequest,
    DocumentGenerateResponse,
    TemplateDetailResponse,
    TemplateListResponse,
)
from app.services.document_service import DocumentService

router = APIRouter()


@router.get("/templates", response_model=list[TemplateListResponse])
async def list_templates(
    category: str | None = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db),
) -> list[TemplateListResponse]:
    """List all available document templates."""
    service = DocumentService(db)
    return await service.list_templates(category)


@router.get("/templates/{template_id}", response_model=TemplateDetailResponse)
async def get_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> TemplateDetailResponse:
    """Get a specific document template by ID."""
    service = DocumentService(db)
    return await service.get_template(template_id)


@router.post("/generate", response_model=DocumentGenerateResponse, status_code=201)
async def generate_document(
    request: DocumentGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentGenerateResponse:
    """Generate a document from a template with provided variables."""
    service = DocumentService(db)
    return await service.generate_document(user_id=current_user.id, request=request)
