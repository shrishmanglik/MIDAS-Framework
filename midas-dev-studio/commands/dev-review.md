---
description: "Run a code quality audit on existing code. Can be used independently of the build pipeline."
---

# /dev-review — Code Quality Audit

Perform a standalone code review on the current project.

1. Scan the codebase structure
2. Run deterministic checks (lint, type check, import validation)
3. Activate QA engineer agent for adversarial review
4. Produce `output/review-report.md` with:
   - Architecture assessment
   - Code quality findings (specific file:line references)
   - Security concerns
   - Performance issues
   - Test coverage gaps
   - Recommendations prioritized by severity
