# Screenshot capture

Captures full-page desktop + mobile screenshots of all 5 MDS live products to `{product}/screenshots/`.

## Setup

```bash
cd demos/ai-studio-clones
npm init -y                   # if you don't already have a package.json here
npm i -D playwright
npx playwright install chromium
```

## Run

```bash
# Capture every product
node _scripts/capture-screenshots.mjs

# Or one at a time
node _scripts/capture-screenshots.mjs astro
node _scripts/capture-screenshots.mjs prepai
node _scripts/capture-screenshots.mjs pathway
node _scripts/capture-screenshots.mjs atlas
node _scripts/capture-screenshots.mjs nestiq
```

## Output

Each route is captured at two viewports:
- Desktop — 1440 × 900 (DPR 1)
- Mobile — 390 × 844 (DPR 2, iPhone-class UA)

Files land in `{product}/screenshots/{route}-{desktop|mobile}.png`.

## Known issues at time of writing

- `atlas.milliondollarstudio.ai` and `nestiq.milliondollarstudio.ai` returned `ECONNREFUSED` in WebFetch checks. Verify DNS / Vercel deployment before relying on those captures.
- These are SPAs — the script waits 1.5 s after `networkidle` to let client routes finish rendering. If a route shows a blank state, increase the `waitForTimeout` in `capture-screenshots.mjs`.
