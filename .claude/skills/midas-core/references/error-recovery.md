# Error Recovery Reference

## Purpose
Define standard recovery procedures for failures at any stage of MIDAS execution.

## Recovery Procedures

### Quality Gate Failure
```
1. Read the specific failure message — do not guess
2. Identify the exact line/section that failed
3. Fix the specific issue — minimal change, not rewrite
4. Re-run the gate
5. If still failing: try a different approach (max 2 retries total)
6. If 2 retries exhausted: HALT and report to human
   - Report: what failed, what was tried, what the blockers are
```

### Budget Exceeded
```
1. Hard halt — no more operations
2. Report immediately:
   - What was spent (by operation)
   - Where the budget was exceeded
   - What remains to be done
3. Human decides: continue with more budget, or stop
4. Never auto-continue after budget exceeded
```

### Agent Failure (Agent produces unusable output)
```
1. Retry with enhanced context:
   - Add examples of expected output
   - Narrow the scope of the request
   - Increase specificity of instructions
2. If retry fails: escalate to studio-level recovery
   - Try a different agent for the same task
   - Decompose the task into smaller subtasks
3. If studio-level recovery fails: HALT and report to human
```

### External Service Failure (API down, rate limit, timeout)
```
1. Wait and retry once (30 second delay)
2. If still failing: check if the service is actually down
3. If down: report to human, suggest alternatives
4. If rate limited: wait for the specified retry-after period
5. Never retry more than 3 times for external services
```

### Unknown Task Type (No studio matches)
```
1. Do NOT guess or improvise
2. Ask the human for clarification:
   - "This task doesn't match any MIDAS studio. What type of work is this?"
   - Offer the closest matching studios as options
3. If human clarifies: route to appropriate studio
4. If truly novel: handle as a generic task without studio context
```

## Escalation Priority
1. Agent-level fix (retry with better context)
2. Studio-level fix (different agent, decomposed task)
3. Human escalation (report and wait)

## Rules
- Never silently fail — always report errors
- Never retry indefinitely — hard limit of 2 retries per issue
- Never weaken quality gates to avoid errors — fix the output
- Always preserve the human's ability to make the final decision
