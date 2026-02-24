# MIDAS Framework

**Multi-agent Intelligent Development & Automation System**

The AI operating system of Million Dollar AI Studio. A Claude Code Plugin ecosystem that transforms Claude Code into a fully-staffed software company.

---

## What is MIDAS?

MIDAS is not a Python framework. It's a collection of Claude Code plugins that provide:

- **7 specialized AI agents** — Product Manager, Systems Architect, Database Engineer, Backend Developer, Frontend Developer, QA Engineer, DevOps Engineer
- **15+ reusable skills** — Three-tier routing, quality gates, scaffolding, testing, deployment
- **10 slash commands** — `/midas`, `/dev-init`, `/dev-plan`, `/dev-build`, `/dev-test`, `/dev-deploy`, and more
- **A 5-phase build pipeline** — Brief → Requirements → Architecture → Code → Tests → Deployment

## Plugins

| Plugin | Description |
|---|---|
| **midas-core** | The orchestration brain. Three-tier routing, quality gates, knowledge accumulation, cost awareness, agent handoff protocols. |
| **midas-dev-studio** | Full-stack development department. 7 agents, 10 skills, 7 commands. Builds complete FastAPI + React apps from a plain-text brief. |

## Quick Start

```bash
# Clone
git clone https://github.com/shrish-01/MIDAS-Framework.git

# In Claude Code:
/plugin marketplace add "/path/to/MIDAS-Framework"
/plugin install midas-core@midas-marketplace
/plugin install midas-dev-studio@midas-marketplace

# Build an app:
/dev-init Build a REST API for a bookstore inventory with admin/user roles
/dev-plan
/dev-build
/dev-test
/dev-deploy
```

## Core Principles

1. **Deterministic-First** — 60% templates, 15% rules, 25% LLM. Target: <$0.50 per project.
2. **Artifact-Based Handoffs** — Agents communicate through files, not conversation.
3. **Quality-Gated** — 6-gate pipeline: schema → lint → completeness → tests → AI review → human review.
4. **Knowledge-Accumulating** — Every project generates tagged learnings for future use.
5. **Budget-Aware** — Per-phase cost tracking with automatic halt on overrun.

## Documentation

- [Getting Started](docs/GETTING-STARTED.md) — Installation and first project
- [Architecture](docs/ARCHITECTURE.md) — Why plugins, not a framework
- [Contributing](docs/CONTRIBUTING.md) — How to add new Studios

## Roadmap

- **v1.0** — Core + Dev Studio (current)
- **v1.1** — Knowledge MCP Server (cross-project learning)
- **v1.2** — Content Studio (LinkedIn, X, blog, video)
- **v1.3** — Cost Tracking MCP Server
- **v1.4** — Template Library Expansion (75%+ code from templates)
- **v2.0** — Public Marketplace Publication

---

Built by Million Dollar AI Studio. Deterministic-first. Budget-aware. Quality-gated. Knowledge-accumulating.
