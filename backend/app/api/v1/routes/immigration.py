from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.immigration import CRSInput, CRSResult, PostLandingTaskResponse, ProgramResponse
from app.services.immigration_service import ImmigrationService

router = APIRouter()


@router.post("/crs/calculate", response_model=CRSResult)
async def calculate_crs(
    input_data: CRSInput,
    db: AsyncSession = Depends(get_db),
) -> CRSResult:
    """Calculate CRS score based on the provided profile."""
    service = ImmigrationService(db)
    return service.calculate_crs(input_data)


@router.get("/programs", response_model=list[ProgramResponse])
async def get_programs(
    province: str | None = Query(None, description="Filter by province"),
    db: AsyncSession = Depends(get_db),
) -> list[ProgramResponse]:
    """List all active immigration programs."""
    service = ImmigrationService(db)
    return await service.get_programs(province)


@router.post("/pathways/match")
async def match_pathways(
    input_data: CRSInput,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Match an applicant profile to eligible immigration pathways."""
    service = ImmigrationService(db)
    result = service.calculate_crs(input_data)
    pathways = service.match_pathways(result.total_score, input_data)
    return {
        "crs_score": result.total_score,
        "matched_pathways": pathways,
    }


@router.get("/checklist", response_model=PostLandingTaskResponse)
async def get_post_landing_checklist() -> PostLandingTaskResponse:
    """Get the post-landing checklist for new permanent residents."""
    return ImmigrationService.get_post_landing_checklist()


@router.get("/draws")
async def get_recent_draws(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Get recent Express Entry draws."""
    service = ImmigrationService(db)
    return await service.get_recent_draws(limit)
