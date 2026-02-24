---
name: architecture-design
description: "Transform structured requirements into a complete technical architecture specification. Triggers on: architecture design, system planning, API design, tech stack decisions."
---

# Architecture Design

Transform `output/requirements.json` into a complete technical architecture.

## Process

1. **Read requirements.** Parse all P0/P1 features, data entities, non-functional requirements.
2. **Select technology stack.** Use MDS defaults unless requirements dictate otherwise.
3. **Design data model.** Entities, relationships, key attributes from requirements.
4. **Design API.** RESTful endpoints covering all CRUD for all entities + auth.
5. **Design auth flow.** Registration, login, token refresh, logout, route protection.
6. **Plan file structure.** Every file the project will contain.
7. **Document deployment.** Containers, ports, environment variables.
8. **Produce OpenAPI spec.** Machine-readable API contract.

## Output Files

- `output/architecture.md` — Full architecture document
- `output/openapi-stub.yaml` — OpenAPI 3.1 specification

## Architecture Document Template

```markdown
# [Project Name] — Technical Architecture

## System Overview
[Component diagram showing frontend, backend, database, and external services]

## Technology Stack
| Component | Technology | Version | Rationale |
|---|---|---|---|
| Backend | FastAPI | 0.109+ | Type-safe, async, auto-docs |
| ... | ... | ... | ... |

## Data Model
### Entities
[Entity list with fields, types, and relationships]

### Relationships
[ER diagram or relationship table]

## API Design
### Endpoints
[Complete endpoint list with methods, paths, request/response]

### Authentication
[Auth flow diagram: register → login → access token → refresh → logout]

## File Structure
[Complete directory tree]

## Deployment
[Container architecture, ports, environment variables]
```

## Validation Criteria

- Every P0 feature maps to at least one API endpoint
- Every data entity from requirements has a model definition
- Auth flow covers: register, login, refresh, logout, protected routes
- File structure includes every file that will be created
- All technology choices have version numbers
