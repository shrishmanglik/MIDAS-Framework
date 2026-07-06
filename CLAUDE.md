# MIDAS Framework — Agent Guide

This repository is the MIDAS Framework: a dependency-free Node.js CLI that sets up disciplined agentic project workspaces (`.midas/`), portable harness adapters, work orders, runtime run state, contracts, and validation.

This file guides agents working **on the framework codebase itself**.

## Scope Rules

- This repo contains ONLY the framework: `bin/`, `lib/`, `framework/`, `docs/`, `test/`, and governance files.
- Product applications, demos, internal playbooks, prompt packs, and benchmark evidence do NOT belong here. If a task asks to add one, stop and flag it — see `docs/public-boundary.md`.
- This is a public repository. Everything committed here is public the moment it is pushed. Apply `docs/public-boundary.md` to every change.

## Development

```bash
npm test              # node:test suite — must pass before any commit
npm run validate      # repo/public-boundary validation — must pass before any commit
node ./bin/midas.mjs doctor
```

- Node >= 20.12.0. No runtime dependencies — do not add any without explicit maintainer approval.
- Every behavior change ships with a test in `test/`.
- Every CLI or contract change updates `README.md`, `docs/capability-map.md`, and (if scope changes) `docs/architecture.md`. `midas docs-staleness` exists for exactly this.

## Claim Discipline

- No public superiority claims against named frameworks without an approved benchmark receipt (see `framework/benchmarks/` policy and `release-plan.md`).
- No adoption, revenue, security, or production-readiness claims.
- Release state changes (npm publish, announcements) require explicit maintainer approval.

## Conventions

- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- ES modules (`.mjs`), no TypeScript, no build step.
- Validators are deterministic: no network calls, no LLM calls, no shell interpolation.
