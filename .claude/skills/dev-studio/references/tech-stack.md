# MDS Standard Tech Stack

## Backend
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Validation:** Pydantic v2
- **Auth:** python-jose (JWT), bcrypt

## Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + design tokens
- **State:** React Context + hooks (default), Zustand (complex)
- **HTTP:** fetch API with typed client

## Database
- **Primary:** PostgreSQL 15
- **Cache:** Redis (when needed)
- **Search:** PostgreSQL full-text (default), Elasticsearch (scale)

## Infrastructure
- **Containers:** Docker + docker-compose
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel (frontend), Railway/Render (backend)

## Quality
- **Linting:** Ruff (Python), ESLint (TypeScript)
- **Formatting:** Ruff (Python), Prettier (TypeScript)
- **Testing:** pytest (Python), Jest + React Testing Library (TypeScript)