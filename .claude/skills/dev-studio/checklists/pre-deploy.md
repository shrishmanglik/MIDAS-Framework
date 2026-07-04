# Pre-Deploy Checklist

> Complete this checklist BEFORE deploying to production. Every item must pass. A single failure blocks the deployment.

## Build Verification

- [ ] **All tests pass** -- `pytest` and `npm test` exit with zero failures
- [ ] **Linter passes** -- `ruff check .` and `npm run lint` report zero errors
- [ ] **TypeScript compiles** -- `npx tsc --noEmit` succeeds with zero errors
- [ ] **Build succeeds** -- `npm run build` (frontend) and `docker build` (backend) exit with code 0
- [ ] **Coverage meets threshold** -- Backend >= 80%, frontend >= 70%, critical paths = 100%
- [ ] **No test is skipped without justification** -- Every `@pytest.mark.skip` has a comment explaining why

## Docker Verification

- [ ] **Docker build completes** -- `docker build` finishes with exit code 0
- [ ] **docker-compose starts all services** -- `docker-compose up -d` starts without restart loops
- [ ] **Health check passes** -- `GET /health` returns 200 within 30 seconds of container start
- [ ] **Container runs as non-root** -- `docker exec <container> whoami` returns a non-root user
- [ ] **No secrets in Docker image** -- `docker history <image>` contains no passwords, tokens, or keys
- [ ] **Base images are pinned** -- Dockerfile uses specific versions (e.g., `python:3.11-slim`), not `latest`

## Database Verification

- [ ] **Migrations run cleanly** -- `alembic upgrade head` / `prisma migrate deploy` succeeds without errors
- [ ] **Migrations ran in staging first** -- Production migration is tested against staging data
- [ ] **Migrations are reversible** -- Downgrade scripts exist and have been tested
- [ ] **No data loss** -- Migrations do not drop columns or tables with existing data (or have explicit data migration)
- [ ] **Indexes are in place** -- All indexes defined in the schema exist in the database

## Security Verification

- [ ] **No secrets in source code** -- Grep for patterns: `password=`, `secret=`, `api_key=`, `token=` returns zero results in code files
- [ ] **Environment variables are set** -- All required env vars in .env.example have values in the production environment
- [ ] **JWT secret is unique to production** -- Production JWT_SECRET is different from development/staging
- [ ] **CORS is locked** -- Only known frontend origins are allowed, not wildcard `*`
- [ ] **HTTPS is enforced** -- All production traffic uses TLS; HTTP redirects to HTTPS
- [ ] **Rate limiting is active** -- Login and sensitive endpoints have rate limits configured
- [ ] **Security headers are set** -- X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security
- [ ] **Dependencies have no critical CVEs** -- `npm audit` / `pip audit` shows zero critical vulnerabilities

## Configuration Verification

- [ ] **Environment is set to production** -- `DEBUG=false`, `NODE_ENV=production`
- [ ] **Logging is configured** -- Structured JSON logs with appropriate log level (INFO, not DEBUG)
- [ ] **Error tracking is active** -- Error reporting service (Sentry or similar) is configured and receiving test events
- [ ] **Monitoring is active** -- Health check endpoint is being polled by monitoring system

## CI/CD Pipeline Verification

- [ ] **CI pipeline passed** -- All stages (lint, test, build) completed successfully on the merge commit
- [ ] **No manual steps** -- Deployment is fully automated from merged commit to running service
- [ ] **Rollback plan exists** -- Previous version can be restored within 5 minutes if deployment fails
- [ ] **Deploy notifications are configured** -- Team is notified on deploy success and failure

## Documentation Verification

- [ ] **README is current** -- Setup instructions, API reference, and environment variables are up to date
- [ ] **CHANGELOG is updated** -- New features, fixes, and breaking changes are documented
- [ ] **API documentation matches implementation** -- Documented endpoints match actual routes

## Smoke Test Plan

After deployment completes, verify these manually or via automated smoke tests:

- [ ] **Homepage loads** -- Frontend renders without JavaScript errors
- [ ] **API health check** -- `GET /health` returns `{ "status": "ok" }`
- [ ] **Authentication works** -- Login flow completes and returns a valid token
- [ ] **Core workflow works** -- The primary user flow (create, read, update, delete) completes without errors
- [ ] **Error pages work** -- 404 and 500 error pages render correctly

## Go / No-Go Decision

| Result | Action |
|--------|--------|
| All items pass | Deploy to production |
| Non-critical item fails | Document the risk, get human approval to proceed |
| Security item fails | **BLOCK** -- fix before deploying, no exceptions |
| Build/test item fails | **BLOCK** -- fix before deploying, no exceptions |

**Production is sacred. If in doubt, do not deploy.**
