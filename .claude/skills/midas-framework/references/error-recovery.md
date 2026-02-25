# Error Recovery Protocol

## Error Types and Recovery Actions

### Type 1: Agent Failure
**Symptoms:** Agent produces output that fails quality gate, or produces no output.
**Recovery:**
1. Retry ONCE with enhanced context (add specific failure reason to prompt)
2. If retry fails → escalate to department head (studio SKILL.md)
3. Department head may: reassign to different agent, simplify task, or escalate to CEO
4. If department head fails → escalate to CEO
5. CEO may: route to different studio, decompose task, or HALT and report to human

### Type 2: Budget Exceeded
**Symptoms:** Phase cost exceeds allocation, or cumulative cost exceeds studio/project budget.
**Recovery:**
1. HALT immediately (do not continue spending)
2. Report to department head with: actual cost, budget, remaining work
3. Department head options:
   - Reduce remaining scope (cut non-essential phases)
   - Switch to cheaper models (Opus → Sonnet → Haiku)
   - Request budget increase from CEO
4. CEO options:
   - Reallocate budget from other studios
   - Reduce project scope
   - HALT and report to human for budget decision

### Type 3: Poor Output Quality
**Symptoms:** Output passes schema check but is qualitatively poor (vague, unhelpful, wrong).
**Recovery:**
1. Run adversarial review if not already done
2. Create specific feedback with exact issues and expected improvements
3. Retry with enhanced prompt including negative examples of what NOT to produce
4. If quality still poor → escalate to department head
5. Department head may: use higher-tier model, add domain context, or assign specialist

### Type 4: Unknown Task Type
**Symptoms:** Task doesn't match any studio routing or agent capability.
**Recovery:**
1. CEO checks routing-table.md exhaustively
2. If no match → ask human for clarification
3. If partial match → propose decomposition to human
4. NEVER guess or attempt tasks outside defined capabilities

### Type 5: Dependency Failure
**Symptoms:** Required upstream output is missing, incomplete, or incorrect.
**Recovery:**
1. Check if upstream studio has completed its phase
2. If not complete → wait (with timeout)
3. If complete but output is bad → report to upstream studio for fix
4. If upstream can't fix → escalate to CEO for cross-studio resolution
5. CEO may: provide alternative data source, reduce scope, or HALT

### Type 6: Conflicting Requirements
**Symptoms:** Two studios or agents produce contradictory outputs.
**Recovery:**
1. CEO identifies the conflict
2. Determine which studio has domain authority
3. Domain authority studio's output takes precedence
4. Non-authoritative studio must adapt
5. If both have equal authority → HALT and present options to human

### Type 7: Context Window Exhaustion
**Symptoms:** Agent context is full, can't process more input.
**Recovery:**
1. Summarize existing context (lossy but necessary)
2. Spawn subagent with only the essential context
3. Break task into smaller chunks that fit in context
4. Use references on disk (load on demand) instead of in-context

## Escalation Chain
```
Agent → Studio SKILL.md (Department Head) → CEO (midas-framework) → Human
```
Rules:
- Never skip levels
- Each level has 1 retry before escalating
- HALT is always available at any level
- Human is the final decision maker

## Error Logging
Every error produces a FAIL knowledge entry:
- What happened (symptoms)
- Root cause (why)
- Recovery action taken
- Outcome (resolved / escalated / halted)
- Prevention (how to avoid next time)

Written to: `_shared/knowledge/FAIL/`
