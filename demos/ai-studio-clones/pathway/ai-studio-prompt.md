# Pathway AI — Clone Spec

**Product:** Free Express Entry CRS calculator for Canadian PR aspirants. Walks the user through the Comprehensive Ranking System scoring grid and outputs a CRS score with a breakdown.

**Live URL (reference):** https://pathway.milliondollarstudio.ai

## Screenshots to Upload

- `landing-desktop.png`, `landing-mobile.png`
- `calculator-step1.png` — age + status form
- `calculator-step2.png` — education + language
- `calculator-step3.png` — work experience + adaptability
- `result-desktop.png` — CRS score + category breakdown
- `result-mobile.png`
- `provincial-comparison.png` — IF the live site has a PNP comparison view

---

## ✂️ PASTE EVERYTHING BELOW INTO GOOGLE AI STUDIO ✂️

Build a React app called **Pathway AI — Free CRS Calculator Canada 2026**. Tagline: *"Accurate Express Entry Score — built on the official IRCC scoring grid."* The app is a multi-step wizard that calculates a Comprehensive Ranking System (CRS) score, then shows the breakdown alongside the latest Express Entry draw history.

Match the visual style of uploaded screenshots: maple-red `#dc2626` primary (subtle, never garish), navy `#0f172a` for trust, white background, generous whitespace. Inter throughout. Tailwind CSS, mobile-first.

### Top banner
`🍁 Built with Google AI Studio in 22 minutes — View source on GitHub →`. Navy bg, white text.

### Header / Nav
Logo `Pathway AI` with maple leaf · `CRS Calculator`, `Draw History`, `PNP Tracker`, `Resources` · Right: `Start Free`. Hamburger mobile.

### Routes
1. `/` — Landing
2. `/calculator` — Multi-step wizard (5 steps)
3. `/result` — Score breakdown (rendered after wizard)
4. `/draws` — Draw history
5. `/pnp` — Provincial Nominee Program tracker

### Landing page
- Hero H1: *"Free CRS Calculator Canada 2026"* · Subhead: *"Calculate your Express Entry score in 4 minutes. Built on the official IRCC scoring grid — updated for the 2025 category-based selection rounds."* · Primary CTA `Calculate My CRS Score →` · Secondary `See Latest Draw`.
- Trust row: *"Used by 80,000+ candidates · Updated weekly with IRCC draws · No signup required"*.
- Below: 3-card "What you'll see" — `Your CRS Score`, `Category Breakdown`, `Realistic Cutoff Comparison` with the most recent draw cutoff.
- Latest draw teaser card: *"Most recent draw: April 30, 2026 · CEC · 3,500 invitations · CRS cutoff 524."*
- Footer with disclaimers: *"This is an unofficial calculator. For binding decisions consult IRCC at canada.ca."*

### `/calculator` — Wizard

Five steps with a progress bar (`Step 2 of 5`). Use these EXACT fields and option lists. Compute scores deterministically using the official IRCC grid (yes, do this for real — it's a finite formula).

#### Step 1 — Personal
- `Marital status` (radio): Single | Married/Common-law
- `Age` (number input, 17–45)

#### Step 2 — Education
- `Highest level of education completed` (select):
  - Less than secondary
  - Secondary diploma
  - One-year post-secondary
  - Two-year post-secondary
  - Bachelor's degree (3+ years)
  - Two or more credentials, one 3+ years
  - Master's degree
  - Doctoral (PhD)
- `Did you complete this education in Canada?` (radio Y/N)
- (If spouse) `Spouse's education` — same options

#### Step 3 — Language (English)
For each of `Listening`, `Reading`, `Writing`, `Speaking`: select CLB level 4–10+. Map to CLB-equivalent IELTS/CELPIP scores in helper text.
- `Second official language?` (Y/N — if Y, repeat block for French TEF/TCF).

#### Step 4 — Work experience
- `Years of Canadian skilled work experience` (0, 1, 2, 3, 4, 5+)
- `Years of foreign skilled work experience` (0, 1, 2, 3+)
- `Has a valid LMIA-backed job offer in Canada?` (Y/N — if Y, NOC TEER level dropdown)

#### Step 5 — Additional
- `Provincial nomination?` (Y/N) — adds 600 points
- `Sibling in Canada (citizen/PR)?` (Y/N) — adds 15 points
- `Studied in Canada (1+ year credential)?` (Y/N)
- `French language ability NCLC 7+?` (Y/N)

`Calculate My Score →` button at end.

### `/result` — Score breakdown
- Big number: `CRS Score: 487` (compute live from the form values).
- Comparison bar: their score vs the **last 5 draw cutoffs** (use real recent values):
  | Date | Round Type | Cutoff |
  |---|---|---|
  | 2026-04-30 | CEC | 524 |
  | 2026-04-23 | French language | 410 |
  | 2026-04-09 | Healthcare occupations | 491 |
  | 2026-03-26 | STEM occupations | 481 |
  | 2026-03-12 | General | 539 |
- Verdict card: e.g. *"Your score (487) is below the most recent CEC cutoff (524). You may receive ITA in a category-based draw — STEM, Healthcare, or French — depending on your NOC."*
- Category breakdown (stacked bar):
  - Core human capital — out of 460/500 (single/with spouse)
  - Skill transferability — out of 100
  - Additional points — out of 600
- "How to improve" tips list (5 actionable items based on which subscores were lowest, e.g. *"Retake IELTS aiming for CLB 9+ in all four — adds up to 50 points"*, *"Get a provincial nomination — instant 600 points"*).
- `Download my report (PDF)` opens demo modal.

### `/draws` — Draw history
Searchable / filterable table of the last 25 Express Entry draws (use real data from 2025–2026, verifiable on canada.ca):
- Columns: Date, Round Type (CEC, PNP, FSW, French, STEM, Healthcare, Trades, Transport, Agriculture, General), CRS cutoff, Invitations issued, Tie-breaking date.
- Filter chips at top: `All | CEC | PNP | French | STEM | Healthcare`.
- Below table: a line chart of cutoff over time. Use Recharts.

Sample rows (use these and add ~20 more real ones):
| 2026-04-30 | CEC | 524 | 3,500 |
| 2026-04-23 | French language | 410 | 2,000 |
| 2026-04-09 | Healthcare | 491 | 1,500 |
| 2026-03-26 | STEM | 481 | 4,500 |
| 2026-03-12 | General | 539 | 1,800 |
| 2026-02-26 | PNP | 736 | 720 |

### `/pnp` — Provincial Nominee Program tracker
Cards for the 11 PNP provinces/territories: ON, BC, AB, SK, MB, NS, NB, NL, PE, YT, NT. Each card:
- Province name + flag/emblem
- Latest stream draws (e.g. *"OINP Tech Draw — 2026-04-15 — CRS 460+"*)
- Top streams (3 chips, e.g. for Ontario: Tech Draw, French-speaking, Master's Graduate)
- "Eligibility quick-check →" button (opens demo modal).

### What to SKIP
- Real auth.
- PDF generation.
- Live IRCC API integration — all draw data is hard-coded.

### What MUST work
- The CRS calculation must be **mathematically correct** for any input combination. Use the official IRCC grid:
  - **Core human capital** (max 460 single, 500 with spouse): age, education, official languages, Canadian work experience.
  - **Skill transferability** (max 100): combinations of education + language, education + work, language + work, foreign work + Canadian work.
  - **Additional** (max 600): PN (600), sibling (15), French (25–50), Canadian study (15–30), arranged employment (50–200).
- All 5 wizard steps complete before showing the result.
- Mobile: wizard becomes single column, charts go full-width.
- Top banner persists.

Generate the full React + Vite + Tailwind + Recharts project.
