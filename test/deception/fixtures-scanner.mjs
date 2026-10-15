// Scanner mechanism isolation, written 2026-09-10 after a mutation matrix against the new
// comment-and-string scanner.
//
// The scanner replaced four regexes that each decided "is this position code?" and each got it
// wrong differently. I demonstrated by hand that it refuses nested comments, welded comments and
// apostrophes in regex literals, reported `82 tests, 82 pass`, and shipped none of those probes as
// fixtures. The matrix then disabled sixteen scanner mechanisms one at a time: THREE turned the
// suite red. Twelve mutants survived, including turning nested block comments off, turning block
// comments off entirely, and making every language use C syntax.
//
// That is the house defect again, in the artifact built to name it: the passing check was adjacent
// to the question that mattered. 82/82 measured the fixtures, not the scanner.
//
// Every fixture below is constructed so exactly ONE scanner mechanism stands between it and the
// wrong verdict. Disabling that mechanism must turn this suite red. `node evals/deception/mutate.mjs`
// re-runs the matrix and is the only evidence that this file does its job.
//
// Two mechanisms are deliberately NOT pinned by a fixture, and saying so is the point of writing it
// down. Mapping `.rs` away from its own profile, and removing the newline bail on unterminated
// single-quoted strings, defend the same failure from two sides: a Rust lifetime `'a` only costs
// the rest of one line while the bail holds. Either mutation alone produces no wrong verdict, so no
// honest fixture can kill it alone. SCAN-LIFETIME pins the shape; the matrix records the overlap.

const REQ = 'The system must reconcile the carrier file against the payroll extract and flag mismatches.';
const SPEC_ONE = `# PRD\n\n- [ ] REQ-001: ${REQ}\n`;
const WORDS = 'reconcile the carrier file against the payroll extract and flag mismatches';

// The vocabulary carried by an IDENTIFIER rather than by prose, so that what reaches the tracer
// depends on whether the scanner classified the surrounding text as code.
const IDENT = 'reconcileCarrierFilePayrollExtractFlagMismatches';
const SNAKE = 'reconcile_carrier_file_payroll_extract_flag_mismatches';

export const scannerFixtures = [
  // ------------------------------------------------------------------ comments are not evidence
  {
    id: 'SCAN-NESTED', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'nested block comments (Kotlin, Swift, Scala)',
    description: 'A Kotlin file whose entire contents, including a passing spec, sit inside a NESTED block comment. Passes if the comment is closed at the first */.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/Reconcile.kt': [
        '/*',
        'Planned for next sprint. None of this exists yet.',
        '/* the inner note that closes the comment early */',
        `fun ${IDENT}(rows: List<Int>): Int { return rows.size }`,
        'class ReconcileSpec : StringSpec',
        `fun run() { ${IDENT}(listOf(1)) }`,
        '*/'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-BLOCK', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'block comments',
    description: 'A JavaScript module whose whole implementation and test are commented out with /* */',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': [
        '/*',
        `export function ${IDENT}(rows) { return rows.length; }`,
        `test('${WORDS}', () => { ${IDENT}([1]); });`,
        '*/'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-RUBY-BLOCK', category: 'scanner', expect: 'must-not-pass',
    mechanism: '=begin/=end block comments (Ruby)',
    description: 'A Ruby file whose implementation and minitest both sit inside =begin/=end',
    files: {
      'PRD.md': SPEC_ONE,
      'lib/reconcile.rb': [
        '=begin',
        `def ${SNAKE}(rows)`,
        '  rows',
        'end',
        '',
        'def test_it_flags_them',
        `  raise unless ${SNAKE}([1]) == [1]`,
        'end',
        '=end'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-PHP-HASH', category: 'scanner', expect: 'must-not-pass',
    mechanism: '# line comments (PHP)',
    description: 'A PHP file where the implementation and its PHPUnit method are commented out with #, which is a comment in PHP and not in C',
    files: {
      'PRD.md': SPEC_ONE,
      'src/Reconciler.php': [
        '<?php',
        '# Nothing below is implemented. Kept for reference only.',
        `# public function ${IDENT}($rows) { return $rows; }`,
        `# public function testItFlagsThem() { $this->assertEquals([1], ${IDENT}([1])); }`
      ].join('\n')
    }
  },
  {
    id: 'SCAN-PY-DOCSTRING', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'triple-quoted strings (Python)',
    description: 'A Python module whose entire body, implementation and test alike, is inside one docstring',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.py': [
        '"""',
        `def ${SNAKE}(rows):`,
        '    return rows',
        '',
        '',
        `def test_${SNAKE}():`,
        `    assert ${SNAKE}([1]) == [1]`,
        '"""'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-GO-RAWSTRING', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'backtick raw strings (Go)',
    description: 'A Go file whose only requirement vocabulary is a sentence inside a backtick raw string, with a real test calling an unrelated function',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.go': [
        'package reconcile',
        '',
        `const doc = \`${WORDS}\``,
        '',
        'func Placeholder() int { return 0 }'
      ].join('\n'),
      'src/reconcile_test.go': [
        'package reconcile',
        '',
        'import "testing"',
        '',
        'func TestReconcileCarrierFilePayrollExtractFlagMismatches(t *testing.T) {',
        '\tif Placeholder() != 0 {',
        '\t\tt.Fail()',
        '\t}',
        '}'
      ].join('\n')
    }
  },

  // ------------------------------------------------- a string is not where a requirement is built
  {
    id: 'SCAN-STRING-SMUGGLING', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'string tokens cannot carry a source match alone',
    description: 'The requirement sentence written with dots instead of spaces, which makes the whole sentence one whitespace-free "name" and admits it as vocabulary. An independent reviewer got eight false passes through this door.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/app.mjs': [
        `export const MESSAGE_KEY = "${WORDS.split(' ').join('.')}";`,
        'export function lookup() { return MESSAGE_KEY; }'
      ].join('\n'),
      'test/app.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { lookup, MESSAGE_KEY } from '../src/app.mjs';",
        '',
        `test('${WORDS}', () => {`,
        // The vocabulary is in an identifier, so the TEST side of the trace is satisfied by code
        // and the only thing left deciding the verdict is whether the dotted string counts as the
        // implementation. Without that, the fixture is refused for the wrong reason and pins nothing.
        `  const ${IDENT} = lookup();`,
        `  assert.equal(${IDENT}, MESSAGE_KEY);`,
        '});'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-PROSE-SUPPLEMENT', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'identifier-shaped strings only',
    description: 'A source file with just enough code vocabulary to unlock the string supplement, whose remaining requirement words live in a prose sentence inside a string literal.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/a.mjs': [
        'export function reconcileCarrier(rows) {',
        '  const note = "payroll extract file flag mismatches for this run";',
        '  return rows.length + note.length;',
        '}'
      ].join('\n'),
      'test/a.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { reconcileCarrier } from '../src/a.mjs';",
        '',
        `test('${WORDS}', () => {`,
        '  const payrollExtractFileFlagMismatches = reconcileCarrier([1]);',
        '  assert.equal(typeof payrollExtractFileFlagMismatches, "number");',
        '});'
      ].join('\n')
    }
  },

  {
    id: 'SCAN-THIN-OVERLAP', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'the source vocabulary threshold',
    description: 'An unrelated module sharing exactly TWO generic words with the requirement, with a real test that calls it and a title restating the requirement. Sits deliberately on the boundary: two is enough to donate a symbol, so only the source threshold of three stands between this and a pass.',
    files: {
      'PRD.md': SPEC_ONE,
      // `flag` and `mismatch` are the two most generic words in the requirement. Nothing here
      // reconciles anything, reads a carrier file, or sees a payroll extract.
      //
      // The first version of this fixture shared ONE word, and it proved nothing: the DONOR floor
      // refused it before the threshold was ever consulted, so the mutation matrix still reported
      // the threshold as unpinned. A fixture has to fail for the reason it claims to test.
      'src/review.mjs': [
        'export function flagMismatches(rows) {',
        '  return rows.map((row) => ({ ...row, review: true }));',
        '}'
      ].join('\n'),
      'test/review.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { flagMismatches } from '../src/review.mjs';",
        '',
        // The title carries the whole requirement, which is legitimate on the test side and must
        // not be enough on its own.
        `test('${WORDS}', () => {`,
        '  assert.deepEqual(flagMismatches([{ id: 1 }]), [{ id: 1, review: true }]);',
        '});'
      ].join('\n')
    }
  },

  // ------------------------------------------------------ a mention next to a paren is not a test
  {
    id: 'SCAN-NEWLINES', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'newline preservation through blanking',
    description: 'A test that names the subject, then a multi-line comment, then an assertion about something else. Passes if blanking a comment discards its newlines, because the two lines then collapse into one and a mention reads as an assertion.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': [
        `export function ${IDENT}(rows, extract) {`,
        '  return rows.filter((row) => !extract.includes(row));',
        '}'
      ].join('\n'),
      'test/reconcile.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        `import { ${IDENT} } from '../src/reconcile.mjs';`,
        '',
        `test('${WORDS}', () => {`,
        // Every newline between the mention and the assertion is INSIDE the comment, so blanking
        // is the only thing keeping them on separate lines.
        `  const subject = ${IDENT}; /* This comment is the whole distance between the`,
        '     mention on the left and the assertion on the right. Blanking it must leave its',
        '     newlines behind, or the two join into one line and naming the subject reads as',
        '     asserting about it. */ assert.equal(1, 1);',
        '});'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-NESTED-RUST', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'nested block comments (Rust)',
    description: 'The Kotlin deception in Rust, which nests block comments under a different profile because it has no triple-quoted string',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.rs': [
        '/*',
        'Sketched during design review. Not implemented.',
        '/* an inner note that closes the comment early */',
        `pub fn ${SNAKE}(rows: Vec<i64>) -> Vec<i64> { rows }`,
        '#[test]',
        `fn exercise() { assert_eq!(${SNAKE}(vec![1]), vec![1]); }`,
        '*/'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-SELFTEST-EMPTY', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'a declaration is not an exercise',
    description: 'A Rust module with #[cfg(test)] whose test asserts nothing at all. Passes if `fn name(` in the definition counts as the call that exercises it.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.rs': [
        `pub fn ${SNAKE}(rows: Vec<i64>) -> Vec<i64> {`,
        '    rows',
        '}',
        '',
        '#[cfg(test)]',
        'mod tests {',
        '    #[test]',
        '    fn nothing_is_checked_here() {}',
        '}'
      ].join('\n')
    }
  },

  {
    id: 'SCAN-SELFTEST-OBJC', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'a declaration is not an exercise, Objective-C selectors',
    description: 'An Objective-C class whose XCTest method asserts nothing. Objective-C declares a method as `- (void)name {`, with no keyword and no parentheses after the name, so the signature itself satisfied "symbol followed by an opening brace".',
    files: {
      'PRD.md': SPEC_ONE,
      'Reconciler.m': [
        '#import "Reconciler.h"',
        '',
        '@implementation Reconciler',
        '',
        `- (NSArray *)${IDENT}:(NSArray *)carrier {`,
        '    return carrier;',
        '}',
        '',
        '- (void)testItFlagsThem {',
        '    NSUInteger unused = 1;',
        '    XCTAssertTrue(unused == 1);',
        '}',
        '',
        '@end'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-SELFTEST-CSHARP', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'a declaration is not an exercise, without a declaration keyword',
    description: 'A single-file C# class with a [Test] method that asserts nothing. C-family methods declare a return type and no keyword, so the keyword rule never fires on them.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/Reconciler.cs': [
        'public class Reconciler {',
        `  public static int ${IDENT}(int[] rows) {`,
        '    return rows.Length;',
        '  }',
        '',
        '  [Test]',
        '  public void NothingIsCheckedHere() { }',
        '}'
      ].join('\n')
    }
  },

  // ------------------------------------------------------------------ honest work must still pass
  {
    id: 'SCAN-SELFTEST-JAVA', category: 'scanner', expect: 'must-pass',
    mechanism: 'a declaration is not an exercise, without a declaration keyword',
    description: 'The same single-file C-family layout in Java, with a test that really calls the method. The fix for SCAN-SELFTEST-CSHARP must not refuse this.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/Reconciler.java': [
        'public class Reconciler {',
        `  public int ${IDENT}(int[] rows) {`,
        '    return rows.length;',
        '  }',
        '',
        '  @Test',
        '  public void flagsRowsAbsentFromTheExtract() {',
        `    assertEquals(1, new Reconciler().${IDENT}(new int[]{1}));`,
        '  }',
        '}'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-SELFTEST-REAL', category: 'scanner', expect: 'must-pass',
    mechanism: 'a declaration is not an exercise',
    description: 'The same Rust layout with a test that really calls the function. The fix for SCAN-SELFTEST-EMPTY must not refuse this.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.rs': [
        `pub fn ${SNAKE}(rows: Vec<i64>) -> Vec<i64> {`,
        '    rows',
        '}',
        '',
        '#[cfg(test)]',
        'mod tests {',
        '    use super::*;',
        '    #[test]',
        '    fn flags_rows_absent_from_the_extract() {',
        `        assert_eq!(${SNAKE}(vec![1]), vec![1]);`,
        '    }',
        '}'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-LINE-PY', category: 'scanner', expect: 'must-pass',
    mechanism: 'per-language line comment markers',
    description: 'A Python test using // for integer division on the same line as the call. Refused if // is treated as a comment in Python.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.py': [
        `def ${SNAKE}(rows, extract):`,
        '    return [row for row in rows if row not in extract]'
      ].join('\n'),
      'tests/test_reconcile.py': [
        `from src.reconcile import ${SNAKE}`,
        '',
        '',
        `def test_${SNAKE}():`,
        `    half = 10 // 2; found = ${SNAKE}([1], [])`,
        '    assert found == [1] and half == 5'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-REGEX-APOSTROPHE', category: 'scanner', expect: 'must-pass',
    mechanism: 'regex literals',
    description: "A test whose line begins with a regex containing an apostrophe, then calls the subject. Refused if the apostrophe opens a string and swallows the call.",
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': [
        `export function ${IDENT}(rows, extract) {`,
        '  return rows.filter((row) => !extract.includes(row));',
        '}'
      ].join('\n'),
      'test/reconcile.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        `import { ${IDENT} } from '../src/reconcile.mjs';`,
        '',
        `test('${WORDS}', () => {`,
        `  const found = /don't/.test('x') ? [] : ${IDENT}([1], []);`,
        '  assert.deepEqual(found, [1]);',
        '});'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-DIVISION', category: 'scanner', expect: 'must-pass',
    mechanism: 'regex literal preceders',
    description: 'A test that divides on the same line as the call. Refused if every / is read as the start of a regex literal.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': [
        `export function ${IDENT}(rows, extract) {`,
        '  return rows.filter((row) => !extract.includes(row));',
        '}'
      ].join('\n'),
      'test/reconcile.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        `import { ${IDENT} } from '../src/reconcile.mjs';`,
        '',
        `test('${WORDS}', () => {`,
        `  const half = 10 / 2, found = ${IDENT}([1], []);`,
        '  assert.equal(found.length, half - 4);',
        '});'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-APOSTROPHE-JSX', category: 'scanner', expect: 'must-pass',
    mechanism: 'unterminated single-quoted strings end at the newline',
    description: "A React component with an apostrophe in visible JSX text, declared above the implementation. Refused if that apostrophe opens a string that runs to the end of the file.",
    files: {
      'PRD.md': SPEC_ONE,
      'src/Panel.jsx': [
        'export function Panel({ rows }) {',
        "  return <p>Don't reconcile the same carrier file twice</p>;",
        '}',
        '',
        `export function ${IDENT}(rows, extract) {`,
        '  return rows.filter((row) => !extract.includes(row));',
        '}'
      ].join('\n'),
      'test/panel.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        `import { ${IDENT} } from '../src/Panel.jsx';`,
        '',
        `test('${WORDS}', () => {`,
        `  assert.deepEqual(${IDENT}([1], []), [1]);`,
        '});'
      ].join('\n')
    }
  },
  {
    // INVERTED, not deleted. This fixture was written to pin the `://` exemption that stopped `//`
    // after a colon being read as a comment. An independent reviewer then demonstrated that the
    // exemption is a critical FALSE PASS - `default://<the requirement sentence>` is valid
    // JavaScript and handed the gate every token it needed - and that it protected nothing, because
    // a URL in real code is already inside a string or an existing comment. So the fixture now pins
    // the removal instead of the mechanism. I kept that guard because I could construct a case
    // where it helped, and never checked whether it also did harm.
    id: 'SCAN-COLON-COMMENT', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'a comment after a colon is still a comment',
    description: 'The requirement restated in a comment written as `default://<prose>` with no space, which is valid JavaScript. Passes if `//` after a colon is exempted from comment stripping.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/thing.mjs': [
        'export function alpha(input) {',
        '  switch (input.kind) {',
        `    default://${WORDS}`,
        '    return input;',
        '  }',
        '}'
      ].join('\n'),
      'test/thing.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        "import { alpha } from '../src/thing.mjs';",
        '',
        `test('${WORDS}', () => {`,
        `  const ${IDENT} = alpha({ kind: 2 });`,
        `  assert.equal(${IDENT}.kind, 2);`,
        '});'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-URL-IN-JSX', category: 'scanner', expect: 'must-pass',
    mechanism: 'a mis-lex costs at most one line',
    description: 'A bare URL as JSX link text, which is ordinary React and is not a string literal in any profile. Removing the colon exemption means the rest of that line is read as a comment, so the cost must stay confined to the line the URL is on.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/Panel.jsx': [
        'export function Panel() {',
        '  return <a href="#">http://carrier.example/payroll</a>;',
        '}',
        '',
        `export function ${IDENT}(rows, extract) {`,
        '  return rows.filter((row) => !extract.includes(row));',
        '}'
      ].join('\n'),
      'test/panel.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        `import { ${IDENT} } from '../src/Panel.jsx';`,
        '',
        `test('${WORDS}', () => {`,
        `  assert.deepEqual(${IDENT}([1], []), [1]);`,
        '});'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-BACKTICK-POISON', category: 'scanner', expect: 'must-pass',
    mechanism: 'unterminated literals are contained to one line',
    description: 'A regex literal containing a backtick, in a keyword position. The backtick opened a template literal that swallowed the rest of the file: the same whole-file poison as the original apostrophe bug, reached through a different character.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': [
        'export function quotesBacktick(s) { return /`/.test(s); }',
        '',
        `export function ${IDENT}(rows, extract) {`,
        '  return rows.filter((row) => !extract.includes(row));',
        '}'
      ].join('\n'),
      'test/reconcile.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        `import { ${IDENT} } from '../src/reconcile.mjs';`,
        '',
        `test('${WORDS}', () => {`,
        `  assert.deepEqual(${IDENT}([1], []), [1]);`,
        '});'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-UNCLOSED-TEMPLATE', category: 'scanner', expect: 'must-pass',
    mechanism: 'unterminated literals are contained to one line',
    description: 'A genuinely unclosed template literal above the implementation. The scanner has lost its place, and must give up at the end of that line rather than blanking everything below it.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': [
        'const banner = `unclosed;',
        '',
        `export function ${IDENT}(rows, extract) {`,
        '  return rows.filter((row) => !extract.includes(row));',
        '}'
      ].join('\n'),
      'test/reconcile.test.mjs': [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        `import { ${IDENT} } from '../src/reconcile.mjs';`,
        '',
        `test('${WORDS}', () => {`,
        `  assert.deepEqual(${IDENT}([1], []), [1]);`,
        '});'
      ].join('\n')
    }
  },
  {
    id: 'SCAN-LIFETIME', category: 'scanner', expect: 'must-pass',
    mechanism: 'Rust has no single-quoted string',
    description: 'A Rust project using a lifetime parameter. The apostrophe must not be read as a string delimiter.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.rs': [
        "pub struct CarrierRow<'a> {",
        "    pub id: &'a str,",
        '    pub premium: i64,',
        '}',
        '',
        `pub fn ${SNAKE}(rows: Vec<i64>) -> Vec<i64> {`,
        '    rows',
        '}'
      ].join('\n'),
      'tests/reconcile_test.rs': [
        'use billing::*;',
        '',
        '#[test]',
        'fn flags_rows_absent_from_the_extract() {',
        // `&'static` carries a lone apostrophe, and the call sits after it on the same line. If
        // Rust is scanned with a profile that treats `'` as a string delimiter, everything from
        // the lifetime to the end of the line is blanked and the call disappears.
        `    let label: &'static str = "carrier"; assert_eq!(${SNAKE}(vec![1]), vec![1], "{}", label);`,
        '}'
      ].join('\n')
    }
  },
  {
    id: 'HON-MATLAB-UNREADABLE', category: 'honest-unread', expect: 'unreadable',
    mechanism: 'unsupported MATLAB is unread, not unwritten',
    description: 'An implemented and tested MATLAB project must identify its unread source language.',
    files: {
      'PRD.md': SPEC_ONE,
      'reconcileCarrierPayroll.m': 'function result = reconcileCarrierPayroll(carrier, payroll)\n% Return rows missing from the payroll extract.\nmismatches = carrier(~ismember(carrier, payroll));\nresult = struct("mismatches", mismatches, "flagged", numel(mismatches));\nend\n',
      'test/testReconcileCarrierPayroll.m': 'function tests = testReconcileCarrierPayroll\ntests = functiontests(localfunctions);\nend\nfunction testFlagsMismatches(testCase)\nout = reconcileCarrierPayroll([1], []);\nverifyEqual(testCase, out.flagged, 1);\nend\n'
    }
  },
  {
    id: 'SCAN-VUE-SVELTE-TEMPLATE-SMUGGLING', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'SFC templates are not implementation vocabulary',
    description: 'Vue and Svelte templates restate the requirement, but their tested scripts only export unrelated placeholders.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/Fake.vue': `<template><p>${WORDS}</p><template><span>${WORDS}</span></template></template>\n<script>export function placeholder() { return 1; }</script>\n<style>.reconcileCarrierPayroll { color: red; }</style>`,
      'src/Fake.svelte': `<p>${WORDS}</p>\n<script>export function placeholder() { return 1; }</script>\n<style>.reconcileCarrierPayroll { color: red; }</style>`,
      'test/fake.test.mjs': `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { placeholder } from '../src/Fake.vue';\nimport * as svelte from '../src/Fake.svelte';\ntest('${WORDS}', () => {\n  assert.equal(placeholder(), 1);\n  assert.equal(svelte.placeholder(), 1);\n});`
    }
  },
  {
    id: 'SCAN-ASSERTION-BARE-SYMBOL', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'assertions contain the subject expression',
    description: 'An unrelated assertion followed by a bare subject reference on the same line exercises nothing.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/reconcile.mjs': `export function ${IDENT}(carrier, payroll) { const mismatches = carrier.filter((row) => !payroll.includes(row)); return { mismatches, flagged: mismatches.length }; }`,
      'test/reconcile.test.mjs': `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { ${IDENT} } from '../src/reconcile.mjs';\ntest('${WORDS}', () => {\n  assert.equal(1, 1); ${IDENT};\n});`
    }
  },
  {
    id: 'SCAN-NEWLINES-DECLARATION', category: 'scanner', expect: 'must-not-pass',
    mechanism: 'newline preservation through blanking',
    description: 'A valid C# block comment separates a class opening from a method declaration. Losing its newlines hides the declaration from the exercise exclusion.',
    files: {
      'PRD.md': SPEC_ONE,
      'src/Reconciler.cs': [
        'public class Reconciler { /* Notes before the implementation.',
        'The method still starts on its own line after this comment.',
        `*/ public int ${IDENT}(int[] carrier, int[] payroll) {`,
        '  return carrier.Length - payroll.Length;',
        '}',
        '[Test]',
        'public void NothingIsCheckedHere() {}',
        '}'
      ].join('\n')
    }
  }
];
