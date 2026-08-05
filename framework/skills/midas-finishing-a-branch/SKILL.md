---
name: midas-finishing-a-branch
description: Closeout discipline for completed branch work. Use when implementation on a task branch is finished and the work needs review, integration, and workspace cleanup.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Finishing a Branch

## Purpose

A branch is not done when the code works; it is done when an independent
review has ruled, the merge has landed, applicable deploy or smoke proof
exists, and the worktree and branch are gone. Everything short of that is
work in progress wearing a done costume.

## The Process

1. **Run the full suite on the tree being integrated.** Fresh, complete, on
   this exact tree — a green run earlier in the session proved the earlier
   tree. Failures stop the closeout here; everything else waits for green.
   Read the counts, not just the exit code: a suite that ran nothing exits
   clean too.

2. **Verify nothing is stranded.** Working tree clean, all intended commits
   on the branch, branch pushed. Compare the branch diff against the task's
   intended scope — files you did not mean to touch are resolved now, not
   discovered by the reviewer. Determine the actual base branch this work
   forked from and confirm it; the plan or the branch's upstream usually
   names it, and a guess here compounds through every later step.

3. **Route review to a DIFFERENT session.** The reviewer is a separate
   session from the author with the reviewer role declared — regardless of
   which tool or model either one runs on. Self-review by the authoring
   session does not satisfy the gate under any model arrangement: the
   invariant is session independence, not vendor diversity. Package the diff,
   the requirements, and the evidence for that reviewer.

4. **Present the integration decision to its owner.** Merge now, open a PR,
   or hold the branch — where that choice is the requester's, present the
   options and wait; where the protocol already fixes the route, follow it.
   The integration decision is never defaulted because asking felt slow.

5. **Merge only on an approving verdict.** REVISE or BLOCK routes back to
   fixes and re-review — never argued into approval by the author, never
   merged around. Confirm the merge base is the branch's actual fork point
   before merging; integrating into the wrong base is expensive to undo.

6. **Prove the merged result.** Run the suite on the merged tree. Where the
   repository's protocol requires deployment or smoke proof for this class
   of change, that proof is part of closeout, not a follow-up: deploy per
   the runbook and verify the live markers.

7. **Clean up completely — from outside the worktree.** Cleanup runs from
   the main repository root, never from inside the tree being removed; a
   session whose working directory sits in the worktree holds it open and
   makes removal fail in confusing ways. Remove the remote task branch, the worktree, and
   the local task branch — in an order that verifies each holds no unique
   work before it is removed. A merged branch whose worktree survives is an
   orphan being born; worktrees must not outlive their merged work. Urgent
   work arriving mid-closeout changes none of this: the emergency gets its
   own fresh worktree, cut from the merged tip and run IN PARALLEL with the
   closeout — the merged worktree is never reused for a new objective. One
   objective per worktree, even under fire.

8. **Record the closeout.** Merge commit, review verdict and session,
   deploy or smoke evidence where applicable, and cleanup confirmation. If
   any step is deliberately deferred, that requires a dated exception with a
   named owner and cleanup date — not silence.

## Red Flags

| Rationalization | Counter-rule |
|---|---|
| "Tests passed during development, merge it" | The gate runs on the tree being integrated, now. A green memory is not a green run. |
| "I'll review my own diff, I know it best" | Knowing it best is the disqualification. The reviewer is a different session — the author's certainty is what review exists to test. |
| "The reviewer runs on the same model, so it hardly counts" | The invariant is separate session with the reviewer role, not a different vendor. What never counts is the authoring session ruling on itself. |
| "Reviewer said REVISE but they're wrong, merging anyway" | The author fixes or discusses; the author never overrides. A contested verdict escalates to the requester — it does not dissolve. |
| "Merged, so my job is done" | Merged with a live worktree and branch is an unfinished closeout. Fleet audits have found dozens of orphans from exactly this habit. |
| "I'll clean up the worktree next session" | Next session has new priorities and no memory of the loan. Cleanup deferred is an exception — dated and owned — or it is now. |
| "Smoke testing can happen after I close this out" | Where the protocol requires deploy or smoke proof, closeout without it is a claim with no receipt. The proof is part of done. |
| "Provider is erroring on PR creation, I'll push straight to the default branch" | An outage is never grounds to route around the gate. Retry the gate; the default branch takes only reviewed merges. |
| "The failure on the merged result is probably flaky" | A failing merged result stops everything. Branch and worktree stay put while it is investigated; probably-flaky is a hypothesis, not a pass. |
| "The base branch is obviously the default one" | Confirm the actual fork point. Merging into the wrong base is expensive to undo and looks correct until it isn't. |
| "An urgent fix just landed — I'll reuse this merged worktree, it's already set up" | Reuse resurrects an orphan with someone else's history. Cut a fresh worktree for the emergency and run it in parallel; closeout of the merged tree continues on its own track. |
| "The deploy check is ambiguous, so I'll delete the worktree and call it done" | Ambiguous proof is not proof — production has served a stale build for weeks behind exactly this assumption. Keep the tree, record a dated exception with an owner, and resolve the ambiguity; deletion is not how uncertainty closes. |

## Guardrails

- The reviewer is a different session from the author, reviewer role
  declared; the verdict vocabulary is APPROVE / REVISE / BLOCK.
- No merge on a pending or failing review, and no self-merge of a contested
  verdict — escalation goes to the requester.
- Deploy and smoke requirements come from the repository's protocol for the
  change class; the author does not waive them.
- Cleanup means all three: remote task branch, worktree, local task branch —
  each verified to hold no unique work first.
- Any deviation from full closeout is a dated, recorded exception with an
  owner — never an implicit one.
- The review package is complete before dispatch: diff from the true base,
  the requirements, and the evidence — a reviewer given less can only
  approve less.
- Discarding the work instead of integrating it happens only on the
  requester's explicit, confirmed instruction — it is never offered as a
  convenience or inferred from silence.
- A worktree kept alive for PR iteration is still a recorded loan with an
  owner; "kept for feedback" is a reason, not an exemption from tracking.

## Stop Conditions

Halt and escalate to the requester when:

- The suite fails on the merged result — leave everything in place and
  investigate before anything else moves.
- The review verdict is BLOCK, or REVISE items are contested after a fix
  round — the fork goes up, not around.
- Merge, deploy, or branch-deletion authority for this repository is gated
  above your role — name the holder and hand off.
- Cleanup would touch a worktree or branch containing work not contained on
  any remote — rescue and ask first.
- The push is rejected because the remote moved — investigate what landed
  there; force-push happens only on the requester's explicit instruction.
- The change class is ambiguous — unclear whether deploy or smoke proof is
  required — resolve against the protocol before declaring closeout, not
  after.

## Claim Ceiling

Completing this skill proves this branch was independently reviewed, merged
on an approving verdict, proven to the level its protocol requires, and
fully cleaned up. It does NOT prove the feature is correct in production
beyond the recorded proof, and it makes no claim about revenue, users, or
product state — those claims need their own evidence, always.
