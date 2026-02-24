---
description: "Show current MIDAS project state — active studio, current phase, files produced, budget used, open issues."
---

# /midas-status Command

Report the current state of the MIDAS-managed project:

1. **Check for output files** — look in `output/` for phase artifacts
2. **Determine current phase** based on which artifacts exist:
   - `output/requirements.json` exists → Phase 1 complete
   - `output/architecture.md` exists → Phase 2 complete
   - `app/` directory populated → Phase 3 in progress/complete
   - `tests/` with results → Phase 4 complete
   - `Dockerfile` exists → Phase 5 complete
3. **List produced artifacts** with file sizes
4. **Estimate budget used** based on operations performed
5. **Flag any issues** — failing tests, incomplete files, TODO items

Output as a clean status report.
