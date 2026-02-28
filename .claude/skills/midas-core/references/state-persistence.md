# State Persistence Reference

## Purpose
Manage state across long-running tasks that span multiple Claude Code sessions. Ensure no work is lost and tasks can be resumed seamlessly.

## State Types

### 1. Task State
- **What:** Current progress of an in-flight task
- **Where:** `knowledge/sessions/` directory
- **Format:** Markdown file with task ID, status, completed steps, next steps
- **Lifecycle:** Created at task start, updated at each phase, archived at completion

### 2. Knowledge State
- **What:** Accumulated learnings from all past tasks
- **Where:** `knowledge/MIDAS-LEARNINGS.md`
- **Format:** Tagged entries (see knowledge-accumulation.md)
- **Lifecycle:** Append-only, grows over time

### 3. Configuration State
- **What:** Studio settings, routing rules, budget allocations
- **Where:** CLAUDE.md and SKILL.md files
- **Format:** Markdown with structured sections
- **Lifecycle:** Updated when architecture decisions change

## Session Handoff Protocol

When a task spans multiple sessions:

```
AT SESSION END:
1. Document current state:
   - What has been completed (with file paths)
   - What remains to be done (specific next steps)
   - Any blockers or decisions needed
   - Budget spent so far
2. Write state to knowledge/sessions/{task-id}.md

AT SESSION START:
1. Check knowledge/sessions/ for in-flight tasks
2. Read the state file for context
3. Resume from the documented next step
4. Do NOT re-do completed work
```

## File Naming Convention
- Task state files: `knowledge/sessions/{YYYY-MM-DD}-{task-description}.md`
- Completed tasks: Move to `knowledge/sessions/completed/`

## Rules
- Always persist state before a session might end
- Never rely on Claude's memory across sessions — write it down
- State files should be self-contained — a new session should understand them without external context
- Keep state files concise — bullet points, not paragraphs
