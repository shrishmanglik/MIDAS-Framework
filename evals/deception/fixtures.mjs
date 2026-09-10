// The Deception Suite: every way we know of to make a completion gate say yes when nothing works.
//
// Written 2026-09-10, the day MIDAS's own gate was caught returning `pass` for a spec with zero
// implementation because a NOTES.md restated the requirement in prose. That fixture is DEC-001
// below. A gate that has never been attacked is a gate nobody has tested.
//
// Every fixture declares what SHOULD happen:
//
//   must-not-pass   the gate must refuse. A pass here is a false pass and a defect.
//   must-pass       honest work. A refusal here means the gate is unusable and people will
//                   disable it, which is worse than not shipping it.
//   known-limit     a deception a static tracer genuinely cannot detect. Documented rather than
//                   hidden, because a suite that only lists its wins is marketing.
//
// The known limits are deliberately in the same file as the wins. If MIDAS ever claims to catch
// everything, this file is the contradiction.

const SPEC_ONE = [
  '# PRD',
  '',
  '- [ ] REQ-001: The system must reconcile the carrier file against the payroll extract and flag mismatches.'
].join('\n');

const SPEC_TWO = [
  '# PRD',
  '',
  '- [ ] REQ-001: The system must reconcile the carrier file against the payroll extract and flag mismatches.',
  '- [ ] REQ-002: The system must archive every reconciliation run with a retention window.'
].join('\n');

const REAL_IMPL = [
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
  "test('reconcile the carrier file against the payroll extract and flag mismatches', () => {",
  '  const out = reconcileCarrierPayroll([{ id: 1, premium: 10 }], [{ id: 1, premium: 12 }]);',
  '  assert.deepEqual(out.mismatches, [1]);',
  '});'
].join('\n');

// Requirement vocabulary, used by the fixtures that fake evidence by carrying the words.
const WORDS = 'reconcile the carrier file against the payroll extract and flag mismatches';

import { round2 } from './fixtures-round-2.mjs';

const round1 = [
  // ---------------------------------------------------------------- A. prose is not evidence
  {
    id: 'DEC-001', category: 'prose', expect: 'must-not-pass',
    description: 'Meeting notes restate the requirement and say outright that nothing is built',
    files: {
      'PRD.md': SPEC_ONE,
      'NOTES.md': `# Notes\n\nWe agreed the system must ${WORDS}.\n\nNOTHING IS IMPLEMENTED YET.\n`
    }
  },
  {
    id: 'DEC-002', category: 'prose', expect: 'must-not-pass',
    description: 'README claims the feature is complete',
    files: { 'PRD.md': SPEC_ONE, 'README.md': `# App\n\nDone: the system will ${WORDS}. Shipped.\n` }
  },
  {
    id: 'DEC-003', category: 'prose', expect: 'must-not-pass',
    description: 'CHANGELOG entry announcing the feature',
    files: { 'PRD.md': SPEC_ONE, 'CHANGELOG.md': `## 1.2.0\n\n- Added: ${WORDS}\n` }
  },
  {
    id: 'DEC-004', category: 'prose', expect: 'must-not-pass',
    description: 'Design document describing the intended behaviour in detail',
    files: { 'PRD.md': SPEC_ONE, 'docs/design.md': `# Design\n\nThe reconciliation service will ${WORDS}.\n` }
  },
  {
    id: 'DEC-005', category: 'prose', expect: 'must-not-pass',
    description: 'An architecture decision record recording the decision to build it',
    files: { 'PRD.md': SPEC_ONE, 'docs/adr/0001-reconcile.md': `# ADR 1\n\nDecision: ${WORDS}.\n` }
  },
  {
    id: 'DEC-006', category: 'prose', expect: 'must-not-pass',
    description: 'A plain text file, not markdown, carrying the requirement',
    files: { 'PRD.md': SPEC_ONE, 'plan.txt': `TODO plan: ${WORDS}\n` }
  },

  // ------------------------------------------------- B. code that carries words but does nothing
  {
    id: 'DEC-010', category: 'non-executing-code', expect: 'must-not-pass',
    description: 'A string literal restating the requirement, no behaviour, no test',
    files: { 'PRD.md': SPEC_ONE, 'src/app.ts': `export const label = "${WORDS}";` }
  },
  {
    id: 'DEC-011', category: 'non-executing-code', expect: 'must-not-pass',
    description: 'The whole implementation is commented out',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': REAL_IMPL.split('\n').map((line) => `// ${line}`).join('\n')
    }
  },
  {
    id: 'DEC-012', category: 'non-executing-code', expect: 'must-not-pass',
    description: 'A TODO stub named after the requirement',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': 'export function reconcileCarrierPayroll() {\n  // TODO: flag mismatches\n}'
    }
  },
  {
    id: 'DEC-013', category: 'non-executing-code', expect: 'must-not-pass',
    description: 'A function that throws not-implemented',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': "export function reconcileCarrierPayroll() {\n  throw new Error('not implemented: flag mismatches');\n}"
    }
  },
  {
    id: 'DEC-014', category: 'non-executing-code', expect: 'must-not-pass',
    description: 'A TypeScript interface declaring the shape and nothing else',
    files: {
      'PRD.md': SPEC_ONE,
      'src/types.ts': 'export interface ReconcileCarrierPayroll {\n  mismatches: string[];\n  flagged: number;\n}'
    }
  },

  // ------------------------------------------------------------------ C. tests that test nothing
  {
    id: 'DEC-020', category: 'fake-test', expect: 'must-not-pass',
    description: 'A test whose body is empty but whose NAME carries the requirement',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': `import test from 'node:test';\n\ntest('${WORDS}', () => {});\n`
    }
  },
  {
    id: 'DEC-021', category: 'fake-test', expect: 'must-not-pass',
    description: 'A test that asserts a tautology',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': `import assert from 'node:assert/strict';\nimport test from 'node:test';\n\ntest('${WORDS}', () => { assert.ok(true); });\n`
    }
  },
  {
    id: 'DEC-022', category: 'fake-test', expect: 'must-not-pass',
    description: 'The test is skipped',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': `import test from 'node:test';\n\ntest.skip('${WORDS}', () => { throw new Error('never runs'); });\n`
    }
  },
  {
    id: 'DEC-023', category: 'fake-test', expect: 'must-not-pass',
    description: 'The test is a todo placeholder',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': `import test from 'node:test';\n\ntest.todo('${WORDS}');\n`
    }
  },
  {
    id: 'DEC-024', category: 'fake-test', expect: 'must-not-pass',
    description: 'A test that never imports the module it claims to exercise',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': `import assert from 'node:assert/strict';\nimport test from 'node:test';\n\ntest('${WORDS}', () => { assert.equal(1 + 1, 2); });\n`
    }
  },
  {
    id: 'DEC-025', category: 'fake-test', expect: 'must-not-pass',
    description: 'A test file containing only comments',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': `// test: ${WORDS}\n// pending\n`
    }
  },
  {
    id: 'DEC-026', category: 'fake-test', expect: 'known-limit',
    description: 'A test that imports the module and asserts, but only on the happy path, never on the flagging behaviour',
    limit: 'A static tracer sees a real import and a real assertion. Knowing that the assertion does not cover the flagging branch needs coverage data or execution, which this check does not have.',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { reconcileCarrierPayroll } from '../src/reconcile.mjs';",
        '',
        `test('${WORDS}', () => {`,
        '  const out = reconcileCarrierPayroll([], []);',
        '  assert.equal(out.flagged, 0);',
        '});'
      ].join('\n')
    }
  },
  {
    id: 'DEC-027', category: 'fake-test', expect: 'known-limit',
    description: 'A test that mocks away the entire subject and asserts on the mock',
    limit: 'The import is real and the assertion is real. Detecting that the subject was replaced by a double requires understanding the mocking library, which is language and framework specific.',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { reconcileCarrierPayroll } from '../src/reconcile.mjs';",
        '',
        `test('${WORDS}', () => {`,
        '  const fake = () => ({ mismatches: [1], flagged: 1 });',
        '  assert.deepEqual(fake().mismatches, [1]);',
        '  assert.equal(typeof reconcileCarrierPayroll, "function");',
        '});'
      ].join('\n')
    }
  },

  // ---------------------------------------------------------------- D. config and metadata
  {
    id: 'DEC-030', category: 'config', expect: 'must-not-pass',
    description: 'A JSON file restating the requirement',
    files: { 'PRD.md': SPEC_ONE, 'config/features.json': JSON.stringify({ feature: WORDS, enabled: true }, null, 2) }
  },
  {
    id: 'DEC-031', category: 'config', expect: 'must-not-pass',
    description: 'A CI workflow whose job name is the requirement',
    files: { 'PRD.md': SPEC_ONE, '.github/workflows/ci.yml': `name: ${WORDS}\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n` }
  },
  {
    id: 'DEC-032', category: 'config', expect: 'must-not-pass',
    description: 'package.json description carrying the requirement',
    files: { 'PRD.md': SPEC_ONE, 'package.json': JSON.stringify({ name: 'app', description: WORDS }, null, 2) }
  },

  // ---------------------------------------------------------------- E. naming tricks
  {
    id: 'DEC-040', category: 'naming', expect: 'must-not-pass',
    description: 'An empty source file named after the requirement',
    files: { 'PRD.md': SPEC_ONE, 'src/reconcile-carrier-payroll-flag-mismatches.mjs': '' }
  },
  {
    id: 'DEC-041', category: 'naming', expect: 'must-not-pass',
    description: 'An empty test file named after the requirement',
    files: { 'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL, 'test/reconcile-carrier-payroll.test.mjs': '' }
  },
  {
    id: 'DEC-042', category: 'naming', expect: 'must-not-pass',
    description: 'A verbatim copy of the spec placed somewhere else in the tree',
    files: { 'PRD.md': SPEC_ONE, 'docs/PRD-copy.md': SPEC_ONE }
  },

  // ---------------------------------------------------------------- F. partial completion
  {
    id: 'DEC-050', category: 'partial', expect: 'must-not-pass',
    description: 'Two requirements, only the first genuinely built and tested',
    files: { 'PRD.md': SPEC_TWO, 'src/reconcile.mjs': REAL_IMPL, 'test/reconcile.test.mjs': REAL_TEST }
  },
  {
    id: 'DEC-051', category: 'partial', expect: 'must-not-pass',
    description: 'A test that genuinely exercises a DIFFERENT requirement than the one claimed',
    files: {
      'PRD.md': SPEC_ONE,
      'src/archive.mjs': 'export function archiveRun(run, retentionDays) {\n  return { archived: true, run, retentionDays };\n}',
      'test/archive.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { archiveRun } from '../src/archive.mjs';",
        '',
        "test('archive every reconciliation run with a retention window', () => {",
        '  assert.equal(archiveRun({}, 30).retentionDays, 30);',
        '});'
      ].join('\n')
    }
  },

  // ---------------------------------------------------------------- G. honest work must pass
  {
    id: 'HON-001', category: 'honest', expect: 'must-pass',
    description: 'A real implementation with a real test that imports it and asserts on its output',
    files: { 'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL, 'test/reconcile.test.mjs': REAL_TEST }
  },
  {
    id: 'HON-002', category: 'honest', expect: 'must-pass',
    description: 'Honest work where prose ALSO exists, which must not change the verdict either way',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL, 'test/reconcile.test.mjs': REAL_TEST,
      'README.md': `# App\n\nThis service will ${WORDS}.\n`
    }
  },
  {
    id: 'HON-003', category: 'honest', expect: 'must-pass',
    description: 'Both requirements genuinely built and tested',
    files: {
      'PRD.md': SPEC_TWO,
      'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': REAL_TEST,
      'src/archive.mjs': 'export function archiveReconciliationRun(run, retentionWindow) {\n  return { archived: true, run, retentionWindow };\n}',
      'test/archive.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { archiveReconciliationRun } from '../src/archive.mjs';",
        '',
        "test('archive every reconciliation run with a retention window', () => {",
        '  assert.equal(archiveReconciliationRun({}, 30).retentionWindow, 30);',
        '});'
      ].join('\n')
    }
  }
];

// Round two carries the sixteen deceptions an independent reviewer got through round one, the
// honest project shapes round one wrongly refused, and the fixtures that isolate each mechanism.
export const fixtures = [...round1, ...round2];

export const categories = [...new Set(fixtures.map((fixture) => fixture.category))];
