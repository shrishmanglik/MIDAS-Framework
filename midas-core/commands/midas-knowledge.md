---
description: "Query accumulated MIDAS learnings. Search by domain tag or keyword to find relevant past insights before starting a task."
---

# /midas-knowledge Command

Search the `knowledge/` directory for relevant learnings.

Usage: `/midas-knowledge [TAG or keyword]`

1. If a TAG is given (ARCH, FAIL, COST, etc.), read all files in `knowledge/[TAG]/`
2. If a keyword is given, search across all knowledge files for matches
3. Present findings organized by relevance
4. Suggest which learnings apply to the current task

If no knowledge directory exists yet, inform the user and suggest accumulating learnings by using MIDAS for tasks.
