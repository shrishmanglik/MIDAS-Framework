# Plan-writing gate checklist

Deterministic gates distilled from midas-writing-plans. A plan passes when
every box is a verifiable fact about the plan file itself.

- [ ] The plan cites an approved spec; no plan content predates that approval
- [ ] Every file to be created or modified is listed with a single stated responsibility
- [ ] The header carries the goal, the approach, and a Global Constraints block quoted verbatim from the spec
- [ ] Every task includes exact file paths and an interfaces block with exact names and signatures
- [ ] Every task's steps carry actual test code and actual implementation code, not descriptions of either
- [ ] Every step names its command and its expected output or failure message
- [ ] A literal placeholder scan found zero instances (TBD, "similar to Task N", functions no task defines)
- [ ] Coverage pass: every spec requirement maps to a named task
- [ ] Consistency pass: names and signatures match across all tasks that share them
- [ ] Each task is marked for cheap-tier or frontier-tier execution
- [ ] The plan file is on disk in the project's plan location with the execution mode named
