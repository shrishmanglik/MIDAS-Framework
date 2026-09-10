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
| Deceptions refused | **46 / 46** |
| Honest project shapes accepted | **8 / 8** |
| Mechanisms independently pinned | **10 / 10** |
| Known limits, documented below | **3** |

The honest fixtures matter as much as the attacks. A gate that refuses everything scores perfectly
and gets switched off within a week. Round one refused every pytest project, every CommonJS
`module.exports = {}` project, and Go, Java, Ruby and Rust entirely, while reporting "3/3 honest
work accepted" from three fixtures that were the same implementation measured three times.

**Mechanisms pinned**, each by a fixture that passes if that mechanism alone is removed: prose
classification, config classification, markup classification, content-type-beats-location, comment
stripping, string stripping, the live-test requirement, the symbol-donor coupling, the truthiness
exclusion, and evidence-file containment.

## What it cannot catch

A suite that lists only its wins is marketing. These three are in the suite, pinned as **passing**.

**`DEC-026`** — a test that imports the module, asserts, and only ever covers the happy path, never
the branch the requirement describes.

**`DEC-027`** — a test that mocks away the subject and asserts on the double.

**`DEC-064`** — an empty function named after the requirement, genuinely imported, genuinely called,
genuinely asserted. Only the behaviour is missing.

All three need execution or coverage data. This check reads files, so it cannot reach them. If any
is ever caught, promote the fixture to `must-not-pass` in the same change rather than leaving it
passing for the wrong reason; the test suite asserts that.

## What it catches only partially, stated because the reviewer was right that the old list implied more

**Generic requirement vocabulary.** A requirement written in words any codebase contains ("the
system must handle errors gracefully and log every failure") can be satisfied by unrelated code. The
token floor was raised from 2 to 3 after the reviewer demonstrated this, which narrows the window
without closing it. A requirement with little distinctive vocabulary is weak input, and the gate
reports `untestable` when there is none at all.

**Ecosystem coverage is a list, not a universal.** The gate reads JavaScript, TypeScript, Python,
Go, Ruby, Java, Kotlin, Rust, C#, PHP, Swift, Scala and C/C++. A language outside that list is never
read, so its requirements report `gap`. Adding one means adding its comment style, its export shape
and its test convention in `lib/verification-gap.mjs`.

**Directories skipped by design.** `dist/`, `build/`, `vendor/`, `target/`, `node_modules/` and
virtualenvs are not scanned, so an implementation that exists only as build output is invisible.
Symlinked package directories are not traversed, which matters for some pnpm monorepo layouts.

## Adding a fixture

Add it to `fixtures.mjs` or `fixtures-round-2.mjs` with an `id`, a `category`, a one-line
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
