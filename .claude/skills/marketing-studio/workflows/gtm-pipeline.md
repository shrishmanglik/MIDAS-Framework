---
name: gtm-pipeline
studio: marketing-studio
description: "Go-to-market launch strategy"
estimated_cost: "$0.050"
---

# Gtm Pipeline

## Overview
Go-to-market launch strategy

## Phase 1: Market Analysis
Request market research from research-studio.

## Phase 2: Strategy
### Agent: marketing-strategist (Inline)
Positioning, channel strategy, launch timeline.

## Phase 3: Campaign Plan
### Agent: campaign-manager (Subagent)
Detailed launch plan with pre-launch, launch, post-launch phases.

## Phase 4: Review
### Agent: marketing-reviewer (ALWAYS Subagent)
GTM plan audit.

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to VP of Marketing
- Budget exceeded: halt and report
