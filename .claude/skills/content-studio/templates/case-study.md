# Case Study Template

## Description
A fill-in-the-blank template for project and customer case studies. Follows the classic Situation > Challenge > Solution > Results narrative structure that builds credibility and demonstrates real impact.

## When to Use
- Showcasing a completed project with measurable results
- Building social proof for sales and marketing
- Creating content that demonstrates expertise through evidence
- When a prospect needs proof that your approach works

## Template Structure

```markdown
# {CASE_STUDY_TITLE — "How {ENTITY} achieved {RESULT} using {APPROACH}"}

**Industry:** {INDUSTRY}
**Challenge:** {ONE_LINE_CHALLENGE}
**Solution:** {ONE_LINE_SOLUTION}
**Key Result:** {HEADLINE_METRIC}
**Timeline:** {PROJECT_DURATION}

---

## The Situation

{COMPANY_CONTEXT — 2-3 sentences about who the client/project is, what they do, their scale}

{INITIAL_STATE — what was working, what their setup looked like before the engagement}

{STAKES — why this mattered to them, what was at risk}

---

## The Challenge

{PROBLEM_DESCRIPTION — 2-3 sentences clearly defining the core problem}

{PROBLEM_IMPACT — quantify the cost of the problem: money lost, time wasted, opportunities missed}

{ATTEMPTED_SOLUTIONS — what they tried before that didn't work, or why the obvious approach failed}

{ROOT_CAUSE — the underlying reason the problem persisted}

---

## The Approach

{METHODOLOGY_OVERVIEW — 1-2 sentences describing the overall approach}

### {PHASE_1_NAME}

{PHASE_1_DESCRIPTION — what was done in this phase, 2-4 sentences}

### {PHASE_2_NAME}

{PHASE_2_DESCRIPTION}

### {PHASE_3_NAME}

{PHASE_3_DESCRIPTION}

{KEY_DECISIONS — 1-2 pivotal decisions that made the difference, with reasoning}

---

## The Results

### Primary Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| {METRIC_1_NAME} | {BEFORE_1} | {AFTER_1} | {CHANGE_1} |
| {METRIC_2_NAME} | {BEFORE_2} | {AFTER_2} | {CHANGE_2} |
| {METRIC_3_NAME} | {BEFORE_3} | {AFTER_3} | {CHANGE_3} |

### Secondary Benefits

- {BENEFIT_1 — an additional positive outcome}
- {BENEFIT_2}
- {BENEFIT_3}

---

## Key Takeaways

1. **{TAKEAWAY_1_TITLE}** — {TAKEAWAY_1_DESCRIPTION}
2. **{TAKEAWAY_2_TITLE}** — {TAKEAWAY_2_DESCRIPTION}
3. **{TAKEAWAY_3_TITLE}** — {TAKEAWAY_3_DESCRIPTION}

---

## {QUOTE_SECTION — optional: testimonial or quote}

> "{TESTIMONIAL_QUOTE}"
> — {PERSON_NAME}, {PERSON_TITLE}, {COMPANY}

---

{CTA — invitation to discuss a similar challenge}
```

## Variable Definitions

| Variable | Description | Constraints |
|----------|-------------|-------------|
| `{CASE_STUDY_TITLE}` | Headline with entity + result | "How [X] achieved [Y] using [Z]" format |
| `{INDUSTRY}` | Client's industry | 1-3 words |
| `{ONE_LINE_CHALLENGE}` | Problem summary | 1 sentence |
| `{ONE_LINE_SOLUTION}` | Solution summary | 1 sentence |
| `{HEADLINE_METRIC}` | Most impressive result | 1 metric with before/after |
| `{PROJECT_DURATION}` | How long the project took | "X weeks/months" |
| `{COMPANY_CONTEXT}` | Who the client is | 2-3 sentences, enough to establish relevance |
| `{PROBLEM_DESCRIPTION}` | The core problem | 2-3 sentences, specific and relatable |
| `{PROBLEM_IMPACT}` | Cost of the problem | Quantified: dollars, time, percentage |
| `{PHASE_X_NAME}` | Approach phase names | 2-4 words each |
| `{METRIC_X_NAME}` | Results table metrics | Specific, measurable outcomes |
| `{TAKEAWAY_X_TITLE}` | Lesson titles | 3-6 words each |
| `{CTA}` | Next step for the reader | 1-2 sentences |

## Completed Example

```markdown
# How AstroAI Achieved 50x Cost Reduction Using Deterministic-First Architecture

**Industry:** AI SaaS / Astrology Technology
**Challenge:** Per-reading cost of $0.15 made scaling uneconomical beyond 1,000 daily users
**Solution:** Three-tier deterministic-first architecture minimizing AI API dependency
**Key Result:** Cost per reading reduced from $0.15 to $0.003 (50x improvement)
**Timeline:** 6 weeks (architecture redesign and implementation)

---

## The Situation

AstroAI is a Vedic astrology platform that generates detailed birth chart readings. Each reading requires 50,000+ individual calculations including planetary positions, house placements, and yoga (planetary combination) analysis.

The initial prototype used GPT-4 for the entire computation pipeline — receiving birth data, calculating positions, identifying patterns, and generating the narrative interpretation. At prototype scale with 50 daily users, API costs were manageable at roughly $7.50/day.

The product had strong early traction with a 40% week-over-week growth rate, meaning the $7.50/day would become $1,500/day within months. Without a fundamental architecture change, scaling would bankrupt the project.

---

## The Challenge

The core problem was simple but severe: every computation was routed through GPT-4, including mathematical calculations that don't require AI. Planetary position math, house system calculations, and yoga pattern matching are all deterministic operations — same input always produces the same output.

At a cost of $0.15 per reading, the unit economics broke at scale. A $9.99/month subscription with an average of 10 readings per month meant $1.50 in API costs per user per month — a 15% gross margin before any other costs.

The team had considered two alternatives: raising the subscription price (market research showed $9.99 was the ceiling for consumer astrology) and reducing reading quality (removing detailed sections to use fewer tokens). Neither addressed the root cause.

The root cause was architectural: the product treated AI as the computation layer rather than as one layer in a larger system. The architecture needed stratification.

---

## The Approach

The solution was a "deterministic-first" redesign: systematically moving every possible computation OUT of the AI layer and into cheaper, faster, and more reliable computation methods.

### Phase 1: Computation Audit (Week 1)

Every GPT-4 call was catalogued and categorized by what it actually did. The audit revealed that 95% of the computation was deterministic — it could be done with math, rules, or cached results. Only 5% required genuine AI generation.

### Phase 2: Deterministic Layer Build (Weeks 2-4)

Swiss Ephemeris (an astronomical calculation library) replaced GPT-4 for all planetary position mathematics. A custom rule engine was built to handle 200+ Vedic yoga pattern matches. Both systems produce identical results to GPT-4's calculations but at zero API cost.

### Phase 3: Cache Layer + AI Scoping (Weeks 5-6)

A Redis-based caching layer was implemented using feature hashing. Interpretation texts for common placements (e.g., "Sun in Aries in the 10th house") are generated once and cached permanently. The AI layer was scoped to handle ONLY the final personalized narrative — synthesizing pre-computed and cached data into a cohesive reading.

The pivotal decision was implementing feature-hash caching. The team initially assumed each reading was unique, but analysis showed that 85% of individual placement interpretations recur across users. Caching transformed these from $0.05 AI calls into $0.001 cache reads.

---

## The Results

### Primary Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Cost per reading | $0.15 | $0.003 | -98% (50x reduction) |
| Reading generation time | 8.2 seconds | 1.4 seconds | -83% (5.8x faster) |
| Gross margin per user | 15% | 97% | +82 percentage points |

### Secondary Benefits

- Reading consistency improved: deterministic calculations produce identical results every time, eliminating the variability in GPT-4's mathematical outputs
- Scaling capacity: the system now handles 100,000+ daily readings without proportional cost increase
- Competitive moat: the architecture is significantly harder to replicate than a GPT-4 wrapper, creating genuine technical differentiation

---

## Key Takeaways

1. **Audit before optimizing** — The computation audit in Week 1 was the highest-ROI activity. It revealed that 95% of API calls were unnecessary, directing all subsequent effort.
2. **Deterministic layers first, AI last** — Building the math and rule engines before touching the AI layer ensured the product worked without AI. This de-risked the entire architecture.
3. **Cache aggressively** — Most AI outputs are less unique than they appear. Feature-hash caching turned 20% of remaining AI calls into near-zero-cost cache reads.

---

> "We went from worrying about whether we could afford to grow to having unit economics that improve with scale. The architecture change didn't just save money — it changed the entire business model from 'hope margins hold' to 'margins get better with every user.'"
> — Shrish, Founder, MDS

---

Building an AI product with similar cost challenges? We offer free 30-minute architecture reviews for founders working through these exact decisions. Reach out at [contact method] to schedule.
```
