import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { verifyCompletionGap } from '../lib/verification-gap.mjs';

async function fixture(name, files) {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), `midas-gap-${name}-`));
  for (const [relative, contents] of Object.entries(files)) {
    const target = path.join(temp, relative);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, contents);
  }
  return temp;
}

const SPEC = [
  '# PRD',
  '',
  '- [ ] REQ-001: The system must reconcile the carrier file against the payroll extract and flag mismatches.'
].join('\n');

const IMPLEMENTATION = [
  'export function reconcileCarrierPayroll(carrier, payroll) {',
  '  const mismatches = [];',
  '  for (const member of carrier) {',
  '    const match = payroll.find((row) => row.id === member.id);',
  '    if (!match || match.premium !== member.premium) mismatches.push(member.id);',
  '  }',
  '  return { mismatches, flagged: mismatches.length };',
  '}'
].join('\n');

const REAL_TEST = [
  "import assert from 'node:assert/strict';",
  "import test from 'node:test';",
  "import { reconcileCarrierPayroll } from '../src/reconcile.mjs';",
  '',
  "test('reconcile carrier file against payroll extract and flag mismatches', () => {",
  '  const out = reconcileCarrierPayroll([{ id: 1, premium: 10 }], [{ id: 1, premium: 12 }]);',
  '  assert.deepEqual(out.mismatches, [1]);',
  '});'
].join('\n');

// The defect this suite exists for, reproduced 2026-09-10 and now pinned:
//
//   A spec with two requirements, plus a NOTES.md restating them in prose and stating in capitals
//   that nothing was implemented, returned status `pass` with every requirement `traced`. Tracing
//   pooled token matches from EVERY file including markdown, so prose supplied the vocabulary and
//   cleared the threshold while no code existed. That is a receipt terminating in another document
//   that also just says so, inside the one feature this framework exists for.
//
// Prose is now context and never evidence, source and test matches are counted separately, and a
// requirement only passes when an implementation AND a test carry its vocabulary.
test('prose restating a requirement is never evidence that it was built', async () => {
  const temp = await fixture('prose', {
    'PRD.md': SPEC,
    'NOTES.md': [
      '# Notes from the planning call',
      '',
      'We agreed the system must reconcile the carrier file against the payroll extract and flag',
      'mismatches.',
      '',
      'NOTHING IS IMPLEMENTED YET. NO CODE HAS BEEN WRITTEN.'
    ].join('\n')
  });
  const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
  assert.equal(result.status, 'fail');
  assert.equal(result.requirements[0].status, 'gap');
  assert.deepEqual(result.requirements[0].files, [], 'prose must not be cited as source evidence');
  assert.ok(
    result.requirements[0].contextFiles.includes('NOTES.md'),
    'the prose file should still be reported, as context rather than as evidence'
  );
});

test('an implementation with no test does not pass', async () => {
  const temp = await fixture('untested', {
    'PRD.md': SPEC,
    'src/reconcile.mjs': IMPLEMENTATION
  });
  const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
  assert.equal(result.status, 'fail');
  assert.equal(result.requirements[0].status, 'implemented-untested');
  assert.deepEqual(result.requirements[0].files, ['src/reconcile.mjs']);
  assert.deepEqual(result.requirements[0].testFiles, []);
});

test('an implementation with a matching test passes and names both artifacts', async () => {
  const temp = await fixture('pass', {
    'PRD.md': SPEC,
    'src/reconcile.mjs': IMPLEMENTATION,
    'test/reconcile.test.mjs': REAL_TEST
  });
  const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
  assert.equal(result.status, 'pass');
  assert.equal(result.gaps.length, 0);
  assert.equal(result.requirements[0].status, 'traced');
  assert.deepEqual(result.requirements[0].files, ['src/reconcile.mjs']);
  assert.deepEqual(result.requirements[0].testFiles, ['test/reconcile.test.mjs']);
  const receipt = await fs.readFile(path.join(temp, result.receipt), 'utf8');
  assert.match(receipt, /src\/reconcile\.mjs/);
  assert.match(receipt, /test\/reconcile\.test\.mjs/);
});

// INVERTED, not deleted. This fixture used to be the suite's passing case: a source file whose only
// content is string literals restating the requirement, with no test anywhere. It pinned the very
// behaviour that made the gate meaningless, so it now pins the corrected verdict instead.
test('string literals restating a requirement, with no test, no longer pass', async () => {
  const temp = await fixture('literals', {
    'PRD.md': [
      '# PRD',
      '',
      '- [ ] REQ-001: Render evidence panel for verification receipts',
      '- [ ] REQ-002: Preserve unknown provider state labels'
    ].join('\n'),
    'src/app.ts': [
      'export const EvidencePanel = "verification receipts evidence panel";',
      'export const providerState = "unknown provider state labels";'
    ].join('\n')
  });
  const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
  assert.equal(result.status, 'fail');
  assert.deepEqual(
    result.requirements.map((requirement) => requirement.status),
    ['implemented-untested', 'implemented-untested'],
    'source matched, so this is not a gap; it is untested, and untested does not pass'
  );
});

test('verification-gap fails when requirements are omitted entirely', async () => {
  const temp = await fixture('omitted', {
    'PRD.md': '- [ ] REQ-001: Add billing entitlement workflow',
    'src/app.ts': 'export const profile = "user profile";'
  });
  const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
  assert.equal(result.status, 'fail');
  assert.deepEqual(result.gaps.map((gap) => gap.id), ['REQ-001']);
});

test('a test alone, with nothing implemented, does not pass', async () => {
  const temp = await fixture('testonly', {
    'PRD.md': SPEC,
    'test/reconcile.test.mjs': REAL_TEST
  });
  const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
  assert.equal(result.status, 'fail');
  assert.equal(result.requirements[0].status, 'gap');
});
