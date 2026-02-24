---
name: test-generation
description: "Generate comprehensive test suites from requirements and code. Covers unit tests, integration tests, auth tests, and edge cases. Triggers on: test creation, test scaffolding, coverage improvement."
---

# Test Generation

Generate comprehensive test suites from acceptance criteria and code inspection.

## Test Structure

```
tests/
├── conftest.py              # Shared fixtures
├── test_auth.py             # Authentication tests
├── test_[entity].py         # Tests per entity (CRUD + edge cases)
└── test_integration.py      # Cross-feature tests
```

## conftest.py Template

```python
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.main import app
from app.core.database import Base, get_db

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSession = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture
async def db_session():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with TestSession() as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def auth_headers(client):
    # Register + login, return {"Authorization": "Bearer <token>"}
    await client.post("/api/v1/auth/register", json={
        "email": "test@example.com", "password": "TestPass123!"
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "test@example.com", "password": "TestPass123!"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

## Test Categories

### 1. Happy Path Tests (per entity)
- Create entity with valid data → 201
- Get entity by ID → 200
- List entities → 200 with array
- Update entity → 200 with changes
- Delete entity → 204

### 2. Error Path Tests (per entity)
- Create with missing required fields → 422
- Create with invalid data types → 422
- Get non-existent entity → 404
- Update non-existent entity → 404
- Delete non-existent entity → 404
- Create duplicate unique fields → 409

### 3. Auth Tests
- Register with valid data → 201
- Register with duplicate email → 409
- Login with valid credentials → 200 + tokens
- Login with wrong password → 401
- Access protected route without token → 401
- Access protected route with expired token → 401
- Access protected route with valid token → 200
- Refresh token → 200 + new access token
- Admin-only route with user role → 403

### 4. Edge Case Tests
- Empty string vs null vs missing field
- String at max length boundary
- List with zero results
- Pagination: skip beyond total count
- Special characters in text fields

## Coverage Target
- Backend: ≥ 80% line coverage
- Focus: Business logic and error handling paths
- Acceptable gaps: Framework boilerplate, config loading

## Test Naming Convention
```python
async def test_create_entity_with_valid_data_returns_201(client, auth_headers):
    ...

async def test_create_entity_without_auth_returns_401(client):
    ...

async def test_get_nonexistent_entity_returns_404(client, auth_headers):
    ...
```
