# Proven Patterns Registry

Validated patterns to follow. Apply these proactively.

## Architecture Patterns

**PAT-ARCH-001: Layered Agent Architecture**
Separate agents by concern: data → logic → presentation.
When: Any multi-step build task.

**PAT-ARCH-002: Schema-First Design**
Define output schemas before writing any agent logic.
When: Starting any new studio, workflow, or agent.

**PAT-ARCH-003: Immutable Handoffs**
Handoff artifacts are read-only. Receiving agent creates new output, never modifies input.
When: Every inter-agent or inter-studio handoff.

**PAT-ARCH-004: Progressive Enhancement**
Start with Tier 1 template, enhance with Tier 2 rules, polish with Tier 3 LLM.
When: Any content generation task.

**PAT-ARCH-005: Boundary Validation**
Validate inputs at studio boundaries, trust internal data.
When: Receiving data from external sources or other studios.

## Orchestration Patterns

**PAT-ORCH-001: DAG-Based Execution**
Model workflow as directed acyclic graph. Execute parallel where no dependencies exist.
When: Multi-phase workflows with 3+ phases.

**PAT-ORCH-002: Gate-Before-Proceed**
Never start Phase N+1 until Phase N passes its quality gate.
When: Every phase transition.

**PAT-ORCH-003: Adversarial Spawning**
Review agents ALWAYS get fresh context. Never reuse generation context.
When: Any review, audit, or quality check.

**PAT-ORCH-004: Budget Checkpoints**
Check remaining budget before each phase. Halt if insufficient.
When: Every phase boundary.

**PAT-ORCH-005: Escalation Chain**
Agent → Department Head → CEO → Human. Never skip levels.
When: Any failure or ambiguity.

**PAT-ORCH-006: Parallel Fan-Out, Sequential Merge**
Spawn parallel agents for independent work, merge results sequentially.
When: Multiple independent analyses or reviews needed.

## Prompt Patterns

**PAT-PROM-001: Persona-First Prompting**
Establish agent identity before giving instructions.
When: Every agent activation.

**PAT-PROM-002: Constraint Hierarchy**
Order constraints as MUST → SHOULD → MAY. Resolve conflicts by priority.
When: Any complex instruction set.

**PAT-PROM-003: Output Anchoring**
Show the exact output format with a skeleton, then ask agent to fill it.
When: Structured output requirements.

**PAT-PROM-004: Negative Examples**
Show what NOT to produce alongside what to produce.
When: Quality-sensitive outputs where common mistakes exist.

## Quality Patterns

**PAT-QUAL-001: Forced-Finding Review**
Reviewer MUST find 3-10 issues minimum. Prevents rubber-stamp reviews.
When: Every adversarial review.

**PAT-QUAL-002: Multi-Dimensional Review**
Separate reviewers for security, performance, architecture.
When: Critical tasks (client-facing, auth, architecture, database, high-budget).

**PAT-QUAL-003: Regression Checking**
After any fix, verify the original issue AND check for new issues.
When: Bug fixes and issue remediation.

**PAT-QUAL-004: Acceptance Criteria Up Front**
Define what "done" looks like before starting work.
When: Every task assignment.

## Cost Patterns

**PAT-COST-001: Three-Tier Routing**
Template (free) → Rules+Light LLM (cheap) → Full LLM (expensive).
When: Every generation task.

**PAT-COST-002: Semantic Caching**
Cache LLM outputs by semantic key. Reuse for similar inputs.
When: Repeated similar queries.

**PAT-COST-003: Model Stepping**
Start with Haiku. Escalate to Sonnet only if quality insufficient. Opus only for critical.
When: Any uncertain task complexity.

**PAT-COST-004: Output Size Budgeting**
Estimate output size before generation. Choose model accordingly.
When: Cost-sensitive tasks.

## Team Patterns

**PAT-TEAM-001: Sequential Pipeline**
Agent A output → Agent B input → Agent C input. Linear chain.
When: Ordered workflows where each step depends on the previous.

**PAT-TEAM-002: Parallel Fan-Out**
Same input → multiple agents → merge outputs.
When: Independent analyses needed from different perspectives.

**PAT-TEAM-003: Adversarial Pair**
Generator + Reviewer. Reviewer never sees generation context.
When: Any quality-critical output.

**PAT-TEAM-004: Specialist Consultation**
Domain studio agent provides knowledge → operational studio uses it.
When: Cross-domain tasks requiring expertise.

**PAT-TEAM-005: Clone Army**
Same agent template, multiple instances, different inputs.
When: Batch processing of similar tasks.

**PAT-TEAM-006: Cross-Department Coordination**
Multiple studios contribute to a single deliverable.
When: Complex projects requiring diverse expertise.
