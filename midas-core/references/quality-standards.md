# MIDAS Quality Standards

The 6-gate quality pipeline and studio-specific extensions.

---

## The 6-Gate Pipeline

### Gate 1: Schema/Structure Validation
- **Cost:** $0.00
- **Runs:** On every artifact
- **Checks:**
  - JSON/YAML parse without errors
  - Required fields present (per artifact schema)
  - Types match expectations
  - File in correct location per ownership matrix
- **Tools:** JSON parser, YAML parser, jsonschema validation

### Gate 2: Syntax/Lint Check
- **Cost:** $0.00
- **Runs:** On every code and config artifact
- **Checks:**
  - Python: `ruff check --select E,F,I` (errors, pyflakes, isort)
  - TypeScript: `tsc --noEmit`
  - JavaScript: `eslint`
  - Docker: `docker compose config`
  - YAML: yamllint
- **Pass criteria:** Zero errors. Warnings allowed but logged.

### Gate 3: Completeness Check
- **Cost:** $0.00
- **Runs:** On application code and architecture artifacts
- **Checks:**
  - All acceptance criteria from requirements addressed
  - No TODO/FIXME/HACK/placeholder in production code
  - All imports resolve to existing modules
  - All referenced files exist in the project
  - Every public function has docstring or clear naming
  - Error handling present (try/except, error responses)
- **Tools:** grep for TODO/FIXME, import resolution check

### Gate 4: Test Execution
- **Cost:** $0.00
- **Runs:** After code implementation
- **Checks:**
  - `pytest tests/ -v --tb=short` — all tests pass
  - `pytest --cov=app --cov-report=json` — coverage ≥ 80%
  - No flaky tests (run twice if uncertain)
  - Frontend: `npm test -- --coverage` — coverage ≥ 70%
- **Pass criteria:** All tests green. Coverage meets threshold.

### Gate 5: AI Review
- **Cost:** $0.005-$0.015
- **Runs:** Only if Gates 1-4 pass
- **Checks:**
  - Adversarial review: "Find 3-10 specific, actionable problems"
  - Architecture alignment: output matches the architecture spec
  - Security: SQL injection, XSS, auth bypass, secrets in code
  - Performance: N+1 queries, missing indexes, unbounded queries
- **Prompt pattern:** "You are a hostile code reviewer. Your job is to find real problems, not give compliments. Find 3-10 specific issues with file:line references."

### Gate 6: Human Review
- **Cost:** Time (human attention)
- **Runs:** At phase boundaries, not per-file
- **Present to human:**
  - Summary of what was produced
  - File tree with sizes
  - Test results (pass/fail/coverage)
  - AI review findings and resolutions
  - Budget report for the phase
- **Human options:** Approve, Request Changes, Abort

## Gate Sequence Rules

1. **Run in order.** Gate N only runs if Gates 1 through N-1 pass.
2. **Stop at first failure.** Don't run Gate 5 if Gate 2 fails.
3. **Fix forward.** Fix the artifact, not the gate.
4. **Re-run from Gate 1** after any fix (fixes can introduce new issues).
5. **Max 3 fix cycles** per artifact. After 3 failures, escalate.

## Gate Depth by Artifact Type

| Artifact | Gates | Rationale |
|---|---|---|
| Template output | 1-2 | Templates are pre-validated |
| Config files | 1-3 | Must parse and be complete |
| Application code | 1-5 | Full validation pipeline |
| Architecture docs | 1, 5-6 | Need human alignment |
| Requirements | 1, 6 | Schema + human approval |
| Final deliverable | All 6 | Maximum rigor |

## Studio-Specific Extensions

### Dev Studio
- Gate 2 adds: `ruff format --check` (consistent formatting)
- Gate 3 adds: Every API endpoint has corresponding test
- Gate 4 adds: Integration test (server starts, health check passes)

### Content Studio (planned)
- Gate 2 adds: Word count within platform limits
- Gate 3 adds: Required sections present (hook, body, CTA)
- Gate 5 adds: Tone and brand voice alignment review
