---
name: design-review-pipeline
studio: design-studio
description: "Multi-dimensional design review: heuristics + accessibility + responsive"
estimated_cost: "$0.025"
---

# Design Review Pipeline

## Overview
Multi-dimensional design review: heuristics + accessibility + responsive

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Heuristic Review
### Agent: ux-researcher (Inline)
Nielsen's 10 heuristics evaluation.

## Phase 2: Accessibility Review
### Agent: accessibility-auditor (ALWAYS Subagent)
WCAG 2.1 AA compliance check.

## Phase 3: Responsive Review
### Agent: responsive-specialist (Inline)
Breakpoint behavior verification.

## Merge: Combine findings, prioritize by severity.

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to department head
- Budget exceeded: halt and report to department head
