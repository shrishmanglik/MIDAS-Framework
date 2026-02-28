# Research Methodology Reference

Frameworks and methods for conducting rigorous research within the Research Studio.

---

## Research Types

### 1. Market Research

**Purpose**: Understand market size, trends, segments, and dynamics.

**Methods**:
- **Top-Down Sizing**: Start with total industry revenue, apply successive filters (geography, segment, technology) to narrow to addressable market
- **Bottom-Up Sizing**: Count potential customers, multiply by average revenue per customer, validate against industry benchmarks
- **Value-Theory Sizing**: Estimate the total value created by solving the problem, then estimate willingness to pay as a fraction of value created

**When to Use Each**:
| Method | Best For | Limitation |
|--------|---------|-----------|
| Top-Down | Quick estimates, established markets | Relies on accurate industry data |
| Bottom-Up | New markets, granular analysis | Time-intensive, assumption-heavy |
| Value-Theory | Disruptive products without existing markets | Subjective value estimation |

---

### 2. Competitive Research

**Purpose**: Understand the competitive landscape, positioning, and differentiation opportunities.

**Methods**:
- **Feature Matrix**: Score competitors on weighted feature criteria
- **Positioning Map**: Plot competitors on 2x2 axes representing key differentiators
- **SWOT Analysis**: Strengths, Weaknesses, Opportunities, Threats for each competitor
- **Win/Loss Analysis**: Analyze why customers chose competitors over us (or vice versa)

---

### 3. Technology Research

**Purpose**: Evaluate technologies for adoption, build-vs-buy, or architecture decisions.

**Methods**:
- **Weighted Scorecard**: Define criteria, assign weights, score each option
- **TCO Analysis**: Total Cost of Ownership over 1-3 years including hidden costs
- **Proof of Concept**: Build a minimal implementation to test real-world characteristics
- **Risk Matrix**: Assess probability and impact of technology risks

---

### 4. User Research

**Purpose**: Understand user behaviors, needs, goals, and frustrations.

**Methods**:
- **Persona Creation**: Behavioral segmentation into representative archetypes
- **Journey Mapping**: Trace the user's end-to-end experience with emotional states
- **JTBD (Jobs-to-be-Done)**: Identify the underlying job the user is hiring the product to do
- **Task Analysis**: Break down user tasks into steps with cognitive load assessment
- **Heuristic Evaluation**: Evaluate interface against usability heuristics

---

## Analytical Frameworks

### SWOT Analysis

```
| Internal Strengths     | Internal Weaknesses    |
|------------------------|------------------------|
| What we do well        | Where we fall short    |
|                        |                        |
| External Opportunities | External Threats       |
|------------------------|------------------------|
| Market gaps to exploit | Risks to our position  |
```

### Porter's Five Forces

1. **Threat of New Entrants**: How easy is it for new competitors to enter?
2. **Bargaining Power of Suppliers**: How much leverage do our suppliers/vendors have?
3. **Bargaining Power of Buyers**: How much leverage do our customers have?
4. **Threat of Substitutes**: What alternatives exist outside our direct market?
5. **Competitive Rivalry**: How intense is competition among existing players?

### TAM/SAM/SOM

- **TAM**: Total revenue opportunity if 100% market share
- **SAM**: Portion of TAM reachable with our product, geography, and channels
- **SOM**: Portion of SAM we can realistically capture in a given timeframe

### Jobs-to-be-Done (JTBD)

**Formula**: "When I [situation/context], I want to [motivation], so I can [desired outcome]."

**Three Layers**:
1. **Functional Job**: The practical task to accomplish
2. **Emotional Job**: How they want to feel during and after
3. **Social Job**: How they want to be perceived by others

### Impact/Effort Matrix

```
         HIGH IMPACT
              |
   Quick Wins | Strategic Bets
   (Do First) | (Plan Carefully)
              |
  ──LOW EFFORT+HIGH EFFORT──
              |
   Fill-Ins   | Avoid
   (Delegate) | (Don't Do)
              |
         LOW IMPACT
```

---

## Data Quality Standards

### Source Credibility Tiers

| Tier | Source Type | Examples | Trust Level |
|------|-----------|----------|------------|
| Tier 1 | Primary data, official reports | Government statistics, SEC filings, published research | High |
| Tier 2 | Reputable industry reports | Gartner, Forrester, McKinsey, Statista | High-Medium |
| Tier 3 | Reputable journalism | Major publications, trade journals | Medium |
| Tier 4 | Company self-reported data | Press releases, marketing materials, pitch decks | Medium-Low |
| Tier 5 | Unverified sources | Blog posts, social media, anonymous claims | Low |

### Data Freshness Requirements

| Data Type | Maximum Age | Refresh Frequency |
|-----------|-----------|-------------------|
| Market sizing | 12 months | Annual |
| Competitor pricing | 3 months | Quarterly |
| Competitor features | 6 months | Semi-annual |
| Technology benchmarks | 6 months | Semi-annual |
| User research | 12 months | Annual (or after major product changes) |
| Regulatory information | 3 months | Quarterly |

### Confidence Level Definitions

| Level | Definition | When to Assign |
|-------|-----------|---------------|
| **High** | Multiple independent sources agree; data is recent; methodology is sound | 3+ corroborating sources from Tier 1-2 |
| **Medium** | Some evidence supports the claim; minor gaps exist | 2 sources agree, or 1 Tier-1 source with logical reasoning |
| **Low** | Limited evidence; significant assumptions; single source | 1 source only, or extrapolation from indirect data |
| **Speculative** | Educated guess based on adjacent data | No direct evidence; reasoning from analogies or trends |

---

## Research Process

### Step 1: Frame the Question
- Convert business request into specific, measurable research questions
- Define scope boundaries (what's in, what's out)
- Identify deliverable format (report, matrix, scorecard, personas)

### Step 2: Plan the Research
- Select appropriate methodology for each question
- Identify data sources needed
- Estimate time required
- Define "good enough" — avoid analysis paralysis

### Step 3: Gather Data
- Collect from multiple independent sources
- Document source, date, and credibility tier for every data point
- Note contradictions between sources

### Step 4: Analyze
- Apply the appropriate analytical framework
- Score, calculate, and compare systematically
- Identify patterns and outliers
- Challenge assumptions: "What would change this conclusion?"

### Step 5: Synthesize
- Distill findings into actionable insights
- Assign confidence levels to every finding
- Prioritize recommendations by impact/effort
- Acknowledge limitations and gaps

### Step 6: Deliver
- Executive summary first (for time-pressed readers)
- Detailed findings second (for deep readers)
- Methodology appendix third (for skeptics)
- Always end with specific, actionable recommendations
