# Docker Configuration Template

> Docker + docker-compose setup for a Python backend (FastAPI) + Node.js frontend (Next.js) + PostgreSQL stack.

## File Structure

```
project-root/
  backend/
    Dockerfile
    .dockerignore
  frontend/
    Dockerfile
    .dockerignore
  docker-compose.yml
  docker-compose.dev.yml
  .env.example
```

## Backend Dockerfile -- backend/Dockerfile

```dockerfile
# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM python:3.11-slim AS dependencies

WORKDIR /app

# Install system dependencies for psycopg2/asyncpg
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml poetry.lock* ./
RUN pip install --no-cache-dir poetry==1.7.1 \
    && poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --only main --no-root

# ============================================================
# Stage 2: Production image
# ============================================================
FROM python:3.11-slim AS production

# Install runtime-only system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Security: create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

WORKDIR /app

# Copy installed packages from dependencies stage
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Remove files that should not be in production image
RUN rm -rf .env* .git tests/ docs/ scripts/ *.md

# Switch to non-root user
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

## Frontend Dockerfile -- frontend/Dockerfile

```dockerfile
# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ============================================================
# Stage 2: Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# Build arguments for environment variables needed at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# ============================================================
# Stage 3: Production
# ============================================================
FROM node:20-alpine AS production

# Security: create non-root user
RUN addgroup --system --gid 1001 appuser \
    && adduser --system --uid 1001 appuser

WORKDIR /app

# Copy only necessary build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static

USER appuser

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
```

## docker-compose.yml -- Production

```yaml
version: "3.9"

services:
  # --------------------------------------------------------
  # PostgreSQL Database
  # --------------------------------------------------------
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-appdb}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-appdb}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # --------------------------------------------------------
  # FastAPI Backend
  # --------------------------------------------------------
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-appdb}
      JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
      CORS_ORIGINS: ${CORS_ORIGINS:-["http://localhost:3000"]}
    ports:
      - "${BACKEND_PORT:-8000}:8000"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 15s

  # --------------------------------------------------------
  # Next.js Frontend
  # --------------------------------------------------------
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:8000/api/v1}
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

volumes:
  pgdata:
    driver: local
```

## docker-compose.dev.yml -- Development Overrides

```yaml
version: "3.9"

services:
  backend:
    build:
      target: dependencies
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    environment:
      DEBUG: "true"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: dependencies
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
```

## .dockerignore -- backend/.dockerignore

```
__pycache__/
*.pyc
*.pyo
.git/
.gitignore
.env
.env.*
!.env.example
.venv/
venv/
tests/
docs/
*.md
.coverage
htmlcov/
.pytest_cache/
.ruff_cache/
.mypy_cache/
```

## .dockerignore -- frontend/.dockerignore

```
node_modules/
.next/
.git/
.gitignore
.env
.env.*
!.env.example
*.md
coverage/
.eslintcache
```

## .env.example

```bash
# ===========================================
# Database
# ===========================================
POSTGRES_DB=appdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=        # REQUIRED: Set a strong password
DB_PORT=5432

# ===========================================
# Backend
# ===========================================
JWT_SECRET=               # REQUIRED: Generate with: openssl rand -hex 32
CORS_ORIGINS=["http://localhost:3000"]
BACKEND_PORT=8000

# ===========================================
# Frontend
# ===========================================
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
FRONTEND_PORT=3000
```

## Commands

```bash
# Start all services (production mode)
docker-compose up -d

# Start with development overrides (hot reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run database migrations
docker-compose exec backend alembic upgrade head

# Run backend tests
docker-compose exec backend pytest

# Rebuild after dependency changes
docker-compose build --no-cache backend

# Stop and remove all containers
docker-compose down

# Stop and remove containers AND volumes (deletes database data)
docker-compose down -v
```

## Security Checklist

- [ ] All containers run as non-root users
- [ ] No secrets in Dockerfiles or docker-compose.yml (only env var references)
- [ ] Base images pinned to specific versions (not `latest`)
- [ ] .dockerignore excludes .env files, tests, docs, and .git
- [ ] Health checks configured for all services
- [ ] Production images use multi-stage builds (minimal final image)
- [ ] Database password is required (not optional with a default)
- [ ] JWT secret is required (not optional with a default)
