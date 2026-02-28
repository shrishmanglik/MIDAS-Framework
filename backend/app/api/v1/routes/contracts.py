from uuid import UUID

from fastapi import APIRouter, Depends, Form, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.contracts import ClauseResponse, ContractReviewResponse, ContractUploadResponse
from app.services.contract_service import ContractService

router = APIRouter()


@router.post("/upload", response_model=ContractReviewResponse, status_code=201)
async def upload_contract(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ContractReviewResponse:
    """Upload a contract file (text/plain or .txt) for review."""
    content_bytes = await file.read()
    try:
        text_content = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text_content = content_bytes.decode("latin-1")

    service = ContractService(db)
    return await service.upload_and_review(
        user_id=current_user.id,
        filename=file.filename or "unknown.txt",
        text_content=text_content,
    )


@router.get("/{review_id}", response_model=ContractReviewResponse)
async def get_contract_review(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ContractReviewResponse:
    """Get a specific contract review."""
    service = ContractService(db)
    return await service.get_review(review_id)


@router.get("", response_model=list[ContractUploadResponse])
async def list_contract_reviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ContractUploadResponse]:
    """List all contract reviews for the current user."""
    service = ContractService(db)
    return await service.get_reviews_for_user(current_user.id)


@router.get("/clauses/library", response_model=list[ClauseResponse])
async def get_clause_library(
    db: AsyncSession = Depends(get_db),
) -> list[ClauseResponse]:
    """Get the complete clause library."""
    service = ContractService(db)
    return await service.get_clause_library()
