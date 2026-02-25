---
name: competitive-response-pipeline
studio: sales-studio
description: "Rapid competitive response when competitor enters deal"
estimated_cost: "$0.020"
---

# Competitive Response Pipeline

## Overview
Rapid competitive response when competitor enters deal

## Phase 1: Intelligence
Request competitor data from research-studio.

## Phase 2: Response
### Agent: objection-handler (Inline)
Objection responses for competitor-specific scenarios.
### Agent: sales-enablement-lead (Subagent)
Battle card update.

## Phase 3: Review
### Agent: proposal-reviewer (ALWAYS Subagent)
Verify competitive claims.

## Error Recovery
- Phase failure: retry with enhanced context, escalate to VP of Sales
