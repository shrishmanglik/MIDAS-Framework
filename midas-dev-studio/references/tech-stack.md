# Approved Technology Stack — MIDAS Dev Studio

Exact version numbers for all technologies used in MIDAS-built applications. Override ONLY when project requirements explicitly demand it, with written justification.

---

## Backend

| Technology | Version | Purpose | Package |
|---|---|---|---|
| Python | 3.11+ | Runtime | — |
| FastAPI | 0.109+ | Web framework | `fastapi` |
| Uvicorn | 0.27+ | ASGI server | `uvicorn[standard]` |
| Pydantic | 2.5+ | Data validation | `pydantic` |
| Pydantic Settings | 2.1+ | Config management | `pydantic-settings` |
| SQLAlchemy | 2.0+ | ORM | `sqlalchemy` |
| Alembic | 1.13+ | DB migrations | `alembic` |
| asyncpg | 0.29+ | PostgreSQL async driver | `asyncpg` |
| python-jose | 3.3+ | JWT handling | `python-jose[cryptography]` |
| passlib | 1.7+ | Password hashing | `passlib[bcrypt]` |
| python-multipart | 0.0.6+ | Form data parsing | `python-multipart` |

## Database

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 16+ | Primary database |
| PostgreSQL (Docker) | 16-alpine | Container image |

## Frontend

| Technology | Version | Purpose | Package |
|---|---|---|---|
| Node.js | 20+ (LTS) | Runtime | — |
| Next.js | 14+ | React framework | `next` |
| React | 18+ | UI library | `react` |
| React DOM | 18+ | DOM rendering | `react-dom` |
| TypeScript | 5.3+ | Type safety | `typescript` |
| Tailwind CSS | 3.4+ | Styling | `tailwindcss` |
| PostCSS | 8.4+ | CSS processing | `postcss` |
| Autoprefixer | 10.4+ | CSS vendor prefixes | `autoprefixer` |

## Testing

| Technology | Version | Purpose | Package |
|---|---|---|---|
| pytest | 8.0+ | Test runner | `pytest` |
| pytest-asyncio | 0.23+ | Async test support | `pytest-asyncio` |
| pytest-cov | 4.1+ | Coverage reporting | `pytest-cov` |
| httpx | 0.26+ | Async HTTP test client | `httpx` |
| aiosqlite | 0.19+ | SQLite async (test DB) | `aiosqlite` |
| Jest | 29+ | Frontend test runner | `jest` |
| React Testing Library | 14+ | Component testing | `@testing-library/react` |

## Code Quality

| Technology | Version | Purpose | Package |
|---|---|---|---|
| Ruff | 0.2+ | Python linter + formatter | `ruff` |
| ESLint | 8+ | JavaScript/TypeScript linter | `eslint` |
| Prettier | 3+ | Code formatter | `prettier` |

## DevOps

| Technology | Version | Purpose |
|---|---|---|
| Docker | 24+ | Containerization |
| Docker Compose | 3.9 (file format) | Multi-container orchestration |
| GitHub Actions | v4 (actions) | CI/CD |
| Nginx | 1.25+ (alpine) | Reverse proxy (when needed) |

## Version Pinning Rules

1. **Use minimum version with caret:** `fastapi>=0.109` in pyproject.toml
2. **Pin exact versions in Docker:** `FROM python:3.11-slim` not `FROM python:3-slim`
3. **Lock files are mandatory:** `package-lock.json` for Node.js
4. **Review on quarterly basis:** Check for security updates and breaking changes
5. **Never use `latest` tag** in Docker images or dependency specs

## When to Override

An override is justified when:
- Requirements explicitly specify a different technology (e.g., "must use MongoDB")
- A specific integration requires a different version
- Security advisory requires upgrading beyond the listed version

An override is NOT justified when:
- "It's more popular" or "it's newer"
- Personal preference
- "Everyone uses it"

Document every override with: technology, version, justification, and approval.
