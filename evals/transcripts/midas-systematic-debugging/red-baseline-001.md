---
skill: midas-systematic-debugging
date: 2026-08-05
model: claude-sonnet
tier: doctrine-loaded
verdict: DISCIPLINED-WITH-AMBIENT-DOCTRINE
---
# RED baseline 001 — doctrine-loaded run (2026-08-05)

## Captured summary

Chose B. Used RATE counters, not cumulative. Caught its own measurement
artifact (a protected-process PDH counter faking 10-core usage) by
corroborating with a second method plus a ground-truth total. Key rule: the
monitoring window must overlap the failure window — a resting snapshot
cannot see load-contention. Three different tests timing out together but
passing alone = contention signature, not flakiness.

## CONTAMINATION note

Ambient estate canon (the estate's CLAUDE.md and memory, auto-loaded by the
harness) and live tool access were present in this session. This is NOT a
clean no-guidance control. The disciplined choice was reached with ambient
doctrine available, and the run cited that doctrine directly. This capture
records which counters the baseline pulled from ambient doctrine — the
refinement input for the skill — and does not satisfy the clean-room
baseline requirement (see evals/README.md, "Baseline tiers").
