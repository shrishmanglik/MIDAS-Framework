"""
Unit tests for the Compliance Service.

Tests use an in-memory database seeded with employment standards data.
"""

import pytest
import pytest_asyncio
from datetime import date
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.compliance import EmploymentStandard
from app.services.compliance_service import ComplianceService


@pytest_asyncio.fixture
async def seeded_db(db_session: AsyncSession) -> AsyncSession:
    """Seed the database with sample employment standards."""
    standards = [
        EmploymentStandard(
            id=uuid4(),
            province="Ontario",
            topic="minimum_wage",
            rule_text="The general minimum wage in Ontario is $16.55 per hour.",
            effective_date=date(2023, 10, 1),
            source_url="https://example.com/min-wage",
        ),
        EmploymentStandard(
            id=uuid4(),
            province="Ontario",
            topic="vacation",
            rule_text="Employees earn a minimum of 2 weeks vacation after each 12-month vacation entitlement year.",
            effective_date=date(2000, 9, 4),
            source_url="https://example.com/vacation",
        ),
        EmploymentStandard(
            id=uuid4(),
            province="Ontario",
            topic="overtime",
            rule_text="Most employees are entitled to overtime pay at 1.5 times their regular rate after 44 hours.",
            effective_date=date(2000, 9, 4),
            source_url="https://example.com/overtime",
        ),
        EmploymentStandard(
            id=uuid4(),
            province="British Columbia",
            topic="minimum_wage",
            rule_text="The general minimum wage in BC is $16.75 per hour.",
            effective_date=date(2023, 6, 1),
            source_url="https://example.com/bc-wage",
        ),
    ]
    db_session.add_all(standards)
    await db_session.commit()
    return db_session


class TestComplianceService:
    @pytest.mark.asyncio
    async def test_get_ontario_standards_all(self, seeded_db: AsyncSession):
        """Should return all Ontario standards when no topic filter."""
        service = ComplianceService(seeded_db)
        results = await service.get_employment_standards("Ontario")
        assert len(results) == 3
        provinces = {r.province for r in results}
        assert provinces == {"Ontario"}

    @pytest.mark.asyncio
    async def test_get_ontario_minimum_wage(self, seeded_db: AsyncSession):
        """Should return only minimum wage standards for Ontario."""
        service = ComplianceService(seeded_db)
        results = await service.get_employment_standards("Ontario", topic="minimum_wage")
        assert len(results) == 1
        assert results[0].topic == "minimum_wage"
        assert "$16.55" in results[0].rule_text

    @pytest.mark.asyncio
    async def test_get_bc_standards(self, seeded_db: AsyncSession):
        """Should return BC standards separately."""
        service = ComplianceService(seeded_db)
        results = await service.get_employment_standards("British Columbia")
        assert len(results) == 1
        assert results[0].province == "British Columbia"

    @pytest.mark.asyncio
    async def test_nonexistent_province_returns_empty(self, seeded_db: AsyncSession):
        """Should return empty list for unknown province."""
        service = ComplianceService(seeded_db)
        results = await service.get_employment_standards("Nunavut")
        assert len(results) == 0

    @pytest.mark.asyncio
    async def test_nonexistent_topic_returns_empty(self, seeded_db: AsyncSession):
        """Should return empty list for unknown topic."""
        service = ComplianceService(seeded_db)
        results = await service.get_employment_standards("Ontario", topic="nonexistent_topic")
        assert len(results) == 0

    @pytest.mark.asyncio
    async def test_response_has_required_fields(self, seeded_db: AsyncSession):
        """Should return responses with all required fields."""
        service = ComplianceService(seeded_db)
        results = await service.get_employment_standards("Ontario", topic="vacation")
        assert len(results) == 1
        r = results[0]
        assert r.province == "Ontario"
        assert r.topic == "vacation"
        assert r.rule_text is not None
        assert r.effective_date is not None
        assert r.source_url is not None
