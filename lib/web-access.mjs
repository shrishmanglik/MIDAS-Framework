import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';

const DEFAULT_MAX_BYTES = 500_000;
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 5;

// True for any IPv4 literal that must never be reached from a public fetch API:
// loopback, RFC1918 private, link-local (incl. cloud metadata 169.254.169.254),
// CGNAT, "this host", and broadcast.
function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 0 || a === 127) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function isPrivateIPv6(raw) {
  const ip = raw.toLowerCase();
  if (ip === '::1' || ip === '::') return true;
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true; // unique-local
  if (ip.startsWith('fe80')) return true; // link-local
  // IPv4-mapped / -compatible IPv6 (e.g. ::ffff:127.0.0.1, ::ffff:7f00:1) — extract and re-check.
  const mapped = ip.match(/(?:::ffff:)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  const hexMapped = ip.match(/::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hexMapped) {
    const high = parseInt(hexMapped[1], 16);
    const low = parseInt(hexMapped[2], 16);
    return isPrivateIPv4([(high >> 8) & 255, high & 255, (low >> 8) & 255, low & 255].join('.'));
  }
  return false;
}

// Literal-host predicate — pure, offline, deterministic. Exported for testing.
export function isPrivateHost(hostname) {
  const host = String(hostname).replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (net.isIPv4(host)) return isPrivateIPv4(host);
  if (net.isIPv6(host)) return isPrivateIPv6(host);
  if (/^\d/.test(host) && host.includes(':')) return isPrivateIPv6(host);
  return false;
}

// Resolve a DNS name and refuse if ANY resolved address is private (DNS-rebinding defense).
async function assertResolvesPublic(hostname) {
  const host = String(hostname).replace(/^\[|\]$/g, '');
  if (net.isIP(host)) return; // literal already checked by isPrivateHost
  let records;
  try {
    records = await dns.lookup(host, { all: true });
  } catch {
    return; // let fetch surface resolution errors; do not fail-open on a name we cannot resolve
  }
  for (const record of records) {
    const priv = record.family === 6 ? isPrivateIPv6(record.address) : isPrivateIPv4(record.address);
    if (priv) {
      throw new Error(`Refusing to fetch ${hostname}: resolves to private/loopback address ${record.address}.`);
    }
  }
}

// Validate one URL (entry or redirect hop) before it is fetched. In default
// (public) mode, every hop's host — and its DNS resolution — must be public, which
// blocks SSRF via attacker-supplied URLs that redirect inward. --allow-local is an
// explicit operator opt-in that relaxes the private-host guard for the whole call.
export async function assertUrlFetchable(parsed, { allowLocal = false, isRedirect = false } = {}) {
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs are allowed.');
  }
  if (allowLocal) return;
  if (isPrivateHost(parsed.hostname)) {
    const scope = isRedirect ? 'redirect target' : 'private/loopback host';
    throw new Error(`Refusing to fetch ${scope} ${parsed.hostname} without --allow-local.`);
  }
  await assertResolvesPublic(parsed.hostname);
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

// SSRF-safe fetch: follow redirects manually, re-validating every hop's destination.
async function safeFetch(entryUrl, { timeoutMs, allowLocal, maxBytes }) {
  let current = entryUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    await assertUrlFetchable(current, { allowLocal, isRedirect: hop > 0 });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(current.href, {
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'user-agent': 'midas-framework/0.1 (+https://github.com/shrishmanglik/MIDAS-Framework)' }
      });
    } finally {
      clearTimeout(timer);
    }
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      current = new URL(response.headers.get('location'), current);
      continue;
    }
    return { response, finalUrl: current.href };
  }
  throw new Error(`Too many redirects (>${MAX_REDIRECTS}).`);
}

async function readCapped(response, maxBytes) {
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
  let body = Buffer.concat(chunks).toString('utf8');
  if (truncated) body += '\n[TRUNCATED by maxBytes]';
  return body;
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

  const startedAt = new Date().toISOString();
  let body;
  let status = 0;
  let contentType = '';
  let finalUrl = parsed.href;
  if (render) {
    await assertUrlFetchable(parsed, { allowLocal, isRedirect: false });
    body = await renderWithPlaywright(parsed.href, timeoutMs);
    status = 200;
    contentType = 'text/html; rendered=playwright';
  } else {
    const { response, finalUrl: resolvedUrl } = await safeFetch(parsed, { timeoutMs, allowLocal, maxBytes });
    status = response.status;
    contentType = response.headers.get('content-type') ?? '';
    finalUrl = resolvedUrl;
    body = await readCapped(response, maxBytes);
  }

  const isHtml = /html/i.test(contentType) || /^\s*</.test(body);
  const extracted = isHtml ? extractText(body) : { title: '', text: body, links: [] };
  const receipt = {
    status: status >= 200 && status < 400 ? 'pass' : 'fail',
    url: parsed.href,
    finalUrl,
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
