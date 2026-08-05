# Code-review gate checklist

Deterministic gates distilled from midas-code-review. Check against the
review package, the verdict, and the findings record.

- [ ] The review package records the true base and head commits, with the diff built from that exact range
- [ ] The package includes the spec or brief, binding constraints quoted verbatim, and quoted evidence
- [ ] Every claim in the package carries a state: verified, asserted, unknown, or blocked
- [ ] No instruction to the reviewer pre-judges or suppresses findings
- [ ] The reviewer session is distinct from the authoring session and states the author line in the verdict
- [ ] The verdict is exactly one of APPROVE, REVISE, or BLOCK
- [ ] The reviewer made no edits to the code under review
- [ ] Each finding names file, location, defect, and consequence, and is marked blocking or non-blocking
- [ ] Every fix diff went back to the same reviewer; no finding was marked resolved by the author
- [ ] Contested findings were escalated to the requester, never merged over
