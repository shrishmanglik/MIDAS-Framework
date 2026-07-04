# Three-Tier Execution Rule

## Purpose
Minimize cost by using the simplest execution method that produces acceptable output.

## Tier Definitions

### Tier 1 — Templates ($0.00)
- **When:** Output structure is known and only variables change
- **How:** String interpolation, fill-in-the-blank
- **Examples:** LinkedIn post from template, API endpoint scaffold, email from template
- **Cost:** Zero — no LLM calls
- **Speed:** Instant

### Tier 2 — Rules + Light LLM ($0.001-$0.005)
- **When:** Logic is deterministic but needs minor LLM polish or formatting
- **How:** Rule-based generation with Haiku for cleanup
- **Examples:** SEO meta descriptions from page content, code comments from function signatures, data transformations
- **Cost:** Minimal — one Haiku call
- **Speed:** Fast (<2 seconds)

### Tier 3 — Full LLM ($0.01-$0.10+)
- **When:** Requires creativity, nuanced analysis, or ambiguous reasoning
- **How:** Full Sonnet/Opus generation
- **Examples:** Original blog posts, architecture decisions, creative content, complex debugging
- **Cost:** Moderate to high
- **Speed:** 5-30 seconds depending on length

## Decision Flowchart

```
1. Does a template exist for this exact output type?
   YES -> Tier 1. Stop.
   NO  -> Continue.

2. Can the output be produced by rules/patterns + minimal LLM?
   YES -> Tier 2. Stop.
   NO  -> Continue.

3. Does this require genuine creativity or complex reasoning?
   YES -> Tier 3. Use cheapest model that handles it.
   NO  -> Re-evaluate. You probably missed a pattern.
```

## Enforcement
- Every task MUST be classified before execution begins
- Using Tier 3 when Tier 1 suffices is a quality gate failure
- If unsure, start at Tier 1 and escalate only when output quality is insufficient
- Log tier decisions for cost tracking
