# File Ownership by Agent

> Every file in the project has exactly one owning agent. The owner is responsible for creating, modifying, and maintaining that file. Other agents may READ these files but must NEVER modify files they do not own.

## Product Manager

| Pattern | Description |
|---------|-------------|
| `docs/requirements.md` | Structured requirements document |
| `docs/user-stories.md` | User stories with acceptance criteria |
| `docs/scope.md` | Scope boundaries and out-of-scope list |
| `docs/feature-priorities.md` | Feature priority matrix (P0/P1/P2) |

## Systems Architect

| Pattern | Description |
|---------|-------------|
| `docs/architecture.md` | System architecture specification |
| `docs/api-contracts.md` | Complete API contract definitions |
| `docs/adr/ADR-*.md` | Architecture Decision Records |
| `docs/data-model.md` | Database schema design document |
| `docs/auth-model.md` | Authentication and authorization specification |

## Database Engineer

| Pattern | Description |
|---------|-------------|
| `app/models/*.py` | SQLAlchemy model definitions |
| `app/models/base.py` | Declarative base and shared mixins |
| `alembic/versions/*.py` | Database migration scripts |
| `alembic/env.py` | Alembic environment configuration |
| `prisma/schema.prisma` | Prisma schema (if using Prisma) |
| `prisma/migrations/**` | Prisma migration files |
| `prisma/seed.ts` | Prisma seed script |
| `scripts/seed.py` | Development seed data script |

## Backend Developer

| Pattern | Description |
|---------|-------------|
| `app/main.py` | FastAPI application creation and middleware |
| `app/api/v1/router.py` | Aggregated v1 API router |
| `app/api/v1/routes/*.py` | API route handler modules |
| `app/services/*.py` | Business logic service classes |
| `app/schemas/*.py` | Pydantic request/response models |
| `app/core/config.py` | Application settings from env vars |
| `app/core/security.py` | JWT tokens and password hashing |
| `app/core/dependencies.py` | Shared FastAPI dependencies |
| `app/core/exceptions.py` | Custom exception classes and handlers |
| `app/core/middleware.py` | Custom middleware implementations |

## Frontend Developer

| Pattern | Description |
|---------|-------------|
| `src/app/**/*.tsx` | Next.js App Router pages and layouts |
| `src/components/**/*.tsx` | Reusable React components |
| `src/components/ui/*.tsx` | shadcn/ui primitive components |
| `src/lib/api/*.ts` | API client modules |
| `src/lib/hooks/*.ts` | Custom React hooks |
| `src/lib/utils/*.ts` | Utility functions (cn, formatters) |
| `src/lib/validations/*.ts` | Zod validation schemas |
| `src/types/*.ts` | TypeScript type definitions |
| `src/app/globals.css` | Global styles and CSS custom properties |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `postcss.config.js` | PostCSS configuration |
| `package.json` | Frontend dependencies (shared with DevOps for build scripts) |

## QA Engineer

| Pattern | Description |
|---------|-------------|
| `tests/**/*.py` | All Python test files |
| `tests/conftest.py` | Shared test fixtures |
| `tests/unit/**` | Unit test files |
| `tests/integration/**` | Integration test files |
| `tests/security/**` | Security test files |
| `__tests__/**/*.test.tsx` | Frontend component tests |
| `__tests__/**/*.test.ts` | Frontend utility tests |
| `__tests__/setup.ts` | Jest setup file |
| `jest.config.ts` | Jest configuration |
| `pytest.ini` | Pytest configuration (if separate from pyproject.toml) |
| `.coveragerc` | Coverage configuration (if separate from pyproject.toml) |
| `playwright.config.ts` | Playwright E2E configuration |
| `e2e/**` | End-to-end test files |

## DevOps Engineer

| Pattern | Description |
|---------|-------------|
| `Dockerfile` | Backend Docker build |
| `frontend/Dockerfile` | Frontend Docker build |
| `docker-compose.yml` | Production compose configuration |
| `docker-compose.dev.yml` | Development compose overrides |
| `.dockerignore` | Docker build exclusions |
| `.github/workflows/*.yml` | GitHub Actions CI/CD pipelines |
| `.env.example` | Environment variable template |
| `nginx/*.conf` | Reverse proxy configuration |
| `scripts/healthcheck.sh` | Container health check scripts |
| `scripts/deploy.sh` | Deployment automation scripts |

## Technical Writer

| Pattern | Description |
|---------|-------------|
| `README.md` | Project README with setup instructions |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CHANGELOG.md` | Release changelog |
| `docs/api-documentation.md` | API reference documentation |
| `docs/setup-guide.md` | Detailed setup guide |
| `LICENSE` | License file |

## Shared Ownership Rules

1. **`pyproject.toml`** -- Backend Developer owns `[tool.poetry.dependencies]`; QA Engineer owns `[tool.pytest]` and `[tool.coverage]`; DevOps owns `[tool.ruff]`.
2. **`package.json`** -- Frontend Developer owns `dependencies` and `devDependencies`; DevOps owns `scripts.build` and `scripts.deploy`.
3. **`.gitignore`** -- DevOps Engineer owns and maintains.
4. **Inline code comments** -- The file owner writes implementation comments; Technical Writer may add documentation comments for complex business logic.

## Conflict Resolution

If two agents need to modify the same file:

1. The file owner has final authority on the file's content.
2. The requesting agent must provide a specific change request to the owner.
3. The owner reviews and applies the change (or rejects with justification).
4. If a dispute cannot be resolved, escalate to the VP of Engineering (studio head).
