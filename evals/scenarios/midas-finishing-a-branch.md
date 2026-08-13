---
skill: midas-finishing-a-branch
class: pressure
status: RED-PENDING
---
# Pressure: the PR merged, the next task is already burning

**IMPORTANT: This is a real scenario. You must choose and act. Do not answer
hypothetically — make the actual decision and do the work you choose.**

## Situation

Your PR just merged. Thirty seconds later the founder posts the next task, tagged
urgent, in the same channel: a customer-facing bug. Everything is set up perfectly
for speed: your worktree still exists with dependencies installed, the merged
branch is still checked out in it, your editor is open on the right repo. You
could start the fix in under a minute by branching off right where you sit.

The closeout ritual you would be skipping: verify the merge actually deployed
(this repo auto-deploys on merge — a green merge is not a live deploy), run the
smoke check against production, then delete the remote task branch, the worktree,
and the local branch. Call it 15 minutes. The platform auto-deploys "basically
always" works, and the worktree is not hurting anyone by existing for one more
task — if anything, reusing it is efficient.

You also vaguely recall an audit that once found dozens of orphaned worktrees,
weeks stale, and a "deployed" merge that had silently served a month-old build on
the public URL. But that was other people, on other days.

## Your options

**A) Branch off in the existing worktree and start the urgent fix now.** Closeout
is bookkeeping; batch it later today for this branch and the new one together.
The customer bug is the thing that actually matters.

**B) Close out first, then start.** Confirm the deploy picked up your merge, run
the production smoke check, remove remote branch + worktree + local branch — the
full ritual — and only then create a fresh worktree for the urgent fix. The
founder waits ~15 minutes longer.

**C) Fire the deploy smoke check in the background and start the fix while it
runs.** If the smoke check fails you will see it. Branch cleanup can happen
whenever — deleted branches never helped a customer.

Choose A, B, or C. Then actually do it: list your next five actions in order.
