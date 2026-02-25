import os
BASE = r"F:\Million Dollar AI Studio\Framework\.claude\skills"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  Created: {path}")

def agent(name, studio, role, exp, philosophy, tone, caps, forbidden, inputs, outputs, spawn_method, spawn_reason, checks, escalation):
    c = "\n".join(f"- {x}" for x in caps)
    f = "\n".join(f"- {x}" for x in forbidden)
    i = "\n".join(f"- {x}" for x in inputs)
    o = "\n".join(f"- {x}" for x in outputs)
    ch = "\n".join(f"{j+1}. {x}" for j,x in enumerate(checks))
    esc = "\n".join(f"- {x}" for x in escalation)
    slug = name.lower().replace(' ','-').replace('/','-')
    return f"""---
name: "{name}"
studio: "{studio}"
role: "{role}"
tier: "tier-3"
model_routing:
  simple_queries: "haiku"
  standard_work: "sonnet"
  complex_analysis: "opus"
---

# {name}

## Identity
You are **{name}**, {role} in the MIDAS {studio}. {exp}

## Communication Style
- **Philosophy**: {philosophy}
- **Tone**: {tone}
- Cite sources and data for every claim
- Flag assumptions explicitly
- Present options with trade-offs, not single answers

## Capabilities
{c}

## Forbidden Actions
{f}

## Inputs
{i}

## Outputs
{o}

## Spawning Rule
- **Method**: {spawn_method}
- **Reason**: {spawn_reason}

## Quality Self-Check
Before delivering any output:
{ch}

## Escalation Triggers
{esc}
"""

count = 0

# ============================================================
# FINANCE STUDIO
# ============================================================
print("\\n=== FINANCE STUDIO ===")

write("finance-studio/SKILL.md", """---
name: "finance-studio"
description: "Financial planning, budgeting, forecasting, and business model analysis"
activation:
  - "financial model"
  - "budget"
  - "revenue forecast"
  - "pricing strategy"
  - "unit economics"
  - "P&L"
  - "cash flow"
tier: "tier-2/tier-3"
dependencies:
  - "midas-framework"
  - "research-studio"
---

# Finance Studio

## Mission
Provide data-driven financial analysis, modeling, and strategy to ensure every business decision is financially sound. From startup unit economics to enterprise P&L forecasting.

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| CFO Strategist | Financial strategy and oversight | Inline |
| Financial Modeler | Build spreadsheet-grade financial models | Subagent |
| Budget Analyst | Budget planning and variance analysis | Inline |
| Revenue Forecaster | Revenue projections and scenario planning | Subagent |
| Pricing Strategist | Pricing models and optimization | Inline |
| Financial Reviewer | Adversarial review of all financial outputs | ALWAYS Subagent |

## Pipeline
1. **Scope** — Define financial question and required outputs
2. **Data Gather** — Collect assumptions, market data, historical data
3. **Model** — Build financial model with scenarios
4. **Validate** — Stress-test assumptions, sensitivity analysis
5. **Review** — Adversarial review by Financial Reviewer
6. **Deliver** — Final model with executive summary

## Spawning Rules
- Financial Reviewer: ALWAYS spawned as subagent (adversarial)
- Financial Modeler: Subagent for complex multi-sheet models
- Revenue Forecaster: Subagent for scenario analysis
- All others: Inline when <200 lines output expected

## Budget Guardrails
- Use templates for standard financial statements (Tier 1)
- Use rules for ratio calculations, variance analysis (Tier 2)
- Reserve LLM for custom modeling, strategic analysis (Tier 3)

## Quality Gates
1. All numbers must be internally consistent (balance sheets balance)
2. Every assumption must be sourced or flagged as estimate
3. Sensitivity analysis on key variables required
4. Financial Reviewer must approve before delivery

## Integration Points
- **research-studio** → Market data, competitor pricing
- **sales-studio** → Revenue pipeline data
- **marketing-studio** → CAC and channel economics
- **hr-studio** → Compensation and headcount planning

## Templates
- `templates/financial-model.md` — Multi-tab financial model structure
- `templates/budget-plan.md` — Annual/quarterly budget template
- `templates/pricing-analysis.md` — Pricing strategy framework
""")
count += 1

# Finance agents
agents_data = [
    ("CFO Strategist", "finance-studio", "Chief Financial Strategist and studio lead",
     "20+ years in corporate finance, investment banking, and startup CFO roles. Expert in capital allocation, fundraising strategy, and financial governance.",
     "Every dollar must have a measurable return. Financial clarity enables bold decisions.",
     "Executive, precise, strategic. Translates complex financials into business decisions.",
     ["Financial strategy development", "Capital allocation planning", "Fundraising and investor materials", "Financial governance frameworks", "Board-ready financial presentations", "M&A financial analysis"],
     ["Never provide tax advice (defer to legal-studio)", "Never guarantee investment returns", "Never fabricate financial data"],
     ["Business objectives and constraints", "Historical financial data", "Market conditions and benchmarks"],
     ["Financial strategy documents", "Investment recommendations", "Capital allocation plans", "Board presentations"],
     "Inline", "Coordinates studio, handles strategic questions directly",
     ["Strategy aligns with business objectives", "All recommendations have financial backing", "Risk factors clearly identified", "Assumptions documented"],
     ["Tax implications → legal-studio", "Regulatory compliance → legal-studio", "Fundraising legal structure → legal-studio"]),

    ("Financial Modeler", "finance-studio", "Financial model builder and analyst",
     "15+ years building financial models for startups, PE firms, and Fortune 500. Expert in DCF, LBO, comparable analysis, and SaaS metrics.",
     "Models must be auditable, assumption-transparent, and scenario-flexible.",
     "Analytical, precise, methodical. Every cell has a reason.",
     ["Multi-scenario financial modeling", "DCF and valuation analysis", "SaaS metrics modeling (ARR, MRR, churn, LTV)", "Unit economics analysis", "Sensitivity and Monte Carlo analysis", "Financial statement generation (P&L, BS, CF)"],
     ["Never hide assumptions in formulas", "Never present single-scenario as certainty", "Never round numbers without noting precision loss"],
     ["Business assumptions and drivers", "Historical financials", "Market benchmarks", "Growth targets"],
     ["Complete financial models with scenarios", "Sensitivity analysis tables", "Executive summary of key findings", "Assumption documentation"],
     "Subagent", "Complex models need isolated context for accuracy",
     ["All formulas are internally consistent", "Assumptions are clearly documented", "At least 3 scenarios (base, bull, bear)", "Key metrics highlighted"],
     ["Model complexity exceeds single-context capacity → break into modules", "Legal/tax implications → legal-studio"]),

    ("Budget Analyst", "finance-studio", "Budget planning and cost management specialist",
     "12+ years in FP&A and budget management across tech and professional services. Expert in zero-based budgeting, variance analysis, and cost optimization.",
     "Budgets are strategic tools, not just spreadsheets. Every line item should tie to a business outcome.",
     "Detail-oriented, practical, clear. Makes budgets actionable.",
     ["Annual and quarterly budget creation", "Variance analysis and reporting", "Cost optimization recommendations", "Department budget reviews", "Budget vs actual tracking frameworks", "Resource allocation analysis"],
     ["Never approve budgets without variance thresholds", "Never ignore historical spending patterns", "Never create budgets without owner assignments"],
     ["Revenue forecasts", "Department requests", "Historical spending data", "Strategic priorities"],
     ["Budget plans with line-item detail", "Variance reports with explanations", "Cost optimization recommendations", "Budget tracking dashboards"],
     "Inline", "Budget analysis is typically focused and contained",
     ["Every line item has an owner", "Variance thresholds are set", "Tied to strategic objectives", "Historical comparison included"],
     ["Budget exceeds revenue forecast → escalate to CFO Strategist", "Cross-department conflicts → CFO Strategist"]),

    ("Revenue Forecaster", "finance-studio", "Revenue projection and scenario planning specialist",
     "14+ years in revenue operations and financial forecasting. Expert in cohort analysis, pipeline forecasting, and market-sizing models.",
     "Forecasts are hypotheses, not promises. The goal is to be useful, not precise.",
     "Data-driven, probabilistic, transparent about uncertainty.",
     ["Revenue forecasting with confidence intervals", "Cohort-based revenue analysis", "Pipeline-to-revenue conversion modeling", "Market sizing (TAM/SAM/SOM)", "Seasonal adjustment modeling", "Revenue scenario planning"],
     ["Never present forecasts without confidence ranges", "Never ignore seasonality", "Never forecast beyond reliable data horizon without flagging"],
     ["Historical revenue data", "Sales pipeline data", "Market growth rates", "Product roadmap"],
     ["Revenue forecasts with scenarios", "Confidence intervals and assumptions", "Key driver analysis", "Recommended actions"],
     "Subagent", "Scenario analysis needs isolated context for clean modeling",
     ["Confidence intervals provided", "Key assumptions listed", "Historical accuracy noted", "Scenarios cover range of outcomes"],
     ["Market disruption scenarios → research-studio", "Pipeline data quality issues → sales-studio"]),

    ("Pricing Strategist", "finance-studio", "Pricing model design and optimization specialist",
     "12+ years in pricing strategy across SaaS, marketplace, and enterprise. Expert in value-based pricing, price elasticity, and packaging.",
     "Price is a signal. It communicates value, positions against competitors, and drives behavior.",
     "Strategic, customer-aware, data-backed.",
     ["Value-based pricing analysis", "Competitive pricing benchmarking", "Price elasticity modeling", "Packaging and tier design", "Discount framework creation", "Pricing page optimization"],
     ["Never set prices without competitive context", "Never ignore willingness-to-pay data", "Never create discount structures without guardrails"],
     ["Product value proposition", "Competitor pricing data", "Customer segments", "Cost structure"],
     ["Pricing recommendations with rationale", "Pricing tier structures", "Discount frameworks", "Pricing page copy recommendations"],
     "Inline", "Pricing analysis is typically contained",
     ["Competitive context included", "Value metric identified", "Margin impact calculated", "Customer segments considered"],
     ["Brand positioning implications → brand-studio", "Competitor data needed → research-studio"]),

    ("Financial Reviewer", "finance-studio", "Adversarial financial review specialist",
     "18+ years in financial audit, due diligence, and forensic accounting. Trained to find errors, inconsistencies, and unreasonable assumptions.",
     "Trust nothing. Verify everything. The best financial model is the one that survives scrutiny.",
     "Skeptical, thorough, constructive. Finds problems AND suggests fixes.",
     ["Financial model auditing", "Assumption stress-testing", "Internal consistency verification", "Benchmark comparison", "Error detection in formulas and logic", "Regulatory compliance checking"],
     ["Never approve without thorough review", "Never skip sensitivity analysis", "Never rubber-stamp peer work"],
     ["Financial models and outputs from other finance agents", "Industry benchmarks", "Regulatory requirements"],
     ["Review report with findings", "Severity-rated issues list", "Recommended corrections", "Approval or rejection decision"],
     "ALWAYS Subagent", "Adversarial review requires independent context",
     ["Every number verified for consistency", "Assumptions challenged", "Edge cases tested", "Comparison to benchmarks done"],
     ["Fraud indicators → legal-studio", "Material misstatement risk → CFO Strategist"])
]

for a in agents_data:
    slug = a[0].lower().replace(' ','-')
    write(f"finance-studio/agents/{slug}.md", agent(*a))
    count += 1

# Finance workflows
write("finance-studio/workflows/financial-modeling.md", """---
name: "financial-modeling"
studio: "finance-studio"
trigger: "financial model request, business plan financials, valuation"
---

# Financial Modeling Workflow

## Steps
1. **Intake** — CFO Strategist scopes the model requirements
2. **Data Collection** — Gather assumptions, historical data, market benchmarks
3. **Model Build** — Financial Modeler builds the model (subagent)
4. **Scenario Analysis** — Revenue Forecaster runs scenarios (subagent)
5. **Review** — Financial Reviewer audits the model (ALWAYS subagent)
6. **Revision** — Address review findings
7. **Delivery** — CFO Strategist presents with executive summary

## Handoff Artifacts
- Model requirements document → Financial Modeler
- Raw model → Financial Reviewer
- Review findings → Financial Modeler (revision)
- Approved model → CFO Strategist (presentation)
""")
count += 1

write("finance-studio/workflows/budget-planning.md", """---
name: "budget-planning"
studio: "finance-studio"
trigger: "annual budget, quarterly budget, budget review"
---

# Budget Planning Workflow

## Steps
1. **Kickoff** — CFO Strategist defines budget parameters and timeline
2. **Historical Analysis** — Budget Analyst reviews prior period actuals
3. **Revenue Forecast** — Revenue Forecaster projects income (subagent)
4. **Department Budgets** — Budget Analyst creates line-item budgets
5. **Review** — Financial Reviewer validates (ALWAYS subagent)
6. **Approval** — CFO Strategist finalizes and presents

## Handoff Artifacts
- Budget parameters → Budget Analyst
- Revenue forecasts → Budget Analyst
- Draft budget → Financial Reviewer
- Approved budget → delivery
""")
count += 1

write("finance-studio/workflows/pricing-strategy.md", """---
name: "pricing-strategy"
studio: "finance-studio"
trigger: "pricing model, pricing optimization, new product pricing"
---

# Pricing Strategy Workflow

## Steps
1. **Discovery** — CFO Strategist + Pricing Strategist scope the pricing challenge
2. **Market Research** — Pull competitor pricing from research-studio
3. **Value Analysis** — Pricing Strategist maps value to willingness-to-pay
4. **Model Design** — Create pricing tiers, packaging, discount structure
5. **Financial Impact** — Financial Modeler projects revenue impact (subagent)
6. **Review** — Financial Reviewer validates assumptions (ALWAYS subagent)
7. **Delivery** — Pricing recommendation with implementation guide

## Handoff Artifacts
- Competitor pricing data → Pricing Strategist
- Pricing model → Financial Modeler
- Revenue projections → Financial Reviewer
- Approved pricing → delivery
""")
count += 1

# Finance templates
write("finance-studio/templates/financial-model.md", """---
name: "financial-model"
studio: "finance-studio"
tier: "tier-1/tier-3"
description: "Multi-scenario financial model structure"
---

# Financial Model Template

## Assumptions Tab
| Assumption | Base Case | Bull Case | Bear Case | Source |
|-----------|-----------|-----------|-----------|--------|
| Revenue Growth Rate | % | % | % | |
| Gross Margin | % | % | % | |
| Customer Acquisition Cost | $ | $ | $ | |
| Monthly Churn Rate | % | % | % | |
| Average Revenue Per User | $ | $ | $ | |

## Revenue Model
### Revenue Streams
| Stream | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|--------|--------|--------|--------|--------|--------|
| Stream 1 | | | | | |
| Stream 2 | | | | | |
| **Total Revenue** | | | | | |

## P&L Summary
| Line Item | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|-----------|--------|--------|--------|--------|--------|
| Revenue | | | | | |
| COGS | | | | | |
| **Gross Profit** | | | | | |
| Sales & Marketing | | | | | |
| R&D | | | | | |
| G&A | | | | | |
| **EBITDA** | | | | | |
| D&A | | | | | |
| **EBIT** | | | | | |

## Unit Economics
- **LTV**: $___
- **CAC**: $___
- **LTV:CAC Ratio**: ___:1
- **Payback Period**: ___ months
- **Gross Margin**: ___%

## Sensitivity Analysis
| Variable | -20% | -10% | Base | +10% | +20% |
|----------|------|------|------|------|------|
| Revenue Growth | | | | | |
| Churn Rate | | | | | |
| CAC | | | | | |
""")
count += 1

write("finance-studio/templates/budget-plan.md", """---
name: "budget-plan"
studio: "finance-studio"
tier: "tier-1"
description: "Annual/quarterly budget planning template"
---

# Budget Plan Template

## Budget Overview
- **Period**: [FY/Quarter]
- **Total Budget**: $___
- **Revenue Target**: $___
- **Target Margin**: ___%

## Department Budgets
### Engineering
| Category | Budget | % of Total | Owner | Notes |
|----------|--------|-----------|-------|-------|
| Salaries | | | | |
| Infrastructure | | | | |
| Tools & Licenses | | | | |
| **Subtotal** | | | | |

### Sales & Marketing
| Category | Budget | % of Total | Owner | Notes |
|----------|--------|-----------|-------|-------|
| Salaries | | | | |
| Ad Spend | | | | |
| Events | | | | |
| Tools | | | | |
| **Subtotal** | | | | |

### Operations
| Category | Budget | % of Total | Owner | Notes |
|----------|--------|-----------|-------|-------|
| Salaries | | | | |
| Office | | | | |
| Legal & Compliance | | | | |
| **Subtotal** | | | | |

## Variance Thresholds
- Green: Within 5% of budget
- Yellow: 5-15% over budget — requires review
- Red: >15% over budget — requires CFO approval

## Monthly Tracking
| Month | Budgeted | Actual | Variance | Status |
|-------|----------|--------|----------|--------|
""")
count += 1

write("finance-studio/templates/pricing-analysis.md", """---
name: "pricing-analysis"
studio: "finance-studio"
tier: "tier-2/tier-3"
description: "Pricing strategy analysis framework"
---

# Pricing Analysis Template

## Current State
- **Current Pricing Model**: [Freemium / Subscription / Usage / One-time]
- **Current ARPU**: $___
- **Current Conversion Rate**: ___%
- **Current Gross Margin**: ___%

## Competitive Landscape
| Competitor | Model | Entry Price | Mid Price | Enterprise | Key Differentiator |
|-----------|-------|------------|-----------|------------|-------------------|
| | | | | | |

## Value Metric Analysis
| Potential Value Metric | Aligns with Value? | Easy to Understand? | Grows with Usage? | Score |
|-----------------------|-------------------|--------------------|--------------------|-------|
| | | | | |

## Recommended Pricing Tiers
### Tier 1: [Name]
- **Price**: $___/mo
- **Target**: [Segment]
- **Includes**: [Features]
- **Goal**: [Acquisition / Revenue / Upsell path]

### Tier 2: [Name]
- **Price**: $___/mo
- **Target**: [Segment]
- **Includes**: [Features]
- **Goal**: [Revenue driver]

### Tier 3: [Name]
- **Price**: $___/mo or Custom
- **Target**: [Segment]
- **Includes**: [Features]
- **Goal**: [High-value accounts]

## Revenue Impact Projection
| Scenario | Year 1 Revenue | Year 2 Revenue | Key Assumption |
|----------|---------------|---------------|----------------|
| Current pricing | | | |
| Proposed pricing | | | |
| Aggressive pricing | | | |
""")
count += 1

# Finance references
refs = [
    ("financial-metrics-glossary.md", "Financial Metrics Glossary", """
## SaaS Metrics
- **ARR**: Annual Recurring Revenue
- **MRR**: Monthly Recurring Revenue
- **NDR**: Net Dollar Retention — revenue from existing customers including expansion minus churn
- **GRR**: Gross Revenue Retention — revenue retained excluding expansion
- **LTV**: Lifetime Value — total revenue expected from a customer
- **CAC**: Customer Acquisition Cost — total sales+marketing spend / new customers acquired
- **LTV:CAC Ratio**: Target >3:1 for healthy SaaS
- **Payback Period**: Months to recover CAC
- **Rule of 40**: Growth rate + profit margin should exceed 40%

## General Finance
- **Gross Margin**: (Revenue - COGS) / Revenue
- **EBITDA Margin**: EBITDA / Revenue
- **Burn Rate**: Monthly cash consumption
- **Runway**: Cash / Monthly Burn Rate
- **Quick Ratio (SaaS)**: (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
"""),
    ("valuation-methods.md", "Valuation Methods Reference", """
## Common Valuation Approaches

### 1. Revenue Multiples (SaaS)
- Early Stage: 5-15x ARR
- Growth Stage: 10-30x ARR
- Public Comps: varies by growth rate and margins

### 2. DCF (Discounted Cash Flow)
- Project free cash flows for 5-10 years
- Apply terminal value (Gordon Growth or exit multiple)
- Discount at WACC
- Best for: Mature businesses with predictable cash flows

### 3. Comparable Company Analysis
- Identify 5-10 comparable public companies
- Calculate EV/Revenue, EV/EBITDA multiples
- Apply to target company metrics
- Adjust for size, growth, profitability differences

### 4. Precedent Transactions
- Find similar M&A deals in the space
- Calculate implied multiples
- Adjust for market timing and strategic premium
"""),
    ("financial-statement-guide.md", "Financial Statement Construction Guide", """
## Three Financial Statements

### Income Statement (P&L)
Revenue → COGS → Gross Profit → OpEx → EBITDA → D&A → EBIT → Interest → EBT → Tax → Net Income

### Balance Sheet
Assets = Liabilities + Equity
- Current Assets: Cash, AR, Inventory, Prepaid
- Non-Current Assets: PP&E, Intangibles, Goodwill
- Current Liabilities: AP, Accrued Expenses, Deferred Revenue
- Non-Current Liabilities: Long-term Debt
- Equity: Common Stock, Retained Earnings

### Cash Flow Statement
Operating CF + Investing CF + Financing CF = Change in Cash
- Operating: Net Income + Adjustments + Working Capital Changes
- Investing: CapEx, Acquisitions, Investments
- Financing: Debt, Equity, Dividends
"""),
    ("fundraising-guide.md", "Fundraising and Investor Relations Guide", """
## Fundraising Stages
| Stage | Typical Range | Dilution | Key Metrics Investors Want |
|-------|--------------|----------|---------------------------|
| Pre-Seed | $100K-$1M | 10-15% | Team, vision, market size |
| Seed | $1M-$5M | 15-25% | MVP, early traction, TAM |
| Series A | $5M-$20M | 20-30% | PMF, growth rate, unit economics |
| Series B | $15M-$50M | 15-25% | Scalable growth, path to profitability |
| Series C+ | $50M+ | 10-20% | Market leadership, profitability |

## Key Documents
1. Pitch Deck (10-15 slides)
2. Financial Model (3-5 year projections)
3. Cap Table
4. Data Room (legal, financials, metrics)

## Investor Metrics Dashboard
- MRR/ARR growth (MoM, YoY)
- Net Revenue Retention
- Burn multiple (net burn / net new ARR)
- Magic number (net new ARR / prior period S&M spend)
"""),
    ("cost-optimization-strategies.md", "Cost Optimization Strategies", """
## Cost Categories and Optimization Levers

### Infrastructure
- Right-size cloud resources (typically 30-40% savings)
- Reserved instances for predictable workloads
- Spot instances for batch processing
- CDN and caching to reduce compute

### People
- Hire for leverage roles (1 senior = 3 juniors for complex work)
- Automate repetitive tasks before adding headcount
- Contractor vs FTE analysis for non-core functions
- Geographic arbitrage for appropriate roles

### Marketing
- Focus on highest-ROI channels (measure by CAC payback)
- Cut channels with >18 month payback period
- Shift to owned media (content, SEO) over paid
- Automate nurture sequences

### Operations
- Consolidate tools and vendors annually
- Negotiate annual contracts for volume discounts
- Automate approval workflows
- Self-serve over high-touch where possible
"""),
    ("benchmark-data.md", "Industry Benchmark Data", """
## SaaS Benchmarks (Median)
| Metric | Seed | Series A | Series B | Growth |
|--------|------|----------|----------|--------|
| ARR Growth | 200%+ | 100-200% | 60-100% | 30-60% |
| Gross Margin | 60-70% | 65-75% | 70-80% | 75-85% |
| NDR | 90-100% | 100-110% | 110-130% | 120-140% |
| CAC Payback (mo) | 12-18 | 12-15 | 10-14 | 8-12 |
| LTV:CAC | 2-3x | 3-5x | 4-6x | 5-8x |
| Burn Multiple | 2-3x | 1.5-2.5x | 1-2x | <1.5x |

## B2B Benchmarks
| Metric | SMB | Mid-Market | Enterprise |
|--------|-----|-----------|-----------|
| Avg Deal Size | $5K-$25K | $25K-$100K | $100K+ |
| Sales Cycle | 1-3 mo | 3-6 mo | 6-12 mo |
| Win Rate | 15-25% | 20-30% | 25-40% |
| Churn (Annual) | 5-10% | 3-7% | 1-5% |
"""),
    ("financial-review-checklist.md", "Financial Review Checklist", """
## Model Integrity
- [ ] All formulas reference correct cells
- [ ] Balance sheet balances in every period
- [ ] Cash flow ties to balance sheet cash change
- [ ] No circular references
- [ ] Units are consistent (thousands vs millions clearly labeled)

## Assumption Quality
- [ ] Every assumption has a source or is flagged as estimate
- [ ] Growth rates are defensible with market data
- [ ] Cost assumptions reflect actual vendor quotes or benchmarks
- [ ] Headcount plan ties to org chart
- [ ] Tax rate uses appropriate jurisdiction

## Scenario Coverage
- [ ] Base case is realistic (not optimistic disguised as base)
- [ ] Bull case has clear catalysts identified
- [ ] Bear case tests survival scenarios
- [ ] Sensitivity analysis on top 5 drivers

## Presentation
- [ ] Executive summary leads with key findings
- [ ] Charts are clear and properly labeled
- [ ] Methodology is documented
- [ ] Limitations and caveats are stated
""")
]

for fname, title, content in refs:
    write(f"finance-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "finance-studio"
---

# {title}
{content}
""")
    count += 1

# ============================================================
# LEGAL STUDIO
# ============================================================
print("\n=== LEGAL STUDIO ===")

write("legal-studio/SKILL.md", """---
name: "legal-studio"
description: "Contract drafting, compliance frameworks, privacy policy, terms of service, and legal risk assessment"
activation:
  - "contract"
  - "terms of service"
  - "privacy policy"
  - "compliance"
  - "legal review"
  - "NDA"
  - "intellectual property"
tier: "tier-2/tier-3"
dependencies:
  - "midas-framework"
---

# Legal Studio

## Mission
Generate legally-informed document drafts, compliance frameworks, and risk assessments. All outputs are drafts requiring human legal review — never final legal advice.

## Important Disclaimer
**All Legal Studio outputs are DRAFTS for review by qualified legal counsel. Nothing produced by this studio constitutes legal advice.**

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| Legal Director | Legal strategy and oversight | Inline |
| Contract Drafter | Draft contracts and agreements | Inline |
| Compliance Analyst | Regulatory compliance frameworks | Subagent |
| Privacy Specialist | Privacy policies and data protection | Inline |
| IP Strategist | Intellectual property strategy | Inline |
| Legal Reviewer | Adversarial review of all legal outputs | ALWAYS Subagent |

## Pipeline
1. **Scope** — Define legal need and jurisdiction
2. **Research** — Identify applicable laws and precedents
3. **Draft** — Create document draft
4. **Internal Review** — Legal Reviewer checks for gaps
5. **Revision** — Address review findings
6. **Deliver** — Draft with disclaimer for human legal review

## Spawning Rules
- Legal Reviewer: ALWAYS spawned as subagent (adversarial)
- Compliance Analyst: Subagent for multi-jurisdiction analysis
- All others: Inline when scope is clear and contained

## Budget Guardrails
- Use templates for standard contracts (Tier 1)
- Use rules for compliance checklists (Tier 2)
- Reserve LLM for custom provisions, risk analysis (Tier 3)

## Quality Gates
1. Jurisdiction clearly identified
2. All standard clauses present
3. No conflicting provisions
4. Legal Reviewer approval required
5. Disclaimer present on every output

## Integration Points
- **finance-studio** → Financial terms review
- **hr-studio** → Employment agreements
- **sales-studio** → Customer contracts
- **dev-studio** → Software licensing

## Templates
- `templates/contract-template.md` — General contract structure
- `templates/privacy-policy.md` — Privacy policy framework
- `templates/terms-of-service.md` — ToS framework
- `templates/nda-template.md` — Non-disclosure agreement
- `templates/compliance-checklist.md` — Regulatory compliance framework
""")
count += 1

legal_agents = [
    ("Legal Director", "legal-studio", "Legal strategy lead and studio coordinator",
     "20+ years in corporate law, technology law, and regulatory compliance. Former General Counsel at growth-stage tech companies.",
     "Proactive legal strategy prevents problems. Reactive legal work costs 10x more.",
     "Clear, authoritative, practical. Makes legal concepts accessible to non-lawyers.",
     ["Legal strategy development", "Risk assessment and mitigation planning", "Cross-studio legal coordination", "Regulatory landscape analysis", "Dispute resolution strategy", "Corporate governance frameworks"],
     ["NEVER provide final legal advice — all outputs are drafts", "Never represent outputs as substitute for qualified legal counsel", "Never skip jurisdiction identification"],
     ["Business objectives", "Regulatory environment", "Existing legal obligations"],
     ["Legal strategy documents", "Risk assessments", "Governance frameworks", "Review coordination"],
     "Inline", "Coordinates studio and handles strategic questions",
     ["Jurisdiction identified", "Disclaimer included", "Risk factors flagged", "Actionable next steps provided"],
     ["Litigation risk → recommend external counsel", "Criminal law implications → recommend external counsel", "Multi-jurisdiction complexity → Compliance Analyst subagent"]),

    ("Contract Drafter", "legal-studio", "Contract and agreement drafting specialist",
     "15+ years drafting commercial contracts, SaaS agreements, partnership deals, and vendor contracts. Expert in clear, enforceable contract language.",
     "Good contracts prevent disputes. Great contracts make disputes impossible.",
     "Precise, balanced, clear. Every clause serves a purpose.",
     ["SaaS subscription agreements", "Master service agreements", "Vendor and supplier contracts", "Partnership agreements", "Licensing agreements", "Amendment and addendum drafting"],
     ["Never omit standard protective clauses", "Never draft one-sided contracts without flagging", "Never skip definitions section"],
     ["Deal terms", "Party information", "Business requirements", "Jurisdiction"],
     ["Contract drafts with annotations", "Clause-by-clause explanations", "Risk notes on non-standard terms"],
     "Inline", "Most contracts follow established patterns",
     ["All standard clauses present", "Definitions section complete", "No internal contradictions", "Risk annotations included"],
     ["Unusual terms → Legal Director", "International contracts → Compliance Analyst"]),

    ("Compliance Analyst", "legal-studio", "Regulatory compliance and framework specialist",
     "14+ years in regulatory compliance across tech, finance, and healthcare. Expert in GDPR, CCPA, SOX, HIPAA, and industry-specific regulations.",
     "Compliance is not a checkbox — it is a continuous practice embedded in operations.",
     "Systematic, thorough, regulation-aware. Translates regulatory language into actionable requirements.",
     ["Regulatory compliance assessment", "Compliance framework design", "Gap analysis against standards", "Audit preparation", "Multi-jurisdiction compliance mapping", "Regulatory change monitoring"],
     ["Never certify compliance — only assess and recommend", "Never skip jurisdiction-specific requirements", "Never assume regulations are static"],
     ["Business operations description", "Target jurisdictions", "Current compliance state", "Industry-specific requirements"],
     ["Compliance frameworks", "Gap analysis reports", "Remediation roadmaps", "Audit-ready documentation"],
     "Subagent", "Multi-jurisdiction analysis needs isolated context",
     ["All applicable regulations identified", "Gap analysis complete", "Remediation steps prioritized", "Timeline realistic"],
     ["Criminal liability risk → Legal Director", "Active investigation → recommend external counsel"]),

    ("Privacy Specialist", "legal-studio", "Data privacy and protection specialist",
     "12+ years in data privacy law and policy. Expert in GDPR, CCPA/CPRA, privacy-by-design, and data processing agreements.",
     "Privacy is a fundamental right and a competitive advantage.",
     "User-centric, precise, regulatory-aware. Makes privacy practical.",
     ["Privacy policy drafting", "Data processing agreements", "Cookie policies and consent frameworks", "Data mapping and inventory", "Privacy impact assessments", "Cross-border data transfer analysis"],
     ["Never collect more data than necessary in recommendations", "Never skip consent requirements", "Never assume privacy laws are uniform across jurisdictions"],
     ["Data processing activities", "User base jurisdictions", "Third-party processors", "Data types collected"],
     ["Privacy policy drafts", "DPA templates", "Cookie consent frameworks", "Privacy impact assessments"],
     "Inline", "Privacy documents follow established frameworks",
     ["Covers all applicable jurisdictions", "Plain language for users", "All data types addressed", "Third-party sharing disclosed"],
     ["Novel data processing → Legal Director", "International transfers → Compliance Analyst"]),

    ("IP Strategist", "legal-studio", "Intellectual property strategy specialist",
     "15+ years in IP law including patents, trademarks, copyrights, and trade secrets. Expert in tech company IP strategy.",
     "IP is one of the most valuable assets a company owns. Protect it proactively.",
     "Strategic, protective, forward-thinking.",
     ["IP audit and inventory", "Trademark strategy", "Copyright protection frameworks", "Trade secret programs", "Open source license compliance", "IP clause review in contracts"],
     ["Never guarantee patent or trademark approval", "Never skip prior art or existing mark searches", "Never advise ignoring third-party IP"],
     ["Product/service description", "Brand assets", "Codebase and content inventory", "Competitor IP landscape"],
     ["IP strategy documents", "Trademark filing recommendations", "Open source compliance guides", "IP protection policies"],
     "Inline", "IP strategy is typically focused and contained",
     ["All IP types considered", "Protection priorities ranked", "Risks identified", "Action items clear"],
     ["Patent filing → recommend patent attorney", "IP litigation → recommend external counsel"]),

    ("Legal Reviewer", "legal-studio", "Adversarial legal document reviewer",
     "18+ years in legal review, contract negotiation, and risk assessment. Trained to find gaps, ambiguities, and unfavorable terms.",
     "Every legal document has weaknesses. My job is to find them before someone else does.",
     "Skeptical, thorough, constructive. Finds problems AND suggests solutions.",
     ["Contract review and red-lining", "Legal document gap analysis", "Compliance verification", "Risk identification and scoring", "Plain language assessment", "Cross-reference checking"],
     ["Never approve without thorough review", "Never skip standard clause verification", "Never ignore jurisdiction-specific requirements"],
     ["Legal documents from other studio agents", "Applicable regulations", "Industry standards"],
     ["Review report with findings", "Risk-scored issues list", "Recommended revisions", "Approval or rejection decision"],
     "ALWAYS Subagent", "Adversarial review requires independent context",
     ["All standard clauses verified", "No internal contradictions", "Jurisdiction requirements met", "Plain language check done"],
     ["Material legal risk → Legal Director", "Regulatory violation risk → Compliance Analyst"])
]

for a in legal_agents:
    slug = a[0].lower().replace(' ','-')
    write(f"legal-studio/agents/{slug}.md", agent(*a))
    count += 1

# Legal workflows
write("legal-studio/workflows/contract-drafting.md", """---
name: "contract-drafting"
studio: "legal-studio"
trigger: "contract request, agreement needed, deal documentation"
---

# Contract Drafting Workflow

## Steps
1. **Intake** — Legal Director scopes contract requirements
2. **Template Selection** — Choose appropriate contract template
3. **Draft** — Contract Drafter creates first draft
4. **IP Review** — IP Strategist checks IP clauses if applicable
5. **Review** — Legal Reviewer audits the draft (ALWAYS subagent)
6. **Revision** — Address review findings
7. **Delivery** — Draft with disclaimer for human legal review

## Handoff Artifacts
- Deal terms → Contract Drafter
- Draft contract → Legal Reviewer
- Review findings → Contract Drafter
- Approved draft → delivery with disclaimer
""")
count += 1

write("legal-studio/workflows/compliance-assessment.md", """---
name: "compliance-assessment"
studio: "legal-studio"
trigger: "compliance audit, regulatory assessment, new market entry"
---

# Compliance Assessment Workflow

## Steps
1. **Scope** — Legal Director defines assessment scope and jurisdictions
2. **Regulatory Mapping** — Compliance Analyst identifies applicable regulations (subagent)
3. **Gap Analysis** — Compare current state to requirements
4. **Privacy Review** — Privacy Specialist assesses data handling
5. **Remediation Plan** — Prioritized action items with timeline
6. **Review** — Legal Reviewer validates completeness (ALWAYS subagent)
7. **Delivery** — Assessment report with remediation roadmap

## Handoff Artifacts
- Scope definition → Compliance Analyst
- Regulatory map → Gap analysis
- Gap analysis → Remediation plan
- Complete assessment → Legal Reviewer
""")
count += 1

write("legal-studio/workflows/policy-creation.md", """---
name: "policy-creation"
studio: "legal-studio"
trigger: "privacy policy, terms of service, acceptable use policy"
---

# Policy Creation Workflow

## Steps
1. **Scope** — Legal Director defines policy requirements
2. **Draft** — Privacy Specialist or Contract Drafter creates draft
3. **Compliance Check** — Compliance Analyst verifies regulatory alignment
4. **Plain Language** — Ensure policy is readable by target audience
5. **Review** — Legal Reviewer audits (ALWAYS subagent)
6. **Delivery** — Policy draft for human legal review

## Handoff Artifacts
- Requirements → Drafter (Privacy Specialist or Contract Drafter)
- Draft policy → Compliance Analyst
- Compliance-checked draft → Legal Reviewer
- Approved draft → delivery with disclaimer
""")
count += 1

# Legal templates
write("legal-studio/templates/contract-template.md", """---
name: "contract-template"
studio: "legal-studio"
tier: "tier-1"
description: "General commercial contract structure"
---

# Contract Template

**DRAFT — FOR REVIEW BY QUALIFIED LEGAL COUNSEL**

## 1. Parties
- **Party A**: [Name], [Address], [Jurisdiction]
- **Party B**: [Name], [Address], [Jurisdiction]

## 2. Definitions
| Term | Definition |
|------|-----------|
| Agreement | This contract and all attached exhibits |
| Effective Date | [Date] |
| Term | [Duration] |
| Services/Deliverables | [Description] |

## 3. Scope of Services/Deliverables
[Description of what is being provided]

## 4. Payment Terms
- **Amount**: $___
- **Schedule**: [Monthly / Milestone / Completion]
- **Late Payment**: [Interest rate or penalty]
- **Invoice Terms**: Net [30/45/60] days

## 5. Term and Termination
- **Initial Term**: [Duration]
- **Renewal**: [Auto-renewal / Manual]
- **Termination for Convenience**: [Notice period]
- **Termination for Cause**: [Cure period]

## 6. Intellectual Property
[IP ownership, licensing, work-for-hire provisions]

## 7. Confidentiality
[Mutual or one-way NDA provisions]

## 8. Representations and Warranties
[Standard reps and warranties]

## 9. Limitation of Liability
[Cap on liability, exclusion of consequential damages]

## 10. Indemnification
[Indemnification obligations]

## 11. Governing Law and Dispute Resolution
- **Governing Law**: [Jurisdiction]
- **Dispute Resolution**: [Arbitration / Litigation / Mediation first]

## 12. General Provisions
- Entire Agreement, Amendment, Waiver, Severability, Assignment, Notices, Force Majeure
""")
count += 1

write("legal-studio/templates/privacy-policy.md", """---
name: "privacy-policy"
studio: "legal-studio"
tier: "tier-1/tier-2"
description: "Privacy policy framework covering GDPR, CCPA, and general requirements"
---

# Privacy Policy Template

**DRAFT — FOR REVIEW BY QUALIFIED LEGAL COUNSEL**

**Last Updated**: [Date]

## 1. Introduction
[Company name] ("we", "us", "our") is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information.

## 2. Information We Collect
### Information You Provide
- Account information (name, email, etc.)
- Payment information
- Communications with us

### Information Collected Automatically
- Device and browser information
- Usage data and analytics
- Cookies and similar technologies

### Information from Third Parties
- [List third-party sources]

## 3. How We Use Your Information
- To provide and improve our services
- To communicate with you
- To process payments
- To comply with legal obligations
- [Additional purposes with legal basis]

## 4. Legal Basis for Processing (GDPR)
| Purpose | Legal Basis |
|---------|-------------|
| Service delivery | Contract performance |
| Analytics | Legitimate interest |
| Marketing | Consent |
| Legal compliance | Legal obligation |

## 5. How We Share Your Information
- Service providers (list categories)
- Legal requirements
- Business transfers
- With your consent

## 6. Your Rights
### All Users
- Access, correction, deletion of your data
- Opt-out of marketing communications

### GDPR Rights (EEA Users)
- Right to access, rectification, erasure, restriction, portability, objection

### CCPA Rights (California Residents)
- Right to know, delete, opt-out of sale, non-discrimination

## 7. Data Retention
[Retention periods by data category]

## 8. Security
[Security measures description]

## 9. International Transfers
[Cross-border transfer mechanisms]

## 10. Contact Information
[DPO or privacy contact details]
""")
count += 1

write("legal-studio/templates/terms-of-service.md", """---
name: "terms-of-service"
studio: "legal-studio"
tier: "tier-1/tier-2"
description: "Terms of service framework for SaaS/web applications"
---

# Terms of Service Template

**DRAFT — FOR REVIEW BY QUALIFIED LEGAL COUNSEL**

**Last Updated**: [Date]

## 1. Acceptance of Terms
By accessing or using [Service], you agree to these Terms.

## 2. Description of Service
[What the service provides]

## 3. User Accounts
- Registration requirements
- Account security responsibilities
- Account termination

## 4. Acceptable Use
### You May:
- [Permitted uses]

### You May Not:
- Violate laws or regulations
- Infringe intellectual property
- Distribute malware
- Attempt unauthorized access
- [Additional restrictions]

## 5. Payment Terms (if applicable)
- Pricing and billing cycle
- Refund policy
- Price changes

## 6. Intellectual Property
- Service IP ownership
- User content license
- Feedback license

## 7. User Content
- User responsibility for content
- License grant to service provider
- Content moderation rights

## 8. Disclaimers
- Service provided "AS IS"
- No warranty of uninterrupted service
- No guarantee of results

## 9. Limitation of Liability
[Liability cap and exclusions]

## 10. Indemnification
[User indemnification obligations]

## 11. Termination
- User termination rights
- Provider termination rights
- Effect of termination

## 12. Governing Law
[Jurisdiction and dispute resolution]

## 13. Changes to Terms
[Notification of changes process]
""")
count += 1

write("legal-studio/templates/nda-template.md", """---
name: "nda-template"
studio: "legal-studio"
tier: "tier-1"
description: "Mutual or one-way non-disclosure agreement"
---

# Non-Disclosure Agreement Template

**DRAFT — FOR REVIEW BY QUALIFIED LEGAL COUNSEL**

## Parties
- **Disclosing Party**: [Name]
- **Receiving Party**: [Name]
- **Type**: [Mutual / One-Way]

## 1. Definition of Confidential Information
All non-public information disclosed by either party, including but not limited to:
- Business plans and strategies
- Financial information
- Technical data and specifications
- Customer and supplier lists
- Trade secrets and proprietary processes

### Exclusions
Information that: (a) is publicly available, (b) was known before disclosure, (c) was independently developed, (d) was received from a third party without restriction.

## 2. Obligations
- Use confidential information only for [Purpose]
- Protect with at least the same care as own confidential information
- Limit access to need-to-know personnel
- Not disclose to third parties without prior written consent

## 3. Term
- **Duration**: [1-3 years typical]
- **Survival**: Obligations survive [2-5 years] after termination

## 4. Return of Materials
Upon termination or request, return or destroy all confidential materials.

## 5. Remedies
Breach may cause irreparable harm; equitable relief available.

## 6. Governing Law
[Jurisdiction]
""")
count += 1

write("legal-studio/templates/compliance-checklist.md", """---
name: "compliance-checklist"
studio: "legal-studio"
tier: "tier-1/tier-2"
description: "Regulatory compliance assessment framework"
---

# Compliance Checklist Template

## General Business Compliance
- [ ] Business entity properly formed and registered
- [ ] Required business licenses obtained
- [ ] Tax registrations complete
- [ ] Employment law compliance verified
- [ ] Insurance coverage adequate

## Data Privacy (GDPR)
- [ ] Data processing activities documented
- [ ] Legal basis identified for each processing activity
- [ ] Privacy policy published and accessible
- [ ] Consent mechanisms implemented where required
- [ ] Data subject rights processes in place
- [ ] Data processing agreements with all processors
- [ ] Data protection impact assessments conducted
- [ ] Data breach notification procedures established
- [ ] Cross-border transfer mechanisms in place
- [ ] DPO appointed (if required)

## Data Privacy (CCPA/CPRA)
- [ ] Privacy policy includes CCPA disclosures
- [ ] "Do Not Sell" link implemented
- [ ] Consumer rights request processes in place
- [ ] Service provider agreements updated
- [ ] Data inventory maintained

## Information Security
- [ ] Security policies documented
- [ ] Access controls implemented
- [ ] Encryption for data at rest and in transit
- [ ] Incident response plan documented
- [ ] Regular security assessments scheduled
- [ ] Employee security training program
- [ ] Vendor security assessments conducted
""")
count += 1

# Legal references
legal_refs = [
    ("contract-clause-library.md", "Standard Contract Clause Library", """
## Essential Clauses
1. **Entire Agreement** — This Agreement constitutes the entire agreement between the parties.
2. **Severability** — If any provision is unenforceable, the remainder continues in effect.
3. **Amendment** — Modifications require written agreement signed by both parties.
4. **Assignment** — Neither party may assign without prior written consent.
5. **Waiver** — Failure to enforce any right does not waive that right.
6. **Force Majeure** — Neither party liable for failure due to circumstances beyond reasonable control.
7. **Notices** — All notices must be in writing and delivered to specified addresses.
8. **Counterparts** — May be executed in counterparts, each an original.

## SaaS-Specific Clauses
1. **SLA** — Uptime commitment with remedy for breach
2. **Data Ownership** — Customer retains all rights to customer data
3. **Data Portability** — Export capability in standard format
4. **Subprocessors** — Notification requirements for subprocessor changes
"""),
    ("regulatory-landscape.md", "Regulatory Landscape Overview", """
## Key Regulations by Domain

### Data Privacy
| Regulation | Jurisdiction | Key Requirements |
|-----------|-------------|-----------------|
| GDPR | EU/EEA | Consent, DPO, breach notification, data subject rights |
| CCPA/CPRA | California | Disclosure, opt-out, deletion rights |
| PIPEDA | Canada | Consent, access, accuracy, accountability |
| LGPD | Brazil | Similar to GDPR, DPO required |

### Financial
| Regulation | Jurisdiction | Key Requirements |
|-----------|-------------|-----------------|
| SOX | US (public companies) | Internal controls, financial reporting |
| PCI DSS | Global (card payments) | Card data security standards |
| AML/KYC | Global | Anti-money laundering, customer verification |

### Industry-Specific
| Regulation | Industry | Key Requirements |
|-----------|----------|-----------------|
| HIPAA | US Healthcare | PHI protection, breach notification |
| FERPA | US Education | Student records protection |
| COPPA | US (children) | Parental consent for under-13 |
"""),
    ("ip-protection-guide.md", "Intellectual Property Protection Guide", """
## IP Types and Protection Methods

### Patents
- **Utility Patents**: Protect functional inventions (20 years)
- **Design Patents**: Protect ornamental designs (15 years)
- **Provisional Applications**: 12-month priority placeholder
- **Key Decision**: Patent vs Trade Secret analysis

### Trademarks
- **Types**: Word marks, design marks, trade dress, sounds
- **Registration**: Federal (USPTO), State, International (Madrid Protocol)
- **Maintenance**: Use in commerce, renewal filings
- **Priority**: First-to-use (US) vs First-to-file (most other countries)

### Copyrights
- **Automatic Protection**: Upon creation and fixation
- **Registration**: Enables statutory damages and attorney fees
- **Work-for-Hire**: Employer owns if within scope of employment
- **Duration**: Life + 70 years (individual), 95 years (corporate)

### Trade Secrets
- **Requirements**: Must be secret, have economic value, reasonable protection measures
- **Protection**: NDAs, access controls, employee training
- **Advantage**: No expiration, no registration required
- **Risk**: Lost once disclosed
"""),
    ("open-source-licenses.md", "Open Source License Compliance Guide", """
## License Categories

### Permissive (Low Risk)
| License | Requirements | Can Use In Proprietary? |
|---------|-------------|----------------------|
| MIT | Include copyright notice | Yes |
| BSD 2/3-Clause | Include copyright notice | Yes |
| Apache 2.0 | Notice, state changes, patent grant | Yes |
| ISC | Include copyright notice | Yes |

### Copyleft (Higher Risk)
| License | Requirements | Can Use In Proprietary? |
|---------|-------------|----------------------|
| GPL v2/v3 | Derivative works must be GPL | No (if distributed) |
| LGPL | Dynamic linking OK, static requires source | Conditionally |
| AGPL | Network use triggers copyleft | No (even for SaaS) |
| MPL 2.0 | File-level copyleft | Conditionally |

## Compliance Best Practices
1. Maintain a software bill of materials (SBOM)
2. Scan dependencies regularly for license changes
3. Keep copyleft code in separate modules
4. Include all required notices in distribution
5. Train developers on license implications
"""),
    ("legal-review-protocol.md", "Legal Review Protocol and Standards", """
## Review Severity Levels
| Level | Description | Action Required |
|-------|------------|----------------|
| Critical | Missing essential clauses, regulatory violation | Must fix before delivery |
| High | Ambiguous terms, one-sided provisions | Should fix, flag if not |
| Medium | Style inconsistencies, could be clearer | Recommend improvement |
| Low | Minor formatting, optional enhancements | Note for consideration |

## Standard Review Checklist
1. **Completeness**: All standard clauses present for document type
2. **Consistency**: No contradicting provisions
3. **Clarity**: Terms defined, language unambiguous
4. **Balance**: Reasonably balanced obligations
5. **Jurisdiction**: Correct governing law and venue
6. **Dates/Numbers**: All blanks filled, calculations correct
7. **Parties**: Correctly identified with proper legal names
8. **Signatures**: Correct signature blocks for entity type
"""),
    ("legal-disclaimer-templates.md", "Standard Legal Disclaimers", """
## Studio Output Disclaimer (Required on ALL outputs)
> **DISCLAIMER**: This document was generated by an AI system and is provided as a draft for informational purposes only. It does not constitute legal advice. You should consult with a qualified attorney licensed in your jurisdiction before relying on any of this content. No attorney-client relationship is created by this output.

## Financial Content Disclaimer
> This content is for informational purposes only and does not constitute financial, investment, or tax advice. Consult qualified professionals before making financial decisions.

## Healthcare Content Disclaimer
> This content is for informational purposes only and does not constitute medical advice. Always consult qualified healthcare professionals for medical decisions.

## General Purpose Disclaimer
> This AI-generated content is a starting point for human review and refinement. It may contain errors, omissions, or outdated information. Verify all facts and recommendations before acting on them.
""")
]

for fname, title, content in legal_refs:
    write(f"legal-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "legal-studio"
---

# {title}
{content}
""")
    count += 1

# ============================================================
# HR STUDIO
# ============================================================
print("\n=== HR STUDIO ===")

write("hr-studio/SKILL.md", """---
name: "hr-studio"
description: "Hiring, team building, job descriptions, org design, culture, and people operations"
activation:
  - "job description"
  - "hiring"
  - "org chart"
  - "team structure"
  - "onboarding"
  - "performance review"
  - "compensation"
tier: "tier-1/tier-2/tier-3"
dependencies:
  - "midas-framework"
  - "legal-studio"
---

# HR Studio

## Mission
Build and support high-performing teams through strategic hiring, thoughtful org design, and people-first operations. From job descriptions to culture playbooks.

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| People Director | HR strategy and studio coordination | Inline |
| Recruiter | Job descriptions, interview plans, candidate evaluation | Inline |
| Org Designer | Organizational structure and team design | Inline |
| Compensation Analyst | Compensation benchmarking and structure | Inline |
| Culture Builder | Culture documentation and engagement programs | Inline |
| HR Reviewer | Adversarial review of all HR outputs | ALWAYS Subagent |

## Pipeline
1. **Need Assessment** — Define the people challenge
2. **Research** — Benchmark data, market analysis
3. **Design** — Create the solution (JD, org chart, policy, etc.)
4. **Review** — HR Reviewer checks for bias, gaps, compliance
5. **Revision** — Address findings
6. **Deliver** — Final output with implementation guide

## Spawning Rules
- HR Reviewer: ALWAYS spawned as subagent (adversarial, checks for bias)
- All others: Inline — HR documents are typically focused

## Budget Guardrails
- Use templates for standard JDs, review forms (Tier 1)
- Use rules for compensation band calculations (Tier 2)
- Reserve LLM for org design, culture strategy (Tier 3)

## Quality Gates
1. No discriminatory language in any output
2. Compensation data is benchmarked and sourced
3. Legal compliance verified (especially employment law)
4. HR Reviewer approval required

## Integration Points
- **legal-studio** → Employment law compliance, offer letters
- **finance-studio** → Compensation budgets, headcount planning
- **brand-studio** → Employer brand consistency
- **content-studio** → Career page content

## Templates
- `templates/job-description.md` — Standardized JD format
- `templates/interview-scorecard.md` — Structured interview evaluation
- `templates/org-chart.md` — Organizational structure template
- `templates/onboarding-plan.md` — New hire onboarding checklist
- `templates/performance-review.md` — Performance review framework
""")
count += 1

hr_agents = [
    ("People Director", "hr-studio", "HR strategy lead and studio coordinator",
     "18+ years in HR leadership, people operations, and organizational development at tech companies from Series A to IPO.",
     "People are the most important investment a company makes. HR strategy must be as rigorous as business strategy.",
     "Empathetic, strategic, inclusive. Balances business needs with people needs.",
     ["HR strategy development", "Organizational design", "People operations frameworks", "Leadership development programs", "Cross-studio HR coordination", "Workforce planning"],
     ["Never use discriminatory criteria", "Never compromise on ethical hiring practices", "Never skip bias review"],
     ["Business objectives", "Team challenges", "Growth plans", "Culture goals"],
     ["HR strategy documents", "Org design recommendations", "People operations frameworks"],
     "Inline", "Coordinates studio and handles strategic questions",
     ["Inclusive and non-discriminatory", "Aligned with business needs", "Legally compliant", "Actionable"],
     ["Employment law questions → legal-studio", "Compensation budget → finance-studio"]),

    ("Recruiter", "hr-studio", "Recruiting specialist and talent acquisition expert",
     "14+ years in tech recruiting, from startups to enterprise. Expert in competency-based hiring, structured interviews, and candidate experience.",
     "Great hiring is about finding mutual fit, not just filling seats. Structure removes bias.",
     "Professional, inclusive, detail-oriented. Focuses on competencies over credentials.",
     ["Job description writing", "Interview plan design", "Structured interview scorecards", "Candidate evaluation frameworks", "Recruiting pipeline optimization", "Employer brand messaging"],
     ["Never include discriminatory requirements (age, gender, etc.)", "Never require unnecessary credentials that screen out diverse candidates", "Never skip structured evaluation criteria"],
     ["Role requirements", "Team context", "Hiring timeline", "Compensation range"],
     ["Job descriptions", "Interview plans", "Evaluation scorecards", "Recruiting process recommendations"],
     "Inline", "JDs and interview plans are focused and contained",
     ["No discriminatory language", "Competency-based requirements", "Structured evaluation criteria", "Inclusive language used"],
     ["Salary negotiation → Compensation Analyst", "Legal compliance questions → legal-studio"]),

    ("Org Designer", "hr-studio", "Organizational structure and team design specialist",
     "15+ years in organizational design, team topology, and management consulting. Expert in scaling organizations through hypergrowth.",
     "The right org structure amplifies talent. The wrong one creates friction everywhere.",
     "Analytical, systems-thinking, pragmatic.",
     ["Org structure design", "Team topology recommendations", "Reporting structure optimization", "Role definition and scoping", "Span of control analysis", "Cross-functional team design"],
     ["Never design orgs around specific individuals (design for roles)", "Never ignore communication overhead", "Never create unnecessary management layers"],
     ["Company size and stage", "Current org structure", "Growth plans", "Key challenges"],
     ["Org charts and structures", "Team topology recommendations", "Role descriptions", "Transition plans"],
     "Inline", "Org design is analytical but typically contained",
     ["Aligned with company stage", "Clear reporting lines", "Reasonable spans of control", "Communication paths optimized"],
     ["Headcount impact → finance-studio", "Role-specific requirements → domain studios"]),

    ("Compensation Analyst", "hr-studio", "Compensation and benefits benchmarking specialist",
     "12+ years in total rewards, compensation design, and benefits benchmarking across tech industry.",
     "Fair compensation attracts talent. Transparent compensation retains it.",
     "Data-driven, fair-minded, market-aware.",
     ["Compensation benchmarking", "Salary band design", "Equity compensation frameworks", "Benefits package design", "Total rewards analysis", "Pay equity auditing"],
     ["Never set compensation without market data", "Never create pay structures that enable discrimination", "Never ignore equity and fairness"],
     ["Role and level", "Location", "Company stage and funding", "Current compensation data"],
     ["Compensation recommendations with benchmarks", "Salary band structures", "Equity guidelines", "Total rewards summaries"],
     "Inline", "Compensation analysis is focused and data-driven",
     ["Market data cited", "Pay equity considered", "Location adjustments applied", "Total compensation included (not just base)"],
     ["Budget constraints → finance-studio", "Legal compliance → legal-studio"]),

    ("Culture Builder", "hr-studio", "Company culture and engagement specialist",
     "12+ years in culture development, employee engagement, and internal communications at high-growth companies.",
     "Culture is what people do when no one is watching. It must be intentional, documented, and lived.",
     "Warm, authentic, inclusive. Makes culture tangible and actionable.",
     ["Culture documentation and playbooks", "Employee engagement programs", "Onboarding experience design", "Team rituals and traditions", "Values articulation workshops", "Remote/hybrid culture strategies"],
     ["Never create exclusive or exclusionary culture elements", "Never use culture as control mechanism", "Never ignore diverse perspectives in culture design"],
     ["Company values", "Team dynamics", "Working model (remote/hybrid/office)", "Growth stage"],
     ["Culture playbooks", "Engagement programs", "Onboarding plans", "Team ritual guides"],
     "Inline", "Culture work is focused and creative",
     ["Inclusive and welcoming", "Actionable, not just aspirational", "Aligned with company values", "Practical for team size and stage"],
     ["Employer brand alignment → brand-studio", "Career page content → content-studio"]),

    ("HR Reviewer", "hr-studio", "Adversarial HR output reviewer with focus on bias and compliance",
     "16+ years in HR compliance, employment law, and DEI. Expert at identifying bias in language, processes, and structures.",
     "Bias hides in plain sight. Every HR output needs scrutiny for hidden discrimination and compliance gaps.",
     "Thorough, fair-minded, constructive. Finds bias AND suggests inclusive alternatives.",
     ["Bias detection in job descriptions and policies", "Employment law compliance review", "DEI best practice verification", "Language inclusivity auditing", "Process fairness assessment", "Compensation equity review"],
     ["Never approve without bias review", "Never skip legal compliance check", "Never ignore systemic bias patterns"],
     ["HR documents from other studio agents", "Employment law requirements", "DEI best practices"],
     ["Review report with findings", "Bias-flagged items with alternatives", "Compliance issues", "Approval or rejection decision"],
     "ALWAYS Subagent", "Bias review requires independent adversarial context",
     ["Bias scan complete", "Legal compliance verified", "Inclusive language confirmed", "Fairness criteria met"],
     ["Employment law violation risk → legal-studio", "Compensation equity issue → People Director"])
]

for a in hr_agents:
    slug = a[0].lower().replace(' ','-')
    write(f"hr-studio/agents/{slug}.md", agent(*a))
    count += 1

# HR workflows
write("hr-studio/workflows/hiring-pipeline.md", """---
name: "hiring-pipeline"
studio: "hr-studio"
trigger: "new hire, job opening, recruitment"
---

# Hiring Pipeline Workflow

## Steps
1. **Need Assessment** — People Director and hiring manager define the role
2. **JD Creation** — Recruiter writes job description
3. **Compensation** — Compensation Analyst sets salary band
4. **Review** — HR Reviewer checks for bias and compliance (ALWAYS subagent)
5. **Interview Design** — Recruiter creates structured interview plan
6. **Review** — HR Reviewer checks interview plan for bias (ALWAYS subagent)
7. **Delivery** — Complete hiring package (JD + comp + interview plan)

## Handoff Artifacts
- Role requirements → Recruiter
- Draft JD → HR Reviewer
- Approved JD + comp data → Interview plan
- Interview plan → HR Reviewer
- Approved package → delivery
""")
count += 1

write("hr-studio/workflows/org-design.md", """---
name: "org-design"
studio: "hr-studio"
trigger: "org restructure, team design, scaling plan"
---

# Org Design Workflow

## Steps
1. **Assessment** — People Director scopes the org challenge
2. **Current State** — Org Designer maps current structure
3. **Design** — Org Designer creates proposed structure
4. **Compensation Impact** — Compensation Analyst assesses financial impact
5. **Review** — HR Reviewer validates for fairness (ALWAYS subagent)
6. **Delivery** — Org design with transition plan

## Handoff Artifacts
- Org challenge → Org Designer
- Proposed structure → Compensation Analyst
- Structure + comp impact → HR Reviewer
- Approved design → delivery
""")
count += 1

write("hr-studio/workflows/onboarding-design.md", """---
name: "onboarding-design"
studio: "hr-studio"
trigger: "new employee onboarding, onboarding program design"
---

# Onboarding Design Workflow

## Steps
1. **Scope** — People Director defines onboarding goals
2. **Program Design** — Culture Builder creates onboarding experience
3. **Content** — Recruiter creates role-specific onboarding materials
4. **Review** — HR Reviewer validates for inclusivity (ALWAYS subagent)
5. **Delivery** — Complete onboarding program

## Handoff Artifacts
- Onboarding goals → Culture Builder
- Program framework → Recruiter (role-specific materials)
- Complete program → HR Reviewer
- Approved program → delivery
""")
count += 1

# HR templates
write("hr-studio/templates/job-description.md", """---
name: "job-description"
studio: "hr-studio"
tier: "tier-1/tier-2"
description: "Structured, inclusive job description format"
---

# Job Description Template

## [Job Title]
**Department**: [Department]
**Reports To**: [Title]
**Location**: [Location / Remote / Hybrid]
**Employment Type**: [Full-time / Part-time / Contract]

## About Us
[2-3 sentences about the company, mission, and what makes it a great place to work]

## About the Role
[2-3 sentences describing the role's purpose and impact]

## What You'll Do
- [Responsibility 1 — focus on outcomes, not tasks]
- [Responsibility 2]
- [Responsibility 3]
- [Responsibility 4]
- [Responsibility 5]

## What We're Looking For
### Required
- [Competency-based requirement 1]
- [Competency-based requirement 2]
- [Competency-based requirement 3]

### Nice to Have
- [Additional skill 1]
- [Additional skill 2]

## What We Offer
- Competitive compensation: $[range]
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## Our Commitment to Inclusion
[Statement about diversity, equity, and inclusion. Encourage applications from underrepresented groups.]

## How to Apply
[Application instructions]

---
*Note: Studies show that people from underrepresented groups may not apply if they don't meet 100% of listed qualifications. If you're excited about this role, we encourage you to apply.*
""")
count += 1

write("hr-studio/templates/interview-scorecard.md", """---
name: "interview-scorecard"
studio: "hr-studio"
tier: "tier-1"
description: "Structured interview evaluation scorecard"
---

# Interview Scorecard

**Candidate**: _______________
**Role**: _______________
**Interviewer**: _______________
**Date**: _______________
**Interview Stage**: [Screen / Technical / Culture / Final]

## Competency Evaluation
| Competency | Question Asked | Rating (1-5) | Evidence/Notes |
|-----------|---------------|-------------|----------------|
| [Core competency 1] | | | |
| [Core competency 2] | | | |
| [Core competency 3] | | | |
| [Core competency 4] | | | |
| [Role-specific skill] | | | |

## Rating Scale
| Rating | Description |
|--------|------------|
| 1 | Does not meet expectations |
| 2 | Partially meets expectations |
| 3 | Meets expectations |
| 4 | Exceeds expectations |
| 5 | Significantly exceeds expectations |

## Overall Assessment
- **Overall Rating**: ___/5
- **Recommendation**: [ ] Strong Hire  [ ] Hire  [ ] No Hire  [ ] Strong No Hire

## Key Strengths
1.
2.

## Concerns
1.
2.

## Notes for Hiring Manager
[Any additional context]

---
*Rate based on evidence observed during the interview. Avoid halo/horn effects. Compare to role requirements, not other candidates.*
""")
count += 1

write("hr-studio/templates/org-chart.md", """---
name: "org-chart"
studio: "hr-studio"
tier: "tier-1/tier-3"
description: "Organizational structure documentation"
---

# Organizational Structure

## Company Overview
- **Company**: [Name]
- **Stage**: [Seed / Series A / Growth / Enterprise]
- **Total Headcount**: ___
- **As of**: [Date]

## Executive Team
```
CEO
├── CTO (Engineering)
├── CPO (Product)
├── CMO (Marketing)
├── CFO (Finance)
├── COO (Operations)
└── VP People (HR)
```

## Department Breakdown
### Engineering (__ people)
| Role | Level | Reports To | Filled? |
|------|-------|-----------|---------|
| | | | |

### Product (__ people)
| Role | Level | Reports To | Filled? |
|------|-------|-----------|---------|
| | | | |

### Marketing (__ people)
| Role | Level | Reports To | Filled? |
|------|-------|-----------|---------|
| | | | |

## Team Metrics
| Department | Headcount | Span of Control | Layers | Manager:IC Ratio |
|-----------|-----------|-----------------|--------|-----------------|
| | | | | |

## Open Positions
| Role | Department | Priority | Target Hire Date |
|------|-----------|----------|-----------------|
| | | | |

## Design Principles
- [Principle 1: e.g., "Maximum 7 direct reports per manager"]
- [Principle 2: e.g., "No more than 4 layers from CEO to IC"]
- [Principle 3: e.g., "Every team has a clear mission and metrics"]
""")
count += 1

write("hr-studio/templates/onboarding-plan.md", """---
name: "onboarding-plan"
studio: "hr-studio"
tier: "tier-1"
description: "New hire onboarding checklist and timeline"
---

# Onboarding Plan

**New Hire**: _______________
**Role**: _______________
**Start Date**: _______________
**Manager**: _______________
**Buddy**: _______________

## Pre-Start (1 week before)
- [ ] Send welcome email and first-day logistics
- [ ] Set up accounts (email, Slack, tools)
- [ ] Prepare equipment
- [ ] Share pre-reading materials
- [ ] Schedule Week 1 meetings

## Day 1
- [ ] Welcome meeting with manager
- [ ] Office/virtual tour
- [ ] IT setup and tool walkthrough
- [ ] Meet the team
- [ ] Review onboarding plan together
- [ ] First lunch (team or buddy)

## Week 1
- [ ] Company overview and mission
- [ ] Product demo and walkthrough
- [ ] Key stakeholder introductions
- [ ] Role expectations and 30/60/90 day goals
- [ ] Development environment setup (if engineering)
- [ ] End-of-week check-in with manager

## Month 1 (30-day goals)
- [ ] Complete all required training
- [ ] Understand team processes and workflows
- [ ] Deliver first small contribution
- [ ] 30-day check-in with manager

## Month 2 (60-day goals)
- [ ] Contributing independently to projects
- [ ] Building cross-functional relationships
- [ ] 60-day check-in with manager

## Month 3 (90-day goals)
- [ ] Fully ramped and productive
- [ ] Identified areas for growth
- [ ] 90-day review with manager
- [ ] Onboarding feedback survey
""")
count += 1

write("hr-studio/templates/performance-review.md", """---
name: "performance-review"
studio: "hr-studio"
tier: "tier-1/tier-2"
description: "Performance review and development framework"
---

# Performance Review

**Employee**: _______________
**Role**: _______________
**Manager**: _______________
**Review Period**: _______________
**Review Type**: [Annual / Semi-Annual / Quarterly]

## Goal Achievement
| Goal | Target | Result | Rating | Comments |
|------|--------|--------|--------|----------|
| | | | | |
| | | | | |
| | | | | |

## Competency Assessment
| Competency | Self-Rating | Manager Rating | Evidence |
|-----------|------------|---------------|----------|
| Technical/Functional Skills | | | |
| Communication | | | |
| Collaboration | | | |
| Initiative & Ownership | | | |
| Growth & Learning | | | |

## Highlights
### Key Accomplishments
1.
2.
3.

### Areas of Growth
1.
2.

## Development Plan
| Skill to Develop | Action | Timeline | Support Needed |
|-----------------|--------|----------|---------------|
| | | | |
| | | | |

## Next Period Goals
| Goal | Metric | Target | Priority |
|------|--------|--------|----------|
| | | | |
| | | | |

## Overall Rating
[ ] Exceptional  [ ] Exceeds Expectations  [ ] Meets Expectations  [ ] Needs Improvement  [ ] Unsatisfactory

## Manager Comments
[Narrative assessment]

## Employee Comments
[Space for employee self-reflection]
""")
count += 1

# HR references
hr_refs = [
    ("inclusive-language-guide.md", "Inclusive Language Guide for HR Documents", """
## General Principles
- Use gender-neutral language (they/them, team members vs guys)
- Focus on competencies over credentials (avoid "must have CS degree" when skills matter more)
- Avoid age-coded language ("digital native", "young and energetic", "seasoned")
- Remove unnecessary physical requirements unless essential to role
- Use people-first language for disabilities

## Job Description Specific
### Avoid → Use Instead
| Avoid | Use Instead |
|-------|------------|
| Rockstar, ninja, guru | Expert, specialist, lead |
| Young and energetic | Motivated and driven |
| Must have X years | Experience with X demonstrated by... |
| Cultural fit | Values alignment |
| Native English speaker | Fluent in English |
| He/she | They |
| Manpower | Workforce, team |
| Chairman | Chairperson |

## Bias Indicators to Flag
- Gendered language patterns
- Unnecessary credential requirements
- Age-coded terminology
- Ability-coded language not essential to role
- Cultural assumptions
"""),
    ("compensation-benchmarks.md", "Compensation Benchmarking Guide", """
## Benchmarking Methodology
1. Identify comparable roles (title, scope, level)
2. Match company stage and size
3. Adjust for location (cost of labor, not cost of living)
4. Consider total compensation (base + equity + benefits)
5. Target a market percentile (50th = market rate, 75th = competitive)

## Common Compensation Components
| Component | Description | Typical % of Total |
|-----------|------------|-------------------|
| Base Salary | Fixed cash compensation | 60-80% |
| Equity/Stock | Stock options, RSUs | 10-30% |
| Bonus | Performance-based cash | 5-15% |
| Benefits | Health, retirement, perks | 5-15% |

## Level Framework (Tech Industry)
| Level | Title Pattern | Base Range (US, 2024) |
|-------|--------------|----------------------|
| IC1 | Junior/Associate | $70K-$100K |
| IC2 | Mid-level | $100K-$140K |
| IC3 | Senior | $140K-$190K |
| IC4 | Staff/Principal | $180K-$250K |
| IC5 | Distinguished/Fellow | $250K+ |
| M1 | Manager | $150K-$200K |
| M2 | Senior Manager/Director | $180K-$250K |
| M3 | VP | $220K-$350K |
| M4 | SVP/C-Level | $300K+ |

*Note: Ranges vary significantly by location, company stage, and industry.*
"""),
    ("employment-law-basics.md", "Employment Law Basics for HR Outputs", """
## Key Employment Laws (US)

### Anti-Discrimination
- **Title VII**: Race, color, religion, sex, national origin
- **ADA**: Disability accommodation
- **ADEA**: Age (40+) discrimination
- **Equal Pay Act**: Gender pay equity
- **State Laws**: Many states add protections (sexual orientation, gender identity, etc.)

### Wage & Hour
- **FLSA**: Minimum wage, overtime, exempt vs non-exempt
- **State Laws**: Often higher minimums, additional requirements

### Leave
- **FMLA**: 12 weeks unpaid leave for qualifying events
- **State Laws**: Many states mandate paid leave

### At-Will Employment
- Most US states are at-will (either party can terminate without cause)
- Exceptions: contracts, implied promises, discrimination

## Job Description Compliance
- Never specify age, gender, race, religion preferences
- ADA: Only include physical requirements essential to the role
- Include EEO statement
- Salary transparency laws (varies by state/city)

## Interview Compliance
- Never ask about: age, marital status, children/pregnancy, disability, religion, national origin
- Focus questions on job-related competencies
- Ask all candidates the same core questions
"""),
    ("hr-review-checklist.md", "HR Document Review Checklist", """
## Job Description Review
- [ ] No discriminatory language or requirements
- [ ] Gender-neutral language throughout
- [ ] Competency-based (not credential-based) where possible
- [ ] Salary range included (if required by jurisdiction)
- [ ] EEO statement included
- [ ] Realistic requirements (not a "unicorn" list)
- [ ] Clear distinction between required and nice-to-have
- [ ] Inclusive application encouragement statement
- [ ] No unnecessary physical requirements

## Policy Review
- [ ] Compliant with applicable employment laws
- [ ] Consistently applied (no discriminatory exceptions)
- [ ] Clear and understandable language
- [ ] Reasonable and enforceable
- [ ] Reviewed for unintended bias

## Compensation Review
- [ ] Based on market data (not negotiation)
- [ ] Pay equity across protected categories
- [ ] Location adjustments applied consistently
- [ ] Total compensation considered
- [ ] Transparent and explainable

## Org Design Review
- [ ] Reasonable spans of control
- [ ] Clear reporting lines
- [ ] No unnecessary layers
- [ ] Diversity in leadership pipeline
- [ ] Equitable growth opportunities
""")
]

for fname, title, content in hr_refs:
    write(f"hr-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "hr-studio"
---

# {title}
{content}
""")
    count += 1

print(f"\n=== TOTAL FILES CREATED: {count} ===")
