import fs from 'node:fs/promises';
import path from 'node:path';

// Deterministic traceability: does a requirement in a spec correspond to an implementation and to
// something that would fail if that implementation broke?
//
// This file has been attacked twice and rewritten twice, and the history matters more than the code.
//
// 2026-09-10, first defect: a spec, a NOTES.md restating the requirements in prose, and no code at
// all returned `pass`. Token matches from every file were pooled, so markdown supplied the
// vocabulary. A receipt terminating in another document that also just says so.
//
// 2026-09-10, second round: an independent reviewer got SIXTEEN further deceptions through the fix,
// in four classes, and found the gate refused every pytest project on earth. Every one of those is
// addressed below and every one has a fixture in evals/deception. The classes were:
//
//   A  the symbol check was `code.includes(symbol)`, so a symbol MENTIONED in a comment, a string,
//      or an unused import counted as the code being exercised
//   B  classifyEvidence tested the PATH before the extension, so any .md under test/ or spec/ was
//      classified as a test and prose became evidence again through a different door
//   C  token overlap is not semantics: generic vocabulary matched unrelated code, and the symbol
//      donor did not have to be the same file that supplied the vocabulary
//   D  --evidence-files took any path, including outside the project, with no extension allowlist
//
// The rules that came out of it:
//   - content type beats location. A .md inside test/ is prose.
//   - a test counts only when it CALLS a symbol, or asserts on one, outside of strings and comments
//   - the symbol donor must be a source file that itself carried the requirement's vocabulary
//   - evidence files must live inside the project and be a type this tool can read
//
// What it still cannot do is in evals/deception/README.md, stated plainly, including the cases that
// are catchable in principle but not by reading files.

const ignoredDirectories = new Set([
  '.git',
  '.midas',
  'node_modules',
  'coverage',
  'dist',
  'build',
  'tmp',
  '.venv',
  'venv',
  '__pycache__',
  'vendor',
  'target'
]);

// Prose and data can never establish a requirement, whatever directory they sit in.
const proseExtensions = new Set(['.md', '.txt', '.rst', '.adoc']);
const configExtensions = new Set(['.json', '.yaml', '.yml', '.toml', '.ini']);
// Markup and styling describe presentation. They are read as context so a template restating a
// requirement cannot supply the vocabulary that lets an unrelated module donate a symbol (class C).
const markupExtensions = new Set(['.html', '.htm', '.css', '.scss', '.svg']);

// Languages the gate can actually read. Adding one means adding its comment style, its export
// shape and its test convention below; a language listed here with none of those would silently
// refuse every project written in it, which is the defect that made this list grow.
const sourceExtensions = new Set([
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte',
  '.py', '.go', '.rb', '.java', '.kt', '.kts', '.rs', '.cs', '.php', '.swift', '.scala',
  '.c', '.h', '.cpp', '.hpp', '.cc', '.hh',
  // Added 2026-09-11. A reviewer built complete, genuinely tested projects in each of these and the
  // gate produced `evidenceFiles: 0` and a receipt instructing the author to "implement or
  // explicitly waive" work that was finished. Refusing to read a language is defensible; reporting
  // unread code as unwritten is not, and that is the worst false refusal this tool can produce.
  '.ex', '.exs',                 // elixir
  '.clj', '.cljs', '.cljc',      // clojure
  '.hs',                         // haskell
  '.pl', '.pm', '.t',            // perl
  '.dart',                       // dart
  '.m', '.mm'                    // objective-c, with the MATLAB ambiguity handled in scanCode
]);

// Doubles, stories and fixtures describe a system without being one. Classified as context, so a
// Cypress spec, a Storybook entry or a __mocks__ module can never stand in for an implementation.
// A reviewer passed a project whose ONLY code was a mock, and the receipt cited __mocks__ as source.
const nonImplementationPatterns = [
  /(^|\/)__mocks__\//,
  /(^|\/)__fixtures__\//,
  /(^|\/)fixtures?\//,
  /\.stories\.[a-z]+$/,
  /\.d\.ts$/          // a declaration file states a shape; it implements nothing
];

const hashCommentLanguages = new Set(['.py', '.rb', '.sh', '.yaml', '.yml', '.toml']);

const readableExtensions = new Set([
  ...proseExtensions, ...configExtensions, ...markupExtensions, ...sourceExtensions
]);

const testPathPatterns = [
  /(^|\/)tests?\//,
  /(^|\/)__tests__\//,
  /(^|\/)spec\//,
  /\.test\.[a-z]+$/,
  /\.spec\.[a-z]+$/,
  /(^|\/)test_[^/]+\.[a-z]+$/,
  /_test\.[a-z]+$/,
  /(^|\/)[^/]*Test\.(java|kt|cs|scala|swift)$/,
  /(^|\/)[^/]*Spec\.(java|kt|cs|scala|swift)$/,
  /(^|\/)tests\.py$/,                     // django puts them here
  /(^|\/)[^/]*\.tests\//,                 // dotnet Foo.Tests/
  /_spec\.rb$/,                           // rspec
  /\.cy\.[a-z]+$/                         // cypress
];

// A test only counts when something in it could actually fail. These are per language because
// `def test_reconcile(...)` never matches a JavaScript test regex, and the first version of this
// file refused every pytest and unittest project on earth as a result.
const liveTestPatterns = [
  // The lookbehind is the whole point: `\b` let `CARRIER.test(row)` - an ordinary regex method call
  // in production code - register as a test runner. A project with NO TEST FILE AT ALL then reached
  // `pass` and the receipt named the implementation as its own test evidence. Measured 2026-09-10
  // by an independent reviewer and reproduced here before the fix.
  /(?<![.\w$])(?:test|it|describe|bench)\s*\(/,     // node:test, jest, vitest, mocha, jasmine
  /^\s*def\s+test_\w+\s*\(/m,                       // pytest
  /^\s*(?:async\s+)?def\s+test\w*\s*\(\s*self/m,    // unittest methods
  /\bclass\s+Test\w+\s*[(:]/,                       // unittest / pytest classes
  /^\s*func\s+(?:Test|Benchmark|Fuzz)\w+\s*\(/m,    // go
  /@Test\b/,                                        // junit, testng
  /#\[\s*test\s*\]/,                                // rust
  /\[\s*Test(?:Method)?\s*\]/,                      // nunit, mstest
  /^\s*public\s+function\s+test\w+/m,               // phpunit
  /^\s*func\s+test\w*\s*\(/m,                       // swift xctest
  /\b(?:XCTAssert\w*|assertEquals|assertThat|assertTrue|EXPECT_\w+|ASSERT_\w+)\s*\(/,
  /\bTEST(?:_F|_P|_CASE)?\s*\(/,                    // googletest, catch2
  /\[\s*(?:Fact|Theory)\s*\]/,                      // xunit
  /^\s*def\s+test_\w+/m,                            // ruby minitest, parentheses optional
  /\bclass\s+\w+\s*:\s*\w*Spec\b/,                  // kotest
  /^\s*(?:it|describe|context|specify)\s+["']/m,    // RSpec blocks take no parentheses
  /^\s*test\s+["']/m,                               // elixir exunit: `test "name" do`
  /\buse\s+ExUnit\.Case\b/,                         // elixir test module
  /\(\s*deftest\b/,                                 // clojure.test
  /\(\s*is\s+\(/,                                   // clojure.test assertion
  /^\s*(?:spec|main)\s*::\s*(?:IO\s*\(\)|Spec)\b/m, // haskell hspec entry point
  /\bshouldBe\b|\bshouldSatisfy\b|\b@\?=\b/,        // hspec / HUnit assertions
  /^\s*prop_\w+/m,                                  // quickcheck properties
  /\b(?:is|ok|is_deeply|done_testing|plan)\s*\(/,   // perl Test::More
  /^\s*void\s+main\s*\(\s*\)\s*\{[\s\S]{0,200}?\b(?:test|group)\s*\(/m,  // dart test entry
  /^\s*-\s*\(\s*void\s*\)\s*test\w+/m,              // objective-c XCTest methods
  // `expect(` belongs to a test framework in a way a bare `assert(` does not: Jest and RSpec write
  // assertions that way and production code almost never does.
  /(?<![.\w$])expect\s*\(/,
  // A NAMESPACED assertion, which is what the rest of them look like: assert.equal,
  // assert.deepStrictEqual, chai.expect, t.is, self.assertEqual. This replaces a bare
  // `assert\w*\s*\(`, which was wrong in both directions at once: it missed every namespaced form,
  // so an honest suite written entirely in `assert.equal(...)` was demoted to source and its
  // project reported as untested; and it accepted a defensive `assert(payload)` in production code
  // as proof that the requirement was checked.
  /(?<![.\w$])(?:assert|expect|should|chai|t|self)\s*\.\s*\w+\s*\(/
];

const exportPatterns = [
  /\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
  /\bexport\s+(?:const|let|var|class)\s+([A-Za-z_$][\w$]*)/g,
  /\bexport\s+default\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/g,
  /\bexport\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/gm,          // export default identifier
  /\bexport\s*\{([^}]*)\}/g,
  /\bmodule\.exports\s*=\s*\{([^}]*)\}/g,                        // CommonJS object form
  /\bmodule\.exports\.([A-Za-z_$][\w$]*)/g,
  /\bmodule\.exports\s*=\s*([A-Za-z_$][\w$]*)\s*;?\s*$/gm,
  /\bexports\.([A-Za-z_$][\w$]*)/g,
  /^\s*(?:async\s+)?def\s+([A-Za-z_][\w]*)/gm,                   // python, ruby
  /^\s*class\s+([A-Za-z_][\w]*)/gm,
  /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_][\w]*)\s*\(/gm,         // go, including methods
  /^\s*pub\s+(?:async\s+)?fn\s+([A-Za-z_][\w]*)/gm,              // rust
  /\b(?:public|internal|protected)\s+(?:static\s+)?[\w<>\[\],\s]+?\s+([A-Za-z_][\w]*)\s*\(/g,
  /^\s*(?:public\s+|private\s+|protected\s+)?function\s+([A-Za-z_][\w]*)\s*\(/gm,
  // Kotlin, Swift, Rust types and C/C++ were listed as supported languages while exporting nothing,
  // so honest projects in them could never reach `traced`. A language in the list without an export
  // rule and a test rule silently refuses every project written in it.
  /^\s*(?:public\s+|internal\s+|private\s+)?(?:suspend\s+)?fun\s+([A-Za-z_][\w]*)/gm,
  /^\s*(?:public\s+|open\s+|private\s+)?func\s+([A-Za-z_][\w]*)/gm,
  /^\s*(?:pub\s+)?(?:struct|enum|trait|impl|protocol|interface|object)\s+([A-Za-z_][\w]*)/gm,
  // Rewritten 2026-09-11. The old pattern's lazy `[\w:<>*&\s]*?` overlapped the `\**\s*`
  // that followed it, so the capture could start one character INTO the name: `render()` was
  // extracted as `ender` and `fetchLedger` as `etchLedger` - symbols that do not exist, reported
  // in receipts. Because the class contained `\s`, the lazy run also crossed newlines, which
  // made it quadratic: a reviewer measured 5.5s in this one regex on a correct 256KB .vue file.
  // A declaration now needs a real whitespace-separated type token before the name, and the run
  // cannot leave its line.
  /^[ \t]*(?:(?:static|inline|extern|public|private|protected|virtual|override)[ \t]+)*[A-Za-z_][\w:<>,*&\[\]]*[ \t]*[*&]?[ \t]+([A-Za-z_]\w*)[ \t]*\([^;{()]*\)[ \t]*(?:const[ \t]*)?\{/gm,
  /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g,
  // Added 2026-09-11 alongside the six new languages. Each of these is the shape that language uses
  // to name the thing a test would call; without it the language is readable and still untraceable.
  /^\s*def(?:p|macro)?\s+([a-z_][\w?!]*)/gm,                    // elixir def/defp/defmacro
  /^\s*defmodule\s+([A-Za-z_][\w.]*)/gm,                        // elixir modules
  /\(\s*def(?:n|n-|record|protocol)?\s+\^?:?([a-z_][\w*+!?<>=-]*)/g,  // clojure defn/def/defrecord
  /^([a-z_][\w']*)\s*::/gm,                                     // haskell type signatures
  /^\s*sub\s+([A-Za-z_]\w*)/gm,                                 // perl subs
  /^\s*(?:[A-Za-z_][\w<>,?\[\]]*\s+)+([a-z_]\w*)\s*\([^;)]*\)\s*(?:async\s*)?\{/gm,  // dart
  /^\s*[-+]\s*\(\s*[^)]*\)\s*([A-Za-z_]\w*)/gm                  // objective-c methods
];

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function classifyEvidence(relative) {
  const lower = relative.toLowerCase();
  const extension = path.extname(lower);
  // CONTENT TYPE BEATS LOCATION. This ordering is the fix for deception class B: the previous
  // version checked the path first, so tests/PLAN.md, spec/notes.md and test/fixtures/cases.json
  // were all classified as tests, and prose became evidence again through a directory name.
  if (proseExtensions.has(extension)) return 'prose';
  if (configExtensions.has(extension)) return 'config';
  if (markupExtensions.has(extension)) return 'markup';
  if (nonImplementationPatterns.some((pattern) => pattern.test(lower))) return 'markup';
  if (testPathPatterns.some((pattern) => pattern.test(lower))) return 'test';
  return 'source';
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

// `skipped` collects the extensions this tool cannot read. Without it, a project written entirely
// in a language the gate does not know is indistinguishable from an empty project, and the receipt
// tells the author to implement work they already finished.
async function walk(root, files = [], skipped = new Set()) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files, skipped);
    } else {
      const extension = path.extname(entry.name).toLowerCase();
      if (readableExtensions.has(extension)) files.push(full);
      else if (extension) skipped.add(extension);
    }
  }
  return files;
}

// ---------------------------------------------------------------------------------------------
// THE SCANNER
//
// One left-to-right pass that answers "is this position code, a comment, or a string?", replacing
// four separate regexes that each answered it differently and each was wrong in its own direction.
// Two independent reviewers found holes on both sides of those regexes:
//
//   `});//call()`            a comment kept, because the pattern demanded whitespace before `//`
//   `x = a // b` in Python   an assertion destroyed, because `//` is integer division there
//   `/it's/` in JavaScript   one apostrophe in a regex literal switched string handling off for
//                            the rest of the file, disabling the check for everything below it
//   nested /* /* */ */       Kotlin, Swift, Scala and Rust allow nesting; a flat pattern closes at
//                            the first `*/` and treats the tail of the comment as code
//
// All four are the same defect: a regex cannot hold state, and comments and strings ARE state.
//
// Output preserves length and line structure, with comment and string interiors replaced by spaces,
// so every consumer downstream - tokenizing, live-test detection, symbol export, the exercise check
// - reads exactly the same view of the file, and line-based logic still lines up.
const NEST = true;
const SYNTAX_PROFILES = {
  js:     { line: ['//'], block: [['/*', '*/']], nested: false, quotes: ['"', "'", '`'], regex: true },
  cfam:   { line: ['//'], block: [['/*', '*/']], nested: false, quotes: ['"', "'"], regex: false },
  // Go's backtick raw string is a string, and leaving it out meant a URL inside one was scanned as
  // code. The mutation matrix found this by way of the `http://` guard, which was the only thing
  // stopping the rest of such a line being eaten as a comment.
  go:     { line: ['//'], block: [['/*', '*/']], nested: false, quotes: ['"', '`', "'"], regex: false },
  // Kotlin, Swift and Scala all specify NESTED block comments and a `"""` multiline string.
  nested: { line: ['//'], block: [['/*', '*/']], nested: NEST, quotes: ['"""', '"', "'"], regex: false },
  // Rust nests block comments too but has no `"""`, and a bare `'` is a lifetime far more often
  // than a char literal, so its quote list must not be shared with Kotlin's.
  rust:   { line: ['//'], block: [['/*', '*/']], nested: NEST, quotes: ['"'], regex: false },
  py:     { line: ['#'], block: [], nested: false, quotes: ['"""', "'''", '"', "'"], regex: false },
  ruby:   { line: ['#'], block: [['=begin', '=end']], nested: false, quotes: ['"', "'"], regex: false },
  php:    { line: ['//', '#'], block: [['/*', '*/']], nested: false, quotes: ['"', "'"], regex: false },
  // Elixir heredocs are `"""`, and `#` is its only comment form.
  elixir: { line: ['#'], block: [], nested: false, quotes: ['"""', '"', "'"], regex: false },
  // Clojure comments to end of line with `;`. A bare `'` is a quote form, never a string.
  clojure: { line: [';'], block: [], nested: false, quotes: ['"'], regex: false },
  // Haskell nests `{- -}` and has no single-quoted string worth tracking: `'a'` is a char and `'`
  // is also a legal identifier character (`xs'`), which makes treating it as a quote actively wrong.
  haskell: { line: ['--'], block: [['{-', '-}']], nested: NEST, quotes: ['"'], regex: false },
  // Perl's POD blocks run from `=pod`/`=head` to `=cut` and are documentation, not code.
  perl:   { line: ['#'], block: [['=pod', '=cut'], ['=head', '=cut']], nested: false,
            quotes: ['"', "'"], regex: false },
  // Dart nests block comments, like Kotlin, and has both triple-quoted forms.
  dart:   { line: ['//'], block: [['/*', '*/']], nested: NEST, quotes: ['"""', "'''", '"', "'"],
            regex: false },
  objc:   { line: ['//'], block: [['/*', '*/']], nested: false, quotes: ['"', "'"], regex: false },
  // `.m` is Objective-C to one population and MATLAB to another. MATLAB comments with `%`, which is
  // modulo in C, so one profile cannot serve both: guessing wrong either eats a line of arithmetic
  // or reads a block of commentary as code. scanCode sniffs the content instead of the extension.
  matlab: { line: ['%'], block: [['%{', '%}']], nested: false, quotes: ["'", '"'], regex: false }
};

const EXTENSION_SYNTAX = {
  '.js': 'js', '.mjs': 'js', '.cjs': 'js', '.jsx': 'js', '.ts': 'js', '.tsx': 'js',
  '.mts': 'js', '.cts': 'js', '.vue': 'js', '.svelte': 'js',
  '.kt': 'nested', '.kts': 'nested', '.swift': 'nested', '.scala': 'nested',
  '.rs': 'rust',
  '.py': 'py', '.rb': 'ruby', '.php': 'php',
  '.go': 'go', '.java': 'cfam', '.cs': 'cfam',
  '.c': 'cfam', '.h': 'cfam', '.cpp': 'cfam', '.hpp': 'cfam', '.cc': 'cfam', '.hh': 'cfam',
  '.ex': 'elixir', '.exs': 'elixir',
  '.clj': 'clojure', '.cljs': 'clojure', '.cljc': 'clojure',
  '.hs': 'haskell',
  '.pl': 'perl', '.pm': 'perl', '.t': 'perl',
  '.dart': 'dart',
  '.mm': 'objc'
  // `.m` is deliberately absent: it is resolved by content in scanCode.
};

// Objective-C announces itself unambiguously, and MATLAB does not, so the test is for Objective-C
// and MATLAB is the fallback. Getting this backwards would read MATLAB's `%` commentary as code.
const OBJC_MARKERS = /^\s*(?:#import\b|#include\b|@(?:interface|implementation|protocol|import)\b)/m;

function profileFor(extension, text) {
  if (extension === '.m') return OBJC_MARKERS.test(text) ? 'objc' : 'matlab';
  return EXTENSION_SYNTAX[extension] ?? 'cfam';
}

// A `/` begins a regex literal rather than division when the previous meaningful character cannot
// end an expression. Without this, `const re = /it's/` reads as the start of a string.
//
// `<` is deliberately NOT in this set, though it is a valid regex position in plain JavaScript.
// Every JSX closing tag is `</`, so treating `<` as a preceder started a phantom regex on every
// closing tag that ran to the end of the line and ate whatever followed. `a < /re/.test(b)` is the
// only thing this costs, and nobody writes it. `>` stays, because `(x) => /re/.test(x)` is ordinary.
const REGEX_PRECEDERS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+',
                                 '-', '*', '%', '>', '~', '^', '\n', '']);

// Keywords after which a `/` starts a regex rather than dividing. `lastSignificant` is a single
// character, which cannot tell `return` from an identifier ending in `n`.
const KEYWORD_PRECEDERS = new Set(['return', 'case', 'typeof', 'instanceof', 'in', 'of', 'new',
                                   'delete', 'do', 'else', 'yield', 'await', 'void', 'throw']);

// The identifier immediately before the current position, if any. Only the tail of the emitted
// output is examined, because the longest keyword above is ten characters.
function trailingWord(emitted) {
  const match = /([A-Za-z_$][\w$]*)\s*$/.exec(emitted.slice(-24));
  return match ? match[1] : '';
}

function blankOut(source, start, end) {
  // Keep newlines so line numbers and line-based checks survive; blank everything else.
  let out = '';
  for (let i = start; i < end && i < source.length; i += 1) out += source[i] === '\n' ? '\n' : ' ';
  return out;
}

// Returns { code, allStrings }.
//
//   code        comments and ALL string interiors blanked, with `${...}` interpolations scanned as
//               the code they are. This decides what is exported, whether a live test exists, and
//               whether a test exercises a symbol - and it is the ONLY view a source file's
//               requirement vocabulary may come from.
//   allStrings  the contents of every string literal, used only when measuring a TEST. A test's
//               descriptive name is where most suites put the requirement's words, and it can
//               corroborate a trace but never create one, because the test still has to exercise a
//               symbol donated by a source file that carried the requirement in its own code.
//
// A third view once existed - strings with no whitespace, admitted as "names" to top up SOURCE
// vocabulary - to stop an honest Python dict keyed `mismatches` being refused. It was a smuggling
// route: the requirement sentence written with dots instead of spaces is one whitespace-free
// "name", and a reviewer got eight false passes through it. It is gone rather than bounded, and
// the honest cases it protected are now covered by a source threshold that does not demand a file
// repeat half the sentence. Strings cannot establish that code exists. Nothing about that is a
// judgement call any more.
function scanCode(text, extension) {
  const profile = SYNTAX_PROFILES[profileFor(extension, text)];
  const allStrings = [];
  let out = '';
  let i = 0;
  let lastSignificant = '';
  const starts = (token, at) => text.startsWith(token, at);

  while (i < text.length) {
    // ---- block comments, with nesting where the language allows it
    const block = profile.block.find(([open]) => starts(open, i));
    if (block) {
      const [open, close] = block;
      let depth = 1;
      let j = i + open.length;
      while (j < text.length && depth > 0) {
        if (profile.nested && starts(open, j)) { depth += 1; j += open.length; continue; }
        if (starts(close, j)) { depth -= 1; j += close.length; continue; }
        j += 1;
      }
      out += blankOut(text, i, j);
      i = j;
      continue;
    }

    // ---- line comments
    const line = profile.line.find((marker) => starts(marker, i));
    if (line) {
      // This branch used to carry an exemption: `//` immediately after a colon was not treated as
      // a comment, so that `http://` survived. REMOVED 2026-09-10 after an independent reviewer
      // demonstrated it as a critical false pass and I reproduced it. `default://<the requirement
      // sentence>` is valid JavaScript, and the exemption emitted that prose into the CODE view,
      // where it supplied every one of the requirement's tokens. Five idiomatic forms trigger it:
      // `case 'x'://p`, `a ? b ://p`, `let x://p`, `{ a://p`, `default://p`. Only the space is
      // missing compared to an ordinary comment.
      //
      // It protected nothing. By the time this line runs, a URL in real code is already inside a
      // string that will be blanked, or inside a comment that started at an earlier `//`. The
      // reviewer diffed the three cases it claimed to protect and found them byte-identical with
      // the exemption gone, and so did the suite.
      let j = text.indexOf('\n', i);
      if (j === -1) j = text.length;
      out += blankOut(text, i, j);
      i = j;
      continue;
    }

    // ---- strings, longest delimiter first so `"""` beats `"`
    const quote = profile.quotes.find((q) => starts(q, i));
    if (quote) {
      let j = i + quote.length;
      let closed = false;
      while (j < text.length) {
        if (text[j] === '\\') { j += 2; continue; }
        if (starts(quote, j)) { j += quote.length; closed = true; break; }
        // A single-character quote does not span lines in any language here, so an unterminated
        // one ends at the newline. This is what stops one stray apostrophe eating a whole file.
        if (quote.length === 1 && quote !== '`' && text[j] === '\n') break;
        j += 1;
      }
      // CONTAINMENT. Any scanner this thin will mis-lex somewhere; the rule is that a mis-lex must
      // never cost more than one line. A template literal was exempt from the newline bail because
      // it legitimately spans lines, so `return /`/.test(s)` - where the backtick is inside a regex
      // the scanner did not recognise - opened a template literal that swallowed the rest of the
      // FILE. That is the same whole-file poison as the original `/it's/` bug, reached through the
      // backtick instead of the apostrophe. A literal that never closes means the scanner has lost
      // its place, so it gives up at the end of its own line rather than silently eating the file.
      if (!closed) {
        const endOfLine = text.indexOf('\n', i);
        j = endOfLine === -1 ? text.length : endOfLine;
      }
      const interiorEnd = closed ? Math.max(i + quote.length, j - quote.length) : j;
      const inner = text.slice(i + quote.length, interiorEnd);
      if (inner.length > 1) allStrings.push(inner);
      // A `${...}` span inside a template literal is CODE, not string content, and blanking it with
      // the surrounding literal hid every call made inside one. `assert.equal(`${reconcile(a)}`, b)`
      // read as a test that exercised nothing. The expression is scanned as code in its own right,
      // recursively, so a string nested inside an interpolation is still treated as a string and
      // cannot smuggle prose back into the code view.
      if (quote === '`') {
        out += ' '.repeat(quote.length);
        let k = i + quote.length;
        while (k < interiorEnd) {
          if (text[k] === '$' && text[k + 1] === '{') {
            let depth = 1;
            let end = k + 2;
            while (end < interiorEnd && depth > 0) {
              if (text[end] === '{') depth += 1;
              else if (text[end] === '}') depth -= 1;
              end += 1;
            }
            const expression = text.slice(k + 2, depth === 0 ? end - 1 : end);
            const nested = scanCode(expression, extension);
            if (nested.allStrings) allStrings.push(nested.allStrings);
            out += `  ${nested.code}${depth === 0 ? ' ' : ''}`;
            k = end;
            continue;
          }
          out += text[k] === '\n' ? '\n' : ' ';
          k += 1;
        }
        if (closed) out += ' '.repeat(quote.length);
      } else {
        out += blankOut(text, i, j);
      }
      i = j;
      continue;
    }

    // ---- regex literals, JavaScript only
    // A keyword can precede a regex just as punctuation can, and `return /`/.test(s)` is ordinary
    // code. Looking only at the last CHARACTER saw `n` there and called it division, which left the
    // backtick to open a template literal. The last significant word is checked too.
    if (profile.regex && text[i] === '/' &&
        (REGEX_PRECEDERS.has(lastSignificant) || KEYWORD_PRECEDERS.has(trailingWord(out)))) {
      let j = i + 1;
      let inClass = false;
      while (j < text.length && text[j] !== '\n') {
        if (text[j] === '\\') { j += 2; continue; }
        if (text[j] === '[') inClass = true;
        else if (text[j] === ']') inClass = false;
        else if (text[j] === '/' && !inClass) { j += 1; break; }
        j += 1;
      }
      out += blankOut(text, i, j);
      i = j;
      continue;
    }

    out += text[i];
    if (!/\s/.test(text[i])) lastSignificant = text[i];
    else if (text[i] === '\n') lastSignificant = '\n';
    i += 1;
  }
  return { code: out, allStrings: allStrings.join(' ') };
}

// Names belonging to the test harness itself, which must never be donated as the subject under
// test. A source file exporting a function called `ok` turned every `assert.ok(...)` in every test
// into evidence that the requirement was exercised, so renaming one function defeated the gate.
const harnessNames = new Set([
  'ok', 'is', 'not', 'test', 'it', 'expect', 'describe', 'assert', 'equal', 'equals', 'deepequal',
  'strictequal', 'notequal', 'match', 'throws', 'fail', 'pass', 'run', 'before', 'after',
  'beforeeach', 'aftereach', 'should', 'verify', 'check', 'setup', 'teardown', 'suite'
]);

function exportedSymbols(code) {
  const found = new Set();
  for (const pattern of exportPatterns) {
    for (const match of code.matchAll(pattern)) {
      for (const part of (match[1] ?? '').split(',')) {
        const name = part.split(/\s+as\s+/i).pop().trim().replace(/[:=].*$/, '').trim();
        // Clojure, Elixir, Ruby and Scheme all put `-`, `?`, `!` or `*` inside ordinary names.
        // The old filter accepted only JavaScript identifiers, so every Clojure symbol was
        // discarded and no Clojure project could ever be traced.
        if (/^[A-Za-z_$][\w$?!*-]*$/.test(name) && name.length >= 2 &&
            !harnessNames.has(name.toLowerCase())) found.add(name);
      }
    }
  }
  return found;
}

function hasLiveTest(code) {
  return liveTestPatterns.some((pattern) => pattern.test(code));
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Deception class A. `code.includes(symbol)` accepted a symbol that appeared in a comment, inside a
// string, or in an unused import. A test is evidence when it CALLS the thing or asserts about it,
// so that is what is checked, against code with comments and strings already removed.
const DECLARATION_VIEW_CACHE_LIMIT = 64;

// Keywords that introduce a definition rather than a use, across every language this tracer reads.
const DECLARATION_KEYWORDS = 'function|func|fn|def|sub|proc|class|struct|enum|trait|interface|' +
  'object|impl|protocol|record|const|let|var|val|type|module|namespace|package';

// A definition is not an exercise, and treating it as one made the gate vacuous for every language
// that keeps its tests beside its source. Measured 2026-09-10: a Rust file whose `#[cfg(test)] mod
// tests` asserted NOTHING reached `traced`, because `fn reconcile_x(` satisfies "the symbol appears
// followed by an open paren" just as well as a real call does. Same for Python, same for Go. The
// declaration sites are blanked before the question is asked, so only a genuine use can answer it.
// The span between the keyword and the name may only cross whole words on the SAME line - modifiers
// like `pub`, `async`, `static`, a Go receiver `(r *Reconciler)`, a Rust generic list. A first
// version allowed any characters including newlines and commas, and it swallowed
// `def test_x\n  assert_equal 1, reconcile_carrier_payroll(...)` in Ruby, refusing honest work. A
// declaration and its name sit on one line in every language here; a call two lines later does not.
function withoutDeclarations(code, symbol) {
  const escaped = escapeForRegExp(symbol);
  const modifier = `(?:[\\w$<>\\[\\]:&*?.'-]+|\\([^)\\n]*\\))[ \\t]+`;
  const keyworded = new RegExp(
    `(?:${DECLARATION_KEYWORDS})[ \\t]+(?:${modifier})*${escaped}(?![\\w$])`, 'g');
  // C#, Java, C and C++ declare a method with a return type and no keyword at all, so the rule
  // above never fires and a single-file project passed with a test asserting nothing - measured on
  // both C# `[Test]` and Java `@Test`. A definition sits at the start of a line, carries at least
  // one type word before the name, and ends in `{` or `;`. A call has neither the line position nor
  // the type prefix: `var x = Name(y);` is blocked by the `=`, and `Obj.Name(y)` by the missing
  // space after the dot.
  const typed = new RegExp(
    `^[ \\t]*(?:[A-Za-z_][\\w<>\\[\\],.?]*[ \\t]+)+${escaped}[ \\t]*\\([^;()]*\\)[ \\t]*` +
    `(?:const[ \\t]*)?[{;]`, 'gm');
  // Objective-C declares a method as `- (void)name {` - no keyword, and no parentheses after the
  // name - so neither rule above touched it, and `name {` satisfied the "symbol followed by an
  // opening brace" call test. An XCTest method that asserted nothing was therefore exercised by its
  // own signature, which is how this fixture passed with the wrong syntax profile forced on it.
  const selector = new RegExp(`^[ \\t]*[-+][ \\t]*\\([^)\\n]*\\)[ \\t]*${escaped}(?![\\w$])`, 'gm');
  return code
    .replace(keyworded, (match) => ' '.repeat(match.length))
    .replace(typed, (match) => match.replace(new RegExp(escaped, 'g'), ' '.repeat(symbol.length)))
    .replace(selector, (match) => ' '.repeat(match.length));
}

// `item` rather than a bare string, so the declaration-blanked view can be cached ON the evidence
// item. This function is called once per (requirement x test file) and loops every candidate
// symbol, and blanking declarations rewrites the whole file each time. Measured by a reviewer at
// 1,000 files: 30.8s before the blanking pass existed, 76.3s after. The work is identical every
// time for a given file and symbol, so it is done once.
function testExercises(item, symbols) {
  // `item.code` has already been through the scanner, so comments and string interiors are blank.
  // There is no second stripping pass and no second opinion about what counts as code.
  // Bounded, because each entry is a whole copy of the file: an unbounded cache on a project with
  // thousands of donated symbols would hold files x symbols x filesize in memory, trading a
  // measured 17% of runtime for an unmeasured amount of heap. Most files have a handful of
  // candidate symbols and never reach the cap; the pathological ones give the cache up rather than
  // the process.
  const cache = (item.declarationViews ??= new Map());
  for (const symbol of symbols) {
    let bare = cache.get(symbol);
    if (bare === undefined) {
      bare = withoutDeclarations(item.code, symbol);
      if (cache.size < DECLARATION_VIEW_CACHE_LIMIT) cache.set(symbol, bare);
    }
    const lines = bare.split('\n');
    const escaped = escapeForRegExp(symbol);
    // `\b` before a `$` never matches, because `$` is not a word character, so every `$`-prefixed
    // export was invisible to this check. A lookbehind for "not a symbol character" works for both.
    // Every one of these is "a call" in some language, and the first four are all C-shaped. A gate
    // that only recognises `name(` silently refuses whole language families whose call syntax does
    // not use parentheses at the call site.
    const called = new RegExp(`(?<![\\w$])${escaped}\\s*\\(`).test(bare) ||
      new RegExp(`\\.\\s*${escaped}\\s*\\(`).test(bare) ||
      new RegExp(`(?<![\\w$])${escaped}\\s*\\.\\s*\\w+\\s*\\(`).test(bare) ||
      new RegExp(`(?<![\\w$])${escaped}\\s*[<{(]`).test(bare) ||
      // Lisp: the operator sits inside the parenthesis, `(reconcile-carrier-payroll rows)`.
      (item.syntax === 'clojure' &&
        new RegExp(`\\(\\s*${escaped}(?![\\w$?!*-])`).test(bare)) ||
      // Objective-C message send: `[subject reconcileCarrierPayroll:rows]`. Restricted to
      // Objective-C because `name:` in JavaScript is an object key, which is a mention, not a use.
      (item.syntax === 'objc' &&
        new RegExp(`\\[[^\\]\\n]*?(?<![\\w$])${escaped}\\s*:`).test(bare)) ||
      // Haskell and Elm apply by juxtaposition: `reconcileCarrierPayroll carrier payroll`. Requiring
      // an argument after the name keeps a bare mention from counting.
      (item.syntax === 'haskell' &&
        new RegExp(`(?<![\\w$'])${escaped}\\s+[\\w("\\[]`).test(bare));
    if (called) return symbol;
    // An assertion ABOUT the symbol counts, because a test can legitimately assert on an exported
    // constant without calling anything. A bare truthiness check does not: `assert.ok(glossary)`
    // proves the import resolved and nothing else, and it is exactly how a dictionary of the spec's
    // own vocabulary was passing itself off as an implementation.
    const trivial = new RegExp(
      `(?:assert(?:\\.ok|\\.isOk|\\.isDefined)?|expect)\\s*\\(\\s*${escaped}\\s*\\)\\s*` +
      `(?:;|$|\\.(?:toBeTruthy|toBeDefined|toBeInstanceOf)\\s*\\()`, 'm');
    const asserted = lines.some((line) =>
      // No trailing boundary: hspec writes `shouldBe`, `shouldSatisfy`, `shouldReturn`, and
      // `should` followed by a capital never matched.
      /\b(?:assert\w*|expect\w*|should\w*|verify\w*|refute\w*)/i.test(line) &&
      new RegExp(`\\b${escaped}\\b`).test(line) &&
      !trivial.test(line));
    if (asserted) return symbol;
  }
  return null;
}

const stopWords = new Set([
  'about', 'after', 'against', 'also', 'before', 'being', 'between', 'button', 'could', 'every',
  'from', 'have', 'into', 'must', 'need', 'needs', 'only', 'should', 'that', 'their', 'there',
  'this', 'through', 'user', 'with', 'without', 'work'
]);

function tokenize(text) {
  // Identifiers are split before lowercasing, so `reconcileCarrierPayroll` yields reconcile,
  // carrier and payroll instead of one meaningless token. Without this the tracer cannot see the
  // vocabulary of the code it is tracing.
  const split = text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    // Kebab-case is the third convention, and Clojure, Lisp and CSS use it exclusively. Without
    // this, `reconcile-carrier-payroll` stayed one token and matched none of the spec's words.
    .replace(/[_-]+/g, ' ')
    .toLowerCase();
  return [...split.matchAll(/[a-z][a-z0-9-]{2,}/g)]
    .map((match) => match[0].replace(/^-+|-+$/g, ''))
    .filter((token) => token.length >= 4 && !stopWords.has(token))
    .map(stem);
}

// Light stemming, applied to BOTH the requirement and the code so the comparison stays symmetric.
// Without it a requirement saying "flag mismatches" did not match an implementation that named
// things `flagged` and `mismatch`, and honest code was refused for choosing a different inflection.
// Deliberately conservative: no dictionary, no irregulars, nothing that changes a word's meaning.
function stem(token) {
  let out = token;
  if (out.length > 5 && out.endsWith('ies')) out = `${out.slice(0, -3)}y`;
  else if (out.length > 5 && out.endsWith('es')) out = out.slice(0, -2);
  else if (out.length > 4 && out.endsWith('s') && !out.endsWith('ss')) out = out.slice(0, -1);
  if (out.length > 5 && out.endsWith('ing')) out = out.slice(0, -3);
  else if (out.length > 4 && out.endsWith('ed')) out = out.slice(0, -2);
  // `flagged` -> `flagg` -> `flag`: a doubled final consonant is an inflection artefact.
  if (out.length > 3 && /([bdfglmnprt])\1$/.test(out)) out = out.slice(0, -1);
  return out;
}

function extractRequirements(text) {
  const requirements = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    const checkbox = trimmed.match(/^[-*]\s+\[[ xX]\]\s+(.+)$/);
    const match = checkbox
      ? checkbox
      : trimmed.match(/^[-*]\s+(REQ[-_ ]?\d+|AC[-_ ]?\d+|Requirement|Acceptance Criteria)\s*[:.-]\s+(.+)$/i) ??
        trimmed.match(/^(REQ[-_ ]?\d+|AC[-_ ]?\d+|Requirement|Acceptance Criteria)\s*[:.-]\s+(.+)$/i);
    if (!match) continue;
    let idCandidate = null;
    let textValue = match[1];
    if (checkbox) {
      const checkboxText = match[1].trim();
      const idMatch = checkboxText.match(/^(REQ[-_ ]?\d+|AC[-_ ]?\d+)\s*[:.-]\s+(.+)$/i);
      if (idMatch) {
        idCandidate = idMatch[1];
        textValue = idMatch[2];
      }
    } else if (match[1] && /^(REQ|AC)/i.test(match[1])) {
      idCandidate = match[1];
      textValue = match[2];
    }
    const id = idCandidate?.replace(/\s+/g, '-').toUpperCase() ?? `REQ-${String(requirements.length + 1).padStart(3, '0')}`;
    requirements.push({
      id,
      line: index + 1,
      text: textValue.trim(),
      tokens: [...new Set(tokenize(textValue))]
    });
  }
  return requirements;
}

async function findDefaultSpec(target) {
  const candidates = ['PRD.md', 'docs/PRD.md', '.midas/PRD.md', '.midas/planning/PRD.md'];
  for (const candidate of candidates) {
    const file = path.join(target, candidate);
    if (await exists(file)) return file;
  }
  const workorders = path.join(target, '.midas', 'workorders');
  if (await exists(workorders)) {
    const files = (await fs.readdir(workorders)).filter((file) => file.endsWith('.md')).sort().reverse();
    if (files[0]) return path.join(workorders, files[0]);
  }
  return null;
}

function parseList(value) {
  if (!value) return [];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

async function loadEvidenceFiles(target, specFile, explicitFiles) {
  // Deception class D: --evidence-files accepted any path, so a caller could point the gate at
  // another repository's implementation and pass a project containing only a spec. Evidence has to
  // live inside the project under test and be a file type this tool can actually read.
  const rejected = [];
  const skippedExtensions = new Set();
  let files;
  if (explicitFiles.length > 0) {
    files = [];
    for (const entry of explicitFiles) {
      const resolved = path.resolve(target, entry);
      const relative = path.relative(target, resolved);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        rejected.push({ file: entry, reason: 'outside the project directory' });
        continue;
      }
      // Resolving the path is not enough: a junction or symlink inside the project points outward
      // while every path component still looks local. Compare the REAL paths, which is the only
      // question that matters - is this file actually inside the project being verified.
      try {
        const realTarget = await fs.realpath(target);
        const realFile = await fs.realpath(resolved);
        const realRelative = path.relative(realTarget, realFile);
        if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
          rejected.push({ file: entry, reason: 'resolves outside the project through a link' });
          continue;
        }
      } catch {
        rejected.push({ file: entry, reason: 'could not be resolved on disk' });
        continue;
      }
      if (!readableExtensions.has(path.extname(resolved).toLowerCase())) {
        rejected.push({ file: entry, reason: 'not a file type this check can read' });
        continue;
      }
      files.push(resolved);
    }
  } else {
    files = await walk(target, [], skippedExtensions);
  }

  const normalizedSpec = path.resolve(specFile);
  const evidence = [];
  for (const file of files) {
    if (path.resolve(file) === normalizedSpec) continue;
    if (!await exists(file)) continue;
    const relative = normalizePath(path.relative(target, file));
    let text;
    try {
      text = await fs.readFile(file, 'utf8');
    } catch (error) {
      // An unreadable file is reported, never silently treated as empty. The previous version
      // swallowed every read error into "" and a permission failure looked like a clean non-match.
      rejected.push({ file: relative, reason: `unreadable: ${error.code ?? error.message}` });
      continue;
    }
    let kind = classifyEvidence(relative);
    const extension = path.extname(relative).toLowerCase();
    const scanned = kind === 'source' || kind === 'test'
      ? scanCode(text, extension)
      : { code: text, allStrings: '' };
    const code = scanned.code;
    const live = (kind === 'source' || kind === 'test') && hasLiveTest(code);
    // A file the PATH called a test but that contains no test is an implementation that happens to
    // live under spec/. Refusing it was one of the false refusals; content decides here too.
    if (kind === 'test' && !live) kind = 'source';
    evidence.push({
      relative,
      code,
      kind,
      syntax: profileFor(extension, text),
      // A source file may hold its own tests. Rust `#[cfg(test)]`, Go `_test.go` beside the package,
      // Django's tests.py and .NET partial classes all do this, and treating source and test as
      // mutually exclusive refused every one of them.
      live,
      // Two tracks, because one was not enough in either direction.
      //
      // `tokens` is the union and is what a TEST is measured against, where a string carrying the
      // domain's words is ordinary and harmless.
      //
      // `codeTokens` excludes every string literal, and it is what a SOURCE file must satisfy to
      // count as an implementation or to donate a symbol. The rule "a string with a space is prose,
      // a string that is one word is a name" is defeated by writing the requirement sentence with
      // dots or underscores instead of spaces, which makes the whole sentence one "name". An
      // independent reviewer got eight false passes through that way - dotted i18n keys, camelCase
      // event names, URL path fragments, a Python dict of the spec's own words - and the shape is
      // reproduced in SCAN-STRING-SMUGGLING. Identifier-shaped strings still count as vocabulary
      // for reporting and for tests; they can no longer be the sole evidence that code exists.

      codeTokens: new Set(tokenize(code)),
      // TEST-side vocabulary, which includes the contents of EVERY string. A test's descriptive
      // name is the place most suites put the requirement's words - `test('reconciles the carrier
      // file against the payroll extract', ...)` - and blanking it as prose refused honest work in
      // bulk. It is safe here and nowhere else: a test still has to exercise a symbol donated by a
      // source file that carried the requirement in its own CODE, so a title can corroborate a
      // trace but can never create one.
      allTokens: new Set(tokenize(`${code} ${scanned.allStrings}`)),
      symbols: kind === 'source' ? exportedSymbols(code) : new Set()
    });
  }
  return { evidence, rejected, skippedExtensions: [...skippedExtensions].sort() };
}

function traceRequirement(requirement, evidence) {
  const tokens = requirement.tokens;
  if (tokens.length === 0) {
    return { status: 'untestable', matchedTokens: [], files: [], testFiles: [], contextFiles: [] };
  }
  // Floor raised from 2 to 3. At two tokens a requirement written in generic vocabulary was
  // satisfied by unrelated code in any real repository (deception class C1).
  const threshold = Math.min(tokens.length, Math.max(3, Math.ceil(tokens.length * 0.34)));
  const testThreshold = Math.min(tokens.length, Math.max(2, Math.ceil(tokens.length * 0.3)));

  const sourceMatches = [];
  const sourceTokens = new Set();
  for (const item of evidence) {
    if (item.kind !== 'source') continue;
    // Strings may SUPPLEMENT a file that already shows the requirement in its code; they may never
    // carry it alone. A Python handler named `reconcile_carrier_payroll` returning a dict keyed
    // `mismatches` and `flagged` is honest work whose vocabulary genuinely straddles both, and
    // dropping its keys refused it. A module whose only content is the requirement sentence written
    // with dots has no code vocabulary at all, and is exactly the smuggling route that got eight
    // false passes through. The floor is what separates them.
    const local = tokens.filter((token) => item.codeTokens.has(token));
    if (local.length === 0) continue;
    sourceMatches.push({ file: item.relative, tokens: local, symbols: item.symbols });
    for (const token of local) sourceTokens.add(token);
  }

  // Deception class C3: symbols were pooled across every source file that shared a single token, so
  // vocabulary could come from an HTML template while the symbol came from an unrelated module.
  // Only a file that genuinely carries the requirement's vocabulary may donate a symbol.
  const subjectSymbols = new Set();
  for (const match of sourceMatches) {
    // The floor is relative, because a requirement reading `Add pagination.` has ONE distinctive
    // token and could never clear a fixed floor of two. For such a requirement, its single token
    // in the donor is the strongest coupling that exists.
    if (match.tokens.length < Math.min(2, tokens.length)) continue;
    for (const symbol of match.symbols) subjectSymbols.add(symbol);
  }

  const testMatches = [];
  const testTokens = new Set();
  const contextFiles = [];
  for (const item of evidence) {
    const local = tokens.filter((token) => item.allTokens.has(token));
    if (local.length === 0) continue;
    // A source file that carries its own tests is test evidence as well. Rust `#[cfg(test)]`, Go's
    // package-local `_test.go`, Django's tests.py and .NET partial classes all lay projects out this
    // way, and treating source and test as mutually exclusive refused every one of them.
    const isTestEvidence = item.kind === 'test' || (item.kind === 'source' && item.live);
    if (!isTestEvidence) {
      if (item.kind !== 'source') contextFiles.push(item.relative);
      continue;
    }
    const exercised = subjectSymbols.size > 0 ? testExercises(item, subjectSymbols) : null;
    if (!exercised) continue;
    testMatches.push({ file: item.relative, tokens: local, symbol: exercised });
    for (const token of local) testTokens.add(token);
  }

  const rank = (list) => list
    .sort((left, right) => right.tokens.length - left.tokens.length)
    .slice(0, 5)
    .map((match) => match.file);

  const implemented = sourceTokens.size >= threshold;
  const exercised = testTokens.size >= testThreshold;

  let status;
  if (!implemented) status = 'gap';
  else if (!exercised) status = 'implemented-untested';
  else status = 'traced';

  return {
    status,
    // Source and test matches are reported separately. Unioning them let the receipt over-report
    // how much of a requirement the implementation actually covered.
    matchedTokens: [...sourceTokens].sort(),
    testMatchedTokens: [...testTokens].sort(),
    files: rank(sourceMatches),
    testFiles: rank(testMatches),
    contextFiles: contextFiles.slice(0, 5)
  };
}

function receiptText(result) {
  const rows = result.requirements.map((requirement) => {
    const files = requirement.files.length > 0 ? requirement.files.join(', ') : 'NONE';
    const tests = (requirement.testFiles ?? []).length > 0 ? requirement.testFiles.join(', ') : 'NONE';
    return `| ${requirement.id} | ${requirement.status} | ${requirement.line} | ${requirement.text.replaceAll('|', '/')} | ${files} | ${tests} |`;
  }).join('\n');

  const rejected = (result.rejectedEvidence ?? []).length > 0
    ? `\n## Evidence that was refused\n\n${result.rejectedEvidence.map((item) => `- ${item.file}: ${item.reason}`).join('\n')}\n`
    : '';

  return `# MIDAS Verification-Gap Receipt

Status: ${result.status}
Generated At: ${result.generatedAt}
Target: ${result.target}
Spec: ${result.spec}
Evidence Files Scanned: ${result.evidenceFiles}
Requirements Audited: ${result.requirements.length}
Gaps Found: ${result.gaps.length}

## Requirement Trace

| ID | Status | Spec Line | Requirement | Source Evidence | Test Evidence |
|---|---|---:|---|---|---|
${rows || '| NONE | fail | 0 | No auditable requirements found. | NONE | NONE |'}

Statuses: \`traced\` means source implements it AND a test calls or asserts on a symbol that source
exports. \`implemented-untested\` means source matched but no qualifying test did, and it does NOT
pass. \`gap\` means no source matched. \`untestable\` means the requirement carried no distinctive
vocabulary to trace.
${rejected}
## What does not count as evidence

Prose, data and markup never establish a requirement, whatever directory they sit in: a Markdown
file inside \`test/\` is still prose. A test counts only when it calls a symbol the matched
implementation exports, or asserts on one, outside strings and comments.

## Claim Ceiling

This is a deterministic traceability check over file contents. It does not execute your tests, so
it cannot prove a matching test asserts the right thing, that it is not skipped at runtime, or that
the implementation it calls does anything. It does not prove runtime correctness, security,
accessibility or release state. Known deceptions it cannot detect are listed in
\`evals/deception/README.md\`; that list is maintained deliberately and is not claimed to be
complete.

## Required Follow-Up

${result.gaps.length === 0 && result.requirements.length > 0
  ? '- No deterministic requirement gaps were found by this check. Continue with tests, build, UI/runtime evidence, and human review where applicable.'
  : result.gaps.map((gap) => gap.status === 'implemented-untested'
      ? `- Write a test that would fail if ${gap.id} broke: ${gap.text}`
      : `- Implement or explicitly waive ${gap.id}: ${gap.text}`).join('\n')}
`;
}

export async function verifyCompletionGap(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const specFile = options.spec ? path.resolve(target, options.spec) : await findDefaultSpec(target);
  const generatedAt = new Date().toISOString();
  if (!specFile || !await exists(specFile)) {
    return {
      status: 'fail',
      generatedAt,
      target,
      spec: specFile ? normalizePath(path.relative(target, specFile)) : 'UNKNOWN',
      evidenceFiles: 0,
      requirements: [],
      gaps: [{
        id: 'SPEC-MISSING',
        status: 'spec-missing',
        text: 'No PRD, work order, or explicit --spec file was available for verification.'
      }],
      rejectedEvidence: [],
      receipt: null
    };
  }

  const specText = await fs.readFile(specFile, 'utf8');
  const requirements = extractRequirements(specText);
  const { evidence, rejected, skippedExtensions } = await loadEvidenceFiles(
    target, specFile, parseList(options['evidence-files'] ?? options.evidenceFiles));
  const traced = requirements.map((requirement) => ({
    ...requirement,
    ...traceRequirement(requirement, evidence)
  }));
  const gaps = traced.filter((requirement) => requirement.status !== 'traced');

  // A spec nothing could be parsed out of is a failure with a NAMED cause. The previous version
  // returned status `fail` with an empty gaps array, so any consumer branching on
  // `gaps.length === 0` read an unparseable spec as success.
  if (requirements.length === 0) {
    gaps.push({
      id: 'SPEC-UNPARSEABLE',
      status: 'spec-unparseable',
      text: 'No auditable requirements were found in the spec. Requirements must be checkbox items ' +
            'or lines prefixed REQ-n, AC-n, Requirement: or Acceptance Criteria:.'
    });
  }

  // UNREAD IS NOT UNWRITTEN. A project written entirely in a language this tool cannot parse used
  // to be reported exactly like an empty one, and the receipt told the author to implement or waive
  // work that was finished and tested. Measured 2026-09-11 across Elixir, Clojure, Haskell, Perl,
  // Dart and Objective-C. Six of those are now readable; this gap is what the SEVENTH gets, and it
  // says which extensions were passed over so the answer is actionable rather than insulting.
  const readSomeCode = evidence.some((item) => item.kind === 'source' || item.kind === 'test');
  if (requirements.length > 0 && !readSomeCode && skippedExtensions.length > 0) {
    gaps.push({
      id: 'NO-READABLE-SOURCE',
      status: 'no-readable-source',
      text: 'No source file in this project is a type this check can read, so nothing here is a ' +
            `statement about whether the work exists. Unread extensions: ${skippedExtensions.join(', ')}. ` +
            'Add the language to sourceExtensions with its comment style, export shape and test ' +
            'convention, or point --evidence-files at the files that implement this.'
    });
  }

  const status = requirements.length > 0 && gaps.length === 0 ? 'pass' : 'fail';
  const reportsDir = path.join(target, '.midas', 'reports');
  await fs.mkdir(reportsDir, { recursive: true });
  const receipt = path.join(reportsDir, 'verification-gap-receipt.md');
  const result = {
    status,
    generatedAt,
    target,
    spec: normalizePath(path.relative(target, specFile)),
    evidenceFiles: evidence.length,
    requirements: traced.map((requirement) => ({
      id: requirement.id,
      line: requirement.line,
      text: requirement.text,
      status: requirement.status,
      matchedTokens: requirement.matchedTokens,
      testMatchedTokens: requirement.testMatchedTokens ?? [],
      files: requirement.files,
      testFiles: requirement.testFiles ?? [],
      contextFiles: requirement.contextFiles ?? []
    })),
    gaps: gaps.map((gap) => ({ id: gap.id, text: gap.text, line: gap.line, status: gap.status })),
    rejectedEvidence: rejected,
    receipt: normalizePath(path.relative(target, receipt))
  };
  await fs.writeFile(receipt, receiptText(result));
  return result;
}
