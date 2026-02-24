# MIDAS Architecture

Why plugins, not a framework.

---

## The Key Insight

Anthropic shipped the runtime. Claude Code already has:
- **Subagents** — spawn specialized AI agents with their own context
- **Skills** — reusable capability definitions
- **Commands** — user-invocable slash commands
- **Hooks** — event-driven automation (post-file-edit, pre-commit)
- **MCP servers** — external tool integration
- **Plugin system** — package and distribute all of the above

We don't need to build an orchestration engine, an agent registry, or a state manager. We build the **intelligence layer** — the agent personas, workflows, quality protocols, and knowledge systems that make Claude Code operate as a software company.

## Plugin Architecture

```
MIDAS Marketplace
├── midas-core         (Plugin 1: The Brain)
│   ├── CLAUDE.md      → Project-level instructions loaded every session
│   ├── agents/        → Orchestrator subagent
│   ├── skills/        → Core protocols (routing, quality, knowledge, cost, handoff)
│   ├── commands/      → /midas, /midas-status, /midas-knowledge
│   ├── hooks/         → Post-write validation
│   └── references/    → Knowledge documents loaded on demand
│
└── midas-dev-studio   (Plugin 2: Development Department)
    ├── agents/        → 7 specialized dev agents (PM, Architect, DB, Backend, Frontend, QA, DevOps)
    ├── skills/        → 10 development skills (scaffold, build, test, deploy, etc.)
    ├── commands/      → /dev-init, /dev-plan, /dev-build, /dev-test, /dev-deploy, /dev-review, /dev-status
    ├── hooks/         → Lint-on-save for Python files
    └── references/    → API conventions, testing patterns, tech stack
```

## Core Principles

### 1. Deterministic-First (Three-Tier Routing)
60% of operations use templates ($0.00). 15% use rules ($0.001). Only 25% need LLM reasoning. This keeps costs under $0.50 per complete project build.

### 2. Artifact-Based Communication
Agents never share context conversationally. Every handoff produces a self-contained file that the receiving agent can process without any prior knowledge.

### 3. Progressive Quality Gates
Six gates, cheapest first: schema validation → lint → completeness → tests → AI review → human review. Stop at first failure. Fix the output, not the gate.

### 4. Knowledge Accumulation
Every project generates tagged learnings stored in `knowledge/`. Before starting a task, agents check for relevant prior learnings. MIDAS gets smarter with every project.

### 5. Budget Awareness
Every phase has a cost budget. When exceeded, MIDAS halts and reports to the human. No silent overruns.

## Why Not Python?

Previous MIDAS iterations built custom Python packages (mds-common, midas-core, forge, shield, pulse). This created:
- A custom runtime competing with Claude Code's runtime
- Dependency management overhead
- State management complexity
- Agent registration bureaucracy

The plugin approach eliminates all of this. Claude Code IS the runtime. We define the intelligence.

## Data Flow

```
User Brief
  → /dev-init → Product Manager → output/requirements.json
  → /dev-plan → Architect + DB Engineer → output/architecture.md + models/
  → /dev-build → Backend + Frontend Devs → app/ + frontend/
  → /dev-test → QA Engineer → tests/ + review-report.md
  → /dev-deploy → DevOps Engineer → Dockerfile + docker-compose.yaml
  → Working Application
```

## Extension Model

New Studios follow the same pattern:
1. Create a plugin directory with `.claude-plugin/plugin.json`
2. Define agents in `agents/` with YAML frontmatter
3. Define skills in `skills/*/SKILL.md`
4. Define commands in `commands/*.md`
5. Add to the marketplace manifest

Planned Studios:
- **Content Studio** — LinkedIn, X, blog, video content production
- **Research Studio** — Market intelligence, competitor analysis
