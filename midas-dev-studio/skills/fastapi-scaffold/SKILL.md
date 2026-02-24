---
name: fastapi-scaffold
description: "Generate a complete FastAPI project structure from architecture specs. Uses templates for 75%+ of the code. Triggers on: FastAPI scaffolding, backend project setup, API skeleton generation."
---

# FastAPI Scaffold

Generate a production-ready FastAPI project structure. This is a Tier 1 operation (template-based) for the skeleton, with Tier 3 only for business logic.

## Standard Structure

```
app/
├── __init__.py
├── main.py                # FastAPI app creation, middleware, CORS, routers
├── core/
│   ├── __init__.py
│   ├── config.py          # Pydantic Settings for env vars
│   ├── database.py        # SQLAlchemy engine, session, Base
│   ├── dependencies.py    # Dependency injection (get_db, get_current_user)
│   └── security.py        # JWT creation, verification, password hashing
├── models/
│   ├── __init__.py
│   └── [entity].py        # SQLAlchemy models (one file per entity)
├── schemas/
│   ├── __init__.py
│   └── [entity].py        # Pydantic schemas (Create, Update, Response, InDB)
├── routes/
│   ├── __init__.py
│   └── [entity].py        # FastAPI routers (one file per entity/resource)
├── services/
│   ├── __init__.py
│   └── [entity].py        # Business logic (one file per entity)
└── utils/
    ├── __init__.py
    └── exceptions.py      # Custom exception classes + handlers
```

## Template: main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# import all routers

app = FastAPI(title="{project_name}", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include all routers with prefix /api/v1/{entity}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## Template: config.py

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:pass@localhost:5432/dbname"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"

settings = Settings()
```

## Template: database.py

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"))
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session() as session:
        yield session
```

## Template: security.py

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
```

## Per-Entity Generation

For each data entity in the architecture, generate:
1. **Model** (Tier 1): SQLAlchemy model with id, created_at, updated_at + entity fields
2. **Schemas** (Tier 1): Create, Update, Response, InDB Pydantic models
3. **Route** (Tier 1): CRUD endpoints (GET list, GET by id, POST, PUT, DELETE)
4. **Service** (Tier 1 for CRUD, Tier 3 for custom business logic): Data access layer

The Backend Developer agent uses these templates as starting points and adds business logic specific to the project requirements.
