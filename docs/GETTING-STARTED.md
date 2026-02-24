# Getting Started with MIDAS

MIDAS (Multi-agent Intelligent Development & Automation System) is a Claude Code Plugin ecosystem that transforms Claude Code into a fully-staffed AI software company.

---

## Prerequisites

- [Claude Code](https://claude.ai/code) installed and configured
- Git installed
- Docker installed (for deployment phase)
- Python 3.11+ (for backend projects)
- Node.js 20+ (for frontend projects)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shrish-01/MIDAS-Framework.git
cd MIDAS-Framework
```

### 2. Install the Marketplace

In Claude Code, run:

```
/plugin marketplace add "/path/to/MIDAS-Framework"
```

### 3. Install Plugins

```
/plugin install midas-core@midas-marketplace
/plugin install midas-dev-studio@midas-marketplace
```

### 4. Verify Installation

```
/midas-status
/dev-status
```

## Quick Start: Build Your First App

### Step 1: Initialize a Project

```
/dev-init Build a REST API for a task manager. Users can create, update,
and delete tasks. Tasks have titles, descriptions, due dates, and status
(todo/in-progress/done). Simple auth with user accounts.
```

### Step 2: Review and Approve Requirements

MIDAS will present structured requirements. Review and approve.

### Step 3: Generate Architecture

```
/dev-plan
```

### Step 4: Build the Code

```
/dev-build
```

### Step 5: Run Tests

```
/dev-test
```

### Step 6: Deploy

```
/dev-deploy
```

## Available Commands

### Core Commands
| Command | Description |
|---|---|
| `/midas` | Main entry point — routes to the right Studio |
| `/midas-status` | Show project state across all Studios |
| `/midas-knowledge` | Query accumulated learnings |

### Dev Studio Commands
| Command | Description |
|---|---|
| `/dev-init <brief>` | Phase 1: Parse brief into requirements |
| `/dev-plan` | Phase 2: Generate technical architecture |
| `/dev-build` | Phase 3: Implement application code |
| `/dev-test` | Phase 4: Generate and run tests |
| `/dev-deploy` | Phase 5: Docker + CI/CD configuration |
| `/dev-review` | Standalone code quality audit |
| `/dev-status` | Show build pipeline state |

## How It Works

MIDAS uses 7 specialized AI agents, each with a defined role:

1. **Product Manager** — Turns briefs into structured requirements
2. **Systems Architect** — Designs technical architecture
3. **Database Engineer** — Creates schemas and models
4. **Backend Developer** — Implements FastAPI application
5. **Frontend Developer** — Builds React/Next.js frontend
6. **QA Engineer** — Tests and reviews code
7. **DevOps Engineer** — Packages for deployment

Each agent only writes to files it owns. Work is handed off via self-contained artifacts. Quality gates validate every output before it moves to the next phase.
