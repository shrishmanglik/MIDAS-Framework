# MIDAS vs BMAD Local Executable Benchmark

Date: 2026-07-04

Status: private local validation only

BMAD reference: `D:/Million Dollar AI Studio/_tmp/framework-audit-bmad/BMAD-METHOD`

BMAD pinned commit during this run: `50b3238 feat(review): add verification-gap reviewer as a third review layer (#2535)`

## Scope

This benchmark measures local Codex-executable framework controls:

- CLI boot.
- Noninteractive install.
- Installed workspace validation.
- Strict skill-library validation.
- Verification-gap detection and pass behavior.
- UX spine detection and pass behavior.
- Docs-staleness detection and pass behavior.
- Runtime repair evidence recording.

It does not measure BMAD adoption, planning corpus breadth, web-bundle quality, prompt quality, community maturity, public leaderboard performance, or production customer outcomes.

## Command

```powershell
node .\bin\midas.mjs benchmark-bmad --directory . --bmad-directory "D:\Million Dollar AI Studio\_tmp\framework-audit-bmad\BMAD-METHOD"
```

## Result

| Framework | Passed | Score | Duration Ms |
|---|---:|---:|---:|
| MIDAS | 12/12 | 1.0000 | 3938 |
| BMAD | 1/12 | 0.0833 | 2103 |

MIDAS won this private local executable-controls benchmark.

## BMAD Failures Observed

- Noninteractive install failed locally with `clack.box is not a function`.
- Installed workspace validation was blocked because install did not complete.
- Strict skill validation failed under BMAD's local validator.
- The pinned BMAD installer did not expose deterministic local CLI commands equivalent to MIDAS `verify`, `ux-spine`, `docs-staleness`, `run-workflow`, or `observe`.

## MIDAS Evidence

- `npm.cmd test`: PASS, 156/156.
- `node .\bin\midas.mjs validate .`: PASS, 0 failures.
- `node .\bin\midas.mjs benchmark-bmad ...`: PASS, MIDAS winner.

Latest evidence directory:

```text
.midas/benchmarks/evidence/midas-vs-bmad-2026-07-04T22-29-38-843Z
```

Evidence hashes:

| Evidence | SHA-256 |
|---|---|
| raw-results.json | `874dacf8bd5793b38960865478469c732b79f4d3c77e6177f28d031605ae123a` |
| item-results.jsonl | `ef0841ea0c7a65be56eb08a237d4eb664f989ce1f58c6dfebb6513eae9449c72` |
| task-manifest.json | `86082bf4bc64392da93013009d7e8230418bb0ed08e36f4d7d35281ec695225a` |
| report.md | `5a366ae597b021c42bdc05ea7b2da0be8ba2b3ca95267b57bb04c459cdaae874` |
| run.log | `76930a6e00ad17315384c25a47b58cb2009d945be47693a90a20aecb3efd4db8` |

## Claim Boundary

Allowed claim:

```text
MIDAS outscored the pinned local BMAD checkout on this private local executable controls suite.
```

Blocked claims:

- MIDAS is globally better than BMAD.
- MIDAS is more adopted, more complete, or more mature than BMAD.
- MIDAS beats BMAD on official public benchmarks.
- MIDAS is superior for every planning or agentic development workflow.

Rerun this benchmark after MIDAS framework changes, BMAD commit changes, dependency changes, Node changes, or benchmark case changes.
