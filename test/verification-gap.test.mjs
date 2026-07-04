import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { verifyCompletionGap } from '../lib/verification-gap.mjs';

test('verification-gap passes when requirements trace to implementation evidence', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-gap-pass-'));
  await fs.mkdir(path.join(temp, 'src'), { recursive: true });
  await fs.writeFile(path.join(temp, 'PRD.md'), [
    '# PRD',
    '',
    '- [ ] REQ-001: Render evidence panel for verification receipts',
    '- [ ] REQ-002: Preserve unknown provider state labels'
  ].join('\n'));
  await fs.writeFile(path.join(temp, 'src', 'app.ts'), [
    'export const EvidencePanel = "verification receipts evidence panel";',
    'export const providerState = "unknown provider state labels";'
  ].join('\n'));
  const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
  assert.equal(result.status, 'pass');
  assert.equal(result.gaps.length, 0);
  assert.equal(await fs.stat(path.join(temp, result.receipt)).then(() => true), true);
});

test('verification-gap fails when requirements are omitted', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-gap-fail-'));
  await fs.mkdir(path.join(temp, 'src'), { recursive: true });
  await fs.writeFile(path.join(temp, 'PRD.md'), '- [ ] REQ-001: Add billing entitlement workflow');
  await fs.writeFile(path.join(temp, 'src', 'app.ts'), 'export const profile = "user profile";');
  const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
  assert.equal(result.status, 'fail');
  assert.deepEqual(result.gaps.map((gap) => gap.id), ['REQ-001']);
});
