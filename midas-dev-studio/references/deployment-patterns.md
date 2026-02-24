# Deployment Patterns — MIDAS Dev Studio

Docker, CI/CD, and infrastructure patterns for MIDAS-built applications.

---

## Docker Multi-Stage Builds

### Why
- Separate build dependencies from runtime
- Reduce final image size (often 5-10x smaller)
- Faster deployments with smaller images

### Pattern (Python/FastAPI)
```dockerfile
# Stage 1: Build
FROM python:3.11-slim AS builder
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir .

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY app/ app/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Pattern (Node.js/Next.js)
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

## Health Check Patterns

### Application Health Check
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### Docker Compose Health Check
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 3
  start_period: 30s
```

### PostgreSQL Health Check
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 5s
  timeout: 5s
  retries: 5
```

## Environment Variable Management

### Rules
1. **Never hardcode secrets.** Always use environment variables.
2. **Provide .env.example.** Document every variable with description and default.
3. **Use sensible defaults for development.** Production values come from environment.
4. **Group by concern:** Database, auth, external services, feature flags.

### .env.example Template
```bash
# === Database ===
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appname

# === Authentication ===
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# === Frontend ===
FRONTEND_URL=http://localhost:3000

# === External Services ===
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
```

## CI Pipeline Pattern (GitHub Actions)

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install ruff
      - run: ruff check app/

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -e ".[dev]"
      - run: pytest tests/ -v --cov=app --cov-fail-under=80
```

## Secrets Handling

- **Development:** `.env` file (gitignored)
- **CI:** GitHub Actions secrets → environment variables
- **Production:** Platform secrets manager (Railway, Render, AWS SSM)
- **NEVER:** Commit secrets to git, log secrets in output, expose in API responses
