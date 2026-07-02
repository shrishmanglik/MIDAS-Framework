import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import { closeoutWorkflow, parseWorkflowDefinition, runWorkflow } from '../lib/workflow-runner.mjs';

test('workflow parser reads software workflow steps and rules', async () => {
  const text = await fs.readFile(path.resolve('framework/workflows/software-delivery.yaml'), 'utf8');
  const workflow = parseWorkflowDefinition(text);
  assert.equal(workflow.id, 'software-delivery');
  assert.ok(workflow.steps.length >= 6);
  assert.ok(workflow.rules.includes('evidence before claims'));
});

test('workflow runner requires an installed workspace', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-no-workspace-'));
  await assert.rejects(
    () => runWorkflow({ directory: temp, workflow: 'software-delivery' }),
    /requires an installed MIDAS workspace/
  );
});

test('workflow runner writes work order and ledger files', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-runner-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev',
    tools: 'codex',
    yes: true
  });
  const result = await runWorkflow({
    directory: temp,
    workflow: 'software-delivery',
    objective: 'Verify the runner contract'
  });
  assert.equal(result.status, 'created');
  const workOrder = await fs.readFile(path.join(temp, result.files[0]), 'utf8');
  const ledger = await fs.readFile(path.join(temp, result.files[1]), 'utf8');
  assert.match(workOrder, /Verify the runner contract/);
  assert.match(ledger, /Status: started/);
  assert.equal(result.files.length, 4);
  const runtime = JSON.parse(await fs.readFile(path.join(temp, result.files[2]), 'utf8'));
  assert.equal(runtime.workflow.id, 'software-delivery');
});

test('workflow closeout records evidence and next action', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-closeout-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev',
    tools: 'codex',
    yes: true
  });
  await runWorkflow({
    directory: temp,
    workflow: 'software-delivery',
    objective: 'Close the runner contract'
  });
  const result = await closeoutWorkflow({
    directory: temp,
    status: 'completed',
    evidence: 'node --test passed; validator passed',
    risks: 'none',
    nextAction: 'Pick the next scoped work order'
  });
  assert.equal(result.status, 'completed');
  assert.ok(result.warnings.some((warning) => warning.includes('unfinished steps')));
  const ledger = await fs.readFile(path.join(temp, result.files[0]), 'utf8');
  const status = await fs.readFile(path.join(temp, '.midas', 'sprint-status.yaml'), 'utf8');
  assert.match(ledger, /Status: completed/);
  assert.match(ledger, /node --test passed/);
  assert.match(ledger, /Next action: Pick the next scoped work order/);
  assert.match(status, /status: completed/);
});
