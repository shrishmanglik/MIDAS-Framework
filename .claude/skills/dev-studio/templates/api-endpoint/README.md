# API Endpoint Template

> Complete template for implementing a new REST API endpoint: route handler, service, schema, and tests.

## Overview

Every new API endpoint follows this pattern:

```
1. Define the Pydantic schema (request + response)
2. Write the service method (business logic)
3. Wire the route handler (thin layer connecting HTTP to service)
4. Write tests (happy path + error cases + auth)
```

## Step 1: Pydantic Schema -- app/schemas/[resource].py

```python
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# ============================================================
# Request Schemas
# ============================================================

class ResourceCreate(BaseModel):
    """Schema for creating a new resource."""
    name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Display name of the resource",
        examples=["My Resource"],
    )
    description: str = Field(
        "",
        max_length=5000,
        description="Optional description",
    )
    category: str = Field(
        ...,
        description="Category identifier",
        examples=["technology"],
    )


class ResourceUpdate(BaseModel):
    """Schema for updating an existing resource. All fields optional."""
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=5000)
    category: str | None = None


# ============================================================
# Response Schemas
# ============================================================

class ResourceResponse(BaseModel):
    """Single resource response."""
    id: UUID
    name: str
    description: str
    category: str
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ResourceListResponse(BaseModel):
    """Paginated list response."""
    data: list[ResourceResponse]
    meta: dict  # { "total": int, "skip": int, "limit": int }
```

## Step 2: Service -- app/services/[resource]_service.py

```python
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate


class ResourceService:
    """Business logic for Resource operations. No HTTP concepts here."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, payload: ResourceCreate, owner_id: UUID) -> Resource:
        """Create a new resource."""
        resource = Resource(
            **payload.model_dump(),
            owner_id=owner_id,
        )
        self.db.add(resource)
        await self.db.commit()
        await self.db.refresh(resource)
        return resource

    async def get(self, resource_id: UUID) -> Resource:
        """Get a single resource by ID. Raises 404 if not found."""
        result = await self.db.execute(
            select(Resource).where(Resource.id == resource_id)
        )
        resource = result.scalar_one_or_none()
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found",
            )
        return resource

    async def list(
        self,
        skip: int = 0,
        limit: int = 100,
        category: str | None = None,
    ) -> tuple[list[Resource], int]:
        """List resources with optional filtering and pagination."""
        base_query = select(Resource)
        count_query = select(func.count()).select_from(Resource)

        if category:
            base_query = base_query.where(Resource.category == category)
            count_query = count_query.where(Resource.category == category)

        total = (await self.db.execute(count_query)).scalar_one()
        result = await self.db.execute(
            base_query
            .order_by(Resource.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total

    async def update(
        self,
        resource_id: UUID,
        payload: ResourceUpdate,
        requester_id: UUID,
    ) -> Resource:
        """Update a resource. Only the owner can update."""
        resource = await self.get(resource_id)
        if resource.owner_id != requester_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own this resource",
            )
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(resource, key, value)
        await self.db.commit()
        await self.db.refresh(resource)
        return resource

    async def delete(self, resource_id: UUID, requester_id: UUID) -> None:
        """Delete a resource. Only the owner can delete."""
        resource = await self.get(resource_id)
        if resource.owner_id != requester_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own this resource",
            )
        await self.db.delete(resource)
        await self.db.commit()
```

## Step 3: Route Handler -- app/api/v1/routes/[resource].py

```python
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourceResponse,
    ResourceListResponse,
)
from app.services.resource_service import ResourceService

router = APIRouter(prefix="/resources", tags=["resources"])


@router.post(
    "/",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a resource",
    description="Create a new resource. Requires authentication.",
)
async def create_resource(
    payload: ResourceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResourceService(db)
    return await service.create(payload, owner_id=current_user.id)


@router.get(
    "/",
    response_model=ResourceListResponse,
    summary="List resources",
    description="List all resources with optional category filter and pagination.",
)
async def list_resources(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    category: str | None = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db),
):
    service = ResourceService(db)
    resources, total = await service.list(skip=skip, limit=limit, category=category)
    return ResourceListResponse(
        data=resources,
        meta={"total": total, "skip": skip, "limit": limit},
    )


@router.get(
    "/{resource_id}",
    response_model=ResourceResponse,
    summary="Get a resource",
    description="Get a single resource by its ID.",
)
async def get_resource(
    resource_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    service = ResourceService(db)
    return await service.get(resource_id)


@router.patch(
    "/{resource_id}",
    response_model=ResourceResponse,
    summary="Update a resource",
    description="Update a resource. Only the owner can update. Partial updates supported.",
)
async def update_resource(
    resource_id: UUID,
    payload: ResourceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResourceService(db)
    return await service.update(resource_id, payload, requester_id=current_user.id)


@router.delete(
    "/{resource_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a resource",
    description="Delete a resource. Only the owner can delete.",
)
async def delete_resource(
    resource_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResourceService(db)
    await service.delete(resource_id, requester_id=current_user.id)
```

## Step 4: Tests -- tests/integration/test_[resource]_routes.py

```python
import pytest
from uuid import uuid4


class TestCreateResource:
    """POST /api/v1/resources"""

    async def test_create_valid_returns_201(self, client, candidate_headers):
        response = await client.post("/api/v1/resources", json={
            "name": "Test Resource",
            "description": "A test resource",
            "category": "technology",
        }, headers=candidate_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Resource"
        assert "id" in data

    async def test_create_unauthenticated_returns_401(self, client):
        response = await client.post("/api/v1/resources", json={
            "name": "Test", "category": "tech",
        })
        assert response.status_code in [401, 403]

    async def test_create_missing_name_returns_422(self, client, candidate_headers):
        response = await client.post("/api/v1/resources", json={
            "category": "technology",
        }, headers=candidate_headers)
        assert response.status_code == 422

    async def test_create_empty_name_returns_422(self, client, candidate_headers):
        response = await client.post("/api/v1/resources", json={
            "name": "",
            "category": "technology",
        }, headers=candidate_headers)
        assert response.status_code == 422


class TestListResources:
    """GET /api/v1/resources"""

    async def test_list_empty_returns_200(self, client):
        response = await client.get("/api/v1/resources")
        assert response.status_code == 200
        assert response.json()["data"] == []
        assert response.json()["meta"]["total"] == 0

    async def test_list_with_pagination(self, client, seed_resources):
        response = await client.get("/api/v1/resources?skip=0&limit=2")
        assert response.status_code == 200
        assert len(response.json()["data"]) <= 2

    async def test_list_with_category_filter(self, client, seed_resources):
        response = await client.get("/api/v1/resources?category=technology")
        assert response.status_code == 200
        for item in response.json()["data"]:
            assert item["category"] == "technology"


class TestGetResource:
    """GET /api/v1/resources/{id}"""

    async def test_get_existing_returns_200(self, client, seed_resource):
        response = await client.get(f"/api/v1/resources/{seed_resource.id}")
        assert response.status_code == 200
        assert response.json()["id"] == str(seed_resource.id)

    async def test_get_nonexistent_returns_404(self, client):
        response = await client.get(f"/api/v1/resources/{uuid4()}")
        assert response.status_code == 404


class TestUpdateResource:
    """PATCH /api/v1/resources/{id}"""

    async def test_update_own_resource_returns_200(self, client, candidate_headers, seed_resource):
        response = await client.patch(
            f"/api/v1/resources/{seed_resource.id}",
            json={"name": "Updated Name"},
            headers=candidate_headers,
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"

    async def test_update_other_user_resource_returns_403(self, client, employer_headers, seed_resource):
        response = await client.patch(
            f"/api/v1/resources/{seed_resource.id}",
            json={"name": "Hijacked"},
            headers=employer_headers,
        )
        assert response.status_code == 403


class TestDeleteResource:
    """DELETE /api/v1/resources/{id}"""

    async def test_delete_own_resource_returns_204(self, client, candidate_headers, seed_resource):
        response = await client.delete(
            f"/api/v1/resources/{seed_resource.id}",
            headers=candidate_headers,
        )
        assert response.status_code == 204

    async def test_delete_unauthenticated_returns_401(self, client, seed_resource):
        response = await client.delete(f"/api/v1/resources/{seed_resource.id}")
        assert response.status_code in [401, 403]
```

## Checklist for New Endpoints

- [ ] Pydantic schema created with field validation and examples
- [ ] Service method handles business logic separate from HTTP
- [ ] Route handler is thin (validate -> call service -> return response)
- [ ] Authentication required on all state-changing endpoints (POST, PATCH, DELETE)
- [ ] Ownership check on update and delete operations
- [ ] 404 returned for nonexistent resources
- [ ] 422 returned for invalid input
- [ ] Tests cover: happy path, auth, validation, not found, ownership
- [ ] Route registered in the v1 router
