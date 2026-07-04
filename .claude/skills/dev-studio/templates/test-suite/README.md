# Test Suite Template

> Test setup templates for pytest (backend) and Jest (frontend) with fixtures, mocks, and common patterns.

## Directory Structure

```
Backend (pytest):
  tests/
    __init__.py
    conftest.py              # Shared fixtures: db session, client, auth
    unit/
      __init__.py
      test_auth_service.py   # Service-layer unit tests
      test_validators.py     # Validation logic tests
    integration/
      __init__.py
      test_auth_routes.py    # API endpoint tests
      test_health.py         # Health check test
    security/
      __init__.py
      test_injection.py      # SQL injection, XSS tests
      test_auth_bypass.py    # Authentication bypass attempts

Frontend (Jest):
  __tests__/
    setup.ts                 # Jest setup file
    components/
      button.test.tsx
      form.test.tsx
    lib/
      api-client.test.ts
    pages/
      login.test.tsx
```

## pytest Configuration -- pyproject.toml

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "security: marks security-related tests",
    "integration: marks integration tests requiring database",
]
filterwarnings = [
    "ignore::DeprecationWarning",
]

[tool.coverage.run]
source = ["app"]
omit = ["app/models/*", "app/core/config.py"]

[tool.coverage.report]
fail_under = 80
show_missing = true
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "if __name__ == .__main__.",
]
```

## conftest.py -- Shared Fixtures

```python
import asyncio
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.security import hash_password, create_access_token
from app.core.dependencies import get_db
from app.main import app
from app.models.base import Base
from app.models.user import User, UserRole


# ============================================================
# Database Fixtures
# ============================================================

TEST_DB_URL = settings.DATABASE_URL.replace("/appdb", "/test_appdb")
test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSessionFactory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    """Create a single event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def setup_database():
    """Create tables before each test, drop after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db() -> AsyncSession:
    """Provide a test database session."""
    async with TestSessionFactory() as session:
        yield session


# ============================================================
# HTTP Client Fixture
# ============================================================

@pytest.fixture
async def client(db) -> AsyncClient:
    """Provide an async HTTP test client with database override."""
    async def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ============================================================
# User Fixtures
# ============================================================

@pytest.fixture
async def candidate(db) -> User:
    """Create a candidate user in the test database."""
    user = User(
        id=uuid4(),
        email="candidate@test.com",
        password_hash=hash_password("TestPass123!"),
        name="Test Candidate",
        role=UserRole.CANDIDATE,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def employer(db) -> User:
    """Create an employer user in the test database."""
    user = User(
        id=uuid4(),
        email="employer@test.com",
        password_hash=hash_password("TestPass123!"),
        name="Test Employer",
        role=UserRole.EMPLOYER,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# ============================================================
# Auth Header Fixtures
# ============================================================

@pytest.fixture
def candidate_headers(candidate) -> dict:
    """Auth headers for the candidate user."""
    token = create_access_token(str(candidate.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def employer_headers(employer) -> dict:
    """Auth headers for the employer user."""
    token = create_access_token(str(employer.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def expired_headers() -> dict:
    """Auth headers with an expired token."""
    from datetime import timedelta
    token = create_access_token("fake-user-id", expires_delta=timedelta(seconds=-1))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def invalid_headers() -> dict:
    """Auth headers with a malformed token."""
    return {"Authorization": "Bearer not-a-valid-jwt-token"}
```

## Unit Test Pattern -- test_auth_service.py

```python
import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.services.auth_service import AuthService
from app.schemas.auth import UserCreate, LoginRequest
from app.models.user import UserRole


class TestAuthServiceRegister:
    """Tests for AuthService.register()"""

    async def test_register_creates_user_with_hashed_password(self, db):
        service = AuthService(db)
        payload = UserCreate(
            email="new@test.com",
            password="SecurePass123!",
            name="New User",
            role="candidate",
        )
        user = await service.register(payload)

        assert user.email == "new@test.com"
        assert user.name == "New User"
        assert user.role == UserRole.CANDIDATE
        assert user.password_hash != "SecurePass123!"  # Must be hashed

    async def test_register_duplicate_email_raises_conflict(self, db, candidate):
        service = AuthService(db)
        payload = UserCreate(
            email="candidate@test.com",  # Same as fixture
            password="SecurePass123!",
            name="Duplicate User",
            role="candidate",
        )
        with pytest.raises(ValueError, match="already registered"):
            await service.register(payload)


class TestAuthServiceLogin:
    """Tests for AuthService.login()"""

    async def test_login_valid_credentials_returns_token(self, db, candidate):
        service = AuthService(db)
        payload = LoginRequest(email="candidate@test.com", password="TestPass123!")
        result = await service.login(payload)

        assert result.token is not None
        assert len(result.token) > 0

    async def test_login_wrong_password_raises_error(self, db, candidate):
        service = AuthService(db)
        payload = LoginRequest(email="candidate@test.com", password="WrongPassword")
        with pytest.raises(ValueError, match="Invalid credentials"):
            await service.login(payload)

    async def test_login_nonexistent_email_raises_error(self, db):
        service = AuthService(db)
        payload = LoginRequest(email="ghost@test.com", password="AnyPassword123")
        with pytest.raises(ValueError, match="Invalid credentials"):
            await service.login(payload)
```

## Integration Test Pattern -- test_auth_routes.py

```python
import pytest


class TestRegisterEndpoint:
    """POST /api/v1/auth/register"""

    async def test_register_valid_input_returns_201(self, client):
        response = await client.post("/api/v1/auth/register", json={
            "email": "newuser@test.com",
            "password": "SecurePass123!",
            "name": "New User",
            "role": "candidate",
        })
        assert response.status_code == 201
        data = response.json()["data"]
        assert data["email"] == "newuser@test.com"
        assert "token" in data

    async def test_register_duplicate_email_returns_409(self, client, candidate):
        response = await client.post("/api/v1/auth/register", json={
            "email": "candidate@test.com",
            "password": "SecurePass123!",
            "name": "Duplicate",
            "role": "candidate",
        })
        assert response.status_code == 409

    async def test_register_missing_email_returns_422(self, client):
        response = await client.post("/api/v1/auth/register", json={
            "password": "SecurePass123!",
            "name": "No Email",
            "role": "candidate",
        })
        assert response.status_code == 422

    async def test_register_short_password_returns_422(self, client):
        response = await client.post("/api/v1/auth/register", json={
            "email": "user@test.com",
            "password": "short",
            "name": "Short Pass",
            "role": "candidate",
        })
        assert response.status_code == 422

    async def test_register_invalid_role_returns_422(self, client):
        response = await client.post("/api/v1/auth/register", json={
            "email": "user@test.com",
            "password": "SecurePass123!",
            "name": "Bad Role",
            "role": "superadmin",
        })
        assert response.status_code == 422


class TestLoginEndpoint:
    """POST /api/v1/auth/login"""

    async def test_login_valid_credentials_returns_200(self, client, candidate):
        response = await client.post("/api/v1/auth/login", json={
            "email": "candidate@test.com",
            "password": "TestPass123!",
        })
        assert response.status_code == 200
        assert "token" in response.json()["data"]

    async def test_login_wrong_password_returns_401(self, client, candidate):
        response = await client.post("/api/v1/auth/login", json={
            "email": "candidate@test.com",
            "password": "WrongPassword",
        })
        assert response.status_code == 401


class TestProtectedEndpoint:
    """Verify auth enforcement on protected routes"""

    async def test_no_token_returns_401(self, client):
        response = await client.get("/api/v1/protected-resource")
        assert response.status_code in [401, 403]

    async def test_expired_token_returns_401(self, client, expired_headers):
        response = await client.get("/api/v1/protected-resource", headers=expired_headers)
        assert response.status_code == 401

    async def test_invalid_token_returns_401(self, client, invalid_headers):
        response = await client.get("/api/v1/protected-resource", headers=invalid_headers)
        assert response.status_code == 401

    async def test_valid_token_returns_200(self, client, candidate_headers):
        response = await client.get("/api/v1/protected-resource", headers=candidate_headers)
        assert response.status_code == 200
```

## Security Test Pattern -- test_injection.py

```python
import pytest

INJECTION_PAYLOADS = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "1; SELECT * FROM users",
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert(1)>",
    "{{7*7}}",
    "${7*7}",
    "../../../etc/passwd",
]


class TestSQLInjection:
    """Verify SQL injection payloads are safely handled."""

    @pytest.mark.parametrize("payload", INJECTION_PAYLOADS[:4])
    async def test_search_rejects_sql_injection(self, client, payload):
        response = await client.get(f"/api/v1/jobs?q={payload}")
        assert response.status_code in [200, 422]
        # If 200, verify the payload was treated as literal text (no data leaked)
        if response.status_code == 200:
            assert "users" not in str(response.json()).lower() or response.json()["data"] == []


class TestXSSPrevention:
    """Verify XSS payloads are sanitized or rejected."""

    @pytest.mark.parametrize("payload", INJECTION_PAYLOADS[4:6])
    async def test_create_resource_sanitizes_xss(self, client, employer_headers, payload):
        response = await client.post("/api/v1/jobs", json={
            "title": payload,
            "description": "Normal description",
            "location": "Austin, TX",
            "salary_min": 50000,
            "salary_max": 100000,
        }, headers=employer_headers)
        # XSS should either be rejected (422) or stored safely (201 with escaped output)
        assert response.status_code in [201, 422]
        if response.status_code == 201:
            assert "<script>" not in response.json()["data"]["title"]
```

## Jest Configuration -- jest.config.ts

```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/__tests__/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/types/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

export default createJestConfig(config);
```

## Jest Setup -- __tests__/setup.ts

```typescript
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://test-api:8000/api/v1";
```

## Component Test Pattern -- button.test.tsx

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

## Test Naming Convention

```
test_[feature]_[scenario]_[expected_result]

Examples:
  test_register_valid_input_returns_201
  test_register_duplicate_email_returns_409
  test_login_wrong_password_returns_401
  test_create_job_missing_title_returns_422
  test_delete_job_unauthorized_returns_401
  test_search_empty_query_returns_all_results
```
