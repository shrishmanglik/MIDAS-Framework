---
name: work-order
description: Create, refine, or close scoped MIDAS work orders. Use when a project task needs objective, constraints, evidence, risks, and a next action.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Work Order

Use this skill to keep a project task bounded and auditable.

## Workflow

1. Read `.midas/project-context.md`.
2. Read `.midas/sprint-status.yaml`.
3. Create or update one work order in `.midas/workorders/`.
4. Copy exact acceptance details into the work order when correctness depends on names, paths, output text, whitespace, casing, or trailing newlines.
5. Keep the objective, constraints, evidence, risks, and next action explicit.
6. Close the matching run-ledger entry when verification is complete.

## Guardrails

- Do not treat a plan as implementation proof.
- Do not perform public, payment, deploy, destructive, or external actions unless the work order explicitly authorizes them.
- Keep evidence concrete: commands, files, screenshots, logs, or reviewer notes.
- Do not compress away exact task requirements; preserve literal output and format constraints.
