# Agent Skills Spec Conformance

Status: alpha · Covers MIDAS skill validation (`lib/skill-library.mjs`) against the
official Agent Skills specification minimum.

MIDAS validates skills more strictly than the official Agent Skills ecosystem requires.
This document records exactly where MIDAS diverges from the official spec minimum, and
how the two validation modes map onto that divergence.

## Spec source

The normative Agent Skills specification is published at **agentskills.io**. The
`spec/` directory in the `anthropics/skills` source repository is a redirect stub, not
the spec text — conformance claims must resolve against the live site, not the repo.

**TODO (owner: public benchmark maintainers):** fetch the live
agentskills.io specification from a network-verified session, record its version and
retrieval date here, and re-verify the table below against that text. Until that stamp
lands, the "official spec minimum" column reflects the 2026-08-05 comparative inventory
of the official corpus, not a version-pinned spec document.

## Divergence table — field by field

| Rule | MIDAS strict | Official spec minimum | Divergence |
|---|---|---|---|
| Frontmatter block present and parseable | FAIL if missing/broken | FAIL if missing/broken | Aligned (structural) |
| `name` format (1-64 chars, lowercase letters/digits/hyphens, no leading/trailing/double hyphen) | FAIL | FAIL | Aligned |
| `name` matches parent directory | FAIL | FAIL | Aligned |
| `description` present, 1-1024 chars | FAIL | FAIL | Aligned |
| `description` trigger phrase ("Use when"/"Use for") | FAIL | not required | MIDAS-only |
| `license` field required | FAIL | not required | MIDAS-only |
| `compatibility` 1-500 chars when present | FAIL | not required | MIDAS-only |
| `allowed-tools` token syntax + destructive/shell-pipe blocklist | FAIL | not required | MIDAS-only |
| Body non-empty | FAIL | not required | MIDAS-only |
| Body ≤ 500 lines hard cap | FAIL | recommended, not enforced | MIDAS-only-enforced |
| Reference-link path safety (workspace-relative, no `..`, no absolute, no backslash) | FAIL | not required | MIDAS-only |
| Suspicious-body scan (approval/review/verification-weakening language) | WARN | not required | MIDAS-only (advisory in both modes) |
| Progressive disclosure: body > 300 lines with no `references/` | WARN | convention, not enforced | MIDAS advisory (both modes) |
| `references/` file > 300 lines without a "Contents"/"Table of" heading in first 40 lines | WARN | convention, not enforced | MIDAS advisory (both modes) |
| Resource directories limited to `scripts/`, `references/`, `assets/`, `agents/` | WARN on unknown dirs | convention | MIDAS advisory (both modes) |
| Negative-scope clause in description ("not for", "Do NOT", "never for") | INFO hint | convention | MIDAS advisory hint (both modes) |

## The two modes

Both `validateSkillRecord` and `inspectSkillLibrary` accept `{ mode }` in their options
argument. The default is `strict`; passing an unknown mode throws.

### `strict` (default)

Full MIDAS rules. Every row in the table marked FAIL under "MIDAS strict" is a hard
failure. This is the mode used by the CLI `skills` command, workspace validation, and
the framework's own skill library. Nothing in the interop work weakens it.

### `interop`

The official-spec minimum, for two directions of portability:

- **Import grading:** a third-party skill written to the official spec can be checked
  for what it would take to meet MIDAS strictness without being rejected outright.
- **Export sanity:** a MIDAS-authored skill that passes strict already passes interop
  everywhere.

In interop mode only the aligned rows fail: frontmatter structure, name rules
(format + directory match), and description presence (1-1024 chars). Every MIDAS-only
strict rule is downgraded to a warning and additionally reported in a `strictGaps`
array on the result (each entry carries `status: 'warn'` and `strictStatus: 'fail'`),
so the exact distance from MIDAS strictness is machine-readable. Progressive-disclosure
warnings and the negative-scope hint apply identically in both modes; they are
advisories, not gaps.

## Result shape additions

- `validationMode`: `'strict'` or `'interop'` on every record and library result.
- `strictGaps`: strict rules that failed but were downgraded (always `[]` in strict mode).
- `hints`: INFO-level advisories (currently the description negative-scope hint).
  Hints never affect `status`.

Warnings never affect `status` in either mode; failures always do.
