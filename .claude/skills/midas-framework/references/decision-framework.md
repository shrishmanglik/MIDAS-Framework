# Decision Framework

Structured approach for making decisions under uncertainty. Use for architecture choices, technology selection, strategic direction.

## The 5-Lens Decision Template

### Lens 1: Know
**What do we KNOW for certain?**
- Verified facts, measurements, constraints
- Documented requirements, firm deadlines
- Technical limitations, API capabilities
- Budget bounds, team capacity

### Lens 2: Assume
**What are we ASSUMING to be true?**
- List every assumption explicitly
- Rate confidence: HIGH / MEDIUM / LOW
- Identify which assumptions, if wrong, would change the decision
- Plan: how to validate critical assumptions before committing

### Lens 3: Contrarian
**What is the STRONGEST argument AGAINST our preferred choice?**
- Steel-man the opposing position
- Identify risks we might be minimizing
- Consider second-order consequences
- Ask: "What would a smart critic say?"

### Lens 4: Pre-Mortem
**Imagine this decision FAILED. Why did it fail?**
- Project forward 6 months: what went wrong?
- Identify top 3 failure modes
- For each: likelihood (H/M/L) × impact (H/M/L)
- Mitigation plan for HIGH×HIGH risks

### Lens 5: 10x Test
**Would this decision still work at 10× scale?**
- 10× users, 10× data, 10× complexity
- What breaks first?
- Is the approach fundamentally scalable or does it require rearchitecting?
- If rearchitecting is needed, when is the right time?

## Decision Record Format

```markdown
## Decision: [Title]
**Date:** [YYYY-MM-DD]
**Decision maker:** [Studio/Agent]
**Status:** [proposed | accepted | superseded]

### Context
[Why is this decision needed? What problem does it solve?]

### Options Considered
1. [Option A] — [Pros] / [Cons]
2. [Option B] — [Pros] / [Cons]
3. [Option C] — [Pros] / [Cons]

### Decision
[Which option was chosen and WHY]

### Consequences
- [Positive consequence 1]
- [Positive consequence 2]
- [Risk/trade-off 1]
- [Risk/trade-off 2]

### Review trigger
[When should this decision be revisited? What would change it?]
```

## When to Use This Framework
- Technology selection (framework, database, hosting)
- Architecture decisions (monolith vs microservices, API design)
- Strategic direction (market entry, product scope)
- Any decision with >$1000 cost impact or >1 week time impact
- Any irreversible or hard-to-reverse decision

## Quick Decision (< 5 minutes)
For small decisions, use the abbreviated version:
1. What do we know?
2. What's the risk?
3. Is it reversible?
   - Yes → decide and move on
   - No → apply full framework
