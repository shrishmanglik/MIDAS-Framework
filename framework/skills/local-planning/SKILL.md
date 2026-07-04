---
name: local-planning
description: Use when a project needs local-first PRD, DESIGN, and EXPERIENCE scaffolds before expensive implementation or external planning loops.
license: Apache-2.0
compatibility: MIDAS alpha planning and work-order workflow
---
# Local Planning Skill

Read fully and follow.

## Purpose

Create source-controlled planning artifacts before implementation without depending on external web bundles or metered coding-agent loops.

## Steps

1. Run `midas plan --directory . --work-order <id> "<objective>"`.
2. Review `.midas/planning/<id>/PRD.md`.
3. Review `.midas/planning/<id>/DESIGN.md`.
4. Review `.midas/planning/<id>/EXPERIENCE.md`.
5. Fill the scaffold with project-specific details.
6. Run `midas ux-spine` and `midas verify` before implementation claims.

## Stop Conditions

- Stop if the objective is too broad for one work order.
- Stop if requirements cannot be expressed as auditable checkboxes.
- Stop if a high-risk plan needs human approval before implementation.

## Claim Ceiling

Planning artifacts are not implementation proof. They are inputs for scoped execution, verification-gap review, UX-spine alignment, and later evidence receipts.
