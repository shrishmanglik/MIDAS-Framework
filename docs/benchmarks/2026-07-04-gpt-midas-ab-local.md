# Local GPT vs GPT+MIDAS A/B Benchmark - BMAD Upgrade Slice

Date: 2026-07-04

Status: local evidence only

This is not an official Humanity's Last Exam, SWE-bench, or Terminal-Bench score. It is a local process-control benchmark run on the MIDAS framework BMAD-upgrade slice.

## Why This Benchmark Exists

The goal was to compare the evidence quality of the same GPT-class implementation task under two operating modes:

1. Normal execution: implement the requested framework upgrade directly, then run standard tests.
2. GPT + MIDAS execution: evaluate the same completed task through MIDAS-style requirement tracing, workflow validation, docs-staleness checks, skill-pack validation, and repository validation.

This benchmark does not claim a model capability uplift. It measures whether MIDAS adds deterministic development controls around a GPT-class coding run.

## Task Under Test

Upgrade MIDAS with BMAD-derived agentic agile controls without copying BMAD blindly:

- [ ] REQ-001: Expose CLI commands for local planning, verification-gap receipts, UX spine validation, docs-staleness checks, and strict skill-pack validation.
- [ ] REQ-002: Add a local-first planning suite that creates PRD, DESIGN, EXPERIENCE, and handoff artifacts.
- [ ] REQ-003: Add verification-gap receipts that trace PRD or work-order requirements against implementation evidence.
- [ ] REQ-004: Add UX spine validation that maps design components to experience flows.
- [ ] REQ-005: Add docs-staleness checks that flag source changes without matching documentation movement.
- [ ] REQ-006: Add strict skill-pack validation for frontmatter, descriptions, and unsafe tool declarations.
- [ ] REQ-007: Update installer and repository validator support for `.midas/planning` and `.midas/reports`.
- [ ] REQ-008: Update the software-delivery workflow so planning, UX spine, verification-gap, and docs-staleness gates exist before completion claims.

## Normal Execution Evidence

Normal execution produced working framework code and standard test evidence:

- `npm.cmd test`: PASS, 153/153
- `midas validate .`: PASS, 93 checks, 0 failures
- `midas modules`: PASS, includes `agentic-agile`
- `docs-staleness`: PASS with source and docs changes paired

Normal execution proved the codebase is currently passing its deterministic suite. It did not, by itself, create a requirement-by-requirement receipt.

## GPT + MIDAS Evidence

The MIDAS lane adds explicit controls on top of the same implementation:

- Requirement traceability through `midas verify`
- Skill-pack strict validation through `midas validate-pack`
- UX spine validation through `midas ux-spine`
- Docs/source coupling through `midas docs-staleness`
- Repository readiness through `midas validate`
- Public claim ceiling through benchmark receipt policy tests

Executed MIDAS lane checks:

- `midas verify`: PASS, 8 requirements, 0 gaps, receipt written to `.midas/reports/verification-gap-receipt.md`
- `midas validate-pack framework/skills --strict`: PASS, 6 skills, 0 failures
- `midas docs-staleness`: PASS, source changes were paired with documentation changes
- `midas validate .`: PASS, 93 checks, 0 failures
- `npm.cmd test`: PASS, 153/153

The first `midas verify` run failed on REQ-006 because the evidence set included the strict wrapper but omitted the delegated `skill-library` validator where frontmatter and unsafe-tool rules live. Adding `lib/skill-library.mjs` to the evidence set fixed the trace. This is the exact failure mode MIDAS should expose: not just whether code exists, but whether the proof set actually covers the requirement.

## Scoring

| Dimension | Normal GPT Execution | GPT + MIDAS Execution |
| --- | --- | --- |
| Functional tests | PASS | PASS |
| Repository validation | PASS | PASS |
| Module registry proof | PASS | PASS |
| Docs/source coupling | Manual or ad hoc | Deterministic check |
| Requirement traceability | Not automatically proven | Deterministic receipt |
| UX/design-flow consistency | Not automatically proven | Deterministic check |
| Skill-pack compliance | Not automatically proven | Deterministic check |
| Public superiority claim ceiling | Manual discipline | Policy-backed tests |

## Decision

MIDAS improved the task's evidence quality, not the underlying model intelligence. The correct claim is:

MIDAS adds deterministic planning, validation, and receipt gates around GPT-class development work.

The incorrect claim is:

MIDAS makes GPT automatically score higher on official benchmarks.

## Next Benchmark

A real model-performance benchmark should use isolated fresh runs with the same task, same time budget, same hidden tests, and no shared context between lanes. Suitable benchmark families:

- SWE-bench style for real GitHub issue patching.
- Terminal-Bench style for multi-step terminal execution.
- A private MDS benchmark with hidden requirement and visual QA gates.

Humanity's Last Exam is useful for frontier academic QA, but it is not the best primary benchmark for agentic software development workflows.
