---
name: full-stack-build
description: "End-to-end project build orchestration. Coordinates all 7 agents through the 5-phase pipeline to produce a complete, deployable application from a plain-text brief. Triggers on: 'build an app', 'create a project', 'full stack build', any request to build a complete application."
---

# Full-Stack Build Pipeline

This skill orchestrates the complete MIDAS Dev Studio pipeline.

## The 5 Phases

### Phase 1: INIT (Requirements)
**Agent:** Product Manager
**Input:** Plain-text project brief from user
**Output:** `output/requirements.json`
**Gate:** Schema validation + human approval
**Budget:** $0.015

Steps:
1. PM reads the brief
2. PM asks clarifying questions (if brief is ambiguous)
3. PM produces structured requirements
4. Deterministic validation: JSON parses, required fields present
5. Present to user for approval

### Phase 2: PLAN (Architecture)
**Agents:** Systems Architect + Database Engineer (parallel)
**Input:** `output/requirements.json`
**Output:** `output/architecture.md`, `output/openapi-stub.yaml`, `output/schema.sql`
**Gate:** Cross-reference validation + completeness check
**Budget:** $0.035

Steps:
1. Architect reads requirements, produces architecture doc + OpenAPI spec
2. DB Engineer reads requirements + architecture, produces schema + migrations
3. Deterministic: validate OpenAPI spec, validate SQL syntax
4. Cross-reference: every API endpoint has a data entity, every entity has API coverage

### Phase 3: BUILD (Implementation)
**Agents:** Backend Developer + Frontend Developer (parallel)
**Input:** `output/architecture.md`, `output/openapi-stub.yaml`, `output/schema.sql`
**Output:** `app/` (backend), `frontend/` (frontend)
**Gate:** Lint + type check + imports resolve + servers start
**Budget:** $0.100

Steps:
1. Backend Dev reads architecture + schema, implements FastAPI app
2. Frontend Dev reads architecture + OpenAPI, implements React app
3. Deterministic gates:
   - `ruff check app/` passes
   - `cd frontend && npx tsc --noEmit` passes
   - `python -c "from app.main import app"` succeeds
   - Both servers start without errors

### Phase 4: TEST (Validation)
**Agent:** QA Engineer
**Input:** `app/`, `frontend/`, `output/requirements.json`
**Output:** `tests/`, `output/test-results.txt`, `output/review-report.md`
**Gate:** 80% coverage + adversarial review passes
**Budget:** $0.035

Steps:
1. QA generates tests from acceptance criteria
2. Execute: `pytest tests/ -v --cov=app --cov-report=json`
3. Coverage must be >= 80%
4. Adversarial review: QA adopts competitor framing, finds 3-10 specific issues
5. Fix critical issues, document non-critical as known limitations

### Phase 5: DEPLOY (Packaging)
**Agent:** DevOps Engineer
**Input:** `app/`, `frontend/`, `output/architecture.md`
**Output:** `Dockerfile`, `docker-compose.yaml`, `.github/workflows/ci.yml`, `.env.example`
**Gate:** `docker compose build` succeeds + containers start + health check passes
**Budget:** $0.005

Steps:
1. Generate Docker configs (almost entirely templates — Tier 1)
2. Generate CI pipeline (template — Tier 1)
3. Generate .env.example from architecture's environment variables
4. Test: `docker compose build --no-cache && docker compose up -d`
5. Health check: `curl -f http://localhost:8000/health`
6. Present final summary to user

## File Ownership Matrix

| Agent | Can Write | Cannot Write |
|---|---|---|
| Product Manager | output/ | Everything else |
| Systems Architect | output/ | app/, frontend/, tests/ |
| Database Engineer | app/models/, alembic/, output/schema.sql | app/routes/, frontend/ |
| Backend Developer | app/routes/, app/services/, app/schemas/, app/utils/, app/main.py | app/models/, frontend/, tests/ |
| Frontend Developer | frontend/src/ | app/, tests/ |
| QA Engineer | tests/ | app/, frontend/ |
| DevOps Engineer | Dockerfile, docker-compose.yaml, .github/ | app/, frontend/, tests/ |

## Complexity-Adaptive Behavior

| Complexity | Adjustments | Budget |
|---|---|---|
| Small (<5 endpoints) | Skip frontend, minimal architecture | ~$0.08 |
| Medium (5-15 endpoints) | Full pipeline | ~$0.22 |
| Large (15+ endpoints) | Opus for architecture, parallel review | ~$0.40 |
