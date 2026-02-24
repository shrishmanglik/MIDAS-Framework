# MIDAS Decision Framework

A 6-step protocol for making strategic and technical decisions with rigor.

---

## The 6 Steps

### Step 1: What Do We KNOW?
- Facts backed by evidence: data, documentation, test results, direct observation
- Not opinions. Not "everyone knows." Not "best practices say."
- Cite the source: "PostgreSQL docs confirm..." or "Our load test showed..."

**Template:**
```
KNOWN:
- [Fact 1] (Source: [evidence])
- [Fact 2] (Source: [evidence])
```

### Step 2: What Do We ASSUME?
- Beliefs that are reasonable but unverified
- Things we're treating as true without direct evidence
- CRITICAL: Making assumptions explicit prevents them from silently becoming "facts"

**Template:**
```
ASSUMPTIONS:
- [Assumption 1] (Could verify by: [how])
- [Assumption 2] (Risk if wrong: [consequence])
```

### Step 3: What's the Contrarian View?
- Steel-man the opposing position. Don't strawman it.
- "A smart person who disagrees would say..."
- Forces you to confront weaknesses in your position

**Template:**
```
CONTRARIAN VIEW:
"[The strongest argument against our approach is...]"
Response: [Why we still choose our approach despite this]
```

### Step 4: Pre-Mortem — How Does This Fail?
- Imagine it's 6 months later and this decision was a disaster
- What went wrong? What did we miss?
- Identifies risks before they materialize

**Template:**
```
PRE-MORTEM:
- Failure mode 1: [What goes wrong] → Mitigation: [How we prevent it]
- Failure mode 2: [What goes wrong] → Mitigation: [How we prevent it]
```

### Step 5: What's the 10x Version?
- If we had 10x the resources/time, what would we do differently?
- Reveals whether we're making a pragmatic trade-off or just being lazy
- Sometimes the 10x version is actually feasible and we're artificially constraining

**Template:**
```
10x VERSION:
[What the ideal solution looks like with no constraints]
PRAGMATIC VERSION:
[What we're actually doing and why it's sufficient for now]
```

### Step 6: Is This Reversible?
- **Type 1 Decision (irreversible):** Choose carefully. Get more input. Sleep on it.
  - Examples: Public API contract, database schema in production, pricing model
- **Type 2 Decision (reversible):** Decide fast. You can always change it.
  - Examples: Internal API shape, library choice, folder structure, naming conventions

**Template:**
```
REVERSIBILITY: Type [1/2]
Reason: [Why this is/isn't reversible]
If Type 1: [Additional validation steps needed]
If Type 2: [Just decide and move forward]
```

---

## When to Use This Framework

| Decision Type | Steps Required | Time Investment |
|---|---|---|
| Tech stack choice | All 6 | 15-30 minutes |
| Architecture pattern | Steps 1-4, 6 | 10-20 minutes |
| Feature scope (P0 vs P1) | Steps 1-2, 4, 6 | 5-10 minutes |
| Library selection | Steps 1-2, 6 | 5 minutes |
| Naming convention | Step 6 only | 1 minute (Type 2, just decide) |

## Anti-Patterns in Decision Making

1. **Analysis Paralysis:** Using all 6 steps for a Type 2 decision. Just decide.
2. **Assumption Blindness:** Treating assumptions as facts. Always list them separately.
3. **Contrarian Dismissal:** "Nobody would disagree." Someone always would. Find them.
4. **Optimism Bias:** Skipping the pre-mortem. "It'll be fine." It won't.
5. **Scope Creep via 10x:** The 10x version is for perspective, not for implementation.
6. **Consensus Seeking:** Not every decision needs agreement. Owner decides after hearing input.

## Quick Decision Template

For time-pressed decisions, use this compressed format:

```
Decision: [What we're deciding]
Known: [Key facts]
Assumed: [Key assumptions]
Risk: [Top failure mode]
Reversible: [Yes/No]
Decision: [What we chose and why]
```
