# MIDAS Skill Evals â€” Pressure-Scenario Tier (MB-3 / MW-4 Layer 3)

Deterministic tests (`test/`) prove the framework's code works. This tier proves the
**skills change agent behavior under pressure** â€” the only claim that matters for a
discipline skill, and one no unit test can make.

Live-LLM runs happen in **agent sessions, not CI**. What runs in CI is the
deterministic layer (`lib/eval-library.mjs`, wired into `npm test`): every discipline
skill has a scenario file, every scenario has valid frontmatter and a legal status,
and no scenario points at a skill that does not exist on disk.

## The RED/GREEN methodology

A skill earns GREEN by demonstrably closing loopholes that were **recorded, verbatim,
from a real baseline failure** â€” never loopholes we imagined an agent might use.

1. **Write the pressure scenario** (`scenarios/<skill-name>.md`). A realistic,
   concrete situation engineered to make violating the skill the attractive choice:
   time pressure, authority pressure, sunk cost, a plausible-sounding shortcut.
   Status starts at `RED-PENDING`.

2. **RED â€” baseline without the skill.** Fresh agent session, zero prior context,
   the skill NOT loaded. Paste the scenario body verbatim as the user message. The
   agent must choose and act. Capture its rationalizations **verbatim** â€” the exact
   sentences it used to justify the shortcut â€” into a transcript at
   `transcripts/<skill-name>/red-baseline-<nnn>.md`. Set status `RED-CAPTURED`.
   A baseline that complies without the skill means one of two things: the
   scenario's pressure is too weak (sharpen it, do not celebrate) â€” or the run was
   not actually clean. Check the baseline tier (below) before concluding either.

3. **GREEN â€” the skill must close the recorded loopholes.** Check the skill's Red
   Flags / rationalization table against the captured transcript. Every recorded
   rationalization must be named and neutralized by the skill text â€” if one is
   missing, extend the skill (that is the whole point of capturing them). Then
   re-run: fresh session, skill loaded, same scenario verbatim. The agent must
   comply. Store the transcript at `transcripts/<skill-name>/green-YYYYMMDD-<n>.md`
   and set status `GREEN`.

4. **Regression.** Any edit to a GREEN skill's behavioral content re-opens the
   question. Re-run the scenario; a GREEN scenario that fails on re-run is set to
   `REGRESSED` and is a red gate â€” the skill edit does not merge until it is GREEN
   again. Controls are proven, not installed.

**The judge key is the skill itself.** The verifier compares the transcript against
the skill's own Red Flags table and process steps. Scenarios deliberately contain no
answer key in their body â€” the body is pasted verbatim to the agent under test, so
anything in it leaks.

## Baseline tiers â€” clean-room vs doctrine-loaded

A baseline is only as meaningful as what was loaded when it ran. Two tiers exist,
and every transcript declares its tier in frontmatter (`tier:`); every scenario
whose status moved on a baseline records the tier beside the status
(`baseline-tier:` + `status-note:` in the scenario frontmatter).

| Tier | Conditions | What it measures |
|---|---|---|
| `clean-room` | No project canon, no memory, no tools â€” the scenario body only, in a fresh session | Whether the skill alone changes behavior. **REQUIRED for any open-source framework claim** â€” the framework ships without our ambient canon, so only this tier speaks for what a downstream user gets. |
| `doctrine-loaded` | Run inside the estate harness, which auto-loads the estate's CLAUDE.md and memory, with live tool access | Skill-beyond-ambient-doctrine: what the skill must add on top of an already-doctrinated agent. Also the harvest surface for which ambient counters are load-bearing. |

**Why this taxonomy exists (2026-08-05 finding).** The first 10 RED baselines ran
as fresh sonnet sessions inside the estate harness. Every completed run chose the
disciplined option â€” and every one cited ambient estate doctrine (the estate's
CLAUDE.md/memory, loaded automatically by the harness) and used live tools. Those
runs are not clean no-guidance controls; they are doctrine-loaded baselines, a
tier that did not exist in this README until they exposed it. The refinement they
funded: the load-bearing counters each run pulled from ambient doctrine were
embedded into the skills themselves, because the open-source framework ships
without that ambient canon.

**Binding rule:** `RED-CAPTURED` from a doctrine-loaded run does NOT satisfy the
clean-room requirement. A scenario carrying `baseline-tier: doctrine-loaded` still
owes a clean-room RED before any GREEN claimed for the open-source framework means
anything. The doctrine-loaded capture is kept â€” it is real evidence about the
ambient tier â€” but it moves no scenario past the clean-room gate.

## Status lifecycle

| Status | Meaning |
|---|---|
| `RED-PENDING` | Scenario written; no baseline run captured yet |
| `RED-CAPTURED` | Baseline run recorded verbatim in `transcripts/`, tier declared. A doctrine-loaded capture leaves the clean-room RED still owed (see Baseline tiers). |
| `GREEN` | Skill demonstrably closes the recorded loopholes on re-run |
| `REGRESSED` | Previously GREEN; failed on re-run after a skill edit. Red gate. |

Statuses only move forward on transcript evidence. Setting `GREEN` without a stored
RED and GREEN transcript pair is the exact defect class this tier exists to catch.

## Micro-test guidance

Full session evals are slow (minutes each). Before spending one, micro-test the
scenario's pressure: paste only the decision core â€” the situation plus the options,
~15 lines â€” at a cheap model and see which option it defends. Iterate the wording
until the baseline reliably picks the shortcut. A scenario that fails to tempt needs
sharper pressure and more concrete stakes, not more words. Micro-tests are throwaway;
only full fresh-session runs produce transcripts that can move a status.

## How a harness session executes a scenario

1. **Fresh session, no prior context** â€” a compacted or resumed session is not a
   baseline; the bootstrap or prior turns contaminate it.
2. RED runs: skill absent. GREEN runs: skill present via the normal injection path
   (the skill must auto-trigger; hand-feeding it is not an integration).
3. Paste the scenario body â€” everything below the frontmatter â€” verbatim as the
   user message. Do not paraphrase, do not add framing.
4. The agent must **choose and act**, not discuss hypothetically. If it asks
   clarifying questions to escape the choice, answer with "you have to decide now"
   and nothing else.
5. Save the full transcript under `transcripts/<skill-name>/`. Update the scenario's
   `status` frontmatter in the same change.
6. **The verifier is a separate session** from the runner (reviewer invariant:
   different session, verdict only, never edits). It loads the skill, the scenario,
   and the transcript, and rules comply / violate with quoted evidence.

## Coverage rule (deterministic, runs in CI)

Every `framework/skills/midas-*` skill MUST have `scenarios/<skill-name>.md`, and
every scenario MUST name a skill directory that exists â€” a scenario pointing at a
nonexistent skill dies on step one, exactly like a workflow reading a nonexistent
file. `lib/eval-library.mjs` enforces both directions; `npm test` fails on drift.
