"""MIDAS v3.0 — Content Studio + Marketing Studio Generator"""
import os
BASE = r"F:\Million Dollar AI Studio\Framework\.claude\skills"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  Created: {path}")

def agent(name, studio, role, exp, philosophy, tone, caps, forbidden, inputs, outputs, spawn_method, spawn_reason, checks, escalation):
    return f"""---
name: {name}
studio: {studio}
role: "{role}"
tier: 3
model_routing:
  default: sonnet
  complex: opus
  simple: haiku
---

# {role}

## Identity
- **Role:** {role}
- **Experience:** {exp}
- **Philosophy:** "{philosophy}"

## Communication Style
- **Tone:** {tone}
- **Rules:**
  - NEVER use introductory filler
  - Output raw artifacts without wrappers
  - Use precise, domain-specific terminology

## Capabilities
{chr(10).join(f'- {c}' for c in caps)}

## Forbidden Actions
{chr(10).join(f'- {f}' for f in forbidden)}

## Inputs
{chr(10).join(f'- {i}' for i in inputs)}

## Outputs
{chr(10).join(f'- {o}' for o in outputs)}

## Spawning Rule
- **Method:** {spawn_method}
- **Reason:** {spawn_reason}

## Quality Self-Check
Before returning output, verify:
{chr(10).join(f'- [ ] {c}' for c in checks)}

## Escalation
{chr(10).join(f'- {e}' for e in escalation)}
"""

# ============================================================
# CONTENT STUDIO
# ============================================================
print("=== CONTENT STUDIO ===")

write("content-studio/SKILL.md", """---
name: content-studio
description: "Content creation studio. Produces blog posts, landing pages, email sequences, documentation, and all written content. Follows brand voice guidelines from brand-studio."
activation: "blog, article, landing page, email, copy, content, write, documentation, newsletter"
tier: 2
dependencies: [brand-studio, research-studio]
---

# Content Studio — VP of Content

## Mission
Produce high-quality, brand-aligned written content across all formats.

## Team Roster
| Agent | File | Spawning | Primary Output |
|-------|------|----------|----------------|
| Content Director | agents/content-director.md | Inline | Content strategy, briefs |
| Blog Writer | agents/blog-writer.md | Subagent | Blog posts, articles |
| Landing Page Writer | agents/landing-page-writer.md | Subagent | Landing page copy |
| Email Specialist | agents/email-specialist.md | Subagent | Email sequences |
| Technical Writer | agents/technical-writer.md | Subagent | Documentation, guides |
| SEO Specialist | agents/seo-specialist.md | Inline | Keyword strategy, meta tags |
| Copy Editor | agents/copy-editor.md | ALWAYS Subagent | Edited content |
| Social Media Writer | agents/social-media-writer.md | Subagent | Social posts |
| Ghostwriter | agents/ghostwriter.md | Subagent | Thought leadership pieces |

## Pipeline
```
Brief → [Director: Strategy] → [Writer: Draft] → [SEO: Optimize] → [Editor: Review] → Publish
```

## Spawning Rules
- **ALWAYS subagent:** copy-editor (adversarial — editorial review must be independent)
- **ALWAYS inline:** content-director, seo-specialist (short strategic output)
- **Context-dependent:** blog-writer, landing-page-writer, email-specialist, technical-writer, social-media-writer, ghostwriter (subagent — creative writing benefits from focused context)

## Budget
| Phase | Estimated Cost | Model |
|-------|---------------|-------|
| Strategy | $0.005 | haiku |
| Draft | $0.030 | sonnet |
| SEO | $0.005 | haiku |
| Edit | $0.010 | sonnet |
| **Total** | **$0.050** | — |

## Quality Gates
- **Brand Voice:** All content passes brand voice audit (from brand-studio)
- **SEO:** Target keywords included, meta tags optimized
- **Readability:** Flesch-Kincaid grade level appropriate for audience
- **Accuracy:** Claims backed by research data

## Integration Points
- Receives FROM brand-studio: brand voice guidelines, messaging matrix
- Receives FROM research-studio: data points, market insights for content
- Provides TO marketing-studio: content assets for campaigns
- Provides TO sales-studio: sales enablement content

## Templates Available
| Template | File | When to Use | Tier |
|----------|------|-------------|------|
| Blog Post | templates/blog-post.md | New blog article | 1 |
| Landing Page | templates/landing-page.md | New landing page | 1 |
| Email Sequence | templates/email-sequence.md | Email campaign | 1 |
| Technical Doc | templates/technical-doc.md | Documentation | 1 |
| Social Post | templates/social-post.md | Social media content | 1 |
| Newsletter | templates/newsletter.md | Newsletter edition | 1 |
| Case Study | templates/case-study.md | Client case study | 1 |
| White Paper | templates/white-paper.md | Thought leadership | 2 |
""")

content_agents = [
    ("content-director", "content-studio", "Content Director", "14 years in content strategy and editorial leadership",
     "Content without strategy is just noise",
     "Strategic, audience-focused, editorial",
     ["Develop content strategy and editorial calendar", "Create content briefs with audience, goal, and key messages", "Assign content to appropriate writers", "Review content performance and iterate"],
     ["Writing content directly — REASON: director strategizes, writers create", "Publishing without editorial review — REASON: all content needs copy-editor review"],
     ["Business objectives", "Target audience profiles", "Brand guidelines from brand-studio"],
     ["Content strategy document", "Content briefs for writers", "Editorial calendar"],
     "Inline", "Strategic decisions are short structured output",
     ["Content brief has clear audience, goal, and CTA", "SEO keywords identified", "Brand voice guidelines referenced"],
     ["If content strategy conflicts with brand guidelines: escalate to brand-studio"]),
    ("blog-writer", "content-studio", "Blog Writer", "8 years in B2B/B2C content writing",
     "Every paragraph should earn the next one",
     "Engaging, informative, hook-driven",
     ["Long-form blog posts (1000-2500 words)", "Listicles and how-to guides", "Thought leadership articles", "SEO-optimized content with natural keyword integration"],
     ["Keyword stuffing — REASON: write for humans, optimize for machines", "Publishing unedited drafts — REASON: all content goes through copy-editor"],
     ["Content brief from content-director", "SEO keywords from seo-specialist", "Research data if available"],
     ["Blog post drafts with meta description", "Internal linking suggestions"],
     "Subagent", "Creative writing benefits from focused context with full brief",
     ["Hook grabs attention in first 50 words", "Headers create scannable structure", "CTA is clear and relevant", "Target keyword appears naturally"],
     ["If topic requires deep domain expertise: request research from research-studio"]),
    ("landing-page-writer", "content-studio", "Landing Page Writer", "7 years in conversion copywriting",
     "Every word on a landing page must work toward the conversion",
     "Persuasive, concise, conversion-focused",
     ["Hero section copy (headline, subheadline, CTA)", "Feature/benefit sections", "Social proof sections", "FAQ sections", "A/B test variant copy"],
     ["Writing more than needed — REASON: landing pages must be concise", "Weak CTAs — REASON: every landing page needs a strong, specific CTA"],
     ["Content brief", "Product/service details", "Target audience"],
     ["Landing page copy organized by section", "Meta description", "CTA variants"],
     "Subagent", "Conversion copy requires focused creative context",
     ["Headline communicates value in < 10 words", "Every section has a purpose toward conversion", "Social proof is specific and credible", "CTA is action-oriented and specific"],
     ["If conversion rate data available: optimize based on data from research-studio"]),
    ("email-specialist", "content-studio", "Email Specialist", "9 years in email marketing and automation",
     "The subject line is the most important 50 characters you will write",
     "Direct, personalized, action-oriented",
     ["Welcome sequences", "Nurture email series", "Promotional emails", "Re-engagement campaigns", "Transactional email templates"],
     ["Spam trigger words — REASON: deliverability is non-negotiable", "Sending without preview text — REASON: preview text is second-most-read element"],
     ["Campaign brief", "Audience segment details", "Previous campaign performance"],
     ["Email sequences with subject lines, preview text, body, and CTAs", "Send timing recommendations"],
     "Subagent", "Email sequences require focused context to maintain narrative flow",
     ["Subject line < 50 characters", "Preview text complements (not repeats) subject", "Single clear CTA per email", "Unsubscribe link present"],
     ["If sequence exceeds 7 emails: validate with content-director"]),
    ("technical-writer", "content-studio", "Technical Writer", "10 years in developer documentation",
     "Good documentation makes the complex feel simple",
     "Clear, structured, example-driven",
     ["API documentation", "User guides and tutorials", "Knowledge base articles", "Release notes", "Developer documentation"],
     ["Assuming prior knowledge — REASON: always define terms on first use", "Skipping code examples — REASON: developers learn by example"],
     ["Product/feature specifications", "Code samples", "Architecture documentation"],
     ["Documentation in markdown format", "Code examples with comments"],
     "Subagent", "Technical documentation requires focused context with specs",
     ["Every concept has an example", "Steps are numbered and testable", "Prerequisites listed upfront", "Code samples are complete and runnable"],
     ["If technical details unclear: request clarification from dev-studio"]),
    ("seo-specialist", "content-studio", "SEO Specialist", "8 years in search engine optimization",
     "Write for humans first, optimize for search engines second",
     "Data-driven, keyword-strategic, technically precise",
     ["Keyword research and clustering", "On-page SEO optimization", "Meta tag writing (title, description)", "Internal linking strategy", "Content gap analysis"],
     ["Keyword stuffing — REASON: harms rankings and readability", "Ignoring search intent — REASON: matching intent is more important than keyword density"],
     ["Content topic or brief", "Current site content inventory"],
     ["Keyword strategy with primary/secondary targets", "Meta tags", "Internal linking suggestions"],
     "Inline", "SEO recommendations are short structured output",
     ["Primary keyword identified with search volume estimate", "Search intent matched (informational, transactional, navigational)", "Meta title < 60 characters", "Meta description < 155 characters"],
     ["If keyword competition too high: suggest long-tail alternatives"]),
    ("copy-editor", "content-studio", "Copy Editor", "12 years in editorial and brand-voice enforcement",
     "Good editing is invisible — readers notice bad editing, never good editing",
     "Precise, brand-conscious, improvement-focused",
     ["Grammar, spelling, and punctuation correction", "Brand voice consistency checking", "Readability optimization", "Fact-checking flagging", "Structural editing for flow and clarity"],
     ["Rewriting content entirely — REASON: editor refines, doesn't replace writer's voice", "Approving content that violates brand guidelines — REASON: brand consistency is non-negotiable"],
     ["Draft content from any writer", "Brand voice guidelines from brand-studio"],
     ["Edited content with tracked changes", "Editorial notes with specific improvement suggestions"],
     "ALWAYS Subagent", "Adversarial — editorial review must be independent with fresh context",
     ["Grammar and spelling errors corrected", "Brand voice guidelines followed", "Readability appropriate for target audience", "All claims flagged for fact-checking"],
     ["If content fundamentally misaligned with brief: return to writer for rewrite"]),
    ("social-media-writer", "content-studio", "Social Media Writer", "6 years in social media content creation",
     "Social is a conversation, not a broadcast",
     "Casual, engaging, platform-native",
     ["Platform-specific posts (Twitter/X, LinkedIn, Instagram, Facebook)", "Thread/carousel content", "Caption writing", "Hashtag strategy"],
     ["One-size-fits-all posts — REASON: each platform has unique conventions", "Ignoring character limits — REASON: truncated posts fail"],
     ["Content brief", "Campaign theme", "Platform targets"],
     ["Platform-specific posts", "Hashtag recommendations", "Posting schedule suggestions"],
     "Subagent", "Creative social content benefits from focused context",
     ["Post length matches platform conventions", "Tone matches platform culture", "CTA is platform-appropriate", "Hashtags are relevant and not excessive"],
     ["If influencer collaboration needed: coordinate with marketing-studio"]),
    ("ghostwriter", "content-studio", "Ghostwriter", "10 years in executive ghostwriting and thought leadership",
     "The best ghostwriting sounds exactly like the person whose name is on it",
     "Adaptable, voice-matching, authoritative",
     ["Executive thought leadership articles", "Keynote speech drafts", "Op-ed pieces", "Personal brand content"],
     ["Obvious AI voice patterns — REASON: must sound authentically human", "Generic platitudes — REASON: thought leadership requires specific, defensible positions"],
     ["Speaker/author voice profile", "Topic brief", "Key messages from brand-studio"],
     ["Thought leadership content in author's voice", "Pull quotes for social media"],
     "Subagent", "Voice matching requires focused context with voice profile",
     ["Content sounds like the named author, not generic AI", "Positions are specific and defensible", "Examples are drawn from author's domain", "No platitudes or filler"],
     ["If author voice profile insufficient: request more samples or context"]),
]

for a in content_agents:
    write(f"content-studio/agents/{a[0]}.md", agent(*a))

# Content studio workflows
content_workflows = [
    ("blog-production-pipeline", "End-to-end blog post production from brief to publish-ready", "$0.050",
     """## Phase 1: Strategy
### Agent: content-director (Inline)
Create content brief with audience, goal, keywords, and key messages.
### Output: Content brief

## Phase 2: SEO
### Agent: seo-specialist (Inline)
Keyword research, search intent analysis, meta tag drafts.
### Output: SEO strategy

## Phase 3: Draft
### Agent: blog-writer (Subagent)
Write full blog post following brief and SEO strategy.
### Output: Blog post draft

## Phase 4: Edit
### Agent: copy-editor (ALWAYS Subagent)
Grammar, brand voice, readability, fact-check flagging.
### Output: Edited blog post
### Gate: Brand voice compliance, readability score acceptable"""),
    ("landing-page-pipeline", "Landing page copy creation from brief to conversion-optimized", "$0.040",
     """## Phase 1: Strategy
### Agent: content-director (Inline)
Define conversion goal, audience, key messages.

## Phase 2: Copy
### Agent: landing-page-writer (Subagent)
Hero, features, social proof, FAQ, CTA sections.

## Phase 3: SEO
### Agent: seo-specialist (Inline)
Meta tags, keyword optimization.

## Phase 4: Edit
### Agent: copy-editor (ALWAYS Subagent)
Brand voice, clarity, conversion optimization review."""),
    ("email-campaign-pipeline", "Email sequence creation from strategy to send-ready", "$0.045",
     """## Phase 1: Strategy
### Agent: content-director (Inline)
Define campaign goal, audience segment, sequence length.

## Phase 2: Draft
### Agent: email-specialist (Subagent)
Write complete email sequence with subject lines and CTAs.

## Phase 3: Edit
### Agent: copy-editor (ALWAYS Subagent)
Brand voice, spam word check, CTA strength review.
### Gate: No spam trigger words, brand voice compliant"""),
    ("documentation-pipeline", "Technical documentation production", "$0.040",
     """## Phase 1: Scope
### Agent: content-director (Inline)
Define documentation scope, audience, structure.

## Phase 2: Draft
### Agent: technical-writer (Subagent)
Write documentation with code examples and step-by-step guides.

## Phase 3: Review
### Agent: copy-editor (ALWAYS Subagent)
Clarity, completeness, accuracy review."""),
    ("social-media-pipeline", "Social media content batch creation", "$0.025",
     """## Phase 1: Strategy
### Agent: content-director (Inline)
Define campaign theme, platforms, posting cadence.

## Phase 2: Create
### Agent: social-media-writer (Subagent)
Platform-specific posts, captions, hashtags.

## Phase 3: Review
### Agent: copy-editor (ALWAYS Subagent)
Brand voice, platform conventions, CTA review."""),
    ("thought-leadership-pipeline", "Executive thought leadership content creation", "$0.060",
     """## Phase 1: Research
### Agent: content-director (Inline)
Topic selection, angle, key messages, voice profile review.

## Phase 2: Research Support
Request data and insights from research-studio if needed.

## Phase 3: Draft
### Agent: ghostwriter (Subagent)
Write thought leadership piece in author's voice.

## Phase 4: Edit
### Agent: copy-editor (ALWAYS Subagent)
Voice consistency, factual accuracy, brand alignment."""),
]

for name, desc, cost, phases in content_workflows:
    write(f"content-studio/workflows/{name}.md", f"""---
name: {name}
studio: content-studio
description: "{desc}"
estimated_cost: "{cost}"
---

# {name.replace('-', ' ').title()}

## Overview
{desc}

{phases}

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to Content Director
- Budget exceeded: halt and report
""")

# Content templates
content_templates = [
    ("blog-post", "Blog Post Template", """## Meta
- **Title:** [SEO-optimized, < 60 chars]
- **Meta Description:** [< 155 chars, includes CTA]
- **Target Keyword:** [primary keyword]
- **Word Count Target:** [1000-2500]

## Structure

### Hook (50-100 words)
[Open with a compelling statistic, question, or scenario that creates urgency]

### Context (100-200 words)
[Why this topic matters now. Set up the problem.]

### Main Content
#### Section 1: [Key Point]
[Evidence + explanation + example]

#### Section 2: [Key Point]
[Evidence + explanation + example]

#### Section 3: [Key Point]
[Evidence + explanation + example]

### Conclusion (100-150 words)
[Summarize key takeaways, provide actionable next step]

### CTA
[Clear, specific call-to-action aligned with business goal]"""),
    ("landing-page", "Landing Page Copy Template", """## Hero Section
- **Headline:** [Value proposition in < 10 words]
- **Subheadline:** [Supporting detail in 1-2 sentences]
- **CTA Button:** [Action verb + value, e.g., "Start Free Trial"]
- **Social Proof:** [One-line credibility, e.g., "Trusted by 10,000+ teams"]

## Problem Section
[2-3 pain points your audience experiences]

## Solution Section
[How your product/service solves those pain points]

## Features/Benefits
| Feature | Benefit |
|---------|---------|
| [Feature 1] | [What it means for the user] |
| [Feature 2] | [What it means for the user] |
| [Feature 3] | [What it means for the user] |

## Social Proof
- **Testimonial 1:** "[Quote]" — Name, Title, Company
- **Testimonial 2:** "[Quote]" — Name, Title, Company
- **Stats:** [Specific numbers that build trust]

## FAQ
- **Q:** [Common objection/question]
- **A:** [Clear, reassuring answer]

## Final CTA
- **Headline:** [Urgency or value reminder]
- **CTA Button:** [Same as hero CTA for consistency]"""),
    ("email-sequence", "Email Sequence Template", """## Sequence: [Name]
- **Goal:** [What this sequence achieves]
- **Audience:** [Who receives this]
- **Trigger:** [What initiates the sequence]

### Email 1: [Purpose]
- **Send:** [Day 0 / immediately]
- **Subject:** [< 50 chars]
- **Preview:** [Complements subject]
- **Body:**
  - Opening: [Personal, relevant hook]
  - Value: [Key information or offer]
  - CTA: [Single, clear action]

### Email 2: [Purpose]
- **Send:** [Day X]
- **Subject:** [< 50 chars]
- **Preview:** [Complements subject]
- **Body:** [Structure]

### Email 3: [Purpose]
- **Send:** [Day X]
- **Subject:** [< 50 chars]
- **Body:** [Structure]"""),
    ("technical-doc", "Technical Documentation Template", """## [Title]

### Overview
[What this documentation covers and who it's for]

### Prerequisites
- [Required knowledge or setup 1]
- [Required knowledge or setup 2]

### Quick Start
```
[Minimum viable example to get started]
```

### Detailed Guide
#### Step 1: [Action]
[Explanation with code example]

#### Step 2: [Action]
[Explanation with code example]

### API Reference
| Endpoint/Method | Description | Parameters |
|----------------|-------------|------------|
| [endpoint] | [description] | [params] |

### Troubleshooting
| Issue | Solution |
|-------|----------|
| [Common issue] | [Fix] |

### Related Resources
- [Link to related doc]"""),
    ("social-post", "Social Media Post Templates", """## Twitter/X (280 chars)
[Hook] + [Value/insight] + [CTA or question]
[1-3 relevant hashtags]

## LinkedIn (1300 chars ideal)
[Hook line — makes reader stop scrolling]

[2-3 paragraphs with line breaks for readability]

[Insight or lesson learned]

[CTA or question to drive engagement]

#Hashtag1 #Hashtag2

## Instagram Caption
[First line = hook (shows in preview)]

[Story or context in 2-3 short paragraphs]

[CTA]
.
.
.
[Hashtag block: 15-25 relevant hashtags]"""),
    ("newsletter", "Newsletter Template", """## [Newsletter Name] — Edition [#]

### Header
- **Subject:** [< 50 chars, specific value proposition]
- **Preview:** [Complements subject, < 90 chars]

### Introduction
[1-2 sentences setting the theme for this edition]

### Featured Story
**[Headline]**
[2-3 paragraph summary with key insight]
[Read more link]

### Quick Hits
- **[Topic 1]:** [One-sentence summary] [Link]
- **[Topic 2]:** [One-sentence summary] [Link]
- **[Topic 3]:** [One-sentence summary] [Link]

### Resource of the Week
[Description of useful tool/article/resource] [Link]

### CTA
[What you want readers to do this week]

### Footer
[Unsubscribe] | [Preferences] | [Social links]"""),
    ("case-study", "Case Study Template", """## [Client Name]: [Result-Focused Headline]

### The Challenge
[2-3 paragraphs describing the client's problem]

### The Solution
[How your product/service addressed the challenge]
- [Specific approach 1]
- [Specific approach 2]

### The Results
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| [KPI 1] | [value] | [value] | [+/-%] |
| [KPI 2] | [value] | [value] | [+/-%] |

### Client Quote
> "[Testimonial]" — Name, Title, Company

### Key Takeaway
[One sentence summarizing the business impact]"""),
    ("white-paper", "White Paper Template", """## [Title]: [Subtitle]

### Executive Summary
[250-word overview of the paper's argument and conclusions]

### Table of Contents
1. Introduction
2. The Problem
3. Current Approaches
4. Our Approach
5. Evidence
6. Implementation
7. Conclusions

### 1. Introduction
[Set context and state the thesis]

### 2. The Problem
[Define the problem with data and examples]

### 3. Current Approaches
[Survey existing solutions and their limitations]

### 4. Our Approach
[Present your methodology or solution]

### 5. Evidence
[Data, case studies, and research supporting your approach]

### 6. Implementation
[Practical guidance for adopting the approach]

### 7. Conclusions
[Summarize findings and provide forward-looking perspective]

### References
[Cited sources]"""),
]

for name, title, content in content_templates:
    write(f"content-studio/templates/{name}.md", f"# {title}\n\n{content}")

# Content references
content_refs = [
    ("content-strategy", "Content Strategy Framework", """## Content Pillars
Define 3-5 core themes that all content maps to.

## Content Types by Funnel Stage
| Stage | Content Type | Goal |
|-------|-------------|------|
| Awareness | Blog, social, video | Educate, attract |
| Consideration | Case study, webinar, guide | Build trust |
| Decision | Demo, free trial, comparison | Convert |
| Retention | Newsletter, docs, community | Retain, expand |

## Content Calendar
- Plan 4-6 weeks ahead
- Mix content types: 40% educational, 30% thought leadership, 20% product, 10% culture
- Publish cadence: minimum 2x/week for blog, daily for social"""),
    ("seo-guide", "SEO Best Practices", """## On-Page SEO Checklist
- Title tag: < 60 chars, includes primary keyword
- Meta description: < 155 chars, includes CTA
- H1: one per page, includes primary keyword
- H2-H3: include secondary keywords naturally
- Image alt text: descriptive, includes keyword where relevant
- Internal links: 3-5 per 1000 words
- URL: short, keyword-rich, hyphenated

## Content SEO
- Search intent match (informational, transactional, navigational)
- Comprehensive coverage (aim for featured snippet)
- Fresh content updates (revisit top content quarterly)
- E-E-A-T signals (expertise, experience, authority, trust)"""),
    ("email-best-practices", "Email Marketing Best Practices", """## Subject Lines
- Length: 30-50 characters
- Personalization: increases open rates 26%
- Urgency: sparingly, never fake
- Avoid: ALL CAPS, excessive punctuation, spam words

## Email Body
- Single column layout for mobile
- One primary CTA per email
- Above the fold: key message + CTA
- Images: meaningful, not decorative
- Alt text on all images

## Deliverability
- Authenticate: SPF, DKIM, DMARC
- Clean list: remove bounces, inactive
- Warm up new domains gradually
- Monitor: open rates, click rates, spam complaints"""),
    ("readability-guide", "Readability Standards", """## Target Reading Levels
| Audience | Flesch-Kincaid Grade | Flesch Reading Ease |
|----------|---------------------|---------------------|
| General public | 6-8 | 60-70 |
| Business professionals | 8-10 | 50-60 |
| Technical developers | 10-12 | 40-50 |

## Writing Rules
- Sentences: average 15-20 words
- Paragraphs: 2-4 sentences
- Use active voice (80%+ of sentences)
- One idea per paragraph
- Use bullet lists for 3+ items
- Define jargon on first use"""),
    ("content-distribution", "Content Distribution Channels", """## Owned Channels
- Website/blog
- Email newsletter
- Documentation portal
- Social media profiles

## Earned Channels
- Press coverage
- Guest posts
- Podcast appearances
- Community mentions

## Paid Channels
- Social media ads (→ ads-studio)
- Sponsored content
- PPC (→ marketing-studio)

## Distribution Checklist
1. Publish on primary platform
2. Create social variants for each platform
3. Include in next newsletter
4. Share in relevant communities
5. Internal distribution to sales team"""),
    ("content-metrics", "Content Performance Metrics", """## Blog Metrics
- Pageviews, unique visitors
- Time on page (target: > 3 min for long-form)
- Bounce rate (target: < 60%)
- Scroll depth (target: > 70%)
- Conversions from CTA

## Email Metrics
- Open rate (benchmark: 20-25%)
- Click-through rate (benchmark: 2-5%)
- Unsubscribe rate (target: < 0.5%)
- Conversion rate

## Social Metrics
- Engagement rate (likes, comments, shares)
- Reach/impressions
- Click-through rate
- Follower growth rate

## Content ROI
- Cost per piece (production time + tools)
- Revenue attributed to content
- Pipeline influenced by content"""),
]

for name, title, content in content_refs:
    write(f"content-studio/references/{name}.md", f"# {title}\n\n{content}")

# Content scripts
write("content-studio/scripts/readability_scorer.py", '''"""Readability Scoring — Flesch-Kincaid and Flesch Reading Ease."""

def count_syllables(word):
    """Estimate syllable count for a word."""
    word = word.lower().rstrip("e")
    count = 0
    vowels = "aeiou"
    prev_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    return max(1, count)

def analyze(text):
    """Calculate readability scores."""
    sentences = [s.strip() for s in text.replace("!", ".").replace("?", ".").split(".") if s.strip()]
    words = text.split()
    total_sentences = len(sentences)
    total_words = len(words)
    total_syllables = sum(count_syllables(w) for w in words)

    if total_sentences == 0 or total_words == 0:
        return {"error": "Text too short"}

    avg_sentence_length = total_words / total_sentences
    avg_syllables_per_word = total_syllables / total_words

    fk_grade = 0.39 * avg_sentence_length + 11.8 * avg_syllables_per_word - 15.59
    fre = 206.835 - 1.015 * avg_sentence_length - 84.6 * avg_syllables_per_word

    return {
        "words": total_words,
        "sentences": total_sentences,
        "avg_sentence_length": round(avg_sentence_length, 1),
        "flesch_kincaid_grade": round(fk_grade, 1),
        "flesch_reading_ease": round(fre, 1),
    }

if __name__ == "__main__":
    sample = "This is a simple test. Short sentences are easy to read. Long words make text harder."
    print(analyze(sample))
''')

write("content-studio/scripts/seo_checker.py", '''"""Basic SEO Checker — validates on-page SEO elements."""

def check_meta(title, description, keyword):
    """Check meta tag compliance."""
    issues = []
    if len(title) > 60:
        issues.append(f"Title too long: {len(title)} chars (max 60)")
    if len(title) < 30:
        issues.append(f"Title too short: {len(title)} chars (min 30)")
    if keyword.lower() not in title.lower():
        issues.append(f"Primary keyword '{keyword}' not in title")
    if len(description) > 155:
        issues.append(f"Description too long: {len(description)} chars (max 155)")
    if keyword.lower() not in description.lower():
        issues.append(f"Primary keyword '{keyword}' not in description")
    return {"passed": len(issues) == 0, "issues": issues}

if __name__ == "__main__":
    result = check_meta(
        "How to Build a FastAPI Application in 10 Minutes",
        "Learn how to build a production-ready FastAPI application with authentication, database, and Docker deployment.",
        "FastAPI"
    )
    print(f"Passed: {result['passed']}")
    for issue in result["issues"]:
        print(f"  - {issue}")
''')

write("content-studio/scripts/word_counter.py", '''"""Word Counter — analyzes content length and structure."""

def analyze(text):
    """Analyze text structure and word count."""
    lines = text.split("\\n")
    words = text.split()
    headers = [l for l in lines if l.startswith("#")]
    paragraphs = [p.strip() for p in text.split("\\n\\n") if p.strip() and not p.strip().startswith("#")]

    return {
        "total_words": len(words),
        "total_lines": len(lines),
        "headers": len(headers),
        "paragraphs": len(paragraphs),
        "avg_paragraph_words": round(len(words) / max(1, len(paragraphs)), 1),
        "estimated_read_time_min": round(len(words) / 250, 1),
    }

if __name__ == "__main__":
    sample = """# Test Article\\n\\nThis is the first paragraph with some words.\\n\\n## Section Two\\n\\nAnother paragraph here with different content."""
    print(analyze(sample))
''')

write("content-studio/scripts/headline_analyzer.py", '''"""Headline Analyzer — scores headlines for effectiveness."""

POWER_WORDS = {"free", "new", "proven", "secret", "instant", "guaranteed", "discover",
               "ultimate", "essential", "complete", "simple", "easy", "fast", "best",
               "top", "how", "why", "what", "guide", "tips", "ways", "steps"}

EMOTIONAL_WORDS = {"amazing", "incredible", "shocking", "surprising", "brilliant",
                   "powerful", "stunning", "remarkable", "extraordinary", "devastating"}

def analyze(headline):
    """Score a headline for effectiveness."""
    words = headline.lower().split()
    word_count = len(words)
    char_count = len(headline)

    power_count = sum(1 for w in words if w in POWER_WORDS)
    emotional_count = sum(1 for w in words if w in EMOTIONAL_WORDS)
    has_number = any(c.isdigit() for c in headline)

    score = 50  # base
    if 6 <= word_count <= 12: score += 15
    elif word_count < 6: score -= 10
    if char_count <= 60: score += 10
    if power_count > 0: score += min(power_count * 10, 20)
    if has_number: score += 10
    if headline.endswith("?"): score += 5

    return {
        "headline": headline,
        "word_count": word_count,
        "char_count": char_count,
        "power_words": power_count,
        "has_number": has_number,
        "score": min(100, score),
    }

if __name__ == "__main__":
    headlines = [
        "7 Proven Ways to Build a FastAPI App Fast",
        "Introduction to Our Product",
        "How to Double Your Revenue in 30 Days",
    ]
    for h in headlines:
        result = analyze(h)
        print(f"  Score: {result['score']}/100 — {h}")
''')

print("Content studio complete!")

# ============================================================
# MARKETING STUDIO
# ============================================================
print("\n=== MARKETING STUDIO ===")

write("marketing-studio/SKILL.md", """---
name: marketing-studio
description: "Marketing strategy and execution studio. Plans campaigns, manages funnels, optimizes conversion, and coordinates with content and ads studios for execution."
activation: "marketing, campaign, funnel, conversion, growth, acquisition, retention, GTM, go-to-market"
tier: 2
dependencies: [brand-studio, content-studio, research-studio]
---

# Marketing Studio — VP of Marketing

## Mission
Drive measurable growth through strategic marketing campaigns and funnel optimization.

## Team Roster
| Agent | File | Spawning | Primary Output |
|-------|------|----------|----------------|
| Marketing Strategist | agents/marketing-strategist.md | Inline | Campaign strategy |
| Growth Hacker | agents/growth-hacker.md | Subagent | Growth experiments |
| Funnel Optimizer | agents/funnel-optimizer.md | Subagent | Funnel analysis |
| Campaign Manager | agents/campaign-manager.md | Subagent | Campaign plans |
| Analytics Specialist | agents/analytics-specialist.md | Subagent | Performance reports |
| Conversion Copywriter | agents/conversion-copywriter.md | Subagent | High-converting copy |
| Event Marketer | agents/event-marketer.md | Inline | Event strategies |
| Marketing Reviewer | agents/marketing-reviewer.md | ALWAYS Subagent | Campaign audits |

## Pipeline
```
Objective → [Strategist: Plan] → [Campaign Mgr: Execute] → [Analytics: Measure] → [Review: Optimize]
```

## Spawning Rules
- **ALWAYS subagent:** marketing-reviewer (adversarial — campaign review must be independent)
- **ALWAYS inline:** marketing-strategist, event-marketer (short strategic output)
- **Context-dependent:** growth-hacker, funnel-optimizer, campaign-manager, analytics-specialist, conversion-copywriter (subagent for complex analysis)

## Budget
| Phase | Estimated Cost | Model |
|-------|---------------|-------|
| Strategy | $0.005 | haiku |
| Planning | $0.015 | sonnet |
| Execution assets | $0.020 | sonnet |
| Analysis | $0.010 | sonnet |
| Review | $0.010 | sonnet |
| **Total** | **$0.060** | — |

## Quality Gates
- **Campaign Alignment:** Campaign serves stated business objective
- **Budget Efficiency:** CAC within target range
- **Brand Compliance:** All marketing materials pass brand voice check
- **Measurement:** Every campaign has defined KPIs and tracking plan

## Integration Points
- Receives FROM research-studio: market data, competitor analysis
- Receives FROM brand-studio: brand guidelines, messaging
- Coordinates WITH content-studio: content creation for campaigns
- Coordinates WITH advertisement-studio: paid media execution
- Provides TO sales-studio: qualified leads, lead scoring

## Templates Available
| Template | File | When to Use | Tier |
|----------|------|-------------|------|
| Campaign Brief | templates/campaign-brief.md | New campaign | 1 |
| GTM Plan | templates/gtm-plan.md | Product launch | 2 |
| Funnel Map | templates/funnel-map.md | Funnel optimization | 1 |
| Growth Experiment | templates/growth-experiment.md | A/B test design | 1 |
| Campaign Report | templates/campaign-report.md | Performance review | 1 |
| Event Plan | templates/event-plan.md | Event marketing | 1 |
""")

mkt_agents = [
    ("marketing-strategist", "marketing-studio", "Marketing Strategist", "14 years in marketing strategy and GTM planning",
     "Marketing that cannot be measured cannot be improved",
     "Strategic, data-informed, ROI-focused",
     ["Go-to-market strategy development", "Marketing channel selection and prioritization", "Campaign strategy and objective setting", "Marketing budget allocation", "Competitive positioning in market"],
     ["Executing campaigns — REASON: strategist plans, team executes", "Spending budget without ROI justification — REASON: every dollar must be accountable"],
     ["Business objectives", "Market research from research-studio", "Budget constraints"],
     ["Marketing strategy document", "Channel priority matrix", "Campaign objectives with KPIs"],
     "Inline", "Strategic decisions are short structured output",
     ["Strategy ties to measurable business outcomes", "Channel selection justified with data", "KPIs defined for every objective", "Budget allocated by expected ROI"],
     ["If market data insufficient: request research from research-studio"]),
    ("growth-hacker", "marketing-studio", "Growth Hacker", "8 years in growth engineering and experimentation",
     "Growth is a system of experiments, not a series of hunches",
     "Experimental, metrics-obsessed, creative",
     ["Growth experiment design (hypothesis, test, measure)", "Viral loop and referral program design", "User activation and retention optimization", "Product-led growth strategy"],
     ["Running experiments without hypothesis — REASON: experiments need testable hypotheses", "Declaring winners without statistical significance — REASON: data must be valid"],
     ["Current growth metrics", "User behavior data", "Product capabilities"],
     ["Experiment designs with hypothesis and success criteria", "Growth model", "Referral program designs"],
     "Subagent", "Experiment design requires focused analytical context",
     ["Every experiment has testable hypothesis", "Success criteria defined before launch", "Sample size calculated for significance", "Rollback plan included"],
     ["If experiment impacts core product experience: coordinate with dev-studio"]),
    ("funnel-optimizer", "marketing-studio", "Funnel Optimizer", "9 years in conversion rate optimization",
     "A funnel is only as strong as its weakest stage",
     "Analytical, conversion-focused, data-driven",
     ["Funnel stage analysis and drop-off identification", "Conversion rate optimization (CRO) recommendations", "A/B test design for funnel stages", "Landing page optimization strategy"],
     ["Optimizing without baseline data — REASON: you must know current performance", "Changing multiple variables simultaneously — REASON: isolate variables to learn"],
     ["Funnel metrics (traffic, conversion rates per stage)", "Current page/flow designs"],
     ["Funnel analysis report", "CRO recommendations with priority", "A/B test designs"],
     "Subagent", "Funnel analysis requires focused examination of data",
     ["Biggest drop-off points identified", "Recommendations prioritized by impact", "A/B tests have clear hypothesis", "Expected improvement quantified"],
     ["If funnel data unavailable: recommend analytics setup first"]),
    ("campaign-manager", "marketing-studio", "Campaign Manager", "10 years in multi-channel campaign management",
     "A campaign without a timeline is a wish",
     "Organized, deadline-driven, detail-oriented",
     ["Campaign planning with timeline and milestones", "Multi-channel campaign coordination", "Campaign asset checklist management", "Launch coordination across teams"],
     ["Launching without all assets ready — REASON: incomplete campaigns underperform", "Skipping post-launch analysis — REASON: every campaign is a learning opportunity"],
     ["Campaign strategy from marketing-strategist", "Available channels and budget"],
     ["Campaign plan with timeline", "Asset checklist", "Launch coordination plan"],
     "Subagent", "Campaign planning requires focused coordination of many moving parts",
     ["Timeline is realistic with buffer", "All required assets listed", "Responsibilities assigned", "Success metrics defined"],
     ["If campaign spans multiple studios: coordinate through midas-framework"]),
    ("analytics-specialist", "marketing-studio", "Analytics Specialist", "7 years in marketing analytics and attribution",
     "Without data, you are just another person with an opinion",
     "Precise, insight-driven, visualization-focused",
     ["Campaign performance analysis", "Attribution modeling", "ROI calculation and reporting", "Audience segmentation analysis", "Predictive analytics for campaign planning"],
     ["Reporting vanity metrics without context — REASON: metrics need business meaning", "Drawing conclusions from small samples — REASON: statistical significance required"],
     ["Campaign data", "Business objectives", "Historical performance benchmarks"],
     ["Performance reports with insights", "Attribution analysis", "ROI calculations", "Optimization recommendations"],
     "Subagent", "Data analysis requires focused examination of metrics",
     ["Metrics tied to business outcomes", "Trends identified with context", "Recommendations are specific and actionable", "Comparisons include relevant benchmarks"],
     ["If data quality issues found: flag before analysis"]),
    ("conversion-copywriter", "marketing-studio", "Conversion Copywriter", "8 years in direct response and conversion copywriting",
     "The right words in the right place can change everything",
     "Persuasive, testing-oriented, results-focused",
     ["High-converting headlines and CTAs", "A/B test copy variants", "Email subject line optimization", "Ad copy for multiple platforms"],
     ["Writing without clear CTA — REASON: every piece must drive action", "Ignoring proven frameworks — REASON: AIDA, PAS, and similar frameworks work for a reason"],
     ["Campaign brief", "Target audience", "Current conversion rates"],
     ["Copy variants for testing", "Headline options", "CTA variations"],
     "Subagent", "Conversion copy requires focused creative context",
     ["Multiple variants provided for testing", "Each variant has distinct angle", "CTAs are specific and action-oriented", "Copy matches audience language"],
     ["If product positioning unclear: request from brand-studio"]),
    ("event-marketer", "marketing-studio", "Event Marketer", "7 years in event marketing and webinar production",
     "Events are the highest-touch marketing channel — make every touchpoint count",
     "Detail-oriented, engagement-focused, logistics-savvy",
     ["Event strategy and planning", "Webinar production planning", "Event promotion campaigns", "Post-event follow-up sequences"],
     ["Events without follow-up plans — REASON: the real ROI comes after the event", "Skipping rehearsals — REASON: preparation prevents embarrassment"],
     ["Event objectives", "Target audience", "Budget"],
     ["Event plan", "Promotion timeline", "Follow-up sequence"],
     "Inline", "Event planning is structured output",
     ["Event has clear objective and success metrics", "Promotion timeline starts 4+ weeks before event", "Follow-up plan defined", "Technical requirements documented"],
     ["If event requires cross-studio coordination: request orchestration from midas-framework"]),
    ("marketing-reviewer", "marketing-studio", "Marketing Reviewer", "12 years in marketing audit and optimization",
     "The best campaigns are the ones that got honest feedback before launch",
     "Critical, constructive, ROI-aware",
     ["Campaign plan review and critique", "Marketing material quality audit", "ROI projection validation", "Brand compliance verification"],
     ["Approving campaigns without measurable KPIs — REASON: unmeasured campaigns waste budget", "Being vague in feedback — REASON: specific feedback enables specific improvements"],
     ["Campaign plans, materials, or reports to review"],
     ["Review report with specific findings", "Improvement recommendations", "Risk assessment"],
     "ALWAYS Subagent", "Adversarial — marketing review must be independent with fresh context",
     ["Minimum 3 specific findings", "Each finding has remediation suggestion", "ROI projection validated or challenged", "Brand compliance verified"],
     ["If systemic marketing issues found: escalate to VP of Marketing"]),
]

for a in mkt_agents:
    write(f"marketing-studio/agents/{a[0]}.md", agent(*a))

# Marketing workflows
mkt_workflows = [
    ("campaign-launch-pipeline", "End-to-end campaign from strategy to launch and analysis", "$0.060",
     """## Phase 1: Strategy
### Agent: marketing-strategist (Inline)
Define campaign objective, audience, channels, KPIs.

## Phase 2: Planning
### Agent: campaign-manager (Subagent)
Create detailed timeline, asset list, responsibilities.

## Phase 3: Content
Coordinate with content-studio for campaign assets.
### Agent: conversion-copywriter (Subagent) for key conversion copy.

## Phase 4: Review
### Agent: marketing-reviewer (ALWAYS Subagent)
Audit campaign plan, materials, and projections.

## Phase 5: Launch & Analyze
### Agent: analytics-specialist (Subagent)
Track performance, report results, recommend optimizations."""),
    ("gtm-pipeline", "Go-to-market launch strategy", "$0.050",
     """## Phase 1: Market Analysis
Request market research from research-studio.

## Phase 2: Strategy
### Agent: marketing-strategist (Inline)
Positioning, channel strategy, launch timeline.

## Phase 3: Campaign Plan
### Agent: campaign-manager (Subagent)
Detailed launch plan with pre-launch, launch, post-launch phases.

## Phase 4: Review
### Agent: marketing-reviewer (ALWAYS Subagent)
GTM plan audit."""),
    ("funnel-optimization-pipeline", "Systematic funnel improvement", "$0.035",
     """## Phase 1: Analyze
### Agent: funnel-optimizer (Subagent)
Map current funnel, identify drop-off points.

## Phase 2: Hypothesize
### Agent: growth-hacker (Subagent)
Design experiments for top drop-off points.

## Phase 3: Copy
### Agent: conversion-copywriter (Subagent)
A/B test copy variants for key pages.

## Phase 4: Review
### Agent: marketing-reviewer (ALWAYS Subagent)
Validate experiment designs and statistical approach."""),
    ("growth-experiment-pipeline", "Rapid growth experimentation cycle", "$0.025",
     """## Phase 1: Ideate
### Agent: growth-hacker (Subagent)
Generate and prioritize experiment ideas using ICE scoring.

## Phase 2: Design
### Agent: growth-hacker (Subagent)
Detail top experiments: hypothesis, test, measure, success criteria.

## Phase 3: Review
### Agent: marketing-reviewer (ALWAYS Subagent)
Validate statistical approach and business impact."""),
    ("performance-review-pipeline", "Monthly/quarterly marketing performance analysis", "$0.020",
     """## Phase 1: Data Collection
### Agent: analytics-specialist (Subagent)
Gather metrics across all channels.

## Phase 2: Analysis
### Agent: analytics-specialist (Subagent)
Trend analysis, attribution, ROI calculations.

## Phase 3: Recommendations
### Agent: marketing-strategist (Inline)
Strategic adjustments based on data."""),
]

for name, desc, cost, phases in mkt_workflows:
    write(f"marketing-studio/workflows/{name}.md", f"""---
name: {name}
studio: marketing-studio
description: "{desc}"
estimated_cost: "{cost}"
---

# {name.replace('-', ' ').title()}

## Overview
{desc}

{phases}

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to VP of Marketing
- Budget exceeded: halt and report
""")

# Marketing templates
mkt_templates = [
    ("campaign-brief", "Campaign Brief", """## Campaign Name
[Descriptive name]

## Objective
[Specific, measurable goal — e.g., "Generate 500 qualified leads in 30 days"]

## Target Audience
- **Primary:** [description]
- **Secondary:** [description]

## Key Messages
1. [Primary message]
2. [Supporting message]
3. [Supporting message]

## Channels
| Channel | Role | Budget Allocation |
|---------|------|-------------------|
| [channel] | [primary/supporting] | [%] |

## Timeline
| Phase | Dates | Activities |
|-------|-------|------------|
| Pre-launch | [dates] | [activities] |
| Launch | [dates] | [activities] |
| Post-launch | [dates] | [activities] |

## KPIs
| Metric | Target | Measurement |
|--------|--------|-------------|
| [metric] | [target] | [how measured] |

## Budget
Total: $[amount]"""),
    ("gtm-plan", "Go-to-Market Plan", """## Product/Feature
[What we're launching]

## Market Opportunity
[TAM/SAM/SOM from research-studio]

## Positioning
- **For:** [target audience]
- **Who:** [need/pain point]
- **Our product is:** [category]
- **That:** [key benefit]
- **Unlike:** [competitor/alternative]
- **We:** [key differentiator]

## Launch Phases
### Phase 1: Pre-Launch (T-4 weeks)
- [ ] Internal alignment
- [ ] Beta testing
- [ ] Press/influencer outreach
- [ ] Content creation

### Phase 2: Launch (T-0)
- [ ] Product announcement
- [ ] Press release
- [ ] Email to existing users
- [ ] Social media campaign

### Phase 3: Post-Launch (T+1 to T+4 weeks)
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Iteration based on data

## Success Metrics
| Metric | 30-day target | 90-day target |
|--------|---------------|---------------|
| [metric] | [value] | [value] |"""),
    ("funnel-map", "Marketing Funnel Map", """## Funnel Overview

### Awareness → Interest
| Touchpoint | Current Rate | Target Rate | Gap |
|-----------|-------------|-------------|-----|
| [source → landing] | [%] | [%] | [%] |

### Interest → Consideration
| Touchpoint | Current Rate | Target Rate | Gap |
|-----------|-------------|-------------|-----|
| [landing → signup] | [%] | [%] | [%] |

### Consideration → Decision
| Touchpoint | Current Rate | Target Rate | Gap |
|-----------|-------------|-------------|-----|
| [signup → trial] | [%] | [%] | [%] |

### Decision → Action
| Touchpoint | Current Rate | Target Rate | Gap |
|-----------|-------------|-------------|-----|
| [trial → purchase] | [%] | [%] | [%] |

## Biggest Opportunities
1. [Stage with biggest drop-off]: [hypothesis for improvement]
2. [Stage]: [hypothesis]"""),
    ("growth-experiment", "Growth Experiment Design", """## Experiment: [Name]

### Hypothesis
If we [change], then [metric] will [improve/increase] by [amount] because [reasoning].

### ICE Score
- **Impact:** [1-10] — How much will this move the needle?
- **Confidence:** [1-10] — How sure are we this will work?
- **Ease:** [1-10] — How easy is this to implement?
- **Total:** [average]

### Test Design
- **Control:** [current state]
- **Variant:** [proposed change]
- **Metric:** [what we measure]
- **Duration:** [how long to run]
- **Sample size:** [minimum needed for significance]

### Success Criteria
- Primary: [metric] improves by [X]% with p < 0.05
- Secondary: [metric] does not decrease by more than [Y]%

### Rollback Plan
[How to revert if experiment causes harm]"""),
    ("campaign-report", "Campaign Performance Report", """## Campaign: [Name]
### Period: [Start] to [End]

## Executive Summary
[2-3 sentences: what happened, key results, next steps]

## KPI Results
| Metric | Target | Actual | vs Target |
|--------|--------|--------|-----------|
| [metric] | [value] | [value] | [+/-% ] |

## Channel Performance
| Channel | Spend | Results | CAC | ROI |
|---------|-------|---------|-----|-----|
| [channel] | $[x] | [results] | $[x] | [x]% |

## What Worked
1. [Insight with data]
2. [Insight with data]

## What Didn't Work
1. [Insight with data and hypothesis for why]

## Recommendations
1. [Specific recommendation for next campaign]
2. [Specific recommendation]"""),
    ("event-plan", "Event Marketing Plan", """## Event: [Name]
### Type: [Webinar / Conference / Workshop / Meetup]
### Date: [Date]

## Objective
[Specific goal — e.g., "Generate 200 registrations, 50% attendance rate"]

## Agenda
| Time | Activity | Speaker/Owner |
|------|----------|---------------|
| [time] | [activity] | [who] |

## Promotion Timeline
| Date | Channel | Action |
|------|---------|--------|
| T-4 weeks | Email | Save the date |
| T-2 weeks | Social | Detailed announcement |
| T-1 week | Email | Reminder with agenda |
| T-1 day | Email | Final reminder |

## Post-Event Follow-up
- Day 1: Thank you email + recording
- Day 3: Related content/resource
- Day 7: Conversion-focused CTA

## Success Metrics
| Metric | Target |
|--------|--------|
| Registrations | [number] |
| Attendance rate | [%] |
| Post-event conversions | [number] |"""),
]

for name, title, content in mkt_templates:
    write(f"marketing-studio/templates/{name}.md", f"# {title}\n\n{content}")

# Marketing references
mkt_refs = [
    ("marketing-channels", "Marketing Channel Guide", """## Digital Channels
| Channel | Best For | Typical CAC | Time to Results |
|---------|---------|-------------|-----------------|
| SEO/Content | Long-term organic traffic | $50-200 | 3-6 months |
| Email | Nurturing, retention | $10-50 | 1-2 weeks |
| Social Organic | Brand awareness | $0 (time) | 1-3 months |
| Social Paid | Targeting, awareness | $20-100 | Immediate |
| PPC/SEM | High-intent capture | $30-150 | Immediate |
| Referral | Word of mouth | $10-30 | 1-3 months |

## Channel Selection Framework
1. Where does the audience spend time?
2. What's the acquisition cost vs. LTV?
3. What's the time-to-impact?
4. Can we measure attribution?"""),
    ("conversion-frameworks", "Conversion Copywriting Frameworks", """## AIDA
- **Attention:** Hook with problem or opportunity
- **Interest:** Build curiosity with details
- **Desire:** Create emotional connection to solution
- **Action:** Clear, specific CTA

## PAS
- **Problem:** Describe the pain point
- **Agitate:** Make the problem feel urgent
- **Solution:** Present your solution

## BAB
- **Before:** Current state (pain)
- **After:** Desired state (pleasure)
- **Bridge:** How to get there (your solution)

## 4 Ps
- **Promise:** What you'll deliver
- **Picture:** Paint the outcome
- **Proof:** Evidence it works
- **Push:** CTA with urgency"""),
    ("metrics-glossary", "Marketing Metrics Glossary", """## Acquisition
- **CAC:** Customer Acquisition Cost = Total spend / New customers
- **CPA:** Cost Per Acquisition (any conversion)
- **CPL:** Cost Per Lead
- **CTR:** Click-Through Rate = Clicks / Impressions

## Revenue
- **LTV:** Lifetime Value = Avg revenue per customer × Avg lifespan
- **ROAS:** Return on Ad Spend = Revenue / Ad spend
- **ROI:** Return on Investment = (Revenue - Cost) / Cost

## Engagement
- **Bounce Rate:** Single-page visits / Total visits
- **Time on Site:** Average session duration
- **Pages per Session:** Avg pages viewed per visit

## Email
- **Open Rate:** Opens / Delivered
- **CTR:** Clicks / Opens
- **Unsubscribe Rate:** Unsubscribes / Delivered"""),
    ("ab-testing-guide", "A/B Testing Methodology", """## Test Design
1. Define ONE variable to test
2. State hypothesis before starting
3. Calculate required sample size
4. Run test for full duration (no peeking)
5. Analyze with proper statistical methods

## Sample Size
- Minimum: 100 conversions per variant
- For small effects: 1000+ per variant
- Duration: minimum 1 full business cycle (usually 1-2 weeks)

## Statistical Significance
- Target: p < 0.05 (95% confidence)
- Do NOT stop early when results look promising
- Account for multiple comparisons

## Common Mistakes
- Testing too many variables at once
- Stopping tests early
- Drawing conclusions from small samples
- Not accounting for seasonal effects"""),
    ("marketing-automation", "Marketing Automation Patterns", """## Lead Scoring
| Action | Points |
|--------|--------|
| Visit pricing page | +10 |
| Download resource | +5 |
| Open email | +1 |
| Click email link | +3 |
| Request demo | +20 |
| Unsubscribe | -50 |

## Automation Triggers
| Trigger | Action | Delay |
|---------|--------|-------|
| New signup | Welcome sequence | Immediate |
| Cart abandoned | Recovery email | 1 hour |
| Inactive 30 days | Re-engagement | Immediate |
| Score > 50 | Notify sales | Immediate |
| Trial ending | Upgrade sequence | 3 days before |

## Segmentation
- By behavior (active, dormant, churned)
- By stage (awareness, consideration, decision)
- By value (high LTV, low LTV)
- By source (organic, paid, referral)"""),
]

for name, title, content in mkt_refs:
    write(f"marketing-studio/references/{name}.md", f"# {title}\n\n{content}")

print("Marketing studio complete!")
print(f"\nTotal: content-studio + marketing-studio")
