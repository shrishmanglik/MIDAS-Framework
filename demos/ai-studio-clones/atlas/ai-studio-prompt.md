# Atlas — Clone Spec

**Product:** India-Canada cross-border tax assistant. Helps people who are tax-resident in one country and earning income in the other to figure out residency status, DTAA (Double Taxation Avoidance Agreement) implications, and approximate tax owed in each jurisdiction.

**Live URL (reference):** https://atlas.milliondollarstudio.ai

> ⚠️ At capture time this subdomain returned `ECONNREFUSED`. Re-take screenshots once the live site is reachable; until then this spec is derived from the task brief and standard cross-border tax tooling.

## Screenshots to Upload (when available)

- `landing-desktop.png`, `landing-mobile.png`
- `residency-wizard.png` — SPT / 182-day residency questionnaire
- `dtaa-calculator.png` — income-type by source-country grid
- `result-tax-owed.png` — IN side + CA side breakdown + DTAA credit
- `documents-checklist.png` — what to file, when, where
- `pricing-desktop.png`

---

## ✂️ PASTE EVERYTHING BELOW INTO GOOGLE AI STUDIO ✂️

Build a React app called **Atlas — India-Canada Tax Navigator**. Tagline: *"Cross-border tax clarity for Indian-Canadian professionals — residency, DTAA, and what you actually owe."*

This app is for: NRIs working in Canada with Indian rental/dividend income, Canadian PRs returning to India mid-year, students on study permits, and ICs who took an Indian role from a Canadian payroll. The app determines (1) tax residency in each country, (2) which income is taxable where, (3) DTAA credits, and (4) what to file.

Match the visual style of uploaded screenshots: serious financial palette — navy `#1e3a8a` primary, gold accent `#ca8a04`, white background. Use Inter and a serif (Source Serif Pro) for big numbers. Tailwind CSS. Mobile-first.

### Top banner
`📊 Built with Google AI Studio in 24 minutes — View source on GitHub →`. Navy bg, white text.

### Disclaimer (bottom of every page)
*"Atlas is informational. Not a substitute for a CA / CPA. Cross-border tax requires individual review. Consult a licensed professional before filing."*

### Header / Nav
Logo `Atlas` with a tiny IN+CA flag pair. Nav: `Residency Check`, `DTAA Calculator`, `Income Mapper`, `Filing Checklist`, `Pricing`. Right: `Sign in`.

### Routes
1. `/` — Landing
2. `/residency` — Residency status wizard
3. `/dtaa` — DTAA income-type calculator
4. `/income-mapper` — Per-line tax allocation
5. `/checklist` — What to file in each country
6. `/pricing`

### Landing page
- Hero H1: *"Cross-border tax clarity, simplified."* · Subhead: *"You're tax-resident somewhere. Atlas figures out where, what's taxable in each country, and what DTAA credits you can claim — in 6 minutes."* · CTA `Check My Residency Status →` · Secondary `See How DTAA Works`.
- 4-feature grid:
  - **Residency Test** — Indian DTAA-tiebreaker + Canadian SPT, automated.
  - **Income Mapper** — Map every income line to its tax jurisdiction.
  - **DTAA Credit** — Article-by-article walkthrough (Articles 7, 10, 11, 12, 15, 21).
  - **Filing Checklist** — ITR, T1, FBAR-equivalents, FA Schedule, T1135.
- "Who uses Atlas" cards:
  - *"NRI tech worker in Toronto with rental income from Pune"* — Mostly applies: Article 6 (immovable property), TDS in IN, foreign tax credit in CA.
  - *"PR returning to India mid-year"* — Split-year residency, Section 6 conditions, 182-day test.
  - *"International student in Vancouver, parents wiring tuition"* — Generally not a remittance issue, but FA Schedule applies.
- Footer + disclaimer.

### `/residency` — Residency wizard
Multi-step wizard. Determine **Indian residency under Section 6** AND **Canadian residency under SPT + ties test**, then apply DTAA Article 4 tiebreaker if dual.

**Steps:**
1. **Days present** — `Days in India in current FY (Apr–Mar)` slider 0–365. `Days in Canada in current calendar year` slider 0–365.
2. **Past presence** — `Days in India in past 4 FYs` (sum). `Days in Canada in past 2 calendar years`.
3. **Status** — `Indian citizen abroad? Y/N`, `PIO/OCI? Y/N`, `Canadian PR/citizen? Y/N`.
4. **Significant ties (CA)** — `Spouse in Canada? Y/N`, `Dependants in Canada? Y/N`, `Owned/leased home in Canada? Y/N`.
5. **Secondary ties (CA)** — `Driver's license`, `Provincial health card`, `Bank account`, `Memberships` — checkboxes.

**Result page:**
- Indian status: `Resident` / `Resident but Not Ordinarily Resident (RNOR)` / `Non-Resident` — with the rule that triggered it.
- Canadian status: `Factual resident` / `Deemed resident` / `Non-resident` / `Deemed non-resident` — with the rule.
- If dual: DTAA Article 4 tiebreaker walkthrough — permanent home → centre of vital interests → habitual abode → nationality.
- Final assignment: e.g. *"Per DTAA Article 4(2)(a), your permanent home is in Canada. Treaty-resident: Canada. India can still tax India-source income; Canada taxes worldwide income with foreign tax credit."*

### `/dtaa` — DTAA Calculator
A grid: 7 income types × 2 source countries.

| Income Type | If India-source | If Canada-source |
|---|---|---|
| Salary (Article 15) | Taxable in country of residence; if employment exercised in source, source can tax | … |
| Business profits (Art 7) | Taxable in source if PE exists | … |
| Dividends (Art 10) | India: 10% withholding; CA tax credit avail | CA: 25% withholding (15% under DTAA); IN tax credit |
| Interest (Art 11) | 15% withholding | 15% withholding |
| Royalties / FTS (Art 12) | 10–15% withholding | 10% withholding |
| Capital gains (Art 13) | Real property: source-country taxes; equity shares post-2017: source-country taxes | Mostly residence-country |
| Pensions (Art 18) | Generally taxable only in residence | Generally taxable only in residence |

User picks income type + country + amount; output shows: source country withholding, residence country full tax, DTAA credit, net effective tax. Hard-code 6 worked examples for any input.

Example (hard-code these as ready-made scenarios on the page):
- **₹6,00,000 rent from Pune flat, Canadian resident**: India-source · Article 6/7 (immovable property) · IN: TDS 31.2% on net after standard deduction OR file ITR · CA: include in worldwide income, claim foreign tax credit on IN tax paid · Estimated net tax leakage: nil if fully creditable.
- **CAD 12,000 dividends from Canadian ETF, Indian resident (RNOR)**: Canada-source · Article 10 · CA: 25% withholding reduced to 15% under DTAA · IN: not taxable for RNOR if income arises outside India.
- **CAD 80,000 salary from Canadian employer, Indian resident**: Canada-source · Article 15 · CA primary · IN: taxable on worldwide income, FTC for CA tax paid.
- **₹15,00,000 long-term capital gain on Indian listed shares, Canadian resident**: Article 13(5) — source country (India) taxes · IN LTCG 12.5% over ₹1.25L · CA: include for cap gains, FTC available.
- **₹50,000 interest on NRO FD, Canadian resident**: Article 11 · IN withholding 15% (DTAA rate) · CA: include in worldwide income, FTC.
- **₹40 lakh sale of Mumbai flat, Canadian resident**: Article 13(1) immovable property · IN LTCG 12.5% with indexation/grandfathering · CA: deemed disposition rules may apply on emigration.

### `/income-mapper`
A table builder. User adds rows: `Source country`, `Income type`, `Amount`, `Currency`. App tags each line with the relevant DTAA article and a colour pill (`India taxes`, `Canada taxes`, `Both — credit applies`). Show grand total in INR and CAD using a static FX rate (default `1 CAD = ₹62.50`, editable). Add `Export CSV` (demo modal).

### `/checklist`
Two columns side-by-side: India and Canada. Under each: filing forms with due dates.

**India side:**
- ITR-1 / ITR-2 / ITR-3 (depending on residential status & income type) — due 31-July (non-audit) / 31-October (audit)
- Schedule FA (Foreign Assets) — for residents only
- Schedule FSI (Foreign Source Income) + Form 67 for foreign tax credit
- Form 26AS / AIS / TIS reconciliation

**Canada side:**
- T1 General — due 30-April
- T1135 (Foreign Income Verification) — if specified foreign property > CAD 100,000
- T2209 (Federal Foreign Tax Credit)
- T776 (rental income), T2125 (self-employment), Schedule 3 (capital gains)

### `/pricing`
Three tiers:
- **Free** — `₹0` — *Residency check + 3 DTAA scenarios*
- **Pro** — `₹999/month` (or `CAD 19/month`) — *Unlimited scenarios + Income mapper + filing checklist export* — **Most Popular**
- **Concierge** — `₹4,999/month` — *Pro + 1 hr/month with a dual-qualified CA/CPA*

Demo modal on every Subscribe.

### What to SKIP
- Real auth, payments, PDF export.
- Real CRA / Income Tax Department API connections.
- Real exchange-rate API — use the static `1 CAD = ₹62.50` mock.

### What MUST work
- Residency wizard correctly decides RNOR / Resident / Non-resident based on the actual Section 6 + SPT + ties rules. (These rules are deterministic — implement them.)
- DTAA grid maps the 7 income types to articles correctly.
- Income mapper sums totals in both currencies.
- Checklist renders cleanly side-by-side on desktop, stacks on mobile.
- Top banner + bottom disclaimer persist.

Generate the full React + Vite + Tailwind project.
