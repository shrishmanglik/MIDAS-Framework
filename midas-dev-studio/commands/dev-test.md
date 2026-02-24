---
description: "Generate and run tests, perform adversarial code review. Must run after /dev-build."
---

# /dev-test — Phase 4: Testing

Execute Phase 4 of the MIDAS Dev Studio pipeline.

1. Verify `app/` directory has implementation (error if not: "Run /dev-build first")
2. Activate the qa-engineer agent to generate tests from acceptance criteria
3. Execute: `pytest tests/ -v --tb=short --cov=app`
4. Verify: coverage >= 80% (or flag if below with specific uncovered areas)
5. Adversarial review: QA agent reads all code with "find 3-10 specific problems"
6. Produce `output/review-report.md` with findings
7. Fix critical issues. Document non-critical as known limitations.
8. Report: "Phase 4 complete. Run /dev-deploy to proceed."
