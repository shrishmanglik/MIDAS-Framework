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
//   node evals/deception/mutate.mjs
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

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const TARGET = path.join(ROOT, 'lib', 'verification-gap.mjs');
const SUITE = path.join('test', 'deception-suite.test.mjs');
const CONTRACT = path.join('test', 'verification-gap.test.mjs');

const MUTANTS = [
  ['nested-block-comments',
   `nested: NEST, quotes: ['"""', '"', "'"]`, `nested: false, quotes: ['"""', '"', "'"]`],
  ['rust-nested-block-comments',
   `nested: NEST, quotes: ['"']`, `nested: false, quotes: ['"']`],
  ['block-comments-off',
   'const block = profile.block.find(([open]) => starts(open, i));',
   'const block = undefined;'],
  ['line-comments-off',
   'const line = profile.line.find((marker) => starts(marker, i));',
   'const line = undefined;'],
  ['string-scanning-off',
   'const quote = profile.quotes.find((q) => starts(q, i));',
   'const quote = undefined;'],
  ['regex-literal-handling-off',
   "if (profile.regex && text[i] === '/' && REGEX_PRECEDERS.has(lastSignificant)) {",
   "if (false && text[i] === '/') {"],
  ['regex-preceders-blind',
   'REGEX_PRECEDERS.has(lastSignificant)', 'true'],
  ['regex-preceders-include-angle',
   "'-', '*', '%', '>', '~', '^',", "'-', '*', '%', '<', '>', '~', '^',"],
  ['wordstrings-admit-prose',
   'if (inner.length > 1 && !/\\s/.test(inner)) wordStrings.push(inner);',
   'if (inner.length > 1) wordStrings.push(inner);'],
  ['wordstrings-dropped-entirely',
   'if (inner.length > 1 && !/\\s/.test(inner)) wordStrings.push(inner);',
   'if (false) wordStrings.push(inner);'],
  ['unterminated-string-runs-on',
   "if (quote.length === 1 && quote !== '`' && text[j] === '\\n') break;", ';'],
  ['blankout-eats-newlines',
   "out += source[i] === '\\n' ? '\\n' : ' ';", "out += ' ';"],
  ['url-in-string-guard-off',
   "if (!(line === '//' && text[i - 1] === ':')) {", 'if (true) {'],
  ['py-line-comment-wrong',
   "py:     { line: ['#'], block: []", "py:     { line: ['//'], block: []"],
  ['py-triple-quotes-off',
   `quotes: ['"""', "'''", '"', "'"]`, `quotes: ['"', "'"]`],
  ['ruby-block-comments-off',
   "ruby:   { line: ['#'], block: [['=begin', '=end']]", "ruby:   { line: ['#'], block: []"],
  ['php-hash-comment-off',
   "php:    { line: ['//', '#']", "php:    { line: ['//']"],
  ['go-raw-strings-off',
   `go:     { line: ['//'], block: [['/*', '*/']], nested: false, quotes: ['"', '\`', "'"]`,
   `go:     { line: ['//'], block: [['/*', '*/']], nested: false, quotes: ['"', "'"]`],
  ['rust-profile-off', "'.rs': 'rust',", "'.rs': 'nested',"],
  ['every-language-is-c',
   "const profile = SYNTAX_PROFILES[EXTENSION_SYNTAX[extension] ?? 'cfam'];",
   "const profile = SYNTAX_PROFILES['cfam'];"],
  ['declaration-counts-as-exercise',
   'const bare = withoutDeclarations(code, symbol);', 'const bare = code;'],
  ['c-family-declaration-counts-as-exercise',
   '.replace(typed, (match) => match.replace(new RegExp(escaped, \'g\'), \' \'.repeat(symbol.length)));',
   ';']
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

const pristine = fs.readFileSync(TARGET, 'utf8');
const rows = [];

process.on('exit', () => fs.writeFileSync(TARGET, pristine));

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

for (const [name, from, to] of MUTANTS) {
  const occurrences = pristine.split(from).length - 1;
  if (occurrences !== 1) {
    rows.push({ name, anchor: occurrences });
    continue;
  }
  fs.writeFileSync(TARGET, pristine.replace(from, to));
  rows.push({ name, suite: failures(SUITE), contract: failures(CONTRACT) });
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
  if (!killed) survived += 1;
  const verdict = killed ? 'killed by the Deception Suite'
    : row.contract > 0 ? 'SURVIVED the suite; only the contract tests caught it'
    : 'SURVIVED BOTH';
  console.log(`${row.name.padEnd(width)}  ${`${row.suite} fail`.padEnd(9)} ${`${row.contract} fail`.padEnd(9)} ${verdict}`);
}

const applied = rows.length - broken;
console.log(`\n${applied} mutants applied | ${applied - survived} killed by the Deception Suite | ${survived} survived`);
if (broken > 0) console.log(`${broken} anchors no longer match and mutated nothing`);
process.exitCode = survived > 0 || broken > 0 ? 1 : 0;
