# MIDAS-BRIDGE-001 — Superpowers distillation into MIDAS

**Issued:** 2026-08-05 CEO kernel · **Method:** distill + reverse-engineer + rebuild
native (founder doctrine — never copy-paste) · **Source:** `obra/superpowers` (MIT,
vendored at `frameworks/external-intake-staging/superpowers`; methodology attribution
recorded in the repo NOTICE on first bridged release) · **Target:** the PUBLIC repo
`open-source/midas-framework` via its own main+PR gate · **Evidence base:** comparative
inventory 2026-08-05 (~46 files read across both repos, session record).

## The verdict, stated as the design thesis

Superpowers and MIDAS are complementary halves of one framework:
- **Superpowers = behavior injection.** Session-start hook re-fires the bootstrap on
  every start/clear/compaction; skills auto-trigger via native SKILL.md discovery;
  discipline language is engineered against rationalization (Red Flags tables, tested
  loophole-closing); skills are themselves TDD'd against real agent sessions.
- **MIDAS = machine-checkable governance.** Schema-validated contracts, authority
  ordering as data, benchmark receipts with claim ceilings, declarative permissions,
  protected invariants, MCP surface. Superpowers has none of this.
- **MIDAS's root defect (found today):** adapters generate `MIDAS.md` files that no
  harness auto-loads, and no hook exists — the framework only works if something else
  tells the agent to read it. The promoted-memory claim that adapters emit SKILL.md
  frontmatter / merge AGENTS.md is NOT true of the checked-out tree — verify against
  tag `v0.1.0-alpha.0` and treat memory as stale until proven.

**The bridge: MIDAS becomes self-injecting discipline backed by machine-checked
contracts — the merged skill format (their anti-rationalization design + our
Guardrails/Stop-Conditions/Claim-Ceiling sections) is the genuinely novel artifact.**

**The strategic alignment that makes this OURS, not theirs:** Superpowers writes plans
"clear enough for an enthusiastic junior engineer with no context and poor taste."
That is *exactly* our §2c local-model standard — a plan a 7B model can execute inside
the harness. Their junior-engineer bar and our distillation thesis are the same bar.
Every bridged skill gets written to it.

## The build — bounded contracts, in order (each: PR + independent review + eval proof)

**MB-1 — The injection layer.**
Adapters emit real `SKILL.md` (frontmatter: name, description "Use when…", license,
compatibility, allowed-tools — our validator already enforces most) instead of inert
`MIDAS.md`; add `hooks/` with a SessionStart hook (start|clear|compact) injecting a new
`using-midas` bootstrap skill; keep AGENTS.md/GEMINI.md import shims for
non-hook harnesses (their porting doctrine adopted: skills name ACTIONS never tool
names; per-harness = tool-mapping reference + injector only). MIDAS twist: the
bootstrap injects the AUTHORITY ORDER and protected invariants from
`default-constitution.json` — contracts in context, not just prose. Done-condition:
fresh Claude Code/Codex/Gemini session demonstrably fires the bootstrap with zero user
action, proven by transcript.

**MB-2 — The discipline skill family** (rebuilt native, merged format; ~9 skills):
`midas-brainstorming` (Socratic spec-teasing, chunked review, HARD approval gate —
fused with our §1b interrogate-before-executing) · `midas-writing-plans` (the
7B-executable plan standard; plan-reviewer prompt) · `midas-tdd` (red/green iron law +
our doctrine: a negative test must FAIL on pre-fix source; delete-and-restart on
violation) · `midas-subagent-development` (fresh subagent per task, two-stage review
[spec then quality], capped fix-loop with model ESCALATION wired to our §2c routing
rule: cheap tier only with gold reference + deterministic check) ·
`midas-systematic-debugging` (root-cause tracing before fixes; our
adjacent-check hunt added as a named step) · `midas-verification-before-done` (our
verification doctrine as a skill: silent-success, empty-grep, exit-0-is-a-claim,
run-controls-twice) · `midas-worktree-lifecycle` + `midas-finishing-a-branch` (our
binding repo lifecycle, skill-ified) · `midas-code-review` (requesting+receiving; our
reviewer-invariant: different SESSION, verdict-only, never edits). Each skill carries
BOTH their Red-Flags/rationalization table AND our Guardrails + Claim Ceiling.
Done-condition per skill: validator green + MB-3 eval passes.

**MB-3 — The skill eval harness** (their rarest asset, rebuilt on our rig):
pressure-scenario evals (baseline WITHOUT skill captured verbatim → skill closes the
recorded loopholes → re-test) as a new tier alongside our deterministic tests —
integrate with `ops/harness/` philosophy; controls-proven-not-installed applied to
skills. Deterministic add to the skill validator: REJECT a frontmatter description
that summarizes the skill's process (their tested failure mode, made machine-checked —
the merged-DNA move in one line). Done-condition: every MB-2 skill has a RED
transcript, a GREEN transcript, and a validator rule that fails on regression.

**MB-4 — The meta-skill + contracts extension.** `midas-writing-skills` (their
authoring methodology + our file budgets and license header) · extend
`default-constitution.json`: TDD, verification-before-done and reviewer-independence
become protected invariants with named verifications · fix-loop caps and model-
escalation policy land as schema'd data, not prose. Done-condition: `midas validate`
enforces the new invariants; docs-staleness detector passes (their README already
drifted from disk — ours says 3 skills, disk has 6; fix in this contract).

## What is deliberately preserved un-Superpowered

The contract/schema layer, authority-as-data, benchmark receipts, permission profiles,
MCP surface, docs-staleness — all MIDAS-unique, all kept. The bridge adds behavior
injection; it does not soften governance into prose.

## Routing

Lead: development-studio (Kai) MIDAS lane, one Codex chat, bounded contracts MB-1→4 in
order; REVIEWER a separate session per contract; public-repo main+PR gate throughout;
NOTICE-file MIT attribution for methodology inspiration on first release containing
bridged skills. HC-K04 unaffected (this is framework work by founder direction, not
product-session drift). First verify: check `v0.1.0-alpha.0` for the missing adapter
mechanism before building MB-1 on a false premise.
