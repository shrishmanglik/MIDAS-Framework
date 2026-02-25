---
name: brand-audit-pipeline
studio: brand-studio
description: "Full brand consistency check across all assets and touchpoints"
estimated_cost: "$0.020"
---

# Brand Audit Pipeline

## Overview
Full brand consistency check across all assets and touchpoints

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Inventory
Catalog all brand touchpoints and assets.

## Phase 2: Voice Audit
### Agent: brand-voice-guardian (ALWAYS Subagent)
Review content for voice consistency.

## Phase 3: Visual Audit
### Agent: visual-identity-manager (Inline)
Check visual assets for compliance.

## Phase 4: Report
Consolidate findings with remediation priorities.

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to department head
- Budget exceeded: halt and report to department head
