---
name: midas-writing-plans
description: Turn an approved spec into an executable implementation plan. Use when a spec or requirements exist for multi-step work and no plan does, before any code is touched.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Writing Plans

## Purpose

Write plans to the 7B-executable standard: clear enough that an enthusiastic
junior with no context and questionable taste — which is to say, a small local
model — can execute every step exactly. A plan that needs frontier judgment to
interpret is a draft, not a plan.

## The Process

1. **Verify authorization before generating anything.** Two gates, in order.
   First, confirm the work itself is authorized: read the scope record, the
   ADR, the status marker — a scope doc marked frozen or a missing decision
   record kills the plan before Task 1, however complete the spec looks.
   Second, confirm the spec is approved. No authorization, no plan; no
   approved spec, no plan — route back to brainstorming. And a plan destined
   for an unattended executor must OPEN with an authorization-check step
   that names the exact record to verify and HALTs the run if it is absent
   or revoked — the executor cannot ask, so the plan asks for it.

2. **Check scope.** If the spec spans independent subsystems, propose one plan
   per subsystem, each producing working, testable software on its own.

3. **Map the file structure first.** Before writing tasks, list every file the
   plan will create or modify and what each is responsible for. One clear
   responsibility per file. In existing codebases, follow the established
   patterns; do not restructure what the task does not require. Where a
   plausible lookalike sits beside a file the plan depends on — a stale
   template, a near-named copy, an old version — the plan names the exact
   right path AND names the lookalike as forbidden; a low-context executor
   given only "the template file" will pick the wrong one often enough to
   matter.

4. **Write a plan header** carrying: the goal in one sentence, the approach in
   two or three, the tech involved, and a Global Constraints block with every
   project-wide requirement — exact versions, exact names, exact copy — quoted
   verbatim from the spec. Every task implicitly includes this block.

5. **Draw task boundaries at review seams.** A task is the smallest unit that
   carries its own test cycle and could be independently rejected by a
   reviewer while its neighbor is approved. Fold setup and scaffolding into
   the task whose deliverable needs them.

6. **Write each task to the executable standard.** Per task:
   - Exact file paths to create, modify (with line ranges where known), and test.
   - An interfaces block: what this task consumes from earlier tasks and what
     later tasks rely on — exact names, signatures, and types. The executor
     sees only their task; this block is how neighbors stay compatible.
   - Steps of one action each, two to five minutes: write the failing test
     (actual test code in the step), run it and state the expected failure,
     write the minimal implementation (actual code), run and state the
     expected pass, commit with the exact message.
   - The exact commands to run, with expected output stated.

7. **Ban placeholders.** These are plan defects, not shorthand: "TBD",
   "add appropriate error handling", "write tests for the above" with no test
   code, "similar to Task N" instead of repeating the content, steps that say
   what without showing how, and references to functions no task defines.

8. **Self-review against the spec.** Three passes: coverage (every spec
   requirement points to a task), placeholder scan (the list above, literally
   searched), and consistency (names and signatures used in later tasks match
   the ones defined earlier). Fix inline; add missing tasks.

9. **Right-size the model tier per task.** Mark which tasks are pure
   transcription of complete plan text — those route to the cheap tier —
   and which need integration judgment or design sense, which route up.
   A plan that never says which is which forces every task onto the
   expensive tier by default.

10. **Hand off explicitly.** Name the execution mode (fresh-executor-per-task
    or inline) and where the plan file lives. The plan is the contract; the
    conversation is not — anything agreed in chat that the plan does not
    carry will not survive to execution time.

## Red Flags

| Rationalization | Counter-rule |
|---|---|
| "The executor can figure out the details" | The executor is a small model by design. Detail the plan omits is detail the work will invent — badly. |
| "I'll describe the test instead of writing it" | A described test is a placeholder. The plan carries the actual test code or the task is not written. |
| "Similar to Task 3, so I'll reference it" | Executors read one task in isolation. Repeat the content; a reference to another task is a dead link at execution time. |
| "This helper might be useful later, I'll plan it" | Plan only what the spec requires. Speculative structure is scope the reviewer never approved. |
| "The constraints are obvious from context" | Executors have no context. Constraints not quoted verbatim in the plan do not exist at execution time. |
| "Self-review is redundant, I just wrote it" | The writer's blind spots survive into the same session. Run the three passes as literal searches, not as a feeling of confidence. |
| "One big task is simpler than five small ones" | A task too big to reject independently is too big to review. Split at the seams a reviewer would use. |
| "I'll fix naming drift during execution" | A function named two ways in one plan is a bug shipped twice. Consistency is checked now, when it costs one edit. |
| "The plan is long, so it must be thorough" | Length is not coverage. The three review passes measure a plan; page count measures typing. |
| "I'll leave the library choice to the executor" | Choices left open at execution time get made by the least-informed party in the chain. The plan decides; the executor transcribes. |
| "There's a work order, so the work is authorized" | An instruction to plan is not an authorization to build. Check the scope record and the ADR — a freeze marker or a missing decision kills the plan now, at the cost of one read, instead of overnight at the cost of the whole run. |
| "The executor will find the right template file" | Where a lookalike exists, a low-context executor picks it — and an unattended run cannot notice. Name the exact path, forbid the lookalike by name. |

## Guardrails

- Every step names its verification: the command, and the expected output or
  failure message. A step that cannot state its expected result is not done
  being written.
- Exact values — magic strings, numbers, paths, casing, trailing newlines —
  appear in the plan verbatim, never paraphrased.
- Follow YAGNI and DRY in the plan itself: no speculative tasks, no repeated
  logic blocks that should be one shared step. The exception is task text
  itself, which repeats rather than cross-references — executors read alone.
- Test-first ordering inside every task is mandatory; a task whose first step
  is implementation violates the TDD sequencing this plan feeds.
- The plan lives on disk in the project's plan location, not in chat.
- Repository plans name the branch, base, and workspace mode the executor
  must use — isolation is a planned fact, not an executor judgment call.
- Each task states its done-condition as observable output — a command and
  what it prints — never as intent ("works correctly", "handles errors").
- Commands in steps are copy-pasteable exactly as written; a command the
  executor must adapt before running is a placeholder in disguise.

## Stop Conditions

Halt and escalate to the requester when:

- The authorization record is missing, frozen, or contradicts the request —
  planning stops at the gate; "someone probably approved it" is not a
  record.
- A spec requirement cannot be planned without a decision the spec does not
  make — present the fork, do not pick silently.
- Coverage review finds a spec requirement no task can implement as specced.
- The plan exceeds what one branch can deliver and review — propose the split
  before writing more tasks.
- Writing a task to the executable standard exposes that the spec's approach
  cannot work as described — the spec goes back for amendment; the plan does
  not paper over it.

## Claim Ceiling

Completing this skill proves an executable plan exists that covers the spec
as reviewed. It does NOT prove the plan will survive contact with the
codebase, that estimates hold, or that any task has run. "Planned" is not
"built", and this plan's quality is only demonstrated when a low-context
executor completes a task from it with zero questions needed.
