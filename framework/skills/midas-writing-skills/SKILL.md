---
name: midas-writing-skills
description: Authoring discipline for MIDAS skill packs. Use when creating or editing any SKILL.md, paired checklist, or bundled skill resource — before the first line of skill prose is written. Not for invoking existing skills.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Writing Skills

## Purpose

A skill is an intervention against a recorded failure mode, not documentation
of a good idea. It earns its place by demonstrably changing agent behavior
under pressure, and it is tested the same way code is: shown failing without
the skill, shown passing with it. This skill governs how every MIDAS skill —
including its own revisions — gets written.

## The Process

1. **Name the failure mode before naming the skill.** Write down the specific
   bad behavior this skill prevents, with at least one real occurrence
   (a transcript, an incident, a review finding). A skill with no originating
   failure is a guess wearing a filename. The skill name is a lowercase,
   hyphenated action or discipline (1-64 chars, matching its directory) —
   never a tool name, always the behavior.

2. **Capture the RED baseline first.** Before writing skill prose, run the
   pressure scenario against an agent WITHOUT the skill and record the
   transcript verbatim. The rationalizations the baseline agent produces are
   the raw material: each one becomes a row in the Red Flags table. A skill
   written without a baseline is aimed at imagined loopholes, and closes none
   of the real ones.

3. **Write the description as a trigger, never a summary.** The description
   has exactly two jobs: state the capability in one clause, and state the
   trigger with an explicit "Use when ..." clause — the validator enforces
   this as `skill:<id>:description-trigger`. The description must NOT narrate
   the skill's process; a description that summarizes the steps lets agents
   follow the summary and skip the skill body — the tested failure mode this
   rule exists for, surfaced by the validator as `skill:<id>:description-process`.
   Add a negative-scope clause ("Not for ...") so near-miss triggers decline.

4. **Write the body in the house format.** Purpose (why the discipline
   exists, in terms of what failing looks like) · The Process (numbered,
   imperative, each step checkable) · Red Flags (a table pairing each
   recorded rationalization with its counter-rule) · Guardrails (standing
   rules that hold throughout) · Stop Conditions (when to halt and escalate
   rather than continue) · Claim Ceiling (what completing the skill proves,
   and explicitly what it does NOT prove).

5. **Respect the budgets.** SKILL.md body stays under 500 lines (hard
   validator failure) and should stay lean well before that: past 300 lines,
   move deep detail into `references/` files beside the skill — the
   progressive-disclosure warning fires for a reason. Reference files over
   300 lines carry a Contents heading in their first 40 lines. Recognized
   resource directories are `scripts/`, `references/`, `assets/`, `agents/`.

6. **Carry the license header.** Frontmatter declares `license` (Apache-2.0
   for MIDAS-authored skills) — a missing license is a strict-mode failure.
   Declare `compatibility`, and `allowed-tools` only for tools the skill
   actually needs; destructive or shell-pipe tokens are rejected outright.

7. **Pair the checklist.** A discipline skill ships with a `checklist.md`
   beside its SKILL.md: 3-40 checkbox items (`- [ ] ...`), each a
   deterministic, checkable FACT about the task record — "the failing run is
   quoted", never "the work is good". Distill items from the skill's own
   Process and Guardrails; an item that cannot be verified by a session with
   no other context is a vibe, and vibes do not gate. The validator lints
   the checklist and fails malformed, empty, or out-of-budget item lists.

8. **Close the loopholes GREEN.** Re-run the recorded pressure scenario WITH
   the skill loaded. Every rationalization from the RED transcript must be
   met by a specific counter-rule the agent visibly obeys. A loophole the
   agent still exploits means the skill text is edited and re-tested — not
   annotated with hope. Keep both transcripts with the skill's evidence.

9. **Validate before shipping.** Run the skill-library validation on the
   library with the new skill in place and read the findings: failures are
   fixed, warnings are either fixed or explicitly accepted with a reason.
   The default library ships with zero structural warnings.

## Red Flags

| Rationalization | Counter-rule |
|---|---|
| "The description should explain how the skill works" | A process-summarizing description invites acting on the summary and skipping the body. Capability + trigger only; the validator rejects the rest. |
| "I know the failure mode, I don't need a baseline" | Imagined loopholes and real ones differ every time. The RED transcript is the requirement source; without it the Red Flags table is fiction. |
| "The skill is obviously right, testing it is overhead" | A skill is behavior change under pressure, and pressure is exactly what untested prose fails under. RED then GREEN, recorded, or it is a draft. |
| "I'll write the checklist from what the skill should achieve" | Checklists gate on checkable facts distilled from Process and Guardrails. Outcome wishes ("code is clean") cannot be checked and therefore gate nothing. |
| "More detail makes the skill stronger" | Past the budget, detail is where discipline goes to hide. Lean body, references for depth — the enforced limits are the design. |
| "This trigger is close enough, agents will figure it out" | Vague triggers fire never or always. "Use when" plus a negative scope is what routes a skill correctly at speed. |
| "I'll fix the loophole by adding a paragraph" | Loopholes close when the re-test shows the behavior changed. Prose added without a re-run is annotation, not repair. |
| "The license header is boilerplate, skip it" | Unlicensed text cannot be redistributed and fails strict validation. The header is part of the artifact. |

## Guardrails

- Every skill names its originating failure; a skill with no recorded
  occurrence does not ship.
- Descriptions carry a "Use when" trigger and no process narration — both
  machine-checked by the validator.
- Red Flags rows come from recorded rationalizations (baseline transcripts,
  incidents, reviews), never from imagination alone.
- The RED transcript, the GREEN transcript, and the validator run are the
  skill's evidence trio; a skill missing any of the three is unproven.
- Checklist items are deterministic facts a cold session can verify; each
  distills a specific Process step or Guardrail of its own skill.
- Skills name actions and disciplines, never tools — harness-specific
  mappings live in adapters, keeping every skill portable.
- Editing an existing skill inherits its evidence obligations: a changed
  counter-rule is re-tested against the scenario it claims to close.
- Skill work is framework work: it follows work-order scoping and the
  reviewer-session-independence invariant like any other change.

## Stop Conditions

Halt and escalate to the requester when:

- No real occurrence of the failure mode can be produced — the skill may be
  solving a problem that does not exist; that is a scoping decision, not an
  authoring one.
- The RED baseline shows the agent already behaves correctly without the
  skill — adding one anyway is budget spent buying nothing.
- The GREEN re-test still exploits a loophole after two edit-and-re-test
  rounds — the intervention design is wrong, and iterating prose will not
  fix a structural miss.
- Two skills' triggers collide on the same scenario — routing between them
  is a library design call, made deliberately, not resolved by whichever
  description shouts loudest.

## Claim Ceiling

Completing this skill proves the new or edited skill passes validation, is
paired with a lint-clean checklist, and has RED and GREEN transcripts showing
it changes behavior in its recorded scenario. It does NOT prove the skill
generalizes beyond that scenario, that agents will always trigger it, or
that the discipline it encodes is itself correct — those claims accrue from
use, incident data, and review over time.
