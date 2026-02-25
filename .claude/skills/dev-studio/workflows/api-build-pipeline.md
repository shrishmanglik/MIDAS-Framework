---
name: api-build-pipeline
studio: dev-studio
description: "Backend-only API development pipeline"
estimated_cost: "$0.080"
---

# Api Build Pipeline

## Overview
Backend-only API development pipeline

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Architecture
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
### Output: Test suite and review report

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to VP of Engineering
- Budget exceeded: halt and report to VP of Engineering
