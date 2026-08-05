# Verification-before-done gate checklist

Deterministic gates distilled from midas-verification-before-done. Check each
against the session record before any completion claim leaves it.

- [ ] Every completion claim names the command that proves it
- [ ] Command output was read in full; counts are stated as counts (e.g. 34/34), not summaries
- [ ] No exit code was treated as proof on its own
- [ ] Every empty search or filter result was preceded by a known-positive run proving the pattern
- [ ] Each guarding check was run against a must-pass case and a must-fail case
- [ ] The diff stat was compared file-by-file against the intended edit list
- [ ] Delegated work was verified against the tree, not accepted from the worker's report
- [ ] Acceptance criteria were re-read verbatim before the final run
- [ ] Every claim in the report is labeled verified, asserted, unknown, or blocked
- [ ] No safety-relevant check was piped through head, truncation, or a capped timeout
