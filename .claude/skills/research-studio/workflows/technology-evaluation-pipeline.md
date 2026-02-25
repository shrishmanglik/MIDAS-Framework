---
name: technology-evaluation-pipeline
studio: research-studio
description: "Objective technology evaluation using weighted scoring matrices"
estimated_cost: "$0.035"
estimated_phases: 3
---

# Technology Evaluation Pipeline

## Overview
Objective evaluation of technology options using weighted criteria, producing a defensible recommendation backed by evidence.

## Trigger
Keywords: "evaluate technology", "which framework", "tech comparison", "should we use"

## Prerequisites
- Technology category defined (e.g., "Python ORM", "frontend framework")
- At least 2 candidate technologies

## Phase 1: Define Criteria
### Agent
research-director (Inline)
### Inputs
- Technology category and candidates
- Project constraints (team, timeline, budget)
### Steps
1. Define evaluation criteria (performance, ecosystem, learning curve, etc.)
2. Assign weights based on project priorities
3. Set minimum threshold scores
### Outputs
- Weighted evaluation framework
### Quality Gate
- [ ] Weights sum to 100%
- **Pass:** Criteria relevant to project needs
- **Fail action:** Adjust criteria with stakeholder input

## Phase 2: Evaluate
### Agent
technology-evaluator (Subagent)
### Inputs
- Evaluation framework from Phase 1
- Technology candidates
### Steps
1. Score each technology against each criterion
2. Document evidence for each score
3. Identify "when NOT to use" for each option
4. Assess migration/switching costs
### Outputs
- Tech evaluation matrix (templates/tech-evaluation-matrix.md)
### Quality Gate
- [ ] Every score justified
- [ ] Migration costs included
- **Pass:** All candidates scored consistently
- **Fail action:** Research additional evidence for low-confidence scores

## Phase 3: Recommend
### Agent
intelligence-synthesizer (ALWAYS Subagent)
### Inputs
- Evaluation matrix from Phase 2
### Steps
1. Verify scoring consistency
2. Challenge the highest-ranked option (contrarian test)
3. Produce recommendation with confidence level
### Outputs
- Technology recommendation brief
### Quality Gate
- [ ] Contrarian challenge documented
- [ ] Recommendation includes confidence level
- **Pass:** Clear, defensible recommendation
- **Fail action:** Present top 2 options with trade-offs for human decision

## Execution Order
```
Phase 1 → Phase 2 → Phase 3 (sequential)
```

## Error Recovery
- No clear winner: present top 2-3 with trade-off analysis
- New candidate emerges: add to matrix, re-evaluate
