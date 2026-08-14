# TDD gate checklist

Deterministic gates distilled from midas-tdd. Every box is a checkable fact
about this task's record, not a feeling of confidence.

- [ ] Every new behavior has a test that was run and observed to fail before its implementation existed
- [ ] Each RED run's failure message was read and names the missing behavior, not a typo or import error
- [ ] For each bug fix, the regression test's failing run against pre-fix source is quoted in the record
- [ ] For each bug fix, the same test's passing run against fixed source is quoted in the record
- [ ] No production code predates its test; any violation was deleted and the cycle restarted from RED
- [ ] The full suite is green on the current tree with counts read from output, not inferred from exit code
- [ ] Passing runs are free of warnings and stray errors
- [ ] No test asserts on mock behavior where the real code was available
- [ ] Any exception to test-first carries the requester's explicit recorded say-so
