# Team Patterns

6 patterns for organizing agent collaboration within and across studios.

## Pattern 1: Sequential Pipeline
```
Agent A → Agent B → Agent C → Output
```
**When to use:** Ordered workflows where each step depends on the previous.
**Example:** Requirements (PM) → Architecture (Architect) → Code (Developer) → Tests (QA)
**Coordination:** Each agent's output is the next agent's input. Quality gate between each.
**Risk:** Bottleneck at any single agent blocks the entire pipeline.
**Mitigation:** Parallelize non-dependent branches where possible.

## Pattern 2: Parallel Fan-Out
```
         ┌→ Agent A ─┐
Input ──→├→ Agent B ─┤→ Merge → Output
         └→ Agent C ─┘
```
**When to use:** Independent analyses or work items from the same input.
**Example:** Three concurrent reviewers (Security, Performance, Architecture).
**Coordination:** Same input broadcast to all. Outputs merged by orchestrator.
**Risk:** Conflicting recommendations from different agents.
**Mitigation:** Orchestrator resolves conflicts using priority ranking.

## Pattern 3: Adversarial Pair
```
Generator Agent → Artifact → Review Agent (fresh context) → Findings → Fix/Accept
```
**When to use:** Any quality-critical output.
**Example:** Backend Developer writes code → QA Engineer reviews it.
**Coordination:** Reviewer receives ONLY artifact + criteria. Never generation context.
**Risk:** Review theater (rubber-stamp approval).
**Mitigation:** Forced-finding meta-prompt (3-10 findings mandatory).

## Pattern 4: Clone Army
```
         ┌→ Agent Instance 1 (Input A) → Output A ─┐
Template ├→ Agent Instance 2 (Input B) → Output B ─┤→ Collect
         └→ Agent Instance 3 (Input C) → Output C ─┘
```
**When to use:** Same task type applied to multiple different inputs.
**Example:** Generate CRUD endpoints for 5 different entities using same template.
**Coordination:** Same agent persona, different inputs. Outputs collected in batch.
**Risk:** Inconsistency between instances.
**Mitigation:** Same template + shared context ensures consistency.

## Pattern 5: Specialist Consultation
```
Operational Agent ──request──→ Domain Specialist Agent
                  ←──advice──┘
Operational Agent continues with enriched context
```
**When to use:** Operational agent needs domain expertise it doesn't have.
**Example:** Dev agent needs HIPAA compliance rules from Healthcare specialist.
**Coordination:** Request-response pattern. Specialist provides knowledge, not implementation.
**Risk:** Over-reliance on specialist (bottleneck).
**Mitigation:** Cache specialist responses. Build domain knowledge into references.

## Pattern 6: Cross-Department Coordination
```
Studio A writes artifacts → _shared/ directory
Studio B reads artifacts from _shared/
Studio C reads artifacts from _shared/
CEO orchestrator coordinates sequencing
```
**When to use:** Complex projects requiring multiple studio contributions.
**Example:** Building a financial app: finance-studio (domain) + dev-studio (code) + legal-studio (compliance).
**Coordination:** Each studio writes to its own namespace. Reads from others. Never modifies others' output.
**Risk:** Stale data (Studio B reads outdated artifact from Studio A).
**Mitigation:** Version artifacts. CEO coordinates refresh when upstream changes.

## Pattern Selection Guide

| Scenario | Pattern | Studios Involved |
|----------|---------|-----------------|
| Single-studio build workflow | Sequential Pipeline | 1 studio |
| Multi-reviewer quality check | Parallel Fan-Out | 1 studio (review agents) |
| Code generation + review | Adversarial Pair | 1 studio |
| Batch content creation | Clone Army | 1 studio |
| Dev needs domain expertise | Specialist Consultation | 2 studios |
| Full product build | Cross-Department | 3+ studios |
