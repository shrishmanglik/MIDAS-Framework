# MIDAS Framework — Agent Guide

**Read [`AGENTS.md`](AGENTS.md).** It is the canonical guide for agents working on this
codebase and is kept current; this file exists so Claude Code finds the guide by its own
convention. Do not duplicate guidance here — a second copy drifts.

The rules that must not be missed, repeated inline:

- **This is a public repository.** Everything committed is public the moment it is pushed.
  Apply [`docs/public-boundary.md`](docs/public-boundary.md) to every change. Never commit
  credentials, tokens, `.env` values, machine-local absolute paths, or client material.
- **`npm test` and `npm run validate` must both pass before any commit.** They are
  dependency-free and take under 15 seconds combined.
- **No runtime dependencies.** Do not add one without explicit maintainer approval.
- **No adoption, revenue, security, superiority, or production-readiness claims.**

Everything else — repository map, engineering rules, claim discipline, conventions, and
the MCP integration contract — is in [`AGENTS.md`](AGENTS.md).
