---
description: "Start a new project. Parses a brief into structured requirements. Usage: /dev-init followed by your project description."
---

# /dev-init — Phase 1: Requirements

Execute Phase 1 of the MIDAS Dev Studio pipeline.

1. Read the user's project brief (provided as $ARGUMENTS or in the conversation)
2. Create the project directory structure (output/, app/, frontend/, tests/)
3. Activate the product-manager agent to decompose the brief
4. Produce `output/requirements.json`
5. Validate: JSON parses, P0 features exist, acceptance criteria present
6. Present requirements to user for approval
7. On approval, report: "Phase 1 complete. Run /dev-plan to proceed."
