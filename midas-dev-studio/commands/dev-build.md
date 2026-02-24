---
description: "Implement the application code from architecture specs. Must run after /dev-plan."
---

# /dev-build — Phase 3: Implementation

Execute Phase 3 of the MIDAS Dev Studio pipeline.

1. Verify `output/architecture.md` exists (error if not: "Run /dev-plan first")
2. Activate the backend-developer agent → implements `app/` directory
3. Activate the frontend-developer agent → implements `frontend/` directory
   (Skip if architecture specifies API-only project)
4. Run deterministic gates:
   - `ruff check app/` passes
   - `python -c "from app.main import app"` succeeds
   - If frontend: `cd frontend && npx tsc --noEmit` passes
5. Report: "Phase 3 complete. Run /dev-test to proceed."
