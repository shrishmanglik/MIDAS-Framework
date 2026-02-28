# Newsletter Template

## Description
A fill-in-the-blank template for recurring email newsletters. Designed for consistent weekly or biweekly publishing. Modular sections can be mixed and matched depending on content availability.

## When to Use
- Sending a recurring newsletter to an email subscriber list
- Curating insights, updates, and resources for an engaged audience
- Building a direct relationship with readers outside of social media algorithms
- Sharing a mix of original content, curated links, and personal updates

## Template Structure

```
Subject: {SUBJECT_LINE — 4-8 words, specific to this issue's highlight}
Preview text: {PREVIEW_TEXT — extends the subject, 40-90 characters}

---

{OPENING_PERSONAL — 2-3 sentences. Warm, conversational, human. Reference the week, a recent event, or a personal observation. NOT "Welcome to issue #47 of the newsletter."}

---

## {FEATURED_SECTION_TITLE}

{FEATURED_CONTENT — 100-300 words. The main piece of value in this newsletter. Could be: an original insight, a lesson learned, a mini case study, a framework, or an opinion.}

{FEATURED_CTA — if this leads to longer content: "Full breakdown here: [link]"}

---

## Quick Hits

{QUICK_HIT_1_TITLE}: {QUICK_HIT_1_DESCRIPTION — 1-2 sentences summarizing an insight, update, or resource.} {LINK_IF_APPLICABLE}

{QUICK_HIT_2_TITLE}: {QUICK_HIT_2_DESCRIPTION} {LINK_IF_APPLICABLE}

{QUICK_HIT_3_TITLE}: {QUICK_HIT_3_DESCRIPTION} {LINK_IF_APPLICABLE}

---

## {RESOURCE_SECTION_TITLE — "What I'm Reading" / "Tools & Resources" / "Recommended"}

- **{RESOURCE_1}** — {RESOURCE_1_DESCRIPTION — why it's worth checking out} [link]
- **{RESOURCE_2}** — {RESOURCE_2_DESCRIPTION} [link]
- **{RESOURCE_3}** — {RESOURCE_3_DESCRIPTION} [link]

---

## {CLOSING_SECTION_TITLE — "One Last Thing" / "The Takeaway" / "Until Next Time"}

{CLOSING_THOUGHT — 2-3 sentences. A personal reflection, a question for the reader, or a teaser for next week. End on a note that makes them want to open the next issue.}

---

{SIGN_OFF — name, one-line description}

P.S. {PS_LINE — optional: ask for replies, referrals, or feedback}

---

{FOOTER — unsubscribe link, company info, social links}
```

## Variable Definitions

| Variable | Description | Constraints |
|----------|-------------|-------------|
| `{SUBJECT_LINE}` | Email subject | 4-8 words, specific to this issue's highlight |
| `{PREVIEW_TEXT}` | Inbox preview | 40-90 characters, complements subject |
| `{OPENING_PERSONAL}` | Warm opener | 2-3 sentences, personal and current |
| `{FEATURED_SECTION_TITLE}` | Main content heading | 3-8 words, descriptive |
| `{FEATURED_CONTENT}` | Primary value piece | 100-300 words |
| `{QUICK_HIT_X_TITLE}` | Short update titles | 3-6 words each |
| `{QUICK_HIT_X_DESCRIPTION}` | Short update content | 1-2 sentences each |
| `{RESOURCE_X}` | Recommended resource name | Title or name |
| `{RESOURCE_X_DESCRIPTION}` | Why it's recommended | 1 sentence each |
| `{CLOSING_THOUGHT}` | End-of-newsletter reflection | 2-3 sentences |
| `{PS_LINE}` | Post-script | Engagement driver, optional |

## Rules
- Total newsletter: 400-800 words. Respect inbox time.
- One primary piece of value. Everything else is supplementary.
- Mobile-first formatting: short paragraphs, clear sections, obvious links.
- Subject line must be specific to THIS issue — not generic "Weekly Update #12."
- The opening should feel like a note from a friend, not a broadcast.
- Always include an unsubscribe option (legally required, ethically essential).

## Completed Example

```
Subject: The 50x cost trick nobody talks about
Preview text: How we made our AI product radically cheaper (and why it matters for yours)

---

Happy Tuesday.

This week I had a conversation with a founder who was spending $4,200/month on OpenAI API calls for 800 users. His $15/month subscription wasn't close to covering it. He asked me how we handle it differently.

The answer surprised him. Let me share it with you too.

---

## The Deterministic-First Architecture

Most AI products send everything to GPT-4. Every user action, every query, every computation — straight to the API.

We took the opposite approach with AstroAI. We asked: what percentage of this computation actually NEEDS AI?

The answer was 5%.

The other 95% could be handled by math (Swiss Ephemeris for planetary calculations), rules (pattern matching for 200+ Vedic yoga combinations), and caching (same placement = same interpretation).

The result: $0.003 per reading instead of $0.15. Same output quality. 50x cheaper.

I wrote the full technical breakdown this week — architecture diagrams, cost math, and the 4-step process to apply this to any AI product.

Read the full breakdown here: [link to blog post]

---

## Quick Hits

**Studio system update**: Content Studio is now fully operational — 9 specialized agents, 6 prompt engineers, and 12 templates. This newsletter was created using it.

**AstroAI milestone**: We crossed 5,000 cached interpretations this week. That's 5,000 AI calls that never need to happen again.

**Interesting pattern**: The founders who most resist the "use less AI" advice are the ones with the highest API bills. The correlation is too consistent to ignore.

---

## What I'm Reading

- **"The Bitter Lesson" by Rich Sutton** — A classic essay arguing that general computation always wins over human-designed approaches. I agree with his thesis but believe the timeline is longer than most think — which is exactly why deterministic layers matter NOW. [link]
- **Cal Newport's "Slow Productivity"** — Not tech-related, but changed how I think about studio output. Quality over quantity. Fewer things, done exceptionally. [link]
- **Cursor's approach to AI-native development** — Interesting case study of a company that actually understands the deterministic-first principle. Their AI features are surgical, not sprawling. [link]

---

## Until Next Time

The founder I mentioned at the top? After our call, he identified 73% of his API calls that could be replaced with caching and rule engines. He hasn't implemented it yet, but the math shows it would drop his monthly bill from $4,200 to under $600.

Sometimes the most valuable technical insight isn't about using better AI. It's about using less of it.

See you next Tuesday.

— Shrish, MDS

P.S. If you know a founder drowning in API costs, forward this to them. Sometimes a different architecture is worth more than a bigger budget.

---

You're receiving this because you signed up at mds.dev. Unsubscribe: [link] | MDS, [address]
```
