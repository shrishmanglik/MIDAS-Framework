# Cost Optimization Guide

## Three-Tier Execution Model

### Tier 1: Templates (~60% of work)
**Cost:** ~$0.00 (no LLM call)
**Method:** String interpolation, file scaffolding, boilerplate generation
**Examples:**
- FastAPI project scaffold → template with variable substitution
- Docker Compose files → template with service names
- CRUD endpoint generation → template per entity
- CI/CD pipeline config → template with repo name
- Test file scaffolding → template with function signatures

**Decision rule:** If output is >80% predictable from inputs → Tier 1

### Tier 2: Rules + Light LLM (~25% of work)
**Cost:** ~$0.001-$0.005 per task
**Method:** Deterministic logic + Haiku/Sonnet for light interpretation
**Examples:**
- Tax slab computation → rules engine + Haiku for edge cases
- XBRL tag mapping → lookup table + Haiku for ambiguous tags
- Yoga detection (astrology) → rule-based pattern matching
- Exam blueprint generation → deterministic mark allocation
- SEO keyword density check → regex + Haiku for quality judgment

**Decision rule:** If output is deterministic with <20% requiring judgment → Tier 2

### Tier 3: Full LLM (~15% of work)
**Cost:** $0.01-$0.10+ per task
**Method:** Full model reasoning (Sonnet or Opus)
**Examples:**
- Architecture design → requires deep reasoning
- Content writing → requires creativity
- Code review → requires nuanced understanding
- Financial interpretation → requires domain expertise + judgment
- Cross-studio coordination → requires complex planning

**Decision rule:** If output requires reasoning, creativity, or judgment → Tier 3

## Model Pricing Reference

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Best For |
|-------|----------------------|------------------------|----------|
| Haiku | $0.25 | $1.25 | Classification, extraction, formatting |
| Sonnet | $3.00 | $15.00 | Most agent work, code, analysis |
| Opus | $15.00 | $75.00 | Architecture, deep analysis, critical review |

## Budget Formula

```
Task Budget = Σ(phase_budget)
Phase Budget = (estimated_input_tokens × input_price) + (estimated_output_tokens × output_price)
Studio Budget = Σ(task_budgets) + 20% buffer
Project Budget = Σ(studio_budgets) + 10% contingency
```

## Cost Reduction Strategies

1. **Template maximization:** Before using LLM, check if a template exists
2. **Model stepping:** Start Haiku → Sonnet → Opus (only escalate on failure)
3. **Context minimization:** Load only required files, not entire codebase
4. **Output capping:** Set max_tokens to expected output size
5. **Caching:** Cache semantic results for repeated similar queries
6. **Batch processing:** Group similar tasks for single LLM call
7. **Early termination:** If phase output is clearly wrong, halt before completion

## Budget Enforcement Protocol

```
BEFORE each phase:
  IF remaining_budget < phase_estimated_cost:
    HALT
    REPORT to department head: "Budget insufficient for Phase [N]"
    OPTIONS: skip phase / reduce scope / request budget increase / halt project

AFTER each phase:
  actual_cost = calculate_actual_cost()
  remaining_budget -= actual_cost
  IF actual_cost > phase_estimated_cost × 1.5:
    WARNING to department head: "Phase [N] cost overrun: ${actual} vs ${estimated}"

AFTER each studio:
  IF total_cost > studio_budget:
    HALT all studio work
    REPORT to CEO: "Studio budget exceeded"
```
