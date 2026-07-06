import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { extractText, fetchWeb } from '../lib/web-access.mjs';

test('extractText strips scripts, decodes entities, and collects links', () => {
  const html = `
    <html><head><title>Test &amp; Title</title><style>body{}</style></head>
    <body><script>var hidden = 1;</script>
    <h1>Hello&nbsp;World</h1><p>First paragraph.</p>
    <a href="https://example.com/docs">Docs &gt; Guide</a>
    </body></html>`;
  const result = extractText(html);
  assert.equal(result.title, 'Test & Title');
  assert.ok(result.text.includes('Hello World'));
  assert.ok(result.text.includes('First paragraph.'));
  assert.ok(!result.text.includes('hidden'));
  assert.equal(result.links[0].href, 'https://example.com/docs');
  assert.equal(result.links[0].text, 'Docs > Guide');
});

test('fetchWeb refuses private hosts and bad protocols', async () => {
  await assert.rejects(() => fetchWeb({ url: 'http://localhost:8080/x' }), /private\/loopback/);
  await assert.rejects(() => fetchWeb({ url: 'http://192.168.1.10/x' }), /private\/loopback/);
  await assert.rejects(() => fetchWeb({ url: 'http://172.20.0.1/x' }), /private\/loopback/);
  await assert.rejects(() => fetchWeb({ url: 'ftp://example.com/x' }), /http and https/);
  await assert.rejects(() => fetchWeb({ url: 'not-a-url' }), /Invalid URL/);
});

test('fetchWeb retrieves, truncates, and writes an evidence receipt', async () => {
  const server = http.createServer((request, response) => {
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end(`<html><head><title>Local Fixture</title></head><body><p>${'midas '.repeat(50)}</p></body></html>`);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-web-'));
  try {
    const receipt = await fetchWeb({
      url: `http://127.0.0.1:${port}/page`,
      directory: temp,
      allowLocal: true,
      save: true
    });
    assert.equal(receipt.status, 'pass');
    assert.equal(receipt.httpStatus, 200);
    assert.equal(receipt.title, 'Local Fixture');
    assert.ok(receipt.text.includes('midas'));
    assert.ok(receipt.sha256.length === 64);
    assert.ok(receipt.evidenceFile.startsWith('.midas/reports/web/'));
    const saved = JSON.parse(await fs.readFile(path.join(temp, receipt.evidenceFile), 'utf8'));
    assert.equal(saved.url, receipt.url);
  } finally {
    server.close();
  }
});
