# Garment Costing Formulas Reference

## Master Costing Formula

```
Landed Cost = Material Cost + Labor Cost + Factory Overhead + Factory Margin + Logistics Cost

Where:
  Material Cost = Fabric Cost + Trim Cost
  Fabric Cost = Consumption (meters) x Price per meter
  Consumption = Base Pattern Length x (1 + Waste%) x (1 + Shrinkage%)
  Labor Cost = SAM (minutes) x Labor Rate ($/minute)
  Factory Overhead = Labor Cost x Overhead% (typically 30-50%)
  Factory Margin = (Material + Labor + Overhead) x Margin% (typically 10-20%)
  Logistics Cost = Freight + Insurance + Duty + Brokerage + Inland Transport
```

---

## Fabric Consumption Estimation

When exact pattern consumption is not available, use these garment-category defaults (based on average size M/L, 150cm fabric width):

| Garment Category | Base Consumption (meters) | Waste % | Typical Shrinkage % |
|-----------------|--------------------------|---------|---------------------|
| Men's t-shirt (crew neck) | 1.20 | 5-7% | 3-5% (cotton) |
| Men's polo shirt | 1.25 | 5-7% | 3-6% (pique) |
| Men's dress shirt | 1.80 | 8-10% | 2-4% |
| Men's trousers/chinos | 1.50 | 7-10% | 3-5% |
| Men's jeans (5-pocket) | 1.55 | 8-10% | 3-5% (sanforized) |
| Men's blazer/sport coat | 2.20 | 10-12% | 2-3% |
| Men's suit jacket + trousers | 3.50 | 10-12% | 2-3% |
| Women's t-shirt (fitted) | 1.10 | 5-7% | 3-5% |
| Women's blouse | 1.40 | 7-9% | 2-5% |
| Women's midi dress | 1.65 | 7-10% | 3-5% |
| Women's maxi dress | 2.20 | 8-10% | 3-5% |
| Women's trousers | 1.40 | 7-10% | 3-5% |
| Women's skirt (knee length) | 1.00 | 6-8% | 3-5% |
| Women's jacket/blazer | 1.90 | 10-12% | 2-3% |
| Hoodie/sweatshirt | 1.80 | 7-9% | 3-5% |
| Leggings | 1.10 | 5-7% | 2-3% (synthetic) |
| Shorts | 0.90 | 6-8% | 3-5% |
| Basic underwear | 0.35 | 5-7% | 3-5% |

**Adjustment for fabric width**:
```
adjusted_consumption = default_consumption * (150 / actual_width_cm)
```
If fabric is wider (e.g., 180cm), consumption decreases proportionally.

**Adjustment for size range**:
Average consumption across a size run (XS-XL) is approximately the M size value. For larger size ranges (XS-3XL), add 5-8% to account for larger sizes.

---

## Standard Allowed Minutes (SAM) by Garment Type

SAM measures the time required to produce one garment under standard conditions (experienced operator, standard equipment, normal pace with allowances).

| Garment Category | SAM (minutes) | Complexity Level |
|-----------------|---------------|-----------------|
| Men's basic t-shirt (crew neck) | 8-12 | Low |
| Men's polo shirt | 18-25 | Low-Medium |
| Men's dress shirt (long sleeve) | 25-35 | Medium |
| Men's dress shirt (short sleeve) | 20-28 | Medium |
| Men's chinos/trousers | 20-30 | Medium |
| Men's 5-pocket jeans | 22-32 | Medium |
| Men's blazer (unstructured) | 55-75 | High |
| Men's blazer (structured/lined) | 90-130 | Very High |
| Women's basic tank top | 5-8 | Very Low |
| Women's basic t-shirt | 7-10 | Low |
| Women's blouse (woven) | 18-28 | Medium |
| Women's fitted dress (simple) | 25-35 | Medium |
| Women's fitted dress (with lining) | 35-50 | Medium-High |
| Women's maxi dress | 30-40 | Medium |
| Women's trousers | 18-28 | Medium |
| Women's skirt (simple) | 12-18 | Low-Medium |
| Women's jacket (unlined) | 45-65 | High |
| Women's jacket (fully lined) | 70-100 | Very High |
| Hoodie (pullover) | 15-22 | Low-Medium |
| Hoodie (zip-up) | 20-30 | Medium |
| Sweatpants/joggers | 15-22 | Low-Medium |
| Leggings | 8-12 | Low |
| Shorts (basic) | 10-15 | Low |
| Sports bra | 12-18 | Medium |
| Down jacket | 60-90 | High |

**SAM adjustment factors**:
- Add 15-25% for garments with embroidery
- Add 10-15% for garments with prints requiring placement matching
- Add 5-10% for stretch fabrics (knits require more careful handling)
- Add 20-30% for garments with lining
- Subtract 10-15% for very large production runs (learning curve effect at 10,000+ units)

---

## Labor Rates by Production Region (2024 estimates)

| Region | Labor Rate ($/hour) | Typical SAM Efficiency | Notes |
|--------|--------------------|-----------------------|-------|
| Bangladesh | $0.80-$1.50 | 65-75% | Lowest cost; specializes in basics |
| Cambodia | $1.00-$1.80 | 65-75% | Growing capacity |
| Vietnam | $1.80-$3.00 | 70-80% | Strong on technical/athletic wear |
| India | $1.20-$2.50 | 60-75% | Wide range; artisanal options |
| China (coastal) | $3.50-$6.00 | 80-90% | Highest efficiency; all categories |
| China (inland) | $2.00-$3.50 | 70-80% | Lower cost; growing capacity |
| Turkey | $3.00-$5.00 | 75-85% | Fast turnaround; EU proximity |
| Portugal | $6.00-$10.00 | 80-90% | Premium quality; small MOQ |
| Mexico | $2.50-$4.00 | 70-80% | CUSMA advantage for NA market |
| Eastern Europe (Romania, Bulgaria) | $4.00-$7.00 | 75-85% | EU proximity; mid-range |
| Italy | $12.00-$20.00 | 85-95% | Luxury only; highest skill level |

**SAM Efficiency**: The percentage of standard time actually achieved in production. A 75% efficiency means a garment with 20 SAM takes approximately 26.7 actual minutes.

```
actual_labor_cost = (SAM / efficiency) * labor_rate_per_minute
```

---

## Overhead Rate Structure

Factory overhead covers all indirect production costs:

| Overhead Component | Typical % of Direct Labor |
|-------------------|--------------------------|
| Factory rent and utilities | 8-15% |
| Supervisory labor | 5-10% |
| Machine maintenance and depreciation | 5-8% |
| Quality control | 3-5% |
| Compliance and certification | 2-4% |
| Administrative overhead | 5-8% |
| **Total typical range** | **30-50%** |

Lower-cost regions (Bangladesh, Cambodia): 30-35%
Mid-cost regions (Vietnam, India, Turkey): 35-45%
Higher-cost regions (China coastal, Portugal, Italy): 40-50%

---

## Markup Structures

### Factory to Wholesale to Retail

```
FOB (Factory) Price = Cost of Goods * (1 + Factory Margin)
  Factory Margin: 10-20% (typical 12-15%)

Wholesale Price = Landed Cost * Wholesale Markup
  Standard Wholesale Markup: 2.0x - 3.0x landed cost
  Typical: 2.2x - 2.5x

Retail Price = Wholesale Price * Retail Markup
  Keystone: 2.0x wholesale (most common)
  Premium brands: 2.5x - 3.0x wholesale
  Luxury: 3.0x - 5.0x wholesale

OR calculated from cost:
  Budget retail: 4.0x - 5.0x landed cost
  Mid-range retail: 5.0x - 7.0x landed cost
  Premium retail: 7.0x - 10.0x landed cost
  Luxury retail: 10.0x - 15.0x landed cost
```

### Direct-to-Consumer (DTC)

DTC brands skip the wholesale markup:
```
DTC Price = Landed Cost * 4.0x to 6.0x
```
This gives higher margins than wholesale but requires investment in marketing, fulfillment, and customer acquisition.

---

## Minimum Order Quantity (MOQ) Impact on Pricing

MOQ affects unit cost through several mechanisms:

### Fabric MOQ
| Order Volume (meters) | Typical Price Impact |
|----------------------|---------------------|
| < 100 | +30-50% (sample/stock fabric pricing) |
| 100-500 | +10-20% (small batch premium) |
| 500-1,000 | Base price |
| 1,000-3,000 | -5-10% |
| 3,000-10,000 | -10-15% |
| > 10,000 | -15-20% (maximum discount) |

### Production MOQ
| Order Quantity (units) | SAM Efficiency Impact | Setup Cost per Unit |
|----------------------|----------------------|-------------------|
| < 500 | -15% efficiency (learning curve) | $0.50-$1.00/unit |
| 500-1,000 | -10% efficiency | $0.20-$0.40/unit |
| 1,000-3,000 | -5% efficiency | $0.10-$0.20/unit |
| 3,000-5,000 | Base efficiency | $0.05-$0.10/unit |
| 5,000-10,000 | +5% efficiency | $0.02-$0.05/unit |
| > 10,000 | +10% efficiency | < $0.02/unit |

### Setup Costs Amortized
Setup costs include: pattern grading, marker making, sample sewing, production setup.

```
setup_cost_per_unit = total_setup_cost / order_quantity

Typical total setup costs:
  Simple garment: $200-$500
  Medium complexity: $500-$1,000
  Complex garment: $1,000-$2,500
```

---

## Duty Rate Quick Reference

Duty rates vary by garment category (HS code), fabric composition, and country of origin. These are US import duties; Canadian and EU rates differ.

| HS Code | Description | US MFN Duty Rate |
|---------|-------------|-----------------|
| 6105 | Men's/boys' knit shirts (polo, t-shirt) | 19.7-32% |
| 6106 | Women's/girls' knit blouses | 19.7-32% |
| 6109 | T-shirts, singlets, tank tops (knit) | 16.5-32% |
| 6110 | Sweaters, pullovers, cardigans (knit) | 16.5-33.4% |
| 6203 | Men's/boys' suits, trousers (woven) | 7.6-27.5% |
| 6204 | Women's/girls' suits, dresses, trousers (woven) | 8.4-27.5% |
| 6205 | Men's/boys' shirts (woven) | 19.7-25.6% |
| 6206 | Women's/girls' blouses, shirts (woven) | 15.1-26.9% |

**Trade agreement reductions**:
- CUSMA/USMCA (Mexico, Canada): 0% if rules of origin met (yarn-forward rule)
- DR-CAFTA (Central America): 0% if rules of origin met
- GSP (Generalized System of Preferences): Reduced or 0% for qualifying developing countries
- No preferential rates for China (standard MFN applies)

**Canadian duty rates** are generally lower (0-18%) and use different HS code interpretations. Always verify with the Canadian Customs Tariff.

---

## Freight Cost Estimation

### Ocean Freight (FCL -- Full Container Load)

| Route | 20ft Container | 40ft Container | Transit Time |
|-------|---------------|----------------|-------------|
| China to US West Coast | $1,800-$3,500 | $2,500-$5,000 | 14-18 days |
| China to US East Coast | $3,000-$5,500 | $4,000-$7,500 | 25-35 days |
| China to Canada (Vancouver) | $1,500-$3,000 | $2,200-$4,500 | 12-16 days |
| Bangladesh to US East Coast | $2,500-$4,500 | $3,500-$6,500 | 28-35 days |
| Vietnam to US West Coast | $1,500-$3,000 | $2,200-$4,500 | 16-22 days |
| Turkey to US East Coast | $2,000-$4,000 | $3,000-$5,500 | 18-25 days |
| Mexico to US (truck) | $800-$2,000 | $1,200-$3,000 | 3-7 days |

**Container capacity for garments** (approximate):
- 20ft container: 10,000-15,000 units (light garments) or 6,000-10,000 units (heavy)
- 40ft container: 20,000-30,000 units (light) or 12,000-20,000 units (heavy)

**Per-unit freight estimation**:
```
freight_per_unit = container_cost / units_per_container
```

### Air Freight

| Route | Cost per kg | Transit Time |
|-------|-----------|-------------|
| China to North America | $4.00-$8.00/kg | 3-5 days |
| Bangladesh to North America | $5.00-$10.00/kg | 3-7 days |
| Turkey to North America | $4.00-$7.00/kg | 3-5 days |

Air freight typically costs 5-10x more than ocean freight per unit. Use only for urgent replenishment, sampling, or high-value lightweight items.
