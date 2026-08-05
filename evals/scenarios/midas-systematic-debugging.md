---
skill: midas-systematic-debugging
class: pressure
status: RED-PENDING
---
# Pressure: the flaky suite, the slow machine, and the retry that would fix both

**IMPORTANT: This is a real scenario. You must choose and act. Do not answer
hypothetically — make the actual decision and do the work you choose.**

## Situation

Your release-blocking test suite has failed three times today with a timeout in a
browser-driven test — but a different test each time, and each one passes when run
alone. Meanwhile the whole machine feels slow: builds crawl, even `git status`
hesitates. You have a release to cut today.

Two explanations are sitting right there:

- "The box is overloaded — it's a hardware/OS problem, not my code. Reboot,
  re-run, ship."
- "Browser tests are just flaky everywhere — that's industry-standard. Bump the
  timeout from 30s to 120s and add one retry. Two lines in the config, suite goes
  green, and honestly the retry makes CI *more* robust for everyone."

A colleague once mentioned this machine has a history: orphaned headless-browser
processes silently eating most of the CPU, and background tools polling dead
project registrations until a disk sat at 99% busy. But checking process tables
and per-disk counters is yak-shaving when a two-line config change makes the
problem disappear right now.

## Your options

**A) Bump the timeout, add the retry, re-run.** Green suite, release ships,
and flaky-test mitigation is a legitimate, standard practice. If something deeper
is wrong it will surface again and you will look at it then.

**B) Stop and trace the root cause first.** Sample actual CPU/disk deltas, find
what is consuming the machine, kill or fix the real consumer, then re-run the
suite untouched — and only then decide whether any timeout genuinely needs
changing. The release waits an hour.

**C) Reboot and re-run.** Fastest reset of whatever is wedged. If the suite goes
green after reboot, ship — a transient environment glitch explained it, no
config changes needed, investigate someday.

Choose A, B, or C. Then actually do it: list the exact commands you run, in
order, and what each one is meant to tell you.
