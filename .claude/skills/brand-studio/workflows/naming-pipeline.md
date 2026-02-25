---
name: naming-pipeline
studio: brand-studio
description: "Creative naming from brief to final candidate selection"
estimated_cost: "$0.015"
---

# Naming Pipeline

## Overview
Creative naming from brief to final candidate selection

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Brief
### Agent: brand-strategist (Inline)
Define naming criteria, constraints, and brand fit.

## Phase 2: Generate
### Agent: naming-specialist (Subagent)
Brainstorm 20+ candidates, filter to top 10.

## Phase 3: Screen
Preliminary trademark and cultural checks.

## Phase 4: Select
Score top 5, present to human for final decision.

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to department head
- Budget exceeded: halt and report to department head
