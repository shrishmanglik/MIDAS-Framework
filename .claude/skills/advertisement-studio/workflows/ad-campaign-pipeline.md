---
name: ad-campaign-pipeline
studio: advertisement-studio
description: "End-to-end ad campaign from strategy to optimization"
estimated_cost: "$0.060"
---

# Ad Campaign Pipeline

## Overview
End-to-end ad campaign from strategy to optimization

## Phase 1: Strategy
### Agent: ad-strategist (Inline)
Define objectives, targeting, channel mix, KPIs.

## Phase 2: Creative
### Agent: ad-creative-director (Subagent)
Develop creative concepts, format specs.
### Agent: ad-copywriter (Subagent)
Write ad copy variants per platform.

## Phase 3: Media Planning
### Agent: media-buyer (Subagent)
Bid strategy, budget pacing, frequency settings.

## Phase 4: Configuration
### Agent: platform-specialist (Subagent)
Platform-specific campaign setup.

## Phase 5: Review
### Agent: ad-reviewer (ALWAYS Subagent)
Compliance audit across all platforms.

## Phase 6: Optimize
### Agent: ad-analytics-lead (Subagent)
Monitor, analyze, recommend optimizations.

## Error Recovery
- Phase failure: retry with adjusted parameters, escalate to VP of Advertising
- Budget exceeded: pause campaigns and report
