---
name: terminal-repair
description: Repair terminal or coding task failures from observed command output. Use when a task fails due exact paths, generated files, permissions, line endings, shebangs, data conversion, or timeout behavior.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Terminal Repair

Use this skill to turn terminal output into a bounded repair attempt.

## Workflow

1. Keep the task workspace as the default working directory unless the instruction gives an absolute output path.
2. Preserve literal paths, file names, casing, formats, whitespace, and trailing newline requirements.
3. Prefer one-line commands or encoded scripts when a terminal harness may mishandle multi-line heredocs.
4. Inspect the failing files or command output before broad edits.
5. Classify the failure before choosing a repair:
   - exact file or exact text: write only the requested file and verify bytes or newline.
   - script failure: check executable bit, readable input files, line endings, and shebang.
   - data conversion: verify source path, install or use the smallest available converter, and read the generated output back.
   - generated function: implement the general transformation rule, then test more than the shown example when possible.
   - timeout: remove unnecessary loops, installs, or exploratory commands.
6. Run the narrowest relevant verification command after the repair.
7. Record the observation and repair packet with `midas observe` when a runtime run exists.

## Guardrails

- Do not change directories away from the task workspace unless an absolute path is required.
- Do not create extra files for exact-output tasks.
- Do not let a generic strategy override the task's literal acceptance criteria.
- Do not read secrets, environment dumps, credentials, browser auth, or private keys.
- Do not use destructive cleanup to hide uncertainty.
