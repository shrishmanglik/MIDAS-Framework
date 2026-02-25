---
name: code-review-pipeline
studio: dev-studio
description: "Multi-dimensional code review"
estimated_cost: "$0.025"
---

# Code Review Pipeline

## Overview
Multi-dimensional code review

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Security Review
### Agent: qa-engineer (ALWAYS Subagent)
OWASP Top 10 scan, auth review, injection testing.
### Output: Security findings

## Phase 2: Quality Review
### Agent: qa-engineer (ALWAYS Subagent)
Code quality, patterns, error handling, edge cases.
### Output: Quality findings

## Phase 3: Performance Review
### Agent: performance-engineer (Subagent)
Query analysis, bundle size, caching opportunities.
### Output: Performance findings

## Merge: Combine all findings, prioritize by severity.

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to VP of Engineering
- Budget exceeded: halt and report to VP of Engineering
