# MIDAS Cost Optimization Guide

Actionable strategies for minimizing AI API costs while maintaining output quality.

---

## The Three-Tier Model

### Tier 1: Deterministic Templates ($0.00)
- **What:** Pre-built templates for repeatable patterns
- **Coverage target:** 60% of all operations
- **Examples:** CRUD endpoints, Docker configs, CI pipelines, Pydantic models, test scaffolds
- **Implementation:** Template strings with variable substitution. No LLM needed.

### Tier 2: Rules + Classification (~$0.001)
- **What:** Decision trees, lookup tables, simple if/then logic
- **Coverage target:** 15% of all operations
- **Examples:** Database selection, auth pattern choice, error routing, bug severity
- **Implementation:** Structured decision trees. Haiku for borderline cases.

### Tier 3: Genuine LLM Reasoning ($0.003-$0.075)
- **What:** Tasks requiring creative or analytical thinking
- **Coverage target:** 25% of all operations
- **Examples:** Novel architecture, business logic, complex debugging, strategic analysis
- **Implementation:** Model cascading (Haiku → Sonnet → Opus based on complexity)

## Model Selection Table

| Task Type | Recommended Model | Cost per 1K Output Tokens |
|---|---|---|
| Code formatting, simple transforms | Haiku | $0.00125 |
| Classification, routing decisions | Haiku | $0.00125 |
| Standard code generation | Sonnet | $0.015 |
| Requirements analysis | Sonnet | $0.015 |
| Code review, test generation | Sonnet | $0.015 |
| Complex architecture design | Sonnet (Opus for critical) | $0.015-$0.075 |
| Strategic decisions, novel problems | Opus | $0.075 |

## Caching Strategy

### Level 1: Template Cache
- Store generated templates for reuse across projects
- Key: template name + version + parameters hash
- Hit rate target: 60%+

### Level 2: Response Cache
- Cache LLM responses for identical or near-identical prompts
- Key: prompt hash + model + temperature
- TTL: Per session (templates are project-specific)

### Level 3: Knowledge Cache
- Query `knowledge/` before invoking LLM
- If prior learning addresses the question, use that instead
- Reduces redundant reasoning across sessions

## Budget Enforcement Rules

1. **Set budget at project init.** Based on project size classification.
2. **Track per phase.** Report estimated cost after each phase.
3. **HALT, don't degrade.** When budget is exceeded, stop and ask human. Don't silently switch to cheaper (lower quality) approaches.
4. **Log cost decisions.** When you choose a cheaper model, log why.
5. **Templates are free.** Always prefer Tier 1 over Tier 2 over Tier 3.

## Cost Estimation Formulas

```
Phase cost ≈ (input_tokens × input_price) + (output_tokens × output_price)

Typical token counts per operation:
  - Requirements analysis: ~2K in, ~3K out (Sonnet) = ~$0.015
  - Architecture design: ~4K in, ~6K out (Sonnet) = ~$0.035
  - CRUD endpoint (template): 0 tokens = $0.00
  - CRUD endpoint (from spec): ~1K in, ~2K out (Sonnet) = ~$0.012
  - Test generation: ~3K in, ~4K out (Sonnet) = ~$0.025
  - Docker config (template): 0 tokens = $0.00
  - Code review: ~5K in, ~2K out (Sonnet) = ~$0.015
```

## Quick Reference: When to Use What

| If you're doing this... | Use this | Cost |
|---|---|---|
| Generating a CRUD endpoint | Template (Tier 1) | $0.00 |
| Choosing between REST and GraphQL | Decision tree (Tier 2) | ~$0.001 |
| Designing a novel auth flow | Sonnet (Tier 3) | ~$0.02 |
| Writing a Dockerfile | Template (Tier 1) | $0.00 |
| Debugging a cryptic error | Sonnet/Opus (Tier 3) | ~$0.03 |
| Generating test cases from spec | Sonnet (Tier 3) | ~$0.025 |
| Formatting JSON/YAML | Haiku or template | $0.00-$0.001 |
