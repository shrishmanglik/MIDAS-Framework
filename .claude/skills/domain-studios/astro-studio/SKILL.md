# Astro Studio -- The Celestial Calculator

> "The stars incline, they do not compel." -- Vedic proverb

Vedic astrology (Jyotish) calculation and interpretation engine that transforms birth data into precise planetary charts and meaningful interpretations. Leverages Swiss Ephemeris for astronomical accuracy, Lahiri ayanamsa for sidereal correction, and a 3-tier cost model where cached interpretations serve 95% of requests at near-zero cost.

---

## Activation Triggers

- User requests a birth chart or natal chart calculation
- User asks about planetary positions for a date/time/location
- User requests Vedic astrology interpretation (yogas, dashas, transits)
- User asks for compatibility analysis (Kundali matching)
- System needs to generate astrology content for JyotishAI SaaS

---

## Methodology

### Phase 1: INPUT
- Collect birth data: date, time (to the minute), location (lat/long)
- Validate input completeness (missing birth time triggers disclaimer)
- Resolve location to geographic coordinates via geocoding
- Determine timezone and DST offset for the birth moment

### Phase 2: CALCULATE
- Compute Julian Day Number from birth datetime
- Apply Lahiri ayanamsa correction (tropical to sidereal)
- Calculate planetary longitudes for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
- Compute house cusps using selected house system (default: Whole Sign)
- Determine nakshatra, pada, and rashi for each planet
- Identify planetary aspects (Vedic drishti system)

### Phase 3: CLASSIFY
- Detect yoga combinations from planetary placements
- Calculate Vimshottari dasha periods from Moon's nakshatra
- Assess planetary strength (Shadbala components)
- Identify key chart features: Ascendant lord, Moon sign, Atmakaraka

### Phase 4: INTERPRET
- Check interpretation cache by feature-hash
- If cache miss: generate interpretation using tiered AI model
- Apply standard disclaimer to all outputs
- Structure interpretation into sections: Overview, Strengths, Challenges, Timing

### Phase 5: CACHE & GATE
- Store interpretation keyed by yoga-combination-hash
- Validate output completeness (all planets, all houses, all requested analyses)
- Verify disclaimer presence
- Return structured JSON + human-readable summary

---

## Team Roster

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| `ephemeris-calculator` | Astronomical Calculator | birth datetime + location | planetary positions JSON |
| `interpretation-writer` | Vedic Astrology Interpreter | chart data JSON | human-readable interpretation |

---

## Quality Gates

| Gate | Check | Pass Criteria |
|------|-------|---------------|
| G1: Input Validity | Birth data completeness | Date + time + location all present and parseable |
| G2: Calculation Accuracy | Planetary positions | Positions within 1 arcminute of Swiss Ephemeris reference |
| G3: Yoga Detection | Yoga combination rules | All applicable yogas detected, no false positives |
| G4: Interpretation Quality | Content review | Covers all major chart factors, balanced tone, no absolute predictions |
| G5: Disclaimer Present | Legal compliance | Entertainment disclaimer appears on every interpretation output |
| G6: Cache Integrity | Hash consistency | Same inputs produce same cache key, cache hits return correct data |

---

## References Available

| Reference | Contents | Used By |
|-----------|----------|---------|
| `vedic-calculations.md` | Ayanamsa, house systems, dignity rules, aspect rules, nakshatra data | ephemeris-calculator |
| `yoga-definitions.md` | 20+ yoga formation rules with planets, houses, effects | interpretation-writer |
| `dasha-rules.md` | Vimshottari dasha system, bhukti calculations, interpretation rules | interpretation-writer |
| `cache-strategy.md` | Feature-hash caching, TTL strategy, cost analysis | both agents |

---

## Integration Points

| System | Direction | Data |
|--------|-----------|------|
| Swiss Ephemeris (via calc-engine) | Input | Planetary longitude, declination, speed |
| Geocoding API | Input | Location string to lat/long/timezone |
| Interpretation Cache (Redis/PostgreSQL) | Bidirectional | Cached interpretations keyed by feature-hash |
| JyotishAI Web Frontend | Output | Structured chart data + interpretation text |
| PDF Generator | Output | Formatted chart reports |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
|-------------|-------------|-----------------|
| Using tropical zodiac for Vedic astrology | Vedic system is sidereal; tropical gives wrong signs | Always apply Lahiri ayanamsa correction |
| Calling AI for every interpretation request | Cost explosion at scale ($0.10 per user) | Cache by yoga-combination-hash; serve from cache |
| Making absolute predictions | Legal liability, ethical issues, inaccuracy | Always frame as tendencies, use disclaimer |
| Ignoring birth time uncertainty | Minutes matter for house cusps and dasha timing | Flag uncertainty, show sensitivity range |
| Hardcoding ayanamsa value | Ayanamsa drifts ~50.3" per year | Calculate dynamically from Julian Day |
| Mixing house systems without disclosure | Different systems give different house placements | State house system used, allow user selection |
