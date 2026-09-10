// Round two of the Deception Suite: the sixteen deceptions an independent reviewer got through the
// first fix, the honest project shapes the first fix wrongly refused, and the fixtures that isolate
// each protective mechanism.
//
// The reviewer's sharpest finding was not any single hole. It was that `npm run selftest:adversarial`
// stayed green when three of the four mechanisms it defends were reverted, including the prose rule
// that the whole suite was written for. The DEC-0xx fixtures were all refused by the TEST
// requirement, so removing the prose rule changed nothing they measured. That is the house defect,
// inside the artifact built to name it: the passing check was adjacent to the question that mattered.
//
// The ISO-xxx fixtures below exist only to fix that. Each one is constructed so exactly one
// mechanism stands between it and a pass, which means disabling that mechanism turns the suite red.

const REQ = 'The system must reconcile the carrier file against the payroll extract and flag mismatches.';
const SPEC_ONE = `# PRD\n\n- [ ] REQ-001: ${REQ}\n`;
const WORDS = 'reconcile the carrier file against the payroll extract and flag mismatches';

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
  `test('${WORDS}', () => {`,
  '  const out = reconcileCarrierPayroll([{ id: 1, premium: 10 }], [{ id: 1, premium: 12 }]);',
  '  assert.deepEqual(out.mismatches, [1]);',
  '});'
].join('\n');

// A test that calls a symbol declared by the fixture's deceptive "implementation". Used by the
// isolation fixtures so the ONLY thing standing between the fixture and a pass is the mechanism
// under test.
const TEST_CALLING = (symbol) => [
  "import assert from 'node:assert/strict';",
  "import test from 'node:test';",
  `import { ${symbol} } from '../src/reconcile.mjs';`,
  '',
  `test('${WORDS}', () => {`,
  `  assert.ok(${symbol}([{ id: 1, premium: 10 }], []));`,
  '});'
].join('\n');

export const round2 = [
  // ============================================================ class A: mention is not use
  {
    id: 'DEC-060', category: 'fake-test', expect: 'must-not-pass',
    description: 'A test imports the symbol but never calls or asserts on it, while a string literal is the whole implementation',
    files: {
      'PRD.md': SPEC_ONE,
      'src/app.mjs': `export const label = "${WORDS}";`,
      'test/app.test.mjs': [
        "import test from 'node:test';",
        "import { label } from '../src/app.mjs';",
        '',
        `test('${WORDS}', () => {});`
      ].join('\n')
    }
  },
  {
    id: 'DEC-061', category: 'fake-test', expect: 'must-not-pass',
    description: 'The symbol appears only inside a string in the test body',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': [
        "import test from 'node:test';",
        '',
        `test('${WORDS}', () => {`,
        '  const note = "reconcileCarrierPayroll is not called here";',
        '});'
      ].join('\n')
    }
  },
  {
    id: 'DEC-062', category: 'fake-test', expect: 'must-not-pass',
    description: 'The test file re-exports the symbol without ever calling it',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': [
        "import test from 'node:test';",
        "export { reconcileCarrierPayroll } from '../src/reconcile.mjs';",
        '',
        `test('${WORDS}', () => {});`
      ].join('\n')
    }
  },
  {
    id: 'DEC-063', category: 'fake-test', expect: 'must-not-pass',
    description: 'The entire test file is one string literal that merely looks like a test',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs':
        `const dead = "test('${WORDS}') reconcileCarrierPayroll(carrier, payroll)";\n`
    }
  },
  {
    id: 'DEC-064', category: 'fake-test', expect: 'known-limit',
    description: 'An empty function named after the requirement, genuinely imported, called and asserted',
    limit: 'The import is real, the call is real and the assertion is real. Only the behaviour is ' +
           'missing, and no amount of file reading distinguishes a function that returns undefined ' +
           'from one that does the work. This needs execution or coverage.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': 'export function reconcileCarrierFilePayrollExtractFlagMismatches() {\n  return undefined;\n}',
      'test/reconcile.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { reconcileCarrierFilePayrollExtractFlagMismatches } from '../src/reconcile.mjs';",
        '',
        `test('${WORDS}', () => {`,
        '  assert.equal(reconcileCarrierFilePayrollExtractFlagMismatches(), undefined);',
        '});'
      ].join('\n')
    }
  },

  // ============================ class B: content type must beat location, in every direction
  {
    id: 'DEC-070', category: 'prose-as-test', expect: 'must-not-pass',
    description: 'An unwritten test plan in Markdown, placed under tests/',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'tests/PLAN.md': `# Plan\n\nWe intend to ${WORDS}.\n\nProposed: describe('reconcileCarrierPayroll') -- NOT WRITTEN YET.\n`
    }
  },
  {
    id: 'DEC-071', category: 'prose-as-test', expect: 'must-not-pass',
    description: 'Design notes in Markdown under spec/, ending "Nothing is built yet"',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'spec/notes.md': `# Notes\n\nThe service will ${WORDS} via reconcileCarrierPayroll().\n\nNothing is built yet.\n`
    }
  },
  {
    id: 'DEC-072', category: 'prose-as-test', expect: 'must-not-pass',
    description: 'A Markdown file whose NAME matches the test pattern',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'notes.test.md': `We will ${WORDS}. reconcileCarrierPayroll(carrier, payroll)\n`
    }
  },
  {
    id: 'DEC-073', category: 'prose-as-test', expect: 'must-not-pass',
    description: 'A JSON fixture file under test/ carrying the requirement and the symbol',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/fixtures/cases.json': JSON.stringify(
        { title: WORDS, runner: "describe('reconcileCarrierPayroll')" }, null, 2)
    }
  },
  {
    id: 'DEC-074', category: 'prose-as-test', expect: 'must-not-pass',
    description: 'A YAML case list under spec/',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'spec/cases.yml': `cases:\n  - title: ${WORDS}\n    calls: reconcileCarrierPayroll(carrier, payroll)\n`
    }
  },
  {
    id: 'DEC-075', category: 'prose-as-test', expect: 'must-not-pass',
    description: 'An HTML test report under test/',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL,
      'test/report.html': `<html><body><h1>${WORDS}</h1><p>reconcileCarrierPayroll(carrier, payroll)</p></body></html>`
    }
  },
  {
    id: 'DEC-076', category: 'prose-as-test', expect: 'must-not-pass',
    description: 'A verbatim copy of the spec placed inside test/, which the docs/ fixture did not cover',
    files: {
      'PRD.md': SPEC_ONE, 'src/reconcile.mjs': REAL_IMPL, 'test/PRD-copy.md': SPEC_ONE
    }
  },

  // ==================================================== class C: token overlap is not semantics
  {
    id: 'DEC-080', category: 'semantics', expect: 'must-not-pass',
    description: 'A dictionary of the spec vocabulary, exported and referenced by a test',
    files: {
      'PRD.md': SPEC_ONE,
      'src/glossary.mjs': 'export const glossary = { reconcile: 1, carrier: 1, file: 1, payroll: 1, extract: 1, flag: 1, mismatches: 1 };',
      'test/glossary.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { glossary } from '../src/glossary.mjs';",
        '',
        `test('${WORDS}', () => { assert.ok(glossary); });`
      ].join('\n')
    }
  },
  {
    id: 'DEC-081', category: 'semantics', expect: 'must-not-pass',
    description: 'Vocabulary supplied by an HTML template while an unrelated module donates the symbol',
    files: {
      'PRD.md': SPEC_ONE,
      'public/index.html': `<html><body><h1>${WORDS}</h1></body></html>`,
      'src/util.mjs': 'export function formatDate(value) { return String(value); }',
      'test/util.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { formatDate } from '../src/util.mjs';",
        '',
        `test('${WORDS}', () => { assert.equal(formatDate(1), '1'); });`
      ].join('\n')
    }
  },

  // ============================================================ class D: evidence-file injection
  {
    id: 'DEC-090', category: 'evidence-injection', expect: 'must-not-pass',
    description: 'An empty project passed by pointing --evidence-files at another repository',
    evidenceFiles: '../outside/src/reconcile.mjs,../outside/test/reconcile.test.mjs',
    files: {
      'project/PRD.md': SPEC_ONE,
      'outside/src/reconcile.mjs': REAL_IMPL,
      'outside/test/reconcile.test.mjs': REAL_TEST
    },
    directory: 'project', spec: 'PRD.md'
  },

  // ================================================ mechanism isolation: the reviewer's finding
  //
  // Each of these is one mechanism away from passing. Disable that mechanism and the suite goes red,
  // which is the property the first round of fixtures did not have.
  {
    id: 'ISO-PROSE', category: 'mechanism', expect: 'must-not-pass',
    mechanism: 'prose classification',
    description: 'A Markdown file that declares the symbol and carries the vocabulary, with a real test calling it. Passes if prose is ever classified as source.',
    files: {
      'PRD.md': SPEC_ONE,
      // The vocabulary sits in IDENTIFIERS, not in a comment. The first version of this fixture put
      // it in a `//` comment, which comment-stripping removed before the prose rule could matter, so
      // the fixture stayed refused with the prose rule disabled and proved nothing.
      'src/reconcile.md': [
        '# Implementation',
        '',
        'export function reconcileCarrierPayroll(carrier, payroll) {',
        '  const mismatchesForCarrierFileAndPayrollExtractFlag = [];',
        '  return mismatchesForCarrierFileAndPayrollExtractFlag;',
        '}'
      ].join('\n'),
      'test/reconcile.test.mjs': TEST_CALLING('reconcileCarrierPayroll')
    }
  },
  {
    id: 'ISO-CONFIG', category: 'mechanism', expect: 'must-not-pass',
    mechanism: 'config classification',
    description: 'A YAML file declaring the symbol and the vocabulary, with a real test calling it. Passes if config is ever classified as source.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.yml': [
        'impl: |',
        '  export function reconcileCarrierPayroll(carrier, payroll) {',
        '    const mismatchesForCarrierFileAndPayrollExtractFlag = [];',
        '  }'
      ].join('\n'),
      'test/reconcile.test.mjs': TEST_CALLING('reconcileCarrierPayroll')
    }
  },
  {
    id: 'ISO-COMMENTS', category: 'mechanism', expect: 'must-not-pass',
    mechanism: 'comment stripping',
    description: 'An implementation that exists only inside comments, with a real test calling it. Passes if comments are ever counted as code.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': [
        `// ${WORDS}`,
        '// export function reconcileCarrierPayroll(carrier, payroll) {',
        '//   return { mismatches: [], flagged: 0 };',
        '// }',
        'export const placeholder = 1;'
      ].join('\n'),
      'test/reconcile.test.mjs': TEST_CALLING('reconcileCarrierPayroll')
    }
  },

  {
    id: 'ISO-LIVE', category: 'mechanism', expect: 'must-not-pass',
    mechanism: 'live test requirement',
    description: 'A file in test/ that imports and calls the symbol at module level but declares no test and asserts nothing. Passes if the live-test requirement is ever dropped.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': REAL_IMPL,
      'test/reconcile.test.mjs': [
        "import { reconcileCarrierPayroll } from '../src/reconcile.mjs';",
        '',
        'const result = reconcileCarrierPayroll([{ id: 1, premium: 10 }], []);',
        'console.log(result.mismatches.length);'
      ].join('\n')
    }
  },
  {
    id: 'ISO-MARKUP', category: 'mechanism', expect: 'must-not-pass',
    mechanism: 'markup classification',
    description: 'An HTML page whose inline script both carries the vocabulary and declares the symbol, with a real test calling it. Passes if markup is ever classified as source.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.html': [
        '<html><body><script>',
        'export function reconcileCarrierPayroll(carrier, payroll) {',
        '  const mismatchesForCarrierFileAndPayrollExtractFlag = [];',
        '  return mismatchesForCarrierFileAndPayrollExtractFlag;',
        '}',
        '</script></body></html>'
      ].join('\n'),
      'test/reconcile.test.mjs': TEST_CALLING('reconcileCarrierPayroll')
    }
  },
  {
    id: 'ISO-PATH', category: 'mechanism', expect: 'must-not-pass',
    mechanism: 'content type beats location',
    description: 'Markdown under tests/ that calls the symbol outside any string. Passes if path classification is ever restored ahead of content type.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': REAL_IMPL,
      'tests/PLAN.md': [
        '# Plan',
        '',
        'test(reconcile the carrier file against the payroll extract and flag mismatches)',
        '',
        'assert.deepEqual(reconcileCarrierPayroll(carrier, payroll).mismatches, [1])'
      ].join('\n')
    }
  },
  {
    id: 'ISO-DONOR', category: 'mechanism', expect: 'must-not-pass',
    mechanism: 'symbol donor coupling',
    description: 'Vocabulary in one source file with no exports, the symbol in another that barely matches. Passes if any matched file may donate a symbol.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/vocab.mjs': 'const reconcileCarrierFileAgainstPayrollExtractFlagMismatches = 1;\nconst held = reconcileCarrierFileAgainstPayrollExtractFlagMismatches;',
      'src/util.mjs': 'export function reconcileHelper(value) { return value; }',
      'test/util.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { reconcileHelper } from '../src/util.mjs';",
        '',
        `test('${WORDS}', () => { assert.equal(reconcileHelper(2), 2); });`
      ].join('\n')
    }
  },

  // ==================================================== honest shapes that must not be refused
  {
    id: 'HON-PY', category: 'honest', expect: 'must-pass',
    description: 'Python with pytest, which the first fix refused outright',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.py': [
        'def reconcile_carrier_payroll(carrier, payroll):',
        '    mismatches = [m["id"] for m in carrier if m not in payroll]',
        '    return {"mismatches": mismatches, "flagged": len(mismatches)}'
      ].join('\n'),
      'tests/test_reconcile.py': [
        'from src.reconcile import reconcile_carrier_payroll',
        '',
        'def test_reconcile_carrier_file_payroll_extract_flag_mismatches():',
        '    out = reconcile_carrier_payroll([{"id": 1}], [])',
        '    assert out["flagged"] == 1'
      ].join('\n')
    }
  },
  {
    id: 'HON-CJS', category: 'honest', expect: 'must-pass',
    description: 'CommonJS with module.exports = { fn }, which the first fix refused',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.js': [
        'function reconcileCarrierPayroll(carrier, payroll) {',
        '  const mismatches = carrier.filter((m) => !payroll.includes(m));',
        '  return { mismatches, flagged: mismatches.length };',
        '}',
        'module.exports = { reconcileCarrierPayroll };'
      ].join('\n'),
      'test/reconcile.test.js': [
        "const assert = require('node:assert/strict');",
        "const test = require('node:test');",
        "const { reconcileCarrierPayroll } = require('../src/reconcile.js');",
        '',
        `test('${WORDS}', () => {`,
        '  assert.equal(reconcileCarrierPayroll([1], []).flagged, 1);',
        '});'
      ].join('\n')
    }
  },
  {
    id: 'HON-GO', category: 'honest', expect: 'must-pass',
    description: 'Go, whose files the first fix never even read',
    files: {
      'PRD.md': SPEC_ONE,
      'reconcile.go': [
        'package payroll',
        '',
        'func ReconcileCarrierPayroll(carrier []string, extract []string) int {',
        '\tmismatches := 0',
        '\tfor range carrier {',
        '\t\tmismatches++',
        '\t}',
        '\treturn mismatches',
        '}'
      ].join('\n'),
      'reconcile_test.go': [
        'package payroll',
        '',
        'import "testing"',
        '',
        `func TestReconcileCarrierFilePayrollExtractFlagMismatches(t *testing.T) {`,
        '\tif ReconcileCarrierPayroll([]string{"a"}, nil) != 1 {',
        '\t\tt.Fatal("expected one mismatch flagged")',
        '\t}',
        '}'
      ].join('\n')
    }
  },
  {
    id: 'HON-DEFAULT', category: 'honest', expect: 'must-pass',
    description: 'An export default identifier, which the first fix refused',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': [
        'function reconcileCarrierPayroll(carrier, payroll) {',
        '  const mismatches = carrier.filter((m) => !payroll.includes(m));',
        '  return { mismatches, flagged: mismatches.length };',
        '}',
        'export default reconcileCarrierPayroll;'
      ].join('\n'),
      'test/reconcile.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import reconcileCarrierPayroll from '../src/reconcile.mjs';",
        '',
        `test('${WORDS}', () => {`,
        '  assert.equal(reconcileCarrierPayroll([1], []).flagged, 1);',
        '});'
      ].join('\n')
    }
  },
  {
    id: 'HON-ASSERT-ONLY', category: 'honest', expect: 'must-pass',
    description: 'A test that asserts on an exported constant without calling anything',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': REAL_IMPL + '\nexport const mismatchFlagLimitForCarrierPayrollExtract = 25;',
      'test/reconcile.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { mismatchFlagLimitForCarrierPayrollExtract } from '../src/reconcile.mjs';",
        '',
        `test('${WORDS}', () => {`,
        '  assert.equal(mismatchFlagLimitForCarrierPayrollExtract, 25);',
        '});'
      ].join('\n')
    }
  }
];
