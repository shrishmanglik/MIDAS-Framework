---
name: health-review-pipeline
studio: client-success-studio
description: "Regular client health assessment and intervention"
estimated_cost: "$0.020"
---

# Health Review Pipeline

## Overview
Regular client health assessment and intervention

## Phase 1: Analyze
### Agent: health-monitor (Subagent)
Calculate health scores, identify trends.

## Phase 2: Risk Assessment
### Agent: churn-analyst (ALWAYS Subagent)
Evaluate churn risk for declining accounts.

## Phase 3: Intervene
### Agent: cs-strategist (Inline)
Design intervention for at-risk accounts.

## Error Recovery
- Phase failure: escalate to VP of Client Success
