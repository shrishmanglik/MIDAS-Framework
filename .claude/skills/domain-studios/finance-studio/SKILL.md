# Finance Studio -- The Numbers Engine

> "In God we trust; all others must bring data." -- W. Edwards Deming

Financial data analysis, tax computation, and compliance engine supporting XBRL filing analysis, Canadian cross-border tax scenarios, and SEC EDGAR data extraction. Designed to parse structured financial data, apply regulatory rules, and produce verified reports. All outputs carry the mandatory disclaimer that they do not constitute financial or tax advice.

**DISCLAIMER: Not financial advice. Not tax advice. Consult qualified professionals for all financial and tax decisions.**

---

## Activation Triggers

- User requests analysis of XBRL financial filings
- User needs Canadian newcomer tax scenario analysis
- User asks about cross-border tax optimization rules
- User requests SEC EDGAR data extraction or filing analysis
- System needs to compute tax obligations for ATLAS newcomer platform
- User requests compliance review of financial outputs

---

## Methodology

### Phase 1: INGEST
- Accept financial data input: XBRL filing URL, SEC EDGAR CIK, tax scenario parameters
- Validate data format and completeness
- Identify the regulatory framework (US GAAP, IFRS, CRA, IRS)

### Phase 2: PARSE
- Extract structured financial data from XBRL instance documents
- Map XBRL concepts to standardized financial metrics
- Normalize multi-period data for comparison
- Parse tax scenario inputs into computation-ready structures

### Phase 3: ANALYZE
- Compute financial ratios and key performance indicators
- Apply tax rules from the appropriate jurisdiction
- Identify anomalies, trends, and risk factors
- Cross-reference with regulatory requirements

### Phase 4: REPORT
- Generate structured reports with findings, computations, and recommendations
- Include all assumptions and data sources
- Format outputs for the intended audience (technical, executive, compliance)

### Phase 5: VERIFY
- Cross-check all computations against source data
- Validate tax calculations against published rules
- Ensure all regulatory disclaimers are present
- Flag any areas of uncertainty requiring professional review

---

## Team Roster

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| `xbrl-analyst` | Financial Data Parser | XBRL filings, EDGAR data | Structured financial metrics + ratios |
| `tax-engine-designer` | Tax Rule Engineer | Tax scenario parameters | Tax computation logic + results |
| `compliance-reviewer` | Regulatory Compliance Auditor | Financial outputs + rules | Compliance report (pass/fail per rule) |

---

## Quality Gates

| Gate | Check | Pass Criteria |
|------|-------|---------------|
| G1: Data Integrity | Source data validation | All referenced data points traceable to source filings |
| G2: Computation Accuracy | Mathematical verification | All calculations reproducible from stated inputs and formulas |
| G3: Regulatory Currency | Rules up-to-date | Tax rules and rates reference current tax year (or stated year) |
| G4: Disclaimer Presence | Legal compliance | "Not financial/tax advice" disclaimer on every output |
| G5: Uncertainty Flagging | Risk identification | All assumptions, estimates, and uncertain areas explicitly flagged |
| G6: Audit Trail | Traceability | Every number in the output can be traced to a source or calculation |

---

## References Available

| Reference | Contents | Used By |
|-----------|----------|---------|
| `xbrl-taxonomy.md` | US-GAAP XBRL taxonomy concepts, common financial elements | xbrl-analyst |
| `cra-filing-rules.md` | Canadian Revenue Agency rules for newcomers, residency, tax treaties | tax-engine-designer |
| `sec-edgar-patterns.md` | SEC EDGAR filing types, access patterns, rate limits | xbrl-analyst |

---

## Integration Points

| System | Direction | Data |
|--------|-----------|------|
| SEC EDGAR API | Input | XBRL filings, company metadata |
| SEDAR+ (Canadian filings) | Input | Canadian public company filings |
| CRA Tax Tables | Input | Federal and provincial tax rates |
| ATLAS Newcomer Platform | Bidirectional | Newcomer profile data, tax optimization results |
| Report Generator | Output | Formatted financial reports |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
|-------------|-------------|-----------------|
| Providing specific investment recommendations | Legal liability, not qualified advice | State data and analysis; always defer to qualified advisor |
| Using stale tax rates | Tax rates change annually | Always reference the specific tax year and verify currency |
| Treating XBRL data as always accurate | Companies can have filing errors | Cross-check key metrics, flag inconsistencies |
| Ignoring provincial tax differences | Canadian tax varies significantly by province | Always include provincial calculations alongside federal |
| Omitting the disclaimer | Legal exposure | Attach disclaimer to EVERY output, no exceptions |
| Assuming US tax rules for Canadian scenarios | Different jurisdictions, different rules | Always identify jurisdiction first, then apply correct ruleset |
