# Quality Gates Reference

## Purpose
Every deliverable passes through quality gates before delivery. Gates catch defects early. Never modify a gate to make output pass — fix the output.

## Gate Definitions

### Gate 1: Schema
- **Checks:** Output matches the declared/expected structure
- **Applies to:** All structured output (code, JSON, YAML, templates)
- **How to verify:** Parse the output against its schema definition. If a template defines sections A, B, C — all three must exist with correct types.
- **Failure action:** Restructure output to match schema

### Gate 2: Completeness
- **Checks:** All required sections present, no TODOs, no placeholders
- **Applies to:** All output
- **How to verify:** Search for "TODO", "TBD", "placeholder", "coming soon", empty sections. All fields must have real content.
- **Failure action:** Fill in missing content

### Gate 3: Correctness
- **Checks:** Code compiles, tests pass, content is factually accurate
- **Applies to:** Code (must compile/run), content (must be accurate), data (must be valid)
- **How to verify:** Run the code. Execute the tests. Fact-check claims against references.
- **Failure action:** Fix errors, re-run tests

### Gate 4: Security
- **Checks:** No hardcoded secrets, no injection vectors, auth present where needed
- **Applies to:** All code, configuration files, deployment scripts
- **How to verify:** Scan for API keys, passwords, connection strings. Check SQL for parameterized queries. Verify auth middleware on protected routes.
- **Failure action:** Remove secrets, add parameterization, add auth

### Gate 5: Standards
- **Checks:** Follows coding conventions, writing style, formatting rules
- **Applies to:** All output
- **How to verify:** Run linter (code), check brand voice (content), verify formatting (all)
- **Failure action:** Apply formatting fixes, adjust voice/style

## Gate Execution Rules

1. Gates run in order (Schema -> Completeness -> Correctness -> Security -> Standards)
2. A gate failure halts progression — fix before moving to next gate
3. Maximum 2 retries per gate — if still failing after 2 fixes, HALT and report to human
4. Never skip a gate. Never weaken a gate. Never pass output that fails a gate.
5. Document gate results: PASS/FAIL with specific findings
