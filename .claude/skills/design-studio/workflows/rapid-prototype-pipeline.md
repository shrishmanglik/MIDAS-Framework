---
name: rapid-prototype-pipeline
studio: design-studio
description: "Quick wireframe to mockup for concept validation"
estimated_cost: "$0.030"
---

# Rapid Prototype Pipeline

## Overview
Quick wireframe to mockup for concept validation

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Wireframe
### Agent: ui-designer (Subagent)
Low-fidelity layout with content hierarchy.

## Phase 2: Quick Review
### Agent: ux-researcher (Inline)
Fast heuristic check on wireframe.

## Phase 3: Mockup
### Agent: ui-designer (Subagent)
Apply visual design to approved wireframe.

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to department head
- Budget exceeded: halt and report to department head
