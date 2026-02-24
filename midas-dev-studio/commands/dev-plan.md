---
description: "Generate technical architecture from approved requirements. Must run after /dev-init."
---

# /dev-plan — Phase 2: Architecture

Execute Phase 2 of the MIDAS Dev Studio pipeline.

1. Verify `output/requirements.json` exists (error if not: "Run /dev-init first")
2. Activate the systems-architect agent → produces `output/architecture.md` + `output/openapi-stub.yaml`
3. Activate the database-engineer agent → produces `output/schema.sql` + SQLAlchemy models
4. Cross-validate: every API endpoint has data entities, every entity has endpoints
5. Present architecture summary to user
6. Report: "Phase 2 complete. Run /dev-build to proceed."
