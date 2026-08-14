import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import {
  AUTORUN_STATES,
  advanceAutorun,
  haltAutorun,
  initAutorun,
  pollAutorun,
  readAutorun,
  resumeAutorun
} from '../lib/autorun.mjs';

const execFileAsync = promisify(execFile);
const cli = path.resolve('bin/midas.mjs');

async function makeWorkOrder(content = '# MIDAS Quick Work Order\n\n## Objective\n\nShip one slice.\n') {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-autorun-'));
  const file = path.join(temp, 'wo-demo.md');
  await fs.writeFile(file, content);
  return file;
}

test('state order is the documented five-state machine', () => {
  assert.deepEqual(AUTORUN_STATES, ['clarify', 'spec', 'implement', 'review', 'finalize']);
});

test('init sets clarify, preserves body, and read reports active', async () => {
  const file = await makeWorkOrder();
  const result = await initAutorun({ file });
  assert.equal(result.state, 'clarify');
  assert.equal(result.status, 'active');
  const text = await fs.readFile(file, 'utf8');
  assert.match(text, /^---\n/);
  assert.match(text, /autorun: midas\.autorun\.v1/);
  assert.match(text, /Ship one slice\./);
});

test('init refuses a second initialization', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  await assert.rejects(() => initAutorun({ file }), /already initialized/);
});

test('read on an uninitialized work order reports uninitialized', async () => {
  const file = await makeWorkOrder();
  const result = await readAutorun(file);
  assert.equal(result.status, 'uninitialized');
  assert.equal(result.state, null);
});

test('full legal path clarify->spec->implement->review->finalize', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  assert.equal((await advanceAutorun({ file, to: 'spec' })).state, 'spec');
  assert.equal((await advanceAutorun({ file, to: 'implement' })).state, 'implement');
  assert.equal((await advanceAutorun({ file, to: 'review' })).state, 'review');
  const done = await advanceAutorun({ file, to: 'finalize' });
  assert.equal(done.state, 'finalize');
  assert.equal(done.status, 'complete');
  assert.equal(done.history.length, 5); // init + 4 transitions
});

test('skips are illegal: clarify->review, spec->review skip, spec->finalize', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  await assert.rejects(() => advanceAutorun({ file, to: 'review' }), /Illegal transition/);
  await assert.rejects(() => advanceAutorun({ file, to: 'finalize' }), /Illegal transition/);
  await advanceAutorun({ file, to: 'spec' });
  await assert.rejects(() => advanceAutorun({ file, to: 'finalize' }), /Illegal transition/);
});

test('review is never skipped: implement->finalize is illegal even with fastPath', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  await advanceAutorun({ file, to: 'implement', fastPath: true });
  await assert.rejects(
    () => advanceAutorun({ file, to: 'finalize', fastPath: true }),
    /Illegal transition/
  );
});

test('fast-path clarify->implement requires the fastPath flag and records it', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  await assert.rejects(() => advanceAutorun({ file, to: 'implement' }), /fast-path/);
  const result = await advanceAutorun({ file, to: 'implement', fastPath: true });
  assert.equal(result.state, 'implement');
  assert.equal(result.fastPath, true);
  const text = await fs.readFile(file, 'utf8');
  assert.match(text, /fastPath: true/);
});

test('review->implement rework requires a reason', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  await advanceAutorun({ file, to: 'implement', fastPath: true });
  await advanceAutorun({ file, to: 'review' });
  await assert.rejects(() => advanceAutorun({ file, to: 'implement' }), /requires a reason/);
  const result = await advanceAutorun({ file, to: 'implement', reason: 'missing tests' });
  assert.equal(result.state, 'implement');
});

test('backward transitions other than review rework are illegal', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  await advanceAutorun({ file, to: 'spec' });
  await assert.rejects(() => advanceAutorun({ file, to: 'clarify' }), /Illegal transition/);
});

test('halt requires a reason and is legal from any non-terminal state', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  await assert.rejects(() => haltAutorun({ file }), /requires a reason/);
  const halted = await haltAutorun({ file, reason: 'blocked on founder decision' });
  assert.equal(halted.status, 'halted');
  assert.equal(halted.state, 'HALTED');
  assert.equal(halted.haltReason, 'blocked on founder decision');
  assert.equal(halted.haltedFrom, 'clarify');
});

test('a halted run cannot advance or double-halt; resume returns to haltedFrom', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  await advanceAutorun({ file, to: 'spec' });
  await haltAutorun({ file, reason: 'dependency down' });
  await assert.rejects(() => advanceAutorun({ file, to: 'implement' }), /HALTED/);
  await assert.rejects(() => haltAutorun({ file, reason: 'again' }), /already HALTED/);
  const resumed = await resumeAutorun({ file, reason: 'dependency restored' });
  assert.equal(resumed.state, 'spec');
  assert.equal(resumed.haltReason, null);
  assert.equal(resumed.haltedFrom, null);
});

test('finalize is terminal: no advance, no halt', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  await advanceAutorun({ file, to: 'implement', fastPath: true });
  await advanceAutorun({ file, to: 'review' });
  await advanceAutorun({ file, to: 'finalize' });
  await assert.rejects(() => advanceAutorun({ file, to: 'review' }), /terminal/);
  await assert.rejects(() => haltAutorun({ file, reason: 'nope' }), /terminal/);
});

test('foreign frontmatter keys are preserved across transitions', async () => {
  const file = await makeWorkOrder('---\nowner: kai\npriority: p1\n---\n# WO\n\nBody text.\n');
  await initAutorun({ file });
  await advanceAutorun({ file, to: 'spec' });
  const text = await fs.readFile(file, 'utf8');
  assert.match(text, /owner: kai/);
  assert.match(text, /priority: p1/);
  assert.match(text, /Body text\./);
});

test('poll returns the next-action contract shape for active states', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  const poll = await pollAutorun({ file });
  assert.equal(poll.schema, 'midas.autorun.v1');
  assert.equal(poll.status, 'active');
  assert.equal(poll.state, 'clarify');
  assert.equal(poll.nextAction.action, 'clarify-requirements');
  assert.deepEqual(poll.nextAction.allowedTransitions, ['spec', 'implement']);
  assert.equal(poll.nextAction.haltAllowed, true);
  assert.equal(poll.nextAction.terminal, false);
});

test('poll surfaces halt, complete, and uninitialized contracts', async () => {
  const file = await makeWorkOrder();
  const before = await pollAutorun({ file });
  assert.equal(before.status, 'uninitialized');
  assert.equal(before.nextAction.action, 'initialize-autorun');

  await initAutorun({ file });
  await haltAutorun({ file, reason: 'awaiting review capacity' });
  const halted = await pollAutorun({ file });
  assert.equal(halted.nextAction.action, 'resolve-halt');
  assert.deepEqual(halted.nextAction.allowedTransitions, ['clarify']);

  await resumeAutorun({ file });
  await advanceAutorun({ file, to: 'implement', fastPath: true });
  await advanceAutorun({ file, to: 'review' });
  await advanceAutorun({ file, to: 'finalize' });
  const complete = await pollAutorun({ file });
  assert.equal(complete.status, 'complete');
  assert.equal(complete.nextAction.action, 'none');
  assert.equal(complete.nextAction.terminal, true);
});

test('cli: midas next <workorder> prints the poll surface as JSON', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  const { stdout } = await execFileAsync(process.execPath, [cli, 'next', file]);
  const result = JSON.parse(stdout.trim());
  assert.equal(result.schema, 'midas.autorun.v1');
  assert.equal(result.state, 'clarify');
  assert.equal(result.nextAction.action, 'clarify-requirements');
});

test('cli: midas next without a work order falls through to workspace recommendation', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-next-plain-'));
  const { stdout } = await execFileAsync(process.execPath, [cli, 'next', '--directory', temp]);
  const result = JSON.parse(stdout.trim());
  assert.equal(result.status, 'missing_workspace');
});

test('cli: midas next on a halted work order exits 2', async () => {
  const file = await makeWorkOrder();
  await initAutorun({ file });
  await haltAutorun({ file, reason: 'halt for orchestrator visibility' });
  await assert.rejects(
    () => execFileAsync(process.execPath, [cli, 'next', file]),
    (error) => {
      assert.equal(error.code, 2);
      const result = JSON.parse(error.stdout.trim());
      assert.equal(result.status, 'halted');
      assert.equal(result.haltReason, 'halt for orchestrator visibility');
      return true;
    }
  );
});
