# User Flow Template

Use this template to document complete user flows. Every flow must include the happy path, error paths, and edge cases.

---

## Flow: [Flow Name]

### Meta

| Field | Value |
|-------|-------|
| **Flow Name** | [Descriptive name] |
| **Actor** | [Which persona performs this flow] |
| **Goal** | [What the user is trying to accomplish] |
| **Entry Point** | [Where the user starts — URL, button, notification] |
| **Success Criteria** | [How we know the flow succeeded] |
| **Estimated Duration** | [How long this flow takes] |

---

### Prerequisites

- [ ] [Prerequisite 1 — e.g., user is authenticated]
- [ ] [Prerequisite 2 — e.g., user has billing set up]
- [ ] [Prerequisite 3 — e.g., data is available]

---

### Happy Path

```
[Start: Entry Point]
    |
    v
[Step 1: Screen/Action Name]
    | User sees: [what's displayed]
    | User does: [what action they take]
    |
    v
[Step 2: Screen/Action Name]
    | User sees: [what's displayed]
    | User does: [what action they take]
    |
    v
[Decision: Condition?]
   / \
  Y   N
  |   |
  v   v
[Step 3A] [Step 3B]
    |       |
    v       v
[Step 4: Merge point]
    |
    v
[Success: Outcome]
    | User sees: [success confirmation]
    | System does: [backend actions taken]
```

---

### Step Details

#### Step 1: [Name]

| Aspect | Detail |
|--------|--------|
| **Screen** | [Route or screen name] |
| **User Sees** | [Visible elements, data, copy] |
| **User Action** | [Click, type, select, scroll] |
| **System Response** | [Loading state, validation, navigation] |
| **Transition** | [How we get to the next step — animation, redirect, inline update] |

#### Step 2: [Name]

| Aspect | Detail |
|--------|--------|
| **Screen** | [Route or screen name] |
| **User Sees** | [Visible elements, data, copy] |
| **User Action** | [Click, type, select, scroll] |
| **System Response** | [Loading state, validation, navigation] |
| **Transition** | [How we get to the next step] |

---

### Error Paths

#### Error: [Error Condition 1]

```
[Trigger point in happy path]
    |
    v
[Error occurs: describe condition]
    |
    v
[Error UI: what user sees]
    | Message: "[exact error message]"
    | Recovery: [what the user can do]
    |
    v
[Recovery action]
    |
    v
[Rejoin happy path at Step X]
```

#### Error: [Error Condition 2]

```
[Trigger point]
    |
    v
[Error occurs: describe condition]
    |
    v
[Error UI: what user sees]
    | Message: "[exact error message]"
    | Recovery: [what the user can do]
```

---

### Edge Cases

| Edge Case | Behavior | User Experience |
|-----------|----------|-----------------|
| [Case 1: e.g., slow network] | [System behavior] | [What user sees] |
| [Case 2: e.g., empty state] | [System behavior] | [What user sees] |
| [Case 3: e.g., concurrent edit] | [System behavior] | [What user sees] |
| [Case 4: e.g., session timeout] | [System behavior] | [What user sees] |

---

### Emotional Journey

| Step | User Emotion | Confidence | Design Implication |
|------|-------------|------------|-------------------|
| Step 1 | [e.g., curious] | [low/med/high] | [e.g., clear value prop needed] |
| Step 2 | [e.g., focused] | [low/med/high] | [e.g., minimize distractions] |
| Step 3 | [e.g., anxious] | [low/med/high] | [e.g., show progress indicator] |
| Success | [e.g., satisfied] | [high] | [e.g., celebration moment] |

---

### Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Completion rate | > [X]% | [How to measure] |
| Time to complete | < [X] seconds | [How to measure] |
| Error rate | < [X]% | [How to measure] |
| Drop-off points | Identify top 3 | [How to measure] |

---

### Screen Inventory

| Step | Screen | New or Existing | Component Dependencies |
|------|--------|-----------------|----------------------|
| 1 | [screen name] | [new/existing] | [components used] |
| 2 | [screen name] | [new/existing] | [components used] |
| 3 | [screen name] | [new/existing] | [components used] |

---

### Notes

- [Any additional context, assumptions, or open questions]
- [Dependencies on other teams or systems]
- [Technical constraints that affect the flow]
