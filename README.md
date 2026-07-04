# MIDAS Framework

Status: private alpha candidate
Release state: not published
Default license target: Apache-2.0, pending final approval

MIDAS is an open-source framework for setting up disciplined agentic software projects. It gives a project a `.midas/` workspace, portable harness adapters, work-order structure, runtime step state, module manifests, validation checks, and a small CLI for predictable execution.

The public framework focuses on what developers can use:

- project setup,
- context files,
- work orders,
- module manifests,
- authority contracts,
- benchmark evidence receipts,
- interface quality contracts,
- component quality scorecards,
- flow component contracts,
- knowledge pack policies,
- run-control profiles,
- runtime run state,
- observation-driven repair packets,
- gateway contracts,
- channel gateway contracts,
- harness adapters,
- validation,
- portable bundles,
- and release-ready documentation.

It keeps public docs limited to user-facing framework behavior.

## Quick Start

From this folder:

```bash
npm test
node ./bin/midas.mjs list-tools
node ./bin/midas.mjs modules
node ./bin/midas.mjs install --directory ./tmp/example --modules core,software-dev,qa --tools codex,claude-code --yes
node ./bin/midas.mjs agents --directory ./tmp/example
node ./bin/midas.mjs authority --directory ./tmp/example
node ./bin/midas.mjs benchmarks --directory ./tmp/example
node ./bin/midas.mjs benchmark-bmad --directory . --bmad-directory ../BMAD-METHOD
node ./bin/midas.mjs skills --directory ./tmp/example
node ./bin/midas.mjs interface --directory ./tmp/example
node ./bin/midas.mjs quality --directory ./tmp/example
node ./bin/midas.mjs flows --directory ./tmp/example
node ./bin/midas.mjs gateways --directory ./tmp/example
node ./bin/midas.mjs knowledge --directory ./tmp/example
node ./bin/midas.mjs run-controls --directory ./tmp/example
node ./bin/midas.mjs channels --directory ./tmp/example
node ./bin/midas.mjs adapters --directory ./tmp/example
node ./bin/midas.mjs inventory --directory ./tmp/example
node ./bin/midas.mjs context --directory ./tmp/example
node ./bin/midas.mjs context --directory ./tmp/example --write
node ./bin/midas.mjs plan --directory ./tmp/example --work-order demo "Ship one verified slice"
node ./bin/midas.mjs ux-spine --directory ./tmp/example --design .midas/planning/demo/DESIGN.md --experience .midas/planning/demo/EXPERIENCE.md
node ./bin/midas.mjs verify --directory ./tmp/example --spec .midas/planning/demo/PRD.md
node ./bin/midas.mjs docs-staleness --directory . --files "lib/cli.mjs,docs/architecture.md"
node ./bin/midas.mjs validate-pack ./framework/skills/verification-gap --strict
node ./bin/midas.mjs run-workflow software-delivery --directory ./tmp/example --objective "Ship one verified slice"
node ./bin/midas.mjs run-status --directory ./tmp/example
node ./bin/midas.mjs step --directory ./tmp/example --step context --status completed --evidence "context loaded" --handoff planner
node ./bin/midas.mjs observe --directory ./tmp/example --step verification --check tests --status failed --summary "expected output mismatch"
node ./bin/midas.mjs closeout --directory ./tmp/example --status completed --evidence "tests passed" --risks "none" --next-action "Pick the next scoped work order"
node ./bin/midas.mjs validate ./tmp/example
node ./bin/midas.mjs validate ./tmp/example --run-checks
node ./bin/midas.mjs next --directory ./tmp/example
node ./bin/midas.mjs quick --directory ./tmp/example "Add the next project work order"
```

The installer creates a local `.midas/` workspace in the target project. It does not install third-party agents, connect accounts, read secrets, or run external code.

## Core Concepts

| MIDAS primitive | Purpose |
|---|---|
| Workspace | A `.midas/` folder containing project context, status, work orders, and run ledger. |
| Module | A portable group of workflows, skills, checks, and generated harness files. |
| Work order | A scoped execution packet with objective, constraints, evidence, and done criteria. |
| Project context | A concise file that tells agents how the project works. |
| Agent profile | A machine-readable role profile for planning, building, reviewing, and research with semantic permission checks. |
| Authority contract | A machine-readable constitution for authority order, protected invariants, conflict handling, escalation rules, evidence-before-claim discipline, and claim ceilings. |
| Benchmark receipt | A machine-readable evidence record for benchmark claims, including scorer, model route, inference parameters, task manifest and item-level evidence paths, evidence hashes, rerun policy, paired comparison proof for uplift claims, claim level, and public-approval state. |
| Skill pack | A reusable `SKILL.md` instruction package with validated metadata, trigger description, license, compatibility, safe allowed-tools hints, and advisory body-language warnings. |
| Planning packet | A local-first PRD, DESIGN, EXPERIENCE, and README scaffold generated before expensive implementation loops. |
| UX spine | A synchronized DESIGN.md and EXPERIENCE.md pair where structural components must map to user-flow transitions. |
| Verification-gap receipt | A deterministic traceability report comparing auditable requirements against implementation evidence before completion claims. |
| Docs-staleness check | A source-to-docs drift guard that flags code/framework changes without matching documentation review. |
| Interface quality contract | A machine-readable policy for UI-facing surfaces, including design context, contrast, responsiveness, overflow, motion, keyboard accessibility, screenshot evidence, human review, runtime posture, and waiver discipline. |
| Quality scorecard | A deterministic component-readiness record for skills, adapters, release packages, and other MIDAS primitives, including scores, evidence, risks, drift posture, approval gates, and public-release claim boundaries. |
| Flow component | A machine-readable workflow node contract with typed ports, permission class, promotion stage, evidence, rollback, approval, and tool-exposure gate metadata. |
| Knowledge pack | A machine-readable source and retrieval policy for reviewed project knowledge, including citation requirements, license review, secret/PII exclusions, retrieval tests, feedback loops, and app publication gates. |
| Run-control profile | A machine-readable policy for bounded runs, delegated subtasks, sandbox posture, message gateways, approval gates, evidence checkpoints, and closeout requirements. |
| Runtime run | A resumable workflow state record with step status, evidence, event log, current step, run-control selection, and handoff notes. |
| Repair packet | A bounded follow-up packet created from a failed check observation, with evidence, focus areas, and verification discipline for the next attempt. |
| Gateway contract | A machine-readable control-plane contract for CLI, socket, webhook, and message-bridge gateways, including auth, pairing, protocol schema checks, idempotency, events, remote exposure, sandbox binding, approvals, and evidence. |
| Channel gateway | A machine-readable policy for web, chat, scheduler, API, and file-transfer surfaces, including auth, session isolation, file handling, tool exposure, cancellation, retention, evidence, and approvals. |
| Harness adapter | Tool-native guidance for Codex, Claude Code, Cursor, opencode, Gemini, and related runtimes. |
| Adapter contract | A machine-readable contract for each supported harness adapter path, required headings, required phrases, and size budget. |
| Harness inventory | A generated adapter inventory that lets `midas inventory` and `midas validate` detect missing or changed adapter files. |
| Context snapshot | A generated context health record that lets `midas context` detect stale context, adapter, manifest, check, and inventory state. |
| Permission policy | A shared adapter policy for approval gates, protected content, and required evidence. |
| Project checks | Optional workspace-declared checks that can run through `midas validate --run-checks`. |
| Validator | Checks generated workspaces, declared project checks, and public-boundary hygiene before release. |

## Public Boundary

The default skill library includes work-order, verification, and terminal-repair guidance. Terminal repair is source-neutral: it teaches agents to use observed command output, exact paths, permissions, line endings, shebangs, data conversion checks, and bounded repair packets.

This folder is designed to become a public open-source repo after review. It intentionally excludes:

- private operating-memory systems,
- private/internal material,
- private development methodology,
- client or product-specific playbooks,
- private prompts,
- proprietary company ledgers,
- credentials, tokens, `.env` files, and secrets,
- generated image assets,
- unsupported revenue/security/enterprise claims.

See `docs/public-boundary.md` and `release-plan.md` before any publication.

## Commands

```text
midas install      Create or refresh a .midas workspace.
midas update       Refresh generated MIDAS files in a workspace.
midas list-tools   Print supported harness adapters.
midas agents       Inspect MIDAS agent profiles and semantic permission boundaries.
midas authority    Inspect authority order, protected invariants, evidence rules, and claim ceilings.
midas benchmarks   Inspect benchmark receipts, scorer evidence, model routes, item-level evidence, and claim boundaries.
midas benchmark-bmad Run a private local executable-controls comparison against a pinned BMAD checkout.
midas skills       Inspect MIDAS skill packs and SKILL.md metadata.
midas interface    Inspect MIDAS interface quality contracts, UI evidence gates, and review posture.
midas quality      Inspect MIDAS component quality scorecards and release/distribution readiness gates.
midas flows        Inspect MIDAS flow component contracts and tool-promotion gates.
midas gateways     Inspect MIDAS gateway contracts, control-plane auth, protocol, events, remote posture, and evidence.
midas knowledge    Inspect MIDAS knowledge packs, source policies, retrieval tests, and app publication gates.
midas run-controls Inspect MIDAS run-control profiles, approval gates, sandboxes, and message gateways.
midas channels     Inspect MIDAS channel gateways, ingress rules, file handling, and tool exposure.
midas adapters     Inspect generated harness adapters against adapter contracts.
midas inventory    Inspect generated harness adapters and inventory drift.
midas context      Inspect or refresh project context snapshot and drift.
midas modules      Print available MIDAS modules.
midas doctor       Validate CLI/runtime readiness.
midas validate     Validate a MIDAS repo or installed workspace.
midas validate-pack Validate a single SKILL.md or skill library.
midas plan         Create local-first PRD, DESIGN, EXPERIENCE, and handoff files.
midas verify       Run a verification-gap traceability check from spec to evidence.
midas ux-spine     Validate DESIGN.md component structure against EXPERIENCE.md flows.
midas docs-staleness Detect source/framework changes without matching docs changes.
midas next         Recommend the next MIDAS action for a workspace.
midas quick        Create a quick work order.
midas run-workflow Create a workflow work order, ledger entry, and runtime run state.
midas run-status   Inspect the latest runtime run state.
midas step         Update one runtime workflow step with evidence and optional handoff.
midas observe      Record a check observation and create a bounded repair packet when needed.
midas repair       Alias for observe.
midas closeout     Close the latest workflow ledger entry with evidence.
midas pack         Create portable web/agent bundle files.
```

## Repository Shape

```text
bin/                         CLI entrypoint
lib/                         CLI implementation and validators
framework/modules/           public MIDAS modules
framework/agents/            default role profiles and permission semantics
framework/authority/         default authority constitution and schema
framework/benchmarks/        default benchmark receipt policy and schema
framework/skills/            default SKILL.md instruction packs
framework/interface/         default interface quality policy and schema
framework/quality/           default component quality scorecard and schema
framework/flows/             default flow component contracts and schema
framework/gateways/          default gateway control-plane contracts and schema
framework/knowledge/         default knowledge pack policies and schema
framework/run-control/       default run-control profiles and schema
lib/runtime-runner.mjs        runtime run state and step tracking
framework/channels/          default channel gateway contracts and schema
framework/adapters/          adapter permission policy and schema
framework/templates/         public work-order and context templates
framework/workflows/         portable workflow definitions
lib/verification-gap.mjs      requirement-to-evidence traceability receipts
lib/ux-spine.mjs              DESIGN.md to EXPERIENCE.md alignment checks
lib/planning-suite.mjs        local-first planning packet generation
lib/docs-staleness.mjs        source-to-docs drift checks
lib/framework-comparison-benchmark.mjs private local MIDAS-vs-BMAD executable-controls benchmark
docs/                        public docs, capability map, backlog, release boundary
test/                        node:test coverage
```

## Local BMAD Comparison

`midas benchmark-bmad` runs a private local executable-controls suite against a pinned BMAD checkout. It writes raw results, item-level results, a task manifest, a run log, and a markdown report under `.midas/benchmarks/evidence/`.

The command is intentionally claim-bounded. A passing run can support this claim only:

```text
MIDAS outscored the pinned local BMAD checkout on this private local executable controls suite.
```

It does not prove that MIDAS is globally better than BMAD, more adopted, more complete, stronger on public benchmarks, or better for every planning workflow.

## Release Posture

This is a private alpha candidate until the release gate passes:

1. license review,
2. dependency/license review,
3. secret and private-path scan,
4. private-IP boundary review,
5. generated-output validation,
6. README/positioning approval,
7. package dry-run and fresh packaged install smoke,
8. benchmark receipt and public-claim boundary review,
9. interface-quality evidence review for UI-facing public surfaces,
10. quality-scorecard release/distribution review,
11. explicit public release approval.

No public superiority claim should be made until MIDAS has repeatable evidence.
