---
name: cost-awareness
description: "Budget tracking and cost optimization for MIDAS operations. Ensures every task stays within budget and uses the cheapest viable approach. Triggers on: project initialization, phase transitions, model selection decisions."
---

# Cost Awareness Protocol

## Budget Defaults

| Project Size | Total Budget | Per-Phase Budget |
|---|---|---|
| Small (<5 endpoints) | $0.10 | $0.02/phase |
| Medium (5-15 endpoints) | $0.30 | $0.06/phase |
| Large (15+ endpoints) | $0.50 | $0.10/phase |

## Model Cost Reference

| Model | Input (per 1K tokens) | Output (per 1K tokens) | Use When |
|---|---|---|---|
| Haiku | $0.00025 | $0.00125 | Classification, formatting, simple tasks |
| Sonnet | $0.003 | $0.015 | Standard reasoning, code generation |
| Opus | $0.015 | $0.075 | Complex architecture, critical decisions |

## Rules

1. **Default to the cheapest model that can handle the task.**
   Most scaffolding → Haiku. Standard code → Sonnet. Architecture → Sonnet/Opus.

2. **Track costs per phase.** After each phase, estimate the API cost incurred.
   If approaching the phase budget, switch to cheaper approaches.

3. **HALT on budget exceeded.** Never silently continue. Report to human:
   "Phase X used $Y of $Z budget. Approve additional budget or adjust scope."

4. **Templates are free.** Every template-based generation costs $0.00.
   Maximize template usage before resorting to LLM generation.

## Cost Optimization Strategies

### Strategy 1: Template Maximization
- Maintain a library of templates for common patterns
- Every time Tier 3 generates something that could be a template, extract it
- Target: 75%+ of CRUD code from templates by v1.4

### Strategy 2: Model Cascading
- Start with Haiku. Only escalate if quality is insufficient.
- Decision tree: Haiku → Sonnet → Opus (never skip levels)
- Exception: Architecture and critical security always start at Sonnet minimum

### Strategy 3: Caching and Reuse
- Identical prompts → cached responses
- Similar projects → adapt existing outputs instead of generating from scratch
- Knowledge base → check before reasoning (answer may already exist)

### Strategy 4: Batch Operations
- Group similar operations (e.g., generate all CRUD endpoints at once)
- Single prompt for related tasks vs. multiple separate prompts
- Batch reduces per-operation overhead

## Phase Budget Breakdown (Medium Project)

| Phase | Budget | Primary Cost Driver |
|---|---|---|
| Phase 1: Init | $0.015 | PM analysis (Sonnet) |
| Phase 2: Plan | $0.035 | Architecture design (Sonnet) |
| Phase 3: Build | $0.100 | Code generation (Sonnet + templates) |
| Phase 4: Test | $0.035 | Test gen + review (Sonnet) |
| Phase 5: Deploy | $0.005 | Templates (Tier 1, nearly free) |
| **Total** | **$0.190** | |

## Budget Reporting Format

```
Budget Report — Phase [N]: [Name]
  Estimated cost: $X.XX
  Budget limit:   $X.XX
  Remaining:      $X.XX
  Status:         [ON TRACK / WARNING / EXCEEDED]
```
