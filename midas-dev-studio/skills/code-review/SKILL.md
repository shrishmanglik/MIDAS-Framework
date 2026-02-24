---
name: code-review
description: "Adversarial code review protocol. Finds specific, actionable problems in code. Use after implementation for quality assurance. Triggers on: code review request, quality audit, security review."
---

# Adversarial Code Review

## Framing
"I am a competitor's senior engineer reviewing this code. My job is to find real problems that would cause production incidents, security breaches, or maintenance nightmares."

## Review Checklist

### Security
- [ ] SQL injection: Are queries parameterized? Any string concatenation in queries?
- [ ] Auth bypass: Can endpoints be accessed without proper authentication?
- [ ] Data leakage: Do responses expose sensitive fields (passwords, internal IDs)?
- [ ] CORS: Is it too permissive? Does it allow arbitrary origins in production?
- [ ] Secrets: Are any credentials, API keys, or tokens hardcoded?
- [ ] Input validation: Are all user inputs validated before processing?
- [ ] Rate limiting: Are sensitive endpoints (login, register) rate-limited?

### Correctness
- [ ] Error handling: Do all operations have try/except? Are errors logged?
- [ ] Null checks: Are None/null cases handled before accessing attributes?
- [ ] Type safety: Are type hints consistent? Any `Any` types hiding bugs?
- [ ] Edge cases: Empty lists, zero values, maximum lengths handled?
- [ ] Race conditions: Are concurrent modifications handled (optimistic locking)?
- [ ] Data consistency: Are related operations in transactions?

### Performance
- [ ] N+1 queries: Are relationships loaded eagerly in list endpoints?
- [ ] Missing indexes: Are filtered/sorted columns indexed?
- [ ] Unbounded queries: Do list endpoints have pagination limits?
- [ ] Memory: Are large result sets streamed or paginated?
- [ ] Caching: Are frequently-read, rarely-written data cached?

### Maintainability
- [ ] Naming: Are variables, functions, classes clearly named?
- [ ] Separation: Is business logic in services, not route handlers?
- [ ] DRY: Is there significant code duplication?
- [ ] Dependencies: Are unused imports/dependencies present?
- [ ] Configuration: Are magic numbers extracted to config?

## Output Format

For each finding:

```
### [Finding Title]
- **Location:** `file_path:line_number`
- **Severity:** Critical / High / Medium / Low
- **Category:** Security / Performance / Correctness / Maintainability
- **Description:** What's wrong and why it matters.
- **Recommendation:** Specific fix with code example if applicable.
```

## Rules
- Find 3-10 specific problems. Not more, not less.
- Every finding must have a file:line reference.
- Never say "looks good overall." Find real issues.
- Prioritize: Security > Correctness > Performance > Maintainability.
- Include code snippets showing the problem and the fix.
