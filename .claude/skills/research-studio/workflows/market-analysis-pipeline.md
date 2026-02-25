---
name: market-analysis-pipeline
studio: research-studio
description: "End-to-end market sizing and analysis workflow"
estimated_cost: "$0.045"
estimated_phases: 4
---

# Market Analysis Pipeline

## Overview
Complete market sizing workflow from brief to actionable report. Produces TAM/SAM/SOM, growth projections, and segmentation analysis.

## Trigger
Keywords: "market size", "TAM", "market opportunity", "industry analysis"

## Prerequisites
- Market/industry vertical defined
- Geographic scope specified

## Phase 1: Scope
### Agent
research-director (Inline)
### Inputs
- Raw brief describing market to analyze
### Steps
1. Extract market vertical, geography, and timeframe
2. Define top-down and bottom-up research questions
3. Identify data sources needed
### Outputs
- Research scope with numbered questions
### Quality Gate
- [ ] Questions are specific and answerable
- **Pass:** All questions mappable to data sources
- **Fail action:** Ask human for clarification

## Phase 2: Gather
### Agent
market-researcher (Subagent)
### Inputs
- Research scope from Phase 1
### Steps
1. Execute top-down sizing (industry reports, government data)
2. Execute bottom-up sizing (unit economics, customer count)
3. Identify 3-5 major trends
4. Segment market by relevant dimensions
### Outputs
- Raw market data with sources
- Trend analysis
### Quality Gate
- [ ] Both top-down and bottom-up methods attempted
- [ ] Sources cited for every data point
- **Pass:** TAM/SAM/SOM hierarchy is logical
- **Fail action:** Retry with broader data sources

## Phase 3: Analyze
### Agent
data-analyst (Subagent)
### Inputs
- Raw market data from Phase 2
### Steps
1. Validate data consistency across sources
2. Calculate growth rates with confidence intervals
3. Build segmentation breakdown
### Outputs
- Statistical analysis with confidence intervals
### Quality Gate
- [ ] Confidence intervals included
- **Pass:** Data passes consistency checks
- **Fail action:** Flag inconsistencies, proceed with documented caveats

## Phase 4: Synthesize
### Agent
intelligence-synthesizer (ALWAYS Subagent)
### Inputs
- Market data and analysis from Phases 2-3
### Steps
1. Challenge key assumptions in sizing
2. Identify gaps and risks in the analysis
3. Produce executive brief with recommendations
### Outputs
- Market analysis report (templates/market-report.md)
### Quality Gate
- [ ] At least 2 assumptions challenged
- [ ] Actionable recommendations included
- **Pass:** Brief is executive-readable, under 2 pages
- **Fail action:** Revise for clarity

## Execution Order
```
Phase 1 → Phase 2 → Phase 3 → Phase 4
(strictly sequential — each depends on previous)
```

## Error Recovery
- Phase 2 data gap: use proxy markets, document assumptions
- Budget exceeded: skip Phase 3, synthesize directly from Phase 2
