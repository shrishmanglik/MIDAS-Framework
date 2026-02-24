---
name: knowledge-accumulation
description: "Extracts and stores learnings from every substantial task. Use at the end of any significant work session, project phase, or after resolving a non-trivial problem. Triggers on: task completion, error resolution, architecture decisions, pattern discovery."
---

# Knowledge Accumulation Protocol

After every substantial task (not simple Q&A), extract insights.

## Taxonomy

Tag each learning with its domain:

| Tag | Domain | What Gets Tagged |
|---|---|---|
| ARCH | Architecture | System design decisions, tech stack choices |
| ORCH | Orchestration | Agent coordination, multi-agent patterns |
| PROM | Prompt Engineering | Prompts that worked/failed, instruction patterns |
| QUAL | Quality & Testing | QA patterns, validation approaches, edge cases |
| COST | Cost Optimization | API cost reduction, caching patterns |
| DPLY | Deployment | CI/CD patterns, Docker configs, hosting |
| PROD | Product Strategy | Feature priorities, user needs, pricing |
| DSGN | Design & UX | UI patterns, component architecture |
| DATA | Data & Database | Schema design, migration patterns |
| FAIL | Failure Patterns | What went wrong and how it was fixed |
| FLOW | Workflow | Development workflow insights, tool usage |
| SCALE | Scaling | Performance patterns, bottleneck identification |

## Format

```
[TAG] **Pattern/Insight Title:** Description of what was learned, why it matters,
and how it could inform future work.
```

## Rules

1. **Only log genuine insights, not filler.** "We used FastAPI" is not a learning. "FastAPI's dependency injection broke when we nested 3 levels deep" is.
2. **FAIL entries are the most valuable.** Always log failures with root cause analysis.
3. **Include the "so what."** How does this change future behavior?
4. **If no learnings emerged**, say "No new learnings this session."
5. **Write to `knowledge/` directory**, organized by tag subdirectories.

## Cross-Session Persistence

Learnings accumulate across sessions via the filesystem. Before starting a task in a domain, check `knowledge/[TAG]/` for relevant prior learnings. This is how MIDAS gets smarter over time.

## Knowledge Quality Criteria

A good learning entry has:
- **Specificity**: Names the exact technology, version, or pattern
- **Context**: What was being attempted when this was discovered
- **Causation**: Why this happened (not just that it happened)
- **Action**: What to do differently next time
- **Confidence**: How certain are we (observed once vs. confirmed pattern)

## Examples

Good:
```
[FAIL] **SQLAlchemy async session deadlock:** When using async sessions with
FastAPI dependency injection, creating a session per-request via Depends() and
also using a background task that creates its own session causes deadlocks.
Fix: Use a single session factory with proper scope management. Confirmed
across 3 projects.
```

Bad:
```
[ARCH] **Used PostgreSQL:** We chose PostgreSQL for the database.
```
