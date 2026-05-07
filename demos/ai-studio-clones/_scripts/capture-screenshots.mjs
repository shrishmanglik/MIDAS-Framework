#!/usr/bin/env node
// Captures full-page desktop + mobile screenshots of every MDS live product.
// Run from demos/ai-studio-clones/ after `npm i -D playwright && npx playwright install chromium`.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const PRODUCTS = [
  {
    slug: "astro",
    base: "https://astro.milliondollarstudio.ai",
    routes: [
      { name: "landing", path: "/" },
      { name: "kundli", path: "/kundli" },
      { name: "horoscope", path: "/horoscope" },
      { name: "compatibility", path: "/compatibility" },
      { name: "pricing", path: "/pricing" },
    ],
  },
  {
    slug: "prepai",
    base: "https://prepai.milliondollarstudio.ai",
    routes: [
      { name: "landing", path: "/" },
      { name: "tools", path: "/tools" },
      { name: "practice", path: "/practice" },
      { name: "dashboard", path: "/dashboard" },
      { name: "pricing", path: "/pricing" },
    ],
  },
  {
    slug: "pathway",
    base: "https://pathway.milliondollarstudio.ai",
    routes: [
      { name: "landing", path: "/" },
      { name: "calculator", path: "/calculator" },
      { name: "draws", path: "/draws" },
      { name: "pnp", path: "/pnp" },
    ],
  },
  {
    slug: "atlas",
    base: "https://atlas.milliondollarstudio.ai",
    routes: [
      { name: "landing", path: "/" },
      { name: "residency", path: "/residency" },
      { name: "dtaa", path: "/dtaa" },
      { name: "checklist", path: "/checklist" },
      { name: "pricing", path: "/pricing" },
    ],
  },
  {
    slug: "nestiq",
    base: "https://nestiq.milliondollarstudio.ai",
    routes: [
      { name: "landing", path: "/" },
      { name: "search", path: "/search" },
      { name: "neighbourhoods", path: "/neighbourhoods" },
      { name: "alerts", path: "/alerts" },
      { name: "pricing", path: "/pricing" },
    ],
  },
];

const VIEWPORTS = [
  { label: "desktop", width: 1440, height: 900, deviceScaleFactor: 1 },
  { label: "mobile", width: 390, height: 844, deviceScaleFactor: 2 },
];

async function captureRoute(browser, product, route, viewport) {
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    userAgent:
      viewport.label === "mobile"
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        : undefined,
  });
  const page = await ctx.newPage();
  const url = product.base + route.path;
  const outDir = resolve(ROOT, product.slug, "screenshots");
  await mkdir(outDir, { recursive: true });
  const outPath = resolve(outDir, `${route.name}-${viewport.label}.png`);

  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    if (!response || !response.ok()) {
      console.error(`  ✗ ${url} — HTTP ${response?.status() ?? "no response"}`);
      await ctx.close();
      return false;
    }
    // small settle for client-rendered content
    await page.waitForTimeout(1500);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`  ✓ ${product.slug}/${route.name}-${viewport.label}.png`);
    await ctx.close();
    return true;
  } catch (err) {
    console.error(`  ✗ ${url} — ${err.message}`);
    await ctx.close();
    return false;
  }
}

async function main() {
  const filter = process.argv[2]; // optional: pass slug to capture only one product
  const browser = await chromium.launch();
  const results = { ok: 0, fail: 0 };

  for (const product of PRODUCTS) {
    if (filter && product.slug !== filter) continue;
    console.log(`\n→ ${product.slug} (${product.base})`);
    for (const route of product.routes) {
      for (const vp of VIEWPORTS) {
        const ok = await captureRoute(browser, product, route, vp);
        if (ok) results.ok++; else results.fail++;
      }
    }
  }

  await browser.close();
  console.log(`\nDone. ${results.ok} captured, ${results.fail} failed.`);
  process.exit(results.fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
