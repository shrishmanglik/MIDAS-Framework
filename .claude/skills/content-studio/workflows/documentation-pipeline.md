---
name: documentation-pipeline
studio: content-studio
description: "Technical documentation production"
estimated_cost: "$0.040"
---

# Documentation Pipeline

## Overview
Technical documentation production

## Phase 1: Scope
### Agent: content-director (Inline)
Define documentation scope, audience, structure.

## Phase 2: Draft
### Agent: technical-writer (Subagent)
Write documentation with code examples and step-by-step guides.

## Phase 3: Review
### Agent: copy-editor (ALWAYS Subagent)
Clarity, completeness, accuracy review.

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to Content Director
- Budget exceeded: halt and report
