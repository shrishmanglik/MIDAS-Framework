---
name: three-tier-routing
description: "Determines the optimal execution tier (template, rules, or LLM) for any task. Use this skill before generating any code, content, or artifact to ensure cost-optimal execution. Triggers on: any generation request, code scaffolding, content drafting, configuration creation."
---

# Three-Tier Routing

Before executing ANY generation task, classify it:

## Tier 1: Templates ($0.00)
Use when the output follows a known, repeatable pattern.

**Examples:**
- FastAPI CRUD endpoint scaffolding
- React component boilerplate
- Docker/docker-compose configuration
- CI/CD pipeline YAML
- Pydantic model from schema
- Test file structure
- README templates
- API documentation

**How:** Check available skills for template-based generation. If a skill exists that produces this output deterministically, use it.

## Tier 2: Rules + Classification ($0.001)
Use when the task requires selecting among known options, not creating something new.

**Examples:**
- Choosing the right database type for a use case
- Selecting an API authentication pattern
- Routing to the correct error handler
- Classifying a bug report by severity
- Determining which agent should handle a task

**How:** Apply decision trees, lookup tables, or simple classification. Use Haiku for borderline cases that need light reasoning.

## Tier 3: Genuine LLM Reasoning (varies)
Use ONLY when Tiers 1 and 2 cannot handle the task.

**Examples:**
- Novel architecture design for unusual requirements
- Business logic that doesn't fit known patterns
- Creative content writing
- Complex debugging with unclear root cause
- Strategic analysis and decision-making

**How:** Use Sonnet for standard reasoning. Reserve Opus for complex multi-step architecture or critical decisions.

## Routing Decision Tree

```
Is there a template/skill for this exact output?
├── YES → Tier 1 ($0.00) — use the template
└── NO → Is this a selection among known options?
    ├── YES → Tier 2 (~$0.001) — use rules/classification
    └── NO → Does this need deep reasoning?
        ├── Complex → Tier 3 with Sonnet/Opus
        └── Simple → Tier 3 with Haiku
```

## Cost Impact

| Tier | Cost per Operation | Target % of Operations |
|---|---|---|
| Tier 1 (Templates) | $0.00 | 60% |
| Tier 2 (Rules) | ~$0.001 | 15% |
| Tier 3 (LLM) | $0.003-$0.075 | 25% |

## Application Rules

1. **Always check Tier 1 first.** If a template exists, use it. Period.
2. **Tier 2 before Tier 3.** Many "reasoning" tasks are actually classification.
3. **Log the tier used.** Track for cost reporting.
4. **Escalate, don't default.** Start at Tier 1, only escalate when the tier genuinely can't handle the task.
