# The Deception Suite

A completion gate that has never been attacked is a gate nobody has tested.

This suite is a set of fixtures that each fake a finished feature. The gate is expected to refuse
every one of them, to accept honest work, and to be explicit about the deceptions it cannot detect.

```bash
npm run selftest:adversarial
```

## Why it exists

On 2026-09-10 this framework's own verification gate returned `pass` for a project containing a
spec, a `NOTES.md` restating the requirements in prose, and no code at all. The prose file said, in
capitals, that nothing had been implemented. The gate counted word overlap against every file in the
tree, so the prose supplied the vocabulary and cleared the threshold. That is fixture `DEC-001`.

An independent reviewer then attacked the fix and **got sixteen further deceptions through in four
classes**, and found the gate refused every pytest project on earth. Round two of this suite is that
reviewer's work, turned into fixtures.

The reviewer's sharpest finding was not any individual hole. It was that this suite stayed **green**
when three of the four mechanisms it defends were reverted, including the prose rule the whole thing
was written for. Every DEC fixture was being refused by the *test requirement*, so removing the
prose rule changed nothing they measured. The passing check was adjacent to the question that
mattered, inside the artifact built to name that failure.

The `ISO-*` fixtures exist only to fix that, and each is constructed so exactly one mechanism stands
between it and a pass.

## Current score

Reproduce it; do not quote this table without running it.

| | |
|---|---|
| Fixture deceptions refused | **61 / 61** |
| Honest project shapes accepted | **48 / 48** |
| Mechanisms independently pinned | **32** |
| Mutants killed by this suite | **25 killed, 4 subsumed, 0 survived** |
| Known limits, documented below | **3** |

Two commands, and the second is the one that matters:

```
npm run selftest:adversarial   # 113 tests: does the gate get these fixtures right?
npm run selftest:mutants       # 29 mutants: can this suite detect its own defences being removed?
```

**Read that first row precisely.** It says 46 of the 46 fixtures in this suite, and it does not say
the gate catches every deception. Two independent reviewers have each got new ones through after
each round was declared finished, and the honest expectation is that a third would too.

The honest fixtures matter as much as the attacks. Round one reported "3/3 honest work accepted"
from three fixtures that were the same implementation measured three times. Round two reported
"8/8" from eight variants of one project, with a test whose title restated the requirement verbatim,
which is where the match came from. A reviewer then built 49 realistic projects and the gate
accepted **11**. The 32 shapes here vary language, test framework, test location, function versus
method, and whether the code uses the spec's vocabulary or its own: pytest, parametrize, unittest,
Django, Jest, vitest, mocha and chai, Go table-driven, Rust inline `#[cfg(test)]`, JUnit 5, xUnit,
RSpec, minitest, PHPUnit, Swift XCTest, Kotlin, GoogleTest, Catch2, monorepo, class method, async,
`$`-prefixed exports, and an implementation living under `spec/`.

**Mechanisms pinned**, each by a fixture that returns the wrong verdict if that mechanism alone is
removed: prose classification, config classification, markup classification,
content-type-beats-location, comment stripping, string stripping, the live-test requirement, the
symbol-donor coupling, the truthiness exclusion, evidence-file containment, nested block comments in
both Kotlin and Rust, per-language line comment markers, Python triple quotes, Ruby `=begin` blocks,
PHP `#` comments, Go backtick raw strings, regex literals and their preceders, the newline bail on
unterminated strings, newline preservation through blanking, the URL guard, identifier-shaped
strings as vocabulary, and the rule that a declaration is not an exercise.

## The mutation matrix, and why the score above is not the evidence

`npm run selftest:mutants` disables one mechanism in `lib/verification-gap.mjs` at a time and
requires the Deception Suite to turn red. It is the only thing that shows this suite measures the
gate rather than its own fixtures, and it has now caught that failure twice:

- **Round two**: the suite stayed green with three of four mechanisms reverted, including the prose
  rule the whole suite was written for.
- **The scanner rewrite**: the suite reported 82 of 82 passing while **twelve of sixteen** scanner
  mechanisms could be removed without turning it red. Nested block comments, block comments
  entirely, and "every language uses C syntax" were all unpinned. The attacks had been demonstrated
  by hand and never shipped as fixtures.

The matrix refuses to run against a red baseline. Its first run scored a fake 21 of 21 because one
new fixture failed on unmutated source, which made every mutant look killed; a suite whose control
is broken reports a perfect score for the wrong reason, which is the house defect wearing the
instrument's clothes.

Building the fixtures found three defects in the gate that the fixtures were only meant to pin:

1. A Rust or Python file whose inline test asserted **nothing at all** reached a clean `pass`,
   because `fn name(` in the definition satisfies "the symbol appears followed by a paren" exactly
   as well as a call does. Declarations are now blanked before that question is asked.
2. Go backtick raw strings were not strings, so a sentence inside one counted as implementation
   vocabulary.
3. `<` was treated as a position where a regex literal may begin, which is true in JavaScript and
   catastrophic in JSX: every closing tag `</div>` started a phantom regex that ran to the end of
   the line and ate whatever followed.
4. The same empty-self-test pass survived the first fix in C# and Java, because C-family methods
   declare a return type and no keyword, so the keyword rule never fired on them. Measured on both
   `[Test]` and `@Test` before the second fix.

## Unread is not unwritten

Six languages - Elixir, Clojure, Haskell, Perl, Dart and Objective-C - were not in the readable
list, so a complete, genuinely tested project in any of them produced `evidenceFiles: 0` and a
receipt instructing the author to "implement or explicitly waive" work that was finished. Refusing
to read a language is a defensible limit. Reporting unread code as unwritten is a confident claim
about the world made from having looked at nothing, and it was the worst false refusal here.

**A language needs three things, not one.** The extension makes files readable; without an EXPORT
shape there is no symbol for a test to exercise, and without a TEST convention the file holding the
tests is not recognised as one. Two of the three still refuses every project in that language,
silently. Each of the six carries all three and a fixture that fails if any is dropped. Adding them
surfaced four defects that were not about those languages at all:

- **kebab-case was not a naming convention.** tokenize split camelCase and snake_case and left
  `reconcile-carrier-payroll` as one meaningless token, and the symbol filter accepted only
  JavaScript identifiers, so every Clojure symbol was discarded before it could be donated.
- **Only C-shaped calls counted.** Haskell applies by juxtaposition, Lisp puts the operator inside
  the parenthesis, and Objective-C sends `[obj name:arg]`. None of them look like `name(`.
- **`shouldBe` has no word boundary after `should`**, so the assertion vocabulary missed every hspec
  assertion ever written.
- **Objective-C method declarations counted as their own exercise**, the same defect already fixed
  for Rust, Python, C# and Java, in the one shape that has neither a keyword nor parentheses.

The seventh language, whatever it is, now gets a named `NO-READABLE-SOURCE` gap that says which
extensions were passed over, rather than a verdict about the work.

`.m` is Objective-C to one population and MATLAB to another, and they disagree about `%`: comment in
one, modulo in the other. That extension is resolved by content rather than by name.

## The acceptance rate

A reviewer built 37 honest, complete, genuinely tested projects and measured **17 accepted, 46%**.
A gate that refuses half of real work gets switched off, and then it protects nothing.

Measured after the fixes, and both numbers carry how they were obtained, because one is self-graded:

- **19 of 20 (95%)** on a corpus reconstructed here from the reviewer's descriptions. I built it, so
  it is evidence about the fixes rather than an independent result.
- **7 of 7** on the reviewer's own project directories that survived on disk, including the two they
  reported as refused. Their full 37 went with the agent's scratch space.

The one remaining refusal is a SQL repository whose function is named `loadUnmatched` and whose only
connection to the requirement is the table names inside a query string. **That refusal is correct.**
Nothing in the code names the requirement, and accepting it would be identical to accepting the
smuggling deception, which is the same file with dishonest intent.

The change that moved the number most was the source vocabulary threshold, which demanded a file
repeat four of the requirement's eight words. Real code names three and gets on with it. Lowering a
gate to make things pass is the move that makes a gate meaningless, so the boundary is now mutated
in both directions: `source-threshold-lowered-to-two` must turn the suite red, and SCAN-THIN-OVERLAP
sits exactly on it - an unrelated module sharing the two most generic words in the requirement, with
a real test that calls it and a title restating the requirement in full.

The other half was test titles. `test('reconciles the carrier file against the payroll extract')` is
where most suites put the requirement's words, and blanking it as prose refused honest work in bulk.
Strings now count on the TEST side and nowhere else: a title can corroborate a trace, but it can
never create one, because the test still has to exercise a symbol donated by a source file that
carried the requirement in its own code. The mechanism that used to let strings into SOURCE
vocabulary is deleted rather than bounded.

## What a third review found

Three independent lanes attacked the scanner, tried to smuggle deceptions past it end to end, and
built honest projects to see what it wrongly refuses. Two returned BLOCK. The two worst were
reproduced here before anything was changed:

- **A project with no test file at all returned `pass`**, and the receipt named the implementation
  as its own test evidence. `\b(?:test|it|describe)\s*\(` matched `CARRIER.test(row)`, an ordinary
  regex method call in production code. Fixed with a lookbehind, and pinned.
- **The requirement sentence written with dots instead of spaces passed as an implementation.** The
  `wordStrings` rule admits any string with no whitespace as a name, and a sentence joined by dots
  is one whitespace-free "name". Source files are now measured on code tokens; identifier-shaped
  strings may supplement a file that already shows the requirement in code, and can never carry it
  alone.

The scanner lane found two more, and one of them reversed a decision I had just made and written a
fixture for. I had kept a rule exempting `//` from comment stripping when it followed a colon, so
that `http://` survived, and I pinned it with a fixture proving it did work. It is a **critical false
pass**: `default://<the requirement sentence>` is valid JavaScript, and the exemption emitted that
prose into the code view where it supplied every token the gate needed. Five idiomatic forms trigger
it. It protected nothing, because a URL in real code is already inside a string or an existing
comment by the time that line runs. The exemption is gone and the fixture is inverted to pin its
removal. I kept it because I could construct a case where it helped and never checked whether it
also did harm.

The second was the whole-file poison returning through a different character: `return /`/.test(s)`
is ordinary JavaScript, the backtick inside the unrecognised regex opened a template literal, and
template literals were exempt from the newline bail because they legitimately span lines - so it
swallowed the rest of the file. The fix is a containment rule rather than another pattern: **a
literal that never closes means the scanner has lost its place, so it gives up at the end of its own
line.** Any scanner this thin will mis-lex somewhere; what matters is that a mis-lex costs one line.
That rule now subsumes three mechanisms that used to be load-bearing on their own, which is why the
matrix reports 22 killed and 3 subsumed rather than 25 killed - a mechanism defended twice cannot be
killed alone, and saying so is more honest than deleting the mutant.

Fixing the first found the mirror-image defect in the same list: a suite written entirely in
`assert.equal(...)` was not recognised as a test at all, because the pattern required the paren to
follow the identifier directly. Namespaced assertions now count, and a bare `assert(payload)`
invariant in production code no longer does.

**Not yet fixed, ranked, all from that review and all reproduced by its author:** six languages the
gate cannot read at all (Elixir, Clojure, Haskell, Perl, Dart, Objective-C) where the receipt says
"implement or waive" rather than "cannot read"; Ruby heredoc bodies read as code; template-literal
and f-string interpolations blanked along with the literal, hiding calls made inside them; C#
verbatim strings `@"C:\path\"` mis-scanned because backslash is treated as an escape; JS class and
object method names extracted with the first character removed; a test that defines its own copy of
the symbol counted as exercising the implementation; a file of nothing but constant declarations
donating a symbol; a single-token requirement that can never be traced because the donor floor is
two; and E2E-only suites reported as `implemented-untested`, which reads as "you wrote no tests".

## What a second review found, and what is still open

A second adversarial review got thirteen further deceptions through and found four more honest
shapes refused. Fixed since: harness names such as `ok` and `test` can no longer be donated as the
subject, so renaming a function to `ok` no longer turns every `assert.ok` into evidence; string
stripping is per line, so one unmatched quote no longer disables the check for the rest of a file;
`//` is recognised after any character except `:`, so `});//stillCounts()` is stripped while
`http://` survives; PHP takes both comment styles; `.d.ts` declarations, `__mocks__`, `*.stories.*`
and Cypress specs can no longer be implementations; and `--evidence-files` compares real paths, so a
junction inside the project no longer reaches outside it.

**Closed since.** The four regexes that each decided "is this code" are replaced by one
left-to-right scanner tracking comment depth and string state, with a per-language syntax profile.
Nested block comments in Kotlin, Swift, Scala and Rust are tracked to depth, and `SCAN-NESTED` and
`SCAN-NESTED-RUST` fail if that tracking is removed.

**Still open, and listed because a suite that hides its open findings is worthless.** A JSX or Vue
component whose only content is the requirement text as displayed markup can still count as an
implementation: markup inside a `.jsx` file is neither a comment nor a string, so the scanner has no
grounds to blank it, and separating displayed text from code needs a parser rather than a scanner.
Rust raw strings with unbalanced inner quotes (`r#"a "b"#`) are not parsed as raw strings; the URL
guard is what stops the damage, and `SCAN-URL-IN-JSX` is what stops the guard being removed. Swift multiline
`"""` strings are parsed, but Rust `r#""#` and C++ `R"()"` raw-string delimiters are not, so a
quote inside one is taken at face value.

## Adding a fixture

Add it to `fixtures.mjs`, `fixtures-round-2.mjs` or `fixtures-scanner.mjs` with an `id`, a `category`, a one-line
`description`, the `files` it creates, and an `expect` of `must-not-pass`, `must-pass` or
`known-limit`. A `known-limit` must also carry a `limit` field explaining why it cannot be detected;
the suite fails without it. A fixture may set `directory`, `spec` and `evidenceFiles` to exercise
the CLI's own options.

**If you find a deception this gate accepts, that is worth more than a feature request.** Open an
issue with the fixture.

## Claim ceiling

This suite measures one thing: whether a deterministic, file-reading traceability check can be
fooled by a given fixture. It does not measure whether MIDAS improves agent behaviour, it does not
execute your tests, and it is not a comparison against any other tool. The known-limit list is
maintained honestly and is **not** claimed to be complete: it is what has been found so far, by the
author and by one adversarial reviewer.
