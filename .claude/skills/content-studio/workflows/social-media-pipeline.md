---
name: social-media-pipeline
studio: content-studio
description: "Social media content batch creation"
estimated_cost: "$0.025"
---

# Social Media Pipeline

## Overview
Social media content batch creation

## Phase 1: Strategy
### Agent: content-director (Inline)
Define campaign theme, platforms, posting cadence.

## Phase 2: Create
### Agent: social-media-writer (Subagent)
Platform-specific posts, captions, hashtags.

## Phase 3: Review
### Agent: copy-editor (ALWAYS Subagent)
Brand voice, platform conventions, CTA review.

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to Content Director
- Budget exceeded: halt and report
