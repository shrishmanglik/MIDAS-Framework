---
name: email-campaign-pipeline
studio: content-studio
description: "Email sequence creation from strategy to send-ready"
estimated_cost: "$0.045"
---

# Email Campaign Pipeline

## Overview
Email sequence creation from strategy to send-ready

## Phase 1: Strategy
### Agent: content-director (Inline)
Define campaign goal, audience segment, sequence length.

## Phase 2: Draft
### Agent: email-specialist (Subagent)
Write complete email sequence with subject lines and CTAs.

## Phase 3: Edit
### Agent: copy-editor (ALWAYS Subagent)
Brand voice, spam word check, CTA strength review.
### Gate: No spam trigger words, brand voice compliant

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to Content Director
- Budget exceeded: halt and report
