# YouTube Script Template

## Description
A fill-in-the-blank template for YouTube video scripts (5-20 minutes). Structured for maximum viewer retention with hooks, pattern interrupts, and optimized pacing. Includes visual direction notes for every section.

## When to Use
- Creating educational or tutorial YouTube content
- Producing thought leadership or behind-the-scenes videos
- Making product demos or explainer videos
- When you need a video script with built-in retention optimization

## Template Structure

```
METADATA:
  Title: {VIDEO_TITLE — under 60 characters, keyword-rich, curiosity-driving}
  Target Length: {DURATION — e.g., "8-10 minutes"}
  Speaking Pace: {WPM — default 150 words/minute for conversational}
  Total Word Count Target: {DURATION_MINUTES x 150}

===

COLD OPEN (0:00 - 0:08)
Words: ~20
---
Script: "{COLD_OPEN — the most compelling statement, stat, or question from the entire video. This is the audition — 8 seconds to earn the next 10 minutes.}"

Visual: {COLD_OPEN_VISUAL — what's on screen, cuts, graphics}
Delivery: {DELIVERY_NOTE — tone, pace, emphasis}

===

INTRO (0:08 - 0:45)
Words: ~90
---
Script: "{INTRO_GREETING — brief, natural, not formulaic}"

"{CREDIBILITY — 1 sentence establishing why YOU can speak on this topic}"

"{TOPIC_SETUP — what this video covers, framed as a benefit to the viewer}"

"{VIDEO_PROMISE — specific statement of what the viewer will know/be able to do after watching}"

"Let's get into it."

Visual: {INTRO_VISUAL — talking head, lower third, graphics}

===

SECTION 1: {SECTION_1_TITLE} ({START_TIME} - {END_TIME})
Words: ~{WORD_COUNT}
---
Script: "{SECTION_1_OPENER — mini-hook for this section}"

"{SECTION_1_BODY — main content. Short sentences. Conversational. Vary sentence length for rhythm.}"

"{SECTION_1_EVIDENCE — data point, example, demo, or story}"

"{SECTION_1_SUMMARY — one sentence crystallizing the point}"

Visual: {SECTION_1_VISUAL — B-roll, graphics, screen recordings, talking head}
Retention Hook: "{RETENTION_HOOK_1 — pattern interrupt bridging to next section}"

===

SECTION 2: {SECTION_2_TITLE} ({START_TIME} - {END_TIME})
Words: ~{WORD_COUNT}
---
Script: "{SECTION_2_OPENER}"

"{SECTION_2_BODY}"

"{SECTION_2_EVIDENCE}"

"{SECTION_2_SUMMARY}"

Visual: {SECTION_2_VISUAL}
Retention Hook: "{RETENTION_HOOK_2}"

===

SECTION 3: {SECTION_3_TITLE} ({START_TIME} - {END_TIME})
Words: ~{WORD_COUNT}
---
[Same structure as above]

===

SECTION 4: {SECTION_4_TITLE} ({START_TIME} - {END_TIME})
Words: ~{WORD_COUNT}
---
[Same structure — practical application or "how to apply this"]

===

RECAP + CTA ({START_TIME} - {END_TIME})
Words: ~90
---
Script: "{RECAP — 2-3 sentences summarizing the key takeaways. Don't just repeat the intro — add nuance from what was covered.}"

"{CTA_PRIMARY — subscribe, check the link, comment — pick ONE primary}"

"{CTA_SECONDARY — brief mention of related video: 'If you liked this, you'll also want to watch [video], which goes deeper on [topic].'}"

"{SIGN_OFF — natural, consistent with your channel personality}"

Visual: End screen with subscribe button and video suggestion card.

===

THUMBNAIL CONCEPTS:
1. {THUMBNAIL_1 — visual concept for Design Studio}
2. {THUMBNAIL_2 — alternative concept}

DESCRIPTION:
{VIDEO_DESCRIPTION — 200-500 words, SEO optimized, timestamps, links}

TAGS:
{TAG_1}, {TAG_2}, {TAG_3}, {TAG_4}, {TAG_5}
```

## Variable Definitions

| Variable | Description | Constraints |
|----------|-------------|-------------|
| `{VIDEO_TITLE}` | YouTube title | Under 60 chars, keyword + curiosity |
| `{DURATION}` | Target video length | "X-Y minutes" range |
| `{COLD_OPEN}` | First 8 seconds of audio | ~20 words, must stop the click-away |
| `{INTRO_GREETING}` | Channel greeting | Brief, natural (not "Hey guys what's up") |
| `{CREDIBILITY}` | Why you're qualified | 1 sentence, specific not braggy |
| `{VIDEO_PROMISE}` | What viewer gains | 1 sentence, concrete outcome |
| `{SECTION_X_TITLE}` | Section headings | For chapter markers and internal tracking |
| `{SECTION_X_OPENER}` | Section hooks | 1-2 sentences that earn attention for this section |
| `{SECTION_X_BODY}` | Main content | Conversational writing, short sentences |
| `{SECTION_X_EVIDENCE}` | Supporting material | Data, demos, examples, stories |
| `{RETENTION_HOOK_X}` | Pattern interrupts | Teases, questions, or pivots that maintain attention |
| `{THUMBNAIL_1-2}` | Thumbnail concepts | Brief descriptions for Design Studio |
| `{VIDEO_DESCRIPTION}` | YouTube description | SEO-optimized, timestamps, links |

## Completed Example

```
METADATA:
  Title: "Our AI App Costs 50x Less. Here's the Architecture."
  Target Length: "8-10 minutes"
  Speaking Pace: 150 wpm
  Total Word Count Target: ~1400

===

COLD OPEN (0:00 - 0:08)
Words: 28
---
Script: "Our astrology app performs fifty thousand calculations per reading. And not a single one calls an AI API. The AI handles five percent. Here's how."

Visual: Quick montage: code running, architecture diagram flash, cost comparison ($0.003 vs $0.15)
Delivery: Confident, measured. Slow down on "not a single one." Slight emphasis on "five percent."

===

INTRO (0:08 - 0:45)
Words: 85
---
Script: "What's up — if you're building an AI product and your API bill is keeping you up at night, this one's for you.

I'm Shrish. I run MDS, a studio where we build AI-powered products.

Today I'm breaking down the three-tier architecture we use to make our AI products fifty times cheaper to run than the competition. Real numbers, real architecture, and a framework you can apply to your own stack.

Let's get into it."

Visual: Talking head with lower third. Cut to architecture diagram at "three-tier architecture."

===

SECTION 1: The Wrapper Trap (0:45 - 3:00)
Words: ~340
---
Script: "So here's what most AI startups do. [pause] User sends input. You send it to GPT-4. GPT-4 responds. You display it. Charge a subscription. Done.

At fifty users? Works great. Feels magical.

At fifty thousand users? You're spending fifteen hundred dollars a day on API calls. And your ten-dollar subscription isn't covering it.

This is the wrapper trap. [... continues with full section content ...]"

Visual: Talking head > animated wrapper architecture diagram > cost calculation animation
Retention Hook: "But here's what most founders miss — and this changes everything."

===

[Additional sections follow the same pattern]

===

THUMBNAIL CONCEPTS:
1. Split screen: "$0.15" in red (crossed out) vs "$0.003" in green. "50x CHEAPER" overlay. Face showing surprise.
2. Three-tier pyramid diagram with "95% NO AI" prominently featured. "The Architecture Lie" text.

DESCRIPTION:
Our AI astrology app does 50,000 calculations per reading — and the AI handles just 5% of the work. In this video, I break down the deterministic-first architecture that makes this possible.

Timestamps:
0:00 - Why our AI app uses almost no AI
0:45 - The Wrapper Trap
3:00 - Three-Tier Architecture Explained
5:45 - Real Cost Numbers
7:30 - How to Apply This
8:45 - Summary

Full blog post with technical details: [link]
Free architecture review: [link]

#AIArchitecture #SaaS #BuildInPublic

TAGS:
AI architecture, SaaS cost optimization, AI product development, deterministic architecture, reduce AI API costs
```
