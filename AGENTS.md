# MIDAS Framework — Agent Guide

Canonical guide for any coding agent (Codex, Claude Code, Cursor, opencode, Gemini,
Copilot) working **on the MIDAS Framework codebase itself**.

`CLAUDE.md` points here. Update this file, not a per-tool copy.

This repository is the MIDAS Framework: a dependency-free Node.js CLI that sets up
disciplined agentic project workspaces (`.midas/`), portable harness adapters, work
orders, runtime run state, contracts, and validation.

## Before you change anything

```bash
npm test                     # node:test suite — must pass before any commit
npm run validate             # repo + public-boundary validation — must pass before any commit
node ./bin/midas.mjs doctor  # runtime readiness
```

Both `npm test` and `npm run validate` must pass before you commit. They are
dependency-free and take under 15 seconds combined — there is no reason to skip them.

## Scope rules

- This repo contains ONLY the framework: `bin/`, `lib/`, `framework/`, `docs/`, `test/`,
  and governance files.
- Product applications, demos, internal playbooks, prompt packs, and benchmark evidence
  do NOT belong here. If a task asks you to add one, stop and flag it — see
  [`docs/public-boundary.md`](docs/public-boundary.md).
- **This is a public repository.** Everything committed here is public the moment it is
  pushed. Apply `docs/public-boundary.md` to every change. Never commit credentials,
  tokens, `.env` values, machine-local absolute paths, client material, or private
  operating memory.

## Repository map

| Path | Contains |
|---|---|
| `bin/midas.mjs` | CLI entrypoint |
| `lib/` | CLI implementation, validators, runtime runner, memory vault, MCP server |
| `framework/` | Modules, agent profiles, contracts, schemas, skill packs, templates, workflows |
| `docs/` | Public docs, capability map, public boundary |
| `test/` | `node:test` coverage |

## Engineering rules

- Node >= 20.12.0. **No runtime dependencies** — do not add any without explicit
  maintainer approval. The zero-dependency property is a feature, not an accident.
- ES modules (`.mjs`). No TypeScript, no build step.
- Every behavior change ships with a test in `test/`.
- Every CLI or contract change updates `README.md`, `docs/capability-map.md`, and
  (if scope changes) `docs/architecture.md`. `midas docs-staleness` exists for this.
- Validators are deterministic: no network calls, no LLM calls, no shell interpolation.
- Prefer the smallest reversible change that satisfies the task.

## Claim discipline

- No public superiority claims against named frameworks without an approved benchmark
  receipt (see `framework/benchmarks/` policy and `release-plan.md`).
- No adoption, revenue, security, or production-readiness claims.
- Release-state changes (npm publish, announcements) require explicit maintainer approval.
- A control is proven, not assumed: when you add a guard, demonstrate it **fails** on bad
  input, not only that it passes on good input.

## Conventions

- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- Contributions are accepted under Apache-2.0 with a DCO sign-off — see
  [`CONTRIBUTING.md`](CONTRIBUTING.md).
- Report security issues per [`SECURITY.md`](SECURITY.md). Do not open a public issue for
  a vulnerability.

## Using MIDAS from an agent runtime

MIDAS ships a dependency-free MCP stdio server, which is the supported way for an agent
to call MIDAS tools:

```jsonc
// .mcp.json in the consuming project
{
  "mcpServers": {
    "midas": {
      "command": "node",
      "args": ["<path-to>/MIDAS-Framework/bin/midas.mjs", "mcp", "--directory", "."]
    }
  }
}
```

It speaks MCP protocol `2024-11-05` and exposes `midas_next`, `midas_validate`,
`midas_install`, `midas_context`, `midas_quick`, `midas_plan`, `midas_verify`,
`midas_memory_add`, `midas_memory_search`, `midas_memory_show`, and `midas_web_fetch`.
Tool failures are returned as `isError: true` results, not transport errors.

`midas web fetch` refuses private and loopback hosts unless `--allow-local` is passed;
do not remove that guard.
