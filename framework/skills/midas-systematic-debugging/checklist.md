# Systematic-debugging gate checklist

Deterministic gates distilled from midas-systematic-debugging. Check against
the investigation record before any fix is called done.

- [ ] The full error message and stack trace were read and quoted before any hypothesis was formed
- [ ] The failure reproduces on demand and the exact reproduction steps are recorded
- [ ] Recent commits, dependency changes, config drift, and environment differences were checked
- [ ] For each passing check near the failure, the question it actually answers is named in the record
- [ ] Each hypothesis was stated as "X is the root cause because Y" and tested with one minimal change
- [ ] No second fix was stacked on a fix that did not work
- [ ] The root cause is stated in writing and predates the fix
- [ ] The failing case exists as an automated test or pinned reproduction that failed on the broken code
- [ ] The fix is a single change with no drive-by refactoring riding along
- [ ] Fix attempts were counted; after three failures the work stopped and escalated
