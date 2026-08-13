# MIDAS skill evals

Status: pressure scenarios exist; behavioral evidence is pending.

Deterministic tests in `test/` prove the framework code and scenario inventory. They do not prove that a skill changes agent behavior. That claim requires a clean-room RED/GREEN transcript pair reviewed by a separate session.

## RED/GREEN method

1. Write `scenarios/<skill-name>.md` with a concrete pressure situation. Start at `RED-PENDING`.
2. Run RED in a fresh session with no project canon, memory, tools, or skill loaded. Paste only the scenario body.
3. Store the full verbatim transcript at `transcripts/<skill-name>/red-baseline-<nnn>.md`, including runtime/model, timestamp, scenario SHA, and contamination declaration. Set `RED-CAPTURED` only after a different session verifies those conditions.
4. Update the skill so every recorded rationalization is directly countered.
5. Run GREEN in another fresh clean-room session with the skill loaded through its normal discovery path. Store the full transcript and exact skill SHA.
6. A different reviewer compares both transcripts to the scenario and skill. Only that verdict may set `GREEN`.

Summaries, excerpts, private-tree references, or in-harness sessions with ambient doctrine do not satisfy transcript evidence. They remain intake outside this public repository. This repository currently ships no RED or GREEN transcript evidence and makes no behavioral-effectiveness claim.

## Status lifecycle

| Status | Meaning |
|---|---|
| `RED-PENDING` | Scenario exists; no independently verified clean-room baseline is committed. |
| `RED-CAPTURED` | Full clean-room baseline transcript is committed and independently verified. |
| `GREEN` | A full clean-room GREEN transcript at an exact skill SHA is committed and independently verified. |
| `REGRESSED` | A previously GREEN skill failed the same scenario after a change. |

Statuses only move on repository-local, terminating transcript evidence. A scenario cannot become `GREEN` from a summary, a session note, or a deterministic coverage check.

## Transcript requirements

Every transcript must contain:

- scenario file and exact SHA,
- skill file and exact SHA, or `skill: absent` for RED,
- runtime/model identifier,
- UTC start and finish timestamps,
- contamination declaration,
- verbatim user and assistant turns,
- runner session identifier,
- separate reviewer identifier and verdict.

Redact secrets and personal data before commit. If redaction changes the behavior under review, the run is not publishable evidence.

## Deterministic coverage

`lib/eval-library.mjs` enforces that every `framework/skills/midas-*` skill has one scenario and that every scenario names a skill directory that exists. This is inventory integrity only. It does not inspect transcripts or judge behavior.

Run:

```bash
npm test
npm run validate
```

The current scenario set stays `RED-PENDING` until the clean-room process above is completed.
