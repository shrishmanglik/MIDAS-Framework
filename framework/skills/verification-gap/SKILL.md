---
name: verification-gap
description: Use when a work order is moving from implementation to review and the agent must compare requirements against implementation evidence before claiming completion.
license: Apache-2.0
compatibility: MIDAS alpha work-order and verification workflow
---
# Verification-Gap Skill

Read fully and follow.

## Purpose

Catch omitted requirements before a work order is marked complete.

## Required Inputs

- A PRD, work order, or acceptance-criteria source.
- Implementation evidence such as changed source files, tests, screenshots, logs, or receipts.
- A claim ceiling stating what remains unverified.

## Steps

1. Load the work order and requirement source.
2. Extract auditable requirement rows.
3. Run `midas verify --directory . --spec <path>` or provide `--evidence-files` for a bounded file set.
4. Read `.midas/reports/verification-gap-receipt.md`.
5. If gaps are found, route back to implementation.
6. If no gaps are found, continue to tests, build, runtime/UI proof, and human review where applicable.

## Stop Conditions

- Stop if there is no auditable spec.
- Stop if implementation evidence is missing.
- Stop if the receipt contains gaps that are not explicitly waived by a human reviewer.

## Claim Ceiling

Verification-gap only proves traceability from requirement text to local evidence. It does not prove runtime correctness, UI quality, accessibility, security, provider readiness, production deployment, or public release state.
