# Worktree-lifecycle gate checklist

Deterministic gates distilled from midas-worktree-lifecycle. Check against
the loan record and the repository state.

- [ ] The task runs on a task branch in an isolated worktree, never on the default branch
- [ ] Repository, default branch, and exact base commit were verified and recorded before branching
- [ ] The worktree lives in the designated worktree area, outside any working tree
- [ ] The worktree location is confirmed ignored by the repository
- [ ] A baseline dependency install and suite run were recorded before the first edit
- [ ] The loan record names an owner, a reason, and an expected cleanup point
- [ ] The task branch has been pushed to the remote
- [ ] Any dirty or stale worktree was rescued (diffs archived, uncontained heads pushed) before removal
