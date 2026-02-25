---
name: deployment-pipeline
studio: dev-studio
description: "Containerization and CI/CD setup"
estimated_cost: "$0.015"
---

# Deployment Pipeline

## Overview
Containerization and CI/CD setup

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

## Phase 1: Containerize
### Agent: devops-engineer (Subagent)
Dockerfile, docker-compose, multi-stage builds.
### Output: Docker configuration

## Phase 2: Pipeline
### Agent: devops-engineer (Subagent)
CI/CD workflow with lint, test, build, deploy stages.
### Output: GitHub Actions workflow

## Phase 3: Documentation
### Agent: technical-writer (Inline)
Deployment docs, environment setup guide.
### Output: Deployment documentation

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to VP of Engineering
- Budget exceeded: halt and report to VP of Engineering
