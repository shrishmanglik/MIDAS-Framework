# MIDAS-BRIDGE-004 — BMAD-METHOD upstream diff into MIDAS

**Issued:** 2026-08-05 CEO kernel · **Frame:** MIDAS derives from BMAD v6.2.0 — this is
a DIFF-AGAINST-ANCESTOR (import only what upstream gained; record what we dropped by
design) · **Source:** `bmad-code-org/BMAD-METHOD` (MIT; "BMAD" is trademarked — use
only in ancestry attribution, never in our naming/marketing), vendored snapshot
2026-07-07 at `frameworks/external-intake-staging/BMAD-METHOD` · **Target:**
`open-source/midas-framework` via main+PR · **Evidence:** comparative inventory
2026-08-05 · **Sequence:** after wave-1 builds (MB-1/2, MW-1/2, MS-1/2).

## Imports (NEW-UPSTREAM, rebuilt native)

**MD-1 — Checklist + template pairing.** Upstream pairs every skill with
`checklist.md` + `template.md`; MIDAS has 6 templates, ZERO checklists. Import the
mechanism: each MIDAS skill MAY carry `checklist.md` (deterministic gate items) and the
validator recognizes + lints them; work-order gains the story-file pairing
(template + checklist + whitelisted-edit-sections rule — upstream's dev-story only
edits declared sections, a discipline worth its weight). Cheap, deterministic,
perfectly MIDAS-shaped.

**MD-2 — The unattended-loop contract.** Upstream's `bmad-dev-auto`/`bmad-loop`:
a spec-frontmatter STATE MACHINE (clarify → spec → implement → review → finalize)
pollable by an external orchestrator, with continue-until-HALT discipline (no
"session boundary" pauses; only HALT conditions or the final step end a run) and
`correct-course` as a structured mid-run replan. Rebuild as `midas.autorun.v1`:
work-order frontmatter carries the state; `midas next` exposes the poll surface (MCP
tool included); HALT conditions are data; correct-course is a skill. This is the
harness-thesis surface — our loop_runner becomes the orchestrator upstream imagines.

**MD-3 — Multi-lens adversarial review.** Upstream's Edge-Case-Hunter named sets and
blind-review crews, rebuilt as DATA: review lenses as a schema'd catalog
(edge-cases, security, spec-compliance, regression, claim-integrity), consumed by
MB-2's `midas-code-review` and MW-3 workflows — lens selection per change class,
never all-lenses-as-ceremony (our divergence doctrine, applied to review).

**MD-4 — Config layering + run memlog.** Upstream's 3-layer customize resolver
(skill default → team → user, deep-merged) rebuilt as `customize.json` layering in the
existing schemaVersion lifecycle; upstream's append-only `memlog` primitive fused into
our memory vault as the per-run append log (skills call it inline; the vault indexes
it) — no duplicate memory system.

**MD-5 — The readiness gate.** Upstream's check-implementation-readiness
(PASS / CONCERNS / FAIL before any implementation phase) imported into
software-delivery v2 (MW-3) as a schema'd gate step — CONCERNS requires named owners,
FAIL blocks.

## Declined, on record (dropped-by-design confirmations)

Named-persona menu theater (Mary/John/Winston…) — MW-2's roster gives personas WITH
contracts; menu-codes add no capability · the 108-technique elicitation catalog and
party-mode — ideation lives in the VCOS Divergence Engine, not the delivery framework ·
non-software expansion packs (game-dev/creative) — out of MIDAS scope; the PACK
ARCHITECTURE concept itself is already landing via MS-3 bundles · web-bundle
packaging — partially covered by `midas pack`; revisit only on demand.

## Preserved un-regressed

Authority constitution, benchmark receipts, MCP surface, verification-gap +
docs-staleness, public-boundary policy, gateway contracts — all MIDAS-unique vs
upstream; none touched.

## Routing

Same MIDAS-bridge lane; MD contracts sequence after wave-1 review lands. Reviewer
separate per contract. NOTICE gains the BMAD ancestry + trademark-respect line.
With this, the four-source distillation set (Superpowers · wshobson · anthropics/skills
· BMAD) is fully specced: injection + discipline + personas + orchestration +
conformance + packaging + meta-tooling + checklists + autorun + review lenses —
the composed system exceeds each source on its own axis while keeping the one thing
none of them have: machine-checked governance under every layer.
