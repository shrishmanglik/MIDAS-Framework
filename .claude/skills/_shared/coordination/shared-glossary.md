---
name: "shared-glossary"
description: "Common terminology used across all MIDAS studios"
---

# MIDAS Shared Glossary

## MIDAS Architecture Terms

| Term | Definition |
|------|-----------|
| **Studio** | A department within MIDAS focused on a specific domain (e.g., dev-studio, content-studio) |
| **Agent** | An AI persona with specific expertise, personality, and capabilities within a studio |
| **Skill** | A documented capability that can be activated by keywords or commands |
| **Workflow** | A multi-step process that coordinates multiple agents to produce an output |
| **Template** | A pre-structured document format used for consistent output generation |
| **Reference** | A knowledge document that agents consult for accuracy and consistency |

## Execution Model

| Term | Definition |
|------|-----------|
| **Tier 1** | Template-based execution — ~60% of tasks, $0 LLM cost, instant |
| **Tier 2** | Rules + Light LLM — ~25% of tasks, $0.001-$0.005, fast |
| **Tier 3** | Full LLM — ~15% of tasks, $0.01-$0.10+, highest quality |
| **Inline** | Agent executes within the current context (no subagent spawned) |
| **Subagent** | Agent spawned as a separate context for isolated execution |
| **Adversarial Review** | Independent review by a dedicated reviewer agent (ALWAYS subagent) |

## Quality Terms

| Term | Definition |
|------|-----------|
| **Quality Gate** | A checkpoint that output must pass before delivery |
| **Handoff Artifact** | The structured document passed from one agent/studio to another |
| **Knowledge Entry** | A learning captured from a task for future reference |
| **Escalation** | Routing a task to a higher authority or different studio when scope exceeds current capabilities |

## Model Routing

| Term | Definition |
|------|-----------|
| **Haiku** | Fastest, cheapest model — used for classification, simple routing |
| **Sonnet** | Balanced model — used for most standard work |
| **Opus** | Most capable model — used for architecture, strategy, complex analysis |

## Cross-Studio Terms

| Term | Definition |
|------|-----------|
| **Brief** | The initial description of work to be done |
| **Deliverable** | The final output of a studio or workflow |
| **Stakeholder** | The person or studio receiving the deliverable |
| **SLA** | Service Level Agreement — time commitment for delivery |
| **P0/P1/P2** | Priority levels: P0 = critical/immediate, P1 = high/this sprint, P2 = medium/backlog |
