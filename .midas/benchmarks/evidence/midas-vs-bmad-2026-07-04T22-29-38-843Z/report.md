# MIDAS vs BMAD Local Executable Benchmark

Generated At: 2026-07-04T22:29:38.843Z
Claim Level: private local validation
BMAD Directory: D:/Million Dollar AI Studio/_tmp/framework-audit-bmad/BMAD-METHOD
MIDAS Directory: D:/Million Dollar AI Studio/open-source/midas-framework

## Result

midas has the higher local executable benchmark score.

This benchmark measures local Codex-executable framework controls only. It does not measure public adoption, prompt corpus breadth, web-bundle quality, community health, official leaderboard performance, or production customer outcomes.

## Summary

| Framework | Passed | Score | Duration Ms |
|---|---:|---:|---:|
| midas | 12/12 | 1 | 3938 |
| bmad | 1/12 | 0.0833 | 2103 |

## Item Results

| Framework | Case | Status | Duration Ms | Expectation | Note |
|---|---|---|---:|---|---|
| midas | cli-help | pass | 174 | exit-zero |  |
| midas | install-noninteractive | pass | 465 | exit-zero |  |
| midas | workspace-validate | pass | 420 | exit-zero |  |
| midas | skill-library-strict | pass | 235 | exit-zero |  |
| midas | verification-gap-detects-missing | pass | 409 | exit-nonzero |  |
| midas | verification-gap-passes-implemented | pass | 594 | exit-zero |  |
| midas | ux-spine-detects-unmapped | pass | 386 | exit-nonzero |  |
| midas | ux-spine-passes-mapped | pass | 214 | exit-zero |  |
| midas | docs-staleness-detects-source-only | pass | 207 | exit-nonzero |  |
| midas | docs-staleness-passes-with-docs | pass | 417 | exit-zero |  |
| midas | runtime-repair-record | pass | 215 | exit-zero |  |
| midas | runtime-repair-packet | pass | 202 | exit-zero |  |
| bmad | cli-help | pass | 934 | exit-zero |  |
| bmad | install-noninteractive | fail | 946 | exit-zero |  |
| bmad | workspace-validate | fail | 0 | previous-step-required | Skipped because BMAD noninteractive install did not complete. |
| bmad | skill-library-strict | fail | 223 | exit-zero |  |
| bmad | verification-gap-detects-missing | fail | 0 | deterministic-local-cli-capability | No deterministic local CLI command is exposed by the pinned BMAD installer for this MIDAS gate. |
| bmad | verification-gap-passes-implemented | fail | 0 | deterministic-local-cli-capability | No deterministic local CLI command is exposed by the pinned BMAD installer for this MIDAS gate. |
| bmad | ux-spine-detects-unmapped | fail | 0 | deterministic-local-cli-capability | No deterministic local CLI command is exposed by the pinned BMAD installer for this MIDAS gate. |
| bmad | ux-spine-passes-mapped | fail | 0 | deterministic-local-cli-capability | No deterministic local CLI command is exposed by the pinned BMAD installer for this MIDAS gate. |
| bmad | docs-staleness-detects-source-only | fail | 0 | deterministic-local-cli-capability | No deterministic local CLI command is exposed by the pinned BMAD installer for this MIDAS gate. |
| bmad | docs-staleness-passes-with-docs | fail | 0 | deterministic-local-cli-capability | No deterministic local CLI command is exposed by the pinned BMAD installer for this MIDAS gate. |
| bmad | runtime-repair-record | fail | 0 | deterministic-local-cli-capability | No deterministic local CLI command is exposed by the pinned BMAD installer for this MIDAS gate. |
| bmad | runtime-repair-packet | fail | 0 | deterministic-local-cli-capability | No deterministic local CLI command is exposed by the pinned BMAD installer for this MIDAS gate. |

## Claim Boundary

- Allowed claim: MIDAS outscored the pinned local BMAD checkout on this private local executable controls suite.
- Not allowed: MIDAS is globally better than BMAD, more adopted, more complete, or superior on public benchmarks.
- Rerun required after MIDAS framework changes, BMAD commit changes, dependency changes, Node changes, or benchmark case changes.
