---
name: competitor-teardown-pipeline
studio: research-studio
description: "Systematic competitor analysis producing SWOT and positioning map"
estimated_cost: "$0.040"
estimated_phases: 3
---

# Competitor Teardown Pipeline

## Overview
Systematic analysis of 3+ competitors producing comparison matrices, SWOT analyses, and competitive positioning insights.

## Trigger
Keywords: "competitor analysis", "SWOT", "competitive landscape", "who competes with"

## Prerequisites
- At least 3 competitors identified (or brief to identify them)
- Comparison dimensions defined or inferrable

## Phase 1: Scope and Identify
### Agent
research-director (Inline)
### Inputs
- Product/market context, known competitors
### Steps
1. Finalize competitor list (minimum 3)
2. Define comparison dimensions (features, pricing, market position, team, funding)
3. Assign data gathering priorities
### Outputs
- Competitor list with comparison framework
### Quality Gate
- [ ] At least 3 competitors identified
- **Pass:** Clear comparison dimensions defined
- **Fail action:** Ask human for competitor identification help

## Phase 2: Analyze
### Agent
competitor-analyst (Subagent)
### Inputs
- Competitor list and comparison framework from Phase 1
### Steps
1. Build feature comparison matrix
2. Analyze pricing and positioning for each
3. Produce SWOT for each competitor
4. Identify competitive moats and vulnerabilities
### Outputs
- Competitor scorecard (templates/competitor-scorecard.md)
- Individual SWOT analyses (templates/swot-analysis.md)
### Quality Gate
- [ ] Every SWOT quadrant has evidence
- [ ] Scoring is consistent across competitors
- **Pass:** All competitors analyzed on all dimensions
- **Fail action:** Document gaps, proceed with available data

## Phase 3: Synthesize
### Agent
intelligence-synthesizer (ALWAYS Subagent)
### Inputs
- Competitor analysis from Phase 2
### Steps
1. Identify overall competitive dynamics
2. Find positioning gaps and opportunities
3. Challenge assumptions about competitor strengths
4. Produce competitive intelligence brief
### Outputs
- Competitive intelligence brief (templates/research-brief.md)
### Quality Gate
- [ ] Positioning opportunities identified
- [ ] At least one contrarian view presented
- **Pass:** Actionable insights for differentiation
- **Fail action:** Revise synthesis with more specific recommendations

## Execution Order
```
Phase 1 → Phase 2 → Phase 3 (sequential)
```

## Error Recovery
- Competitor data scarce: use public information, product demos, job postings as signals
- Too many competitors: prioritize by market share, limit to top 5
