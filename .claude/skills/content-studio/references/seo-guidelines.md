# SEO Guidelines

## What This Is
The definitive SEO reference for Content Studio. Contains on-page SEO rules, technical SEO requirements, keyword strategy principles, and content optimization guidelines. Used by SEO Optimizer and Blog Writer agents.

---

## On-Page SEO Rules

### Title Tags
- **Length:** 50-60 characters (Google truncates at ~60)
- **Keyword placement:** Primary keyword as close to the front as possible
- **Format options:**
  - `Primary Keyword: Compelling Descriptor` (e.g., "AI SaaS Architecture: Deterministic-First Design for 50x Savings")
  - `How to Primary Keyword + Benefit` (e.g., "How to Reduce AI API Costs by 50x Without Sacrificing Quality")
  - `Number + Primary Keyword + Promise` (e.g., "7 AI SaaS Architecture Patterns That Cut Costs by 50x")
- **Rules:**
  - Every page gets a unique title tag
  - Include a power word or number when natural (increases CTR)
  - Don't keyword-stuff the title (one primary keyword is enough)
  - Think of the title tag as an ad headline in search results — it must earn the click

### Meta Descriptions
- **Length:** 155-160 characters (truncated beyond this)
- **Must include:** Primary keyword (Google bolds matching terms), a compelling reason to click
- **Structure:** `[Value statement including keyword]. [Specific proof or promise]. [Implicit or explicit CTA]`
- **Example:** "Most AI SaaS products are too expensive to scale. Learn the deterministic-first architecture that reduced our per-user cost from $0.15 to $0.003."
- **Rules:**
  - Every page gets a unique meta description
  - Don't just summarize — sell the click
  - Include a number or specific result when possible
  - Avoid quotation marks in meta descriptions (HTML rendering issues)

### URL Structure
- **Format:** `domain.com/category/primary-keyword-slug`
- **Rules:**
  - Lowercase only
  - Hyphens between words (never underscores)
  - Short as possible while including the keyword (under 60 characters for slug)
  - No stop words unless part of the keyword ("a," "the," "and," "of," "to")
  - No dates in URLs (allows content refreshes without URL changes)
  - No special characters, spaces, or encoded characters

### Heading Structure
- **H1:** Exactly one per page. Includes the primary keyword. Is the article's visible title.
- **H2:** Major sections (3-7 per article). At least one includes a secondary keyword naturally.
- **H3:** Subsections under H2s. Used when a section has 2+ distinct subtopics.
- **H4-H6:** Rarely needed. Use only for deeply nested content (technical documentation).
- **Rules:**
  - Never skip levels (no H3 without a parent H2)
  - Headings should read as a table of contents (scannable structure)
  - Don't use headings for styling purposes (bold text is not a heading)

### Keyword Placement
| Location | Requirement | Priority |
|----------|------------|----------|
| Title tag | Primary keyword, near front | Required |
| H1 | Primary keyword | Required |
| First 100 words | Primary keyword, natural placement | Required |
| Meta description | Primary keyword | Required |
| URL slug | Primary keyword | Required |
| At least one H2 | Primary or secondary keyword | Strongly recommended |
| Image alt text | Primary or secondary keyword | Recommended |
| Last 100 words | Primary keyword | Recommended |
| Internal link anchor text | Secondary keywords | Recommended |

### Keyword Density
- **Target:** 0.5-2% for primary keyword (natural, not forced)
- **Test:** Read the content aloud. If a keyword sounds repeated or forced, reduce it.
- **Semantic variations:** Use synonyms, related terms, and natural language variations instead of repeating the exact keyword.
- **LSI keywords:** Include related terms that Google associates with your topic. For "AI SaaS architecture," related terms include: API cost, computation layer, caching, microservices, cost per user, scaling.

---

## Content Quality Signals

### E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- **Experience:** Show you've actually done what you're writing about. Real examples, real data, real projects.
- **Expertise:** Demonstrate deep knowledge. Use correct terminology. Cover edge cases and nuances.
- **Authoritativeness:** Build your domain presence. Author bios, consistent publishing, external citations.
- **Trustworthiness:** Cite sources. Acknowledge limitations. Be transparent about methodology.

### Content Depth
- Cover the topic more comprehensively than the current top 5 results
- Answer "People Also Ask" questions within the article
- Include original data, unique insights, or first-hand experience
- Don't pad with fluff — depth means completeness, not wordiness

### Readability
- **Flesch-Kincaid Grade Level:** 8-10 for general content, up to 12 for technical
- **Sentence length:** Average 15-20 words (mix short punchy sentences with longer explanatory ones)
- **Paragraph length:** 2-4 sentences (mobile readability)
- **Passive voice:** Under 10% of sentences
- **Transition words:** Use them to connect ideas (however, therefore, additionally, in contrast)

---

## Technical SEO Essentials

### Page Speed
- Target: under 3 seconds for full page load
- Core Web Vitals:
  - **LCP (Largest Contentful Paint):** Under 2.5 seconds
  - **INP (Interaction to Next Paint):** Under 200 milliseconds
  - **CLS (Cumulative Layout Shift):** Under 0.1
- Common fixes: compress images, lazy-load below-fold images, minimize CSS/JS, use CDN

### Mobile Optimization
- All content must be fully responsive
- Test on actual mobile viewports (not just browser resize)
- Touch targets: buttons and links must be at least 44x44 pixels
- No horizontal scrolling
- Text readable without zooming (minimum 16px font)

### Structured Data / Schema Markup
| Content Type | Schema Type | Key Properties |
|-------------|-------------|----------------|
| Blog post | Article or TechArticle | headline, author, datePublished, description, publisher |
| How-to content | HowTo | name, step (with HowToStep items), description |
| FAQ content | FAQPage | mainEntity with Question and acceptedAnswer items |
| Product page | Product | name, description, offers, review, aggregateRating |
| Organization | Organization | name, url, logo, contactPoint |

- Always use JSON-LD format (Google's preferred implementation)
- Validate with Google's Rich Results Test before publishing
- Don't add schema that doesn't match the content (Google penalizes misuse)

### Internal Linking Strategy
- **Hub and spoke model:** Create pillar pages (hubs) that link to detailed topic pages (spokes), and vice versa
- **Contextual links:** Place internal links within relevant content paragraphs, not just in sidebars or footers
- **Anchor text:** Use keyword-rich, descriptive anchor text. "AI SaaS architecture guide" is better than "click here."
- **Link depth:** Every important page should be reachable within 3 clicks from the homepage
- **Orphan pages:** No page should exist without at least one internal link pointing to it
- **Reciprocal linking:** When creating a new page, identify 3-5 existing pages that should link to it, and add those links

### Canonical Tags
- Every page should have a self-referencing canonical tag
- If content exists at multiple URLs, the canonical points to the preferred version
- Syndicated content (published on both your blog and LinkedIn) should have canonical on your domain

---

## Keyword Research Framework

### Keyword Selection Criteria
| Factor | What to Check | Target |
|--------|--------------|--------|
| Search volume | Monthly searches | >100 for long-tail, >500 for head terms |
| Keyword difficulty | Competition level | Under 40 for new sites, under 60 for established |
| Search intent | What the searcher wants | Must match your content format |
| Business relevance | Does it attract your target customer? | High relevance to product/service |
| Content gap | Can you add unique value vs. existing results? | Must have a differentiated angle |

### Search Intent Types
| Intent | User Wants | Content Format | Example Query |
|--------|-----------|----------------|---------------|
| Informational | Learn something | Guide, tutorial, explainer, blog post | "how to reduce AI API costs" |
| Commercial | Compare options | Comparison, review, "best of" list | "best AI architecture patterns" |
| Transactional | Buy or sign up | Product page, pricing page, landing page | "AI architecture consulting" |
| Navigational | Find a specific page | Homepage, brand page | "MDS AI studio" |

### Keyword Clustering
Group related keywords into clusters that can be served by a single comprehensive page:
- Primary keyword: "AI SaaS architecture" (the page's main target)
- Cluster keywords: "AI cost optimization," "reduce AI API costs," "deterministic AI architecture," "AI product architecture patterns"
- Each cluster gets ONE page. Multiple pages targeting the same cluster = keyword cannibalization.

---

## Content Refresh Strategy

### When to Refresh
- Page has dropped 10+ positions in the last 90 days
- Content is factually outdated (old statistics, deprecated technologies)
- Competitors have published more comprehensive content on the same topic
- Page has high impressions but low CTR (title/meta need updating)
- New internal pages exist that should be linked from this content

### How to Refresh
1. Update outdated statistics and examples
2. Add new sections addressing gaps (check "People Also Ask" for ideas)
3. Improve the title tag and meta description (test for CTR improvement)
4. Add internal links to newer related content
5. Update the publish date to reflect the refresh
6. Resubmit to Google Search Console for re-indexing
