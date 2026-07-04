import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  getRunStatus,
  inspectRuntimeRuns,
  recordRuntimeObservation,
  updateRuntimeStep
} from '../lib/runtime-runner.mjs';
import { runWorkflow } from '../lib/workflow-runner.mjs';

async function installedWorkspace(prefix = 'midas-runtime-') {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev,qa',
    tools: 'codex',
    yes: true
  });
  return temp;
}

test('run-workflow creates runtime run state and events', async () => {
  const temp = await installedWorkspace();
  const result = await runWorkflow({
    directory: temp,
    workflow: 'software-delivery',
    objective: 'Track runtime execution',
    runControl: 'focused-run'
  });
  assert.equal(result.status, 'created');
  assert.equal(result.runtime.file.endsWith('/run.json'), true);
  const run = JSON.parse(await fs.readFile(path.join(temp, result.runtime.file), 'utf8'));
  assert.equal(run.schemaVersion, 'midas.runtime-run.v1');
  assert.equal(run.runControl, 'focused-run');
  assert.equal(run.currentStep, 'context');
  assert.ok(run.steps.some((step) => step.id === 'verification'));
  const events = await fs.readFile(path.join(temp, result.runtime.events), 'utf8');
  assert.match(events, /run.created/);
});

test('run-workflow rejects unknown run-control profile', async () => {
  const temp = await installedWorkspace();
  await assert.rejects(
    () => runWorkflow({
      directory: temp,
      workflow: 'software-delivery',
      objective: 'Reject invalid policy',
      runControl: 'missing-profile'
    }),
    /Unknown run-control profile/
  );
});

test('run-status reports latest runtime step state', async () => {
  const temp = await installedWorkspace();
  await runWorkflow({
    directory: temp,
    workflow: 'software-delivery',
    objective: 'Read runtime status'
  });
  const status = await getRunStatus({ directory: temp });
  assert.equal(status.status, 'pass');
  assert.equal(status.latest.currentStep, 'context');
  assert.equal(status.latest.totalSteps, 9);
});

test('step requires known step ids and completion evidence', async () => {
  const temp = await installedWorkspace();
  await runWorkflow({
    directory: temp,
    workflow: 'software-delivery',
    objective: 'Validate step transitions'
  });
  await assert.rejects(
    () => updateRuntimeStep({ directory: temp, step: 'missing', status: 'completed', evidence: 'done' }),
    /Unknown runtime step/
  );
  await assert.rejects(
    () => updateRuntimeStep({ directory: temp, step: 'context', status: 'completed' }),
    /completed steps require evidence/
  );
});

test('step records evidence, events, and handoff packets', async () => {
  const temp = await installedWorkspace();
  await runWorkflow({
    directory: temp,
    workflow: 'software-delivery',
    objective: 'Record handoff'
  });
  const result = await updateRuntimeStep({
    directory: temp,
    step: 'context',
    status: 'completed',
    evidence: 'project context loaded',
    handoff: 'planner'
  });
  assert.equal(result.status, 'updated');
  assert.equal(result.stepStatus, 'completed');
  assert.equal(result.currentStep, 'planning');
  assert.ok(result.handoff.endsWith('.md'));
  const handoff = await fs.readFile(path.join(temp, result.handoff), 'utf8');
  assert.match(handoff, /project context loaded/);
});

test('observe records failed checks and writes bounded repair packets', async () => {
  const temp = await installedWorkspace();
  await runWorkflow({
    directory: temp,
    workflow: 'software-delivery',
    objective: 'Repair from failed evidence'
  });
  const result = await recordRuntimeObservation({
    directory: temp,
    step: 'verification',
    check: 'project-tests',
    status: 'failed',
    summary: 'pytest failed: expected exact output with trailing newline',
    evidence: 'assert actual != expected',
    maxAttempts: 2
  });
  assert.equal(result.status, 'recorded');
  assert.equal(result.step, 'verification');
  assert.ok(result.repairPacket.endsWith('.md'));
  assert.ok(result.focus.some((item) => item.includes('exact output')));
  const packet = await fs.readFile(path.join(temp, result.repairPacket), 'utf8');
  assert.match(packet, /MIDAS Repair Packet/);
  assert.match(packet, /Max attempts: 2/);
  assert.match(packet, /trailing newline/);
  const run = JSON.parse(await fs.readFile(path.join(temp, result.file), 'utf8'));
  const step = run.steps.find((candidate) => candidate.id === 'verification');
  assert.equal(step.observations.length, 1);
  assert.equal(step.repairAttempts.length, 1);
});

test('runtime inspector fails malformed runtime state', async () => {
  const temp = await installedWorkspace();
  const runDir = path.join(temp, '.midas', 'runtime', 'runs', 'bad-run');
  await fs.mkdir(runDir, { recursive: true });
  await fs.writeFile(path.join(runDir, 'run.json'), JSON.stringify({ schemaVersion: 'bad' }));
  const result = await inspectRuntimeRuns(temp);
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'runtime:schema-version'));
});

test('runtime inspector fails repair attempts without packets', async () => {
  const temp = await installedWorkspace();
  const runDir = path.join(temp, '.midas', 'runtime', 'runs', 'bad-repair-run');
  await fs.mkdir(runDir, { recursive: true });
  await fs.writeFile(path.join(runDir, 'events.jsonl'), '');
  await fs.writeFile(path.join(runDir, 'run.json'), JSON.stringify({
    schemaVersion: 'midas.runtime-run.v1',
    runId: 'bad-repair-run',
    workflow: { id: 'software-delivery' },
    runControl: 'focused-run',
    steps: [{
      id: 'verification',
      status: 'in-progress',
      evidence: [],
      observations: [{ id: 'obs-1', check: 'tests', status: 'failed' }],
      repairAttempts: [{ packet: '.midas/runtime/runs/bad-repair-run/repairs/missing.md' }]
    }]
  }, null, 2));
  const result = await inspectRuntimeRuns(temp);
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'runtime:repair-packet'));
});
