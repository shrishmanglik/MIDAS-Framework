# Subagent Spawning Rules

## Decision Matrix

| Condition | Spawning Method | Reason |
|-----------|----------------|--------|
| Output < 200 lines | Inline | Small enough for main context |
| Output ≥ 200 lines | Subagent | Protect main context window |
| Adversarial/review role | ALWAYS Subagent | Fresh context is non-negotiable |
| Parallel execution needed | ALWAYS Subagent | Main thread can't parallelize |
| Creative/brainstorming | Subagent | Focus improves creative quality |
| Template-based output | Inline | Deterministic, no benefit from isolation |
| Cross-studio data needed | Subagent | Contains context from multiple sources |
| Classification/routing | Inline | Fast, small output |
| Long-form writing (>500 words) | Subagent | Focused context improves coherence |
| Quick advisory response | Inline | Conversational, short output |

## Hard Limits
- Maximum 4 concurrent subagents
- Each subagent gets a budget allocation from parent
- Subagent MUST complete or timeout within budget
- Timeout: 5 minutes for standard, 10 minutes for complex

## Handoff Artifact Requirements
Every subagent spawn MUST include a handoff artifact per schemas/handoff-artifact-schema.md:
- Task description (self-contained)
- Acceptance criteria (checkable)
- Input artifacts (inline or file paths)
- Budget allocation
- Expected output format and location

## Agent-Level Declarations
Each agent .md file declares its spawning rule. The studio SKILL.md consolidates these into three lists:
1. **ALWAYS subagent** — adversarial, review, compliance agents
2. **ALWAYS inline** — deterministic, template-based, classification agents
3. **Context-dependent** — spawning depends on task size/complexity

## Context Isolation Rules for Adversarial Agents
When spawning an adversarial/review subagent:
- DO include: the artifact being reviewed, acceptance criteria
- DO NOT include: the prompt that generated the artifact
- DO NOT include: the generating agent's reasoning or context
- DO NOT include: the human's original request (unless it IS the acceptance criteria)
- REASON: review bias is the #1 quality anti-pattern (AP-ORCH-004)

## Subagent Output Collection
1. Subagent writes output to specified location
2. Parent agent validates output against acceptance criteria
3. If output passes quality gate → accept and continue
4. If output fails → ONE retry with enhanced context → escalate

## Parallel Execution Rules
When running N subagents in parallel:
- Each gets independent budget allocation
- Each writes to separate output locations (no conflicts)
- Parent waits for ALL to complete before merging
- If any fails, others continue (don't cascade failures)
- Merge happens sequentially after all complete
