# Handoff Artifact Schema

When spawning a subagent or handing work between agents, the handoff artifact MUST be self-contained. The receiving agent should need NOTHING beyond this artifact to complete its task.

## Required Structure

```yaml
---
handoff_id: "[unique-id — timestamp + agent + task]"
from_agent: "[sending agent name]"
to_agent: "[receiving agent name]"
studio: "[studio context]"
priority: [1-5, where 1 is highest]
budget_remaining: "$[amount]"
---
```

## Required Sections

### 1. Task Assignment
```markdown
## Task
[One-paragraph description of exactly what the receiving agent must do]

## Acceptance Criteria
- [ ] [Criterion 1 — specific, measurable]
- [ ] [Criterion 2]
- [ ] [Criterion 3]
- [Minimum 3 criteria]
```

### 2. Context (Self-Contained)
```markdown
## Context
[Everything the receiving agent needs to know — NO assumptions about shared context]

### Input Artifacts
- [File path or inline content for each input]

### Constraints
- [Budget limit for this task]
- [Model routing: which model to use]
- [Time/size constraints]

### Domain Knowledge
- [Relevant facts, rules, or patterns the agent needs]
- [Reference files to load if needed]
```

### 3. Output Specification
```markdown
## Expected Output
- **Format:** [exact format — JSON, markdown, code, etc.]
- **Location:** [where to write output — file path]
- **Size limit:** [max tokens/lines]
```

### 4. Adversarial Context (for review agents only)
```markdown
## Review Instructions
- You are reviewing work you did NOT create
- You MUST find 3-10 issues minimum
- Rate severity: CRITICAL / HIGH / MEDIUM / LOW
- You do NOT have access to the generation context — judge the artifact on its own merits
```

## Validation Rules
- Handoff MUST be self-contained — no references to "the previous conversation"
- Acceptance criteria MUST be checkable by the receiving agent
- Budget MUST be specified (even if generous)
- For adversarial handoffs: generation context MUST be excluded
