# Analysis Frameworks Reference

Strategic analysis frameworks used by the Research Studio. Each framework includes when to use it, how to apply it, and common pitfalls.

---

## Market Analysis Frameworks

### TAM / SAM / SOM

**When to Use**: Sizing a market opportunity for a new or existing product.

**How to Apply**:

```
TAM = Total revenue if you sold to every possible customer globally
SAM = TAM filtered by geography, technology access, and product fit
SOM = SAM x realistic market share % over a defined timeframe
```

**Example Calculation**:
```
TAM: 500M smartphone users in India x $5 avg annual spend on astrology apps = $2.5B
SAM: 500M x 30% English-speaking x 20% digitally-engaged astrology interest = $75M
SOM: $75M x 3% penetration in 3 years = $2.25M ARR
```

**Pitfalls**:
- Conflating TAM with SAM (the "if we get just 1% of a trillion-dollar market" fallacy)
- Using top-down only without bottom-up validation
- Ignoring that SOM requires go-to-market execution, not just market existence

---

### Porter's Five Forces

**When to Use**: Assessing the competitive intensity and attractiveness of a market.

**How to Apply**:

| Force | Key Questions | Rating (1-5) |
|-------|-------------|-------------|
| **Threat of New Entrants** | How hard is it to enter? Capital requirements? Network effects? Regulatory barriers? | [score] |
| **Supplier Power** | How many suppliers? Switching costs? Supplier concentration? | [score] |
| **Buyer Power** | How many buyers? Switching costs? Price sensitivity? Information availability? | [score] |
| **Threat of Substitutes** | What alternatives exist? Performance/price trade-off? Switching costs? | [score] |
| **Competitive Rivalry** | How many competitors? Market growth rate? Product differentiation? Exit barriers? | [score] |

**Interpretation**: Higher scores = more difficult market. Markets with 3+ forces rated 4-5 are structurally unattractive.

**Pitfalls**:
- Static analysis — forces change over time
- Ignoring complementors (companies whose products enhance yours)
- Treating all five forces as equally important (they rarely are)

---

### PESTLE Analysis

**When to Use**: Understanding macro-environmental factors affecting a market.

| Factor | Key Questions |
|--------|-------------|
| **Political** | Government stability? Trade policies? Tax regulations? |
| **Economic** | GDP growth? Inflation? Exchange rates? Disposable income trends? |
| **Social** | Demographics? Cultural attitudes? Lifestyle changes? Education levels? |
| **Technological** | Innovation rate? Automation? R&D activity? Technology access? |
| **Legal** | Regulatory requirements? Consumer protection? Data privacy laws? |
| **Environmental** | Environmental regulations? Sustainability expectations? Climate impact? |

**Pitfalls**:
- Being too broad (listing every possible factor instead of the impactful ones)
- Ignoring factor interactions (e.g., how technology and regulation interact)

---

## Competitive Analysis Frameworks

### SWOT Analysis

**When to Use**: Assessing a specific competitor or your own strategic position.

```
+----------------------+----------------------+
|     STRENGTHS        |     WEAKNESSES       |
|   (Internal +)       |   (Internal -)       |
|                      |                      |
|  What we/they do     |  Where we/they fall  |
|  well                |  short               |
+----------------------+----------------------+
|     OPPORTUNITIES    |     THREATS          |
|   (External +)       |   (External -)       |
|                      |                      |
|  Market gaps we/they |  Risks to our/their  |
|  can exploit         |  position            |
+----------------------+----------------------+
```

**Converting SWOT to Strategy**:
- **SO Strategies**: Use strengths to exploit opportunities
- **WO Strategies**: Overcome weaknesses by exploiting opportunities
- **ST Strategies**: Use strengths to mitigate threats
- **WT Strategies**: Minimize weaknesses and avoid threats

**Pitfalls**:
- Listing too many items (focus on top 3-5 per quadrant)
- Confusing internal (strengths/weaknesses) with external (opportunities/threats)
- Not converting analysis into actionable strategy

---

### Competitive Positioning Map

**When to Use**: Visualizing where competitors sit relative to each other on key dimensions.

**How to Apply**:
1. Choose 2 axes that represent the most differentiating dimensions in the market
2. Plot each competitor on the map based on evidence
3. Identify clusters and gaps

**Common Axis Pairs**:
- Price vs. Feature Depth
- Ease of Use vs. Power/Flexibility
- Breadth vs. Specialization
- Self-Serve vs. High-Touch
- AI-Driven vs. Manual
- Modern UX vs. Traditional UX

**Pitfalls**:
- Choosing axes that don't actually differentiate (e.g., "quality" — everyone claims quality)
- Not validating positions with evidence (plotting based on perception)
- Ignoring that customers value different axes differently

---

## Decision Frameworks

### Impact/Effort Matrix (2x2)

**When to Use**: Prioritizing a list of actions, features, or initiatives.

```
         HIGH IMPACT
              |
   Quick Wins | Big Bets
   DO FIRST   | PLAN CAREFULLY
              |
  ──LOW EFFORT+HIGH EFFORT──
              |
   Fill-Ins   | Money Pits
   DO LATER   | AVOID
              |
         LOW IMPACT
```

**How to Score**:
- Impact: Business value, revenue potential, user satisfaction improvement
- Effort: Development time, cost, risk, complexity

---

### Weighted Decision Matrix

**When to Use**: Making a choice between multiple options with multiple criteria.

**Process**:
1. List criteria (rows)
2. Assign weights (importance 1-5) to each criterion
3. Score each option (1-5) on each criterion
4. Multiply score x weight for each cell
5. Sum weighted scores for each option
6. Highest total wins (with qualitative review)

**Pitfalls**:
- Gaming weights to justify a predetermined preference
- Equal weighting when priorities clearly differ
- Ignoring qualitative factors that don't fit in a matrix (team enthusiasm, strategic alignment)

---

### Build vs. Buy Decision Framework

**When to Use**: Deciding whether to build a solution in-house or purchase/integrate an existing one.

| Factor | Build | Buy |
|--------|-------|-----|
| **Core competency?** | Build if it's your competitive advantage | Buy if it's commodity infrastructure |
| **Time to market** | Slower (weeks-months) | Faster (days-weeks) |
| **Customization** | Full control | Limited to vendor's configuration |
| **Long-term cost** | Lower if maintained well | Can escalate with scale |
| **Maintenance burden** | On your team | On the vendor |
| **Vendor risk** | None | Vendor lock-in, pricing changes, discontinuation |

**Decision Heuristic**:
- If it differentiates your product: **Build**
- If it's infrastructure everyone needs: **Buy**
- If you're unsure: **Buy now, build later** when requirements are proven

---

## User Research Frameworks

### Jobs-to-be-Done (JTBD)

**When to Use**: Understanding the underlying motivation behind user behavior.

**Formula**: "When I [situation], I want to [motivation], so I can [desired outcome]."

**Three Job Dimensions**:
1. **Functional**: The practical task ("generate my birth chart")
2. **Emotional**: How they want to feel ("feel understood and reassured")
3. **Social**: How they want to be perceived ("appear knowledgeable about astrology")

**Pitfalls**:
- Writing jobs that describe features, not motivations
- Ignoring emotional and social dimensions
- Making jobs too broad ("be happy") or too narrow ("click the blue button")

---

### Empathy Map

**When to Use**: Developing deeper understanding of a specific persona.

| Says | Thinks |
|------|--------|
| Direct quotes or typical statements | Internal thoughts, beliefs, and concerns |
| What they tell others about the problem | What they think but don't say |

| Does | Feels |
|------|-------|
| Observable behaviors and actions | Emotional states and motivations |
| How they currently solve the problem | Frustrations, hopes, anxieties |

---

### Kano Model

**When to Use**: Categorizing features by how they affect user satisfaction.

| Category | Definition | Example |
|----------|-----------|---------|
| **Must-Be** | Expected; absence causes dissatisfaction, presence doesn't delight | App loads in < 3 seconds |
| **Performance** | More is better; linear relationship with satisfaction | More accurate predictions |
| **Attractive** | Unexpected delight; absence doesn't cause dissatisfaction | AI explains prediction reasoning |
| **Indifferent** | Users don't care either way | Backend technology choice |
| **Reverse** | Some users want it, others don't | Gamification features |

**Application**: Prioritize Must-Be first, then Performance, then Attractive. Never ship Attractive before Must-Be is solid.
