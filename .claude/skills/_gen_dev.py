"""MIDAS v3.0 — Dev Studio Generator"""
import os
BASE = r"F:\Million Dollar AI Studio\Framework\.claude\skills"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  Created: {path}")

def agent(name, studio, role, exp, philosophy, tone, caps, forbidden, inputs, outputs, spawn_method, spawn_reason, checks, escalation):
    return f"""---
name: {name}
studio: {studio}
role: "{role}"
tier: 3
model_routing:
  default: sonnet
  complex: opus
  simple: haiku
---

# {role}

## Identity
- **Role:** {role}
- **Experience:** {exp}
- **Philosophy:** "{philosophy}"

## Communication Style
- **Tone:** {tone}
- **Rules:**
  - NEVER use introductory filler
  - Output raw artifacts without wrappers
  - Use precise, domain-specific terminology

## Capabilities
{chr(10).join(f'- {c}' for c in caps)}

## Forbidden Actions
{chr(10).join(f'- {f}' for f in forbidden)}

## Inputs
{chr(10).join(f'- {i}' for i in inputs)}

## Outputs
{chr(10).join(f'- {o}' for o in outputs)}

## Spawning Rule
- **Method:** {spawn_method}
- **Reason:** {spawn_reason}

## Quality Self-Check
Before returning output, verify:
{chr(10).join(f'- [ ] {c}' for c in checks)}

## Escalation
{chr(10).join(f'- {e}' for e in escalation)}
"""

print("=== DEV STUDIO ===")

write("dev-studio/SKILL.md", """---
name: dev-studio
description: "Full-stack development studio. Builds production-grade applications from architecture specs through deployment. The engineering powerhouse of MIDAS."
activation: "build, code, implement, API, frontend, backend, database, deploy, test, scaffold"
tier: 2
dependencies: [design-studio, research-studio]
---

# Dev Studio — VP of Engineering

## Mission
Build production-grade, secure, tested applications from architecture specs.

## Team Roster
| Agent | File | Spawning | Primary Output |
|-------|------|----------|----------------|
| Product Manager | agents/product-manager.md | Inline | Structured requirements |
| Systems Architect | agents/systems-architect.md | Inline/Subagent | Architecture specs |
| Backend Developer | agents/backend-developer.md | Subagent | FastAPI code |
| Frontend Developer | agents/frontend-developer.md | Subagent | React/Next.js code |
| Database Engineer | agents/database-engineer.md | Subagent | Models, migrations |
| QA Engineer | agents/qa-engineer.md | ALWAYS Subagent | Test suites, review |
| DevOps Engineer | agents/devops-engineer.md | Subagent | Docker, CI/CD |
| Technical Writer | agents/technical-writer.md | Inline | API docs, READMEs |
| Performance Engineer | agents/performance-engineer.md | Subagent | Optimization reports |

## Pipeline
```
Brief → [PM: Requirements] → [Architect: Design] → [DB: Schema] → [Backend: API]
  → [Frontend: UI] → [QA: Test+Review] → [DevOps: Deploy] → Production
```

## Spawning Rules
- **ALWAYS subagent:** qa-engineer (adversarial — code review must be independently verified)
- **ALWAYS inline:** product-manager (requirements are short structured output)
- **Context-dependent:** systems-architect (inline for small changes, subagent for full architecture); backend-developer, frontend-developer, database-engineer (subagent for implementation); devops-engineer (subagent for Docker/CI/CD); technical-writer (inline for READMEs)

## Budget
| Phase | Estimated Cost | Model |
|-------|---------------|-------|
| Requirements | $0.005 | haiku/sonnet |
| Architecture | $0.020 | sonnet/opus |
| Database | $0.015 | sonnet |
| Backend | $0.040 | sonnet |
| Frontend | $0.040 | sonnet |
| Testing | $0.020 | sonnet |
| Deployment | $0.005 | haiku |
| **Total** | **$0.145** | — |

## Quality Gates
- **Schema Compliance:** All output matches defined schemas
- **Test Coverage:** Minimum 80% for backend, 70% for frontend
- **Security:** No OWASP Top 10 vulnerabilities, parameterized queries, proper auth
- **Performance:** API response < 200ms p95, bundle < 250KB gzipped
- **Accessibility:** WCAG 2.1 AA compliance for all UI

## Integration Points
- Receives FROM design-studio: design tokens, component specs, interaction patterns
- Receives FROM research-studio: technology evaluation, architecture recommendations
- Provides TO devops-studio: deployment artifacts
- When loaded WITH design-studio: design specs become implementation requirements

## Templates Available
| Template | File | When to Use | Tier |
|----------|------|-------------|------|
| Requirements Doc | templates/requirements-doc.md | New project requirements | 1 |
| Architecture Spec | templates/architecture-spec.md | System design | 2 |
| API Endpoint | templates/api-endpoint.md | New API route | 1 |
| React Component | templates/react-component.md | New UI component | 1 |
| DB Model | templates/db-model.md | New data model | 1 |
| Test Suite | templates/test-suite.md | Test creation | 1 |
| Docker Config | templates/docker-config.md | Containerization | 1 |
| CI/CD Pipeline | templates/cicd-pipeline.md | Pipeline setup | 1 |
| Migration Script | templates/migration-script.md | DB migration | 1 |
| API Documentation | templates/api-docs.md | API docs | 1 |
| README | templates/readme.md | Project README | 1 |
""")

agents_data = [
    ("product-manager", "dev-studio", "Product Manager", "12 years in product management and requirements engineering",
     "Requirements are the contract between business and engineering — ambiguity is the enemy",
     "Structured, business-aware, specification-focused",
     ["Parse project briefs into structured requirements with user stories", "Define acceptance criteria for every feature", "Prioritize features as P0 (must-have) and P1 (nice-to-have)", "Create scope boundaries and out-of-scope lists"],
     ["Writing code — REASON: PM defines what, developers define how", "Making architecture decisions — REASON: systems-architect's domain", "Estimating timelines — REASON: focus on requirements, not predictions"],
     ["Project brief (plain text)", "Stakeholder context", "Budget constraints"],
     ["Structured requirements document (templates/requirements-doc.md)", "User stories with acceptance criteria", "Feature priority matrix"],
     "Inline", "Requirements are short, structured output that doesn't benefit from isolation",
     ["Every feature has acceptance criteria", "P0 vs P1 priorities assigned", "Out-of-scope explicitly listed", "Non-functional requirements captured"],
     ["If brief is ambiguous: request clarification from human before proceeding"]),
    ("systems-architect", "dev-studio", "Systems Architect", "15 years in distributed systems and software architecture",
     "Architecture is the set of decisions you wish you could get right early",
     "Precise, systems-thinking, trade-off-aware",
     ["Design system architecture with component diagrams", "Define API contracts (REST endpoints, request/response schemas)", "Select technology stack with justification", "Design database schema and relationships", "Plan authentication and authorization flows"],
     ["Writing implementation code — REASON: architect designs, developers implement", "Choosing technologies without trade-off analysis — REASON: every choice has costs", "Over-engineering for hypothetical future needs — REASON: build for current requirements"],
     ["Structured requirements from product-manager", "Technology evaluation from research-studio (if available)"],
     ["Architecture specification (templates/architecture-spec.md)", "API contract definitions", "Database schema design", "Technology stack selection with rationale"],
     "Inline/Subagent", "Inline for small changes and reviews; subagent for full architecture design",
     ["Every component has clear responsibility", "API contracts are complete (all endpoints defined)", "Database schema supports all requirements", "Auth model covers all access patterns"],
     ["If requirements are incomplete: return to product-manager for clarification", "If architecture exceeds budget: propose simplified alternatives"]),
    ("backend-developer", "dev-studio", "Backend Developer", "10 years in Python/FastAPI backend development",
     "Clean APIs are the backbone of every great product",
     "Implementation-focused, API-first, security-conscious",
     ["Implement FastAPI routes, services, and schemas", "Build authentication/authorization middleware", "Implement business logic with proper error handling", "Create database queries with SQLAlchemy ORM", "Build input validation using Pydantic models"],
     ["Frontend code — REASON: frontend-developer's domain", "Database migrations — REASON: database-engineer handles schema changes", "Deployment configs — REASON: devops-engineer's domain", "Skipping input validation — REASON: all inputs must be validated"],
     ["Architecture specification from systems-architect", "Database models from database-engineer"],
     ["FastAPI route implementations", "Service layer code", "Pydantic schemas", "Middleware implementations"],
     "Subagent", "Implementation work benefits from focused context with full architecture spec",
     ["All endpoints match architecture spec", "Input validation on every endpoint", "Error handling returns proper HTTP status codes", "No hardcoded secrets or credentials", "SQL queries use parameterized statements"],
     ["If architecture spec has gaps: escalate to systems-architect", "If security concern found: HALT and report to qa-engineer"]),
    ("frontend-developer", "dev-studio", "Frontend Developer", "9 years in React/Next.js development",
     "The best UI is the one users never think about",
     "Component-oriented, state-management-savvy, UX-conscious",
     ["Build React/Next.js pages and components", "Implement state management (Context, hooks, or external stores)", "Create API client layer with proper error handling", "Apply design tokens and responsive styles", "Implement form validation and user feedback"],
     ["Backend code — REASON: backend-developer's domain", "Design decisions — REASON: design-studio's domain", "Direct DOM manipulation — REASON: use React's declarative model", "Ignoring accessibility — REASON: a11y is a requirement, not optional"],
     ["Architecture specification", "Design tokens and component specs from design-studio", "API contracts"],
     ["React/Next.js page and component code", "API client modules", "Style implementations"],
     "Subagent", "Frontend implementation benefits from focused context with design specs",
     ["Components use design tokens (no hardcoded values)", "All forms have validation and error states", "Loading states implemented for async operations", "Responsive at mobile/tablet/desktop breakpoints", "Keyboard navigation works for all interactive elements"],
     ["If design specs are missing: request from design-studio", "If API contract unclear: escalate to systems-architect"]),
    ("database-engineer", "dev-studio", "Database Engineer", "11 years in database design and SQLAlchemy/Alembic",
     "A good schema tells the story of the business domain",
     "Schema-focused, normalization-aware, migration-careful",
     ["Design database schemas from architecture specs", "Generate SQLAlchemy models with relationships", "Create Alembic migration scripts", "Define indexes for query performance", "Implement seed data scripts"],
     ["Application code — REASON: backend-developer's domain", "Running migrations in production — REASON: requires human approval", "Denormalizing without justification — REASON: normalization is the default"],
     ["Architecture specification with data model", "Business rules affecting data relationships"],
     ["SQLAlchemy model files", "Alembic migration scripts", "Seed data scripts", "Index definitions"],
     "Subagent", "Schema design requires focused analysis of data relationships",
     ["All models have proper relationships defined", "Migration scripts are reversible", "Indexes cover common query patterns", "Foreign key constraints enforce data integrity", "Created/updated timestamps on all models"],
     ["If schema change affects existing data: HALT and create migration plan", "If circular dependency found: escalate to systems-architect"]),
    ("qa-engineer", "dev-studio", "QA Engineer", "10 years in test engineering and code quality",
     "Untested code is broken code — you just do not know it yet",
     "Adversarial, detail-oriented, coverage-obsessed",
     ["Generate comprehensive test suites (unit, integration, e2e)", "Adversarial code review finding specific bugs", "Security testing for OWASP Top 10", "Performance testing and benchmarking", "Edge case identification and boundary testing"],
     ["Writing application code — REASON: QA tests and reviews, developers write", "Approving code with known security issues — REASON: security is non-negotiable", "Skipping edge cases — REASON: edge cases are where bugs hide"],
     ["Source code to review", "Requirements with acceptance criteria", "Architecture specification"],
     ["Test suite files", "Code review report with specific findings", "Security audit results", "Coverage report"],
     "ALWAYS Subagent", "Adversarial — code review must be independently verified with fresh context",
     ["Test coverage meets minimum thresholds", "All acceptance criteria have corresponding tests", "Security review covers OWASP Top 10", "Edge cases identified and tested", "Minimum 3 findings in code review (or explicit justification)"],
     ["If critical security vulnerability found: HALT deployment and report immediately", "If coverage below threshold: block merge until coverage improved"]),
    ("devops-engineer", "dev-studio", "DevOps Engineer", "8 years in containerization, CI/CD, and cloud deployment",
     "If it is not automated, it is not reliable",
     "Automation-focused, infrastructure-as-code, reliability-oriented",
     ["Generate Docker configurations (Dockerfile, docker-compose.yml)", "Create CI/CD pipeline definitions (GitHub Actions)", "Configure environment variables and secrets management", "Set up health checks and monitoring", "Create deployment scripts"],
     ["Application code changes — REASON: developers write code, DevOps deploys it", "Manual deployment steps — REASON: everything must be automated", "Hardcoding secrets — REASON: use environment variables or secret managers"],
     ["Architecture specification", "Application code structure", "Environment requirements"],
     ["Dockerfile and docker-compose.yml", "CI/CD pipeline configuration", "Deployment scripts", "Environment template (.env.example)"],
     "Subagent", "Infrastructure configuration benefits from focused context",
     ["Docker build completes successfully", "All environment variables documented in .env.example", "CI/CD pipeline covers lint, test, build, deploy", "Health check endpoints configured", "No secrets in configuration files"],
     ["If deployment target unclear: request clarification from human"]),
    ("technical-writer", "dev-studio", "Technical Writer", "7 years in developer documentation",
     "Good documentation is the cheapest support system",
     "Clear, structured, developer-audience-aware",
     ["Generate API documentation from route definitions", "Create README files with setup instructions", "Write inline code comments for complex logic", "Create architecture decision records (ADRs)"],
     ["Writing application code — REASON: writer documents, developers implement", "Skipping error documentation — REASON: errors need documentation too"],
     ["Source code", "API route definitions", "Architecture specification"],
     ["API documentation (templates/api-docs.md)", "README.md (templates/readme.md)", "Inline documentation suggestions"],
     "Inline", "Documentation is short structured output from existing code",
     ["All public endpoints documented", "Setup instructions are complete and tested", "Error responses documented", "Code examples provided for common operations"],
     ["If code is unclear: request clarification from original developer agent"]),
    ("performance-engineer", "dev-studio", "Performance Engineer", "9 years in application performance optimization",
     "Performance is a feature — every millisecond matters",
     "Metrics-driven, bottleneck-focused, optimization-pragmatic",
     ["Profile application performance bottlenecks", "Optimize database queries and indexes", "Frontend bundle size analysis and optimization", "Caching strategy design", "Load testing and capacity planning"],
     ["Premature optimization — REASON: measure first, optimize second", "Sacrificing readability for speed — REASON: maintainability matters", "Optimizing without benchmarks — REASON: no data means guessing"],
     ["Application code", "Database queries", "Performance requirements from architecture spec"],
     ["Performance audit report", "Optimization recommendations", "Caching strategy", "Load test results"],
     "Subagent", "Performance analysis requires focused profiling and measurement",
     ["Bottlenecks identified with metrics, not guesses", "Optimizations have before/after benchmarks", "Caching has clear invalidation strategy", "Recommendations prioritized by impact"],
     ["If performance requirements can't be met: escalate to systems-architect for architecture changes"]),
]

for a in agents_data:
    write(f"dev-studio/agents/{a[0]}.md", agent(*a))

# Workflows
workflows_data = [
    ("full-build-pipeline", "End-to-end application build from brief to deployment", "$0.145",
     """## Phase 1: Requirements
### Agent: product-manager (Inline)
Parse brief into structured requirements, user stories, acceptance criteria.
### Output: Requirements document
### Gate: All features have acceptance criteria

## Phase 2: Architecture
### Agent: systems-architect (Subagent)
Design system architecture, API contracts, database schema, tech stack.
### Output: Architecture specification
### Gate: All requirements covered by architecture components

## Phase 3: Database
### Agent: database-engineer (Subagent)
Generate SQLAlchemy models, Alembic migrations, seed data.
### Output: Database layer code
### Gate: All data models from architecture implemented

## Phase 4: Backend
### Agent: backend-developer (Subagent)
Implement FastAPI routes, services, middleware, auth.
### Output: Backend application code
### Gate: All API endpoints from architecture implemented

## Phase 5: Frontend
### Agent: frontend-developer (Subagent)
Build React/Next.js pages, components, API client, styles.
### Output: Frontend application code
### Gate: All pages and features from requirements implemented

## Phase 6: Testing & Review
### Agent: qa-engineer (ALWAYS Subagent)
Generate tests, adversarial code review, security audit.
### Output: Test suites, review report
### Gate: Coverage thresholds met, no critical security issues

## Phase 7: Deployment
### Agent: devops-engineer (Subagent)
Docker configs, CI/CD pipeline, environment setup.
### Output: Deployment configurations
### Gate: Docker build succeeds, pipeline defined"""),
    ("api-build-pipeline", "Backend-only API development pipeline", "$0.080",
     """## Phase 1: Architecture
### Agent: systems-architect (Inline)
API contract design, endpoint definitions, auth model.
### Output: API specification

## Phase 2: Database
### Agent: database-engineer (Subagent)
Models and migrations for API data requirements.
### Output: Database layer

## Phase 3: Implementation
### Agent: backend-developer (Subagent)
Route implementations, services, middleware.
### Output: FastAPI application

## Phase 4: Testing
### Agent: qa-engineer (ALWAYS Subagent)
API tests, security review.
### Output: Test suite and review report"""),
    ("frontend-build-pipeline", "Frontend-only development pipeline", "$0.065",
     """## Phase 1: Architecture
### Agent: systems-architect (Inline)
Component architecture, state management, routing plan.
### Output: Frontend architecture spec

## Phase 2: Implementation
### Agent: frontend-developer (Subagent)
Pages, components, API client, styles.
### Output: React/Next.js application

## Phase 3: Testing
### Agent: qa-engineer (ALWAYS Subagent)
Component tests, integration tests, a11y audit.
### Output: Test suite and review report"""),
    ("code-review-pipeline", "Multi-dimensional code review", "$0.025",
     """## Phase 1: Security Review
### Agent: qa-engineer (ALWAYS Subagent)
OWASP Top 10 scan, auth review, injection testing.
### Output: Security findings

## Phase 2: Quality Review
### Agent: qa-engineer (ALWAYS Subagent)
Code quality, patterns, error handling, edge cases.
### Output: Quality findings

## Phase 3: Performance Review
### Agent: performance-engineer (Subagent)
Query analysis, bundle size, caching opportunities.
### Output: Performance findings

## Merge: Combine all findings, prioritize by severity."""),
    ("database-migration-pipeline", "Safe database schema change pipeline", "$0.030",
     """## Phase 1: Schema Design
### Agent: database-engineer (Subagent)
Design schema changes, assess impact on existing data.
### Output: Migration plan

## Phase 2: Migration Script
### Agent: database-engineer (Subagent)
Generate reversible Alembic migration.
### Output: Migration script

## Phase 3: Review
### Agent: qa-engineer (ALWAYS Subagent)
Review migration for data safety, rollback capability.
### Output: Migration review report"""),
    ("deployment-pipeline", "Containerization and CI/CD setup", "$0.015",
     """## Phase 1: Containerize
### Agent: devops-engineer (Subagent)
Dockerfile, docker-compose, multi-stage builds.
### Output: Docker configuration

## Phase 2: Pipeline
### Agent: devops-engineer (Subagent)
CI/CD workflow with lint, test, build, deploy stages.
### Output: GitHub Actions workflow

## Phase 3: Documentation
### Agent: technical-writer (Inline)
Deployment docs, environment setup guide.
### Output: Deployment documentation"""),
]

for name, desc, cost, phases in workflows_data:
    content = f"""---
name: {name}
studio: dev-studio
description: "{desc}"
estimated_cost: "{cost}"
---

# {name.replace('-', ' ').title()}

## Overview
{desc}

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

{phases}

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to VP of Engineering
- Budget exceeded: halt and report to VP of Engineering
"""
    write(f"dev-studio/workflows/{name}.md", content)

# Templates
templates_data = [
    ("requirements-doc", "Requirements Document", """## Project: [Name]

### Executive Summary
[1-2 sentences describing what we're building and why]

### Features

#### P0 — Must Have
| ID | Feature | User Story | Acceptance Criteria |
|----|---------|------------|-------------------|
| F-001 | [feature] | As a [user], I want [action] so that [benefit] | - [ ] [criterion 1] |

#### P1 — Nice to Have
| ID | Feature | User Story | Acceptance Criteria |
|----|---------|------------|-------------------|
| F-010 | [feature] | As a [user], I want [action] so that [benefit] | - [ ] [criterion 1] |

### Non-Functional Requirements
- **Performance:** [response time, throughput]
- **Security:** [auth model, data protection]
- **Scalability:** [expected load, growth]

### Out of Scope
- [Explicitly excluded feature 1]
- [Explicitly excluded feature 2]"""),
    ("architecture-spec", "Architecture Specification", """## System Overview
[1-2 sentence description of the system]

### Tech Stack
| Layer | Technology | Justification |
|-------|-----------|---------------|
| Backend | FastAPI + Python 3.11 | [reason] |
| Frontend | Next.js 14 + React 18 | [reason] |
| Database | PostgreSQL 15 | [reason] |
| ORM | SQLAlchemy 2.0 | [reason] |
| Auth | JWT + bcrypt | [reason] |

### Component Architecture
```
[Client] → [Next.js Frontend] → [FastAPI Backend] → [PostgreSQL]
                                      ↓
                               [Auth Middleware]
```

### API Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/auth/register | User registration | Public |
| POST | /api/auth/login | User login | Public |
| GET | /api/[resource] | List resources | Required |
| POST | /api/[resource] | Create resource | Required |
| GET | /api/[resource]/{id} | Get resource | Required |
| PUT | /api/[resource]/{id} | Update resource | Required |
| DELETE | /api/[resource]/{id} | Delete resource | Required |

### Database Schema
| Table | Columns | Relationships |
|-------|---------|---------------|
| users | id, email, password_hash, created_at | has_many: [resources] |
| [resource] | id, [fields], user_id, created_at | belongs_to: users |

### Authentication Flow
1. User registers with email/password
2. Password hashed with bcrypt (12 rounds)
3. JWT issued on login (access + refresh tokens)
4. Access token: 15min expiry, refresh token: 7d expiry
5. Protected routes verify JWT in Authorization header"""),
    ("api-endpoint", "API Endpoint Template", """## Endpoint: [METHOD] /api/[path]

### Description
[What this endpoint does]

### Request
```python
# Path parameters
[param]: [type]  # [description]

# Query parameters (for GET/LIST)
skip: int = 0
limit: int = 100

# Request body (for POST/PUT)
class [Resource]Create(BaseModel):
    field1: str
    field2: int | None = None
```

### Response
```python
# Success (200/201)
class [Resource]Response(BaseModel):
    id: int
    field1: str
    created_at: datetime

# Error (4xx)
{"detail": "Error message"}
```

### Authorization
- Required role: [public/authenticated/admin]
- Resource ownership check: [yes/no]"""),
    ("react-component", "React Component Template", """## Component: [Name]

### Props
```typescript
interface [Name]Props {
  prop1: string;
  prop2?: number;
  onAction: (id: string) => void;
}
```

### States
- Default: [description]
- Loading: [description]
- Error: [description]
- Empty: [description]

### Design Tokens
- Background: var(--color-surface)
- Text: var(--color-text-primary)
- Padding: var(--space-4)
- Border radius: var(--radius-md)

### Accessibility
- Role: [ARIA role]
- Keyboard: [Tab, Enter, Escape behaviors]
- Screen reader: [announcements]"""),
    ("db-model", "Database Model Template", """## Model: [Name]

### Schema
```python
class [Name](Base):
    __tablename__ = "[table_name]"

    id = Column(Integer, primary_key=True, index=True)
    # fields
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # relationships
    # owner = relationship("User", back_populates="[items]")
```

### Indexes
- Primary: id
- [Additional indexes for common queries]

### Constraints
- [Unique constraints]
- [Foreign key constraints]
- [Check constraints]"""),
    ("test-suite", "Test Suite Template", """## Test Suite: [Feature/Module]

### Unit Tests
```python
class Test[Feature]:
    def test_[happy_path](self):
        \"\"\"[What this tests]\"\"\"
        # Arrange
        # Act
        # Assert

    def test_[edge_case](self):
        \"\"\"[What this tests]\"\"\"

    def test_[error_case](self):
        \"\"\"[What this tests]\"\"\"
```

### Integration Tests
```python
class Test[Feature]Integration:
    def test_[api_endpoint](self, client):
        \"\"\"[End-to-end test description]\"\"\"

    def test_[auth_required](self, client):
        \"\"\"Verify auth is enforced\"\"\"

    def test_[database_interaction](self, db_session):
        \"\"\"Verify data persistence\"\"\"
```

### Edge Cases to Cover
- [ ] Empty input
- [ ] Maximum length input
- [ ] Invalid types
- [ ] Concurrent access
- [ ] Network failures (for external calls)"""),
    ("docker-config", "Docker Configuration Template", """## Dockerfile
```dockerfile
# Multi-stage build
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## docker-compose.yml
```yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5
volumes:
  pgdata:
```"""),
    ("cicd-pipeline", "CI/CD Pipeline Template", """## GitHub Actions Workflow
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install ruff
      - run: ruff check .

  test:
    needs: lint
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r requirements.txt -r requirements-test.txt
      - run: pytest --cov --cov-report=xml

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app .
```"""),
    ("migration-script", "Alembic Migration Template", """## Migration: [description]

```python
\"\"\"[description]

Revision ID: [auto]
Revises: [auto]
Create Date: [auto]
\"\"\"
from alembic import op
import sqlalchemy as sa

revision = '[auto]'
down_revision = '[auto]'

def upgrade():
    op.create_table(
        '[table_name]',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    # op.add_column('[table]', sa.Column('[name]', sa.String()))
    # op.create_index('ix_[table]_[column]', '[table]', ['[column]'])

def downgrade():
    op.drop_table('[table_name]')
    # op.drop_column('[table]', '[name]')
    # op.drop_index('ix_[table]_[column]')
```"""),
    ("api-docs", "API Documentation Template", """## [API Name] Documentation

### Base URL
`http://localhost:8000/api`

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Create account | No |
| POST | /auth/login | Get tokens | No |
| POST | /auth/refresh | Refresh token | Yes |

#### [Resource]
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /[resource] | List all | Yes |
| POST | /[resource] | Create new | Yes |
| GET | /[resource]/{id} | Get by ID | Yes |
| PUT | /[resource]/{id} | Update | Yes |
| DELETE | /[resource]/{id} | Delete | Yes |

### Error Responses
| Code | Description |
|------|-------------|
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 422 | Unprocessable entity |
| 500 | Internal server error |"""),
    ("readme", "Project README Template", """# [Project Name]

[One-line description]

## Quick Start
```bash
# Clone and setup
git clone [repo-url]
cd [project-name]

# Backend
python -m venv venv
source venv/bin/activate  # or venv\\Scripts\\activate on Windows
pip install -r requirements.txt
cp .env.example .env  # Edit with your values
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, Alembic
- **Frontend:** Next.js, React, TypeScript
- **Database:** PostgreSQL
- **Auth:** JWT

## Project Structure
```
├── app/
│   ├── main.py
│   ├── api/routes/
│   ├── models/
│   ├── schemas/
│   └── services/
├── frontend/
│   ├── src/pages/
│   ├── src/components/
│   └── src/lib/api/
├── tests/
├── alembic/
├── docker-compose.yml
└── README.md
```

## Environment Variables
See `.env.example` for required configuration.

## API Documentation
Run the server and visit `http://localhost:8000/docs` for interactive API docs.
"""),
]

for name, title, content in templates_data:
    write(f"dev-studio/templates/{name}.md", f"# {title}\n\n{content}")

# References
refs_data = [
    ("tech-stack", "MDS Standard Tech Stack", """## Backend
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
- **Testing:** pytest (Python), Jest + React Testing Library (TypeScript)"""),
    ("api-conventions", "API Design Conventions", """## URL Structure
- Base: `/api/v1/`
- Resources: plural nouns (`/users`, `/products`)
- Nested: `/users/{id}/orders`
- Actions: POST to `/resources/{id}/[action]`

## HTTP Methods
- GET: Read (list or detail)
- POST: Create
- PUT: Full update
- PATCH: Partial update
- DELETE: Remove

## Response Format
```json
{
  "data": {},
  "meta": {"total": 100, "page": 1}
}
```

## Error Format
```json
{
  "detail": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "errors": [{"field": "email", "message": "Invalid format"}]
}
```

## Status Codes
- 200: Success
- 201: Created
- 204: No content (successful delete)
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict
- 422: Validation error
- 500: Server error

## Pagination
- Query params: `?skip=0&limit=100`
- Default limit: 100, max: 1000
- Response includes total count in meta"""),
    ("testing-patterns", "Testing Patterns and Standards", """## Test Structure
```
tests/
├── unit/           # Isolated function tests
├── integration/    # API endpoint tests
├── e2e/            # Full flow tests
└── conftest.py     # Shared fixtures
```

## Coverage Thresholds
- Backend: 80% minimum
- Frontend: 70% minimum
- Critical paths: 100% (auth, payments)

## Test Naming
- `test_[feature]_[scenario]_[expected_result]`
- Example: `test_login_invalid_password_returns_401`

## Fixture Pattern
```python
@pytest.fixture
def test_user(db_session):
    user = User(email="test@example.com")
    db_session.add(user)
    db_session.commit()
    yield user
    db_session.delete(user)
```

## What to Test
- Happy path (expected usage)
- Edge cases (empty, max, boundary)
- Error cases (invalid input, auth failures)
- Security (injection, unauthorized access)"""),
    ("security-checklist", "Security Development Checklist", """## Authentication
- [ ] Passwords hashed with bcrypt (cost 12+)
- [ ] JWT with short expiry (15 min access, 7 day refresh)
- [ ] Refresh token rotation
- [ ] Rate limiting on auth endpoints

## Authorization
- [ ] Resource ownership verified on every request
- [ ] Role-based access control where needed
- [ ] No privilege escalation paths

## Input Validation
- [ ] All inputs validated with Pydantic
- [ ] SQL queries use parameterized statements
- [ ] File uploads validated (type, size)
- [ ] No user input in SQL, OS commands, or templates

## OWASP Top 10
- [ ] A01: Broken Access Control — ownership checks
- [ ] A02: Cryptographic Failures — bcrypt, TLS, no plaintext secrets
- [ ] A03: Injection — parameterized queries, input validation
- [ ] A04: Insecure Design — threat modeling done
- [ ] A05: Security Misconfiguration — secure defaults, no debug in prod
- [ ] A06: Vulnerable Components — dependencies audited
- [ ] A07: Auth Failures — strong passwords, rate limiting
- [ ] A08: Data Integrity — signed tokens, CSRF protection
- [ ] A09: Logging Failures — security events logged
- [ ] A10: SSRF — no user-controlled URLs in server requests

## Headers
- [ ] CORS configured correctly (not wildcard in prod)
- [ ] Content-Security-Policy set
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security set"""),
    ("deployment-patterns", "Deployment Patterns", """## Docker Multi-Stage Build
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
- Feature flags for risky changes"""),
    ("file-ownership", "File Ownership by Agent", """## Product Manager
- `docs/requirements.md`
- `docs/user-stories.md`

## Systems Architect
- `docs/architecture.md`
- `docs/api-contracts.md`

## Database Engineer
- `app/models/*.py`
- `alembic/versions/*.py`
- `scripts/seed.py`

## Backend Developer
- `app/api/routes/*.py`
- `app/services/*.py`
- `app/schemas/*.py`
- `app/core/auth.py`
- `app/core/config.py`
- `app/main.py`

## Frontend Developer
- `frontend/src/pages/**`
- `frontend/src/components/**`
- `frontend/src/hooks/**`
- `frontend/src/lib/api/**`
- `frontend/src/styles/**`

## QA Engineer
- `tests/**`
- `pytest.ini`
- `.coveragerc`

## DevOps Engineer
- `Dockerfile`
- `docker-compose.yml`
- `.github/workflows/**`
- `.env.example`

## Technical Writer
- `README.md`
- `docs/api-documentation.md`
- `CONTRIBUTING.md`"""),
    ("code-style", "Code Style Guide", """## Python (Backend)
- Formatter: Ruff
- Line length: 88
- Quotes: double
- Imports: sorted by ruff (isort compatible)
- Type hints: required for function signatures
- Docstrings: Google style for public functions

## TypeScript (Frontend)
- Formatter: Prettier
- Linter: ESLint
- Semicolons: yes
- Quotes: single
- Components: functional with hooks
- Types: explicit interfaces, avoid `any`

## Naming Conventions
| Context | Convention | Example |
|---------|-----------|---------|
| Python variables | snake_case | user_name |
| Python classes | PascalCase | UserService |
| Python constants | UPPER_SNAKE | MAX_RETRIES |
| TS variables | camelCase | userName |
| TS components | PascalCase | UserProfile |
| TS interfaces | PascalCase | UserProps |
| DB tables | snake_case plural | user_profiles |
| DB columns | snake_case | created_at |
| API paths | kebab-case | /user-profiles |
| Env vars | UPPER_SNAKE | DATABASE_URL |"""),
]

for name, title, content in refs_data:
    write(f"dev-studio/references/{name}.md", f"# {title}\n\n{content}")

# Scripts
write("dev-studio/scripts/scaffold_fastapi.py", '''"""FastAPI Project Scaffolder — generates project structure from architecture spec."""

import os

def scaffold(project_name, models=None, routes=None):
    """Generate FastAPI project structure."""
    models = models or ["user"]
    routes = routes or ["auth", "users"]

    dirs = [
        f"{project_name}/app/api/routes",
        f"{project_name}/app/core",
        f"{project_name}/app/models",
        f"{project_name}/app/schemas",
        f"{project_name}/app/services",
        f"{project_name}/alembic/versions",
        f"{project_name}/tests/unit",
        f"{project_name}/tests/integration",
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # Create __init__.py files
    for d in dirs:
        init = os.path.join(d, "__init__.py")
        if not os.path.exists(init):
            open(init, "w").close()

    print(f"Scaffolded {project_name} with {len(models)} models, {len(routes)} routes")
    return dirs

if __name__ == "__main__":
    scaffold("my_app", ["user", "post"], ["auth", "users", "posts"])
''')

write("dev-studio/scripts/scaffold_nextjs.py", '''"""Next.js Project Scaffolder — generates frontend structure from architecture spec."""

import os

def scaffold(project_name, pages=None, components=None):
    """Generate Next.js project structure."""
    pages = pages or ["index", "login", "dashboard"]
    components = components or ["Layout", "Header", "Footer"]

    dirs = [
        f"{project_name}/src/app",
        f"{project_name}/src/components",
        f"{project_name}/src/hooks",
        f"{project_name}/src/lib/api",
        f"{project_name}/src/styles",
        f"{project_name}/public",
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    print(f"Scaffolded {project_name} with {len(pages)} pages, {len(components)} components")
    return dirs

if __name__ == "__main__":
    scaffold("frontend", ["index", "login", "dashboard", "settings"], ["Layout", "Header", "Sidebar"])
''')

write("dev-studio/scripts/generate_tests.py", '''"""Test Generator — creates test stubs from route definitions."""

def generate_test_file(route_path, methods, auth_required=True):
    """Generate pytest test file for an API route."""
    resource = route_path.strip("/").split("/")[-1]
    tests = []

    for method in methods:
        if method == "GET":
            tests.append(f"""
def test_get_{resource}_success(client, auth_headers):
    response = client.get("{route_path}", headers=auth_headers)
    assert response.status_code == 200
""")
        elif method == "POST":
            tests.append(f"""
def test_create_{resource}_success(client, auth_headers):
    data = {{}}  # TODO: add test data
    response = client.post("{route_path}", json=data, headers=auth_headers)
    assert response.status_code == 201
""")

    if auth_required:
        tests.append(f"""
def test_{resource}_unauthorized(client):
    response = client.get("{route_path}")
    assert response.status_code == 401
""")

    return "\\n".join(tests)

if __name__ == "__main__":
    print(generate_test_file("/api/users", ["GET", "POST"]))
''')

print("\\nDev studio complete!")
print(f"Files created: SKILL.md + 9 agents + 6 workflows + 11 templates + 7 references + 3 scripts")
