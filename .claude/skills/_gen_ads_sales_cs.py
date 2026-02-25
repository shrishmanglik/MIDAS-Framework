"""MIDAS v3.0 — Advertisement, Sales, Client Success Studios Generator"""
import os, sys
BASE = r"F:\Million Dollar AI Studio\Framework\.claude\skills"
# Reuse helpers from _generator.py by importing directly
sys.path.insert(0, BASE)

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
# ADVERTISEMENT STUDIO
# ============================================================
print("=== ADVERTISEMENT STUDIO ===")

write("advertisement-studio/SKILL.md", """---
name: advertisement-studio
description: "Paid advertising studio. Creates and optimizes ad campaigns across Google, Meta, LinkedIn, and other platforms. Manages creative, targeting, and bid strategy."
activation: "ad, advertisement, PPC, Google Ads, Meta Ads, LinkedIn Ads, paid media, retargeting, display ads"
tier: 2
dependencies: [brand-studio, marketing-studio, content-studio]
---

# Advertisement Studio — VP of Advertising

## Mission
Maximize ROAS through data-driven paid advertising across all platforms.

## Team Roster
| Agent | File | Spawning | Primary Output |
|-------|------|----------|----------------|
| Ad Strategist | agents/ad-strategist.md | Inline | Campaign strategy, targeting |
| Creative Director | agents/ad-creative-director.md | Subagent | Ad creative briefs |
| Copywriter | agents/ad-copywriter.md | Subagent | Ad copy variants |
| Media Buyer | agents/media-buyer.md | Subagent | Bid strategy, budget allocation |
| Analytics Lead | agents/ad-analytics-lead.md | Subagent | Performance analysis |
| Platform Specialist | agents/platform-specialist.md | Subagent | Platform-specific configs |
| Ad Reviewer | agents/ad-reviewer.md | ALWAYS Subagent | Creative and compliance audit |

## Pipeline
```
Brief → [Strategist: Target] → [Creative: Design] → [Copywriter: Write]
  → [Media Buyer: Budget] → [Reviewer: Audit] → [Analytics: Optimize]
```

## Spawning Rules
- **ALWAYS subagent:** ad-reviewer (adversarial — ad compliance must be independently verified)
- **ALWAYS inline:** ad-strategist (short strategic output)
- **Context-dependent:** all others (subagent for creative/analytical work)

## Budget
| Phase | Estimated Cost | Model |
|-------|---------------|-------|
| Strategy | $0.005 | haiku |
| Creative | $0.020 | sonnet |
| Copy | $0.015 | sonnet |
| Media Planning | $0.010 | sonnet |
| Review | $0.010 | sonnet |
| **Total** | **$0.060** | — |

## Quality Gates
- **Brand Compliance:** All ads follow brand guidelines
- **Platform Compliance:** Ads meet platform-specific requirements
- **Performance:** Targeting is specific and relevant
- **Budget:** Bid strategy aligned with ROAS targets

## Integration Points
- Receives FROM brand-studio: brand guidelines, visual standards
- Receives FROM marketing-studio: campaign strategy, audience segments
- Receives FROM content-studio: content assets for ad creative
- Provides TO marketing-studio: ad performance data for attribution

## Templates Available
| Template | File | When to Use | Tier |
|----------|------|-------------|------|
| Ad Campaign Brief | templates/ad-campaign-brief.md | New ad campaign | 1 |
| Ad Copy Matrix | templates/ad-copy-matrix.md | Multi-variant ad copy | 1 |
| Platform Config | templates/platform-config.md | Platform setup | 1 |
| Performance Report | templates/ad-performance-report.md | Campaign analysis | 1 |
| Retargeting Plan | templates/retargeting-plan.md | Retargeting setup | 1 |
""")

ads_agents = [
    ("ad-strategist", "advertisement-studio", "Ad Strategist", "11 years in paid media strategy",
     "Every ad dollar should work harder than the last",
     "Data-driven, ROI-focused, audience-centric",
     ["Campaign objective setting and KPI definition", "Audience targeting strategy", "Channel mix optimization", "Budget allocation across platforms"],
     ["Spending without clear ROAS target — REASON: every dollar must be accountable", "Broad targeting without justification — REASON: specificity drives efficiency"],
     ["Marketing strategy from marketing-studio", "Budget constraints", "Target audience profiles"],
     ["Ad campaign strategy", "Targeting specifications", "Channel and budget allocation"],
     "Inline", "Strategic decisions are short structured output",
     ["ROAS target defined", "Audience targeting is specific", "Budget allocation justified", "Platform selection matches audience behavior"],
     ["If ROAS targets unrealistic: escalate to marketing-studio for strategy review"]),
    ("ad-creative-director", "advertisement-studio", "Ad Creative Director", "10 years in advertising creative direction",
     "Great ads are remembered; the best ads are acted upon",
     "Visual, concept-driven, format-aware",
     ["Ad creative concept development", "Visual direction for display/video ads", "A/B test creative variants", "Platform-specific format optimization"],
     ["Ignoring platform specs — REASON: ads must meet platform size/format requirements", "All text, no visual — REASON: visual elements drive engagement"],
     ["Campaign strategy", "Brand guidelines from brand-studio", "Platform specifications"],
     ["Creative briefs with visual direction", "Format specifications per platform", "Creative test variants"],
     "Subagent", "Creative concepting benefits from focused context",
     ["Creative matches brand guidelines", "Format meets platform specs", "Multiple variants for testing", "Clear visual hierarchy with CTA prominent"],
     ["If creative direction conflicts with brand guidelines: escalate to brand-studio"]),
    ("ad-copywriter", "advertisement-studio", "Ad Copywriter", "8 years in direct response ad copywriting",
     "In ads, every character counts — literally",
     "Concise, action-oriented, platform-native",
     ["Ad headline writing within character limits", "Body copy for various ad formats", "CTA optimization", "A/B test copy variants"],
     ["Exceeding character limits — REASON: truncated ads fail", "Generic CTAs — REASON: specific CTAs convert higher"],
     ["Campaign brief", "Target audience", "Platform character limits"],
     ["Ad copy variants organized by platform", "Headline/body/CTA combinations"],
     "Subagent", "Creative copywriting benefits from focused context",
     ["All copy within platform character limits", "CTAs are specific and action-oriented", "Copy matches audience language", "Multiple variants provided for testing"],
     ["If messaging unclear: request clarification from brand-studio"]),
    ("media-buyer", "advertisement-studio", "Media Buyer", "9 years in programmatic and platform media buying",
     "The best media buy is the one that gets the right message to the right person at the right time for the right price",
     "Analytical, bid-strategy-focused, efficiency-obsessed",
     ["Bid strategy development", "Budget pacing and allocation", "Audience segment bidding", "Placement optimization", "Dayparting strategy"],
     ["Overbidding without data — REASON: start conservative, optimize with data", "Ignoring frequency caps — REASON: ad fatigue kills campaigns"],
     ["Campaign strategy", "Target audience", "Budget constraints", "Historical performance data"],
     ["Bid strategy document", "Budget allocation plan", "Frequency and pacing settings"],
     "Subagent", "Media planning requires focused analytical context",
     ["Bid strategy has rationale", "Frequency caps set", "Budget pacing accounts for campaign duration", "Dayparting matches audience behavior"],
     ["If budget insufficient for stated objectives: flag to ad-strategist"]),
    ("ad-analytics-lead", "advertisement-studio", "Ad Analytics Lead", "8 years in advertising analytics and attribution",
     "Data tells you what happened; analysis tells you what to do next",
     "Metrics-driven, insight-focused, optimization-oriented",
     ["Campaign performance reporting", "ROAS calculation and analysis", "Attribution modeling for multi-touch", "Audience performance segmentation", "Creative performance analysis"],
     ["Reporting without insights — REASON: data without recommendations is useless", "Single-touch attribution only — REASON: consider the full customer journey"],
     ["Campaign performance data", "Conversion data", "Cost data"],
     ["Performance reports with insights", "ROAS analysis", "Optimization recommendations"],
     "Subagent", "Performance analysis requires focused data examination",
     ["ROAS calculated accurately", "Top and bottom performers identified", "Specific optimization recommendations provided", "Trends identified with context"],
     ["If performance significantly below target: alert ad-strategist immediately"]),
    ("platform-specialist", "advertisement-studio", "Platform Specialist", "7 years in multi-platform ad management",
     "Each platform is its own ecosystem — respect the native experience",
     "Platform-native, technically precise, compliance-aware",
     ["Google Ads campaign configuration", "Meta Ads setup and optimization", "LinkedIn Ads targeting", "Platform-specific audience creation", "Pixel and conversion tracking setup"],
     ["Copy-pasting across platforms — REASON: each platform has unique requirements", "Ignoring platform policies — REASON: policy violations waste budget"],
     ["Campaign strategy", "Creative assets", "Targeting parameters"],
     ["Platform-specific campaign configurations", "Tracking setup instructions", "Platform compliance checklist"],
     "Subagent", "Platform configuration requires focused attention to specs",
     ["Configuration matches platform best practices", "Tracking properly set up", "Compliance with platform policies verified", "All required assets and formats provided"],
     ["If platform policy change affects campaigns: alert ad-strategist"]),
    ("ad-reviewer", "advertisement-studio", "Ad Reviewer", "10 years in advertising compliance and quality assurance",
     "A rejected ad is a wasted opportunity and a wasted budget",
     "Compliance-focused, detail-oriented, policy-aware",
     ["Ad creative compliance review", "Platform policy compliance checking", "Brand guideline adherence verification", "Legal disclaimer verification", "Competitor claim validation"],
     ["Approving non-compliant ads — REASON: rejected ads waste time and budget", "Ignoring platform-specific rules — REASON: each platform has unique policies"],
     ["Ad creative and copy to review", "Platform policies", "Brand guidelines"],
     ["Compliance audit report", "Specific violation findings", "Remediation instructions"],
     "ALWAYS Subagent", "Adversarial — ad compliance must be independently verified",
     ["Platform policies checked for each target platform", "Brand guidelines compliance verified", "Legal disclaimers present where required", "Claims are substantiated"],
     ["If legal issues found: escalate to legal-studio"]),
]

for a in ads_agents:
    write(f"advertisement-studio/agents/{a[0]}.md", agent(*a))

# Ads workflows
for name, desc, cost, phases in [
    ("ad-campaign-pipeline", "End-to-end ad campaign from strategy to optimization", "$0.060",
     """## Phase 1: Strategy
### Agent: ad-strategist (Inline)
Define objectives, targeting, channel mix, KPIs.

## Phase 2: Creative
### Agent: ad-creative-director (Subagent)
Develop creative concepts, format specs.
### Agent: ad-copywriter (Subagent)
Write ad copy variants per platform.

## Phase 3: Media Planning
### Agent: media-buyer (Subagent)
Bid strategy, budget pacing, frequency settings.

## Phase 4: Configuration
### Agent: platform-specialist (Subagent)
Platform-specific campaign setup.

## Phase 5: Review
### Agent: ad-reviewer (ALWAYS Subagent)
Compliance audit across all platforms.

## Phase 6: Optimize
### Agent: ad-analytics-lead (Subagent)
Monitor, analyze, recommend optimizations."""),
    ("retargeting-pipeline", "Retargeting campaign setup and optimization", "$0.030",
     """## Phase 1: Audience Definition
### Agent: ad-strategist (Inline)
Define retargeting segments and exclusions.

## Phase 2: Creative
### Agent: ad-copywriter (Subagent)
Personalized copy for each retargeting segment.

## Phase 3: Setup
### Agent: platform-specialist (Subagent)
Pixel configuration, audience creation, campaign setup.

## Phase 4: Review
### Agent: ad-reviewer (ALWAYS Subagent)
Privacy compliance, frequency caps, audience overlap check."""),
    ("creative-testing-pipeline", "Systematic creative A/B testing", "$0.025",
     """## Phase 1: Hypothesis
### Agent: ad-analytics-lead (Subagent)
Analyze current creative performance, identify test opportunities.

## Phase 2: Variants
### Agent: ad-creative-director (Subagent)
Design test variants (headline, image, CTA variations).
### Agent: ad-copywriter (Subagent)
Write copy variants.

## Phase 3: Review
### Agent: ad-reviewer (ALWAYS Subagent)
Verify all variants meet compliance.

## Phase 4: Analyze
### Agent: ad-analytics-lead (Subagent)
Statistical analysis of test results."""),
]:
    write(f"advertisement-studio/workflows/{name}.md", f"""---
name: {name}
studio: advertisement-studio
description: "{desc}"
estimated_cost: "{cost}"
---

# {name.replace('-', ' ').title()}

## Overview
{desc}

{phases}

## Error Recovery
- Phase failure: retry with adjusted parameters, escalate to VP of Advertising
- Budget exceeded: pause campaigns and report
""")

# Ads templates
for name, title, content in [
    ("ad-campaign-brief", "Ad Campaign Brief", """## Campaign Name
[Name]

## Objective
- **Goal:** [Awareness / Traffic / Leads / Sales]
- **KPI:** [Specific metric and target]
- **ROAS Target:** [X:1]

## Audience
| Segment | Demographics | Interests | Behavior |
|---------|-------------|-----------|----------|
| Primary | [details] | [details] | [details] |
| Secondary | [details] | [details] | [details] |

## Platforms
| Platform | Format | Budget % | Objective |
|----------|--------|----------|-----------|
| Google | Search + Display | [%] | [goal] |
| Meta | Feed + Stories | [%] | [goal] |
| LinkedIn | Sponsored Content | [%] | [goal] |

## Budget
- **Total:** $[amount]
- **Duration:** [timeframe]
- **Daily cap:** $[amount]

## Creative Requirements
- Headline variants: minimum 3
- Image/video sizes: [platform-specific]
- CTA variants: minimum 2"""),
    ("ad-copy-matrix", "Ad Copy Matrix", """## Platform: [Name]

### Headlines (character limit: [X])
| Variant | Headline | Angle |
|---------|----------|-------|
| A | [headline] | Value prop |
| B | [headline] | Pain point |
| C | [headline] | Social proof |

### Body Copy (character limit: [X])
| Variant | Body | CTA |
|---------|------|-----|
| A | [copy] | [CTA] |
| B | [copy] | [CTA] |

### Sitelinks / Extensions
| Text | URL | Description |
|------|-----|-------------|
| [link text] | [URL] | [description] |"""),
    ("platform-config", "Platform Configuration Template", """## Platform: [Google Ads / Meta / LinkedIn]

### Campaign Settings
- **Objective:** [campaign objective]
- **Bid Strategy:** [manual CPC / target CPA / maximize conversions]
- **Budget:** $[daily] / day
- **Schedule:** [start] to [end]
- **Dayparting:** [hours]

### Targeting
- **Location:** [geo targets]
- **Language:** [languages]
- **Audience:** [custom/lookalike/interest segments]
- **Exclusions:** [negative audiences]

### Ad Formats
| Format | Size | Specs |
|--------|------|-------|
| [format] | [dimensions] | [requirements] |

### Tracking
- **Pixel:** [installed / needs setup]
- **Conversions:** [events to track]
- **UTM Parameters:** [template]"""),
    ("ad-performance-report", "Ad Performance Report", """## Campaign: [Name]
### Period: [Start] — [End]

## Summary
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Impressions | [target] | [actual] | [on/off track] |
| Clicks | [target] | [actual] | |
| CTR | [target]% | [actual]% | |
| Conversions | [target] | [actual] | |
| CPA | $[target] | $[actual] | |
| ROAS | [target]:1 | [actual]:1 | |
| Spend | $[budget] | $[actual] | |

## Top Performers
| Creative/Keyword | Impressions | CTR | Conversions | CPA |
|-----------------|-------------|-----|-------------|-----|
| [top 1] | [data] | | | |

## Recommendations
1. [Specific optimization with expected impact]
2. [Specific optimization]"""),
    ("retargeting-plan", "Retargeting Plan", """## Segments
| Segment | Definition | Window | Priority |
|---------|-----------|--------|----------|
| Cart abandoners | Added to cart, no purchase | 7 days | High |
| Page viewers | Visited key pages | 14 days | Medium |
| Past customers | Previous purchasers | 90 days | Medium |
| Engaged users | 3+ page views | 30 days | Low |

## Exclusions
- Recent converters (7-day window)
- Existing subscribers (if objective is new leads)

## Creative Strategy
| Segment | Message | CTA | Offer |
|---------|---------|-----|-------|
| Cart abandoners | Complete your purchase | Buy Now | 10% off |
| Page viewers | Still interested? | Learn More | Free trial |

## Frequency Caps
- Maximum: 3 impressions/day per user
- Maximum: 15 impressions/week per user"""),
]:
    write(f"advertisement-studio/templates/{name}.md", f"# {title}\n\n{content}")

# Ads references
for name, title, content in [
    ("platform-specs", "Ad Platform Specifications", """## Google Ads
### Search
- Headline: 30 chars × 3
- Description: 90 chars × 2
- Display URL: 15 chars × 2 paths

### Display
- Responsive: multiple sizes auto-generated
- Image: 1200×628 (landscape), 1200×1200 (square)
- File size: max 5MB

## Meta (Facebook/Instagram)
### Feed
- Image: 1080×1080 (square), 1200×628 (landscape)
- Video: 1:1 or 4:5 ratio
- Primary text: 125 chars (recommended)
- Headline: 40 chars

### Stories
- Image/Video: 1080×1920 (9:16)
- Duration: up to 15 seconds

## LinkedIn
### Sponsored Content
- Image: 1200×627
- Headline: 70 chars
- Intro text: 150 chars
- CTA: dropdown selection"""),
    ("bidding-strategies", "Bidding Strategy Guide", """## Strategy Selection
| Goal | Strategy | When to Use |
|------|----------|-------------|
| Brand awareness | CPM/Reach | New product launch |
| Traffic | Max clicks | Content promotion |
| Leads | Target CPA | Lead generation |
| Sales | Target ROAS | E-commerce |
| Conversions | Max conversions | Limited budget |

## Budget Pacing
- Start: 50% of target CPA for learning phase
- Ramp: Increase 20% every 3 days based on performance
- Steady: Maintain within 10% of target CPA
- Scale: Increase budget 20% when ROAS exceeds target by 20%+"""),
    ("audience-targeting", "Audience Targeting Reference", """## Targeting Types
| Type | Description | Best For |
|------|-------------|---------|
| Demographic | Age, gender, income | Broad reach |
| Interest | Topics, behaviors | Awareness |
| In-market | Active purchase intent | Conversions |
| Custom | Your data (emails, visitors) | Retargeting |
| Lookalike | Similar to your customers | Expansion |

## Audience Layering
1. Start broad with core demographic
2. Layer interests for relevance
3. Narrow with behaviors for intent
4. Exclude converted users
5. Create lookalikes from best customers"""),
    ("ad-compliance", "Advertising Compliance Guide", """## Universal Rules
- No false or misleading claims
- Substantiate all specific claims (numbers, percentages)
- Include required disclaimers (financial, health, legal)
- No discriminatory targeting
- Respect privacy regulations (GDPR, CCPA)

## Platform-Specific
### Google
- No trademarked terms in ad text (without authorization)
- No excessive capitalization
- No symbols to attract attention

### Meta
- Text-on-image: minimize (< 20% recommended)
- No before/after images (health/fitness)
- No personal attributes in ad copy ("Are you overweight?")

### LinkedIn
- Professional tone required
- No personal attacks or controversial content
- Job ads must comply with employment laws"""),
    ("creative-best-practices", "Ad Creative Best Practices", """## Visual
- Single focal point
- Brand colors prominent
- Product in use (not isolated)
- Human faces increase engagement
- Mobile-optimized (large text, simple layout)

## Copy
- Lead with benefit, not feature
- Include social proof where possible
- Create urgency without being deceptive
- Match landing page message to ad message
- Test emotional vs. rational angles

## CTA
- Be specific: "Get Your Free Trial" > "Learn More"
- Create urgency: "Start Today" > "Sign Up"
- Reduce friction: "No Credit Card Required"
- Match intent: awareness = "Learn", conversion = "Buy"

## Testing Priority
1. Headline (highest impact)
2. Image/video (second highest)
3. CTA (third)
4. Body copy (lowest individual impact)"""),
]:
    write(f"advertisement-studio/references/{name}.md", f"# {title}\n\n{content}")

print("Advertisement studio complete!")

# ============================================================
# SALES STUDIO
# ============================================================
print("\n=== SALES STUDIO ===")

write("sales-studio/SKILL.md", """---
name: sales-studio
description: "Sales enablement studio. Creates proposals, pitch decks, objection handling, and sales materials. Supports the sales process from prospecting to close."
activation: "sales, proposal, pitch, quote, deal, prospect, objection handling, sales deck, pricing"
tier: 2
dependencies: [brand-studio, research-studio, marketing-studio]
---

# Sales Studio — VP of Sales

## Mission
Equip sales teams with compelling, data-backed materials that close deals.

## Team Roster
| Agent | File | Spawning | Primary Output |
|-------|------|----------|----------------|
| Sales Strategist | agents/sales-strategist.md | Inline | Sales strategy, qualifying criteria |
| Proposal Writer | agents/proposal-writer.md | Subagent | Custom proposals |
| Pitch Deck Creator | agents/pitch-deck-creator.md | Subagent | Presentation decks |
| Objection Handler | agents/objection-handler.md | Inline | Objection responses |
| Pricing Analyst | agents/pricing-analyst.md | Subagent | Pricing models |
| Sales Enablement Lead | agents/sales-enablement-lead.md | Subagent | Battle cards, one-pagers |
| Proposal Reviewer | agents/proposal-reviewer.md | ALWAYS Subagent | Proposal quality audit |

## Pipeline
```
Opportunity → [Strategist: Qualify] → [Writer: Propose] → [Reviewer: Audit] → Deliver
```

## Spawning Rules
- **ALWAYS subagent:** proposal-reviewer (adversarial — proposals must be independently reviewed)
- **ALWAYS inline:** sales-strategist, objection-handler (short strategic output)
- **Context-dependent:** proposal-writer, pitch-deck-creator, pricing-analyst, sales-enablement-lead (subagent for creative/analytical work)

## Budget
| Phase | Estimated Cost | Model |
|-------|---------------|-------|
| Strategy | $0.005 | haiku |
| Proposal | $0.030 | sonnet |
| Review | $0.010 | sonnet |
| **Total** | **$0.045** | — |

## Quality Gates
- **Accuracy:** All claims match product capabilities
- **Brand Compliance:** Materials follow brand guidelines
- **Pricing:** All pricing approved and current
- **Personalization:** Materials customized to prospect

## Integration Points
- Receives FROM marketing-studio: lead data, campaign performance
- Receives FROM research-studio: competitor analysis, market data
- Receives FROM brand-studio: brand guidelines, messaging
- Provides TO client-success-studio: deal context for onboarding

## Templates Available
| Template | File | When to Use | Tier |
|----------|------|-------------|------|
| Proposal | templates/proposal.md | Custom proposal | 2 |
| Pitch Deck | templates/pitch-deck.md | Sales presentation | 2 |
| Battle Card | templates/battle-card.md | Competitive selling | 1 |
| One-Pager | templates/one-pager.md | Quick overview | 1 |
| Pricing Sheet | templates/pricing-sheet.md | Pricing presentation | 1 |
| Objection Guide | templates/objection-guide.md | Objection handling | 1 |
""")

sales_agents = [
    ("sales-strategist", "sales-studio", "Sales Strategist", "13 years in B2B sales strategy",
     "Qualify hard, sell easy — the best deals are won before the pitch",
     "Strategic, qualification-focused, data-informed",
     ["Lead qualification using BANT/MEDDIC frameworks", "Sales process design and optimization", "Win/loss analysis and pattern identification", "Territory and account strategy"],
     ["Pushing unqualified deals — REASON: bad-fit customers cost more than they pay", "Discounting without strategy — REASON: discounts set expectations"],
     ["Lead information", "Market data from research-studio", "Historical win/loss data"],
     ["Qualification assessment", "Sales strategy document", "Account plan"],
     "Inline", "Strategic assessment is short structured output",
     ["Qualification criteria clearly applied", "Deal risk factors identified", "Next steps are specific and actionable"],
     ["If deal risk too high: recommend disqualification with rationale"]),
    ("proposal-writer", "sales-studio", "Proposal Writer", "9 years in B2B proposal writing",
     "A proposal should feel like the prospect wrote it themselves",
     "Persuasive, prospect-centric, ROI-focused",
     ["Custom proposal writing tailored to prospect needs", "Executive summary creation", "ROI and business case development", "Scope of work definition", "Timeline and milestone planning"],
     ["Generic template proposals — REASON: personalization drives win rates", "Overselling capabilities — REASON: promises must match delivery"],
     ["Prospect information", "Product/service details", "Pricing from pricing-analyst"],
     ["Custom proposal document (templates/proposal.md)", "Executive summary"],
     "Subagent", "Proposal writing benefits from focused context with prospect details",
     ["Proposal addresses prospect's specific pain points", "ROI calculations are realistic and sourced", "Scope is clear with no ambiguity", "Timeline is realistic"],
     ["If prospect needs not clearly understood: request discovery information"]),
    ("pitch-deck-creator", "sales-studio", "Pitch Deck Creator", "8 years in presentation design and storytelling",
     "A pitch deck is a story, not a spec sheet",
     "Visual, narrative-driven, audience-aware",
     ["Pitch deck structure and flow", "Slide content with speaking notes", "Visual layout recommendations", "Story arc from problem to solution"],
     ["Text-heavy slides — REASON: slides support the speaker, not replace them", "Feature lists without benefits — REASON: prospects buy outcomes, not features"],
     ["Prospect information", "Product/service value proposition", "Brand guidelines"],
     ["Pitch deck outline with slide content", "Speaking notes per slide"],
     "Subagent", "Deck creation benefits from focused narrative context",
     ["Story arc from problem to solution is clear", "Each slide has one key message", "Visual recommendations follow brand", "Speaking notes complement slide content"],
     ["If technical demo needed: coordinate with dev-studio"]),
    ("objection-handler", "sales-studio", "Objection Handler", "10 years in consultative selling and objection management",
     "Objections are buying signals in disguise",
     "Empathetic, framework-driven, evidence-based",
     ["Objection response development using Feel-Felt-Found", "Competitive objection handling", "Price objection reframing", "Risk objection mitigation"],
     ["Dismissing objections — REASON: every objection deserves a thoughtful response", "Making up competitive claims — REASON: only use verified information"],
     ["Common objections", "Competitor information from research-studio", "Product capabilities"],
     ["Objection response guide (templates/objection-guide.md)", "Competitive battle card content"],
     "Inline", "Objection responses are short structured output",
     ["Each response acknowledges the concern", "Evidence supports the response", "Competitive claims are verified", "Response includes proof points"],
     ["If objection reveals genuine product gap: report to product team via midas-framework"]),
    ("pricing-analyst", "sales-studio", "Pricing Analyst", "8 years in SaaS pricing strategy",
     "Price is what you pay, value is what you get — pricing must communicate both",
     "Analytical, value-oriented, market-aware",
     ["Pricing model design and optimization", "Competitive pricing analysis", "Discount strategy and approval framework", "ROI and payback period calculation"],
     ["Pricing below cost — REASON: every deal must be profitable", "Arbitrary discounting — REASON: discounts must follow approved framework"],
     ["Product costs", "Market pricing data", "Competitive pricing from research-studio"],
     ["Pricing recommendation", "Discount framework", "ROI calculations"],
     "Subagent", "Pricing analysis requires focused data examination",
     ["Pricing covers costs with target margin", "Competitive positioning justified", "Discount limits defined", "ROI calculation is conservative and realistic"],
     ["If pricing undercuts market significantly: flag for strategic review"]),
    ("sales-enablement-lead", "sales-studio", "Sales Enablement Lead", "9 years in sales enablement and training",
     "The best sales tools are the ones that actually get used",
     "Practical, rep-focused, tool-oriented",
     ["Battle card creation for competitive scenarios", "One-pager and leave-behind design", "Sales playbook development", "Sales email template creation"],
     ["Creating materials that won't be used — REASON: always validate with sales team", "Generic one-size-fits-all content — REASON: segment-specific materials win"],
     ["Product information", "Competitor analysis", "Sales process stages"],
     ["Battle cards (templates/battle-card.md)", "One-pagers (templates/one-pager.md)", "Sales playbook sections"],
     "Subagent", "Enablement material creation benefits from focused context",
     ["Materials are concise (one page max for battle cards)", "Talking points are natural and conversational", "Competitive info is current and verified", "Materials organized by sales stage"],
     ["If competitive landscape changed significantly: flag for update cycle"]),
    ("proposal-reviewer", "sales-studio", "Proposal Reviewer", "11 years in deal desk and proposal quality assurance",
     "Every proposal is a promise — make sure it is one you can keep",
     "Detail-oriented, risk-aware, accuracy-focused",
     ["Proposal accuracy and completeness review", "Pricing and discount validation", "Legal and compliance checking", "Competitive claim verification"],
     ["Approving inaccurate proposals — REASON: wrong proposals damage credibility", "Skipping pricing review — REASON: pricing errors are costly"],
     ["Proposal to review", "Current pricing", "Product capabilities"],
     ["Review report with findings", "Accuracy verification", "Risk flags"],
     "ALWAYS Subagent", "Adversarial — proposal review must be independent with fresh context",
     ["All claims verified against product capabilities", "Pricing matches approved rates", "Timeline is achievable", "Legal language is compliant", "Minimum 3 specific findings"],
     ["If material misrepresentation found: HALT proposal and escalate"]),
]

for a in sales_agents:
    write(f"sales-studio/agents/{a[0]}.md", agent(*a))

# Sales workflows
for name, desc, cost, phases in [
    ("proposal-pipeline", "End-to-end proposal creation from opportunity to delivery", "$0.045",
     """## Phase 1: Qualify
### Agent: sales-strategist (Inline)
BANT/MEDDIC qualification, risk assessment.

## Phase 2: Strategy
### Agent: pricing-analyst (Subagent)
Pricing model, discount framework, ROI calculations.

## Phase 3: Write
### Agent: proposal-writer (Subagent)
Custom proposal with executive summary, scope, pricing, timeline.

## Phase 4: Review
### Agent: proposal-reviewer (ALWAYS Subagent)
Accuracy, pricing, legal, and competitive claim verification.
### Gate: Zero inaccuracies, pricing approved"""),
    ("pitch-deck-pipeline", "Pitch deck creation from research to delivery", "$0.035",
     """## Phase 1: Research
### Agent: sales-strategist (Inline)
Prospect analysis, pain point identification.

## Phase 2: Create
### Agent: pitch-deck-creator (Subagent)
Deck structure, slide content, speaking notes.

## Phase 3: Review
### Agent: proposal-reviewer (ALWAYS Subagent)
Accuracy, brand compliance, claim verification."""),
    ("competitive-response-pipeline", "Rapid competitive response when competitor enters deal", "$0.020",
     """## Phase 1: Intelligence
Request competitor data from research-studio.

## Phase 2: Response
### Agent: objection-handler (Inline)
Objection responses for competitor-specific scenarios.
### Agent: sales-enablement-lead (Subagent)
Battle card update.

## Phase 3: Review
### Agent: proposal-reviewer (ALWAYS Subagent)
Verify competitive claims."""),
    ("sales-enablement-pipeline", "Sales material creation and optimization", "$0.030",
     """## Phase 1: Audit
### Agent: sales-enablement-lead (Subagent)
Review existing materials, identify gaps.

## Phase 2: Create
### Agent: sales-enablement-lead (Subagent)
Battle cards, one-pagers, email templates.

## Phase 3: Review
### Agent: proposal-reviewer (ALWAYS Subagent)
Accuracy and brand compliance check."""),
]:
    write(f"sales-studio/workflows/{name}.md", f"""---
name: {name}
studio: sales-studio
description: "{desc}"
estimated_cost: "{cost}"
---

# {name.replace('-', ' ').title()}

## Overview
{desc}

{phases}

## Error Recovery
- Phase failure: retry with enhanced context, escalate to VP of Sales
""")

# Sales templates
for name, title, content in [
    ("proposal", "Sales Proposal Template", """## [Company Logo] Proposal for [Prospect Name]
### Prepared by: [Your Name] | Date: [Date]

## Executive Summary
[2-3 paragraphs: understanding of prospect's challenges, how you solve them, expected outcomes]

## Understanding Your Challenges
1. [Challenge 1 — use prospect's own words]
2. [Challenge 2]
3. [Challenge 3]

## Proposed Solution
### Approach
[How your solution addresses each challenge]

### Scope of Work
| Phase | Deliverables | Timeline |
|-------|-------------|----------|
| Phase 1 | [deliverables] | [weeks] |
| Phase 2 | [deliverables] | [weeks] |

### What's Included
- [Included item 1]
- [Included item 2]

### What's Not Included
- [Excluded item 1]

## Investment
| Item | Price |
|------|-------|
| [line item] | $[amount] |
| **Total** | **$[total]** |

## Expected ROI
[Conservative ROI calculation with assumptions stated]

## Next Steps
1. [Specific next step with date]
2. [Following step]

## Terms
[Payment terms, validity period]"""),
    ("pitch-deck", "Pitch Deck Outline", """## Slide 1: Title
- Company name, tagline, date
- Speaking note: Build rapport, set agenda

## Slide 2: The Problem
- 1-3 key pain points the prospect faces
- Speaking note: Validate with prospect experience

## Slide 3: The Cost of Inaction
- What happens if they do nothing
- Data point supporting urgency
- Speaking note: Create urgency without being pushy

## Slide 4: The Solution
- One sentence: what you do
- Speaking note: Keep high-level, details come later

## Slide 5: How It Works
- 3-step process (simplify complexity)
- Speaking note: Walk through each step with example

## Slide 6: Results
- 2-3 client success stories with specific metrics
- Speaking note: Choose most relevant case study

## Slide 7: Why Us
- 3 differentiators vs alternatives
- Speaking note: Focus on prospect-relevant differentiators

## Slide 8: Investment
- Pricing overview
- ROI comparison
- Speaking note: Frame as investment, not cost

## Slide 9: Next Steps
- Specific proposed next actions
- Timeline
- Speaking note: Close with specific ask"""),
    ("battle-card", "Competitive Battle Card", """## Competitor: [Name]

### Quick Facts
- **Founded:** [year]
- **Pricing:** [range]
- **Target market:** [who they serve]
- **Key strength:** [one thing they do well]

### Where We Win
| Our Advantage | Proof Point | Talk Track |
|--------------|-------------|------------|
| [advantage 1] | [evidence] | "When comparing [area], we..." |
| [advantage 2] | [evidence] | "Unlike [competitor], we..." |

### Where They Win
| Their Advantage | Our Response |
|----------------|-------------|
| [their strength] | [how to reframe or mitigate] |

### Common Objections
| Objection | Response |
|-----------|---------|
| "They're cheaper" | [value-based response] |
| "They have feature X" | [alternative or roadmap response] |

### Landmines to Set
- Ask: "[Question that highlights our strength]"
- Ask: "[Question that exposes their weakness]" """),
    ("one-pager", "Product One-Pager", """## [Product Name]
### [Tagline — one sentence value prop]

## The Problem
[2-3 sentences describing the pain point]

## The Solution
[2-3 sentences describing how you solve it]

## Key Benefits
- [Benefit 1] — [supporting detail]
- [Benefit 2] — [supporting detail]
- [Benefit 3] — [supporting detail]

## Social Proof
> "[Client quote]" — [Name, Title, Company]

## Key Metric
**[Impressive statistic, e.g., "4.8x average ROI"]**

## Get Started
[CTA with next step]
[Contact information]"""),
    ("pricing-sheet", "Pricing Sheet Template", """## Pricing Overview

### Plans
| Feature | Starter | Professional | Enterprise |
|---------|---------|-------------|-----------|
| [Feature 1] | [included] | [included] | [included] |
| [Feature 2] | — | [included] | [included] |
| [Feature 3] | — | — | [included] |
| **Price** | **$X/mo** | **$Y/mo** | **Custom** |

### Volume Discounts
| Volume | Discount |
|--------|----------|
| 10-49 seats | 10% |
| 50-99 seats | 15% |
| 100+ seats | 20% |

### Add-Ons
| Add-On | Price |
|--------|-------|
| [add-on 1] | $X/mo |

### Terms
- Annual billing: 2 months free
- 30-day money-back guarantee
- Implementation included for Professional+"""),
    ("objection-guide", "Objection Handling Guide", """## Price Objections

### "It's too expensive"
- **Acknowledge:** "I understand budget is a consideration."
- **Reframe:** "Let's look at the cost of the problem you're solving..."
- **Evidence:** [ROI calculation or case study]
- **Close:** "Based on your [metric], you'd see ROI in [timeframe]."

### "Competitor X is cheaper"
- **Acknowledge:** "They are a well-known option."
- **Differentiate:** "Here's where the real difference shows up..."
- **Evidence:** [Specific capability comparison]

## Timing Objections

### "Not the right time"
- **Acknowledge:** "Timing is important."
- **Cost of delay:** "Each month of delay costs approximately..."
- **Low-commitment start:** "We could start with a pilot to demonstrate value."

## Trust Objections

### "We've never heard of you"
- **Social proof:** [Client list, case studies]
- **Risk reduction:** [Guarantee, pilot program]"""),
]:
    write(f"sales-studio/templates/{name}.md", f"# {title}\n\n{content}")

# Sales references
for name, title, content in [
    ("sales-methodology", "Sales Methodology Reference", """## BANT Qualification
- **Budget:** Do they have budget allocated?
- **Authority:** Is the contact a decision-maker?
- **Need:** Is there a genuine business need?
- **Timeline:** Is there urgency to act?

## MEDDIC Qualification
- **Metrics:** What are their success metrics?
- **Economic Buyer:** Who controls the budget?
- **Decision Criteria:** What are they evaluating?
- **Decision Process:** What's the approval flow?
- **Identify Pain:** What's the core problem?
- **Champion:** Who internally supports us?

## Sales Stages
1. Prospecting → 2. Discovery → 3. Qualification → 4. Proposal → 5. Negotiation → 6. Close"""),
    ("pricing-strategy", "Pricing Strategy Reference", """## Pricing Models
| Model | Description | Best For |
|-------|-------------|---------|
| Per-seat | Price per user per month | SaaS with clear user count |
| Tiered | Feature-based tiers | Products with expandable features |
| Usage-based | Pay for what you use | APIs, infrastructure |
| Value-based | Price on outcomes | Consulting, high-impact tools |

## Discounting Framework
- **Approved:** Annual commitment (10-20%), volume (10-20%)
- **Requires approval:** > 20% discount, custom terms
- **Never:** Below cost, without time limit

## Price Anchoring
1. Start with full price
2. Show comparison to cost of problem
3. Present ROI calculation
4. Then discuss any applicable discounts"""),
    ("email-templates", "Sales Email Templates", """## Cold Outreach
Subject: [Specific pain point] at [Company]?
Body: [2-3 sentences showing you understand their challenge, one line about your solution, clear CTA]

## Follow-up (after no response)
Subject: Re: [Original subject]
Body: [1 sentence acknowledging they're busy, new angle or value, simple CTA]

## Post-Demo
Subject: [Company] + [Your Company] — Next Steps
Body: [Recap key points discussed, address any concerns raised, specific next step with date]

## Proposal Follow-up
Subject: [Company] Proposal — Quick Question
Body: [Reference specific proposal point, ask for feedback, offer to clarify]"""),
    ("negotiation-tactics", "Negotiation Tactics Reference", """## Principles
1. Never negotiate against yourself
2. Trade, don't give (if they want X, ask for Y)
3. Anchor high with justification
4. Silence is your friend after making an offer
5. Written offers carry more weight than verbal

## Common Trades
| They Want | You Ask For |
|-----------|-------------|
| Lower price | Annual commitment |
| Lower price | Larger volume |
| Custom terms | Case study rights |
| Extended trial | Executive sponsor meeting |

## Walk-Away Indicators
- Asking for > 40% discount without volume justification
- Refusing to commit to any timeline
- Bypassing all decision-making processes
- Requesting unpaid proof-of-concept exceeding 30 days"""),
    ("sales-metrics", "Sales Metrics Reference", """## Pipeline Metrics
- **Pipeline coverage:** Target 3x-5x of quota
- **Win rate:** Track by segment, deal size, competitor
- **Average deal size:** Monitor trend over time
- **Sales cycle length:** By segment and deal complexity

## Activity Metrics
- Calls/meetings per week
- Proposals sent per month
- Demo-to-proposal conversion rate
- Proposal-to-close conversion rate

## Revenue Metrics
- Monthly/quarterly recurring revenue (MRR/QRR)
- Net revenue retention
- Customer acquisition cost (CAC)
- LTV:CAC ratio (target: > 3:1)"""),
]:
    write(f"sales-studio/references/{name}.md", f"# {title}\n\n{content}")

print("Sales studio complete!")

# ============================================================
# CLIENT SUCCESS STUDIO
# ============================================================
print("\n=== CLIENT SUCCESS STUDIO ===")

write("client-success-studio/SKILL.md", """---
name: client-success-studio
description: "Client success studio. Manages onboarding, retention, and expansion. Creates client-facing materials, health reports, and success playbooks."
activation: "client success, onboarding, retention, churn, NPS, customer success, upsell, expansion, health score"
tier: 2
dependencies: [brand-studio, sales-studio]
---

# Client Success Studio — VP of Client Success

## Mission
Maximize client retention, satisfaction, and expansion through proactive success management.

## Team Roster
| Agent | File | Spawning | Primary Output |
|-------|------|----------|----------------|
| CS Strategist | agents/cs-strategist.md | Inline | Success strategy |
| Onboarding Specialist | agents/onboarding-specialist.md | Subagent | Onboarding plans |
| Health Monitor | agents/health-monitor.md | Subagent | Health reports |
| Expansion Manager | agents/expansion-manager.md | Inline | Upsell/cross-sell plans |
| Churn Analyst | agents/churn-analyst.md | ALWAYS Subagent | Churn risk analysis |

## Pipeline
```
New Client → [Onboarding] → [Health Monitoring] → [Expansion/Renewal]
Risk Detected → [Churn Analyst: Diagnose] → [CS Strategist: Intervene]
```

## Spawning Rules
- **ALWAYS subagent:** churn-analyst (adversarial — churn risk must be independently assessed)
- **ALWAYS inline:** cs-strategist, expansion-manager (short strategic output)
- **Context-dependent:** onboarding-specialist, health-monitor (subagent for detailed analysis)

## Budget
| Phase | Estimated Cost | Model |
|-------|---------------|-------|
| Strategy | $0.005 | haiku |
| Onboarding | $0.015 | sonnet |
| Monitoring | $0.010 | sonnet |
| Churn Analysis | $0.010 | sonnet |
| **Total** | **$0.040** | — |

## Quality Gates
- **Onboarding Completeness:** All steps defined with success criteria
- **Health Accuracy:** Health scores backed by data
- **Proactivity:** Risks identified before they escalate

## Integration Points
- Receives FROM sales-studio: deal context for onboarding
- Provides TO marketing-studio: case study candidates
- Provides TO sales-studio: expansion opportunities
- Provides TO research-studio: client feedback for product insights

## Templates Available
| Template | File | When to Use | Tier |
|----------|------|-------------|------|
| Onboarding Plan | templates/onboarding-plan.md | New client | 1 |
| Health Report | templates/health-report.md | Regular check-in | 1 |
| QBR Deck | templates/qbr-deck.md | Quarterly review | 2 |
| Churn Risk Report | templates/churn-risk-report.md | Risk assessment | 1 |
""")

cs_agents = [
    ("cs-strategist", "client-success-studio", "CS Strategist", "11 years in customer success strategy",
     "Retention is not about preventing churn — it is about creating so much value they never want to leave",
     "Proactive, value-focused, relationship-oriented",
     ["Client success strategy development", "Account health assessment framework design", "Renewal and expansion strategy", "Client segmentation for CS resource allocation"],
     ["Reactive-only approaches — REASON: success is proactive, not just firefighting", "Ignoring low-touch accounts — REASON: every account needs a success path"],
     ["Client portfolio data", "Product usage metrics", "Deal context from sales-studio"],
     ["Success strategy", "Segmentation model", "Intervention playbooks"],
     "Inline", "Strategic assessment is short structured output",
     ["Strategy covers all client segments", "Health score framework defined", "Intervention triggers identified"],
     ["If client needs exceed CS capacity: escalate for resource discussion"]),
    ("onboarding-specialist", "client-success-studio", "Onboarding Specialist", "8 years in client onboarding and implementation",
     "First impressions determine lifetime value — nail the onboarding",
     "Structured, milestone-driven, client-empathetic",
     ["Customized onboarding plan creation", "Implementation timeline design", "Training material development", "Go-live readiness assessment"],
     ["Rushing onboarding — REASON: poor onboarding is the #1 churn predictor", "One-size-fits-all plans — REASON: customize to client maturity and needs"],
     ["Deal context from sales-studio", "Client profile", "Product configuration requirements"],
     ["Onboarding plan (templates/onboarding-plan.md)", "Training schedule", "Go-live checklist"],
     "Subagent", "Onboarding plans require focused context with client details",
     ["Plan has clear milestones with dates", "Success criteria defined for each phase", "Training covers all key features", "Go-live readiness checklist complete"],
     ["If onboarding complexity exceeds standard: escalate for additional resources"]),
    ("health-monitor", "client-success-studio", "Health Monitor", "7 years in customer health analytics",
     "The data always tells you when a client is leaving — if you know where to look",
     "Data-driven, pattern-aware, early-warning-focused",
     ["Client health score calculation", "Usage pattern analysis", "Engagement trend monitoring", "Risk indicator identification"],
     ["Ignoring leading indicators — REASON: lagging indicators mean it's already too late", "Single-metric health scores — REASON: health is multi-dimensional"],
     ["Product usage data", "Support ticket history", "Engagement metrics"],
     ["Health report (templates/health-report.md)", "Risk alerts", "Trend analysis"],
     "Subagent", "Health analysis requires focused examination of data patterns",
     ["Health score uses multiple dimensions", "Trends identified (improving, stable, declining)", "Risk indicators flagged early", "Comparison to healthy client benchmarks"],
     ["If health score drops below critical threshold: immediate alert to CS strategist"]),
    ("expansion-manager", "client-success-studio", "Expansion Manager", "9 years in account expansion and upselling",
     "The best upsell is the one the client asks for because you delivered so much value",
     "Opportunity-aware, value-first, timing-sensitive",
     ["Expansion opportunity identification", "Upsell and cross-sell strategy", "Usage-based expansion timing", "Business case development for expansion"],
     ["Pushy upselling — REASON: expansion should be value-driven, not quota-driven", "Expanding unhealthy accounts — REASON: fix health issues before expanding"],
     ["Client health data", "Usage patterns", "Product feature adoption"],
     ["Expansion opportunity assessment", "Business case for client", "Timing recommendation"],
     "Inline", "Expansion assessment is short strategic output",
     ["Opportunity tied to client value realization", "Account health supports expansion", "Timing is appropriate", "Business case is compelling from client perspective"],
     ["If account health is poor: prioritize retention over expansion"]),
    ("churn-analyst", "client-success-studio", "Churn Analyst", "8 years in churn prediction and prevention",
     "Every churned client is a failure of early detection, not a failure of retention",
     "Analytical, pattern-recognition-focused, intervention-oriented",
     ["Churn risk scoring and prediction", "Root cause analysis for at-risk accounts", "Intervention strategy recommendation", "Churn pattern analysis across portfolio"],
     ["Ignoring early warning signs — REASON: early intervention has highest success rate", "Optimistic risk assessments — REASON: honest assessment enables effective intervention"],
     ["Client health data", "Usage trends", "Support history", "Engagement patterns"],
     ["Churn risk report (templates/churn-risk-report.md)", "Root cause analysis", "Intervention recommendations"],
     "ALWAYS Subagent", "Adversarial — churn risk must be independently assessed with fresh context",
     ["Risk score calculated with multiple factors", "Root causes identified (not just symptoms)", "Intervention strategies are specific and actionable", "Timeline for intervention defined"],
     ["If multiple accounts show same churn pattern: escalate as systemic issue"]),
]

for a in cs_agents:
    write(f"client-success-studio/agents/{a[0]}.md", agent(*a))

# CS workflows
for name, desc, cost, phases in [
    ("client-onboarding-pipeline", "Structured onboarding from deal close to go-live", "$0.030",
     """## Phase 1: Plan
### Agent: onboarding-specialist (Subagent)
Create customized onboarding plan with milestones.

## Phase 2: Execute
Track milestone completion, provide training.

## Phase 3: Go-Live
### Agent: onboarding-specialist (Subagent)
Readiness assessment, go-live support plan.

## Phase 4: Health Baseline
### Agent: health-monitor (Subagent)
Establish health baseline and monitoring schedule."""),
    ("health-review-pipeline", "Regular client health assessment and intervention", "$0.020",
     """## Phase 1: Analyze
### Agent: health-monitor (Subagent)
Calculate health scores, identify trends.

## Phase 2: Risk Assessment
### Agent: churn-analyst (ALWAYS Subagent)
Evaluate churn risk for declining accounts.

## Phase 3: Intervene
### Agent: cs-strategist (Inline)
Design intervention for at-risk accounts."""),
    ("expansion-pipeline", "Identify and execute expansion opportunities", "$0.015",
     """## Phase 1: Identify
### Agent: expansion-manager (Inline)
Review healthy accounts for expansion signals.

## Phase 2: Business Case
### Agent: expansion-manager (Inline)
Develop value-based business case for expansion.

## Phase 3: Handoff
Coordinate with sales-studio for formal expansion proposal."""),
]:
    write(f"client-success-studio/workflows/{name}.md", f"""---
name: {name}
studio: client-success-studio
description: "{desc}"
estimated_cost: "{cost}"
---

# {name.replace('-', ' ').title()}

## Overview
{desc}

{phases}

## Error Recovery
- Phase failure: escalate to VP of Client Success
""")

# CS templates
for name, title, content in [
    ("onboarding-plan", "Client Onboarding Plan", """## Client: [Name]
### Start Date: [Date] | Go-Live Target: [Date]

## Phase 1: Kickoff (Week 1)
- [ ] Kickoff meeting
- [ ] Account setup and configuration
- [ ] Admin training
- **Success Criteria:** Account active, admin trained

## Phase 2: Implementation (Weeks 2-3)
- [ ] Data migration
- [ ] Integration setup
- [ ] User provisioning
- **Success Criteria:** Core workflows operational

## Phase 3: Training (Week 4)
- [ ] End-user training sessions
- [ ] Documentation shared
- [ ] Q&A session
- **Success Criteria:** Users can perform core tasks independently

## Phase 4: Go-Live (Week 5)
- [ ] Go-live readiness check
- [ ] Go-live support
- [ ] 30-day health check scheduled
- **Success Criteria:** Client operational, no blocking issues"""),
    ("health-report", "Client Health Report", """## Client: [Name]
### Period: [Date Range]

## Health Score: [X/100] [Trend: improving/stable/declining]

### Score Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Usage | [0-100] | 30% | [score] |
| Engagement | [0-100] | 25% | [score] |
| Support | [0-100] | 20% | [score] |
| Value Realization | [0-100] | 25% | [score] |

### Key Metrics
| Metric | Last Period | Current | Trend |
|--------|-----------|---------|-------|
| Active users | [n] | [n] | [+/-] |
| Feature adoption | [%] | [%] | [+/-] |
| Support tickets | [n] | [n] | [+/-] |
| NPS score | [n] | [n] | [+/-] |

### Risks
- [Risk 1]: [severity] — [mitigation]

### Opportunities
- [Expansion/improvement opportunity]

### Action Items
1. [Specific action with owner and date]"""),
    ("qbr-deck", "Quarterly Business Review Deck", """## Slide 1: Title
[Client Name] Quarterly Business Review — [Quarter]

## Slide 2: Executive Summary
- Health score: [X/100]
- Key wins this quarter
- Focus areas for next quarter

## Slide 3: Value Delivered
| Metric | Baseline | Current | Impact |
|--------|---------|---------|--------|
| [KPI 1] | [before] | [after] | [improvement] |

## Slide 4: Product Usage
- Active users trend
- Feature adoption highlights
- Engagement metrics

## Slide 5: Support Summary
- Tickets: [count], avg resolution: [time]
- Top issues and resolutions
- Satisfaction: [score]

## Slide 6: Roadmap Preview
- Upcoming features relevant to client
- Beta opportunities

## Slide 7: Next Quarter Plan
- Goals and objectives
- Action items with owners"""),
    ("churn-risk-report", "Churn Risk Assessment", """## Client: [Name]
### Risk Score: [High/Medium/Low] — [X/100]

## Risk Factors
| Factor | Severity | Evidence |
|--------|----------|----------|
| [Factor 1] | [High/Med/Low] | [specific data] |
| [Factor 2] | [High/Med/Low] | [specific data] |

## Root Cause Analysis
[Primary reason for churn risk]

## Warning Signs Timeline
- [Date]: [First warning sign]
- [Date]: [Escalation]
- [Date]: [Current state]

## Recommended Interventions
| Action | Owner | Timeline | Expected Impact |
|--------|-------|----------|-----------------|
| [Action 1] | [who] | [when] | [expected result] |

## If No Intervention
- Estimated time to churn: [timeframe]
- Revenue at risk: $[amount]"""),
]:
    write(f"client-success-studio/templates/{name}.md", f"# {title}\n\n{content}")

# CS references
for name, title, content in [
    ("health-score-model", "Client Health Score Model", """## Dimensions and Weights
| Dimension | Weight | Inputs | Calculation |
|-----------|--------|--------|-------------|
| Usage | 30% | DAU/MAU ratio, feature adoption, login frequency | Weighted average of usage metrics |
| Engagement | 25% | Meeting attendance, email response rate, feature requests | Composite engagement index |
| Support | 20% | Ticket volume trend, resolution satisfaction, escalation rate | Inverse of negative trends |
| Value Realization | 25% | Stated goals progress, ROI metrics, expansion interest | Goal achievement percentage |

## Score Ranges
- 80-100: Healthy (advocate candidate)
- 60-79: Stable (monitor)
- 40-59: At risk (proactive outreach needed)
- 0-39: Critical (immediate intervention required)"""),
    ("intervention-playbooks", "Intervention Playbooks by Risk Type", """## Low Engagement
1. Schedule success check-in
2. Offer training refresh
3. Share relevant use cases
4. Connect with user community

## Declining Usage
1. Identify drop-off point
2. Review user feedback
3. Offer product walkthrough
4. Create custom workflow

## Support Escalation
1. Acknowledge issue immediately
2. Escalate to engineering if product bug
3. Provide workaround while fixing
4. Follow up to confirm resolution

## Champion Left
1. Identify new stakeholders
2. Schedule re-introduction meeting
3. Rebuild value narrative
4. Document institutional knowledge"""),
    ("cs-metrics", "Client Success Metrics", """## Retention
- Gross retention rate: target > 90%
- Net retention rate: target > 110% (with expansion)
- Logo churn rate: target < 5% annual

## Satisfaction
- NPS: target > 40
- CSAT: target > 85%
- Health score: target > 75% of accounts in "Healthy"

## Efficiency
- Time to value: [target days]
- Onboarding completion rate: target > 95%
- Support ticket resolution: target < 24h

## Expansion
- Expansion revenue as % of total: target > 30%
- Upsell conversion rate: target > 20%"""),
]:
    write(f"client-success-studio/references/{name}.md", f"# {title}\n\n{content}")

print("Client success studio complete!")
print(f"\nTotal: advertisement-studio + sales-studio + client-success-studio")
