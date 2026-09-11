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
| Fixture deceptions refused | **56 / 56** |
| Honest project shapes accepted | **40 / 40** |
| Mechanisms independently pinned | **25** |
| Mutants killed by this suite | **22 / 22** |
| Known limits, documented below | **3** |

Two commands, and the second is the one that matters:

```
npm run selftest:adversarial   # 100 tests: does the gate get these fixtures right?
npm run selftest:mutants       # 22 mutants: can this suite detect its own defences being removed?
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
