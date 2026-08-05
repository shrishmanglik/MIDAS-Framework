---
name: midas-brainstorming
description: Tease out a real spec before any build starts. Use when an idea, feature request, or vague instruction arrives and no approved spec exists yet — including requests that look too small to need one.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Brainstorming

## Purpose

Turn an idea into an approved spec through questioning, not through building.
The most expensive failure mode in agent work is executing a request that was
never examined. This skill exists so that examination happens first, every time.

## The Process

1. **Read the current state before asking anything.** Project files, recent
   commits, existing specs, open work orders. Questions asked in ignorance of
   the tree waste the requester's time and your credibility.

2. **Run the interrogation set.** Before proposing anything, ask yourself 5-7
   questions about this specific request — and each question must be one whose
   answer could change what you do next. Question #1 is fixed, because it has
   the highest kill rate per minute spent:
   - **Does this already exist?** In the tree, in a merged branch, in a live
     surface? Requests routinely name features that already shipped; five
     minutes of checking has turned "obvious, just build it" into "already
     live" more than once. Check before any other question is worth asking.
   - What does this request assume is true that I have not verified?
   - What would make this the wrong thing to build even if built perfectly?
   - What does the requester think is simple here that is actually load-bearing?
   - If this succeeds completely, what breaks downstream that nobody mentioned?
   - What is the cheapest evidence that would prove me wrong before hours are spent?
   - What is being asked for versus the underlying goal — and do they diverge?

3. **Apply the anti-theatre rule.** If no answer changed your plan, the
   questions were wrong — go back and ask better ones. Record only the answers
   that altered the approach; discard the rest silently. Interrogation that
   always concludes "proceed as instructed" is decoration, not thinking.

4. **Assess scope before refining details.** If the request contains multiple
   independent subsystems, say so now and propose a decomposition. Do not spend
   questions polishing details of a project that needs splitting first.

5. **Ask the requester one question at a time.** Purpose, constraints, success
   criteria. Multiple-choice where possible. One question per message — a
   five-question dump gets one answered and four guessed.

6. **Propose 2-3 approaches with trade-offs.** Lead with your recommendation
   and the reasoning. Cut every feature the goal does not require before
   presenting — an approach padded with speculative scope is not an option,
   it is a trap.

7. **Present the spec in chunks and get a verdict per chunk.** Scale each
   section to its complexity: a few sentences when straightforward, a short
   page when nuanced. Ask after each section whether it holds. Cover
   architecture, components, data flow, error handling, and how it will be
   verified. Order the chunks so foundational decisions land before
   dependent ones — a reversal discovered late invalidates every chunk
   approved after it.

8. **Self-review the written spec.** Scan for placeholders ("TBD", "handle
   errors appropriately"), internal contradictions, requirements readable two
   ways, and scope that outgrew one plan. Fix inline, then hand the file to
   the requester for review.

9. **Hold the hard gate.** No implementation action of any kind — no code, no
   scaffolding, no file creation beyond the spec itself — until the requester
   has explicitly approved the spec. Approval of a chunk is not approval of
   the whole. The only exit from this skill is an approved spec handed to
   plan-writing.

## Red Flags

| Rationalization | Counter-rule |
|---|---|
| "This is too simple to need a spec" | Simple requests are where unexamined assumptions burn the most hours. The spec can be three sentences; it cannot be zero. |
| "The requester already knows what they want" | What they want and what they asked for diverge routinely. The interrogation set exists to find the gap before the build does. |
| "I asked my questions, none changed anything, proceeding" | That is the anti-theatre failure. Questions that never alter the plan were chosen to be answerable, not useful. |
| "I'll start building while they review the spec" | Building against an unapproved spec converts their review into an argument with sunk cost. The gate is hard. |
| "They said 'just do it', so the gate is waived" | An instruction to hurry is not an approval of a design. Compress the process; never delete the approval. |
| "I can infer the answer instead of asking" | A 30-second question beats an hour of wrong work. Inference is for things questions cannot reach. |
| "Presenting one approach is faster" | One approach presented alone gets approved by default. Two or three force a real decision. |
| "The spec review found nothing, so it's good" | A self-review that finds nothing on the first pass usually looked for nothing. Run the placeholder and ambiguity scans literally. |
| "I'll present the whole spec at once, chunking is slow" | A monolithic spec gets a monolithic "looks fine". Chunks force real reads and catch contradictions while they are one edit deep. |
| "Nobody answered my question, so I'll assume and continue" | An unanswered question becomes a recorded assumption at most, never a silent default. Name it, flag it, mark the spec provisional. |
| "I'll list my assumptions in the PR description so they're reviewable" | Reviewable assumptions are still unasked questions — review arrives after the hours are spent, which is the expensive side of the gap. The question costs 30 seconds now; the assumption costs the build when review catches it. |
| "It's obviously new functionality, no need to check the tree" | The cheapest interrogation answer on record: the feature already existed, live, merged weeks prior. "Obvious" describes the feeling, not the tree — run question #1 first. |

## Guardrails

- Never write implementation code, scaffolding, or config during this skill.
- Prefer questions whose answers are cheap evidence over questions of taste;
  a fact the requester can check beats an opinion they must defend.
- Never blend contradictory design options into one merged proposal; present
  the fork and let the requester resolve it.
- Never fabricate a constraint or requirement the requester did not state;
  mark inferred items as assumptions and flag them for confirmation.
- Every requirement that depends on exact values — names, paths, output text,
  casing, whitespace — is copied into the spec verbatim, not paraphrased.
- The spec names its verification: how the finished work will be proven, not
  just what it will do.
- Assumptions that survive into the spec are listed in their own section,
  each with the evidence that would confirm or kill it.
- Rejected approaches are recorded with one line of reasoning each, so the
  next session does not relitigate settled forks.
- Depth scales with stakes: a one-line change gets two questions and a hard
  reversibility check; an architecture decision gets the full set. Never
  reduce depth on work that is hard to reverse.

## Stop Conditions

Halt and surface to the requester instead of continuing when:

- Interrogation exposes a false premise in the request itself — say so
  before executing anything built on it.
- Interrogation surfaces a blocker the requester does not know about; a
  30-second flag beats an hour of work that lands on the blocker anyway.
- The request contains a decision above your authority level (pricing,
  launch, architecture affecting other owners' work).
- Two chunks of the spec are approved with contradictory content — resolve
  the contradiction before presenting a third.
- The requester declines to review and asks you to proceed on an unapproved
  spec: state once what that risks, then record their override verbatim
  before acting on it.

## Claim Ceiling

Completing this skill proves an approved spec exists and is on disk. It does
NOT prove the spec is correct, the approach will work, the estimate is right,
or that anything has been built. "Spec approved" is the strongest claim this
skill can produce; every claim beyond that belongs to a later skill with its
own evidence.
