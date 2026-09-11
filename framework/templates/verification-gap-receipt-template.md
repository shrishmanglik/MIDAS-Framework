# MIDAS Verification-Gap Receipt

Status: TBD
Generated At: TBD
Target: TBD
Spec: TBD
Evidence Files Scanned: TBD
Requirements Audited: TBD
Gaps Found: TBD

## Requirement Trace

| ID | Status | Spec Line | Requirement | Source Evidence | Test Evidence |
|---|---|---:|---|---|---|

Statuses: `traced` means source implements it AND a test calls or asserts on a symbol that source
exports. `implemented-untested` means source matched but no qualifying test did, and it does NOT
pass. `gap` means no source matched. `untestable` means the requirement carried no distinctive
vocabulary to trace.

## Evidence that was refused

Files supplied through `--evidence-files` that resolved outside the project, were a type this check
cannot read, or could not be read at all. Listed rather than skipped silently.

## What does not count as evidence

Prose, data and markup never establish a requirement, whatever directory they sit in: a Markdown
file inside `test/` is still prose. A test counts only when it calls a symbol the matched
implementation exports, or asserts on one, outside strings and comments. A bare truthiness assertion
proves an import resolved and nothing more.

## Claim Ceiling

This is a deterministic traceability check over file contents. It does not execute your tests, so it
cannot prove a matching test asserts the right thing, that it is not skipped at runtime, or that the
implementation it calls does anything. It does not prove runtime correctness, UI quality, security,
accessibility, provider readiness or release state. Known deceptions it cannot detect are listed in
`evals/deception/README.md`; that list is maintained deliberately and is not claimed to be complete.

## Required Follow-Up

TBD
