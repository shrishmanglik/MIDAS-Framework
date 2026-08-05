---
name: midas-code-review
description: Review discipline for both sides of the gate. Use when requesting review of completed work, when acting as a reviewer, or when handling review findings as the author.
license: Apache-2.0
compatibility: MIDAS-compatible agent harnesses
allowed-tools: Read
---
# Code Review

## Purpose

Review is a role boundary, not a conversation. The requester packages
evidence; the reviewer — always a different session from the author — returns
a verdict and findings; the author fixes. When those roles blur, review
becomes theatre performed over an unexamined diff.

## The Process

### Requesting review

1. **Package the diff completely.** Record the true base commit and head,
   and build the diff from that range — a base guessed as "one commit back"
   silently drops every earlier commit of a multi-commit task. Hand the
   package over as a file: commit list, stat summary, full diff with context.

2. **Attach the requirements and the receipts.** The reviewer gets the spec
   or task brief the work answers to, the binding constraints quoted
   verbatim, and the evidence: commands run, output, test counts. A reviewer
   without the requirements can only review style.

3. **State every claim with its state.** Verified claims carry their quoted
   evidence; asserted-but-unproven claims say so; unknowns and items blocked
   on external actors are labeled as such. A review request in which
   everything is silently fine hands the reviewer a fiction to audit.

4. **Never pre-judge the findings.** No "don't flag X", no "treat Y as
   minor at most". If a finding would be a false positive, let it be raised
   and adjudicate it on the record.

### Receiving review (as reviewer)

5. **State the author line first.** Open the verdict by naming which session
   authored the diff and confirming it is not yours. A reviewer who cannot
   state the author line truthfully is the author, and must recuse.

6. **Verdict-only: APPROVE, REVISE, or BLOCK.** The reviewer never edits the
   code, never pushes fixes, never "just cleans up while in there". Findings
   are specific — file, line, what is wrong, why it matters — and separated
   into blocking and non-blocking. What cannot be verified from the diff is
   reported as unverifiable, not guessed either way.

### Receiving findings (as author)

7. **Fix first, never argue first.** Read all findings before acting on any.
   Restate unclear items and get clarification before implementing — related
   findings half-understood become wrong fixes. Then fix in order: blocking,
   simple, complex; each verified individually.

8. **Push back only with evidence, after understanding.** When a finding is
   technically wrong for this codebase, demonstrate it — the working test,
   the platform constraint, the usage search. Performative agreement is
   banned in both directions: no "great catch!" theatre, and no reflexive
   compliance with a finding that breaks the code. Findings that collide
   with the requester's recorded decisions escalate to the requester.

9. **Close the loop through re-review.** Fixes go back to the same reviewer
   scoped to the fix diff. The author never marks their own findings
   resolved.

## Red Flags

| Rationalization | Counter-rule |
|---|---|
| "I'll review it myself, I have the most context" | Most context is the disqualification. Author certainty is the thing under test; the reviewer is a different session, no exception. |
| "The diff is small, a look-over will do" | Small diffs get the same package: base, head, requirements, receipts. Blast radius does not scale with line count. |
| "As reviewer, it's faster to just fix it myself" | A reviewer who edits becomes an author with nobody reviewing them. Verdict and findings only — the fix belongs to the author. |
| "I'll tell the reviewer which findings not to raise" | Pre-judging findings is review capture. Adjudication happens after findings exist, on the record. |
| "The reviewer is wrong, I'll merge over the objection" | Authors fix or escalate; they never override. A contested finding goes to the requester as a fork. |
| "I'll implement the findings I understood and ask about the rest later" | Findings interrelate; partial understanding produces wrong fixes. Clarify everything, then fix everything. |
| "The finding is right, so I'll say thanks and agree enthusiastically" | Agreement theatre adds nothing and hides nothing. State the fix; the code shows you heard it. |
| "I fixed all the findings, marking them resolved" | Resolution is the reviewer's ruling, scoped to the fix diff. Self-resolved findings are unreviewed changes. |
| "HEAD~1 is close enough for the diff base" | It truncates multi-commit work invisibly. The recorded base or nothing. |
| "I was wrong to push back, better explain myself at length" | State the correction factually — what you checked, what it showed — and move on. Extended apology is theatre in the other direction. |

## Guardrails

- Reviewer and author are different sessions, reviewer role declared —
  regardless of which tool or model runs either. No session ever reviews its
  own output.
- The reviewer's output is verdict plus findings; the reviewer touches no
  code.
- Verdicts come only from the reviewer; merges happen only on APPROVE.
- Claims in review packages carry explicit states — verified with evidence,
  asserted, unknown, or blocked — and the evidence is quoted, not summarized.
- Findings and rulings are recorded; a silently dropped finding is a defect
  in the process, whatever its merit.
- Reviewer capability is matched to diff risk: a subtle change in shared
  state or concurrency takes a stronger reviewer than a mechanical rename,
  regardless of line counts.
- A reviewer suggesting new features runs the usage check first: if nothing
  calls it, the finding is a scope question for the requester, not a fix
  for the author.
- Review requests are packaged for a reader with no session context — the
  reviewer must be able to rule from the package alone.

## Stop Conditions

Halt and escalate to the requester when:

- No independent session is available to review — the work waits; it does
  not self-certify.
- Author and reviewer deadlock after one fix-and-re-review round on a
  blocking finding.
- Review surfaces a defect in the spec or plan itself, not the
  implementation — that goes up before more code moves.
- A finding implicates work outside this branch's scope — record it and
  route it; do not expand the branch to chase it.
- The package cannot be built honestly — evidence is missing or claims
  cannot be stated with a truthful state — finish the work before
  requesting its review.

## Claim Ceiling

Completing this skill proves an independent session examined the packaged
diff against its requirements and issued a verdict, and that findings were
resolved through re-review or recorded escalation. It does NOT prove the
code is defect-free — review catches what a reviewer can see in a diff — and
an APPROVE is one gate passed, not a guarantee the work is correct in
production.
