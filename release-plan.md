# MIDAS Framework Open-Source Release Plan

Status: private alpha implementation plan
Release state: not published
Owner: framework maintainers
Last updated: 2026-06-23

## Release Goal

Ship a useful, license-clean MIDAS public alpha that lets developers initialize agent-ready project workspaces, generate harness files, manage scoped work orders, and validate public-boundary hygiene.

## Alpha Scope

Included:

- dependency-free CLI prototype,
- `.midas/` workspace generator,
- core module manifests,
- module registry schema and validation,
- executable workflow runner for the first public workflow,
- public work-order and project-context templates,
- implementation backlog,
- public-boundary validator,
- clean install and validator tests,
- generated harness inventory and adapter drift checks,
- context snapshot generation and context drift inspection,
- machine-readable harness adapter contracts,
- machine-readable agent profiles with semantic permission checks,
- generated authority contracts with authority order, protected invariants, conflict policy, evidence-before-claim rules, escalation rules, and benchmark/public-claim ceilings,
- generated benchmark receipt policy with scorer, model-route, inference-parameter, item-level evidence, evidence-hash, paired-comparison, rerun, and claim-boundary checks,
- generated interface-quality contracts with design context, UI evidence gates, advisory hook posture, live-iteration approval, and rollback notes,
- generated quality scorecards with component scores, evidence dimensions, drift-control posture, approval gates, and public-release claim boundaries,
- generated flow component catalogs with typed ports, permission classes, approval gates, rollback, and tool-exposure promotion checks,
- generated knowledge pack catalogs with source policies, citation/license gates, retrieval-test declarations, secret/PII exclusions, feedback loops, and app publication gates,
- generated run-control profiles with bounded scope, sandbox/network posture, subagent packets, message gateway approvals, evidence checkpoints, and high-risk approval gates,
- generated gateway contracts with control-plane auth, pairing identity, schema validation, idempotency, event retention, remote exposure, sandbox binding, diagnostics, approvals, and evidence gates,
- generated channel gateway catalogs with ingress/egress, auth, trigger, file-transfer, high-risk tool, approval, and evidence contracts,
- generated skill packs with SKILL.md metadata, safety validation, and advisory suspicious-body warnings.

Excluded until later approval:

- public launch,
- package publish,
- external account connections,
- autonomous browser/desktop control,
- private research notes,
- internal research notes,
- private operating-memory imports,
- client/product-specific playbooks,
- copied external prompts/templates/code.

## Release Gates

| Gate | Required result |
|---|---|
| License review | Apache-2.0 or approved alternate selected. |
| Dependency review | No risky runtime dependency introduced. |
| Secret scan | PASS. |
| Private-path scan | PASS. |
| Private-IP boundary scan | PASS. |
| Public-positioning review | PASS. |
| Generated workspace validation | PASS. |
| Authority constitution review | PASS. |
| Benchmark receipt and claim-boundary review | PASS. |
| Interface-quality evidence review | PASS. |
| Quality-scorecard release/distribution review | PASS. |
| Gateway control-plane contract review | PASS. |
| Channel gateway auth/file/tool-exposure gate review | PASS. |
| README and docs review | PASS. |
| Runtime run-state smoke | PASS. |
| Contribution/security docs | CONTRIBUTING, SECURITY, and CODE_OF_CONDUCT present. |
| Package dry run | `npm pack --dry-run --json` reviewed. |
| Fresh package install smoke | PASS. |
| Public approval | Explicit approval before GitHub/npm/public announcement. |

## Stages

| Stage | Deliverable | Gate |
|---|---|---|
| 0 | Public-boundary skeleton. | Complete. |
| 1 | CLI install/validate/next/quick/run-workflow/run-status/step/pack. | Implemented in alpha. |
| 2 | Multi-harness adapter generation. | Implemented in alpha. |
| 3 | Public templates, module registry, and workflow runner. | Implemented in alpha. |
| 4 | Public repo hardening. | Release gates pass. |
| 5 | Public alpha launch. | Explicit approval only. |

## Public Claim Policy

Allowed after review:

- MIDAS is an agentic software-development framework.
- MIDAS can generate portable project harness files.
- MIDAS supports scoped work orders, project context, validation, and run ledgers.

Not allowed without evidence:

- revenue claims,
- enterprise adoption claims,
- security guarantees,
- production guarantees,
- claims that MIDAS objectively beats a named framework.

## Next Implementation Slice

Add run-summary exports that can draft benchmark receipts from verified runs, browser-backed interface proof attachments, quality evidence attachments, flow-level graph validation, component proof attachments, retrieval-test evidence attachments, gateway live doctor checks, channel proof attachments, context section-level refresh helpers, public contribution/security docs, packaging dry-run checks, richer tool-specific profile renderers, and skill/knowledge pack export/import checks without exposing private material.
