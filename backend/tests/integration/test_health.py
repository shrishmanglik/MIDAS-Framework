"""
Integration test for the health check endpoint.
"""

import pytest
from httpx import AsyncClient


class TestHealthEndpoint:
    @pytest.mark.asyncio
    async def test_health_returns_200(self, client: AsyncClient):
        response = await client.get("/api/v1/health")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_health_returns_status_ok(self, client: AsyncClient):
        response = await client.get("/api/v1/health")
        data = response.json()
        assert data["status"] == "ok"

    @pytest.mark.asyncio
    async def test_health_returns_version(self, client: AsyncClient):
        response = await client.get("/api/v1/health")
        data = response.json()
        assert "version" in data

    @pytest.mark.asyncio
    async def test_health_returns_database_status(self, client: AsyncClient):
        response = await client.get("/api/v1/health")
        data = response.json()
        assert "database" in data
