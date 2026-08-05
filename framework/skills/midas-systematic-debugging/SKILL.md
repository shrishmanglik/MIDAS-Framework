---
name: midas-systematic-debugging
description: Root-cause discipline for defects. Use when encountering any bug, test failure, build break, or unexpected behavior, before proposing or applying any fix.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Systematic Debugging

## Purpose

Find the root cause before touching the code. A fix applied to a symptom is a
defect with better camouflage: the failure moves, the confidence rises, and
the underlying cause ships. No fix proposal exists until the investigation
phase is complete.

## The Process

1. **Read the actual error.** The whole message, the whole stack trace, the
   line numbers, the error codes. Errors frequently name their own cause;
   skimming past them to start theorizing is the first wrong turn.

2. **Reproduce it on demand.** Exact steps, reliable trigger. A defect you
   cannot reproduce is a defect you cannot prove fixed — gather more data
   before guessing.

3. **Check what changed.** Recent commits, new dependencies, config drift,
   environment differences. Most new breakage sits within arm's reach of a
   recent change.

4. **Run the adjacent-check hunt.** For every check that PASSES near the
   failure, ask the named question: *what question does this passing check
   actually answer — and is it the question that matters here?* A green
   suite, a clean lint, an exit 0: each answers something narrower than
   "this works". The defect routinely lives in the gap between the question
   a check answers and the question you assumed it answered. Name that gap
   explicitly for each adjacent check before forming any hypothesis. A
   check that answers the wrong question is worse than no check: it
   manufactures confidence exactly where the investigation should focus.

5. **Instrument the boundaries in multi-component systems.** Log what enters
   and exits each component, verify config propagation, run once, and let
   the evidence say WHERE it breaks before theorizing about why.

6. **Compare against a working example.** Find similar code that works, read
   the reference completely rather than skimming the pattern, and list every
   difference however trivial. "That can't matter" is a hypothesis, not a
   fact — it goes on the list too.

7. **One hypothesis, one minimal test.** State it: "X is the root cause
   because Y." Change the smallest thing that tests it. If it is refuted,
   form a new hypothesis — never stack a second fix on top of a first that
   did not work. If you do not understand something, say so and dig; do not
   pretend.

8. **Reproduce the failing case as a test, then fix.** No fix ships without
   the failing case reproduced first — as an automated test where a framework
   exists, as a pinned reproduction script where one does not. The test fails
   on the broken code, the single root-cause fix lands, the test passes, and
   the rest of the suite stays green. TDD's negative-test rule applies in
   full.

9. **Count your attempts.** After three failed fixes, stop fixing. The
   pattern — each fix revealing a new problem somewhere else — is the
   signature of a wrong architecture, not an unlucky streak. That
   conversation happens with the requester before attempt four.

## Red Flags

| Rationalization | Counter-rule |
|---|---|
| "Quick fix now, investigate later" | Later never comes and the symptom-fix becomes load-bearing. Investigation is the first step, not the follow-up. |
| "Just try changing X and see" | Guess-and-check is the slowest method that feels fast. One stated hypothesis, one minimal test. |
| "It's probably X" | Probably is not evidence. Trace the data until "probably" becomes "shown". |
| "The tests around it pass, so the problem is elsewhere" | Passing checks answer specific questions. Run the adjacent-check hunt before trusting any green near a failure. |
| "No time for process, this is an emergency" | Systematic is faster than thrashing precisely when the pressure is highest. Emergencies are where guessing compounds. |
| "I'll bundle a few likely fixes and run the suite" | Multiple simultaneous changes cannot be attributed. One variable at a time or the run teaches nothing. |
| "I'll verify manually, the test can come later" | A fix with no failing-case reproduction has no proof it fixed anything. The case comes first. |
| "One more fix attempt" (after two failures) | Three failures is an architecture signal, not a prompt to iterate harder. Stop and question the structure. |
| "The reference is long, I'll adapt the gist" | Partial pattern understanding is where subtle breakage breeds. Read the working example completely. |
| "I don't fully understand it, but this change might work" | A fix applied without understanding is a coin flip with side effects. Say what you don't understand and investigate that first. |

## Guardrails

- No fix — not a one-liner, not a config tweak — before the investigation
  phase is complete and the root cause is stated in writing.
- Every fix is single: one root cause, one change. No drive-by refactoring,
  no "while I'm here" improvements riding along.
- After the root cause is found, harden the boundaries it crossed —
  validation at the layers the bad value passed through unchallenged —
  as its own change, not folded into the fix.
- The investigation record survives the session: what was ruled out and why,
  so the next defect in this area starts from evidence instead of zero.
- Evidence is quoted, not summarized: the failing output before, the passing
  output after, both from runs you actually executed.
- A defect found in code the change never touched is investigated as a
  possible latent or masked bug before anything is reverted.
- When investigation concludes "environmental / timing / external", that
  verdict requires the completed process behind it — most "no root cause"
  findings are incomplete investigations wearing a conclusion. A genuine
  external cause still gets handling (retry, timeout, clear error) plus
  monitoring, and the investigation record ships with it.
- Requester signals like "is that not happening?", "stop guessing", or a
  repeated question about evidence mean the process has been abandoned —
  return to the investigation phase rather than defending the guess.
- Arbitrary sleeps and timeouts added during debugging are replaced with
  condition checks before the fix ships; a timing guess that passed once is
  a flake in incubation.

## Stop Conditions

Halt and escalate to the requester when:

- Three fixes have failed — present the pattern and question the
  architecture; do not attempt a fourth in silence.
- The root cause sits in someone else's live work or above your authority
  (schema, payments, deploy surface).
- The failing case cannot be reproduced after genuine effort — report what
  was tried and what data would decide it, rather than shipping a speculative
  fix.

## Claim Ceiling

Completing this skill proves the stated root cause explains the observed
failure, and that a once-failing reproduction now passes alongside a green
suite. It does NOT prove the absence of sibling defects from the same cause,
nor that the fix holds in environments the reproduction did not cover.
"Fixed" here means: this cause, this case, this evidence — no wider.
