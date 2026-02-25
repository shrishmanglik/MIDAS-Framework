# Adversarial Review Protocol

## Standard Review (90% of tasks)

### Setup
- Reviewer is ALWAYS a subagent (fresh context, non-negotiable)
- Reviewer receives ONLY: the artifact + acceptance criteria
- Reviewer does NOT receive: generation prompt, agent context, or rationale
- Reviewer MUST produce 3-10 findings minimum

### Reviewer Meta-Prompt
```
You are reviewing an artifact you did NOT create. You have no context about
how or why it was built — judge it purely on its merits against the acceptance
criteria.

You MUST find between 3 and 10 issues. If the artifact appears perfect,
look harder — consider edge cases, security implications, maintainability,
and implicit assumptions.

For each finding:
- SEVERITY: CRITICAL / HIGH / MEDIUM / LOW
- LOCATION: exact file path + line or section
- ISSUE: what is wrong
- FIX: specific fix recommendation
- CATEGORY: [security | performance | correctness | maintainability | completeness]

You may NOT return fewer than 3 findings. An empty review is a failed review.
```

### Cost
- Estimated: $0.003-$0.005 per review
- Model: Sonnet (default) or Opus (for critical)

## Parallel Multi-Dimensional Review (10% — critical tasks)

### Setup
Three concurrent subagents, each reviewing ONE dimension:

**Reviewer A: Security + Data Integrity**
```
Focus exclusively on:
- Authentication/authorization bypasses
- Input validation gaps
- SQL injection, XSS, CSRF vectors
- Data leakage risks
- Secrets in code
- Dependency vulnerabilities
```

**Reviewer B: Performance + Scalability**
```
Focus exclusively on:
- N+1 query patterns
- Missing indexes
- Unbounded queries
- Memory leaks
- Missing pagination
- Connection pool exhaustion
- Cache invalidation issues
```

**Reviewer C: Architecture + Maintainability**
```
Focus exclusively on:
- Separation of concerns violations
- Tight coupling between modules
- Missing abstractions
- Inconsistent patterns
- Dead code
- Circular dependencies
- Missing error handling
```

### Merge Protocol
1. CEO/orchestrator collects all three reviewer outputs
2. Deduplicate findings (same issue found by multiple reviewers)
3. Resolve conflicts (if reviewers disagree)
4. Prioritize: CRITICAL first, then HIGH, then MEDIUM/LOW
5. Create unified review report

### Cost
- Estimated: ~$0.015 per review (3× standard)
- Model: Sonnet for A+B, Opus for C (architecture requires deeper reasoning)

## Escalation Triggers (Deterministic)

Task gets PARALLEL review if ANY of these are true:
```
task.is_client_facing == true
task.touches_auth_or_payments == true
task.defines_architecture == true
task.modifies_database_schema == true
task.budget > $5000
```

All other tasks get STANDARD review.

## Review Response Protocol

After review findings are returned:
1. **CRITICAL findings:** MUST be fixed before proceeding. No exceptions.
2. **HIGH findings:** SHOULD be fixed. Can proceed with documented accept-risk.
3. **MEDIUM findings:** FIX if within budget. Document if deferred.
4. **LOW findings:** DOCUMENT for future improvement. No fix required now.

Accept-risk decisions require:
- Explicit acknowledgment by department head
- Written justification
- Timeline for eventual remediation
