---
name: campaign-launch-pipeline
studio: marketing-studio
description: "End-to-end campaign from strategy to launch and analysis"
estimated_cost: "$0.060"
---

# Campaign Launch Pipeline

## Overview
End-to-end campaign from strategy to launch and analysis

## Phase 1: Strategy
### Agent: marketing-strategist (Inline)
Define campaign objective, audience, channels, KPIs.

## Phase 2: Planning
### Agent: campaign-manager (Subagent)
Create detailed timeline, asset list, responsibilities.

## Phase 3: Content
Coordinate with content-studio for campaign assets.
### Agent: conversion-copywriter (Subagent) for key conversion copy.

## Phase 4: Review
### Agent: marketing-reviewer (ALWAYS Subagent)
Audit campaign plan, materials, and projections.

## Phase 5: Launch & Analyze
### Agent: analytics-specialist (Subagent)
Track performance, report results, recommend optimizations.

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to VP of Marketing
- Budget exceeded: halt and report
