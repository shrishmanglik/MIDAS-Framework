# FastAPI App Template

> Complete scaffold for a FastAPI backend application with async SQLAlchemy, JWT auth, Pydantic validation, and structured project layout.

## Project Structure

```
backend/
  app/
    __init__.py
    main.py                    # App creation, middleware, lifespan events
    core/
      __init__.py
      config.py                # Pydantic BaseSettings (env vars)
      security.py              # JWT creation/verification, password hashing
      dependencies.py          # Shared FastAPI dependencies
      database.py              # Async engine, session factory
      exceptions.py            # Custom exception classes
    api/
      __init__.py
      v1/
        __init__.py
        router.py              # Aggregated v1 router
        routes/
          __init__.py
          auth.py              # Register, login, refresh
          health.py            # Health check endpoint
    schemas/
      __init__.py
      auth.py                  # Auth request/response models
      common.py                # Shared pagination, error models
    services/
      __init__.py
      auth_service.py          # Auth business logic
    models/
      __init__.py
      base.py                  # Declarative base, mixins
      user.py                  # User model
  alembic/
    env.py
    versions/
  alembic.ini
  pyproject.toml
  tests/
    __init__.py
    conftest.py                # Fixtures: test client, db session, auth headers
    test_auth.py
  scripts/
    seed.py
  .env.example
```

## pyproject.toml

```toml
[tool.poetry]
name = "my-backend"
version = "0.1.0"
description = "FastAPI backend application"
authors = ["Team <team@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.109.0"
uvicorn = {version = "^0.27.0", extras = ["standard"]}
sqlalchemy = {version = "^2.0.0", extras = ["asyncio"]}
asyncpg = "^0.29.0"
alembic = "^1.13.0"
pydantic = "^2.6.0"
pydantic-settings = "^2.1.0"
python-jose = {version = "^3.3.0", extras = ["cryptography"]}
passlib = {version = "^1.7.4", extras = ["bcrypt"]}
python-multipart = "^0.0.6"

[tool.poetry.group.dev.dependencies]
pytest = "^8.0.0"
pytest-asyncio = "^0.23.0"
httpx = "^0.27.0"
ruff = "^0.3.0"
coverage = "^7.4.0"

[tool.ruff]
target-version = "py311"
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM", "S"]
ignore = ["S101"]  # Allow assert in tests

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

## app/main.py

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: verify database connection
    async with engine.begin() as conn:
        await conn.execute("SELECT 1")
    yield
    # Shutdown: dispose connection pool
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_v1_router, prefix="/api/v1")
```

## app/core/config.py

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "My Backend"
    VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/mydb"

    # Auth
    JWT_SECRET: str  # Required -- no default for secrets
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
```

## app/core/database.py

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

async_session_factory = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
```

## app/core/security.py

```python
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return jwt.encode(
        {"sub": subject, "exp": expire, "type": "access"},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": subject, "exp": expire, "type": "refresh"},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
```

## app/core/dependencies.py

```python
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.core.security import decode_token
from app.models.user import User

security_scheme = HTTPBearer()


async def get_db():
    async with async_session_factory() as session:
        yield session


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security_scheme)],
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = decode_token(credentials.credentials)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def require_role(role: str):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role}' required",
            )
        return current_user
    return role_checker
```

## app/api/v1/routes/health.py

```python
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint. Verifies database connectivity."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception:
        return {"status": "degraded", "database": "disconnected"}
```

## app/schemas/common.py

```python
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str
    code: str | None = None
    errors: list[dict] | None = None


class PaginationMeta(BaseModel):
    total: int
    skip: int
    limit: int
```

## tests/conftest.py

```python
import asyncio
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.database import async_session_factory
from app.core.dependencies import get_db
from app.core.security import hash_password, create_access_token
from app.main import app
from app.models.base import Base
from app.models.user import User, UserRole

TEST_DATABASE_URL = settings.DATABASE_URL.replace("/mydb", "/test_mydb")
test_engine = create_async_engine(TEST_DATABASE_URL)
test_session_factory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session():
    async with test_session_factory() as session:
        yield session


@pytest.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session):
    user = User(
        id=uuid4(),
        email="test@example.com",
        password_hash=hash_password("testpassword123"),
        name="Test User",
        role=UserRole.CANDIDATE,
    )
    db_session.add(user)
    await db_session.commit()
    return user


@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(str(test_user.id))
    return {"Authorization": f"Bearer {token}"}
```

## .env.example

```bash
# Database connection (required)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/mydb

# JWT signing secret -- generate with: openssl rand -hex 32 (required)
JWT_SECRET=

# CORS allowed origins, comma-separated (required)
CORS_ORIGINS=["http://localhost:3000"]

# Debug mode (optional, default: false)
DEBUG=false
```

## Usage

1. Copy this template to your project directory.
2. Run `poetry install` to install dependencies.
3. Copy `.env.example` to `.env` and configure values.
4. Start PostgreSQL and create the database.
5. Run `alembic upgrade head` to apply migrations.
6. Run `uvicorn app.main:app --reload` to start the development server.
7. Visit `http://localhost:8000/docs` for interactive API documentation.
