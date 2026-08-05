---
name: midas-subagent-development
description: Execute an implementation plan through delegated worker sessions. Use when a written plan with mostly independent tasks is ready to run and the work will be delegated rather than done inline.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Subagent Development

## Purpose

Execute a plan by dispatching a fresh worker per task, reviewing each result
in two stages, and keeping your own context clean for coordination. Delegation
without fresh context, capped loops, and honest model routing is not
delegation — it is diffusion of responsibility.

## The Process

1. **Set up recoverable state.** Confirm the isolated workspace exists. Keep
   a progress ledger on disk — task completions, fix rounds, parked findings,
   commit ranges. Session memory does not survive compaction; the ledger and
   git history are what a recovered controller trusts, not recollection.

2. **Dispatch a fresh worker per task.** Each worker gets exactly: its task
   brief (the single source of requirements, exact values verbatim), the
   interfaces earlier tasks produced, the global constraints, and a report
   file path. Never the session history, never accumulated prior-task
   summaries, never the whole plan. Record the base commit before dispatch.
   Never run two implementation workers in parallel on one tree.

3. **Route each dispatch by the model-tier gate.** An open or local tier
   model may take a task ONLY when both hold: (a) a gold-standard reference
   for the task's shape exists, produced by the frontier tier, and (b) a
   deterministic check will verify the output afterwards. Missing either,
   route the task up. A cheap model on unvalidated novel work is not a cost
   saving; it is unreviewed output with a delay fuse. The gate is evaluated
   per task, not per session — yesterday's routing decision proves nothing
   about today's task shape.

4. **Handle the worker's report by status.** Done: proceed to review. Done
   with concerns: read the concerns first; correctness concerns are resolved
   before review. Needs context: supply it and re-dispatch. Blocked: change
   something real — more context, a stronger model, a smaller task, or an
   escalation about the plan itself. Never re-dispatch unchanged and hope.

5. **Review in two stages, every task.** Stage one — spec compliance: does
   the diff implement the brief's requirements, exactly, with nothing extra?
   Stage two — quality: is the code sound, tested, and consistent with the
   codebase? The reviewer receives the brief, the report, and a diff built
   from the recorded base to head — never a diff that silently truncates a
   multi-commit task. Both verdicts are required; a worker's self-review
   substitutes for neither.

6. **Run the capped fix loop.** A round is one fix dispatch plus one scoped
   re-review of the fix diff. Five rounds maximum per task. Rounds 1-3 resume
   the original worker with the findings verbatim. Rounds 4-5 dispatch a
   fresh worker on a model at least one tier up — a loop that survives three
   resumes means the worker cannot see its own problem, and the escalation
   gate applies: the cheap tier never gets a round 4. Every round is a ledger
   entry.

7. **At the cap, adjudicate — never silently drop.** Each still-open finding
   gets a ruling on the ledger: parked as contestable, parked as real but
   non-blocking, or — if it is load-bearing for later tasks — a full stop and
   escalation to the requester. Adjudicating before the cap to end a loop is
   pre-judging with a different name.

8. **Finish with a whole-branch review** on the most capable available model,
   pointed at the ledger's parked and deferred items so it can triage what
   must be fixed before merge. One fix wave, one scoped re-review, then hand
   off to branch closeout.

## Red Flags

| Rationalization | Counter-rule |
|---|---|
| "I'll fix this small finding myself, dispatching is overhead" | Controller fixes pollute the coordination context and land unreviewed. Resume the worker. |
| "Close enough on spec compliance" | The reviewer found gaps, so it is not done. Fix, or reach the cap and adjudicate on the record — the only two exits. |
| "One more round will converge" (round 6) | Past the cap, the failure is structural. More rounds buy the same finding at a higher price. |
| "The local model handled the last task fine" | Last task had a gold reference and a checker. This one's gate is evaluated fresh, not inherited. |
| "The worker said success, next task" | A worker's report is a claim. The two-stage review is the evidence step; it runs every task. |
| "The fix was one line, skip the re-review" | Unreviewed fixes are how regressions land. Every round ends with a scoped re-review of the fix diff. |
| "This finding is obviously wrong, I'll drop it" | Rulings happen at the cap and on the ledger. A silent discard is indistinguishable from a cover-up in the record. |
| "Ledger bookkeeping slows me down" | The ledger is what survives compaction. Controllers without one have re-dispatched entire completed task sequences. |
| "I'll paste the session history so the worker has full context" | Full context is the controller's job; the worker's power comes from having only its task. History pastes bloat dispatches and blur the brief's authority. |
| "Round 4 with the same model, it nearly got there" | Nearly-there three times is the definition of stuck. Rounds 4-5 change the eyes and the tier, or they change nothing. |

## Guardrails

- Fresh worker context per task — a worker never inherits the controller's
  history or another worker's transcript.
- The dispatch names the model tier explicitly; an unnamed tier silently
  inherits the controller's, defeating the routing rule in one omission.
- The model-tier gate is binding in both directions: route down only with a
  gold reference plus deterministic check; route escalations up, never
  sideways to an equal model.
- Diffs for review are always built from the recorded task base, handed over
  as files rather than pasted into context.
- Findings that conflict with the plan's own text go to the requester as a
  fork — which governs is their call, not the reviewer's or yours.
- Minor findings are recorded and deferred to the final review, never used to
  extend a fix loop.
- A worker's questions get answered completely before it implements — rushing
  a worker past its own uncertainty buys speed with rework.
- After compaction or recovery, the ledger and git history outrank your
  recollection; a completed task on the ledger is never re-dispatched.
- Reviewers are matched to diff risk, not habit: a subtle concurrency change
  gets a stronger reviewer than a mechanical rename, whatever their sizes.

## Stop Conditions

Halt and escalate to the requester when:

- The breaker trips with a load-bearing finding still open — later tasks
  would build on a known defect.
- A worker's blocker traces to the plan being wrong, not the execution.
- The same finding class recurs across multiple tasks — the plan or the spec
  has a systemic gap that per-task fixing will not close.
- Two tasks need to mutate the same files at once — serialization is a plan
  change, and the plan's owner decides the order.

## Claim Ceiling

Completing this skill proves each task's diff passed two-stage review or
carries a recorded ruling, and that the ledger reconstructs the run. It does
NOT prove the branch is mergeable, the plan's goal is met end to end, or that
deferred and parked findings are harmless — those claims belong to the final
whole-branch review and the branch closeout that follow.
