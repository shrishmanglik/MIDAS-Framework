---
name: project-init
description: "Parse a plain-text project brief into structured requirements. Use when starting any new dev project. Triggers on: 'new project', 'build me', 'create an app', any brief describing software to build."
---

# Project Initialization

When receiving a project brief:

1. **Read the brief carefully.** Identify: what the app does, who uses it,
   core features, any technical constraints mentioned.

2. **Activate the Product Manager agent** to decompose into structured requirements.

3. **The PM produces `output/requirements.json`** with:
   - Project name and summary
   - Target users
   - P0 features (MVP-critical) with user stories and acceptance criteria
   - P1 features (nice-to-have)
   - Non-functional requirements
   - Out of scope items
   - Open questions / ambiguities

4. **Validate the output:**
   - JSON parses correctly
   - At least 1 P0 feature exists
   - Every feature has acceptance criteria
   - Data entities are identified

5. **Present to user for approval** before proceeding to Phase 2.

## Directory Setup

Create this structure at project init:

```
project-name/
├── output/          # Phase artifacts (requirements, architecture, specs)
├── app/             # Backend (FastAPI)
├── frontend/        # Frontend (React/Next.js)
├── tests/           # Test files
├── alembic/         # Database migrations
├── knowledge/       # MIDAS learnings for this project
└── README.md        # Auto-generated from requirements
```

## Brief Quality Thresholds

A brief is considered adequate if it contains:
- A clear description of what the application does
- At least one identifiable user type
- At least 2-3 described features or behaviors

If the brief is too vague, ask the user clarifying questions before proceeding.

## Validation Rules

The requirements.json must pass these checks:
- Valid JSON (parseable)
- `project_name` is a non-empty string
- `p0_features` array has at least 1 item
- Every feature has `user_story` and `acceptance_criteria` (non-empty)
- `data_entities` identified in at least one feature
- `non_functional` section is present
