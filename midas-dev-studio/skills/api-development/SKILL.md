---
name: api-development
description: "Implement REST API endpoints including CRUD operations, authentication, middleware, and error handling. Triggers on: API implementation, endpoint creation, auth flow, middleware setup."
---

# API Development

Implement FastAPI endpoints from architecture specs and OpenAPI definitions.

## Standard CRUD Template

For each entity, generate 5 endpoints:

```
GET    /api/v1/{entities}        → List (paginated)
GET    /api/v1/{entities}/{id}   → Get by ID
POST   /api/v1/{entities}        → Create
PUT    /api/v1/{entities}/{id}   → Update
DELETE /api/v1/{entities}/{id}   → Delete
```

## Route Template

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_user
from app.schemas.entity import EntityCreate, EntityUpdate, EntityResponse
from app.services import entity as entity_service

router = APIRouter(prefix="/api/v1/entities", tags=["entities"])

@router.get("/", response_model=list[EntityResponse])
async def list_entities(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await entity_service.get_multi(db, skip=skip, limit=limit)

@router.get("/{entity_id}", response_model=EntityResponse)
async def get_entity(entity_id: int, db: AsyncSession = Depends(get_db)):
    entity = await entity_service.get(db, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity

@router.post("/", response_model=EntityResponse, status_code=201)
async def create_entity(
    data: EntityCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await entity_service.create(db, data)

@router.put("/{entity_id}", response_model=EntityResponse)
async def update_entity(
    entity_id: int,
    data: EntityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entity = await entity_service.update(db, entity_id, data)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity

@router.delete("/{entity_id}", status_code=204)
async def delete_entity(
    entity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    success = await entity_service.delete(db, entity_id)
    if not success:
        raise HTTPException(status_code=404, detail="Entity not found")
```

## Auth Endpoints Template

```
POST /api/v1/auth/register    → Create account
POST /api/v1/auth/login       → Get access + refresh tokens
POST /api/v1/auth/refresh     → Refresh access token
POST /api/v1/auth/logout      → Invalidate refresh token
GET  /api/v1/auth/me          → Get current user
```

## Error Handling Pattern

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail

async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code},
    )
```

## Middleware Stack
1. CORS middleware (allow frontend origin)
2. Request ID middleware (tracing)
3. Exception handlers (custom + validation)

## Tier Classification
- CRUD endpoints: Tier 1 (template) — identical pattern per entity
- Auth endpoints: Tier 1 (template) — standard JWT flow
- Custom business logic: Tier 3 (LLM) — project-specific behavior
- Middleware: Tier 1 (template) — standard FastAPI patterns
