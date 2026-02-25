---
name: proposal-pipeline
studio: sales-studio
description: "End-to-end proposal creation from opportunity to delivery"
estimated_cost: "$0.045"
---

# Proposal Pipeline

## Overview
End-to-end proposal creation from opportunity to delivery

## Phase 1: Qualify
### Agent: sales-strategist (Inline)
BANT/MEDDIC qualification, risk assessment.

## Phase 2: Strategy
### Agent: pricing-analyst (Subagent)
Pricing model, discount framework, ROI calculations.

## Phase 3: Write
### Agent: proposal-writer (Subagent)
Custom proposal with executive summary, scope, pricing, timeline.

## Phase 4: Review
### Agent: proposal-reviewer (ALWAYS Subagent)
Accuracy, pricing, legal, and competitive claim verification.
### Gate: Zero inaccuracies, pricing approved

## Error Recovery
- Phase failure: retry with enhanced context, escalate to VP of Sales
