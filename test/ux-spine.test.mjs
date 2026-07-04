import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectUxSpine } from '../lib/ux-spine.mjs';

test('ux spine passes when design components are mapped to experience flows', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-ux-pass-'));
  await fs.writeFile(path.join(temp, 'DESIGN.md'), [
    '# DESIGN',
    '- Component: Evidence Panel',
    '- Component: Unknowns Panel'
  ].join('\n'));
  await fs.writeFile(path.join(temp, 'EXPERIENCE.md'), [
    '# EXPERIENCE',
    '- From: Evidence Panel | Trigger: review result | To: Unknowns Panel',
    '- From: Unknowns Panel | Trigger: next action | To: Evidence Panel'
  ].join('\n'));
  const result = await inspectUxSpine({ directory: temp });
  assert.equal(result.status, 'pass');
  assert.equal(result.unmapped.length, 0);
});

test('ux spine fails when a design component lacks an experience mapping', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-ux-fail-'));
  await fs.writeFile(path.join(temp, 'DESIGN.md'), '- Component: Payment Panel');
  await fs.writeFile(path.join(temp, 'EXPERIENCE.md'), '- From: Profile Panel | Trigger: open | To: Settings Panel');
  const result = await inspectUxSpine({ directory: temp });
  assert.equal(result.status, 'fail');
  assert.deepEqual(result.unmapped.map((component) => component.name), ['Payment Panel']);
});
