# Content Brief Template

## Description
A fill-in-the-blank document that the Content Strategist produces to hand off to writer agents. This is the single source of truth for any content creation task — no writer should start working without a completed brief.

## When to Use
- Before creating any piece of content (post, article, email, script, etc.)
- When handing off content requirements from strategy to execution
- When a human wants to quickly specify what they need created
- As a checklist to ensure all critical decisions are made before writing begins

## Template Structure

```yaml
# Content Brief
# Created: {DATE}
# Brief ID: {BRIEF_ID — e.g., CB-2026-0042}

## Objective
goal: "{GOAL — what this content must achieve, specific and measurable}"
success_metric: "{METRIC — how you'll know it worked: impressions, clicks, DMs, sign-ups, etc.}"
target_metric_value: "{TARGET — the specific number you're aiming for}"

## Audience
persona: "{PERSONA — who exactly is consuming this content}"
knowledge_level: "{LEVEL — beginner | intermediate | advanced}"
pain_points:
  - "{PAIN_1 — what keeps them up at night related to this topic}"
  - "{PAIN_2}"
  - "{PAIN_3}"
desires:
  - "{DESIRE_1 — what they wish they had or could do}"
  - "{DESIRE_2}"
where_they_are: "{PLATFORMS — where this audience spends time online}"

## Content Specification
format: "{FORMAT — linkedin-post | linkedin-article | linkedin-carousel | x-single | x-thread | blog-post | cold-email | newsletter | youtube-script | short-video-script | podcast-outline}"
platform: "{PLATFORM — primary distribution platform}"
secondary_platforms: ["{PLATFORM_2}", "{PLATFORM_3}"]
tone: "{TONE — specific tone instruction, not just 'professional'}"
angle: "{ANGLE — what makes this take unique, the hook or perspective}"
key_messages:
  - "{MESSAGE_1 — core point #1 to communicate}"
  - "{MESSAGE_2 — core point #2}"
  - "{MESSAGE_3 — core point #3 (max 3)}"
cta: "{CTA — the ONE thing the audience should do after consuming}"

## SEO (if applicable)
primary_keyword: "{KEYWORD — main search target}"
secondary_keywords: ["{KW_2}", "{KW_3}", "{KW_4}"]
search_intent: "{INTENT — informational | commercial | transactional | navigational}"

## Constraints
word_count: "{RANGE — e.g., 300-1300 characters, 1500-2000 words}"
tier: "{TIER — 1 (template only) | 2 (light AI) | 3 (full AI)}"
deadline: "{DEADLINE — YYYY-MM-DD}"
budget_notes: "{BUDGET — any cost constraints or approvals needed}"

## References and Assets
data_points:
  - "{DATA_1 — specific stat, fact, or claim to include}"
  - "{DATA_2}"
competitor_examples:
  - "{COMP_1 — what competitors have published on this topic}"
internal_links:
  - "{LINK_1 — related content to reference or link to}"
visual_direction: "{VISUAL — brief note on what visual assets are needed}"

## Assignment
assigned_to: "{AGENT — which writer agent should execute this}"
reviewer: "{REVIEWER — content-editor by default}"
distribution: "{DISTRIBUTOR — content-distributor by default}"

## Notes
additional_context: "{NOTES — anything else the writer needs to know}"
```

## Variable Definitions

| Variable | Description | Constraints |
|----------|-------------|-------------|
| `{GOAL}` | What this content achieves | Specific + measurable |
| `{METRIC}` | How success is measured | Single metric |
| `{PERSONA}` | Target audience | Specific persona, not "everyone" |
| `{FORMAT}` | Content format | Must match an available template |
| `{TONE}` | Voice and style | Descriptive, not generic |
| `{ANGLE}` | Unique perspective | What makes this different from competitor content |
| `{KEY_MESSAGES}` | Core points | Max 3 messages |
| `{CTA}` | Call to action | Single, specific action |
| `{TIER}` | MIDAS cost tier | 1 = $0, 2 = ~$0.001, 3 = ~$0.10 |

## Completion Rules
- Every field should be filled or explicitly marked "N/A"
- If the brief has blanks, the strategist isn't done
- The assigned writer should be able to execute without asking follow-up questions
- If SEO fields are marked N/A, the content is not search-targeted (that's fine)

## Completed Example

```yaml
# Content Brief
# Created: 2026-02-28
# Brief ID: CB-2026-0042

## Objective
goal: "Generate 3+ inbound DMs from CTOs/founders within 14 days by demonstrating deep AI architecture expertise"
success_metric: "DMs received from target persona"
target_metric_value: "3+ DMs"

## Audience
persona: "Technical founders and CTOs at Series A-B startups building AI-powered products, worried about API costs as they scale"
knowledge_level: "advanced"
pain_points:
  - "AI API costs scale linearly with users — no margin advantage at scale"
  - "Wrapper apps have zero defensibility — anyone can copy them"
  - "Investors asking 'what's your moat?' and they can't answer"
desires:
  - "An architecture that gets cheaper per user as they scale"
  - "Technical differentiation that competitors can't easily replicate"
where_they_are: "LinkedIn (daily), Hacker News (weekly), X (occasionally)"

## Content Specification
format: "linkedin-post"
platform: "LinkedIn"
secondary_platforms: ["X (repurposed thread)"]
tone: "Technical authority with casual delivery — like explaining architecture at a whiteboard over coffee"
angle: "Contrarian — everyone's building AI wrappers, we built 95% without AI and it's our biggest advantage"
key_messages:
  - "Deterministic-first architecture reduces cost per user by 50x"
  - "The AI layer should be the last 5%, not the first 95%"
  - "This approach creates genuine technical moats"
cta: "DM me if you're building something similar — happy to walk through architecture decisions"

## SEO (if applicable)
primary_keyword: "N/A (social content, not search-targeted)"
secondary_keywords: []
search_intent: "N/A"

## Constraints
word_count: "300-1300 characters"
tier: "2"
deadline: "2026-03-01"
budget_notes: "Tier 2 approved — light AI for variation testing"

## References and Assets
data_points:
  - "50,000 calculations per reading, zero AI API calls for computation"
  - "$0.003 per reading vs $0.15 industry average — 50x cost advantage"
  - "200+ Vedic yoga combinations mapped via rule engine"
competitor_examples:
  - "Most astrology apps use GPT for everything — high cost, inconsistent results"
internal_links: []
visual_direction: "Architecture diagram showing the computation layers — Swiss Ephemeris > Rule Engine > Cache > AI (only 5%)"

## Assignment
assigned_to: "linkedin-writer"
reviewer: "content-editor"
distribution: "content-distributor"

## Notes
additional_context: "This is part of a 2-week authority-building sprint. The LinkedIn post will be followed by an X thread (different angle) and a blog post (full technical deep-dive). The LinkedIn post should be the sharpest, most scroll-stopping version."
```
