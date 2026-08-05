# Work-order gate checklist

Deterministic gates distilled from the work-order skill. Check against the
work order file and the run ledger.

- [ ] `.midas/project-context.md` and `.midas/sprint-status.yaml` were read before writing
- [ ] Exactly one work order was created or updated in `.midas/workorders/`
- [ ] Objective, constraints, evidence, risks, and next action are each explicitly present
- [ ] Acceptance details that depend on exact names, paths, output text, whitespace, or casing are copied verbatim
- [ ] No public, payment, deploy, destructive, or external action ran without explicit authorization in the order
- [ ] Evidence entries are concrete artifacts: commands, files, screenshots, logs, or reviewer notes
- [ ] The matching run-ledger entry was closed only after verification completed
