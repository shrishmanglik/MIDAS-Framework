# MIDAS Core — The Operating System

> "Route to the right studio, enforce the rules, track the budget. Every task has one optimal path — find it."

MIDAS Core is the orchestration layer that routes tasks to the right studios, enforces the three-tier cost rule, manages quality gates, and tracks knowledge accumulation. It is always loaded. It never generates end-user output directly — it coordinates the studios that do.

## Activation Triggers

Always loaded. This is the foundation layer for every MIDAS task.

## Methodology

### Phase 1: Task Classification

```
INPUT: Raw task description from human
PROCESS:
  1. Parse the task into: domain, action, complexity, audience
  2. Classify tier (1=template, 2=rules, 3=LLM)
  3. Identify required studios (max 3 simultaneous)
  4. Estimate token budget for the task
OUTPUT: Routing decision with studio assignments and tier classification
GATE: Human confirms routing makes sense (for complex multi-studio tasks)
```

### Phase 2: Studio Activation

```
INPUT: Routing decision from Phase 1
PROCESS:
  1. Load studio SKILL.md files (in priority order)
  2. Identify specific agents needed within each studio
  3. Load agent .md files (max 5 simultaneously)
  4. Assemble context: task brief + agent capabilities + relevant references
OUTPUT: Active studio context ready for execution
GATE: Context budget not exceeded (check token count)
```

### Phase 3: Execution Orchestration

```
INPUT: Active studio context + task brief
PROCESS:
  1. Primary studio agent begins execution
  2. Cross-studio handoffs coordinated through MIDAS Core
  3. Quality gates checked at each phase boundary
  4. Budget tracked per-operation
OUTPUT: Deliverable artifacts from each studio
GATE: All quality gates pass, budget within allocation
```

### Phase 4: Knowledge Capture

```
INPUT: Completed task + deliverables + any learnings
PROCESS:
  1. Extract genuine insights (not filler)
  2. Tag with appropriate category
  3. Append to knowledge/MIDAS-LEARNINGS.md
  4. Update relevant reference files if patterns discovered
OUTPUT: Updated knowledge base
GATE: Learnings are specific, actionable, and non-duplicate
```

## Team Roster

| Agent | Role | Expertise | When to Use | Spawn Type |
|-------|------|-----------|-------------|------------|
| Router | Task Classification | Domain detection, tier classification, studio matching | Every task (Phase 1) | Inline |
| Budget Tracker | Cost Management | Token counting, tier enforcement, spend reporting | Every task (continuous) | Inline |
| Gate Keeper | Quality Enforcement | Schema validation, completeness checks, standards | Every deliverable | Inline |
| Knowledge Curator | Learning Capture | Pattern extraction, tagging, deduplication | End of substantial tasks | Inline |

## Quality Gates

| Gate | Criterion | Measurement |
|------|-----------|-------------|
| Routing Accuracy | Task routed to correct studio(s) | Studio capabilities match task requirements |
| Tier Compliance | Lowest viable tier used | No Tier 3 when Tier 1/2 suffices |
| Budget Compliance | Token spend within allocation | Running total vs. budget ceiling |
| Context Efficiency | No unnecessary files loaded | Active file count <= limits |
| Knowledge Quality | Learnings are novel and actionable | No duplicates, no filler, tagged correctly |

## Templates Available

| Template | File | When to Use |
|----------|------|-------------|
| Three-Tier Rule | `references/three-tier-rule.md` | Classifying any task's execution tier |
| Quality Gates | `references/quality-gates.md` | Validating any deliverable |
| Cost Optimization | `references/cost-optimization.md` | Planning token-efficient execution |
| Error Recovery | `references/error-recovery.md` | Handling failures at any stage |
| Knowledge Accumulation | `references/knowledge-accumulation.md` | Capturing learnings post-task |
| State Persistence | `references/state-persistence.md` | Managing long-running multi-session tasks |
| Budget Management | `references/budget-management.md` | Tracking and reporting costs |

## References Available

| Reference | File | When to Load |
|-----------|------|--------------|
| Three-Tier Rule | `references/three-tier-rule.md` | When classifying task tier |
| Quality Gates | `references/quality-gates.md` | When validating output |
| Cost Optimization | `references/cost-optimization.md` | When planning execution strategy |
| Error Recovery | `references/error-recovery.md` | When a failure occurs |
| Knowledge Accumulation | `references/knowledge-accumulation.md` | After completing substantial work |
| State Persistence | `references/state-persistence.md` | For multi-session tasks |
| Budget Management | `references/budget-management.md` | When tracking spend |

## Integration Points

| Direction | Studio | What Flows |
|-----------|--------|-----------|
| Provides to | ALL studios | Task routing, tier classification, budget allocation |
| Receives from | ALL studios | Deliverables, cost reports, quality gate results |
| Provides to | Human | Status updates, budget reports, routing decisions |
| Receives from | Human | Task descriptions, approvals, overrides |

## Anti-Patterns

| Anti-Pattern | Detection | Prevention |
|-------------|-----------|------------|
| Tier Inflation | Using Tier 3 for template-eligible tasks | Always check templates FIRST before escalating |
| Context Bloat | Loading 4+ studios or 6+ agents | Enforce hard limits, release unused contexts |
| Gold Plating | Output exceeds requirements | Match output to brief, nothing more |
| Review Theater | Generic "looks good" reviews | Require specific findings with locations |
| Assumption Cascade | Building on unverified assumptions | Tag and verify every assumption before proceeding |
| Knowledge Filler | Recording obvious or duplicate learnings | Check existing learnings before appending |
