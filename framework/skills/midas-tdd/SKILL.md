---
name: midas-tdd
description: Red-green test discipline for all implementation work. Use when implementing any feature, bug fix, refactor, or behavior change, before writing any production code.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Test-Driven Development

## Purpose

Write the test first, watch it fail, then write the minimum code that makes it
pass. A test you never watched fail proves nothing — it may pass for reasons
unrelated to the behavior it names, and you will not find out until production
does.

## The Iron Law

No production code without a failing test first. Code written before its test
gets deleted — not kept as reference, not adapted while writing tests, not
glanced at. Deleted. Then the cycle restarts from the test.

## The Process

1. **RED — write one minimal failing test.** One behavior, a name that states
   the behavior, assertions against real code rather than against a mock's
   own configuration. If the name needs "and", split the test.

2. **Verify RED — run it and read the failure.** Mandatory, never inferred.
   Confirm three things: it fails rather than errors, the failure message is
   the one you expected, and it fails because the behavior is missing — not
   because of a typo or import error. A test that passes immediately is
   testing existing behavior; fix the test. A test that errors is broken;
   fix it until it fails correctly.

3. **The negative-test rule for bug fixes.** A test written to catch a bug
   MUST fail on the pre-fix source. Run it against the unfixed code and quote
   the failure. A regression test that was never seen red on the code it
   guards is a decoration: it proves the test runs, not that it detects the
   defect. Red on pre-fix source, green after the fix — both runs quoted.

4. **GREEN — write the minimum code that passes.** No extra parameters, no
   options nobody asked for, no refactoring of neighboring code. Just enough
   to turn this test green.

5. **Verify GREEN — run it and read the pass.** The new test passes, the rest
   of the suite still passes, the output is clean. If the test fails, fix the
   code, never the test. If other tests break, fix that now — a suite left
   red "for the moment" is a suite that stays red.

6. **REFACTOR — clean up under green.** Remove duplication, improve names,
   extract helpers. No behavior changes. Re-run after each move.

7. **Repeat** with the next failing test for the next behavior. One
   red-green cycle per behavior — batching several behaviors into one giant
   test-and-implement pass loses the attribution that makes the cycle work:
   when something breaks, you no longer know which change broke it.

8. **On violation: delete and restart.** If you notice production code exists
   ahead of its test — however it got there — delete it and restart the cycle
   from RED. The sunk time is spent either way; the choice remaining is
   between code with proof and code without it.

## Red Flags

| Rationalization | Counter-rule |
|---|---|
| "Too simple to test" | Simple code breaks in simple ways nobody looked at. The test costs a minute; the untested break costs a session. |
| "I'll write tests after" | Tests written after pass immediately, which proves nothing. You never watched them catch the defect they claim to guard. |
| "I already manually verified it" | Manual checks leave no record and cannot re-run. "Worked when I tried it" is testimony, not evidence. |
| "Keep the code as reference while I write tests" | You will adapt it, which is testing after with extra steps. Delete means delete. |
| "Deleting hours of work is wasteful" | The hours are spent either way — sunk cost. Keeping code you cannot trust is the actual waste. |
| "The regression test passes, so the fix works" | Green alone is half the proof. Show it red on pre-fix source or it detects nothing. |
| "TDD is dogma; I'm being pragmatic" | The pragmatic path is the one that catches the bug before commit. Guess-and-ship debugging in production is slower. |
| "This case is different because…" | The sentence that starts this way is the rationalization the rule exists to stop. |
| "Exploration code doesn't need tests" | Exploring is fine; keeping is not. Throw the exploration away and rebuild it test-first. |
| "The test is hard to write, I'll code around it" | A hard-to-test behavior is a hard-to-use design. Listen to the test and simplify the interface before writing more code. |

## Guardrails

- Every RED and GREEN verification is an actual run whose output you read —
  never an expectation stated as a result.
- Mocks only where real code is genuinely unavailable; a test that asserts on
  mock behavior tests the mock.
- Test-only helpers live in test utilities, never in production classes.
- The suite must be fully green before any commit; a known-red test is never
  committed around.
- Output is pristine at GREEN: warnings and stray errors in a passing run
  are defects on layaway, not noise.
- Each commit pairs the test with the code that satisfies it, so history
  reads as a sequence of proven behaviors.
- Edge cases and error paths get their own red-green cycles; a happy-path
  suite proves the happy path and nothing else.
- Exceptions (throwaway prototypes, generated code, pure config) require the
  requester's explicit say-so, recorded — not your own judgment call.
- Before writing a test, name the production change that would make it fail;
  a test with no nameable failing change asserts nothing.
- Test names state the behavior under test in plain words; a name that needs
  the test body to be understood is a name that hides a regression later.
- When a dependency must be mocked, understand its real side effects first —
  a mock built on a guessed contract green-lights code that breaks against
  the real thing.
- The failure message of a RED run is read, not just noticed: a test failing
  for the wrong reason is a passing test wearing red.

## Stop Conditions

Halt and escalate rather than pressing on when:

- You cannot construct a failing test for the behavior — that is a design
  problem or a spec gap, and it belongs to the requester, not to a workaround.
- A test can only be written by coupling to internals or mocking everything —
  the interface needs redesign before the code needs writing.
- The requester asks you to ship without tests: state the risk once, then
  record their override verbatim before proceeding.
- The suite itself is broken on the base you started from — a red baseline
  is the requester's decision to accept, not yours to build on quietly.
- The fix for a failing GREEN run would require changing the test's
  assertion — that is the signal you are about to test the implementation
  instead of the behavior; stop and re-read the spec.

## Claim Ceiling

Completing this skill proves each implemented behavior has a test that was
watched to fail and then pass, and that the suite is green on this tree. It
does NOT prove the feature is correct beyond the tested cases, that the tests
cover the spec, or that the work is done — coverage against requirements and
final verification belong to review and to verification-before-done.
