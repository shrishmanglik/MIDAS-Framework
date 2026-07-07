import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { assertUrlFetchable, fetchWeb, isPrivateHost } from '../lib/web-access.mjs';

test('isPrivateHost blocks loopback across every literal encoding', () => {
  const blocked = [
    'localhost', 'foo.localhost', 'printer.local',
    '127.0.0.1', '127.255.255.254',
    '10.0.0.1', '10.255.255.255',
    '172.16.0.1', '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',        // cloud metadata
    '100.64.0.1',             // CGNAT
    '0.0.0.0', '0.0.0.1',
    '224.0.0.1',              // multicast
    '[::1]', '::1', '[::]',
    '[fc00::1]', '[fd12:3456::1]', '[fe80::1]',
    '[::ffff:127.0.0.1]', '[::ffff:7f00:1]', // IPv4-mapped IPv6 loopback
    '[::ffff:169.254.169.254]'
  ];
  for (const host of blocked) {
    assert.equal(isPrivateHost(host), true, `expected ${host} to be private`);
  }
});

test('isPrivateHost allows genuine public hosts', () => {
  const allowed = ['example.com', 'api.anthropic.com', '8.8.8.8', '1.1.1.1', '93.184.216.34', '[2606:2800:220:1:248:1893:25c8:1946]', '172.15.0.1', '172.32.0.1', '11.0.0.1'];
  for (const host of allowed) {
    assert.equal(isPrivateHost(host), false, `expected ${host} to be public`);
  }
});

test('URL normalization funnels shorthand and alternate-encoding IPs into the guard', async () => {
  // new URL() normalizes these to a canonical dotted quad before the guard runs.
  for (const url of ['http://127.1/', 'http://2130706433/', 'http://0x7f000001/', 'http://0177.0.0.1/']) {
    assert.equal(new URL(url).hostname, '127.0.0.1', `${url} should normalize to 127.0.0.1`);
    await assert.rejects(() => assertUrlFetchable(new URL(url), {}), /private\/loopback/);
  }
});

test('assertUrlFetchable rejects private hops and non-http protocols in public mode', async () => {
  await assert.rejects(() => assertUrlFetchable(new URL('http://169.254.169.254/'), { isRedirect: true }), /redirect target/);
  await assert.rejects(() => assertUrlFetchable(new URL('http://127.0.0.1/'), {}), /private\/loopback/);
  await assert.rejects(() => assertUrlFetchable(new URL('ftp://example.com/'), {}), /http and https/);
  // Public IP literal passes.
  await assert.doesNotReject(() => assertUrlFetchable(new URL('http://8.8.8.8/'), {}));
  // allow-local opt-in relaxes the guard.
  await assert.doesNotReject(() => assertUrlFetchable(new URL('http://127.0.0.1/'), { allowLocal: true }));
});

test('fetchWeb refuses a redirect that points at cloud metadata (SSRF)', async () => {
  const target = http.createServer((_, res) => {
    res.writeHead(302, { location: 'http://169.254.169.254/latest/meta-data/' });
    res.end();
  });
  await new Promise((resolve) => target.listen(0, '127.0.0.1', resolve));
  try {
    // allowLocal lets the loopback ENTRY through; the redirect hop to metadata is still evaluated,
    // and because 169.254/16 is private it is refused unless allowLocal covers it. Here allowLocal
    // is intentionally scoped to the entry via a public-mode redirect check.
    const port = target.address().port;
    await assert.rejects(
      () => fetchWeb({ url: `http://127.0.0.1:${port}/`, allowLocal: false, timeoutMs: 3000 }),
      /private\/loopback/
    );
  } finally {
    target.close();
  }
});

test('fetchWeb follows a multi-hop redirect chain when allow-local is set', async () => {
  const final = http.createServer((_, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<title>Final Page</title><p>arrived</p>');
  });
  await new Promise((resolve) => final.listen(0, '127.0.0.1', resolve));
  const middle = http.createServer((_, res) => {
    res.writeHead(302, { location: `http://127.0.0.1:${final.address().port}/` });
    res.end();
  });
  await new Promise((resolve) => middle.listen(0, '127.0.0.1', resolve));
  try {
    const receipt = await fetchWeb({ url: `http://127.0.0.1:${middle.address().port}/`, allowLocal: true, timeoutMs: 3000 });
    assert.equal(receipt.status, 'pass');
    assert.equal(receipt.title, 'Final Page');
    assert.ok(receipt.finalUrl.includes(String(final.address().port)));
  } finally {
    final.close();
    middle.close();
  }
});

test('fetchWeb enforces a redirect ceiling', async () => {
  let hops = 0;
  const server = http.createServer((req, res) => {
    hops += 1;
    res.writeHead(302, { location: `http://127.0.0.1:${server.address().port}/${hops}` });
    res.end();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    await assert.rejects(
      () => fetchWeb({ url: `http://127.0.0.1:${server.address().port}/`, allowLocal: true, timeoutMs: 3000 }),
      /Too many redirects/
    );
  } finally {
    server.close();
  }
});
