# Fashion Studio -- The Supply Chain Brain

> "Fashion is not something that exists in dresses only. Fashion is in the sky, in the street; fashion has to do with ideas, the way we live, what is happening." -- Coco Chanel

Fashion supply chain analysis and cost calculation engine for Thread Intelligence. Transforms raw material specifications, production parameters, and logistics constraints into accurate garment costings, supply chain risk assessments, and optimized sourcing recommendations. Bridges the gap between design intent and manufacturing reality.

---

## Activation Triggers

- User requests a garment cost breakdown (CMT, FOB, landed cost)
- User needs supply chain route analysis with lead times
- User asks for fabric sourcing recommendations
- User needs MOQ (Minimum Order Quantity) impact analysis on unit costs
- System needs to generate a supplier quote comparison
- User requests costing for a new product line

---

## Methodology

### Phase 1: SOURCE
- Identify fabric type, weight, and quality requirements
- Determine trim and accessory specifications
- Map potential sourcing regions based on requirements
- Collect supplier pricing and MOQ data

### Phase 2: COST
- Calculate material costs (fabric + trims + packaging)
- Estimate labor costs using SAM (Standard Allowed Minutes)
- Apply overhead rates (factory overhead, compliance, quality)
- Factor in logistics costs (shipping, duties, insurance)

### Phase 3: QUOTE
- Assemble full cost buildup (CMT, FOB, or landed cost)
- Apply markup for wholesale and retail pricing
- Generate tiered pricing based on order quantities
- Produce formal quote sheet with all assumptions stated

### Phase 4: OPTIMIZE
- Identify cost reduction opportunities (fabric substitution, production consolidation, logistics optimization)
- Assess supply chain risks (single-source dependency, geopolitical, lead time)
- Recommend sourcing diversification where appropriate
- Model "what-if" scenarios for different quantities, fabrics, or production locations

---

## Team Roster

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| `supply-chain-analyst` | Supply Chain Strategist | sourcing requirements + constraints | supply chain analysis + risk assessment |
| `quote-calculator` | Garment Cost Engineer | product specs + material costs + labor rates | detailed cost breakdown + quote |

---

## Quality Gates

| Gate | Check | Pass Criteria |
|------|-------|---------------|
| G1: Material Accuracy | Fabric and trim specifications | All materials identified with weight, composition, and cost per unit |
| G2: SAM Validation | Labor time estimates | SAM values within industry range for garment type |
| G3: Cost Completeness | All cost components | No missing cost categories (material, labor, overhead, logistics, margin) |
| G4: MOQ Realism | Order quantity effects | MOQ impact on unit cost is calculated and disclosed |
| G5: Risk Assessment | Supply chain vulnerabilities | At least 3 risk factors identified and scored |
| G6: Currency and Date | Pricing validity | All costs state currency, date of quote, and validity period |

---

## References Available

| Reference | Contents | Used By |
|-----------|----------|---------|
| `fabric-database.md` | Fabric types, properties, cost ranges, care requirements | Both agents |
| `costing-formulas.md` | Garment costing formulas, SAM tables, markup structures | quote-calculator |

---

## Integration Points

| System | Direction | Data |
|--------|-----------|------|
| Thread Intelligence Platform | Bidirectional | Product specs, supplier data, order quantities |
| Supplier Database | Input | Pricing, MOQs, lead times, capability matrices |
| Logistics Providers | Input | Shipping rates, transit times, duty rates |
| ERP/PLM Systems | Output | Costed BOMs (Bill of Materials), production orders |
| Currency Exchange API | Input | Real-time exchange rates for multi-currency costing |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
|-------------|-------------|-----------------|
| Using retail fabric prices for production costing | Bulk pricing is 30-60% lower than retail | Always use wholesale/bulk fabric pricing with MOQ consideration |
| Ignoring shrinkage in fabric consumption | 3-8% fabric wasted to shrinkage | Factor in shrinkage percentage by fabric type |
| Using a single SAM for all garment types | A t-shirt and a blazer have vastly different SAM | Use garment-category-specific SAM from reference tables |
| Quoting without stating validity period | Material prices fluctuate | Every quote must state a validity window (typically 30 days) |
| Ignoring duty and landed cost | FOB price is not the final cost | Always calculate through to landed cost for accurate comparison |
| Single-source supply chain | One factory delay stops production | Recommend dual-sourcing for critical materials |
