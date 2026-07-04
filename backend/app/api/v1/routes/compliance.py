from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.compliance import ComplianceChecklistResponse, EmploymentStandardResponse
from app.services.compliance_service import ComplianceService

router = APIRouter()


@router.get("/standards", response_model=list[EmploymentStandardResponse])
async def get_employment_standards(
    province: str = Query(..., description="Province (e.g., Ontario)"),
    topic: str | None = Query(None, description="Topic filter (e.g., minimum_wage, vacation, overtime)"),
    db: AsyncSession = Depends(get_db),
) -> list[EmploymentStandardResponse]:
    """Get employment standards for a province."""
    service = ComplianceService(db)
    return await service.get_employment_standards(province, topic)


@router.get("/checklist", response_model=list[ComplianceChecklistResponse])
async def get_compliance_checklist(
    jurisdiction: str = Query(..., description="Jurisdiction (e.g., Ontario)"),
    category: str | None = Query(None, description="Category filter"),
    db: AsyncSession = Depends(get_db),
) -> list[ComplianceChecklistResponse]:
    """Get compliance checklists for a jurisdiction."""
    service = ComplianceService(db)
    return await service.get_compliance_checklist(jurisdiction, category)
