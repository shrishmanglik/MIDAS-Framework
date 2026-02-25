---
name: design-system-creation
studio: design-studio
description: "Create design token system and component library from scratch"
estimated_cost: "$0.060"
---

# Design System Creation

## Overview
Create design token system and component library from scratch

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Audit
Review existing brand assets and guidelines.
### Output: Brand asset inventory

## Phase 2: Tokens
### Agent: design-system-architect (Subagent)
Define color, typography, spacing, elevation, motion tokens.
### Output: Token specification

## Phase 3: Components
### Agent: ui-designer (Subagent)
Design core components using token system.
### Output: Component specifications

## Phase 4: Review
### Agent: accessibility-auditor (ALWAYS Subagent)
Verify all components meet WCAG AA.
### Output: Component a11y audit

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to department head
- Budget exceeded: halt and report to department head
