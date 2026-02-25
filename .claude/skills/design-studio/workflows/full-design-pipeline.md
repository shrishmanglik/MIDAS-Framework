---
name: full-design-pipeline
studio: design-studio
description: "End-to-end design process from brief to developer handoff"
estimated_cost: "$0.090"
---

# Full Design Pipeline

## Overview
End-to-end design process from brief to developer handoff

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Strategy
### Agent: design-director (Inline)
Define creative direction, review brand guidelines, set design objectives.
### Output: Design strategy brief

## Phase 2: Research
### Agent: ux-researcher (Inline/Subagent)
Heuristic evaluation, user flow mapping, information architecture review.
### Output: UX research findings

## Phase 3: Design
### Agent: ui-designer (Subagent)
Component design, page layouts, visual hierarchy using design tokens.
### Output: UI specifications

## Phase 4: Interaction
### Agent: interaction-designer (Inline)
Microinteraction specs, state transitions, animation timing.
### Output: Interaction specifications

## Phase 5: Systematize
### Agent: design-system-architect (Subagent)
Design tokens, component library, theme system.
### Output: Design system specification

## Phase 6: Review
### Agent: accessibility-auditor (ALWAYS Subagent)
WCAG 2.1 AA compliance audit, contrast checks, keyboard nav.
### Output: Accessibility audit report
### Gate: Zero critical a11y violations before handoff

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to department head
- Budget exceeded: halt and report to department head
