# MIDAS Implementation Backlog

Status: alpha backlog

| ID | Priority | Item | Target subsystem | Acceptance evidence |
|---|---:|---|---|---|
| MIDAS-001 | P0 | Dependency-free CLI skeleton. | CLI | `npm test` passes. |
| MIDAS-002 | P0 | `.midas/` workspace generator. | Workspace | Clean temp install creates manifest, context, status, adapters. |
| MIDAS-003 | P0 | Public work-order template. | Templates | Template exists and matches CLI-generated work orders. |
| MIDAS-004 | P0 | Capability map. | Docs | Map tracks status and next implementation. |
| MIDAS-005 | P0 | Public-boundary validator. | Validator | Validator fails on private roots, secret assignments, and internal-only names. |
| MIDAS-006 | P1 | Channel/pinning update model. | CLI | Install supports stable/next/pinned manifests. |
| MIDAS-007 | P1 | Module registry schema. | Modules | Complete: `midas modules`, module schema, validator checks, and registry tests pass. |
| MIDAS-008 | P1 | Workflow runner. | Workflows | Complete: `midas run-workflow software-delivery` creates a work-order packet, run-ledger entry, and runtime run state. |
| MIDAS-009 | P1 | Harness-specific adapter tests. | Adapters | Complete: generated adapter files have contract checks for load order, active modules, and permission policy. |
| MIDAS-010 | P1 | JSON validation reports. | Validator | `midas validate --format json`. |
| MIDAS-011 | P2 | Supervised run ledger. | Runtime | Run ledger records objective, evidence, status, and next action. |
| MIDAS-012 | P2 | Public contribution pack. | Governance | CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, issue templates. |
| MIDAS-013 | P1 | Workflow closeout command. | Runtime | Complete: a workflow run can be marked complete with evidence and next action. |
| MIDAS-014 | P1 | Adapter output tests. | Adapters | Generated adapter files have stable contract checks. |
| MIDAS-015 | P1 | Shared adapter permission policy. | Adapters | Complete: generated adapters include one validated policy for approvals, protected content, and evidence. |
| MIDAS-016 | P1 | Workspace project checks. | Validator | Complete: installed workspaces include `.midas/checks.json`; `midas validate --run-checks` executes enabled checks without shell interpolation. |
| MIDAS-017 | P1 | Harness inventory and adapter drift checks. | Adapters | Complete: install writes `.midas/harness-inventory.json`; `midas inventory` and validator fail on missing, changed, or mismatched adapter files. |
| MIDAS-018 | P1 | Context snapshot and drift inspector. | Workspace | Complete: install writes `.midas/context-snapshot.json`; `midas context` reports stale snapshots, budget warnings, and manifest/context/harness drift; `midas context --write` refreshes intentional changes. |
| MIDAS-019 | P1 | Harness adapter contracts. | Adapters | Complete: `framework/adapters/adapter-contracts.json` defines path/heading/phrase/budget contracts; `midas adapters` and validator fail on malformed installed adapter guidance. |
| MIDAS-020 | P1 | Agent profiles and semantic permission checks. | Agents | Complete: install writes `.midas/agent-profiles.json`; `midas agents` and validator fail if required profiles are missing or non-mutating profiles gain edit, shell, or task-delegation authority. |
| MIDAS-021 | P1 | Skill library and SKILL.md validator. | Skills | Complete: install writes `.midas/skills/`; `midas skills` and validator fail on malformed skill frontmatter, vague trigger descriptions, missing license, unsafe allowed-tools, overlong bodies, or unsafe references, and warn on suspicious body language without failing CI. |
| MIDAS-022 | P1 | Flow component catalog and tool-promotion gates. | Flows | Complete: install writes `.midas/flows/components.json`; `midas flows` and validator fail on malformed component contracts, secret-bearing port types, high-risk components without approval, and tool exposure without promotion gates. |
| MIDAS-023 | P1 | Knowledge pack catalog and app publication gates. | Knowledge | Complete: install writes `.midas/knowledge/packs.json`; `midas knowledge` and validator fail on malformed knowledge pack contracts, secret/credential-like source types, missing citations, missing license review, missing retrieval tests, missing required quality gates, PII/secret allowance, and app exposure without publication gates. |
| MIDAS-024 | P1 | Run-control policy catalog and long-run gates. | Runtime | Complete: install writes `.midas/run-control/policy.json`; `midas run-controls` and validator fail on malformed run-control profiles, secret allowance, unrestricted network posture, missing high-risk approval gates, unsafe message gateway channels, unbounded subagents, and missing run-ledger closeout. |
| MIDAS-025 | P1 | Channel gateway catalog and exposure gates. | Channels | Complete: install writes `.midas/channels/gateways.json`; `midas channels` and validator fail on unsafe channel exposure, missing auth, weak group/session boundaries, unguarded file ingress/egress, high-risk tool exposure without gates, missing cancellation, and missing evidence. |
| MIDAS-026 | P1 | Runtime run loop v0. | Runtime | Complete: install creates `.midas/runtime/runs`; `run-workflow --run-control` writes `run.json` and `events.jsonl`; `run-status` reports state; `step` records evidence and handoffs; validator fails malformed runtime state. |
| MIDAS-027 | P1 | Observation-driven repair packets. | Runtime | Complete: `midas observe`/`midas repair` records failed check observations, creates bounded repair packets, records repair attempts, emits runtime events, and validator fails malformed repair state. |
| MIDAS-028 | P1 | Runtime command execution events. | Runtime | Add shell-free `exec-step` with bounded command metadata and output capture. |
| MIDAS-029 | P1 | Gateway control-plane contracts. | Gateways | Complete: install writes `.midas/gateways/contracts.json`; `midas gateways`, context snapshots, and validator fail on malformed control-plane auth, missing pairing identity for non-local gateways, missing schema validation, missing side-effect idempotency, unsafe remote exposure, sandbox bypasses, missing diagnostics, missing approval gates, or missing evidence. |
| MIDAS-030 | P1 | Authority constitution and claim discipline. | Authority | Complete: install writes `.midas/authority/constitution.json`; `midas authority`, context snapshots, and validator fail on malformed authority order, evidence below memory/handoff, missing protected invariants, missing before-done evidence rules, missing escalation rules, or weakened benchmark/public-claim ceilings. |
| MIDAS-031 | P1 | Benchmark receipts and claim-evidence gates. | Benchmarks | Complete: install writes `.midas/benchmarks/receipts.json` and `.midas/benchmarks/evidence/`; `midas benchmarks`, context snapshots, and validator fail on malformed scorer/model/inference/evidence-hash/rerun/claim-boundary records, unsafe evidence paths, uplift wording without paired comparison proof, or unsupported public superiority wording. |
| MIDAS-032 | P1 | Interface quality contracts and UI evidence gates. | Interface | Complete: install writes `.midas/interface/quality.json`; `midas interface`, context snapshots, and validator fail on missing design context, unsafe context paths, missing required UI evidence gates, weakened waiver/review policy, unsafe live-iteration posture, or blocking hooks that conflict with advisory defaults. |
| MIDAS-033 | P1 | Component quality scorecards and release/distribution gates. | Quality | Complete: install writes `.midas/quality/scorecard.json`; `midas quality`, context snapshots, and validator fail on missing required quality dimensions, low required-dimension/component/overall scores, unsafe artifact paths, weakened deterministic/approval/license posture, or public-release readiness without approval and sufficient score. |
| MIDAS-034 | P0 | Agentic agile module and lifecycle gates. | Modules/Workflow | Complete: `agentic-agile` module exists and software-delivery includes planning, UX spine, verification-gap, and docs-staleness stages. |
| MIDAS-035 | P0 | Verification-gap receipt command. | Verification | Complete: `midas verify` compares auditable requirements against implementation evidence and writes `.midas/reports/verification-gap-receipt.md`. |
| MIDAS-036 | P1 | Local-first planning packet command. | Planning | Complete: `midas plan` creates PRD, DESIGN, EXPERIENCE, and README handoff files under `.midas/planning/<work-order>/`. |
| MIDAS-037 | P1 | UX spine validator. | Interface | Complete: `midas ux-spine` validates DESIGN.md component references against EXPERIENCE.md flows and writes `.midas/reports/ux-spine-report.md`. |
| MIDAS-038 | P1 | Docs-staleness guard. | Docs/CI | Complete: `midas docs-staleness` flags source/framework changes without matching docs movement. |
| MIDAS-039 | P0 | Strict skill-pack validator command. | Skills | Complete: `midas validate-pack` validates single skill folders and skill libraries outside a full workspace install. |
| MIDAS-040 | P1 | AST/tree-sitter verification adapter. | Verification | Add deeper symbol-level requirement tracing beyond current deterministic token trace. |
| MIDAS-041 | P1 | Local model planning adapter. | Planning | Add optional Ollama/llama.cpp route that fills planning packet drafts without external web bundles. |
| MIDAS-042 | P0 | MCP stdio server. | Integration | Complete: `midas mcp` speaks JSON-RPC 2.0 over stdio; initialize/tools-list/tools-call covered by tests. |
| MIDAS-043 | P0 | Memory vault. | Memory | Complete: `.midas/memory/` linked vault with index, ranked search, and link-graph inspection; tests pass. |
| MIDAS-044 | P0 | Web access with evidence receipts. | Web | Complete: `midas web fetch` with SSRF guard, extraction, SHA-256 receipts, optional Playwright render; tests pass. |
| MIDAS-045 | P0 | Bounded agent loop. | Runtime | Complete: `midas agent` with manual/script/anthropic-api providers, approval gates, protected paths, run evidence; tests pass. |
| MIDAS-046 | P1 | License scaffold. | Governance | Complete: offline Ed25519 keygen/sign/install/verify with expiry; advisory only. |
| MIDAS-047 | P1 | Desktop computer-use posture. | Runtime | Design-only: define gateway/run-control contracts and dependency review before any OS-control capability ships. |
| MIDAS-048 | P2 | Hosted/paid API surface. | Distribution | Blocked on business approval: requires hosting, auth, metering, and payment decisions outside the framework alpha. |
| MIDAS-049 | P0 | Web fetch SSRF hardening. | Web | Complete: full IPv4/IPv6 private-range classifier, manual per-hop redirect re-validation, DNS-rebinding resolution check, redirect ceiling; adversarial tests cover mapped-IPv6 and metadata-redirect vectors. |
| MIDAS-050 | P1 | Runtime input-robustness pass. | Runtime | Complete: memory frontmatter-injection sanitization, agent malformed-action tolerance, MCP hostile-frame fuzz coverage. |
| MIDAS-051 | P0 | Multi-tenant sandbox for hosted API. | Distribution | Design-only: per-tenant filesystem isolation, resource limits, and per-tenant web-fetch quotas/allowlists are required before the MCP/agent surface can be exposed as a hosted multi-tenant service. |
