# MIDAS Architecture

Status: alpha public architecture

MIDAS is organized around a small public core:

```text
CLI -> workspace generator -> module registry -> workflow runner -> runtime runner -> templates -> agent profiles -> authority contracts -> benchmark receipts -> skill library -> interface quality -> quality scorecards -> flow components -> knowledge packs -> run controls -> gateway contracts -> channel gateways -> adapter policy -> adapter contracts -> harness adapters -> context inspector -> validator
```

## CLI

The CLI creates and validates project workspaces. It is dependency-free in the alpha so installation and inspection stay simple.

Current executable commands include install/update, module listing, workflow run creation, runtime status, runtime step updates, observation-driven repair packets, workflow closeout, next-action routing, quick work-order creation, bundle generation, local planning packet creation, verification-gap receipts, UX-spine alignment, docs-staleness checks, strict skill-pack validation, agent profile inspection, authority inspection, benchmark receipt inspection, skill-library inspection, interface-quality inspection, quality-scorecard inspection, flow component inspection, gateway-contract inspection, knowledge-pack inspection, run-control inspection, adapter contract inspection, context inspection, and validation.

## Workspace

The generated `.midas/` folder contains:

- `_config/manifest.yaml`
- `project-context.md`
- `sprint-status.yaml`
- `checks.json`
- `agent-profiles.json`
- `authority/constitution.json`
- `benchmarks/receipts.json`
- `benchmarks/evidence/`
- `interface/quality.json`
- `quality/scorecard.json`
- `flows/components.json`
- `gateways/contracts.json`
- `knowledge/packs.json`
- `planning/`
- `run-control/policy.json`
- `reports/`
- `runtime/runs/`
- `channels/gateways.json`
- `skills/`
- `harness-inventory.json`
- `context-snapshot.json`
- `workorders/`
- `run-ledger/`

## Modules

Modules describe the major capability groups MIDAS can install into a project:

- `core`
- `software-dev`
- `agentic-agile`
- `builder`
- `qa`
- `operator-runtime`

Each module has a `module.json` manifest validated against `framework/modules/module.schema.json`.

## Agentic Agile

The `agentic-agile` module adds deterministic gates before completion claims:

- `midas plan` creates local PRD, DESIGN, EXPERIENCE, and handoff files before broad implementation.
- `midas ux-spine` checks that components in DESIGN.md map to flows in EXPERIENCE.md.
- `midas verify` writes a verification-gap receipt that compares auditable requirements against implementation evidence.
- `midas docs-staleness` flags source/framework changes without matching documentation review.
- `midas validate-pack` validates a single SKILL.md or a skill library before runtime use.

These gates improve omission detection and handoff quality, but they remain bounded checks. They do not prove runtime correctness, UI polish, accessibility, provider readiness, or public release state without separate evidence.

## Authority Contracts

MIDAS authority contracts are machine-readable constitutions for instruction conflict resolution and claim discipline. `midas authority` validates authority order, protected invariants, conflict policy, verification-before-done requirements, escalation rules, and claim ceilings.

The public alpha ships a default `.midas/authority/constitution.json` that requires current explicit requests, project constitution, live evidence, and verified results to outrank memory or handoffs; protects no-secret-read, public-boundary, evidence-before-claim, and approval-gate invariants; requires local checks, diff inspection, recorded evidence, run-ledger update, and no unverified claims before done; and requires approval for destructive actions, secret access, external-provider changes, public claims/releases, money movement, deploys, and migrations.

Authority validation is a deterministic policy-shape check. It does not replace human judgment, runtime enforcement, legal review, benchmark scoring, or approval records. It prevents a generated workspace from silently weakening the conflict and claim rules that make evidence-led agent work auditable.

## Benchmark Receipts

MIDAS benchmark receipts are machine-readable claim-evidence records. `midas benchmarks` validates the receipt policy, benchmark scope, model/provider route, inference parameters, scorer/version/command, score denominator, task manifest and item-level evidence paths, evidence hashes, rerun policy, paired comparison proof for uplift-style claims, and public-claim boundary.

The public alpha ships a default `.midas/benchmarks/receipts.json` policy with no scores. It creates `.midas/benchmarks/evidence/` as the local destination for raw result files, prediction files, task manifests, item-level result files, comparison files, and run logs. The validator rejects unsafe evidence paths, missing scorer or model route fields, missing inference parameters, missing evidence hashes, unsupported benchmark routes, duplicate ids, malformed scores, uplift/comparison wording without paired comparison evidence, and competitive/public superiority wording unless explicit public-claim approval is recorded.

Benchmark-receipt validation is a deterministic evidence-shape check. It does not produce benchmark scores, certify leaderboard results, compare frameworks, or prove that a model or harness is better. It keeps private/local benchmark work separate from public release claims until repeatable evidence and human approval exist.

## Skill Library

MIDAS skill packs are small `SKILL.md` instruction folders generated into `.midas/skills/`. `midas skills` validates required frontmatter, directory/name consistency, trigger-ready descriptions, license declarations, compatibility bounds, body size, local reference paths, and unsafe pre-approved tool hints. It also emits advisory warnings for suspicious body language that appears to weaken approvals, human review, verification, or gates.

The public alpha ships six default skills: work-order, verification, verification-gap, terminal-repair, local-planning, and spine-ux. They are framework guidance packs, not hidden system prompts, and they stay subordinate to project source, work orders, and human approval. Body-language warnings are review cues only; they do not prove semantic safety or claim to prevent prompt injection.

## Interface Quality

MIDAS interface-quality contracts are machine-readable policies for UI-facing surfaces. `midas interface` validates design context requirements, required evidence gates, safe design-context file paths, surface type, contrast, responsive behavior, overflow checks, motion review, keyboard accessibility, screenshot or visual-regression evidence, human review, runtime hook posture, live-iteration approval, and rollback/failure-mode notes.

The public alpha ships a default `.midas/interface/quality.json` catalog for product interfaces and public pages. Hook findings are advisory by default, live iteration requires approval, browser evidence is required, and external network use is disabled in the default policy. This is a deterministic evidence-shape check; it does not replace browser testing, accessibility tools, visual QA, design review, or human judgment.

## Quality Scorecards

MIDAS quality scorecards are deterministic component-readiness records. `midas quality` validates component ids, artifact paths, required quality dimensions, 0-100 scores, evidence statements, risk notes, approval posture, and public-release claim boundaries.

The public alpha ships a default `.midas/quality/scorecard.json` covering skill-library, harness-adapter, and release-claim readiness. It requires trigger clarity, scope calibration, progressive disclosure, harness portability, evidence discipline, approval safety, and drift control. Public-release readiness stays blocked unless approval is still required and the component score meets the stricter public-release threshold.

Quality-scorecard validation is a deterministic readiness check. It does not certify semantic quality, security, benchmark performance, or marketplace eligibility by itself; it keeps component-quality and distribution claims tied to explicit evidence and release review.

## Flow Components

MIDAS flow components are machine-readable contracts for workflow nodes. `midas flows` validates component ids, typed input/output ports, permission class, promotion stage, approval gate, evidence, failure mode, rollback, and optional tool exposure metadata.

The public alpha ships a default `.midas/flows/components.json` catalog for context intake, work-order planning, verification evidence, approval gating, and run-ledger closeout. Tool exposure is disabled by default. A component that is exposed as a tool must be tool-ready or production-ready, must require a promotion gate, and must require approval.

## Knowledge Packs

MIDAS knowledge packs are machine-readable policies for reviewed project knowledge. `midas knowledge` validates pack ids, allowed source types, citation and license-review requirements, secret and PII exclusions, retention notes, chunking strategy, metadata fields, retrieval tests, quality gates, feedback loop, and optional app exposure metadata.

The public alpha ships a default `.midas/knowledge/packs.json` catalog for project docs, release evidence, and support knowledge. App exposure is disabled by default. A knowledge pack that is exposed through an app must require a publication gate, must require approval, and must describe the user-facing surface.

Knowledge-pack validation is a deterministic policy-shape check. It does not prove retrieval quality, source rights, privacy compliance, or semantic safety by itself; teams still need reviewed sources, retrieval evidence, and human approval before user-facing use.

## Run Controls

MIDAS run controls are machine-readable profiles for bounded execution. `midas run-controls` validates runtime scope, sandbox posture, subagent delegation, message gateway channels, approval gates, evidence checkpoints, and closeout requirements.

The public alpha ships a default `.midas/run-control/policy.json` with focused, long-horizon, and external-action-review profiles. Run-control validation requires objective and stop-condition fields, bounded iterations/runtime/subtasks, explicit secret exclusion, no unrestricted network mode, approval gates for external actions, money, destructive actions, deploys, secret access, and public claims, plus run-ledger/next-action/risk closeout.

Run-control validation is a deterministic policy-shape check. It does not prove an agent will behave safely by itself; teams still need runtime enforcement, reviewed work orders, and human approvals for high-risk actions.

## Gateway Contracts

MIDAS gateway contracts are machine-readable policies for control-plane entrypoints such as CLI sessions, sockets, webhooks, and message bridges. `midas gateways` validates authentication posture, pairing/device identity, schema-validated protocols, capability discovery, side-effect idempotency, unknown-method rejection, cancellation, event retention, run-state recovery, remote exposure, sandbox binding, diagnostics, approval gates, and evidence requirements.

The public alpha ships a default `.midas/gateways/contracts.json` catalog for local operator, private control, and reviewed automation gateway patterns. Non-local gateways must require authentication, device or service identity, explicit pairing, encrypted remote access, approved origins, non-main or all-sandbox posture, approval gates, run-ledger evidence, and remote-origin evidence.

Gateway-contract validation is a deterministic policy-shape check. It does not replace runtime auth, network enforcement, token rotation, transport encryption, sandbox enforcement, or human approval for high-risk side effects.

## Channel Gateways

MIDAS channel gateways are machine-readable contracts for web consoles, chat bridges, schedulers, APIs, and file-transfer surfaces. `midas channels` validates ingress exposure, authentication posture, session isolation, trigger rules, file ingress/egress, high-risk tool exposure, cancellation support, retention, approval gates, and evidence requirements.

The public alpha ships a default `.midas/channels/gateways.json` catalog for local console, private web console, and reviewed message bridge patterns. External or public-facing surfaces must require authentication, session identity, explicit triggers, cancellation, secret/log redaction, approval gates, and run-ledger evidence. File ingress must reject path traversal, scan or review files before use, and block executable uploads. Shell, browser, MCP, scheduler, and file-send exposure must be approval-aware and constrained.

Channel-gateway validation is a deterministic policy-shape check. It does not replace runtime auth, network controls, content scanning, access review, or human approval for external actions.

## Workflow Runner

`midas run-workflow software-delivery` reads the public workflow definition, creates a scoped work order, starts a run-ledger entry, and creates `.midas/runtime/runs/<run-id>/run.json` plus `events.jsonl` inside the target workspace.

`midas run-status` reports the latest runtime run, current step, total steps, completed steps, selected run-control profile, and step records.

`midas step` updates one workflow step to pending, in-progress, completed, blocked, or skipped. Completed steps require evidence. Optional handoff notes are written under the runtime run's `handoffs/` directory.

`midas observe` records a check observation against a runtime step. Failed, warning, or unknown observations create a repair packet under the runtime run's `repairs/` directory with the observed evidence, likely focus areas, and bounded repair discipline for the next attempt. `midas repair` is an alias for the same behavior.

`midas closeout` closes the latest run-ledger entry with status, evidence, risks, and next action, then updates `.midas/sprint-status.yaml`. It warns when a completed closeout still has unfinished runtime steps.

## Harness Adapters

Adapters create tool-native guidance files for supported AI coding environments. Generated adapters are project artifacts, not source of truth.

The shared agent profile registry lives in `framework/agents/default-agent-profiles.json` and is rendered into generated adapter files. `midas agents` checks that required planner, builder, reviewer, and researcher profiles exist, that non-mutating profiles keep mutation and delegation permissions constrained, and that builder permissions remain approval-aware.

The shared adapter permission policy lives in `framework/adapters/default-permission-policy.json` and is rendered into generated adapter files.

The adapter contract registry lives in `framework/adapters/adapter-contracts.json`. `midas adapters` checks the installed adapter files selected by the workspace manifest against required paths, headings, phrases, and size budgets. This catches malformed or hand-edited harness guidance even when the file still exists.

The generated `.midas/harness-inventory.json` records the expected adapter files and content hashes for the workspace. `midas inventory` checks the inventory against the installed manifest and filesystem so teams can catch missing or changed adapter files before relying on a harness setup.

## Context Inspector

The generated `.midas/context-snapshot.json` records the current manifest, project context, checks, agent profiles, authority constitution, benchmark receipt policy, interface-quality policy, quality scorecard, gateway contracts, channel gateways, harness inventory, and generated adapter hashes.

`midas context` compares the live workspace against the snapshot, reports stale context warnings, checks context budgets, and fails when the manifest, project context, or harness inventory disagree. `midas context --write` refreshes the snapshot after an intentional context change.

## Validator

The validator checks required public files, generated workspace shape, runtime run shape, runtime observation and repair-packet shape, agent profile shape and semantic permission boundaries, authority contracts, benchmark receipts, skill-library shape, interface-quality contracts, quality scorecards, flow component contracts, knowledge-pack contracts, run-control policies, gateway contracts, channel gateway contracts, adapter contract shape, adapter contract health, context health, harness inventory shape, adapter drift, module manifests, workflow shape, adapter policy shape, declared project-check shape, secret-like assignments, private-path leaks, and internal-only references.

Installed workspaces may declare local verification commands in `.midas/checks.json`. `midas validate` checks the declaration shape. `midas validate --run-checks` executes enabled checks without shell interpolation, with contained working directories and bounded timeouts.
