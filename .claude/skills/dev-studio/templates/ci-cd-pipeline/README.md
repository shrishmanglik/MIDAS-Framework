# CI/CD Pipeline Template

> GitHub Actions workflow templates for lint, test, build, and deploy stages.

## File Structure

```
.github/
  workflows/
    ci.yml           # Runs on every PR: lint, test, build
    deploy.yml       # Runs on main merge: build + deploy
    codeql.yml       # Weekly security scanning
```

## ci.yml -- Pull Request Pipeline

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  PYTHON_VERSION: "3.11"
  NODE_VERSION: "20"

jobs:
  # ========================================================
  # Backend: Lint + Test
  # ========================================================
  backend-lint:
    name: Backend Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install dependencies
        working-directory: ./backend
        run: |
          pip install poetry
          poetry install --only dev

      - name: Run Ruff linter
        working-directory: ./backend
        run: poetry run ruff check .

      - name: Run Ruff formatter check
        working-directory: ./backend
        run: poetry run ruff format --check .

  backend-test:
    name: Backend Test
    runs-on: ubuntu-latest
    needs: backend-lint

    services:
      postgres:
        image: postgres:15-alpine
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
          python-version: ${{ env.PYTHON_VERSION }}
          cache: "pip"

      - name: Install dependencies
        working-directory: ./backend
        run: |
          pip install poetry
          poetry install

      - name: Run tests with coverage
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: ci-test-secret-not-for-production
        run: |
          poetry run pytest \
            --cov=app \
            --cov-report=term-missing \
            --cov-report=xml:coverage.xml \
            --junitxml=junit.xml \
            -v

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: backend/coverage.xml

  # ========================================================
  # Frontend: Lint + Test + Build
  # ========================================================
  frontend-lint:
    name: Frontend Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run ESLint
        working-directory: ./frontend
        run: npm run lint

      - name: Run Prettier check
        working-directory: ./frontend
        run: npx prettier --check "src/**/*.{ts,tsx,css}"

      - name: TypeScript type check
        working-directory: ./frontend
        run: npx tsc --noEmit

  frontend-test:
    name: Frontend Test
    runs-on: ubuntu-latest
    needs: frontend-lint
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run tests with coverage
        working-directory: ./frontend
        run: npm test -- --coverage --ci

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: frontend-coverage
          path: frontend/coverage/

  frontend-build:
    name: Frontend Build
    runs-on: ubuntu-latest
    needs: frontend-test
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build
        working-directory: ./frontend
        env:
          NEXT_PUBLIC_API_URL: https://api.example.com/api/v1
        run: npm run build

  # ========================================================
  # Docker Build Verification
  # ========================================================
  docker-build:
    name: Docker Build
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-build]
    steps:
      - uses: actions/checkout@v4

      - name: Build backend image
        run: docker build -t app-backend ./backend

      - name: Build frontend image
        run: docker build -t app-frontend ./frontend --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

      - name: Verify images
        run: |
          docker images app-backend
          docker images app-frontend
```

## deploy.yml -- Deployment Pipeline

```yaml
name: Deploy

on:
  push:
    branches: [main]

concurrency:
  group: deploy
  cancel-in-progress: false  # Never cancel an in-progress deployment

jobs:
  # ========================================================
  # Deploy Backend to Railway
  # ========================================================
  deploy-backend:
    name: Deploy Backend
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm i -g @railway/cli

      - name: Deploy to Railway
        working-directory: ./backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: railway up --service backend

      - name: Wait for deployment
        run: sleep 30

      - name: Health check
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ vars.BACKEND_URL }}/health)
          if [ "$STATUS" != "200" ]; then
            echo "Health check failed with status: $STATUS"
            exit 1
          fi
          echo "Health check passed."

  # ========================================================
  # Deploy Frontend to Vercel
  # ========================================================
  deploy-frontend:
    name: Deploy Frontend
    runs-on: ubuntu-latest
    needs: deploy-backend
    environment: production

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install Vercel CLI
        run: npm i -g vercel@latest

      - name: Deploy to Vercel
        working-directory: ./frontend
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: vercel --prod --token=$VERCEL_TOKEN

  # ========================================================
  # Post-Deploy Validation
  # ========================================================
  validate:
    name: Post-Deploy Validation
    runs-on: ubuntu-latest
    needs: [deploy-backend, deploy-frontend]
    steps:
      - name: Validate backend health
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ vars.BACKEND_URL }}/health)
          echo "Backend health: $STATUS"
          [ "$STATUS" = "200" ] || exit 1

      - name: Validate frontend
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ vars.FRONTEND_URL }})
          echo "Frontend status: $STATUS"
          [ "$STATUS" = "200" ] || exit 1

      - name: Notify success
        if: success()
        run: echo "Deployment successful. Backend and frontend are healthy."

      - name: Notify failure
        if: failure()
        run: echo "::error::Post-deploy validation failed. Check service health."
```

## codeql.yml -- Security Scanning

```yaml
name: CodeQL Analysis

on:
  schedule:
    - cron: "0 6 * * 1"  # Every Monday at 6 AM UTC
  push:
    branches: [main]

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ["python", "javascript"]

    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

## Required Secrets

| Secret | Where | Description |
|--------|-------|-------------|
| `RAILWAY_TOKEN` | GitHub Secrets | Railway deployment token |
| `VERCEL_TOKEN` | GitHub Secrets | Vercel deployment token |
| `VERCEL_ORG_ID` | GitHub Secrets | Vercel organization ID |
| `VERCEL_PROJECT_ID` | GitHub Secrets | Vercel project ID |

## Required Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `BACKEND_URL` | GitHub Variables | Production backend URL (e.g., https://api.example.com) |
| `FRONTEND_URL` | GitHub Variables | Production frontend URL (e.g., https://app.example.com) |

## Usage

1. Copy the `.github/workflows/` directory to your project root.
2. Set up secrets in GitHub repository settings.
3. Set up variables in GitHub repository settings.
4. Push to `main` to trigger the deploy pipeline.
5. Open a PR to trigger the CI pipeline.
