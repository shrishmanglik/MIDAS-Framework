# LinkedIn Carousel Template

## Description
A content template for LinkedIn carousel posts (PDF-style multi-slide posts). Carousels consistently outperform standard posts in engagement because they encourage dwell time and multiple interactions. This template provides the text content per slide — Design Studio creates the actual visual slides.

## When to Use
- Explaining a process, framework, or step-by-step method
- Sharing a list of tips, lessons, or insights in a visual format
- Presenting data comparisons or before/after scenarios
- When you want maximum dwell time and engagement on LinkedIn

## Template Structure (8-12 Slides)

```
SLIDE 1 — COVER (The Hook)
Title: {CAROUSEL_TITLE — bold, specific, curiosity-driving}
Subtitle: {SUBTITLE — clarifies the value, 5-8 words}
Visual: {VISUAL_DIRECTION — what the cover should look like}
Author: {AUTHOR_NAME} | {AUTHOR_TITLE}

SLIDE 2 — CONTEXT (Set the Stage)
Headline: {CONTEXT_HEADLINE — the problem or situation}
Body: {CONTEXT_BODY — 2-3 sentences max, establish why this matters}

SLIDE 3 — POINT 1
Headline: {POINT_1_HEADLINE}
Body: {POINT_1_BODY — 1-3 sentences, one clear idea}
Visual: {VISUAL_ELEMENT — icon, diagram, or illustration direction}

SLIDE 4 — POINT 2
Headline: {POINT_2_HEADLINE}
Body: {POINT_2_BODY}
Visual: {VISUAL_ELEMENT}

SLIDE 5 — POINT 3
Headline: {POINT_3_HEADLINE}
Body: {POINT_3_BODY}
Visual: {VISUAL_ELEMENT}

SLIDE 6 — POINT 4
Headline: {POINT_4_HEADLINE}
Body: {POINT_4_BODY}
Visual: {VISUAL_ELEMENT}

SLIDE 7 — POINT 5
Headline: {POINT_5_HEADLINE}
Body: {POINT_5_BODY}
Visual: {VISUAL_ELEMENT}

SLIDE 8 — KEY INSIGHT (The Aha Moment)
Headline: {KEY_INSIGHT — the single most important takeaway}
Body: {INSIGHT_BODY — 1-2 sentences that reframe everything above}

SLIDE 9 — CTA (Close)
Headline: {CTA_HEADLINE}
Body: {CTA_BODY — what to do next}
Author: {AUTHOR_NAME}
Handle: {LINKEDIN_HANDLE}
Action: {SPECIFIC_ASK — follow, DM, comment, or link}
```

## Variable Definitions

| Variable | Description | Constraints |
|----------|-------------|-------------|
| `{CAROUSEL_TITLE}` | Cover slide headline | Max 8 words, must stop the scroll |
| `{SUBTITLE}` | Cover supporting text | 5-8 words |
| `{CONTEXT_HEADLINE}` | Slide 2 headline | Max 6 words |
| `{CONTEXT_BODY}` | Slide 2 body text | 2-3 sentences, max 50 words |
| `{POINT_X_HEADLINE}` | Point slide headlines | Max 6 words each |
| `{POINT_X_BODY}` | Point slide body text | 1-3 sentences, max 40 words each |
| `{VISUAL_ELEMENT}` | Direction for Design Studio | Brief description of icon/diagram |
| `{KEY_INSIGHT}` | The "aha" headline | Max 10 words |
| `{INSIGHT_BODY}` | Supporting text for the insight | 1-2 sentences, max 30 words |
| `{CTA_HEADLINE}` | Final slide headline | Max 6 words |
| `{CTA_BODY}` | CTA description | 1-2 sentences |
| `{SPECIFIC_ASK}` | The ONE action | 1 sentence |

## Rules
- ONE idea per slide. If a slide has two ideas, split it into two slides.
- Max 40 words of body text per slide. Carousels are visual — less text, more impact.
- Every slide must make sense independently. People swipe at different speeds and skip slides.
- The cover slide decides everything. If the cover doesn't hook, nobody swipes.
- The CTA slide should remind people who created this (builds follows).

## Completed Example

**Caption (accompanying the carousel in the post text):**
I reduced our AI product's cost by 50x using a 3-tier architecture. Here's the exact framework (swipe through):

**SLIDE 1 — COVER**
Title: The 3-Tier Architecture That Cuts AI Costs by 50x
Subtitle: A framework for building cheaper, faster AI products
Visual: Dark background, gold accent lines, clean modern typography
Author: Shrish | Founder, MDS

**SLIDE 2 — CONTEXT**
Headline: The Wrapper Problem
Body: Most AI products send everything to GPT-4. At 10K users, that's $1,500/day in API costs. Your margins disappear.

**SLIDE 3 — POINT 1**
Headline: Tier 1: Deterministic ($0)
Body: Math, rules, and lookup tables. If the same input always gives the same output, you don't need AI. This handles 75% of our computation.
Visual: Calculator icon, mathematical symbols

**SLIDE 4 — POINT 2**
Headline: Tier 2: Cached AI ($0.001)
Body: Generate an AI response once, cache it by input hash. Next 1,000 users with the same pattern get the cached version for free.
Visual: Database/cache icon with arrow looping back

**SLIDE 5 — POINT 3**
Headline: Tier 3: Dynamic AI ($0.05)
Body: Only genuinely unique, per-user queries hit the LLM. In our product, that's just 5% of total computation.
Visual: Brain/AI icon, small and focused

**SLIDE 6 — POINT 4**
Headline: The Result
Body: $0.003 per reading vs $0.15 for wrapper apps. Same quality. 50x cheaper. $536K saved annually at 10K daily users.
Visual: Cost comparison bar chart — dramatic difference

**SLIDE 7 — POINT 5**
Headline: How to Apply This
Body: Audit every API call. Ask: can math, rules, or caching handle this? Build deterministic layers first. Add AI only where it's truly needed.
Visual: Checklist icon with checkmarks

**SLIDE 8 — KEY INSIGHT**
Headline: The Best AI Products Are 95% Not AI
Body: The AI layer should be the cherry on top, not the entire sundae. Build the system first, add intelligence last.

**SLIDE 9 — CTA**
Headline: Want the Full Breakdown?
Body: I wrote a detailed blog post with the complete architecture, code patterns, and cost math.
Author: Shrish
Handle: @shrish on LinkedIn
Action: Follow me for more AI architecture breakdowns. DM "architecture" for the blog link.
