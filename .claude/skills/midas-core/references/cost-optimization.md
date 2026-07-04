# Cost Optimization Reference

## Target
<$0.01 per user interaction in AI costs across all MDS products.

## Strategies

### 1. Deterministic-First Architecture
- **Rule:** Compute before you call an AI
- **Application:** If a calculation, lookup, or rule can produce the answer, use it
- **Example:** AstroAI planetary positions use Swiss Ephemeris (math), not LLM generation
- **Savings:** 95%+ cost reduction vs. LLM-only approach

### 2. Feature-Hash Caching
- **Rule:** Cache by feature signature, not exact input
- **Application:** Hash the meaningful features of a request. Similar requests hit the same cache.
- **Example:** Two birth charts with the same planetary positions get the same interpretation
- **Savings:** First user pays for generation, next 1000 get it free

### 3. Model Selection Hierarchy
- **Rule:** Use the cheapest model that produces acceptable output
- **Hierarchy:**
  1. No model (template/rules) — $0.00
  2. Haiku — $0.001-$0.005 per call
  3. Sonnet — $0.01-$0.05 per call
  4. Opus — $0.05-$0.15 per call
- **Default:** Start with Haiku, escalate only on quality failure

### 4. Prompt Efficiency
- **Rule:** Shorter prompts cost less. Remove filler.
- **Techniques:**
  - Use system prompts for reusable context (cached after first call)
  - Keep user prompts focused on the variable parts
  - Avoid repeating information already in system prompt
  - Use structured output (JSON mode) to reduce output tokens

### 5. Batch Processing
- **Rule:** Batch similar operations to reduce per-call overhead
- **Application:** Generate 10 similar items in one call, not 10 separate calls
- **Example:** Generate all question variants for a chemistry topic in one prompt

## Cost Tracking

Every task must track:
- Tier used (1/2/3)
- Model used (if Tier 2/3)
- Input tokens consumed
- Output tokens generated
- Total cost for the operation

Report at task completion: "This task cost $X.XX across N operations."
