# Pricing Strategy Reference

> Value-based pricing frameworks and models for positioning products and services. Price is a signal of value, not a reflection of cost.

---

## Pricing Philosophies

### Cost-Plus Pricing (Avoid for SaaS/Services)

**Formula**: Cost of delivery + desired margin = price

**When to use**: Commodity products, manufacturing, low-differentiation services.

**Why it fails for SaaS/AI**: Your cost is $0.001 per API call. Your value is $19/month in retained premium subscribers. Cost-plus pricing leaves 99.9% of the value on the table.

---

### Competitor-Based Pricing (Use as a Reference, Not a Strategy)

**Formula**: Match or undercut competitor pricing.

**When to use**: Entering a crowded market where you need to remove price as a barrier.

**Why it's limited**: You anchor your price to someone else's value proposition. If your product is better, you're undercharging. If it's worse, you're overcharging for what you deliver.

**Better approach**: Know competitor prices but price based on your unique value.

---

### Value-Based Pricing (Default for SaaS/AI/Services)

**Formula**: Quantified value to the customer * capture rate = price

**When to use**: Always. This is the default.

**How it works**:
1. Calculate the measurable value your product creates for the customer
2. Capture 10-20% of that value as your price (the customer keeps 80-90% of the upside)
3. The customer pays a fraction of what they gain — easy to justify

**Example**:
- Your compatibility API converts 100 additional users to premium at $19/month = $1,900/month in incremental revenue for the client
- Annual value: $22,800
- Your price: $22,000 implementation + $500/month = $28,000 first year
- Client ROI: The feature pays for itself and generates net positive by month 12
- Capture rate: ~28,000 / 22,800 = ~123% in year 1, but drops to 26% in year 2+ (only $6,000/year ongoing vs $22,800 annual value)

---

## Pricing Models

### Model 1: Flat-Rate Subscription

| Attribute | Details |
|-----------|---------|
| **Structure** | Single price for access to the product |
| **Best for** | Simple products, single persona, clear value |
| **Pros** | Easy to understand, predictable revenue, simple to sell |
| **Cons** | Leaves money on the table with high-value users; low-value users may churn |
| **Example** | $29/month for unlimited birth charts |

---

### Model 2: Tiered Subscription

| Attribute | Details |
|-----------|---------|
| **Structure** | 2-4 tiers with increasing features or limits |
| **Best for** | Products serving multiple personas or usage levels |
| **Pros** | Captures value from different segments; natural upgrade path |
| **Cons** | Requires careful feature gating; wrong tier boundaries cause friction |
| **Example** | Free (3 charts) / $9/mo (unlimited) / $29/mo (compatibility + AI) |

**Tier design principles**:
- Each tier should be the obvious choice for a specific persona
- The middle tier should be where you want most customers (design the other tiers to push toward it)
- Limit features by value delivered, not by arbitrary restrictions
- The gap between tiers should feel like a natural step, not a cliff

---

### Model 3: Usage-Based (Pay-Per-Use)

| Attribute | Details |
|-----------|---------|
| **Structure** | Price per unit of consumption (API call, report, user, etc.) |
| **Best for** | API products, infrastructure, variable-usage tools |
| **Pros** | Scales with customer success; low barrier to start; aligns incentives |
| **Cons** | Unpredictable revenue; customers may limit usage to control costs |
| **Example** | $0.05 per compatibility report generated |

**Usage-based design principles**:
- Choose a value metric that scales with the customer's success
- Offer volume discounts to reward growth
- Include a minimum monthly commitment to ensure revenue predictability
- Make usage transparent (dashboards, alerts, real-time tracking)

---

### Model 4: Project-Based (Fixed Price)

| Attribute | Details |
|-----------|---------|
| **Structure** | One-time fee for a defined deliverable |
| **Best for** | Custom integrations, implementations, consulting engagements |
| **Pros** | Client knows exactly what they'll pay; simple to scope |
| **Cons** | Scope creep risk; underpricing if scope expands; no recurring revenue |
| **Example** | $22,000 for API integration, customization, and launch support |

**Project pricing principles**:
- Scope must be bulletproof before pricing (inclusions AND exclusions)
- Build a 15-20% buffer for unexpected complexity
- Always include a change request process in the SOW
- Pair with ongoing services for recurring revenue after the project

---

### Model 5: Hybrid (Project + Subscription)

| Attribute | Details |
|-----------|---------|
| **Structure** | Upfront project fee + ongoing subscription/usage fee |
| **Best for** | API integrations, custom SaaS implementations, platform partnerships |
| **Pros** | Upfront revenue covers implementation cost; ongoing revenue builds over time |
| **Cons** | More complex to sell; requires explaining two pricing models |
| **Example** | $22,000 implementation + $500/month ongoing API access |

This is the recommended model for B2B API/SaaS products that require custom integration.

---

## Pricing Psychology

### Anchoring

Present a higher number before your actual price. The first number the buyer sees becomes the reference point.

**Techniques**:
- Show the build-vs-buy cost first ($85,000 to build in-house vs. $22,000 with us)
- Show the annual value first ($22,800/year in additional revenue for a $22,000 investment)
- Show the premium tier first, then the tier you actually want them to buy

---

### Decoy Effect

When presenting 3 options, make one option clearly inferior to make the target option look better by comparison.

| | Basic | Professional | Enterprise |
|-|-------|-------------|------------|
| Price | $9/mo | $29/mo | $99/mo |
| Charts | 5/mo | Unlimited | Unlimited |
| Compatibility | No | Yes | Yes |
| AI Interpretation | No | No | Yes |

In this example, Basic is too limited, Enterprise is expensive. Professional is the obvious choice (which is exactly the plan you want most users on).

---

### Price Framing

The same price feels different depending on how you frame it.

| Frame | Example | Effect |
|-------|---------|--------|
| Daily | "$0.96/day" | Feels trivial — "less than a coffee" |
| Monthly | "$29/month" | Standard anchor for SaaS |
| Annual | "$290/year (save 17%)" | Commitment discount; improves retention |
| Per-unit | "$0.05 per report" | Feels proportional to value received |
| Per-outcome | "$2.20 per premium conversion" | Ties price directly to business value |
| Vs. alternative | "87% less than building in-house" | Makes the price feel like a bargain |

Choose the frame that makes the price feel smallest relative to the value.

---

### Loss Aversion

People feel losses more strongly than gains. Frame pricing around what they'll lose by NOT buying.

| Instead of... | Say... |
|--------------|--------|
| "You'll gain $1,900/month in revenue" | "Every month without this feature, you're leaving $1,900 on the table" |
| "Save 20% with annual billing" | "Monthly billing costs you $70 more per year" |
| "Upgrade to get compatibility" | "Your competitors already offer compatibility — your users are looking for it" |

---

## B2B Pricing Benchmarks

### SaaS API Products

| Metric | Benchmark Range | Notes |
|--------|----------------|-------|
| Implementation fee | $5,000 - $50,000 | Depends on complexity; $15K-$25K is typical for mid-market |
| Monthly API fee | $200 - $2,000/month | Based on call volume and value of each call |
| Cost per API call | $0.001 - $0.10 | Depends on computation complexity |
| Annual contract value | $10,000 - $100,000 | Mid-market B2B SaaS |
| Gross margin | 70-90% | SaaS target; AI products may be lower due to compute costs |

### SaaS Subscription Products (B2C / SMB)

| Metric | Benchmark Range | Notes |
|--------|----------------|-------|
| Free tier | $0 (limited features) | 2-5% conversion to paid is typical |
| Starter/Basic | $5 - $15/month | Entry point; must demonstrate value quickly |
| Professional | $15 - $49/month | Where most revenue comes from |
| Premium/Enterprise | $49 - $199/month | For power users or teams |
| Annual discount | 15-20% off monthly | Standard; higher discounts for enterprise |

---

## Unit Economics Framework

Every pricing decision should be validated against unit economics:

| Metric | Formula | Target |
|--------|---------|--------|
| **CAC** (Customer Acquisition Cost) | Total sales + marketing spend / New customers | < 1/3 of LTV |
| **LTV** (Lifetime Value) | ARPU * Gross margin * (1 / Monthly churn rate) | > 3x CAC |
| **ARPU** (Average Revenue Per User) | Total revenue / Total active users | Track monthly |
| **Payback Period** | CAC / (ARPU * Gross margin) | < 12 months |
| **LTV:CAC Ratio** | LTV / CAC | 3:1 to 5:1 ideal |
| **Gross Margin** | (Revenue - COGS) / Revenue | > 70% for SaaS |
| **Net Revenue Retention** | (Starting MRR + Expansion - Contraction - Churn) / Starting MRR | > 100% |

**Rule of thumb**: If your LTV:CAC ratio is below 3:1, either your pricing is too low, your churn is too high, or your acquisition cost is too high. Fix the root cause before scaling.

---

## Pricing Negotiation Principles

### The Concession Framework

Never concede on price without getting something in return.

| Situation | Concession We Can Offer | What We Get Back |
|-----------|------------------------|-----------------|
| "Too expensive" | 5-10% discount | Annual commitment (not monthly) |
| "Too expensive" | Reduced scope at lower price | Right of first refusal for full scope |
| "Budget won't stretch" | Payment terms (installments) | Full scope maintained |
| "Need to try before buying" | Free pilot (limited scope/duration) | Defined success criteria that trigger full deal |
| "Competitor is cheaper" | Match on one dimension (e.g., setup fee) | Longer commitment or higher volume |

### Hard Floors

Define your minimum acceptable price BEFORE any negotiation:

- **Full scope hard floor**: The lowest price that covers your cost + minimum margin for the full deliverable
- **Scope reduction threshold**: If the price must go below the hard floor, reduce scope proportionally
- **Walk-away point**: The deal terms below which it's better to lose the deal than win it

### Negotiation Rules

1. Never negotiate against yourself — wait for the client's counter
2. Never concede immediately — acknowledge the concern, then present the value justification
3. Never concede on price alone — always pair a concession with a reciprocal ask
4. Always have two fallback options prepared before the meeting
5. Silence is powerful — after stating your price, stop talking
