# The Deception Suite

A completion gate that has never been attacked is a gate nobody has tested.

This suite is a set of fixtures that each fake a finished feature. The gate is expected to refuse
every one of them, to accept honest work, and to be explicit about the deceptions it cannot detect.

Run it:

```bash
npm run selftest:adversarial
```

## Why it exists

On 2026-09-10 this framework's own verification gate returned `pass` for a project containing a
spec, a `NOTES.md` restating the requirements in prose, and no code at all. The prose file said, in
capitals, that nothing had been implemented. The gate counted word overlap against every file in the
tree, so the prose supplied the vocabulary and cleared the threshold.

That fixture is `DEC-001`. Everything else here was written by asking the same question repeatedly:
what else could satisfy this check without the work existing?

The first run of the completed suite scored **19 of 25**. All six misses were the same shape: a test
whose title carried the requirement's words while its body did nothing. That produced the rule that
a test file is only evidence when it contains a live test call and mentions a symbol the matched
implementation actually exports.

## Current score

Reproduce with `npm run selftest:adversarial`; do not quote this table without running it.

| | |
|---|---|
| Deceptions refused | **25 / 25** |
| Honest work accepted | **3 / 3** |
| Known limits, documented | **2** |

The honest fixtures matter as much as the deceptions. A gate that refuses everything scores
perfectly against attacks and gets switched off within a week.

## What it cannot catch

These are in the suite, pinned as passing, because a suite that lists only its wins is marketing.

**`DEC-026` — a test that imports the module, asserts, and only ever covers the happy path.**
The import is real and the assertion is real. Knowing the assertion never reaches the branch the
requirement describes needs coverage data or execution, and this check does neither.

**`DEC-027` — a test that mocks away the subject and asserts on the double.**
The import is real, the assertion is real, and detecting that the subject was replaced requires
understanding the mocking library in use, which is framework specific.

Both are catchable with coverage instrumentation. Neither is catchable by reading files, and this
check reads files. If either is ever caught, promote the fixture to `must-not-pass` in the same
change rather than leaving it here passing for the wrong reason. The test suite asserts that.

## Adding a fixture

Add it to `fixtures.mjs` with an `id`, a `category`, a one-line `description`, the `files` it
creates, and an `expect` of `must-not-pass`, `must-pass` or `known-limit`. A `known-limit` must also
carry a `limit` field explaining why it cannot be detected; the suite fails without it.

If you find a deception this gate accepts, that is a bug report worth more than a feature request.
Open an issue with the fixture.

## Claim ceiling

This suite measures one thing: whether a deterministic, file-reading traceability check can be
fooled by a given fixture. It does not measure whether MIDAS improves agent behaviour, it does not
execute your tests, and it is not a comparison against any other tool unless a comparison harness is
published alongside it with the same fixtures and the same runner.
