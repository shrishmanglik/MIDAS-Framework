import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const cli = path.resolve('bin/midas.mjs');

async function run(args, cwd = path.resolve('.')) {
  const { stdout } = await execFileAsync(process.execPath, [cli, ...args], { cwd });
  return stdout.trim();
}

test('list-tools prints supported adapters', async () => {
  const output = await run(['list-tools']);
  assert.match(output, /codex/);
  assert.match(output, /claude-code/);
});

test('modules prints available module registry', async () => {
  const output = await run(['modules']);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.ok(result.modules.some((module) => module.id === 'core'));
});

test('install creates a .midas workspace and adapters', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-install-'));
  const output = await run([
    'install',
    '--directory',
    temp,
    '--modules',
    'core,software-dev,qa',
    '--tools',
    'codex,claude-code',
    '--yes'
  ]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'installed');
  assert.ok(await fs.stat(path.join(temp, '.midas', '_config', 'manifest.yaml')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'harness-inventory.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'context-snapshot.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'agent-profiles.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'authority', 'constitution.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'benchmarks', 'receipts.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'benchmarks', 'evidence')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'channels', 'gateways.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'flows', 'components.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'gateways', 'contracts.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'interface', 'quality.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'knowledge', 'packs.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'quality', 'scorecard.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'run-control', 'policy.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'runtime', 'runs')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'skills', 'terminal-repair', 'SKILL.md')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'skills', 'work-order', 'SKILL.md')));
  assert.ok(await fs.stat(path.join(temp, '.codex', 'skills', 'midas', 'MIDAS.md')));
  assert.ok(await fs.stat(path.join(temp, '.claude', 'skills', 'midas', 'MIDAS.md')));
});

test('inventory reports generated adapter state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-inventory-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev', '--tools', 'codex,claude-code', '--yes']);
  const output = await run(['inventory', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.inventoryTools, ['codex', 'claude-code']);
  assert.ok(result.adapters.every((adapter) => adapter.status === 'present'));
});

test('adapters reports generated adapter contract state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-adapters-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev', '--tools', 'codex,claude-code', '--yes']);
  const output = await run(['adapters', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.adapters.map((adapter) => adapter.id), ['codex', 'claude-code']);
});

test('agents reports generated profile state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-agents-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev', '--tools', 'codex,opencode', '--yes']);
  const output = await run(['agents', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.requiredProfileIds, ['planner', 'builder', 'reviewer', 'researcher']);
  assert.ok(result.profiles.some((profile) => profile.id === 'planner'));
});

test('authority reports generated authority constitution state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-authority-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,operator-runtime', '--tools', 'codex', '--yes']);
  const output = await run(['authority', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.equal(result.authorityOrder[0], 'current-request');
  assert.ok(result.protectedInvariants.some((invariant) => invariant.id === 'public-boundary'));
});

test('benchmarks reports generated receipt policy state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-benchmarks-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,qa', '--tools', 'codex', '--yes']);
  const output = await run(['benchmarks', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.equal(result.schemaVersion, 'midas.benchmark-receipts.v1');
  assert.deepEqual(result.receipts, []);
  assert.ok(result.policy.claimCeilings.includes('private-benchmark'));
});

test('skills reports generated skill library state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-skills-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev', '--tools', 'codex', '--yes']);
  const output = await run(['skills', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.ok(result.skills.some((skill) => skill.id === 'terminal-repair'));
  assert.ok(result.skills.some((skill) => skill.id === 'work-order'));
  assert.ok(result.skills.some((skill) => skill.id === 'verification'));
});

test('interface reports generated quality contract state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-interface-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev,qa', '--tools', 'codex', '--yes']);
  const output = await run(['interface', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.equal(result.schemaVersion, 'midas.interface-quality.v1');
  assert.ok(result.surfaces.some((surface) => surface.id === 'product-interface'));
  assert.ok(result.policy.requiredEvidence.includes('human-review'));
});

test('flows reports generated component contract state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-flows-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev', '--tools', 'codex', '--yes']);
  const output = await run(['flows', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.ok(result.components.some((component) => component.id === 'work-order-planner'));
  assert.ok(result.components.some((component) => component.id === 'approval-gate'));
});

test('gateways reports generated control-plane contract state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-gateways-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,operator-runtime', '--tools', 'codex', '--yes']);
  const output = await run(['gateways', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.ok(result.gateways.some((gateway) => gateway.id === 'local-operator-gateway'));
  assert.ok(result.gateways.some((gateway) => gateway.id === 'private-control-gateway'));
});

test('knowledge reports generated knowledge pack state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-knowledge-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev', '--tools', 'codex', '--yes']);
  const output = await run(['knowledge', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.ok(result.packs.some((pack) => pack.id === 'project-docs'));
  assert.ok(result.packs.some((pack) => pack.id === 'release-evidence'));
});

test('quality reports generated component scorecard state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-quality-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev,qa', '--tools', 'codex', '--yes']);
  const output = await run(['quality', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.equal(result.schemaVersion, 'midas.quality-scorecard.v1');
  assert.ok(result.score >= 80);
  assert.ok(result.components.some((component) => component.id === 'skill-library'));
  assert.ok(result.components.some((component) => component.id === 'release-claims'));
});

test('run-controls reports generated policy state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-run-controls-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,operator-runtime', '--tools', 'codex', '--yes']);
  const output = await run(['run-controls', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.ok(result.profiles.some((profile) => profile.id === 'focused-run'));
  assert.ok(result.profiles.some((profile) => profile.id === 'long-horizon-run'));
});

test('channels reports generated gateway contract state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-channels-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,operator-runtime', '--tools', 'codex', '--yes']);
  const output = await run(['channels', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.ok(result.gateways.some((gateway) => gateway.id === 'local-console'));
  assert.ok(result.gateways.some((gateway) => gateway.id === 'private-web-console'));
});

test('context reports generated project context health', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-context-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev', '--tools', 'codex,claude-code', '--yes']);
  const output = await run(['context', '--directory', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.manifest.tools, ['codex', 'claude-code']);
});

test('quick creates a quick work order', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-quick-'));
  await run(['install', '--directory', temp, '--modules', 'core', '--tools', 'codex', '--yes']);
  const output = await run(['quick', '--directory', temp, 'Draft the next project work order']);
  const result = JSON.parse(output);
  assert.equal(result.status, 'created');
  assert.match(result.file, /\.midas\/workorders\//);
});

test('run-workflow creates a workflow work order and ledger entry', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-workflow-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev', '--tools', 'codex', '--yes']);
  const output = await run([
    'run-workflow',
    'software-delivery',
    '--directory',
    temp,
    '--objective',
    'Ship one verified slice'
  ]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'created');
  assert.equal(result.workflow, 'software-delivery');
  assert.equal(result.files.length, 4);
  const workOrder = await fs.readFile(path.join(temp, result.files[0]), 'utf8');
  assert.match(workOrder, /Load project context/);
  assert.match(workOrder, /Ship one verified slice/);
});

test('run-status and step update runtime state', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-runtime-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev', '--tools', 'codex', '--yes']);
  await run([
    'run-workflow',
    'software-delivery',
    '--directory',
    temp,
    '--objective',
    'Track CLI runtime'
  ]);
  const before = JSON.parse(await run(['run-status', '--directory', temp]));
  assert.equal(before.status, 'pass');
  assert.equal(before.latest.currentStep, 'context');
  const step = JSON.parse(await run([
    'step',
    '--directory',
    temp,
    '--step',
    'context',
    '--status',
    'completed',
    '--evidence',
    'context loaded',
    '--handoff',
    'planner'
  ]));
  assert.equal(step.status, 'updated');
  assert.equal(step.currentStep, 'work-order');
});

test('observe records failed check evidence through the CLI', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-observe-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev,qa', '--tools', 'codex', '--yes']);
  await run([
    'run-workflow',
    'software-delivery',
    '--directory',
    temp,
    '--objective',
    'Repair failed verification'
  ]);
  const output = await run([
    'observe',
    '--directory',
    temp,
    '--step',
    'verification',
    '--check',
    'unit-tests',
    '--status',
    'failed',
    '--summary',
    'test failed because script is not executable',
    '--evidence',
    'Permission denied',
    '--max-attempts',
    '2'
  ]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'recorded');
  assert.equal(result.observationStatus, 'failed');
  assert.ok(result.repairPacket.endsWith('.md'));
  assert.ok(result.focus.some((item) => item.includes('permissions')));
  const packet = await fs.readFile(path.join(temp, result.repairPacket), 'utf8');
  assert.match(packet, /Permission denied/);
});

test('closeout updates latest workflow ledger entry', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-closeout-cli-'));
  await run(['install', '--directory', temp, '--modules', 'core,software-dev', '--tools', 'codex', '--yes']);
  await run([
    'run-workflow',
    'software-delivery',
    '--directory',
    temp,
    '--objective',
    'Record closeout evidence'
  ]);
  const output = await run([
    'closeout',
    '--directory',
    temp,
    '--status',
    'completed',
    '--evidence',
    'unit checks passed',
    '--risks',
    'none',
    '--next-action',
    'continue the next scoped work order'
  ]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'completed');
  const ledger = await fs.readFile(path.join(temp, result.files[0]), 'utf8');
  assert.match(ledger, /unit checks passed/);
});

test('validate passes for installed workspace', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-validate-'));
  await run(['install', '--directory', temp, '--modules', 'core', '--tools', 'codex', '--yes']);
  const output = await run(['validate', temp]);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
});

test('validate --run-checks executes enabled project checks', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-cli-checks-'));
  await run(['install', '--directory', temp, '--modules', 'core,qa', '--tools', 'codex', '--yes']);
  const config = {
    version: '0.1',
    checks: [
      {
        id: 'node-cli-smoke',
        command: 'node',
        args: ['-e', 'console.log("cli check ok")'],
        cwd: '.',
        enabled: true,
        timeoutMs: 10000
      }
    ]
  };
  await fs.writeFile(path.join(temp, '.midas', 'checks.json'), JSON.stringify(config, null, 2));
  const output = await run(['validate', temp, '--run-checks']);
  const result = JSON.parse(output);
  assert.equal(result.status, 'pass');
  assert.ok(result.checks.some((check) => check.id === 'workspace:project-check:node-cli-smoke'));
});
