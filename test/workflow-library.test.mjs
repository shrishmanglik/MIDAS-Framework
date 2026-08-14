import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  inspectWorkflowLibrary,
  parseWorkflowV2,
  validateWorkflowRecord,
  workflowLibrarySchemaVersion
} from '../lib/workflow-library.mjs';
import { parseWorkflowDefinition } from '../lib/workflow-runner.mjs';

const repoRoot = path.resolve('.');
const fixturesRoot = path.resolve('test/fixtures/workflow-library');

const rosterNames = [
  'planner',
  'builder',
  'reviewer',
  'researcher',
  'backend-architect',
  'frontend-developer',
  'security-auditor',
  'code-reviewer',
  'test-automator',
  'deployment-engineer',
  'data-engineer',
  'debugger',
  'docs-engineer',
  'performance-engineer'
];

async function validateFixture(fileName) {
  const file = path.join(fixturesRoot, fileName);
  return validateWorkflowRecord({
    fileName,
    relativeFile: `test/fixtures/workflow-library/${fileName}`,
    text: await fs.readFile(file, 'utf8'),
    rosterIds: rosterNames
  });
}

test('v2 parser reads software-delivery with handoffs and the readiness gate', async () => {
  const text = await fs.readFile(path.resolve('framework/workflows/software-delivery.yaml'), 'utf8');
  const workflow = parseWorkflowV2(text);
  assert.equal(workflow.id, 'software-delivery');
  assert.equal(workflow.schemaVersion, workflowLibrarySchemaVersion);
  assert.equal(workflow.steps.length, 10);
  const gateStep = workflow.steps.find((step) => step.id === 'implementation-readiness');
  assert.ok(gateStep, 'readiness gate step exists');
  assert.deepEqual(gateStep.handoff, { after: ['design'], enables: ['implementation'] });
  assert.deepEqual(gateStep.gate.verdicts, ['PASS', 'CONCERNS', 'FAIL']);
  assert.equal(gateStep.gate.type, 'readiness');
  assert.equal(gateStep.gate.concernsRequire, 'owners');
  assert.equal(gateStep.gate.failBlocks, true);
  const implementation = workflow.steps.find((step) => step.id === 'implementation');
  assert.deepEqual(implementation.handoff.after, ['implementation-readiness']);
  assert.equal(implementation.agent, 'builder');
});

test('legacy line parser still reads the v2 software-delivery file', async () => {
  const text = await fs.readFile(path.resolve('framework/workflows/software-delivery.yaml'), 'utf8');
  const workflow = parseWorkflowDefinition(text);
  assert.equal(workflow.id, 'software-delivery');
  assert.equal(workflow.steps.length, 10);
  assert.ok(workflow.steps.every((step) => typeof step.id === 'string' && step.id !== ''));
});

test('both shipped workflows validate against the real roster', async () => {
  const result = await inspectWorkflowLibrary(repoRoot);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.equal(result.schemaVersion, workflowLibrarySchemaVersion);
  const ids = result.workflows.map((workflow) => workflow.id).sort();
  assert.deepEqual(ids, ['full-stack-feature', 'software-delivery']);
  const fullStack = result.workflows.find((workflow) => workflow.id === 'full-stack-feature');
  assert.equal(fullStack.steps, 7);
  assert.deepEqual(fullStack.agents, [
    'backend-architect',
    'data-engineer',
    'frontend-developer',
    'test-automator',
    'security-auditor',
    'deployment-engineer',
    'performance-engineer'
  ]);
  const delivery = result.workflows.find((workflow) => workflow.id === 'software-delivery');
  assert.equal(delivery.steps, 10);
  assert.equal(delivery.gates, 1);
});

test('a workflow naming a nonexistent roster agent fails', async () => {
  const result = await validateFixture('nonexistent-agent.yaml');
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'workflow:nonexistent-agent:step:build:agent-unknown'));
  assert.ok(result.failures.every((failure) => !failure.id.includes(':step:plan:')), 'the valid step stays clean');
});

test('a cyclic handoff graph fails', async () => {
  const result = await validateFixture('cyclic-handoff.yaml');
  assert.equal(result.status, 'fail');
  const cycle = result.failures.find((failure) => failure.id === 'workflow:cyclic-handoff:handoff-cycle');
  assert.ok(cycle, JSON.stringify(result.failures, null, 2));
  assert.match(cycle.remediation, /alpha|beta|gamma/);
});

test('a malformed readiness gate fails on every broken field', async () => {
  const result = await validateFixture('bad-gate.yaml');
  assert.equal(result.status, 'fail');
  const ids = result.failures.map((failure) => failure.id);
  assert.ok(ids.includes('workflow:bad-gate:step:ready-check:gate-type'));
  assert.ok(ids.includes('workflow:bad-gate:step:ready-check:gate-verdicts'));
  assert.ok(ids.includes('workflow:bad-gate:step:ready-check:gate-concerns'));
  assert.ok(ids.includes('workflow:bad-gate:step:ready-check:gate-fail-blocks'));
});

test('fixture directory inspection reports all three mutations', async () => {
  const result = await inspectWorkflowLibrary(repoRoot, { root: fixturesRoot, rosterIds: rosterNames });
  assert.equal(result.status, 'fail');
  assert.equal(result.workflows.length, 3);
  const failed = new Set(result.failures.map((failure) => failure.id.split(':')[1]));
  assert.ok(failed.has('nonexistent-agent'));
  assert.ok(failed.has('cyclic-handoff'));
  assert.ok(failed.has('bad-gate'));
});

test('duplicate step ids fail', () => {
  const text = [
    'id: duplicate-steps',
    'name: Duplicate Steps',
    'schemaVersion: midas.workflow.v2',
    'steps:',
    '  - id: once',
    '    name: Once',
    '    output: out',
    '    agent: planner',
    '    handoff:',
    '      after: []',
    '      enables: []',
    '  - id: once',
    '    name: Twice',
    '    output: out',
    '    agent: builder',
    '    handoff:',
    '      after: []',
    '      enables: []'
  ].join('\n');
  const result = validateWorkflowRecord({
    fileName: 'duplicate-steps.yaml',
    relativeFile: 'duplicate-steps.yaml',
    text,
    rosterIds: rosterNames
  });
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'workflow:duplicate-steps:step:once:duplicate'));
});

test('handoff edges must reference existing step ids and not self', () => {
  const text = [
    'id: dangling-handoff',
    'name: Dangling Handoff',
    'schemaVersion: midas.workflow.v2',
    'steps:',
    '  - id: solo',
    '    name: Solo',
    '    output: out',
    '    agent: planner',
    '    handoff:',
    '      after: [ghost]',
    '      enables: [solo]'
  ].join('\n');
  const result = validateWorkflowRecord({
    fileName: 'dangling-handoff.yaml',
    relativeFile: 'dangling-handoff.yaml',
    text,
    rosterIds: rosterNames
  });
  assert.equal(result.status, 'fail');
  const ids = result.failures.map((failure) => failure.id);
  assert.ok(ids.includes('workflow:dangling-handoff:step:solo:handoff-after-unknown'));
  assert.ok(ids.includes('workflow:dangling-handoff:step:solo:handoff-enables-self'));
});

test('missing schemaVersion, missing handoff, and bad model-tier fail', () => {
  const text = [
    'id: sloppy',
    'name: Sloppy',
    'steps:',
    '  - id: only',
    '    name: Only',
    '    output: out',
    '    agent: planner',
    '    model-tier: quantum'
  ].join('\n');
  const result = validateWorkflowRecord({
    fileName: 'sloppy.yaml',
    relativeFile: 'sloppy.yaml',
    text,
    rosterIds: rosterNames
  });
  assert.equal(result.status, 'fail');
  const ids = result.failures.map((failure) => failure.id);
  assert.ok(ids.includes('workflow:sloppy:schema-version'));
  assert.ok(ids.includes('workflow:sloppy:step:only:handoff'));
  assert.ok(ids.includes('workflow:sloppy:step:only:model-tier'));
});

test('parser rejects block lists inside steps instead of guessing', () => {
  const text = [
    'id: block-list',
    'name: Block List',
    'schemaVersion: midas.workflow.v2',
    'steps:',
    '  - id: bad',
    '    handoff:',
    '      after:',
    '        - context'
  ].join('\n');
  assert.throws(() => parseWorkflowV2(text), /Unsupported workflow/);
});

test('open-tier steps are allowed when the tier value is legal', () => {
  const text = [
    'id: tiered',
    'name: Tiered',
    'schemaVersion: midas.workflow.v2',
    'steps:',
    '  - id: bulk',
    '    name: Bulk pass',
    '    output: out',
    '    agent: builder',
    '    model-tier: open',
    '    skill: midas-code-review',
    '    handoff:',
    '      after: []',
    '      enables: []'
  ].join('\n');
  const result = validateWorkflowRecord({
    fileName: 'tiered.yaml',
    relativeFile: 'tiered.yaml',
    text,
    rosterIds: rosterNames
  });
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
});
