import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { addMemory, inspectMemoryLinks, listMemories, searchMemories, showMemory } from '../lib/memory-vault.mjs';

test('memory vault add, list, show, and index roundtrip', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-memory-'));
  const saved = await addMemory({
    directory: temp,
    name: 'Auth Flow',
    description: 'How authentication works in this project',
    type: 'project',
    body: 'JWT verification happens in middleware. Related: [[deploy-notes]].',
    tags: 'auth, security'
  });
  assert.equal(saved.status, 'saved');
  assert.equal(saved.name, 'auth-flow');

  const index = await fs.readFile(path.join(temp, '.midas', 'memory', 'MEMORY.md'), 'utf8');
  assert.ok(index.includes('[auth-flow]'));

  const listed = await listMemories({ directory: temp });
  assert.equal(listed.entryCount, 1);

  const shown = await showMemory({ directory: temp, name: 'auth-flow' });
  assert.equal(shown.status, 'pass');
  assert.ok(shown.entry.body.includes('JWT'));
  assert.deepEqual(shown.entry.links, ['deploy-notes']);
});

test('memory search ranks name and tag matches above body matches', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-memory-search-'));
  await addMemory({ directory: temp, name: 'payment-gateway', description: 'Stripe payment gateway wiring', body: 'checkout sessions', tags: 'payments' });
  await addMemory({ directory: temp, name: 'logging-notes', description: 'Structured logging conventions', body: 'payment logs are redacted', tags: '' });

  const result = await searchMemories({ directory: temp, query: 'payment' });
  assert.equal(result.matchCount, 2);
  assert.equal(result.matches[0].name, 'payment-gateway');
});

test('memory links report dangling targets without failing', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-memory-links-'));
  await addMemory({ directory: temp, name: 'alpha', description: 'First entry', body: 'See [[beta]] and [[missing-entry]].' });
  await addMemory({ directory: temp, name: 'beta', description: 'Second entry', body: 'Linked back to [[alpha]].' });

  const graph = await inspectMemoryLinks({ directory: temp });
  assert.equal(graph.status, 'pass');
  assert.equal(graph.edgeCount, 3);
  assert.equal(graph.danglingCount, 1);
  assert.equal(graph.dangling[0].to, 'missing-entry');
});

test('memory add rejects missing description and bad type', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-memory-guard-'));
  await assert.rejects(() => addMemory({ directory: temp, description: '' }), /description/);
  await assert.rejects(() => addMemory({ directory: temp, description: 'x', type: 'weird' }), /type/);
});

test('memory sanitizes newlines to prevent frontmatter injection', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-memory-inject-'));
  const saved = await addMemory({
    directory: temp,
    name: 'inject',
    description: 'legit\ntype: user\nname: hijacked',
    type: 'project',
    body: 'ok',
    tags: 'a\nb, c'
  });
  const raw = await fs.readFile(path.join(temp, '.midas', 'memory', 'entries', `${saved.name}.md`), 'utf8');
  const frontmatterLines = raw.split('\n').slice(1, raw.split('\n').indexOf('---', 1));
  // Exactly one of each meta key — no injected duplicates.
  assert.equal(frontmatterLines.filter((l) => l.startsWith('type:')).length, 1);
  assert.equal(frontmatterLines.filter((l) => l.startsWith('name:')).length, 1);
  const shown = await showMemory({ directory: temp, name: saved.name });
  assert.equal(shown.entry.type, 'project');
  assert.ok(!shown.entry.description.includes('\n'));
});

test('memory body may safely contain a triple-dash line', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-memory-dash-'));
  const saved = await addMemory({ directory: temp, name: 'dash', description: 'has a rule line', body: 'above\n---\nbelow' });
  const shown = await showMemory({ directory: temp, name: saved.name });
  assert.ok(shown.entry.body.includes('above'));
  assert.ok(shown.entry.body.includes('below'));
});
