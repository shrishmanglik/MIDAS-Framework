---
name: verification
description: Select and record project verification evidence. Use when a change needs tests, builds, lint, validation, smoke checks, or release proof.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Verification

Use this skill to choose and record the smallest reliable verification set for a scoped change.

## Workflow

1. Identify the changed surface and blast radius.
2. Re-read exact acceptance criteria before choosing commands, including file names, paths, output text, whitespace, casing, and required trailing newlines.
3. Prefer focused checks for narrow changes and broader checks for shared contracts.
4. Run only safe, scoped commands declared by the project or work order.
5. Record the command, result, and any skipped checks with reason.
6. Update the work order and run ledger with evidence.

## Guardrails

- Do not claim deployment, payment, revenue, schema, or security state without direct evidence.
- Do not read secrets or `.env` values to prove a check.
- Distinguish framework validation from consumer project correctness.
- Do not let generic process guidance override exact task instructions or output-format requirements.
- Validate generated tool plans or command lists before execution; malformed plans need repair or a recorded fallback reason.
- For exact-answer or scored evaluation tasks, keep model-facing MIDAS context compact and leave the task item as the dominant prompt content.
- When process text changes exact answers, move MIDAS discipline to preflight and post-checks instead of injecting it into the answer prompt.
