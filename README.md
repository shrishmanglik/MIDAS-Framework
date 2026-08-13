# MIDAS Framework

> Public alpha. Apache-2.0. Source available on GitHub. Not published to npm.

MIDAS is a dependency-free Node.js CLI that adds an evidence-led operating layer to an existing software project. It creates scoped work orders, project context, agent permissions, runtime state, and validators under `.midas/`, then writes guidance where supported coding agents actually load it.

It does not replace your coding agent, connect accounts, read secrets, or make the deterministic core depend on a model API.

## Start in 90 seconds

Requires Git and Node.js 20.12 or newer. Use the pinned alpha tag because `main` carries unreleased work.

```bash
git clone --branch v0.1.0-alpha.0 https://github.com/shrishmanglik/MIDAS-Framework.git
cd MIDAS-Framework
npm test
node ./bin/midas.mjs doctor
node ./bin/midas.mjs install --directory ../my-project --modules core,software-dev,qa --tools claude-code,codex --yes
node ./bin/midas.mjs next --directory ../my-project
```

The install command changes only the target project. It creates:

- `.midas/` project context, work orders, run state, checks, and evidence directories
- agent, authority, workflow, quality, and public-claim contracts
- a Claude Code skill at `.claude/skills/midas/SKILL.md`
- a delimited MIDAS block inside the target project's `AGENTS.md` for Codex

`midas next` then reports the next concrete action for that workspace. The install path is local. Nothing phones home.

## What it is for

| Need | MIDAS surface |
|---|---|
| Give agents the same project context and boundaries | generated context, authority contracts, and harness adapters |
| Keep work small and reviewable | scoped work orders, workflow state, handoffs, and run ledgers |
| Prevent completion claims from outrunning evidence | validators, verification-gap receipts, and public-boundary checks |
| Expose the workflow to agent tools | dependency-free MCP stdio server |

This is alpha software with no known production users. The CLI can change between tags. It is not a security guarantee, an autonomous desktop agent, or evidence that MIDAS outperforms another framework.

## Calling MIDAS from Agents (MCP)

MIDAS ships a dependency-free MCP stdio server so any MCP-capable client (Claude Code, Cursor, Codex, custom agents) can call MIDAS tools directly:

```jsonc
// .mcp.json in your project
{
  "mcpServers": {
    "midas": {
      "command": "node",
      "args": ["<path-to>/MIDAS-Framework/bin/midas.mjs", "mcp", "--directory", "."]
    }
  }
}
```

Exposed tools: `midas_next`, `midas_validate`, `midas_install`, `midas_context`, `midas_quick`, `midas_plan`, `midas_verify`, `midas_memory_add`, `midas_memory_search`, `midas_memory_show`, `midas_web_fetch`.

## Where Adapters Land

`midas install --tools ...` writes tool-native guidance to the path each runtime
actually loads. A file the tool never reads is inert no matter how correct it is.

| Tool | Generated file | Loader verified |
|---|---|---|
| `claude-code` | `.claude/skills/midas/SKILL.md` (YAML frontmatter, discoverable skill) | yes |
| `codex` | `AGENTS.md` (delimited MIDAS block) | yes |
| `cursor` | `.cursor/rules/midas/MIDAS.md` | not verified |
| `opencode` | `.opencode/midas/MIDAS.md` | not verified |
| `gemini` | `.gemini/midas/MIDAS.md` | not verified |
| `copilot` | `.github/copilot/midas/MIDAS.md` | not verified |

`AGENTS.md` is shared with your project, so MIDAS writes only between
`<!-- BEGIN MIDAS ADAPTER -->` and `<!-- END MIDAS ADAPTER -->`. Existing content is
preserved, and reinstalling replaces the block instead of appending another. Content
outside the markers is yours and is never validated against MIDAS's size budget.

**"Loader verified" means someone confirmed the runtime loads that path.** The four
unverified rows follow MIDAS's own convention and may not match those tools' current
loaders; `midas adapters` checks that the file exists and satisfies the contract, which
is not the same as proving the tool reads it. Corrections welcome.

## Memory, Web Access, and the Agent Loop

- **Memory vault:** `.midas/memory/` is a linked markdown vault (Obsidian-style `[[links]]`, an always-current `MEMORY.md` index, deterministic ranked search).

  ```bash
  # --description is required; --name is optional and is derived from the description when omitted.
  midas memory add --directory ./my-project --name auth-flow \
    --description "How auth works" --body "Supabase JWT. See [[deploy-notes]]."

  midas memory list   --directory ./my-project
  midas memory search --directory ./my-project "auth"    # a query is required
  midas memory show   --directory ./my-project auth-flow # a name is required
  midas memory links  --directory ./my-project           # link graph + dangling links
  ```

  Dangling `[[links]]` are reported as markers for entries worth writing, not as errors.
- **Web access:** `midas web fetch <url>` fetches live pages with Node's native fetch, extracts readable text and links, refuses private/loopback hosts, and writes SHA-256 evidence receipts under `.midas/reports/web/`. Add `--render` to render JavaScript pages through a locally installed Playwright Chromium (optional; never bundled).
- **Agent loop:** `midas agent --objective "..." --provider anthropic-api|script|manual` runs a bounded tool loop (max steps, read-only by default, `--allow-writes` and `--allow-web` gates, protected-path denial for env/secret files, full `run.json` + `events.jsonl` evidence per run). The `anthropic-api` provider uses your `ANTHROPIC_API_KEY`; the deterministic core never calls a model.
- **License scaffold:** `midas license keygen | sign | install | status` provides offline Ed25519 license verification as the primitive for future paid distributions. No payment or hosted-API capability is implemented or claimed.

Desktop computer-use (OpenClaw-style OS control) is intentionally NOT included: it requires native dependencies and a security review that the alpha has not passed. The gateway/run-control contracts are the intended home for that posture when it lands.

The command reference below carries the full executable surface. The system model and current implementation boundary live in [`docs/architecture.md`](docs/architecture.md) and [`docs/capability-map.md`](docs/capability-map.md).

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

This repository is public. It intentionally excludes:

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
midas mcp          Start the MCP stdio server exposing MIDAS tools to agents.
midas memory       Manage the .midas/memory vault: add, list, search, show, links.
midas web          Fetch a public URL with text extraction and evidence receipts.
midas agent        Run a bounded, evidence-recorded agent loop with gated tools.
midas license      Offline Ed25519 license scaffold: status, install, keygen, sign.
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

The source is publicly visible, but the package is a pre-release alpha: no npm publish, no launch announcement, and no version stability guarantees until the release gate passes:

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
