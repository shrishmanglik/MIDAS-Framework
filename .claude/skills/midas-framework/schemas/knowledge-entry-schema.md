# Knowledge Entry Schema

Every learning captured by the knowledge accumulation system follows this format.

## Required Structure

```yaml
---
id: "[TAG]-[sequential-number]"
tag: "[ARCH|ORCH|PROM|QUAL|COST|DPLY|PROD|DSGN|DATA|FAIL|FLOW|SCALE]"
date: "[YYYY-MM-DD]"
studio: "[originating studio]"
severity: "[info|warning|critical]"
confidence: "[low|medium|high]"
---
```

## Required Sections

```markdown
# [Short descriptive title]

## Context
[1-2 sentences: what task was being performed when this was learned]

## Learning
[The actual insight — concrete, actionable, specific]

## Evidence
[What happened that demonstrated this learning — specific example]

## Application
[When to apply this learning in future — trigger conditions]

## Tags
- Primary: [main taxonomy tag]
- Secondary: [optional additional tags]
- Studios: [which studios benefit from this learning]
```

## Taxonomy Tags

| Tag | Domain | Examples |
|-----|--------|----------|
| ARCH | Architecture | System design, API patterns, tech selection |
| ORCH | Orchestration | Agent coordination, workflow sequencing, handoffs |
| PROM | Prompt Engineering | Prompt patterns, model behavior, output quality |
| QUAL | Quality & Testing | Test patterns, review findings, quality metrics |
| COST | Cost Optimization | Model routing, caching, budget management |
| DPLY | Deployment | Docker, CI/CD, infrastructure, monitoring |
| PROD | Product Strategy | Requirements, user needs, feature prioritization |
| DSGN | Design & UX | UI patterns, accessibility, design systems |
| DATA | Data & Database | Schema design, query optimization, data modeling |
| FAIL | Failure Patterns | What went wrong and why — HIGHEST PRIORITY |
| FLOW | Workflow | Process improvements, pipeline optimizations |
| SCALE | Scaling | Performance, growth handling, resource management |

## Aggregation Rules
- New entries are appended to `_shared/knowledge/[TAG]/`
- FAIL entries are ALWAYS written (never skipped for budget)
- Entries with confidence "low" are reviewed before being cited
- Duplicate detection: check for similar existing entries before writing
- Maximum 50 entries per tag before archival/consolidation

## Validation Rules
- Learning MUST be concrete and actionable (not "things went well")
- Evidence MUST reference a specific event or artifact
- Application MUST describe when this learning should be recalled
- FAIL entries MUST include root cause analysis
