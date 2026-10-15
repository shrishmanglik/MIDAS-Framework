// Mutation matrix for the verification gate.
//
// A suite that stays green while the thing it defends is removed is measuring its fixtures, not the
// code. That happened here twice: round one stayed green with three of four mechanisms reverted,
// and the scanner rewrite shipped with twelve of sixteen mechanisms unpinned. Both times the number
// that looked like proof - 42/42, then 82/82 - was adjacent to the question that mattered.
//
// This is the instrument that asks the question directly. Each mutant disables exactly one
// mechanism in lib/verification-gap.mjs, and the Deception Suite must turn red. A mutant that
// SURVIVES names a mechanism nothing tests.
//
//   node test/deception/mutate.mjs
//
// Exit code is non-zero when any mutant survives, so this can gate a release.
//
// Every anchor is checked for exactly one occurrence before it is applied. An anchor that stops
// matching is reported as ANCHOR MISSING rather than silently counted as a kill, because a mutation
// that never applied is indistinguishable from one the suite caught.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { execFileSync } from 'node:child_process';

// The default test runner discovers this file; only an explicit run may mutate source.
if (process.env.NODE_TEST_CONTEXT !== undefined) {
  console.log('Mutation matrix skipped under the Node test runner.');
  process.exit(0);
}

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const TARGET = path.join(ROOT, 'lib', 'verification-gap.mjs');
const SUITE = path.join('test', 'deception-suite.test.mjs');
const CONTRACT = path.join('test', 'verification-gap.test.mjs');

const MUTANTS = [
  ['async-pytest-off',
   String.raw`/^\s*(?:async\s+)?def\s+test_\w+\s*\(/m`,
   String.raw`/^\s*def\s+test_\w+\s*\(/m`],
  ['haskell-equations-off',
   "syntax === 'haskell' ? [...exportPatterns, HASKELL_EQUATION] : exportPatterns", 'exportPatterns'],
  ['matlab-counts-as-readable',
   "if (extension === '.m' && !OBJC_MARKERS.test(text)) {", 'if (false) {'],
  ['sfc-markup-counts-as-code', 'text = scriptOnly(text);', ';'],
  ['assertion-line-cooccurrence-restored',
   'function assertionReferences(line, escaped) {',
   'function assertionReferences(line, escaped) { return new RegExp(escaped).test(line);'],
  ['nested-block-comments',
   `nested: NEST, quotes: ['"""', '"', "'"]`, `nested: false, quotes: ['"""', '"', "'"]`],
  ['rust-nested-block-comments',
   `rust:   { line: ['//'], block: [['/*', '*/']], nested: NEST`,
   `rust:   { line: ['//'], block: [['/*', '*/']], nested: false`],
  ['block-comments-off',
   'const block = profile.block.find(([open]) => starts(open, i));',
   'const block = undefined;'],
  ['line-comments-off',
   'const line = profile.line.find((marker) => starts(marker, i));',
   'const line = undefined;'],
  ['string-scanning-off',
   'const quote = profile.quotes.find((q) => starts(q, i));',
   'const quote = undefined;'],
  ['regex-literal-handling-off', "if (profile.regex && text[i] === '/' &&", "if (false &&"],
  ['regex-preceders-blind',
   'REGEX_PRECEDERS.has(lastSignificant)', 'true'],
  ['regex-preceders-include-angle',
   "'-', '*', '%', '>', '~', '^',", "'-', '*', '%', '<', '>', '~', '^',", 'containment: a JSX closing tag mis-lexed as a regex costs at most the rest of its line'],

  // The two `wordstrings-*` mutants that stood here targeted a mechanism that no longer exists.
  // Identifier-shaped strings were admitted as SOURCE vocabulary to stop an honest Python dict
  // being refused; that was the route eight false passes took, and it is gone rather than bounded.
  // Deleting the mutants is correct here precisely because the code they measured is deleted too -
  // a mutant for absent code would report a permanent survivor and teach everyone to ignore the row.
  ['unterminated-string-runs-on',
   "if (quote.length === 1 && quote !== '`' && text[j] === '\\n') break;", ';', 'containment: the newline bail is now an optimisation; the give-up rule enforces the same bound'],

  ['blankout-eats-newlines',
   "out += source[i] === '\\n' ? '\\n' : ' ';", "out += ' ';"],
  // Restores the removed `://` exemption. The suite must go red: it was a critical false pass.
  ['colon-comment-exemption-restored',
   'if (line) {', "if (line && !(line === '//' && text[i - 1] === ':')) {"],
  ['unterminated-literal-containment-off',
   'if (!closed) {', 'if (false) {'],
  ['keyword-regex-preceders-off',
   'REGEX_PRECEDERS.has(lastSignificant) || KEYWORD_PRECEDERS.has(trailingWord(out))',
   'REGEX_PRECEDERS.has(lastSignificant)', 'containment: this still mis-lexes without it, but the damage stops at the end of the line'],

  ['py-line-comment-wrong',
   "py:     { line: ['#'], block: []", "py:     { line: ['//'], block: []"],
  ['py-triple-quotes-off',
   `py:     { line: ['#'], block: [], nested: false, quotes: ['"""', "'''", '"', "'"]`,
   `py:     { line: ['#'], block: [], nested: false, quotes: ['"', "'"]`],
  ['ruby-block-comments-off',
   "ruby:   { line: ['#'], block: [['=begin', '=end']]", "ruby:   { line: ['#'], block: []"],
  ['php-hash-comment-off',
   "php:    { line: ['//', '#']", "php:    { line: ['//']"],
  ['go-raw-strings-off',
   `go:     { line: ['//'], block: [['/*', '*/']], nested: false, quotes: ['"', '\`', "'"]`,
   `go:     { line: ['//'], block: [['/*', '*/']], nested: false, quotes: ['"', "'"]`],
  ['rust-profile-off', "'.rs': 'rust',", "'.rs': 'nested',"],
  ['every-language-is-c',
   'const profile = SYNTAX_PROFILES[profileFor(extension, text)];',
   "const profile = SYNTAX_PROFILES['cfam'];"],
  // One representative language, to prove the six are pinned at all three levels rather than just
  // listed. Removing the extension must turn the suite red.
  ['elixir-unreadable', "  '.ex', '.exs',", "  '.exs',"],
  ['elixir-export-shape-off', 'def(?:p|macro)?', 'defNOTAKEYWORD',
   'the shared python/ruby `def` rule already matches Elixir `def`; only `defp` and `defmacro` are ' +
   'unique to this pattern, and neither names an exported symbol a test can call'],
  ['objc-matlab-sniff-off',
   "  if (extension === '.m') return OBJC_MARKERS.test(text) ? 'objc' : 'matlab';",
   "  if (extension === '.m') return 'matlab';"],
  // The source threshold was lowered from 0.45 to 0.34 on 2026-09-11 because it was refusing real
  // code that names three of a requirement's eight words. Lowering a gate to make things pass is
  // exactly the move that makes a gate meaningless, so the boundary is mutated in both directions:
  // if the suite stays green with the threshold near zero, nothing is pinning it and the number is
  // a preference rather than a control.
  // Raising the floor from 3 to 1 changed nothing, because ceil(8 * 0.34) is already 3 for this
  // requirement: the mutation could not alter a single answer, and a mutant that cannot change an
  // answer proves nothing about the rule it claims to test. This one actually lowers the bar to 2,
  // which is exactly where SCAN-THIN-OVERLAP sits.
  ['source-threshold-lowered-to-two',
   'Math.max(3, Math.ceil(tokens.length * 0.34))', 'Math.max(2, Math.ceil(tokens.length * 0.2))'],
  ['source-threshold-ratio-collapsed',
   'Math.max(3, Math.ceil(tokens.length * 0.34))', 'Math.max(1, Math.ceil(tokens.length * 0.05))'],
  // Source vocabulary must come from code alone. Pointing it at the test-side set, which includes
  // every string, is exactly the smuggling route that was closed.
  ['string-tokens-count-as-source',
   'const local = tokens.filter((token) => item.codeTokens.has(token));',
   'const local = tokens.filter((token) => item.allTokens.has(token));'],
  ['declaration-counts-as-exercise',
   'bare = withoutDeclarations(item.code, symbol);', 'bare = item.code;'],
  ['objc-declaration-counts-as-exercise', '.replace(selector,', '.replace(/(?!)/g,'],
  ['c-family-declaration-counts-as-exercise', '.replace(typed,', '.replace(/(?!)/g,']
];

function failures(testFile) {
  try {
    const out = execFileSync(process.execPath, ['--test', testFile],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return count(out);
  } catch (error) {
    return count(`${error.stdout ?? ''}${error.stderr ?? ''}`);
  }
}

function count(output) {
  const match = /(?:^#|ℹ) fail (\d+)/m.exec(output) ?? /fail (\d+)/.exec(output);
  return match ? Number(match[1]) : -1;
}

// This script mutates the live file it is measuring, so a hard kill between writing a mutant and
// restoring would leave the repository holding deliberately broken code. The backup is written
// beside the target BEFORE the first mutation and removed only on a clean finish, so an interrupted
// run is visible and self-healing rather than silent. A previous run that died is restored here.
const BACKUP = `${TARGET}.pristine`;
if (fs.existsSync(BACKUP)) {
  fs.copyFileSync(BACKUP, TARGET);
  console.error(`Restored ${path.basename(TARGET)} from a previous interrupted run.`);
}

const pristine = fs.readFileSync(TARGET, 'utf8');
const rows = [];

fs.writeFileSync(BACKUP, pristine);
const restore = () => {
  try { fs.writeFileSync(TARGET, pristine); fs.rmSync(BACKUP, { force: true }); } catch { /* best effort */ }
};
process.on('exit', restore);
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.on(signal, () => { restore(); process.exit(130); });
}

// Prove the clean control passes before believing anything about the mutants. A fixture that is
// already failing makes EVERY mutant look killed, which is how this instrument would report a
// perfect score while measuring nothing. Caught on its first run: a scanner fixture whose quotes
// did not pair off failed on pristine source and turned a 18/20 into a fake 20/20.
const baseline = failures(SUITE);
if (baseline !== 0) {
  console.error(`Baseline is not green: the Deception Suite reports ${baseline} failure(s) on ` +
    'unmutated source. Every mutant would count as killed. Fix the suite first.');
  process.exit(2);
}

for (const [name, from, to, subsumedBy] of MUTANTS) {
  const occurrences = pristine.split(from).length - 1;
  if (occurrences !== 1) {
    rows.push({ name, anchor: occurrences });
    continue;
  }
  fs.writeFileSync(TARGET, pristine.replace(from, to));
  rows.push({ name, subsumedBy, suite: failures(SUITE), contract: failures(CONTRACT) });
  fs.writeFileSync(TARGET, pristine);
}

const width = Math.max(...rows.map((row) => row.name.length));
console.log(`${'MUTANT'.padEnd(width)}  SUITE     CONTRACT  VERDICT`);

let survived = 0;
let broken = 0;
for (const row of rows) {
  if (row.anchor !== undefined) {
    broken += 1;
    console.log(`${row.name.padEnd(width)}  ANCHOR MISSING: matched ${row.anchor} times, expected 1`);
    continue;
  }
  const killed = row.suite > 0;
  // A mutant marked `subsumedBy` names a mechanism a SECOND mechanism also defends, so removing it
  // alone produces no wrong verdict and no honest fixture can kill it. That is defence in depth
  // rather than an untested mechanism. It is reported rather than counted as a failure - and it is
  // written down, because the difference between the two is exactly what a green score papers over.
  if (!killed && !row.subsumedBy) survived += 1;
  const verdict = killed ? 'killed by the Deception Suite'
    : row.subsumedBy ? `survives, subsumed - ${row.subsumedBy}`
    : row.contract > 0 ? 'SURVIVED the suite; only the contract tests caught it'
    : 'SURVIVED BOTH';
  console.log(`${row.name.padEnd(width)}  ${`${row.suite} fail`.padEnd(9)} ${`${row.contract} fail`.padEnd(9)} ${verdict}`);
}

fs.rmSync(BACKUP, { force: true });

const subsumed = rows.filter((row) => row.subsumedBy && !(row.suite > 0)).length;
const applied = rows.length - broken;
console.log(`\n${applied} applied | ${applied - survived - subsumed} killed | ${subsumed} subsumed by another mechanism | ${survived} survived | ${broken} broken`);
if (broken > 0) console.log(`${broken} anchors no longer match and mutated nothing`);
process.exitCode = survived > 0 || broken > 0 ? 1 : 0;
