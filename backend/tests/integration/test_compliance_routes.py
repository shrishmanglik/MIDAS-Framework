"""
Integration tests for the compliance endpoints.
"""

import pytest
import pytest_asyncio
from datetime import date
from uuid import uuid4

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.compliance import EmploymentStandard


@pytest_asyncio.fixture
async def seeded_compliance_db(db_session: AsyncSession) -> AsyncSession:
    """Seed the database with employment standards for integration tests."""
    standards = [
        EmploymentStandard(
            id=uuid4(),
            province="Ontario",
            topic="minimum_wage",
            rule_text="The general minimum wage in Ontario is $16.55 per hour.",
            effective_date=date(2023, 10, 1),
            source_url="https://ontario.ca/minimum-wage",
        ),
        EmploymentStandard(
            id=uuid4(),
            province="Ontario",
            topic="vacation",
            rule_text="Employees earn a minimum of 2 weeks vacation per year.",
            effective_date=date(2000, 9, 4),
            source_url="https://ontario.ca/vacation",
        ),
        EmploymentStandard(
            id=uuid4(),
            province="Ontario",
            topic="overtime",
            rule_text="Overtime pay is 1.5 times regular rate after 44 hours per week.",
            effective_date=date(2000, 9, 4),
            source_url="https://ontario.ca/overtime",
        ),
    ]
    db_session.add_all(standards)
    await db_session.commit()
    return db_session


class TestComplianceStandardsEndpoint:
    @pytest.mark.asyncio
    async def test_get_standards_returns_200(self, client: AsyncClient, seeded_compliance_db):
        response = await client.get("/api/v1/compliance/standards", params={"province": "Ontario"})
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_standards_returns_list(self, client: AsyncClient, seeded_compliance_db):
        response = await client.get("/api/v1/compliance/standards", params={"province": "Ontario"})
        data = response.json()
        # Disclaimer middleware wraps lists in {"data": [...], "disclaimer": "..."}
        if isinstance(data, dict) and "data" in data:
            items = data["data"]
        else:
            items = data
        assert isinstance(items, list)
        assert len(items) == 3

    @pytest.mark.asyncio
    async def test_get_standards_with_topic_filter(self, client: AsyncClient, seeded_compliance_db):
        response = await client.get(
            "/api/v1/compliance/standards",
            params={"province": "Ontario", "topic": "minimum_wage"},
        )
        data = response.json()
        if isinstance(data, dict) and "data" in data:
            items = data["data"]
        else:
            items = data
        assert len(items) == 1
        assert items[0]["topic"] == "minimum_wage"

    @pytest.mark.asyncio
    async def test_get_standards_unknown_province_returns_empty(self, client: AsyncClient, seeded_compliance_db):
        response = await client.get("/api/v1/compliance/standards", params={"province": "Unknown"})
        data = response.json()
        if isinstance(data, dict) and "data" in data:
            items = data["data"]
        else:
            items = data
        assert len(items) == 0

    @pytest.mark.asyncio
    async def test_get_standards_missing_province_returns_422(self, client: AsyncClient, seeded_compliance_db):
        """Province is a required query parameter."""
        response = await client.get("/api/v1/compliance/standards")
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_disclaimer_included(self, client: AsyncClient, seeded_compliance_db):
        """The disclaimer middleware should inject a disclaimer in the response."""
        response = await client.get("/api/v1/compliance/standards", params={"province": "Ontario"})
        data = response.json()
        assert "disclaimer" in data
