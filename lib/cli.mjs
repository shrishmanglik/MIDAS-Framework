import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspectAgentProfiles } from './agent-profiles.mjs';
import { inspectAdapterContracts } from './adapter-contracts.mjs';
import { inspectAuthorityContracts } from './authority-contracts.mjs';
import { inspectBenchmarkReceipts } from './benchmark-receipts.mjs';
import { supportedTools } from './catalog.mjs';
import { inspectChannelGateways } from './channel-gateways.mjs';
import { inspectProjectContext, writeContextSnapshot } from './context-inspector.mjs';
import { inspectDocsStaleness } from './docs-staleness.mjs';
import { inspectEngineeringDiscipline } from './engineering-discipline.mjs';
import { inspectFlowComponents } from './flow-components.mjs';
import { runFrameworkComparisonBenchmark } from './framework-comparison-benchmark.mjs';
import { inspectGatewayContracts } from './gateway-contracts.mjs';
import { inspectHarnessInventory } from './harness-inventory.mjs';
import { inspectInterfaceQuality } from './interface-quality.mjs';
import { installWorkspace } from './installer.mjs';
import { inspectKnowledgePacks } from './knowledge-packs.mjs';
import { loadModuleRegistry } from './module-registry.mjs';
import { createBundle } from './pack.mjs';
import { createPlanningPacket } from './planning-suite.mjs';
import { inspectQualityScorecard } from './quality-scorecard.mjs';
import { createQuickWorkOrder, recommendNextAction } from './router.mjs';
import { inspectRunControls } from './run-controls.mjs';
import { getRunStatus, recordRuntimeObservation, updateRuntimeStep } from './runtime-runner.mjs';
import { validateSkillPack } from './skill-pack-validator.mjs';
import { inspectSkillLibrary } from './skill-library.mjs';
import { inspectUxSpine } from './ux-spine.mjs';
import { validateTarget } from './validator.mjs';
import { verifyCompletionGap } from './verification-gap.mjs';
import { closeoutWorkflow, runWorkflow } from './workflow-runner.mjs';

function parseArgs(args) {
  const parsed = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (key === 'yes') {
      parsed.yes = true;
      continue;
    }
    const next = args[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

function printHelp() {
  console.log(`MIDAS alpha CLI

Commands:
  install      Create or refresh a .midas workspace.
  update       Alias for install.
  list-tools   Print supported harness adapters.
  agents       Inspect MIDAS agent profiles and semantic permission boundaries.
  authority    Inspect MIDAS authority order, protected invariants, evidence rules, and claim ceilings.
  benchmarks   Inspect MIDAS benchmark receipts, scorer evidence, model routes, and claim boundaries.
  benchmark-bmad Run the local executable MIDAS-vs-BMAD benchmark and write evidence.
  skills       Inspect MIDAS skill packs and SKILL.md metadata.
  discipline   Inspect MIDAS engineering discipline rules for assumptions, scope, diff hygiene, and verification.
  interface    Inspect MIDAS interface quality contracts, UI evidence gates, and review posture.
  flows        Inspect MIDAS flow component contracts and tool-promotion gates.
  gateways     Inspect MIDAS gateway contracts, control-plane auth, protocol, events, remote posture, and evidence.
  knowledge    Inspect MIDAS knowledge packs, source policies, retrieval tests, and app publication gates.
  quality      Inspect MIDAS component quality scorecards and release/distribution readiness gates.
  run-controls Inspect MIDAS run-control profiles, approval gates, sandboxes, and message gateways.
  channels     Inspect MIDAS channel gateways, ingress rules, file handling, and tool exposure.
  adapters     Inspect generated harness adapters against adapter contracts.
  inventory    Inspect generated harness adapters and inventory drift.
  context      Inspect or refresh project context snapshot and drift.
  modules      Print available MIDAS modules.
  doctor       Validate local CLI readiness.
  validate     Validate a MIDAS repo or installed workspace.
  validate-pack Validate a single SKILL.md or skill library.
  plan         Create local-first planning artifacts for a work order.
  verify       Run verification-gap traceability from spec to implementation evidence.
  ux-spine     Validate DESIGN.md component structure against EXPERIENCE.md flows.
  docs-staleness Detect source/framework changes without matching docs changes.
  next         Recommend the next MIDAS action.
  quick        Create a quick work order.
  run-workflow Create a workflow work order and ledger entry.
  run-status   Inspect the latest runtime run state.
  step         Update one runtime workflow step with evidence and optional handoff.
  observe      Record a check observation and create a bounded repair packet when needed.
  repair       Alias for observe.
  closeout     Close the latest workflow ledger entry with evidence.
  pack         Create portable bundle files.

Examples:
  midas install --directory ./my-project --modules core,software-dev,qa --tools codex,claude-code --yes
  midas validate ./my-project
  midas quick --directory ./my-project "Review the next repo"
  midas run-workflow software-delivery --directory ./my-project --objective "Ship one verified slice"
  midas run-status --directory ./my-project
  midas step --directory ./my-project --step verification --status completed --evidence "tests passed" --handoff reviewer
  midas observe --directory ./my-project --step verification --check unit-tests --status failed --summary "expected output mismatch"
  midas closeout --directory ./my-project --status completed --evidence "tests passed" --next-action "Pick next work order"
  midas agents --directory ./my-project
  midas authority --directory ./my-project
  midas benchmarks --directory ./my-project
  midas benchmark-bmad --directory . --bmad-directory ../BMAD-METHOD
  midas skills --directory ./my-project
  midas discipline --directory ./my-project
  midas interface --directory ./my-project
  midas flows --directory ./my-project
  midas gateways --directory ./my-project
  midas knowledge --directory ./my-project
  midas quality --directory ./my-project
  midas run-controls --directory ./my-project
  midas channels --directory ./my-project
  midas adapters --directory ./my-project
  midas inventory --directory ./my-project
  midas context --directory ./my-project
  midas context --directory ./my-project --write
  midas plan --directory ./my-project --work-order demo "Ship one verified slice"
  midas verify --directory ./my-project --spec .midas/planning/demo/PRD.md
  midas ux-spine --directory ./my-project --design DESIGN.md --experience EXPERIENCE.md
  midas docs-staleness --directory ./my-project --files "lib/foo.mjs"
  midas validate-pack ./my-project/.midas/skills/work-order --strict
`);
}

export async function runCli(argv) {
  const command = argv[0] ?? 'help';
  const parsed = parseArgs(argv.slice(1));

  if (command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === 'list-tools') {
    console.log(supportedTools.join('\n'));
    return;
  }

  if (command === 'adapters') {
    const result = await inspectAdapterContracts(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'agents') {
    const result = await inspectAgentProfiles(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'authority') {
    const result = await inspectAuthorityContracts(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'benchmarks') {
    const result = await inspectBenchmarkReceipts(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'benchmark-bmad') {
    const result = await runFrameworkComparisonBenchmark({
      directory: parsed.directory ?? '.',
      bmadDirectory: parsed['bmad-directory'] ?? parsed.bmadDirectory
    });
    console.log(JSON.stringify({
      status: result.summary.winner === 'midas' && !result.summary.tie ? 'pass' : 'fail',
      generatedAt: result.generatedAt,
      winner: result.summary.winner,
      tie: result.summary.tie,
      frameworks: result.summary.frameworks,
      evidence: result.evidence,
      claimBoundary: 'Private local executable controls benchmark only; no public superiority claim.'
    }, null, 2));
    if (result.summary.winner !== 'midas' || result.summary.tie) process.exitCode = 1;
    return;
  }

  if (command === 'skills') {
    const result = await inspectSkillLibrary(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'discipline') {
    const result = await inspectEngineeringDiscipline(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'interface') {
    const result = await inspectInterfaceQuality(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'flows') {
    const result = await inspectFlowComponents(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'gateways') {
    const result = await inspectGatewayContracts(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'knowledge') {
    const result = await inspectKnowledgePacks(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'quality') {
    const result = await inspectQualityScorecard(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'run-controls') {
    const result = await inspectRunControls(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'channels') {
    const result = await inspectChannelGateways(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'modules') {
    const result = await loadModuleRegistry();
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'inventory') {
    const result = await inspectHarnessInventory(parsed.directory ?? parsed._[0] ?? '.');
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'context') {
    const target = parsed.directory ?? parsed._[0] ?? '.';
    const result = parsed.write
      ? await writeContextSnapshot({ directory: target })
      : await inspectProjectContext(target);
    console.log(JSON.stringify(result, null, 2));
    if (result.status === 'fail') process.exitCode = 1;
    return;
  }

  if (command === 'doctor') {
    console.log(JSON.stringify({
      status: 'pass',
      node: process.version,
      cwd: process.cwd(),
      supportedTools
    }, null, 2));
    return;
  }

  if (command === 'install' || command === 'update') {
    const result = await installWorkspace({
      directory: parsed.directory ?? '.',
      modules: parsed.modules,
      tools: parsed.tools,
      yes: Boolean(parsed.yes)
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'validate') {
    const target = parsed._[0] ?? parsed.directory ?? '.';
    const result = await validateTarget(path.resolve(target), {
      runChecks: Boolean(parsed['run-checks'])
    });
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'validate-pack') {
    const target = parsed._[0] ?? parsed.directory ?? '.';
    const result = await validateSkillPack(target, {
      strict: Boolean(parsed.strict)
    });
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'plan') {
    const objective = parsed._.join(' ').trim() || parsed.objective || 'Define one scoped MIDAS work order';
    const result = await createPlanningPacket({
      directory: parsed.directory ?? '.',
      workOrder: parsed['work-order'] ?? parsed.workOrder,
      objective
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'verify') {
    const result = await verifyCompletionGap({
      directory: parsed.directory ?? '.',
      spec: parsed.spec,
      evidenceFiles: parsed['evidence-files'] ?? parsed.evidenceFiles
    });
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'ux-spine') {
    const result = await inspectUxSpine({
      directory: parsed.directory ?? '.',
      design: parsed.design,
      experience: parsed.experience
    });
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'docs-staleness') {
    const result = await inspectDocsStaleness({
      directory: parsed.directory ?? '.',
      files: parsed.files,
      base: parsed.base
    });
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'pass') process.exitCode = 1;
    return;
  }

  if (command === 'next') {
    const result = await recommendNextAction(parsed.directory ?? '.');
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'quick') {
    const intent = parsed._.join(' ').trim();
    if (!intent) throw new Error('quick requires an intent string.');
    const result = await createQuickWorkOrder({
      directory: parsed.directory ?? '.',
      intent
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'run-workflow') {
    const result = await runWorkflow({
      directory: parsed.directory ?? '.',
      workflow: parsed._[0] ?? parsed.workflow ?? 'software-delivery',
      objective: parsed.objective,
      runControl: parsed['run-control'] ?? parsed.runControl
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'run-status') {
    const result = await getRunStatus({
      directory: parsed.directory ?? '.',
      runId: parsed['run-id'] ?? parsed.runId
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'step') {
    const step = parsed.step ?? parsed._[0];
    if (!step) throw new Error('step requires --step <id> or a step id argument.');
    const result = await updateRuntimeStep({
      directory: parsed.directory ?? '.',
      runId: parsed['run-id'] ?? parsed.runId,
      step,
      status: parsed.status ?? 'in-progress',
      evidence: parsed.evidence,
      handoff: parsed.handoff
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'observe' || command === 'repair') {
    const step = parsed.step ?? parsed._[0];
    if (!step) throw new Error(`${command} requires --step <id> or a step id argument.`);
    const result = await recordRuntimeObservation({
      directory: parsed.directory ?? '.',
      runId: parsed['run-id'] ?? parsed.runId,
      step,
      check: parsed.check ?? parsed._[1],
      status: parsed.status ?? 'unknown',
      summary: parsed.summary,
      evidence: parsed.evidence,
      maxAttempts: parsed['max-attempts'] ?? parsed.maxAttempts
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'closeout') {
    const result = await closeoutWorkflow({
      directory: parsed.directory ?? '.',
      status: parsed.status ?? 'completed',
      ledger: parsed.ledger,
      evidence: parsed.evidence,
      risks: parsed.risks,
      nextAction: parsed['next-action'] ?? parsed.nextAction
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'pack') {
    const result = await createBundle({
      directory: parsed.directory ?? '.',
      out: parsed.out
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli(process.argv.slice(2));
}
