---
name: midas-worktree-lifecycle
description: Isolated-workspace discipline for repository work. Use when starting any repository-changing task, before the first file is edited, and when handling existing or stale worktrees.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Worktree Lifecycle

## Purpose

Every repository mutation happens on a task branch in an isolated workspace,
cut from a verified base. The default branch is read-only working surface —
merge and platform sync land on it; editors never do. A worktree is a loan
against the repository: opened deliberately, tracked while alive, repaid on
close.

## The Process

1. **Detect existing isolation before creating any.** Check whether the
   current directory is already a linked worktree (and not a submodule, which
   mimics one). If already isolated, use what exists — a second worktree
   stacked on a first is sprawl with extra steps.

2. **Verify the base before branching.** Name the repository, the default
   branch, and the exact base commit, and confirm the base is the reviewed
   truth — not a stale local tip. Record all three; a branch cut from an
   unverified base inherits unreviewed state invisibly.

3. **Prefer the harness's native worktree tooling.** If the platform provides
   a worktree mechanism, use it — it owns placement, branch creation, and
   cleanup. Manual git worktrees are the fallback, created in the designated
   worktree area outside any working tree, never nested inside one.

4. **Confirm the worktree location cannot be committed.** A project-local
   worktree directory must be ignored by the repository before the worktree
   is created inside it — an unignored worktree directory commits an entire
   second tree into the repo.

5. **Establish a clean baseline.** Install dependencies, run the suite, and
   record the result before the first edit. A dirty baseline makes every
   later failure ambiguous: yours, or inherited? If the baseline fails,
   report it and get a decision before building on it.

6. **Record the loan.** Every live worktree has a named owner, a reason, and
   an expected cleanup point, written down. A worktree without those three is
   already orphaned — it just has not aged yet.

7. **Push the task branch early and often.** An unpushed branch has exactly
   one copy, on one disk, in one failure domain. Pushing is the backup, the
   review surface, and the recovery point; it is not the merge.

8. **Keep the loan visible while the work runs.** A worktree that outlives
   its expected cleanup point is re-justified or closed — the record gets a
   new dated reason or the tree gets the rescue-then-remove treatment. Stale
   loans that nobody re-examines are how a repository accumulates dozens of
   orphans between audits.

9. **Rescue-then-remove for any dirty or stale worktree.** Before removing a
   worktree that is not provably clean: archive uncommitted diffs to a dated
   rescue location, push any branch or detached HEAD not already contained
   on the remote (as a rescue branch if unnamed), and only then remove and
   prune. Bulk deletion of unaudited worktrees destroys unique work silently.

## Red Flags

| Rationalization | Counter-rule |
|---|---|
| "It's a tiny fix, I'll edit on the default branch" | Size does not change the rule. The default branch takes merges, never edits — a one-line edit there is one line of unreviewed prod truth. |
| "I'll create the worktree after I've explored a bit" | Exploration becomes edits without announcing itself. Isolation comes first or arrives too late. |
| "The base is surely current, I pulled recently" | "Recently" is not a commit SHA. Verify and record the base; branches inherit whatever it actually was. |
| "I'll push once the work is finished" | Until pushed, the branch shares a failure domain with the machine. Unpushed work is one disk failure from nonexistent. |
| "This stale worktree looks empty, deleting it" | Looks-empty is how unique work dies — detached HEADs and untracked files hide from a glance. Rescue first, remove second. |
| "The baseline suite probably passes, starting anyway" | An unrecorded baseline makes every later failure unattributable. Run it, record it, then build. |
| "I'll reuse this old worktree for the new task" | A worktree carries its task's state and its branch's history. New task, fresh worktree from a fresh verified base. |
| "Cleanup can wait until someone notices" | Untracked worktrees compound into fleet-wide sprawl — dozens of orphans have been found weeks stale. The loan is recorded at creation. |
| "The audit script says the tree is clean, safe to delete" | Truncated output and capped timeouts both read as "clean" while checking nothing. Prove the audit saw the whole tree before acting on its verdict. |
| "Another session is in this repo, but we won't collide" | Parallel writers in one tree collide through the index, not through intentions. Read the other session's changes, coordinate, or move to a separate worktree. |

## Guardrails

- No edit, ever, on the verified default branch, regardless of its name —
  read-only except platform merge and sync.
- One task, one worktree, one branch — no sharing a worktree across tasks or
  running parallel writers in one tree.
- Worktrees live in the designated worktree area, never nested inside a
  working tree.
- Base commit, workspace mode, and owner are recorded before the first
  mutation, per the repository lifecycle protocol.
- Long-lived processes started from the worktree (dev servers, databases,
  watchers) are spawned to survive the session or shut down before it ends —
  a process that dies with the session leaves state mid-write.
- Dependency installs are serialized against builds and never interrupted
  mid-flight; a gutted package tree fakes tool failures for every session
  that follows.
- The mirror or backup surface is never the edit surface: edits happen in
  the working tier only, and the worktree area is part of that tier.
- Removal is never the first operation on a dirty tree — rescue precedes
  removal, always.
- Version control is the primary backup for code: pushed early, pushed
  often, so the remote holds its own copy of every branch that matters.
- A worktree that resists deletion is usually held open by a live session's
  working directory — find the holder; never force the lock.
- Branch names state the task; a branch named after nothing is untraceable
  in every later audit.

## Stop Conditions

Halt and escalate when:

- The baseline suite fails before your first edit — the decision to proceed
  on a red base belongs to the requester.
- The worktree area or repository shows signs of another live session's work
  (locks, fresh commits you did not make) — coordinate, do not overwrite.
- A worktree slated for cleanup contains diffs or commits not contained on
  any remote and their intent is unclear — rescue and ask, do not judge and
  delete.
- The isolation mechanism itself fails (permission denial, locked area) —
  report the constraint and get an explicit decision before working
  unisolated; working in place is a recorded choice, never a silent default.

## Claim Ceiling

Completing this skill proves the work happened isolated on a task branch cut
from a recorded, verified base, with a recorded owner and a green (or
explicitly accepted) baseline. It does NOT prove the work itself is correct,
reviewed, merged, or cleaned up — review belongs to code review, and
closeout, including worktree removal, belongs to finishing the branch.
