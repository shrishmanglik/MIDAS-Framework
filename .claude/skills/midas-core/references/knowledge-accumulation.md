# Knowledge Accumulation Reference

## Purpose
Capture genuine insights from every substantial task to make MIDAS smarter over time. Knowledge compounds — every lesson learned prevents repeating mistakes and accelerates future work.

## When to Capture Knowledge
- After completing a substantial task (not trivial one-liners)
- When discovering a pattern that will recur
- When a failure teaches something non-obvious
- When a workaround reveals a better approach
- When cross-studio coordination reveals an integration insight

## When NOT to Capture Knowledge
- Obvious facts everyone already knows
- Temporary workarounds for bugs that will be fixed
- Session-specific context that won't generalize
- Duplicates of existing learnings

## Format

```markdown
* [TAG] Pattern Title: What was learned, why it matters, how to encode it into a protocol.
```

## Tags

| Tag | Domain | Example |
|-----|--------|---------|
| ARCH | Architecture decisions | "[ARCH] Feature-hash caching: Cache by meaningful features, not exact inputs. Reduces cache misses by 80%." |
| ORCH | Orchestration patterns | "[ORCH] Max 3 studios: Loading 4+ studios causes context degradation. Decompose into sequential phases." |
| PROM | Prompt engineering | "[PROM] Structured output: JSON mode reduces output tokens by 30% vs. free-form for data extraction." |
| QUAL | Quality patterns | "[QUAL] Gate ordering: Run Schema before Correctness — catches structural issues before expensive execution." |
| COST | Cost insights | "[COST] Haiku sufficiency: Haiku handles 85% of Tier 2 tasks. Only escalate to Sonnet for nuanced tone." |
| DPLY | Deployment patterns | "[DPLY] Vercel cold starts: API routes >50KB have 2s cold starts. Keep routes lean." |
| PROD | Product insights | "[PROD] Onboarding friction: Users abandon if setup takes >3 clicks. Pre-fill everything possible." |
| DSGN | Design patterns | "[DSGN] Mobile-first: 70% of MDS traffic is mobile. Design for 375px first, then scale up." |
| DATA | Data patterns | "[DATA] XBRL parsing: SEC filings use inconsistent tag namespaces. Normalize before processing." |
| FAIL | Failure post-mortems | "[FAIL] Silent API failure: Always check response status, not just absence of error." |
| FLOW | Workflow optimizations | "[FLOW] Parallel agents: Content + design can run simultaneously if brief is shared upfront." |
| SCALE | Scaling insights | "[SCALE] Ephemeris calc: Swiss Ephemeris handles 10K calcs/sec single-threaded. No need for async." |

## Storage Location
`knowledge/MIDAS-LEARNINGS.md` in the midas-framework repository.

## Quality Rules
1. Each learning must be specific and actionable — not generic advice
2. Include the "why" — not just what, but why it matters
3. Include the "how" — how to apply this learning going forward
4. No duplicates — check existing learnings before adding
5. Maximum 1-2 sentences per learning — concise, not verbose
