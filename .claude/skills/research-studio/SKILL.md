# Research Studio — The Intelligence Layer

> "Without data, you're just another person with an opinion." — W. Edwards Deming

The Research Studio provides data-driven intelligence for every decision. It conducts market analysis, competitive research, technology evaluation, and user research, ensuring that product, design, and business decisions are grounded in evidence rather than assumptions.

---

## Activation Triggers

- "Research the market for..."
- "Analyze competitors..."
- "Evaluate this technology..."
- "Create user personas for..."
- "What's the market size for..."
- "Compare X vs Y..."
- "Find data on..."
- "Who are our competitors?"
- Any request requiring market intelligence, competitive analysis, technology assessment, or user understanding

---

## Methodology

### Phase 1: Question Framing

| Aspect | Detail |
|--------|--------|
| **INPUT** | Business question, product idea, or strategic decision |
| **PROCESS** | Market Researcher decomposes the question into specific, researchable sub-questions with measurable outcomes |
| **OUTPUT** | Research brief with defined questions, scope, methodology, and expected deliverables |
| **GATE** | Questions are specific and answerable; scope is bounded; methodology is appropriate for the question type |

### Phase 2: Data Gathering

| Aspect | Detail |
|--------|--------|
| **INPUT** | Research brief with defined questions |
| **PROCESS** | Agents gather data from multiple sources: market reports, competitor websites, technology documentation, user feedback, industry analyses |
| **OUTPUT** | Raw data organized by question, with source attribution |
| **GATE** | Each question has at least 3 data points; sources are credible; data is current (within 12 months) |

### Phase 3: Analysis

| Aspect | Detail |
|--------|--------|
| **INPUT** | Raw gathered data |
| **PROCESS** | Agents apply analytical frameworks (SWOT, Porter's Five Forces, TAM/SAM/SOM, feature comparison matrices) to extract patterns and insights |
| **OUTPUT** | Structured analysis with findings, evidence, and confidence levels |
| **GATE** | Every finding has supporting evidence; confidence levels assigned (High/Medium/Low); contradictory data acknowledged |

### Phase 4: Synthesis

| Aspect | Detail |
|--------|--------|
| **INPUT** | Analyzed data and findings |
| **PROCESS** | Findings are synthesized into actionable recommendations with prioritization |
| **OUTPUT** | Research report with executive summary, detailed findings, recommendations, and next steps |
| **GATE** | Recommendations are specific and actionable; priorities based on impact/effort; report answers all original questions |

### Phase 5: Reporting

| Aspect | Detail |
|--------|--------|
| **INPUT** | Synthesized findings and recommendations |
| **PROCESS** | Format into the appropriate deliverable: report, matrix, scorecard, persona, or presentation |
| **OUTPUT** | Final deliverable with clear structure, data visualization, and actionable conclusions |
| **GATE** | Report is complete, internally consistent, and actionable; all claims have citations; executive summary captures key takeaways |

---

## Team Roster

| Agent | Role | Specialty |
|-------|------|-----------|
| Market Researcher | Market Intelligence Lead | Market sizing, trends, opportunity analysis, TAM/SAM/SOM |
| Competitor Analyst | Competitive Intelligence | Feature comparison, pricing analysis, positioning maps |
| Technology Evaluator | Tech Assessment | Framework/tool evaluation, build-vs-buy, performance benchmarks |
| User Researcher | User Intelligence | Personas, journey maps, user interviews, behavioral analysis |

---

## Quality Gates

| Gate | Criteria | Required Score |
|------|----------|----------------|
| Question Clarity | Research questions are specific, measurable, and bounded | 100% |
| Source Quality | All data from credible, attributable sources dated within 12 months | 100% |
| Evidence Coverage | Every finding supported by at least 2 independent data points | 100% |
| Confidence Labeling | All findings have explicit confidence levels (High/Medium/Low) | 100% |
| Actionability | Recommendations include specific next steps and owners | 100% |
| Bias Acknowledgment | Known limitations and potential biases documented | Required |

---

## Templates Available

| Template | Purpose | Location |
|----------|---------|----------|
| Market Analysis | Full market analysis report structure | `templates/market-analysis.md` |
| Competitor Matrix | Side-by-side competitor comparison | `templates/competitor-matrix.md` |
| Tech Evaluation | Technology evaluation scorecard | `templates/tech-evaluation.md` |
| User Persona | Behavioral persona definition | `templates/user-persona.md` |

---

## References Available

| Reference | Content | Location |
|-----------|---------|----------|
| Research Methodology | Frameworks and methods for conducting research | `references/research-methodology.md` |
| Data Sources | Credible sources for market and competitive data | `references/data-sources.md` |
| Analysis Frameworks | Strategic analysis frameworks (SWOT, Porter, etc.) | `references/analysis-frameworks.md` |

---

## Integration Points

| Direction | Studio | Data Exchanged |
|-----------|--------|----------------|
| **Receives from** | Sales Studio | Customer feedback, win/loss data, pricing objections |
| **Receives from** | Marketing Studio | Campaign performance, channel metrics, audience insights |
| **Provides to** | Design Studio | User personas, journey maps, usability findings |
| **Provides to** | Dev Studio | Technology evaluations, build-vs-buy recommendations |
| **Provides to** | Marketing Studio | Market positioning, competitive differentiation, target segments |
| **Provides to** | Sales Studio | Competitive battlecards, market sizing, pricing benchmarks |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead Do |
|-------------|-------------|------------|
| Research without a question | Generates noise instead of insight | Start with a specific, bounded question |
| Single-source conclusions | Creates false confidence | Require at least 2 independent data points per finding |
| Opinions disguised as data | Undermines credibility | Label every claim with its evidence source |
| Analysis paralysis | Delays decisions indefinitely | Set a time-box and deliver findings at the deadline |
| Ignoring contradictory data | Creates blind spots | Document conflicting signals and adjust confidence levels |
| Outdated data | Leads to wrong conclusions | Require data from within the last 12 months |
