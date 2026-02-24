# MIDAS Pattern Library

Proven patterns that consistently produce good outcomes across MIDAS projects. Each pattern includes when to use it, the approach, and expected impact.

---

## 1. Template-First Generation
**When:** Any code, config, or content that follows a repeatable pattern.
**Approach:** Check for existing templates before engaging LLM. Generate from template, then customize only the project-specific parts.
**Impact:** 60%+ cost reduction. Consistent output quality.

## 2. Artifact-Based Communication
**When:** Any handoff between agents or phases.
**Approach:** Produce a complete file with a handoff context header. The receiving agent reads only the artifact, never conversational context.
**Impact:** Zero context loss. Agents are interchangeable. Debugging is traceable.

## 3. Progressive Quality Gates
**When:** After any artifact generation, before handoff.
**Approach:** Run cheapest gates first (schema, lint). Only run expensive gates (AI review) if cheap ones pass. Match gate depth to risk level.
**Impact:** Catches 80% of defects at $0.00 cost. Expensive reviews focus on real issues.

## 4. Scope Fencing via Forbidden Actions
**When:** Defining any agent role.
**Approach:** Explicitly list what the agent CANNOT do, in addition to what it can do. PM cannot write code. Backend Dev cannot modify models.
**Impact:** Prevents scope creep. Clear ownership. Easier debugging of bad output.

## 5. Structured Requirements Format
**When:** Project initialization (Phase 1).
**Approach:** JSON schema with mandatory fields: user stories, acceptance criteria, data entities, priority classification. Machine-parseable.
**Impact:** Downstream agents can programmatically extract what they need. No ambiguity.

## 6. OpenAPI-First API Design
**When:** Architecture phase (Phase 2).
**Approach:** Architect produces OpenAPI 3.1 spec before any code. Backend and frontend both work from this contract.
**Impact:** Backend and frontend can work in parallel. Contract prevents integration surprises.

## 7. Model Cascading
**When:** Any LLM task.
**Approach:** Start with cheapest model (Haiku). Escalate to Sonnet only if quality is insufficient. Reserve Opus for architecture and critical decisions.
**Impact:** 50-70% cost reduction vs. always using Sonnet.

## 8. Adversarial Code Review
**When:** After code implementation (Phase 4).
**Approach:** QA agent adopts adversarial posture: "Find 3-10 specific, actionable problems." Not "looks good" — find real issues.
**Impact:** Catches security flaws, edge cases, and architecture drift that automated tools miss.

## 9. Phase-Gated Execution
**When:** Multi-phase projects.
**Approach:** Complete Phase N, validate, present to human, get approval, then start Phase N+1. Never run phases in parallel unless explicitly independent.
**Impact:** Defects caught early. Budget controlled. Human stays in the loop.

## 10. Knowledge-First Research
**When:** Starting any task in a domain with prior projects.
**Approach:** Check `knowledge/[TAG]/` before doing anything. Prior learnings may already answer the question or warn of pitfalls.
**Impact:** Avoids repeating failures. Compounds learning across projects.

## 11. Complexity-Adaptive Behavior
**When:** Scoping a new project.
**Approach:** Classify project size (small/medium/large). Adjust pipeline: skip unnecessary phases for small projects, add parallel review for large ones.
**Impact:** Small projects ship faster. Large projects get appropriate rigor.

## 12. File Ownership Matrix
**When:** Build phase with multiple agents.
**Approach:** Each file/directory has exactly one owning agent who can write to it. Other agents can read but not modify.
**Impact:** No conflicting edits. Clear accountability. Easy to trace bugs to source agent.

## 13. Health Check Pattern
**When:** Deployment phase.
**Approach:** Every service exposes a `/health` endpoint. Docker compose uses health checks. CI verifies health after deployment.
**Impact:** Immediate feedback on deployment success. Automatic restart on failure.

## 14. Decision Documentation
**When:** Any significant technical or strategic decision.
**Approach:** Document using the 6-step framework: Know/Assume/Contrarian/Pre-mortem/10x/Reversibility.
**Impact:** Decisions are traceable. Assumptions are explicit. Reversibility is assessed.

## 15. Failure-First Logging
**When:** After any failed operation or unexpected behavior.
**Approach:** Log with FAIL tag immediately. Include root cause, what was tried, what fixed it.
**Impact:** FAIL entries are the most valuable knowledge. They prevent repeat failures.
