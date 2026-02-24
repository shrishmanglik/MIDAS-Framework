---
name: agent-handoff
description: "Protocol for transferring work between agents/subagents. Use whenever one agent's output becomes another agent's input. Ensures no context is lost and receiving agents have everything they need."
---

# Agent Handoff Protocol

## Core Rule
Every handoff is artifact-based, never conversational. The artifact must be self-contained — the receiving agent knows NOTHING about prior context.

## Handoff Steps

1. **Produce the artifact.** Write output to the designated file path.
2. **Self-assess.** Run quality gates appropriate to the artifact type.
3. **Write the handoff brief.** A markdown section at the top of the artifact:

```
## Handoff Context
- **From:** [Agent role]
- **To:** [Next agent role]
- **What this is:** [One-line description]
- **What to do with it:** [Specific instructions for the receiving agent]
- **Acceptance criteria:** [How the receiving agent knows they're done]
- **Files to read:** [List of input files]
- **Files to write:** [List of expected output files]
```

4. **Signal completion.** The handoff is complete when the output file exists and passes its quality gates.

## Anti-Patterns

- **NEVER** say "as discussed earlier" — the next agent has no earlier context
- **NEVER** pass partial artifacts — everything must be complete
- **NEVER** assume the receiving agent knows the project — include all context
- **NEVER** hand off without running quality gates first
- **NEVER** use pronouns without antecedents ("it should handle this" — what is "it"? what is "this"?)

## Handoff Checklist

Before completing a handoff, verify:

- [ ] Output file exists at the designated path
- [ ] File passes quality gates (schema, lint, completeness)
- [ ] Handoff context section is present at the top
- [ ] All acceptance criteria are explicit and measurable
- [ ] No references to conversational context or prior messages
- [ ] Every technical term is defined or obvious from context
- [ ] File paths in "Files to read" all exist
- [ ] File paths in "Files to write" are specific, not vague

## Common Handoff Chains

| From | To | Artifact | Key Context to Include |
|---|---|---|---|
| PM | Architect | requirements.json | All P0/P1 features, acceptance criteria, data entities |
| Architect | DB Engineer | architecture.md | Entity relationships, data types, constraints, indexes |
| Architect | Backend Dev | architecture.md + openapi-stub.yaml | Full API spec, auth flow, error handling patterns |
| Architect | Frontend Dev | architecture.md + openapi-stub.yaml | API endpoints, auth flow, component hierarchy |
| Backend Dev | QA | app/ source code | Business logic assumptions, edge cases, known limitations |
| QA | DevOps | test results + app/ | Test requirements, environment variables, port mappings |

## Context Completeness Test

Ask: "If I gave this artifact to a competent developer who has never heard of this project, could they complete the next phase without asking any questions?"

If the answer is no, the handoff is incomplete.
