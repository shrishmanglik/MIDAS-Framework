# Budget Management Reference

## Purpose
Track and control AI spending across all MIDAS operations. Every dollar matters — optimize aggressively.

## Budget Allocation Model

### Per-Task Budget
| Task Complexity | Max Budget | Typical Budget |
|----------------|-----------|----------------|
| Simple (1 agent, 1 studio) | $0.10 | $0.02-$0.05 |
| Medium (2-3 agents, 1 studio) | $0.50 | $0.10-$0.25 |
| Complex (3+ agents, 2 studios) | $2.00 | $0.50-$1.00 |
| Major (full product build) | $10.00 | $3.00-$7.00 |

### Per-Product Budget (Monthly)
| Product | Monthly AI Budget | Strategy |
|---------|------------------|----------|
| AstroAI | $50 | Heavy caching, deterministic calcs |
| ChemAI | $30 | Question bank pre-generation |
| FinSight | $20 | XBRL parsing is deterministic |
| Content | $100 | Highest LLM dependency |
| General ops | $50 | Dev, design, research tasks |

## Cost Tracking Format

At task completion, report:
```
COST REPORT:
- Operations: {N}
- Tier breakdown: T1={N} T2={N} T3={N}
- Total input tokens: {N}
- Total output tokens: {N}
- Estimated cost: ${X.XX}
- Budget remaining: ${X.XX}
```

## Budget Controls

### Soft Limits
- Warning at 80% of task budget
- Suggest optimization at 60% (have we used templates where possible?)

### Hard Limits
- Stop at 100% of task budget
- Report to human with remaining work estimate
- Human decides: allocate more budget or stop

### Emergency Override
- Human can override budget limits with explicit approval
- Override must specify new ceiling
- Override does not persist to next task

## Optimization Levers (In Priority Order)
1. Templates (Tier 1) — free, instant
2. Caching — first-call cost, subsequent calls free
3. Model downgrade — Haiku instead of Sonnet where quality allows
4. Prompt compression — shorter prompts, fewer tokens
5. Batch operations — one call instead of many
6. Scope reduction — do less, but do it well
