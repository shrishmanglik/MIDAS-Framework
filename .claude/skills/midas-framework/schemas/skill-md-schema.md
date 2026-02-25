# Studio SKILL.md Schema

Every studio SKILL.md in MIDAS MUST follow this schema exactly.

## Required Frontmatter

```yaml
---
name: [studio-name]
description: "[One-paragraph description for activation matching — Claude uses this to decide when to load the studio]"
activation: "[Trigger phrases and task types that should load this studio]"
tier: 2  # Always Tier 2 (department head)
dependencies: [list of studio names this one requires]
---
```

## Required Sections

### 1. Header + Mission
```markdown
# [Studio Name] — [VP Title]

## Mission
[One sentence. Why this studio exists. What it delivers.]
```

### 2. Team Roster
```markdown
## Team Roster
| Agent | File | Spawning | Primary Output |
|-------|------|----------|----------------|
| [Display Name] | agents/[filename].md | Inline/Subagent/ALWAYS Subagent | [What they produce] |
```

### 3. Pipeline
```markdown
## Pipeline
[Phase diagram showing: Input → Phase 1 → Gate → Phase 2 → Gate → ... → Output]
[Each phase lists: responsible agent, inputs, outputs, quality gate]
```

### 4. Spawning Rules
```markdown
## Spawning Rules
- **ALWAYS subagent:** [list adversarial/review agents — non-negotiable]
- **ALWAYS inline:** [list short/deterministic agents]
- **Context-dependent:** [list agents with conditional spawning + conditions]
```

### 5. Budget
```markdown
## Budget
| Phase | Estimated Cost | Model |
|-------|---------------|-------|
| [Phase Name] | $[amount] | [haiku/sonnet/opus] |
| **Total** | **$[total]** | — |
```

### 6. Quality Gates
```markdown
## Quality Gates
[Studio-specific gates beyond the universal 9 gates]
- [Gate name]: [What it checks, pass/fail criteria]
```

### 7. Integration Points
```markdown
## Integration Points
- When loaded WITH [other-studio]: [how they interact, who provides what]
- Provides TO [other-studio]: [what artifacts/knowledge this studio shares]
- Receives FROM [other-studio]: [what this studio needs from others]
```

### 8. Templates Available
```markdown
## Templates Available
| Template | File | When to Use | Tier |
|----------|------|-------------|------|
| [Name] | templates/[file].md | [Trigger condition] | 1/2/3 |
```

## Validation Rules
- SKILL.md MUST be < 2500 tokens (keep it scannable)
- Mission MUST be one sentence
- Every agent MUST appear in Team Roster
- Spawning rules MUST match individual agent declarations
- Budget MUST sum correctly
- At least one adversarial/review agent per studio (or documented cross-studio reviewer)
