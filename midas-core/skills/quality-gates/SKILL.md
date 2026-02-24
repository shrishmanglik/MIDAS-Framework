---
name: quality-gates
description: "Universal quality validation protocol. Apply after any artifact generation to ensure it meets MIDAS standards. Triggers on: file creation, code generation, content production, configuration changes, any output that will be handed off."
---

# Quality Gate Protocol

Run gates in order. Stop at first failure. Fix the output, not the gate.

## Gate 1: Schema/Structure Validation ($0.00 — ALWAYS FIRST)
- JSON/YAML files parse without errors
- Required fields are present
- Types match expectations
- File is in the correct location per ownership rules

## Gate 2: Syntax/Lint Check ($0.00)
- Code: ruff check (Python), tsc --noEmit (TypeScript), eslint (JS)
- Content: word count within platform limits, required sections present
- Config: docker-compose config validates, CI YAML is valid

## Gate 3: Completeness Check ($0.00)
- All acceptance criteria addressed
- No TODO/FIXME/placeholder comments in production code
- All imports resolve
- All referenced files exist
- Every function has error handling

## Gate 4: Test Execution ($0.00)
- Unit tests pass (pytest, jest)
- Coverage meets threshold (80% for code)
- No flaky tests (run 2x if uncertain)

## Gate 5: AI Review ($0.005-$0.015 — only if Gates 1-4 pass)
- Adversarial review: "Find 3-10 specific problems"
- Architecture alignment: does this match the spec?
- Security check: common vulnerability patterns
- Performance check: obvious bottlenecks

## Gate 6: Human Review (conditional)
- Present: summary, file tree, test results, review findings
- Human approves or requests changes
- Only at phase boundaries, not every file

## Applying Gates

Not every artifact needs all 6 gates. Match the gate depth to the risk:

| Artifact Type | Gates Applied |
|---|---|
| Template output (Tier 1) | 1-2 only |
| Config files | 1-3 |
| Application code | 1-5 |
| Architecture decisions | 1, 5-6 |
| Final deliverable | All 6 |

## Gate Failure Protocol

1. **Identify** which gate failed and why.
2. **Fix** the artifact (not the gate).
3. **Re-run** from Gate 1 (earlier gates may be affected by the fix).
4. **Log** the failure for knowledge accumulation (FAIL tag).
5. **Escalate** if the same gate fails 3 times on the same artifact.

## Gate Metrics

Track per project:
- Pass rate per gate (target: >90% on first attempt)
- Most common failure gate (identifies systematic issues)
- Average fix iterations (target: <2)
