---
name: user-research-pipeline
studio: research-studio
description: "User persona creation and jobs-to-be-done analysis"
estimated_cost: "$0.030"
estimated_phases: 3
---

# User Research Pipeline

## Overview
Create data-driven user personas and JTBD maps from available user data, interviews, or domain knowledge.

## Trigger
Keywords: "user persona", "who are our users", "jobs to be done", "user research"

## Prerequisites
- Target user segment identified
- Some user data available (interviews, analytics, surveys, or domain knowledge)

## Phase 1: Scope
### Agent
research-director (Inline)
### Inputs
- Target segment description
- Available data sources
### Steps
1. Define research questions about user behavior
2. Identify available data and gaps
3. Design research approach (existing data vs new research)
### Outputs
- Research scope with data source plan
### Quality Gate
- [ ] Research questions focused on behavior, not demographics
- **Pass:** Viable data plan
- **Fail action:** Recommend minimum viable research approach

## Phase 2: Build Personas and JTBD
### Agent
user-researcher (Subagent for synthesis, Inline for single persona)
### Inputs
- Research scope and available data from Phase 1
### Steps
1. Analyze behavioral patterns in available data
2. Create persona profiles with empathy maps
3. Map jobs-to-be-done (functional, emotional, social)
4. Build user journey maps with pain points
### Outputs
- User personas (templates/user-persona.md)
- JTBD framework
- Journey maps
### Quality Gate
- [ ] Personas grounded in behavior, not stereotypes
- [ ] JTBD includes all three dimensions
- **Pass:** Personas are distinct and actionable
- **Fail action:** Refine with additional data or narrower segmentation

## Phase 3: Validate and Synthesize
### Agent
intelligence-synthesizer (ALWAYS Subagent)
### Inputs
- Personas and JTBD from Phase 2
### Steps
1. Challenge persona assumptions
2. Identify gaps in user understanding
3. Prioritize jobs by business opportunity
4. Produce actionable insights brief
### Outputs
- User research brief (templates/research-brief.md)
### Quality Gate
- [ ] Assumptions explicitly labeled
- [ ] Recommendations for design/product teams
- **Pass:** Actionable insights for product decisions
- **Fail action:** Document gaps, recommend follow-up research

## Execution Order
```
Phase 1 → Phase 2 → Phase 3 (sequential)
```

## Error Recovery
- Insufficient user data: create hypothesis-based personas, clearly labeled
- Conflicting user needs: segment into distinct personas
