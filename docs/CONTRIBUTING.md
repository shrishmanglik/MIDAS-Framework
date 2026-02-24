# Contributing to MIDAS

How to add new Studios, agents, skills, and commands to the MIDAS ecosystem.

---

## Adding a New Studio

A Studio is a MIDAS plugin that represents an autonomous department (e.g., Development, Content, Research).

### 1. Create the Plugin Structure

```
midas-{studio-name}/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── agents/
│   └── {agent-name}.md      # Subagent definitions
├── skills/
│   └── {skill-name}/
│       └── SKILL.md          # Skill definitions
├── commands/
│   └── {command-name}.md     # Slash command definitions
├── hooks/
│   └── hooks.json            # Event-driven hooks
└── references/
    └── {topic}.md            # Reference documents
```

### 2. Plugin Manifest

```json
{
  "name": "midas-{studio-name}",
  "description": "MIDAS {Studio Name} — {one-line description}",
  "version": "1.0.0",
  "author": {
    "name": "Million Dollar AI Studio",
    "url": "https://milliondollarstudio.co"
  }
}
```

### 3. Register in Marketplace

Add to `.claude-plugin/marketplace.json`:

```json
{
  "name": "midas-{studio-name}",
  "source": "./midas-{studio-name}",
  "description": "Description here"
}
```

## Adding a New Agent

Agents are markdown files with YAML frontmatter.

### Required Sections

```markdown
---
description: "One-line description of when to invoke this agent."
model: sonnet  # or haiku, opus
---

# Agent Name — Agent {Persona Name}

## Identity
[Background, experience, personality]

## Core Philosophy
[What drives their decisions]

## Capabilities
[What they can do]

## Forbidden Actions
[What they must NEVER do — scope boundaries]

## Input
[What files they read]

## Output
[What files they produce]

## Quality Self-Check
[Checklist before submitting output]
```

### Model Selection
- **haiku**: Simple, template-heavy tasks (DevOps, formatting)
- **sonnet**: Standard reasoning (most agents)
- **opus**: Complex multi-step reasoning (orchestrator, architecture)

## Adding a New Skill

Skills are SKILL.md files with YAML frontmatter.

```markdown
---
name: skill-name
description: "When this skill triggers and what it does."
---

# Skill Title

[Instructions for executing this skill]
```

### Skill Guidelines
- Skills should be self-contained instructions
- Include templates where possible (Tier 1 operations)
- Document trigger conditions in the description
- Include validation criteria for outputs

## Adding a New Command

Commands are markdown files that define slash commands.

```markdown
---
description: "What this command does. Shown in /help."
---

# /command-name — Title

[Step-by-step instructions for executing this command]
```

## Quality Standards

All contributions must follow:

1. **YAML frontmatter is valid** — parseable, required fields present
2. **JSON files are valid** — parseable, schema-compliant
3. **Reference files are condensed** — 200-400 lines max, not full documents
4. **Agents have forbidden actions** — scope boundaries prevent overlap
5. **Skills have trigger descriptions** — clear when they activate
6. **Commands have descriptions** — shown in help/autocomplete

## Commit Convention

```
feat: add {studio-name} plugin — {brief description}
fix: correct {what was fixed} in {where}
docs: update {document} with {what changed}
```
