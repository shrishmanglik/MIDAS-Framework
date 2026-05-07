# PrepAI Studio — Clone Spec

**Product:** Chemistry exam-prep app for Indian JEE & NEET aspirants. Combines spaced-repetition practice (FSRS v5), a "blueprint" exam generator, progress analytics, and four free utility tools.

**Live URL (reference):** https://prepai.milliondollarstudio.ai

## Screenshots to Upload

Drag every PNG in `prepai/screenshots/` into AI Studio:
- `landing-desktop.png`, `landing-mobile.png`
- `tools-desktop.png` — the 4-tool grid
- `tool-equation-balancer.png` — sample tool in use
- `practice-session-desktop.png` — FSRS card flip + answer
- `dashboard-desktop.png` — mastery / streak / retention curve
- `pricing-desktop.png`

---

## ✂️ PASTE EVERYTHING BELOW INTO GOOGLE AI STUDIO ✂️

Build a single-page React app called **PrepAI Studio** that clones an exam-prep tool for JEE & NEET chemistry. Tagline: *"Chemistry mastery for JEE & NEET — Study Smarter, Score Higher."* Subheading: *"Exam-focused practice built for Indian students."* Match the visual style of the uploaded screenshots: clean, professional, white background with deep teal `#0d9488` primary, slate `#0f172a` text, lime `#84cc16` accent for streaks/mastery. Tailwind CSS. Inter for body, Space Grotesk for headings. Mobile-first.

### Top banner
`🧪 Built with Google AI Studio in 19 minutes — View source on GitHub →`. Teal background, white text.

### Header / Nav
Logo `PrepAI Studio` (left) · `Tools`, `Practice`, `Pricing` (centre) · `Login`, `Start Free` (right, latter is teal pill button). Hamburger on mobile.

### Routes
1. `/` — Landing
2. `/tools` — 4 free tools grid + each tool's detail view
3. `/practice` — Spaced-repetition session (the "real" feature)
4. `/dashboard` — Progress analytics
5. `/pricing` — 3 tiers

### Landing page
- Hero H1: *"Chemistry mastery for JEE & NEET"* · Subhead: *"Exam-focused practice built for Indian students."* · Primary CTA `Start Free →` · Secondary `Try Tools Free`. Right side: a static screenshot-style mock card showing one practice question.
- 3-feature row:
  - **Spaced Repetition Practice** — *"FSRS v5 schedules questions at the optimal interval. Stop forgetting what you've already learned."*
  - **Blueprint Exam Generator** — *"Generates papers matching the official JEE/NEET mark distribution by chapter."*
  - **Progress Analytics** — *"Topic mastery, streaks, retention curves — see exactly where you'll lose marks."*
- Free tools strip: 4 tiles (Equation Balancer, Periodic Table, Named Reactions, Calculators) with "Try free — no login required".
- Trust strip: *"Trusted by students preparing at Allen, FIITJEE, Aakash, Resonance, and Vibrant."*
- Footer: `PrepAI Studio · © 2026 Million Dollar AI Studio`.

### `/tools` — Free tools grid

Four cards, each clickable:

#### 1. Equation Balancer
Input: `Cu + HNO3 → Cu(NO3)2 + NO + H2O` (default). Button `Balance`. Output (hard-coded):
```
3 Cu + 8 HNO₃ → 3 Cu(NO₃)₂ + 2 NO + 4 H₂O
Oxidation states: Cu (0 → +2), N (+5 → +2)
Half reactions: Cu → Cu²⁺ + 2e⁻ ;  NO₃⁻ + 4H⁺ + 3e⁻ → NO + 2H₂O
```
Also support these inputs (hard-code outputs for each):
- `Fe + O2 → Fe2O3` → `4 Fe + 3 O₂ → 2 Fe₂O₃`
- `KMnO4 + HCl → KCl + MnCl2 + H2O + Cl2` → `2 KMnO₄ + 16 HCl → 2 KCl + 2 MnCl₂ + 8 H₂O + 5 Cl₂`

#### 2. Periodic Table
Render the full 18-column periodic table. Each cell: atomic number, symbol, name, atomic mass. Colour-code by group (alkali metals red, halogens yellow, noble gases purple, etc.). On click, show a sidebar with electron config, common oxidation states, and a JEE/NEET tag (e.g. *"Sodium — frequently tested in alkali metal trends, valency, and flame test colour (golden yellow)"*). Use real data for at least the first 20 elements + the d-block to Zn.

#### 3. Named Reactions
A searchable list of 12 named reactions important for JEE/NEET, each with name + 1-line summary + reaction arrow:
- Aldol Condensation
- Cannizzaro Reaction
- Wurtz Reaction
- Friedel-Crafts Alkylation
- Friedel-Crafts Acylation
- Sandmeyer Reaction
- Reimer-Tiemann Reaction
- Hoffmann Bromamide
- Clemmensen Reduction
- Wolff-Kishner Reduction
- Etard Reaction
- Stephen Reduction

#### 4. Calculators
Three sub-tools (tabs): pH calculator, Molar Mass calculator, Concentration converter. Each takes 1–2 inputs and shows a hard-coded result for any submission (e.g. pH calculator with `[H⁺] = 1e-3 M` returns `pH = 3.0 — acidic`).

### `/practice` — Spaced-repetition session
Card-based flashcard UI. Show one MCQ at a time:
- Question text (LaTeX rendering for formulae — use KaTeX)
- 4 options A/B/C/D (click to select)
- After click: show correct answer (highlight green/red), explanation, and 4 buttons: `Again`, `Hard`, `Good`, `Easy` (FSRS rating). Click any rating to advance to next card.
- Header: streak counter (`🔥 12-day streak`), session progress (`Card 3 of 20`), and topic chip (`Coordination Compounds`).

Pre-load these 5 real JEE/NEET-style questions (cycle through them):

1. **Q:** Which of the following is the correct IUPAC name for `[Co(NH₃)₄Cl₂]Cl`?
   A) Tetraaminedichloridocobalt(III) chloride
   B) Tetraamminedichloridocobalt(III) chloride ✓
   C) Dichloridotetraamminecobalt(III) chloride
   D) Cobalt tetraammine dichloride
   *Explanation: Ligands are listed alphabetically (ammine before chlorido), with `m` doubled in `ammine` per IUPAC 2005 recommendations.*

2. **Q:** The hybridisation of the central atom in `XeF₄` is:
   A) sp³  B) sp³d  C) sp³d² ✓  D) sp³d³
   *Explanation: 4 bond pairs + 2 lone pairs → 6 electron domains → sp³d² → square planar geometry.*

3. **Q:** Which compound shows the highest enol content?
   A) Acetone  B) Acetylacetone ✓  C) Acetaldehyde  D) Acetic acid
   *Explanation: 1,3-diketones have stable enol form due to intramolecular H-bonding + conjugation.*

4. **Q:** SN1 reaction is favoured by:
   A) Polar aprotic solvent
   B) Polar protic solvent ✓
   C) Non-polar solvent
   D) Strong nucleophile
   *Explanation: Polar protic solvents stabilise the carbocation intermediate.*

5. **Q:** The number of stereoisomers of `[Co(en)₂Cl₂]⁺` is:
   A) 1  B) 2  C) 3 ✓  D) 4
   *Explanation: cis (with optical isomers d/l pair) + trans → 3 total.*

### `/dashboard` — Progress
- Top row: 3 stat cards — `Cards reviewed: 1,247` · `Mastery: 68%` · `Streak: 12 days`
- Topic mastery bar chart (horizontal bars per topic):
  - Coordination Compounds 84%
  - Chemical Bonding 79%
  - Organic Reaction Mechanisms 71%
  - Thermodynamics 64%
  - Electrochemistry 58%
  - p-Block Elements 52%
  - Solid State 41%
- Retention curve (line chart): `Day 1: 95%`, `Day 3: 78%`, `Day 7: 62%`, `Day 14: 51%`, `Day 30: 44%` — labelled "Without spaced repetition" vs your line at 88% at day 30. Use Recharts.

### `/pricing`
Three cards (use exact copy):
- **Free** — `$0 forever` — *5 questions/day · All free tools · No credit card*
- **Pro** — `$9 CAD/month` — **Most Popular** badge — *Unlimited practice · Blueprint exam generator · FSRS scheduling · Full analytics*
- **Institution** — `$29 CAD/month` — *Everything in Pro · Teacher dashboard · Custom question bank · Up to 30 students*

CTA buttons: `Start Free`, `Upgrade to Pro`, `View Plan` — all open demo modal: *"This is a Google AI Studio clone. Live billing at prepai.milliondollarstudio.ai."*

Add fine print: *"Cancel anytime from the billing portal."*

### What to SKIP
- Real auth — `Login` opens demo modal.
- Real billing — Stripe/Razorpay etc. all stubbed.
- Real FSRS computation — just rotate through the 5 pre-loaded questions.
- Real LaTeX server — use client-side KaTeX.

### What MUST work
- All 5 routes navigable.
- Equation Balancer correctly maps the 3 known inputs to outputs.
- Periodic table is interactive (hover/click reveals detail).
- Practice flashcards advance through the 5 questions and loop.
- Dashboard charts render with real Recharts.
- Mobile responsive — single column at 390 px, hamburger nav.
- Top banner persists.

Generate the full React + Vite + Tailwind project.
