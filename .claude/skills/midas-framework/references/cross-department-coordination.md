# Cross-Department Coordination

## Core Principle
Each studio owns its output. Studios READ from other studios but NEVER MODIFY other studios' outputs.

## Shared Artifact Protocol

### Writing Rules
- Studio writes to: `.claude/skills/[studio-name]/output/` or its designated output directory
- Cross-studio artifacts go to: `.claude/skills/_shared/coordination/`
- Every shared artifact includes: source studio, timestamp, version, schema

### Reading Rules
- Any studio may read any other studio's output (read-only)
- If a downstream studio needs modifications, it creates a NEW artifact (not edits the original)
- Stale reads are possible — check timestamps before using

### Conflict Resolution
When two studios produce conflicting artifacts:
1. CEO identifies the conflict
2. Upstream studio's output takes precedence for its domain
3. Downstream studio must adapt or escalate
4. If unresolvable → HALT and report to human

## Dependency Graph (Execution Order)

```
research-studio ──→ ALL studios (provides intel)
brand-studio ──→ content-studio, marketing-studio, advertisement-studio, design-studio
design-studio ──→ dev-studio (provides design specs)
dev-studio ──→ security-studio (provides code for review)
dev-studio ──→ devops-studio (provides artifacts for deployment)
content-studio ──→ marketing-studio (provides content)
marketing-studio ──→ advertisement-studio (provides strategy)
legal-studio ──→ ALL studios (compliance review, parallel or after)
```

## Multi-Studio Task Execution

### Step 1: CEO Identifies Required Studios
From routing-table.md, determine which studios are needed.

### Step 2: Load Dependencies
```
For each required studio:
  Load studio SKILL.md
  Check dependencies → load those too
  Build execution DAG
```

### Step 3: Execute in Dependency Order
```
Level 0: Studios with no unmet dependencies (can start immediately)
Level 1: Studios that depend only on Level 0 outputs
Level 2: Studios that depend on Level 0 + Level 1 outputs
...continue until all studios have executed
```

### Step 4: Merge Outputs
CEO collects all studio outputs and produces unified deliverable.

## Common Multi-Studio Workflows

### Full Product Build
```
research-studio (market analysis)
  → design-studio (UI/UX specs)
  → dev-studio (code) ←enriched by→ [domain-studio]
  → security-studio (security review)
  → devops-studio (deployment)
  → content-studio (documentation)
  → legal-studio (compliance review)
```

### Content Campaign
```
research-studio (audience analysis)
  → brand-studio (voice guidelines)
  → content-studio (content creation)
  → marketing-studio (distribution strategy)
  → advertisement-studio (paid promotion)
```

### Client Onboarding
```
sales-studio (contract + SOW)
  → legal-studio (contract review)
  → dev-studio (project setup)
  → client-success-studio (onboarding plan)
```

## Active Projects Tracking
Maintained in: `_shared/coordination/active-projects.md`
Format:
```markdown
## [Project Name]
- Status: [planning | building | testing | deploying | complete]
- Studios: [list of involved studios]
- Lead studio: [primary studio]
- Current phase: [phase name]
- Blocking issues: [none | list]
```
