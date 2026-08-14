# Subagent-development gate checklist

Deterministic gates distilled from midas-subagent-development. Check against
the ledger and the dispatch records.

- [ ] A progress ledger on disk records task completions, fix rounds, parked findings, and commit ranges
- [ ] Each worker was dispatched fresh with only its brief, interfaces, global constraints, and report path
- [ ] The base commit was recorded before every dispatch
- [ ] No two implementation workers ran in parallel on one tree
- [ ] Every cheap-tier dispatch had a frontier-produced gold reference and a deterministic output check
- [ ] Every task diff passed both spec-compliance review and quality review
- [ ] No task exceeded five fix rounds, and rounds four and five changed the worker and raised the model tier
- [ ] Every finding still open at the cap carries a recorded ruling on the ledger
- [ ] A whole-branch review ran on the most capable available model before handoff to closeout
