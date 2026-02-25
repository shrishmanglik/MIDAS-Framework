---
name: frontend-build-pipeline
studio: dev-studio
description: "Frontend-only development pipeline"
estimated_cost: "$0.065"
---

# Frontend Build Pipeline

## Overview
Frontend-only development pipeline

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Architecture
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
### Output: Test suite and review report

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to VP of Engineering
- Budget exceeded: halt and report to VP of Engineering
