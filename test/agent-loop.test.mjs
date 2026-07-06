import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { agentToolDefinitions, executeAgentTool, runAgentLoop } from '../lib/agent-loop.mjs';

test('agent tool surface gates writes and web behind flags', () => {
  const readOnly = agentToolDefinitions({ allowWrites: false, allowWeb: false }).map((tool) => tool.name);
  assert.ok(!readOnly.includes('write_file'));
  assert.ok(!readOnly.includes('web_fetch'));
  const full = agentToolDefinitions({ allowWrites: true, allowWeb: true }).map((tool) => tool.name);
  assert.ok(full.includes('write_file'));
  assert.ok(full.includes('web_fetch'));
});

test('agent tools refuse env files, escapes, and ungated writes', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-agent-guard-'));
  const context = { directory: temp, allowWrites: false, allowWeb: false };
  await assert.rejects(() => executeAgentTool('read_file', { path: '.env' }, context), /protected path/);
  await assert.rejects(() => executeAgentTool('read_file', { path: 'config/credentials.json' }, context), /protected path/);
  await assert.rejects(() => executeAgentTool('read_file', { path: '../outside.txt' }, context), /inside the target directory/);
  await assert.rejects(() => executeAgentTool('write_file', { path: 'a.txt', content: 'x' }, context), /--allow-writes/);
  await assert.rejects(() => executeAgentTool('web_fetch', { url: 'https://example.com' }, context), /--allow-web/);
});

test('agent script provider executes a bounded run with evidence records', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-agent-run-'));
  await fs.writeFile(path.join(temp, 'notes.md'), 'The system uses work orders.');
  const scriptPath = path.join(temp, 'actions.jsonl');
  const actions = [
    { tool: 'list_files', input: {} },
    { tool: 'read_file', input: { path: 'notes.md' } },
    { tool: 'memory_add', input: { name: 'run-note', description: 'Learned from notes.md', body: 'work orders drive execution' } },
    { tool: 'finish', input: { summary: 'Reviewed notes and stored a memory.', evidence: 'read notes.md', nextAction: 'none' } }
  ];
  await fs.writeFile(scriptPath, actions.map((action) => JSON.stringify(action)).join('\n'));

  const run = await runAgentLoop({
    directory: temp,
    objective: 'Review the notes file and record a memory',
    provider: 'script',
    script: scriptPath
  });
  assert.equal(run.outcome.status, 'finished');
  assert.ok(run.outcome.summary.includes('Reviewed notes'));

  const events = (await fs.readFile(path.join(temp, run.runDir, 'events.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(events[0].type, 'run-started');
  assert.equal(events.at(-1).type, 'run-ended');
  assert.ok(events.some((event) => event.type === 'tool-call' && event.tool === 'memory_add'));

  const runRecord = JSON.parse(await fs.readFile(path.join(temp, run.runDir, 'run.json'), 'utf8'));
  assert.equal(runRecord.provider, 'script');
  assert.equal(runRecord.allowWrites, false);
});

test('agent manual provider records a run without calling any model', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-agent-manual-'));
  const run = await runAgentLoop({ directory: temp, objective: 'Inspect repo', provider: 'manual' });
  assert.equal(run.outcome.status, 'manual');
  assert.ok(run.outcome.tools.includes('finish'));
});

test('agent rejects unknown providers and missing objectives', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-agent-bad-'));
  await assert.rejects(() => runAgentLoop({ directory: temp, objective: 'x', provider: 'skynet' }), /Unknown provider/);
  await assert.rejects(() => runAgentLoop({ directory: temp, objective: '', provider: 'manual' }), /objective/);
});
