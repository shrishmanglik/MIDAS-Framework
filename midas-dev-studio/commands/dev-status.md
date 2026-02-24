---
description: "Show current build pipeline state — which phases are complete, what's next."
---

# /dev-status — Pipeline State

Report the current state of the Dev Studio build pipeline.

Check for phase artifacts and report:

| Phase | Status | Artifact | Exists? |
|---|---|---|---|
| 1. Init | ? | output/requirements.json | check |
| 2. Plan | ? | output/architecture.md | check |
| 3. Build | ? | app/main.py | check |
| 4. Test | ? | output/test-results.txt | check |
| 5. Deploy | ? | Dockerfile | check |

Also report:
- Total files in project
- Any failing lint/type checks
- Last modification timestamp
- Next recommended action
