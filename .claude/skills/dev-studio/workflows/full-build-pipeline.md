---
name: full-build-pipeline
studio: dev-studio
description: "End-to-end application build from brief to deployment"
estimated_cost: "$0.145"
---

# Full Build Pipeline

## Overview
End-to-end application build from brief to deployment

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Requirements
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
### Gate: Docker build succeeds, pipeline defined

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to VP of Engineering
- Budget exceeded: halt and report to VP of Engineering
