---
name: spine-ux
description: Use when UI or product-flow work needs synchronized DESIGN.md structure and EXPERIENCE.md user-journey evidence before implementation.
license: Apache-2.0
compatibility: MIDAS alpha interface-quality and software-delivery workflow
---
# Spine UX Skill

Read fully and follow.

## Purpose

Keep visual structure and user behavior tied together before implementation begins.

## Required Inputs

- `DESIGN.md` with explicit `Component:`, `View:`, or `Page:` entries.
- `EXPERIENCE.md` with transitions that reference those components, views, or pages.

## Steps

1. Draft or inspect `DESIGN.md`.
2. Draft or inspect `EXPERIENCE.md`.
3. Run `midas ux-spine --directory . --design <path> --experience <path>`.
4. Read `.midas/reports/ux-spine-report.md`.
5. Fix unmapped components before implementation.

## Stop Conditions

- Stop if either document is missing.
- Stop if design components do not map to experience flows.
- Stop if the work would imply runtime, accessibility, or release readiness without separate evidence.

## Claim Ceiling

UX spine proves design-to-flow alignment only. It does not prove visual polish, browser rendering, accessibility, interaction correctness, or production readiness.
