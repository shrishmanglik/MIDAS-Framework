# MIDAS-BRIDGE-002 — wshobson/agents distillation into MIDAS

**Issued:** 2026-08-05 CEO kernel · **Method:** distill + rebuild native, never copy ·
**Source:** `wshobson/agents` (MIT, vendored at
`frameworks/external-intake-staging/wshobson-agents`: 92 plugins, 199 agents, 162
skills, 106 commands, 16 orchestrators) · **Target:** `open-source/midas-framework`
via main+PR · **Evidence:** comparative inventory 2026-08-05 (session record) ·
**Sequence:** after BRIDGE-001 MB-1 (injection) — personas without injection are inert.

## The verdict

wshobson and MIDAS are orthogonal layers of one agent system:
- **wshobson = the persona/knowledge layer.** 199 domain agents (~142 lines each:
  Purpose / Philosophy / Capabilities / Behavioral Traits / Workflow Position /
  Response Approach / "vs X" disambiguation), a 5-tier model scheme (measured: 68
  sonnet, 54 opus, 52 inherit, 25 haiku), orchestrator plugins with named handoff
  chains (e.g. a 7-agent full-stack sequence), and `plugin-eval`'s 3-layer QC
  (static → LLM-judge → Monte Carlo).
- **MIDAS = the contract layer.** 4 RBAC profiles with schema'd permissions, semantic
  invariants enforced in code (non-mutating roles cannot gain `edit:allow`), maxSteps
  budgets, deny-by-default on researcher/reviewer. **Zero persona content, zero model
  routing, zero orchestration beyond one linear YAML.**
- **Prior-art correction (recorded):** the 539 files under `vcos/*/distilled/wshobson/`
  are byte-identical copies with provenance/prefixing only — explicitly INTAKE, never
  adapted, designed to fail `midas validate-pack --strict`. The distillation transform
  this bridge performs has not happened anywhere yet. Those files remain INTAKE; MW-2's
  adapted roster becomes the promotion path.

**The bridge: fuse persona and contract into ONE agent format — the file that tells an
agent how to think AND is machine-validated for what it may do.** Neither source has
that fusion; it is the novel artifact.

## The build — bounded contracts (each: PR + independent review + eval proof)

**MW-1 — The fused agent format (`midas.agent.v1`).** Frontmatter: name · description
("Use when…", never process-summarizing per BRIDGE-001's rule) · license ·
**model-tier + escalation policy wired to OUR §2c routing** (a tier assignment is not a
label: routing DOWN requires the gold-reference + deterministic-check flags in the
frontmatter; escalation-on-repeated-failure is data) · embedded contract block
(permissions over the 6 keys, maxSteps) validated by the existing semantic invariants.
Body: their persona skeleton (Purpose / Capabilities / Behavioral Traits / Workflow
Position / Response Approach / vs-X disambiguation) + our Guardrails + Claim Ceiling.
Validator extended; persona budget enforced (≤200 lines). Done: schema + validator +
one gold exemplar agent passing strict.

**MW-2 — The seed roster (the real distillation, ~14 agents).** Not 199 imports — a
curated roster mapped to MIDAS's actual workflow steps: personas for the 4 contract
roles (planner/builder/reviewer/researcher — finally giving the RBAC shells minds) +
the domain specialists a software company actually dispatches: backend-architect,
frontend-developer, security-auditor, code-reviewer, test-automator,
deployment-engineer, database/data-engineer, debugger, docs-engineer, performance-
engineer. Each ADAPTED: budget-trimmed, our doctrine embedded (deterministic-first,
verification doctrine, reviewer invariant), provenance + MIT attribution per file.
Done: every roster agent passes MW-1 strict validation + the MB-3 eval tier.

**MW-3 — Orchestration as contracts.** Their prose handoff chains rebuilt as schema'd
workflow data: `midas.workflow.v2` — steps carry named agent assignments, handoff
conditions (After / Complements / Enables as machine-readable edges), and model-tier
per step. `software-delivery.yaml` upgraded to v2 as the reference orchestrator; one
full-stack chain shipped as the second. Done: validator enforces agent-reference
integrity (a workflow naming a nonexistent agent fails — the paths_real lesson).

**MW-4 — Persona QC (their plugin-eval, rebuilt on our rig).** Layer 1 static =
extended validator (exists) · Layer 2 = LLM-judge rubric over the persona sections
(clarity, disambiguation, doctrine presence) · Layer 3 = behavioral pressure evals via
the BRIDGE-001 MB-3 harness. Graded report per agent; regression = red gate. No Elo
theater — pass/fail with a graded appendix. Done: QC runs over the full MW-2 roster in
CI-form locally.

## Preserved un-regressed

Permission schema + semantic invariants, maxSteps, deny-by-default postures,
schemaVersion lifecycle — the contract layer stays the spine; personas hang off it,
never replace it.

## Routing

Same lane as BRIDGE-001 (dev-studio MIDAS Codex chat), MW contracts after MB-1 lands;
reviewer separate per contract; NOTICE attribution alongside Superpowers'. The VCOS
private INTAKE trees are untouched by this bridge — departments promote from MW-2's
adapted roster when they claim agents, per the existing PROVENANCE contract.
