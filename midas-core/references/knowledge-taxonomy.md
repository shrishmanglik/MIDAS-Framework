# MIDAS Knowledge Taxonomy

The 12-domain classification system for accumulated learnings.

---

## Domain Tags

### ARCH — Architecture
**What gets tagged:** System design decisions, technology choices, component boundaries, integration patterns, scalability trade-offs.
**Example:** `[ARCH] **FastAPI dependency injection depth limit:** Nesting Depends() more than 2 levels deep causes circular dependency errors. Flatten DI chains.`

### ORCH — Orchestration
**What gets tagged:** Agent coordination patterns, multi-agent sequencing, handoff improvements, pipeline optimizations.
**Example:** `[ORCH] **Parallel phase execution:** Backend and frontend agents can work simultaneously when OpenAPI spec is the contract. Reduces Phase 3 time by 40%.`

### PROM — Prompt Engineering
**What gets tagged:** Prompt patterns that worked or failed, instruction formats, persona effectiveness, output format reliability.
**Example:** `[PROM] **Adversarial review framing:** "Find 3-10 specific problems" produces better results than "review this code." The number range forces specificity.`

### QUAL — Quality & Testing
**What gets tagged:** Test strategies, validation patterns, edge cases discovered, coverage insights, gate effectiveness.
**Example:** `[QUAL] **Auth edge case pattern:** Always test: expired token, malformed token, missing token, valid token for deleted user. These 4 cover 90% of auth bugs.`

### COST — Cost Optimization
**What gets tagged:** API cost reduction strategies, caching patterns, model selection insights, template opportunities discovered.
**Example:** `[COST] **CRUD templates save ~$0.05 per entity:** Standard 4-endpoint CRUD via template costs $0.00 vs $0.012 via Sonnet generation. For 5 entities, that's $0.06 saved.`

### DPLY — Deployment
**What gets tagged:** Docker configurations, CI/CD patterns, hosting decisions, environment management, health check patterns.
**Example:** `[DPLY] **Multi-stage Docker builds:** Reduced image size from 1.2GB to 180MB by using python:3.11-slim and separating build/runtime stages.`

### PROD — Product Strategy
**What gets tagged:** Feature priorities, user need insights, pricing observations, market positioning, MVP scope decisions.
**Example:** `[PROD] **MVP scope test:** If removing a feature doesn't prevent the core user journey, it's not P0. Applied this to cut 40% of initial scope.`

### DSGN — Design & UX
**What gets tagged:** UI component patterns, layout decisions, accessibility insights, responsive design patterns.
**Example:** `[DSGN] **Form validation UX:** Inline validation on blur (not on every keystroke) reduces user frustration. Show errors near the field, not at top of form.`

### DATA — Data & Database
**What gets tagged:** Schema design decisions, migration patterns, query optimization, indexing strategies, data modeling insights.
**Example:** `[DATA] **Soft delete pattern:** Add is_deleted boolean + deleted_at timestamp instead of actual DELETE. Enables audit trail and undo. Add index on is_deleted for query performance.`

### FAIL — Failure Patterns
**What gets tagged:** What went wrong, root cause analysis, what was tried, what fixed it. **Most valuable tag.**
**Example:** `[FAIL] **Alembic migration ordering:** Auto-generated migrations don't handle column renames correctly. They generate DROP + ADD instead of ALTER. Always review generated migrations manually.`

### FLOW — Workflow
**What gets tagged:** Development workflow insights, tool usage patterns, productivity observations, process improvements.
**Example:** `[FLOW] **Phase 2→3 transition:** Architecture review with human takes 5 min but saves 30+ min of rework in Phase 3. Never skip the human gate at this boundary.`

### SCALE — Scaling
**What gets tagged:** Performance patterns, bottleneck identification, load testing results, optimization strategies.
**Example:** `[SCALE] **N+1 query detection:** Always check SQLAlchemy queries for N+1 patterns after implementing list endpoints. Use joinedload() for relationships accessed in list views.`

---

## Usage Rules

1. **Tag every learning.** No untagged entries.
2. **One primary tag per learning.** Cross-reference secondary tags in text if needed.
3. **FAIL is always relevant.** When in doubt, tag it FAIL.
4. **Check before creating.** Search existing knowledge before adding duplicates.
5. **Update, don't duplicate.** If a learning evolves, update the existing entry.
6. **Confidence levels:** Note if something is observed once vs. confirmed pattern.

## Directory Structure

```
knowledge/
├── ARCH/
│   └── 2026-02-24-fastapi-di-depth.md
├── FAIL/
│   └── 2026-02-24-alembic-rename-bug.md
├── COST/
│   └── 2026-02-24-crud-template-savings.md
└── ...
```

File naming: `YYYY-MM-DD-short-description.md`
