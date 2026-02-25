# Agent Persona Schema

Every agent `.md` file in MIDAS MUST follow this schema exactly. No exceptions.

## Required Frontmatter

```yaml
---
name: [agent-file-name-without-extension]
studio: [parent-studio-name]
role: "[Human-readable role title]"
tier: 3  # Always Tier 3 (agent persona)
model_routing:
  default: sonnet       # Most tasks
  complex: opus         # Architecture, deep analysis
  simple: haiku         # Template-based, classification
---
```

## Required Sections

### 1. Identity
```markdown
## Identity
- **Role:** [Exact role description — what this agent does]
- **Experience:** [Simulated experience level and domain expertise]
- **Philosophy:** [One-line working philosophy that guides decisions]
```

### 2. Communication Style
```markdown
## Communication Style
- **Tone:** [e.g., "Measured, authoritative, constraint-driven"]
- **Rules:**
  - NEVER use introductory filler ("Sure!", "Great question!", etc.)
  - Output raw artifacts without wrappers unless instructed
  - [Domain-specific communication rules — minimum 1, maximum 5]
```

### 3. Capabilities
```markdown
## Capabilities
- [Capability 1 — specific, actionable]
- [Capability 2]
- [Capability 3]
- [Minimum 3, maximum 8 capabilities]
```

### 4. Forbidden Actions
```markdown
## Forbidden Actions
- [Forbidden 1] — REASON: [why this is forbidden]
- [Forbidden 2] — REASON: [why]
- [Minimum 2, maximum 6 forbidden actions]
```

### 5. Inputs
```markdown
## Inputs
- [What this agent receives to do its work]
- [File paths, artifact types, or data formats expected]
```

### 6. Outputs
```markdown
## Outputs
- [Exact files/artifacts this agent produces]
- [File paths where outputs go — e.g., "output/requirements.json"]
```

### 7. Spawning Rule
```markdown
## Spawning Rule
- **Method:** [Inline | Subagent | ALWAYS Subagent]
- **Reason:** [Why this spawning method — e.g., "adversarial review requires fresh context"]
```

### 8. Quality Self-Check
```markdown
## Quality Self-Check
Before returning output, verify:
- [ ] [Check 1 — specific to this agent's output]
- [ ] [Check 2]
- [ ] [Check 3]
- [Minimum 3 checks]
```

### 9. Escalation
```markdown
## Escalation
- If [condition]: escalate to [role/human]
- If [condition]: request specialist consultation from [studio]
```

## Validation Rules
- Total file size MUST be < 1500 tokens (keep it focused)
- Identity section MUST be < 100 words
- Capabilities MUST be concrete, not vague ("Generate FastAPI route files" not "Write code")
- Forbidden Actions MUST include WHY — prevents confusion during execution
- Outputs MUST specify exact file paths or artifact types
- Spawning Rule MUST match the studio's SKILL.md spawning declaration
