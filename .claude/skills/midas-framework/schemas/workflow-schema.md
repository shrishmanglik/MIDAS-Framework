# Workflow Schema

Every workflow `.md` file in MIDAS follows this phase/step/gate structure.

## Structure

```yaml
---
name: [workflow-name]
studio: [parent-studio]
description: "[What this workflow accomplishes end-to-end]"
estimated_cost: "$[total]"
estimated_phases: [number]
---
```

## Required Sections

### 1. Overview
```markdown
# [Workflow Name]

## Overview
[2-3 sentences describing the end-to-end flow]

## Trigger
[When this workflow is activated — task types, commands, conditions]

## Prerequisites
- [What must exist before this workflow runs]
```

### 2. Phase Definitions
Each phase follows this structure:

```markdown
## Phase [N]: [Phase Name]

### Agent
[agent-name] (Inline/Subagent)

### Inputs
- [Input 1 — file path or artifact type]
- [Input 2]

### Steps
1. [Step 1 — concrete action]
2. [Step 2]
3. [Step 3]

### Outputs
- [Output 1 — exact file path or artifact]

### Quality Gate
- [ ] [Gate check 1]
- [ ] [Gate check 2]
- **Pass criteria:** [What must be true to proceed to next phase]
- **Fail action:** [What happens on failure — retry/escalate/halt]

### Budget
- Model: [haiku/sonnet/opus]
- Estimated cost: $[amount]
```

### 3. DAG (Dependency Graph)
```markdown
## Execution Order
[Show which phases can run in parallel vs. must be sequential]

Phase 1 → Phase 2 → Phase 3
                  ↘ Phase 4 (parallel with 3)
Phase 3 + 4 → Phase 5 (merge)
```

### 4. Error Recovery
```markdown
## Error Recovery
- Phase [N] failure: [recovery action]
- Budget exceeded at Phase [N]: [action]
- Agent timeout: [action]
```

## Validation Rules
- Every phase MUST have explicit inputs and outputs
- Outputs of Phase N MUST match inputs of Phase N+1
- Every phase MUST have a quality gate
- Budget per phase MUST sum to workflow total
- At least one phase MUST include adversarial review
