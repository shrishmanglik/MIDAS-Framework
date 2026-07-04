# Tech Stack Decisions

> Why we chose each technology in the MIDAS default stack. Every choice has trade-offs. This document makes them explicit.

## Backend: FastAPI (Python 3.11+)

### Why FastAPI

| Factor | FastAPI | Django | Express.js |
|--------|---------|--------|------------|
| Performance | Async native, ASGI, high throughput | Sync by default, WSGI | Async but single-threaded |
| Type Safety | Pydantic v2 models, auto-validation | Manual serializers | Manual with TypeScript |
| API Docs | Auto-generated OpenAPI/Swagger | DRF has it, but more config | Manual with swagger-jsdoc |
| Learning Curve | Low for Python devs | Higher (ORM, admin, etc.) | Low but less structured |
| Ecosystem | Growing fast, good community | Massive, mature | Massive, fragmented |

### Decision
FastAPI provides the best balance of performance, developer experience, and automatic documentation. The built-in Pydantic validation eliminates an entire class of bugs (missing field validation, type coercion errors). The auto-generated OpenAPI docs mean the API is always documented.

### When to reconsider
- If the project needs Django's admin panel for content management, use Django + DRF.
- If the team is JavaScript-only, use Express.js or Fastify with TypeScript.
- If extreme performance is critical (>100k req/s), evaluate Go or Rust.

## Frontend: Next.js 14+ (React, TypeScript)

### Why Next.js

| Factor | Next.js | Nuxt (Vue) | SvelteKit |
|--------|---------|------------|-----------|
| SEO | SSR + SSG built-in | SSR built-in | SSR built-in |
| Ecosystem | Massive React ecosystem | Smaller but growing | Smallest |
| TypeScript | First-class support | Good support | Good support |
| Deployment | Vercel optimized, works anywhere | Similar | Similar |
| Hiring | Largest talent pool | Moderate | Small |
| App Router | File-based routing, layouts, streaming | File-based routing | File-based routing |

### Decision
Next.js with App Router provides server-side rendering for SEO, file-based routing for simplicity, and access to the largest UI component ecosystem (shadcn/ui, Radix, etc.). TypeScript catches type errors at compile time. Tailwind CSS eliminates CSS naming conflicts and provides a consistent design system.

### When to reconsider
- If the team prefers Vue's composition API, use Nuxt.
- If bundle size is the top priority and the app is simple, evaluate SvelteKit.
- If no SSR is needed (internal dashboard), consider Vite + React SPA.

## Database: PostgreSQL 15

### Why PostgreSQL

| Factor | PostgreSQL | MySQL | MongoDB |
|--------|-----------|-------|---------|
| Data Integrity | Full ACID, rich constraints | ACID with InnoDB | Eventual consistency default |
| JSON Support | Native JSONB with indexing | JSON type (slower) | Native (document store) |
| Full-Text Search | Built-in tsvector + GIN | FULLTEXT index (limited) | Built-in (Atlas Search) |
| Extensions | PostGIS, pg_trgm, hstore, etc. | Limited | Aggregation pipeline |
| Scalability | Vertical + read replicas | Vertical + read replicas | Horizontal sharding |

### Decision
PostgreSQL provides the strongest data integrity guarantees, the most advanced query capabilities, and built-in full-text search that eliminates the need for Elasticsearch at moderate scale (<500k documents). The JSONB column type allows flexible data without sacrificing relational integrity.

### When to reconsider
- If the data is truly unstructured and schema-less, evaluate MongoDB.
- If the team has deep MySQL expertise and no PostgreSQL-specific features are needed, MySQL is acceptable.
- If the project exceeds 10M rows with complex queries, evaluate adding read replicas or materialized views before switching databases.

## ORM: SQLAlchemy 2.0 + Alembic / Prisma

### SQLAlchemy (Python backend)

| Factor | SQLAlchemy | Django ORM | Raw SQL |
|--------|-----------|-----------|---------|
| Flexibility | Full SQL power + ORM | High-level ORM only | Maximum flexibility |
| Async Support | Native in 2.0 | Limited (via channels) | Manual |
| Migration Tool | Alembic (auto-generate) | Built-in (auto) | Manual |
| Learning Curve | Moderate | Lower | Low (but high maintenance) |

### Prisma (Node.js/TypeScript projects)

| Factor | Prisma | Drizzle | TypeORM |
|--------|--------|---------|---------|
| Type Safety | Schema-first, generated types | Schema-first, SQL-like | Decorator-based |
| Migrations | Auto-generated, SQL-based | Push-based | Sync-based |
| Query API | Intuitive, nested relations | SQL-like DSL | Repository pattern |
| Performance | Good, connection pooling | Excellent (thin layer) | Moderate |

### Decision
SQLAlchemy 2.0 for Python backends because of its mature async support, powerful query builder, and Alembic migration auto-generation. Prisma for TypeScript backends because its schema-first approach generates type-safe client code that catches query errors at compile time.

### When to reconsider
- For TypeScript projects that need raw SQL control, evaluate Drizzle ORM.
- For simple CRUD applications, the Django ORM may be faster to develop with.

## Deployment: Docker + docker-compose

### Why Docker

| Factor | Docker | Direct Deploy | Serverless |
|--------|--------|--------------|------------|
| Reproducibility | Identical across environments | Environment-dependent | Platform-dependent |
| Isolation | Full process isolation | Shared OS | Managed isolation |
| Scaling | Compose + Kubernetes | Manual | Automatic |
| Cost | Container overhead (~5%) | Lowest | Pay-per-invocation |
| Complexity | Moderate | Low | High (cold starts, limits) |

### Decision
Docker provides reproducible builds that work identically in development, staging, and production. Multi-stage builds keep production images small. Docker-compose orchestrates the full stack (app + database + proxy) with a single command.

### When to reconsider
- For Next.js frontends, Vercel deployment is simpler and optimized for the framework.
- For event-driven workloads with sporadic traffic, serverless (AWS Lambda, Vercel Functions) may be more cost-effective.
- For large-scale production, Kubernetes provides better orchestration than docker-compose.

## CI/CD: GitHub Actions

### Why GitHub Actions

| Factor | GitHub Actions | GitLab CI | CircleCI |
|--------|---------------|-----------|----------|
| Integration | Native to GitHub | Native to GitLab | Third-party |
| Free Tier | 2000 min/month | 400 min/month | 6000 min/month |
| Marketplace | Largest action library | Smaller | Moderate |
| Config | YAML in .github/ | YAML in .gitlab-ci.yml | YAML in .circleci/ |
| Self-hosted Runners | Supported | Supported | Not on free tier |

### Decision
GitHub Actions is the default because the codebase is on GitHub. The marketplace provides pre-built actions for common tasks (checkout, setup-python, setup-node, caching). Workflow files live in the repository, making CI/CD configuration version-controlled and reviewable.

### When to reconsider
- If the codebase is on GitLab, use GitLab CI.
- If the team needs complex parallel workflows, CircleCI may offer better performance.

## Testing: pytest + Jest

### Why pytest (Backend)

| Factor | pytest | unittest | nose2 |
|--------|--------|---------|-------|
| Fixtures | Powerful, composable, scoped | setUp/tearDown only | Limited |
| Assertions | Plain assert with introspection | assertEqual, etc. | Plain assert |
| Async Support | pytest-asyncio plugin | asyncio.run() | Limited |
| Plugins | Huge ecosystem (cov, mock, xdist) | stdlib only | Moderate |

### Why Jest (Frontend)

| Factor | Jest | Vitest | Mocha |
|--------|------|--------|-------|
| Speed | Moderate | Faster (native ESM) | Manual config |
| Snapshot Testing | Built-in | Built-in | Plugin |
| Next.js Support | Official | Experimental | Manual |
| Coverage | Built-in | Built-in | Plugin |

### Decision
pytest for Python because of its fixture system, plugin ecosystem, and clean assertion syntax. Jest for frontend because of official Next.js support and the React Testing Library integration. Playwright for E2E tests because it supports all major browsers and has excellent async API.

### When to reconsider
- For Vite-based frontends, Vitest is faster and more compatible.
- If the team wants a single E2E tool, Cypress is a viable alternative to Playwright.

## Linting and Formatting

| Tool | Language | Why |
|------|----------|-----|
| Ruff | Python | 10-100x faster than flake8+isort+black combined; single tool for lint + format |
| ESLint | TypeScript | Industry standard; next/core-web-vitals preset catches React-specific issues |
| Prettier | TypeScript/CSS | Opinionated formatting eliminates style debates |
