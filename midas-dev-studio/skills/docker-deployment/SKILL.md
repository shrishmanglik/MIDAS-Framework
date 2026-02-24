---
name: docker-deployment
description: "Generate Docker and CI/CD configurations from project architecture. Almost entirely template-based (Tier 1). Triggers on: deployment setup, Docker configuration, CI/CD pipeline creation."
---

# Docker Deployment (Tier 1 — Templates)

## Dockerfile Template (Backend)

```dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir .

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY app/ app/
COPY alembic/ alembic/
COPY alembic.ini .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## docker-compose.yaml Template

```yaml
version: "3.9"
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/${project_name}
      - SECRET_KEY=${secret_key}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${project_name}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

## GitHub Actions CI Template

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -e ".[dev]"
      - run: ruff check app/
      - run: pytest tests/ -v --cov=app
```

## .env.example Template

Generate from the architecture spec's environment variables:

```
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dbname

# Authentication
SECRET_KEY=change-me-in-production-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Validation Steps

1. `docker compose config` — validates YAML syntax
2. `docker compose build --no-cache` — verifies Dockerfile builds
3. `docker compose up -d` — starts all services
4. `curl -f http://localhost:8000/health` — health check passes
5. `docker compose down` — clean shutdown

## Frontend Dockerfile (when applicable)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json .
EXPOSE 3000
CMD ["npm", "start"]
```
