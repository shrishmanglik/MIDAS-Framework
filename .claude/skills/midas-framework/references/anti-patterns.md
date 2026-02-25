# Anti-Patterns Registry

Known failure modes. Check this list BEFORE starting any task.

## Architecture Anti-Patterns

**AP-ARCH-001: God Agent**
One agent does everything. No separation of concerns.
Fix: Split into domain-specific agents with clear boundaries.

**AP-ARCH-002: Chatty Handoffs**
Agents pass excessive context between each other, inflating token usage.
Fix: Use handoff-artifact-schema — self-contained, minimal context.

**AP-ARCH-003: Circular Dependencies**
Studio A depends on B, B depends on A.
Fix: Introduce shared artifact in _shared/ that both read from.

**AP-ARCH-004: Premature Abstraction**
Building generic frameworks before solving the specific problem.
Fix: Solve the concrete case first. Abstract only after 3+ repetitions.

**AP-ARCH-005: Schema Drift**
Output schemas evolve informally without updating consumers.
Fix: Schema changes go through versioning. All consumers validate.

## Orchestration Anti-Patterns

**AP-ORCH-001: Fire and Forget**
Spawning subagent without checking output quality.
Fix: Every subagent output passes through quality gate before acceptance.

**AP-ORCH-002: Sequential When Parallel**
Running independent tasks one-at-a-time when they could be parallel.
Fix: Check DAG — if no data dependency, run in parallel.

**AP-ORCH-003: Infinite Retry**
Retrying failed agent with same inputs hoping for different output.
Fix: Max 1 retry with enhanced context. Then escalate.

**AP-ORCH-004: Context Contamination**
Adversarial reviewer receives generation context, biasing the review.
Fix: ALWAYS spawn reviewers with ONLY artifact + acceptance criteria.

**AP-ORCH-005: Orphaned Subagents**
Subagent completes but output is never consumed.
Fix: Every spawn has a registered consumer. Track completion.

## Prompt Anti-Patterns

**AP-PROM-001: Vague Instructions**
"Make it better" instead of "Reduce response time to <200ms."
Fix: Every instruction has measurable acceptance criteria.

**AP-PROM-002: Example Overload**
Giving 10+ examples instead of clear rules.
Fix: Rules + 2 examples maximum. Let the model generalize.

**AP-PROM-003: Conflicting Constraints**
"Be concise AND thorough" without priority ordering.
Fix: Rank constraints explicitly. Use "MUST/SHOULD/MAY" hierarchy.

**AP-PROM-004: Role Confusion**
Agent prompt doesn't establish clear identity and boundaries.
Fix: Use agent-persona-schema — identity, capabilities, forbidden actions.

## Quality Anti-Patterns

**AP-QUAL-001: Testing After Deploy**
Skipping test phase to save budget, then fixing in production.
Fix: Testing is non-negotiable. Budget for it upfront.

**AP-QUAL-002: Happy Path Only**
Testing only the expected flow, missing edge cases.
Fix: Adversarial review MUST include edge case enumeration.

**AP-QUAL-003: Review Theater**
Review process exists but findings are ignored.
Fix: Every finding must be addressed (fix or documented accept-risk).

**AP-QUAL-004: Metric Vanity**
Tracking metrics that feel good but don't indicate quality.
Fix: Every metric must connect to a user outcome or business goal.

## Cost Anti-Patterns

**AP-COST-001: Opus for Everything**
Using the most expensive model for tasks Haiku could handle.
Fix: Apply three-tier routing. Default to cheapest viable model.

**AP-COST-002: Regenerate Instead of Edit**
Throwing away 95% good output and regenerating from scratch.
Fix: Edit the existing output. Only regenerate if fundamentally wrong.

**AP-COST-003: Unbounded Context**
Loading entire codebase into context when agent needs 2 files.
Fix: Agents declare inputs explicitly. Load only what's needed.

**AP-COST-004: No Budget Tracking**
Not tracking cost per phase, discovering overrun at project end.
Fix: Budget tracking at every phase boundary. Hard stops on overrun.
