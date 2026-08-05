# MIDAS Skill Evals — Pressure-Scenario Tier (MB-3 / MW-4 Layer 3)

Deterministic tests (`test/`) prove the framework's code works. This tier proves the
**skills change agent behavior under pressure** — the only claim that matters for a
discipline skill, and one no unit test can make.

Live-LLM runs happen in **agent sessions, not CI**. What runs in CI is the
deterministic layer (`lib/eval-library.mjs`, wired into `npm test`): every discipline
skill has a scenario file, every scenario has valid frontmatter and a legal status,
and no scenario points at a skill that does not exist on disk.

## The RED/GREEN methodology

A skill earns GREEN by demonstrably closing loopholes that were **recorded, verbatim,
from a real baseline failure** — never loopholes we imagined an agent might use.

1. **Write the pressure scenario** (`scenarios/<skill-name>.md`). A realistic,
   concrete situation engineered to make violating the skill the attractive choice:
   time pressure, authority pressure, sunk cost, a plausible-sounding shortcut.
   Status starts at `RED-PENDING`.

2. **RED — baseline without the skill.** Fresh agent session, zero prior context,
   the skill NOT loaded. Paste the scenario body verbatim as the user message. The
   agent must choose and act. Capture its rationalizations **verbatim** — the exact
   sentences it used to justify the shortcut — into a transcript at
   `transcripts/<skill-name>/red-YYYYMMDD-<n>.md`. Set status `RED-CAPTURED`.
   A baseline that complies without the skill means the scenario's pressure is too
   weak: sharpen the scenario, do not celebrate.

3. **GREEN — the skill must close the recorded loopholes.** Check the skill's Red
   Flags / rationalization table against the captured transcript. Every recorded
   rationalization must be named and neutralized by the skill text — if one is
   missing, extend the skill (that is the whole point of capturing them). Then
   re-run: fresh session, skill loaded, same scenario verbatim. The agent must
   comply. Store the transcript at `transcripts/<skill-name>/green-YYYYMMDD-<n>.md`
   and set status `GREEN`.

4. **Regression.** Any edit to a GREEN skill's behavioral content re-opens the
   question. Re-run the scenario; a GREEN scenario that fails on re-run is set to
   `REGRESSED` and is a red gate — the skill edit does not merge until it is GREEN
   again. Controls are proven, not installed.

**The judge key is the skill itself.** The verifier compares the transcript against
the skill's own Red Flags table and process steps. Scenarios deliberately contain no
answer key in their body — the body is pasted verbatim to the agent under test, so
anything in it leaks.

## Status lifecycle

| Status | Meaning |
|---|---|
| `RED-PENDING` | Scenario written; no baseline run captured yet |
| `RED-CAPTURED` | Baseline failure recorded verbatim in `transcripts/` |
| `GREEN` | Skill demonstrably closes the recorded loopholes on re-run |
| `REGRESSED` | Previously GREEN; failed on re-run after a skill edit. Red gate. |

Statuses only move forward on transcript evidence. Setting `GREEN` without a stored
RED and GREEN transcript pair is the exact defect class this tier exists to catch.

## Micro-test guidance

Full session evals are slow (minutes each). Before spending one, micro-test the
scenario's pressure: paste only the decision core — the situation plus the options,
~15 lines — at a cheap model and see which option it defends. Iterate the wording
until the baseline reliably picks the shortcut. A scenario that fails to tempt needs
sharper pressure and more concrete stakes, not more words. Micro-tests are throwaway;
only full fresh-session runs produce transcripts that can move a status.

## How a harness session executes a scenario

1. **Fresh session, no prior context** — a compacted or resumed session is not a
   baseline; the bootstrap or prior turns contaminate it.
2. RED runs: skill absent. GREEN runs: skill present via the normal injection path
   (the skill must auto-trigger; hand-feeding it is not an integration).
3. Paste the scenario body — everything below the frontmatter — verbatim as the
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
every scenario MUST name a skill directory that exists — a scenario pointing at a
nonexistent skill dies on step one, exactly like a workflow reading a nonexistent
file. `lib/eval-library.mjs` enforces both directions; `npm test` fails on drift.
