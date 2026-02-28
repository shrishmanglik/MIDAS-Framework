"""
Integration tests for the immigration CRS calculator endpoint.
"""

import pytest
from httpx import AsyncClient


VALID_CRS_PAYLOAD = {
    "age": 28,
    "has_spouse": False,
    "education_level": "bachelors",
    "first_language": {
        "speaking": 9,
        "listening": 9,
        "reading": 9,
        "writing": 9,
    },
    "second_language": None,
    "canadian_work_experience_years": 2,
    "foreign_work_experience_years": 1,
    "spouse_education_level": None,
    "spouse_first_language": None,
    "spouse_canadian_work_experience_years": 0,
    "has_certificate_of_qualification": False,
    "has_provincial_nomination": False,
    "job_offer_noc_level": None,
    "canadian_education_years": 0,
    "has_sibling_in_canada": False,
    "french_clb7_plus": False,
    "english_clb5_plus": False,
}


class TestCRSCalculateEndpoint:
    @pytest.mark.asyncio
    async def test_calculate_crs_returns_200(self, client: AsyncClient):
        response = await client.post("/api/v1/immigration/crs/calculate", json=VALID_CRS_PAYLOAD)
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_calculate_crs_returns_score(self, client: AsyncClient):
        response = await client.post("/api/v1/immigration/crs/calculate", json=VALID_CRS_PAYLOAD)
        data = response.json()
        assert "total_score" in data
        assert isinstance(data["total_score"], int)
        assert data["total_score"] > 0

    @pytest.mark.asyncio
    async def test_calculate_crs_returns_breakdown(self, client: AsyncClient):
        response = await client.post("/api/v1/immigration/crs/calculate", json=VALID_CRS_PAYLOAD)
        data = response.json()
        assert "breakdown" in data
        bd = data["breakdown"]
        assert "core_human_capital" in bd
        assert "spouse_factors" in bd
        assert "skill_transferability" in bd
        assert "additional_points" in bd

    @pytest.mark.asyncio
    async def test_calculate_crs_breakdown_sums_to_total(self, client: AsyncClient):
        response = await client.post("/api/v1/immigration/crs/calculate", json=VALID_CRS_PAYLOAD)
        data = response.json()
        bd = data["breakdown"]
        expected_total = (
            bd["core_human_capital"]
            + bd["spouse_factors"]
            + bd["skill_transferability"]
            + bd["additional_points"]
        )
        assert data["total_score"] == expected_total

    @pytest.mark.asyncio
    async def test_calculate_crs_includes_disclaimer(self, client: AsyncClient):
        """The disclaimer middleware should inject a disclaimer field."""
        response = await client.post("/api/v1/immigration/crs/calculate", json=VALID_CRS_PAYLOAD)
        data = response.json()
        assert "disclaimer" in data

    @pytest.mark.asyncio
    async def test_invalid_age_returns_422(self, client: AsyncClient):
        payload = VALID_CRS_PAYLOAD.copy()
        payload["age"] = 200  # Invalid age
        response = await client.post("/api/v1/immigration/crs/calculate", json=payload)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_missing_required_field_returns_422(self, client: AsyncClient):
        payload = {"age": 28}  # Missing many required fields
        response = await client.post("/api/v1/immigration/crs/calculate", json=payload)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_invalid_education_level_returns_valid(self, client: AsyncClient):
        """Unknown education level should still return 0 points, not error."""
        payload = VALID_CRS_PAYLOAD.copy()
        payload["education_level"] = "unknown_level"
        response = await client.post("/api/v1/immigration/crs/calculate", json=payload)
        # The calculator treats unknown education as 0 points, not an error
        assert response.status_code == 200
        data = response.json()
        assert data["total_score"] >= 0

    @pytest.mark.asyncio
    async def test_with_spouse_factors(self, client: AsyncClient):
        payload = VALID_CRS_PAYLOAD.copy()
        payload["has_spouse"] = True
        payload["spouse_education_level"] = "masters"
        payload["spouse_first_language"] = {
            "speaking": 7,
            "listening": 7,
            "reading": 7,
            "writing": 7,
        }
        payload["spouse_canadian_work_experience_years"] = 1
        response = await client.post("/api/v1/immigration/crs/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["breakdown"]["spouse_factors"] > 0
