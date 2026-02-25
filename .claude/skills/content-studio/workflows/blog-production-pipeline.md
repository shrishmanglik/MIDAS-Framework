---
name: blog-production-pipeline
studio: content-studio
description: "End-to-end blog post production from brief to publish-ready"
estimated_cost: "$0.050"
---

# Blog Production Pipeline

## Overview
End-to-end blog post production from brief to publish-ready

## Phase 1: Strategy
### Agent: content-director (Inline)
Create content brief with audience, goal, keywords, and key messages.
### Output: Content brief

## Phase 2: SEO
### Agent: seo-specialist (Inline)
Keyword research, search intent analysis, meta tag drafts.
### Output: SEO strategy

## Phase 3: Draft
### Agent: blog-writer (Subagent)
Write full blog post following brief and SEO strategy.
### Output: Blog post draft

## Phase 4: Edit
### Agent: copy-editor (ALWAYS Subagent)
Grammar, brand voice, readability, fact-check flagging.
### Output: Edited blog post
### Gate: Brand voice compliance, readability score acceptable

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to Content Director
- Budget exceeded: halt and report
