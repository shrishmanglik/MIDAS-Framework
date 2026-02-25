# Deployment Patterns

## Docker Multi-Stage Build
1. Builder stage: install dependencies
2. Runtime stage: copy only what's needed
3. Non-root user in production

## Environment Management
- `.env.example` — template with all vars (no real values)
- `.env` — local development (gitignored)
- Production: platform-provided env vars or secret manager

## Database Migrations
1. Always run `alembic upgrade head` before app start
2. Migrations must be reversible (`downgrade`)
3. Never modify a deployed migration — create a new one

## Health Checks
- `/health` — basic liveness (returns 200)
- `/health/ready` — readiness (checks DB connection)

## CI/CD Stages
1. **Lint:** Code style and static analysis
2. **Test:** Unit and integration tests with coverage
3. **Build:** Docker image build
4. **Deploy:** Push to staging, then production

## Zero-Downtime Deployment
- Rolling updates (2+ replicas)
- Database migrations backward-compatible
- Feature flags for risky changes