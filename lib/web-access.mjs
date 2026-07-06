import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_MAX_BYTES = 500_000;
const DEFAULT_TIMEOUT_MS = 15_000;
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /\.local$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i,
  /^\[?fe80:/i
];

function isPrivateHost(hostname) {
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) return true;
  const match = hostname.match(/^172\.(\d+)\./);
  if (match) {
    const octet = Number(match[1]);
    if (octet >= 16 && octet <= 31) return true;
  }
  return false;
}

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

export function extractText(html) {
  const source = String(html);
  const title = decodeEntities((source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim());
  const stripped = source
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6]|\/tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  const text = decodeEntities(stripped)
    .split(/\n+/)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
  const links = [...source.matchAll(/<a\s[^>]*href=["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .slice(0, 50)
    .map((match) => ({
      href: match[1],
      text: decodeEntities(match[2].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 120)
    }));
  return { title, text, links };
}

async function renderWithPlaywright(url, timeoutMs) {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    throw new Error('Rendering requires Playwright in the target project: npm i -D playwright && npx playwright install chromium');
  }
  const browser = await playwright.chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { timeout: timeoutMs, waitUntil: 'networkidle' });
    return await page.content();
  } finally {
    await browser.close();
  }
}

export async function fetchWeb({
  url,
  directory = '.',
  maxBytes = DEFAULT_MAX_BYTES,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  render = false,
  allowLocal = false,
  save = false
}) {
  if (!url) throw new Error('web fetch requires a URL.');
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs are allowed.');
  }
  if (!allowLocal && isPrivateHost(parsed.hostname)) {
    throw new Error(`Refusing to fetch private/loopback host ${parsed.hostname} without --allow-local.`);
  }

  const startedAt = new Date().toISOString();
  let body;
  let status = 0;
  let contentType = '';
  if (render) {
    body = await renderWithPlaywright(parsed.href, timeoutMs);
    status = 200;
    contentType = 'text/html; rendered=playwright';
  } else {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(parsed.href, {
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'user-agent': 'midas-framework/0.1 (+https://github.com/shrishmanglik/MIDAS-Framework)' }
      });
      status = response.status;
      contentType = response.headers.get('content-type') ?? '';
      const reader = response.body?.getReader();
      const chunks = [];
      let received = 0;
      let truncated = false;
      if (reader) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value.byteLength;
          if (received > maxBytes) {
            chunks.push(value.slice(0, value.byteLength - (received - maxBytes)));
            truncated = true;
            await reader.cancel();
            break;
          }
          chunks.push(value);
        }
      }
      body = Buffer.concat(chunks).toString('utf8');
      if (truncated) body += '\n[TRUNCATED by maxBytes]';
    } finally {
      clearTimeout(timer);
    }
  }

  const isHtml = /html/i.test(contentType) || /^\s*</.test(body);
  const extracted = isHtml ? extractText(body) : { title: '', text: body, links: [] };
  const receipt = {
    status: status >= 200 && status < 400 ? 'pass' : 'fail',
    url: parsed.href,
    httpStatus: status,
    contentType,
    fetchedAt: startedAt,
    renderer: render ? 'playwright-chromium' : 'node-fetch',
    bytes: Buffer.byteLength(body, 'utf8'),
    sha256: crypto.createHash('sha256').update(body).digest('hex'),
    title: extracted.title,
    textLength: extracted.text.length,
    text: extracted.text.slice(0, maxBytes),
    links: extracted.links
  };

  if (save) {
    const reportDir = path.join(path.resolve(directory), '.midas', 'reports', 'web');
    await fs.mkdir(reportDir, { recursive: true });
    const stamp = startedAt.replace(/[:.]/g, '-');
    const slug = parsed.hostname.replace(/[^a-z0-9.-]/gi, '-');
    const file = path.join(reportDir, `${stamp}-${slug}.json`);
    await fs.writeFile(file, JSON.stringify(receipt, null, 2));
    receipt.evidenceFile = path.relative(path.resolve(directory), file).replaceAll('\\', '/');
  }

  return receipt;
}
