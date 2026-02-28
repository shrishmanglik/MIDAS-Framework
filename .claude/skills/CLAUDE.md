# CLAUDE.md — MIDAS Framework

Read this file FIRST. It is the operating system for every task.

---

## What Is MIDAS

MIDAS (Multi-agent Intelligent Development & Automation System) is MDS's internal framework for building software, content, and business operations using specialized AI agents organized into studios. Think of it as a virtual company where each studio is a department and each agent is an employee.

---

## Skill Loading Protocol

### Routing Table

| Task Type | Load These Skills |
|-----------|-------------------|
| Build web app / API / database | midas-core + dev-studio |
| Build with domain knowledge | midas-core + dev-studio + domain-studios/{relevant} |
| Write content (posts/articles) | midas-core + content-studio |
| AI video/image prompt generation | midas-core + content-studio (prompt-engineers/) |
| Design UI/UX | midas-core + design-studio |
| Market research / competitive analysis | midas-core + research-studio |
| Marketing campaigns / landing pages | midas-core + marketing-studio |
| Sales proposals / pitch decks | midas-core + sales-studio |
| Full product launch | midas-core + dev + content + marketing + design |

### Loading Priority
1. CLAUDE.md (this file — always, first)
2. midas-core/SKILL.md (always, second)
3. Relevant studio SKILL.md files (on demand)
4. Specific agent .md files (for the task at hand)
5. Templates (if generating standard outputs)
6. References (only when specific knowledge needed)

### Context Budget Rules
- **Never load more than 3 studios simultaneously**
- **Never load more than 5 agent files simultaneously**
- **Load references on-demand, not preemptively**
- **Progressive disclosure:** read > execute > release > read next

---

## The Three-Tier Rule (MANDATORY)

Before generating ANY output, check:

```
TIER 1: Does a TEMPLATE exist for this?
  -> Yes: Use the template. Cost: $0.00. Speed: instant.
  -> No: Continue to Tier 2.

TIER 2: Can RULES/PATTERNS handle this?
  -> Yes: Apply rule-based logic. Cost: ~$0.00.
  -> No: Continue to Tier 3.

TIER 3: Requires LLM GENERATION.
  -> Use the cheapest model that can handle it.
  -> Haiku for simple tasks, Sonnet for standard, Opus for novel.
```

Violation of this rule wastes money. Every template-eligible task that uses LLM generation is a failure.

---

## Quality Gates

Every deliverable passes through gates before completion:

| Gate | What It Checks | Enforcement |
|------|---------------|-------------|
| Schema | Output matches expected format | Automated validation |
| Completeness | All required sections present | Checklist verification |
| Correctness | Code compiles, tests pass, content is accurate | Execution-based |
| Security | No hardcoded secrets, no SQL injection, auth present | Scanner + review |
| Standards | Follows coding/writing conventions | Linter + style check |

**Never modify a gate to make output pass. Fix the output.**

---

## Error Recovery

```
IF quality gate fails:
  1. Read the specific failure message
  2. Fix the specific issue
  3. Re-run the gate. Max 2 retries.
  4. If still failing -> HALT and report to human.

IF budget exceeded:
  1. Hard halt. No retries.
  2. Report: what was spent, where, what remains.
  3. Human decides whether to continue.
```

---

## Knowledge Accumulation

At the end of every substantial task, append learnings to `knowledge/MIDAS-LEARNINGS.md` using this format:

```
* [TAG] Pattern Title: What was learned, why it matters, how to encode it into a protocol.
```

Tags: ARCH, ORCH, PROM, QUAL, COST, DPLY, PROD, DSGN, DATA, FAIL, FLOW, SCALE

Only genuine insights. No filler.

---

## MDS Business Context

### Products (All Using MIDAS)
| Product | Domain | Repo | Status |
|---------|--------|------|--------|
| MDS Website | Company site | mds-website | Deployed |
| AstroAI Studio | Vedic astrology | astroai-studio | In development |
| ChemAI Studio | Chemistry education | chemai-studio | Architecture ready |
| Thread Intelligence | Fashion supply chain | thread-intelligence | On Vercel |
| FinSight AI | Financial analysis | finsight-ai | Early |
| ATLAS | Cross-border tax | atlas-tax | Early |
| JobFlow | Job tracking | jobflow | Early |

### Cost Optimization Target
- <$0.01 per user interaction in AI costs
- Deterministic-first: compute before you call an AI
- Cache by feature-hash, not exact inputs

### Architecture Defaults
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: FastAPI (Python) or Next.js API routes
- Database: Supabase (PostgreSQL)
- Hosting: Vercel (frontend), Railway/Docker (backend)
- ORM: Prisma (TS) or SQLAlchemy (Python)
