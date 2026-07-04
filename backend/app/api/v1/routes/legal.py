from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.legal import LegalQARequest, LegalQAResponse
from app.services.legal_service import LegalService

router = APIRouter()


@router.post("/qa", response_model=LegalQAResponse)
async def legal_qa(
    request: LegalQARequest,
    db: AsyncSession = Depends(get_db),
) -> LegalQAResponse:
    """Ask a legal question and receive an AI-assisted answer."""
    service = LegalService(db)
    return await service.answer_question(request)


@router.get("/qa/history")
async def get_qa_history(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Get recent legal Q&A history."""
    service = LegalService(db)
    return await service.get_history(limit)
