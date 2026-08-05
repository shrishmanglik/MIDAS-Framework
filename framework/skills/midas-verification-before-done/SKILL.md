---
name: midas-verification-before-done
description: Evidence discipline for completion claims. Use when about to state that work is complete, fixed, passing, or deployed — before committing, opening a PR, or reporting status.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Verification Before Done

## Purpose

No completion claim without fresh evidence produced in this session and read
in full. An unverified "done" is the defect class this framework exists to
eliminate: it converts hope into a record that later sessions treat as fact.

## The Process

1. **Name the command that proves the claim.** Before saying anything about
   status, identify what execution would demonstrate it. If no command can
   prove the claim, the claim is not makeable — say what is actually known
   instead.

2. **Exit 0 is a claim, not a proof.** A zero exit code asserts "this command
   believes it succeeded." Read the output to learn what the command actually
   did: which tests ran, how many, what was skipped, what was warned. A green
   exit wrapping an empty run is the most common counterfeit evidence there
   is.

3. **Empty result sets prove the pattern first.** A search or filter that
   returns nothing supports "no matches exist" only after the instrument is
   proven: run the same pattern against input that MUST match. If the
   known-positive also returns nothing, the pattern is broken and the empty
   result meant nothing. Never report a clean scan from an unproven pattern.

4. **Treat suspicious zeros as broken instruments.** Zero failures on a suite
   that took no time, zero findings from an audit that exited instantly, zero
   diffs after an edit you made — each is more likely a measurement failure
   than a clean result. Truncated output, capped timeouts, and piped
   summarizers all read as "clean" while measuring nothing. Investigate the
   instrument before celebrating the number.

5. **Run controls twice.** For any check that guards something important, run
   it once against a case that must pass and once against a case that must
   fail. A check that has never been seen to fail has never been shown to
   check anything. This is the controls-proven-not-installed rule applied to
   your own verification commands.

6. **Compare diff-stat against intended edit.** Before commit, read the
   actual diff stat and hold it against what you meant to change: every file
   you intended, no file you did not, and change sizes in plausible
   proportion. A diff touching an unexpected file, or missing an expected
   one, is a stop — not a curiosity.

7. **Verify delegated work independently.** A worker's or tool's success
   report is a claim by another party. Check the tree: the diff exists, the
   files changed, the tests run under your own eyes.

8. **Re-read the acceptance criteria before the final run.** Exact file
   names, exact output text, casing, whitespace, trailing newlines — the
   criteria as written, not as remembered. The last mile of most failed
   "done" claims is a requirement that drifted in memory.

9. **State claims with their evidence attached.** "All tests pass" carries
   the command and the counts. Anything not directly evidenced is labeled for
   what it is: asserted, unknown, or waiting on an external actor. A report
   in which everything is silently true is itself a red flag.

## Red Flags

| Rationalization | Counter-rule |
|---|---|
| "Should work now" | "Should" is a prediction. Run the command; report what it printed. |
| "The tests passed earlier this session" | Earlier proved the earlier tree. The claim is about this tree; the evidence must be too. |
| "Exit code was 0, we're good" | Exit 0 wrapping zero executed tests reads identically to success. Read the counts. |
| "The grep found nothing, so we're clean" | An unproven pattern finding nothing proves the pattern, not the code. Run the known-positive first. |
| "I'm confident it's fine" | Confidence is a feeling with no exit code. The claim ships with evidence or as an explicit assertion. |
| "The audit came back instantly with zero findings" | Instant-and-clean is the signature of a tool that measured nothing. Check the instrument. |
| "The agent reported success" | Another party's claim is input, not evidence. Verify against the tree yourself. |
| "It's a tiny change, the full check is overkill" | Small diffs with big blast radii are how regressions ship. Scope the check to the blast radius, not the diff size. |
| "I'm tired and it's almost certainly fine" | Fatigue raises the error rate exactly when the shortcut tempts most. The gate does not scale with energy. |
| "I phrased it as 'looks good' not 'done', so no verification needed" | The rule covers every paraphrase and implication of success. Different words, same claim, same evidence requirement. |

## Guardrails

- Evidence is quoted output from commands run in this session — never
  memory, never extrapolation from a partial check.
- Satisfaction language ("done", "fixed", "all green") is banned ahead of the
  verification run, in every paraphrase.
- Claims about deployment, payments, revenue, schema, or security state
  require direct evidence of that specific state — a passing local suite
  makes none of those claims.
- Piped truncation (`head`, capped timeouts, summarizing wrappers) is never
  used on a safety-relevant check; a truncated audit reads as clean.
- Verification commands stay within the scope the project declares safe —
  proving a claim never justifies reading secrets or touching prod state.
- The verification set is the smallest reliable one for the blast radius:
  focused checks for narrow changes, broad checks for shared contracts —
  chosen by radius, not by convenience.
- Distinguish claim states explicitly: verified with evidence, asserted
  as belief, unknown, or blocked on an external actor.
- Requirements completion is checked line by line against the spec or plan,
  not inferred from a passing suite — tests prove the cases they contain,
  and the spec routinely contains more.
- Counts are stated as counts: "34/34 pass" is evidence, "all tests pass"
  with no numbers is a mood.
- A regression guard earns its name through the red-green cycle: shown to
  fail on the unguarded code, shown to pass on the guarded code, both runs
  in the record.

## Stop Conditions

Halt and report instead of claiming when:

- The verification command cannot be run in this environment — the honest
  status is "unverified", stated as such, with what would prove it.
- Verification produces a result that contradicts the expected state —
  investigate before any status leaves the session.
- The instrument itself fails its control run — fixing the check comes
  before trusting anything it previously reported.

## Claim Ceiling

Completing this skill proves the specific claims you made are backed by
quoted evidence from this session's runs. It does NOT prove the work is
correct beyond what those commands measure, nor that untested surfaces hold.
The ceiling is exact: each claim reaches as far as its evidence and not one
step further.
