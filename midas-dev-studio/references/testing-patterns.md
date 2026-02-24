# Testing Patterns — MIDAS Dev Studio

Test strategies, fixture patterns, and conventions for MIDAS-built applications.

---

## Test Organization

```
tests/
├── conftest.py           # Shared fixtures (DB, client, auth)
├── test_auth.py          # Auth endpoints + token tests
├── test_[entity].py      # CRUD tests per entity
└── test_integration.py   # Cross-feature scenarios
```

## Naming Convention

```python
# Pattern: test_{action}_{subject}_{condition}_{expected_result}
async def test_create_book_with_valid_data_returns_201(client, auth_headers):
    ...

async def test_get_book_with_invalid_id_returns_404(client, auth_headers):
    ...

async def test_list_books_without_auth_returns_401(client):
    ...
```

## FastAPI Test Client Setup

```python
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import Base, get_db

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
```

## Database Fixture (SQLite for Tests)

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

TEST_DB = "sqlite+aiosqlite:///./test.db"
engine = create_async_engine(TEST_DB, echo=False)
TestSession = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture
async def db_session():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with TestSession() as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
```

## Auth Fixture

```python
@pytest_asyncio.fixture
async def auth_headers(client):
    await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "TestPass123!"
    })
    resp = await client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "TestPass123!"
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

## What to Test

### Always Test
- Happy path CRUD operations
- Authentication required/forbidden scenarios
- Validation errors for invalid input
- 404 for non-existent resources
- Duplicate unique constraint violations (409)

### Test When Relevant
- Pagination boundaries
- Filter and search functionality
- Role-based access (admin vs user)
- Cascade delete behavior
- Edge cases specific to business logic

### Don't Test
- Framework internals (FastAPI routing, Pydantic validation details)
- Third-party library behavior
- Database ORM internals

## Mocking Strategy

- **Don't mock the database** — use SQLite in-memory for tests
- **Don't mock FastAPI** — use AsyncClient with the real app
- **Do mock external APIs** — use `unittest.mock.patch` or `respx`
- **Do mock time** — use `freezegun` for time-dependent tests
- **Do mock email/SMS** — never send real notifications in tests

## Coverage Targets

| Component | Minimum Coverage |
|---|---|
| Routes/endpoints | 90% |
| Services/business logic | 85% |
| Models | 70% (mostly via integration) |
| Utils/helpers | 80% |
| **Overall** | **80%** |
