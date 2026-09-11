---
name: verification-gap
description: Use when a work order is moving from implementation to review and the agent must compare requirements against implementation evidence before claiming completion.
license: Apache-2.0
compatibility: MIDAS alpha work-order and verification workflow
---
# Verification-Gap Skill

Read fully and follow.

## Purpose

Catch omitted requirements before a work order is marked complete.

## Required Inputs

- A PRD, work order, or acceptance-criteria source.
- Implementation evidence such as changed source files, tests, screenshots, logs, or receipts.
- A claim ceiling stating what remains unverified.

## Steps

1. Load the work order and requirement source.
2. Extract auditable requirement rows.
3. Run `midas verify --directory . --spec <path>` or provide `--evidence-files` for a bounded file set.
4. Read `.midas/reports/verification-gap-receipt.md`.
5. If gaps are found, route back to implementation. Read the status, because the two failure modes
   need different work: `gap` means nothing implements the requirement, and `implemented-untested`
   means the code exists but nothing would fail if it broke, so the fix is a test rather than a
   feature.
6. If no gaps are found, continue to tests, build, runtime/UI proof, and human review where applicable.

## Stop Conditions

- Stop if there is no auditable spec.
- Stop if implementation evidence is missing.
- Stop if the receipt contains gaps that are not explicitly waived by a human reviewer.

## What counts as evidence, and what does not

A requirement is only `traced` when BOTH of these hold:

- a source file carries its vocabulary, and
- a test contains a live test and either calls a symbol that source file exports, or asserts about
  one. A source file that also holds its own tests, as Rust and Go commonly do, can satisfy both.

Nothing else counts, and the exclusions are deliberate:

- **Prose, data and markup never establish a requirement**, whatever directory they sit in. A
  Markdown file inside `test/` is prose. A JSON fixture inside `test/fixtures/` is data.
- **Comments and string literals are removed before matching.** A commented-out implementation and a
  test whose title merely names the requirement are not evidence.
- **A bare truthiness assertion is not evidence.** `assert.ok(thing)` proves an import resolved.
- **The symbol must come from a file that carried the requirement's vocabulary**, so an unrelated
  module cannot donate a name to a requirement described somewhere else.
- **Mocks, stories and fixtures are not implementations.** `__mocks__/`, `*.stories.*` and Cypress
  specs are read as context.
- **`--evidence-files` may only name files inside the project**, and only file types this check can
  read. Anything refused is listed in the receipt rather than skipped silently.

## Languages this check can read

JavaScript, TypeScript, JSX and TSX, Vue, Svelte, Python, Go, Ruby, Java, Kotlin, Rust, C#, PHP,
Swift, Scala and C/C++. A language outside that list is not read at all and its requirements report
`gap`. Adding one means adding its comment style, its export shape and its test convention in
`lib/verification-gap.mjs`; a language listed without all three silently refuses every project
written in it, which has happened and is the reason this section exists.

## Claim Ceiling

Verification-gap only proves traceability from requirement text to local evidence. **It does not
execute your tests**, so it cannot prove a matching test asserts the right thing, that it is not
skipped at runtime, or that the implementation it calls does anything at all. It does not prove
runtime correctness, UI quality, accessibility, security, provider readiness, production deployment,
or public release state.

Deceptions this check is known to accept are listed in `evals/deception/README.md` and are
reproducible with `npm run selftest:adversarial`. That list is maintained deliberately and is **not**
claimed to be complete: it is what has been found so far, by the author and by adversarial reviewers.
