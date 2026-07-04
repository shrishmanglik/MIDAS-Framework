"""
Shared test fixtures for the LegalAI backend test suite.

Uses an in-memory SQLite database for unit/integration tests to avoid
requiring a PostgreSQL instance during CI.
"""

import asyncio
import os
from collections.abc import AsyncGenerator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Override settings before importing the app
os.environ["JWT_SECRET"] = "test-secret-key-for-unit-tests-only"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///test.db"
os.environ["DEBUG"] = "false"
os.environ["CLAUDE_API_KEY"] = ""

from app.core.dependencies import get_db
from app.core.security import create_access_token, hash_password
from app.models.base import Base
from app.models.user import User, UserRole

# Create a test engine using SQLite async
TEST_DATABASE_URL = "sqlite+aiosqlite://"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session_factory = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create tables and yield a fresh session per test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with test_session_factory() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """HTTP test client with database dependency overridden."""
    from app.main import app

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a regular test user."""
    user = User(
        id=uuid4(),
        email="testuser@example.com",
        password_hash=hash_password("testpassword123"),
        name="Test User",
        role=UserRole.user,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """Create an admin test user."""
    user = User(
        id=uuid4(),
        email="admin@example.com",
        password_hash=hash_password("adminpassword123"),
        name="Admin User",
        role=UserRole.admin,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def user_token(test_user: User) -> str:
    """Generate a valid access token for the test user."""
    return create_access_token(
        data={"sub": str(test_user.id), "email": test_user.email, "role": test_user.role.value}
    )


@pytest.fixture
def admin_token(admin_user: User) -> str:
    """Generate a valid access token for the admin user."""
    return create_access_token(
        data={"sub": str(admin_user.id), "email": admin_user.email, "role": admin_user.role.value}
    )


@pytest.fixture
def auth_headers(user_token: str) -> dict[str, str]:
    """Authorization headers for a regular user."""
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture
def admin_headers(admin_token: str) -> dict[str, str]:
    """Authorization headers for an admin user."""
    return {"Authorization": f"Bearer {admin_token}"}
