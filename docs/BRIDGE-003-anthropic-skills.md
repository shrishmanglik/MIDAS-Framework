# MIDAS-BRIDGE-003 — anthropics/skills distillation into MIDAS

**Issued:** 2026-08-05 CEO kernel · **Source:** `anthropics/skills` (vendored at
`frameworks/external-intake-staging/anthropic-skills`; 17 skills, marketplace
packaging, the skill-creator meta-toolchain) · **Target:** `open-source/midas-framework`
via main+PR · **Evidence:** comparative inventory 2026-08-05 (29 files, session record)
· **Sequence:** parallel-safe with BRIDGE-002 (different surface: skill layer vs agent
layer); MS-3 depends on BRIDGE-001 MB-1's adapter work.

## LICENSE BOUNDARY — read before anything else

- **EXCLUDED as distillation sources:** `docx`, `pdf`, `pptx`, `xlsx` — proprietary
  ("all rights reserved"; extraction/redistribution/reverse-engineering forbidden).
  Nothing from their contents is distilled, summarized into MIDAS artifacts, or
  rebuilt-from-reading. Their existence and public anatomy (deterministic scripts +
  judgment prose) is unprotectable common knowledge; their content is off-limits.
- **In scope:** the 13 Apache-2.0 skills, the repo's public conventions, and the
  skill-creator meta-tooling (no license FILE — treat as in-scope for methodology
  only, not code reuse, until license clarity; flag in NOTICE).
- Adopt their THIRD_PARTY_NOTICES practice for any bundled assets MIDAS ever ships.

## The verdict

Three findings drive the design:
1. **MIDAS is already the stricter party.** Anthropic's repo ships ZERO validation; our
   validator (license gate, trigger-phrase rule, 500-line hard cap, name–dir match,
   allowed-tools blocklist, path-traversal safety, suspicious-body scan) exceeds the
   official corpus's own practice — 10/17 of their skills would fail it. Nothing here
   is regressed; strictness is a MIDAS feature.
2. **The normative spec is not in the repo** — `spec/` is a redirect stub to
   agentskills.io. Conformance work must fetch the live specification.
3. **Their meta-tooling is ahead of ours:** description-trigger optimizer with
   train/test splits, eval harness + viewer, benchmark aggregation with variance,
   blind A/B comparison, `.skill` packaging, marketplace manifests, and an `agents/`
   fourth resource category (skill-scoped subagent instructions). MIDAS validates
   skills; it cannot yet author, tune, package or benchmark them.

**The bridge: MIDAS becomes spec-conformant for interop while staying stricter
internally, and gains the authoring/packaging/benchmark toolchain — validation plus
tooling, where the official ecosystem has tooling minus validation.**

## The build — bounded contracts (each: PR + independent review + proof)

**MS-1 — Spec conformance + dual-mode validation.** Fetch the live agentskills.io
specification (record version + date in-repo); publish the divergence table (from the
2026-08-05 inventory) as `docs/SPEC-CONFORMANCE.md`; add `--interop` validation mode
(official-spec minimum: name+description only) alongside default `--strict` (full MIDAS
rules) so MIDAS-authored skills are portable to any spec-conformant harness AND
third-party skills can be graded for import. Done: both modes proven on our 6 skills +
one Apache-2.0 official skill (imports clean under interop, reports its strict gaps).

**MS-2 — Progressive disclosure as a first-class check.** Today MIDAS's cap can't tell
a well-structured 499-line skill from an unstructured dump. Add: resource-offload
detection (body over threshold with no `references/` → warn), TOC requirement for
references >300 lines, recognition of the four resource categories (`scripts/`,
`references/`, `assets/`, `agents/` — the fourth adopted from skill-creator's
pattern), and the negative-scope convention ("Do NOT use for…" in descriptions)
encouraged by lint hint. Done: validator distinguishes structured from dumped on a
constructed pair.

**MS-3 — Packaging + marketplace layer.** `.skill` single-skill packaging + a MIDAS
marketplace manifest (bundle grouping à la document-skills/example-skills) wired into
the MB-1 adapter/installer so bundles install per-harness. Done: one bundle round-trips
(package → install → auto-discovery per MB-1) on two harnesses.

**MS-4 — The skill meta-toolchain, rebuilt on our rig.** Description-trigger optimizer
(held-out scoring — merges with BRIDGE-001 MB-3's rule that descriptions never
summarize process), eval-report generation with a viewer, benchmark aggregation with
variance stats, blind A/B comparator — all integrated with the MB-3 pressure-eval tier
so one harness covers triggering (does it fire?) AND discipline (does it hold under
pressure?). No code copied from the unlicensed skill-creator scripts; methodology
rebuilt. Done: the toolchain runs over the full MIDAS skill set and produces a graded
report; one description measurably improved by the optimizer with before/after
trigger rates.

## Preserved un-regressed

Every existing strict rule. `--interop` is an additional mode, never a weakening of
default validation.

## Routing

Same MIDAS-bridge lane (dev-studio Codex chat); MS-1/MS-2 may start immediately,
MS-3 after MB-1, MS-4 with MB-3. Reviewer separate per contract. NOTICE updated
(Superpowers, wshobson, anthropics/skills-Apache-2.0-subset).
