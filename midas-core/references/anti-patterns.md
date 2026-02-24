# MIDAS Anti-Pattern Reference

Condensed catalog of failure modes observed across MIDAS projects. Each anti-pattern includes the symptom, root cause, and corrective action.

---

## 1. LLM-for-Everything Syndrome
**Symptom:** Every task routed to Tier 3 (LLM reasoning). Costs balloon.
**Root Cause:** Skipping the three-tier check. Defaulting to "ask the AI."
**Fix:** Mandatory Tier 1/2 check before any generation. Templates first.

## 2. Context Evaporation
**Symptom:** Receiving agent produces wrong output because it lacks context.
**Root Cause:** Conversational handoffs instead of artifact-based handoffs.
**Fix:** Self-contained artifacts. Handoff context section. Zero assumptions.

## 3. Gate Skipping
**Symptom:** Defective output reaches the next phase and multiplies costs.
**Root Cause:** Rushing past quality gates or disabling them "temporarily."
**Fix:** Gates are non-negotiable. Fix the output, never skip the gate.

## 4. Scope Creep Disguised as "Polish"
**Symptom:** Agent adds unrequested features, refactors adjacent code.
**Root Cause:** Agent instructions don't enforce scope boundaries.
**Fix:** Explicit "forbidden actions" in every agent definition.

## 5. The Infinite Retry Loop
**Symptom:** Same error retried 5+ times with no change in approach.
**Root Cause:** No escalation protocol. Agent keeps trying the same thing.
**Fix:** Max 2 retries, then escalate (different approach or human).

## 6. Monolith Agent
**Symptom:** One agent tries to do PM + architecture + coding + testing.
**Root Cause:** No role separation. Single prompt doing everything.
**Fix:** Specialized agents with clear ownership boundaries.

## 7. Template Rot
**Symptom:** Templates generate outdated patterns (wrong versions, deprecated APIs).
**Root Cause:** Templates not versioned or updated when tech stack changes.
**Fix:** Pin versions in templates. Review templates on tech stack updates.

## 8. Silent Budget Overrun
**Symptom:** Project costs 3x budget, no one noticed until the end.
**Root Cause:** No per-phase budget tracking or halt mechanism.
**Fix:** Budget checks at every phase transition. HALT on exceeded.

## 9. Test Theater
**Symptom:** 90% coverage but tests don't catch real bugs.
**Root Cause:** Testing happy paths only. No edge cases, no adversarial review.
**Fix:** QA agent must find 3-10 specific problems. Test sad paths first.

## 10. Premature Optimization
**Symptom:** Caching, sharding, microservices in an MVP with 10 users.
**Root Cause:** Architecture designed for scale that may never come.
**Fix:** Build for current load. Document scaling path. Don't implement it yet.

## 11. Copy-Paste Architecture
**Symptom:** Architecture doc is a generic template with project name swapped in.
**Root Cause:** Architect didn't read the requirements carefully.
**Fix:** Every component must trace to a specific P0 requirement.

## 12. Orphan Files
**Symptom:** Files exist that no agent owns and no code references.
**Root Cause:** File created during experimentation, never cleaned up.
**Fix:** File ownership matrix. Every file has exactly one owning agent.

## 13. Over-Specified Requirements
**Symptom:** PM dictates database schema and API routes in requirements.
**Root Cause:** PM crossing into Architect/DB Engineer territory.
**Fix:** PM produces WHAT (user stories). Architect produces HOW (tech design).

## 14. Under-Specified Handoffs
**Symptom:** "Build the API" handoff with no spec, schema, or endpoint list.
**Root Cause:** Handoff artifact missing critical information.
**Fix:** Context completeness test: Could a stranger complete this with no questions?

## 15. The God Config
**Symptom:** Single .env file with 50+ variables, no documentation.
**Root Cause:** Every service dumps its config into one file.
**Fix:** .env.example with comments. Group by service. Document every variable.
