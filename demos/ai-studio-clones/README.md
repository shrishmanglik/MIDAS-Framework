# MDS × Google AI Studio — Product Clone Demos

Five working prototypes of MDS live products, rebuilt in Google AI Studio (Gemini build mode) as a portfolio piece for the Google DevX India application. The pitch: **AI Studio + Gemini can rapidly clone production systems**.

## The 5 Targets

| # | Product | Live URL | What it does | Clone domain |
|---|---------|----------|--------------|--------------|
| 1 | **Astro** | astro.milliondollarstudio.ai | Vedic astrology — kundli, horoscope, compatibility | demo-astro.milliondollarstudio.ai |
| 2 | **PrepAI** | prepai.milliondollarstudio.ai | JEE/NEET chemistry practice — FSRS, blueprint papers, free tools | demo-prepai.milliondollarstudio.ai |
| 3 | **Pathway** | pathway.milliondollarstudio.ai | Canadian immigration — CRS calculator, Express Entry | demo-pathway.milliondollarstudio.ai |
| 4 | **Atlas** | atlas.milliondollarstudio.ai | India-Canada tax — DTAA, residency, foreign income | demo-atlas.milliondollarstudio.ai |
| 5 | **Nestiq** | nestiq.milliondollarstudio.ai | Canadian rental intelligence — listings, neighbourhood scores | demo-nestiq.milliondollarstudio.ai |

> ⚠️ **At capture time `atlas` and `nestiq` subdomains returned ECONNREFUSED** — confirm DNS / deployment before running the screenshot script, or the spec for those two will need to be re-derived from local source.

## Repository Layout

```
demos/ai-studio-clones/
├── README.md                       ← you are here
├── _scripts/
│   └── capture-screenshots.mjs     ← Playwright runner (Phase 1)
├── astro/
│   ├── ai-studio-prompt.md         ← paste this into AI Studio
│   └── screenshots/                ← upload these alongside the prompt
├── prepai/   …
├── pathway/  …
├── atlas/    …
└── nestiq/   …
```

## Three Phases

### Phase 1 — Screenshot + Spec Capture (Claude Code, automatable)

Spec files (`ai-studio-prompt.md`) are already authored in this repo. To capture screenshots, run:

```bash
cd demos/ai-studio-clones
npm i -D playwright
npx playwright install chromium
node _scripts/capture-screenshots.mjs
```

The script visits each live URL, captures full-page PNGs at 1440 × 900 (desktop) and 390 × 844 (mobile), and writes them to `{product}/screenshots/`. Reruns are idempotent.

### Phase 2 — AI Studio Build (manual, in browser)

For each product:
1. Open https://aistudio.google.com → Build mode.
2. Upload every PNG from `{product}/screenshots/`.
3. Paste the entire contents of `{product}/ai-studio-prompt.md`.
4. Let Gemini generate the React prototype.
5. Iterate 2–3 times for visual fidelity. Ask for: "match the screenshots more closely", "make this mobile-responsive", "add the 'Built with Google AI Studio' banner".
6. Use AI Studio's one-click GitHub export. Repo naming: `mds-clone-{product}`.

### Phase 3 — Deploy (Claude Code, automatable)

```bash
# For each cloned repo:
vercel --prod --confirm
# Then wire DNS: demo-{product}.milliondollarstudio.ai → Vercel
```

Build a comparison landing page at `milliondollarstudio.ai/ai-studio-demos` with a side-by-side "production vs AI Studio clone" toggle for each product.

## Universal Constraints (apply to every clone)

- **No real auth.** No login screens beyond a static "Sign in" button that opens a "Demo build — auth disabled" modal.
- **No payments.** Pricing pages render but every "Buy" button shows the same demo modal.
- **No API calls at runtime.** Mock data is hard-coded in `data.ts` (or similar). Zero fetch/XHR to the network.
- **Mobile-responsive.** Tailwind's `sm: md: lg:` breakpoints, never horizontal scroll on a 390 px viewport.
- **Banner.** Every page shows a thin top-of-page strip: `Built with Google AI Studio in <X> minutes — [View source on GitHub]`. Include exact build time after Phase 2.
- **Realistic mock data.** Real Indian names for astro, real chemistry questions for prepai, real Canadian cities/postal codes for pathway/atlas/nestiq. **No lorem ipsum.**
- **Don't break production.** This work is read-only against live sites; we only capture screenshots, never POST.

## Acceptance Checklist

- [ ] 5 screenshot sets captured (`{product}/screenshots/*.png`)
- [ ] 5 AI Studio prompt files reviewed (`{product}/ai-studio-prompt.md`)
- [ ] Each prompt < 2000 words (AI Studio limit)
- [ ] Mock data realistic, not lorem ipsum
- [ ] After manual AI Studio build: 5 deployed demos on `demo-{product}.*` subdomains
- [ ] Landing page comparing production vs AI Studio clone live at `/ai-studio-demos`

## Why This Pitch Works for Google DevX India

- It demonstrates AI Studio's **end-to-end velocity** (screenshots → prompt → working app) on **non-trivial Indian-context products**.
- It shows MDS **already builds production-grade Gemini-adjacent tooling** — a credible voice when advocating to other Indian developers.
- The before/after page is **shareable as one URL** — the perfect artifact for a DevX advocate role.
