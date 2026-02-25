---
name: database-migration-pipeline
studio: dev-studio
description: "Safe database schema change pipeline"
estimated_cost: "$0.030"
---

# Database Migration Pipeline

## Overview
Safe database schema change pipeline

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Schema Design
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
### Output: Migration review report

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to VP of Engineering
- Budget exceeded: halt and report to VP of Engineering
