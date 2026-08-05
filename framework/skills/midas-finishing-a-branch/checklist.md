# Branch-closeout gate checklist

Deterministic gates distilled from midas-finishing-a-branch. A branch is done
when every box is a recorded fact, or a dated exception names its owner.

- [ ] The full suite ran green on the exact tree being integrated, with counts read from output
- [ ] The working tree is clean and all intended commits are on the pushed branch
- [ ] The branch diff was compared against intended scope and no unintended files remain
- [ ] The actual base and fork point were confirmed, not guessed
- [ ] Review came from a different session with the reviewer role declared
- [ ] The merge happened only on an APPROVE verdict
- [ ] The suite ran green on the merged tree
- [ ] Required deploy or smoke proof for this change class is recorded, where the protocol requires it
- [ ] Remote task branch, worktree, and local task branch are removed, each verified free of unique work
- [ ] The closeout record carries merge commit, verdict, evidence, and cleanup confirmation, or a dated exception
