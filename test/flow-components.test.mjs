import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  inspectFlowComponents,
  validateFlowComponentCatalog
} from '../lib/flow-components.mjs';

const validComponent = {
  id: 'valid-component',
  name: 'Valid Component',
  kind: 'transform',
  purpose: 'Transforms a scoped input into a validated output for downstream workflow steps.',
  inputs: [
    {
      id: 'input-record',
      type: 'json',
      required: true,
      description: 'A structured input record for the component.'
    }
  ],
  outputs: [
    {
      id: 'output-record',
      type: 'json',
      description: 'A structured output record for the next component.'
    }
  ],
  permissionClass: 'internal-write',
  promotionStage: 'component-proof',
  approvalRequired: 'maintainer',
  evidence: 'A focused component test proves the output shape is stable.',
  failureMode: 'Downstream workflow steps can receive malformed data.',
  rollback: 'Disable the component and return the workflow to draft status.',
  toolExposure: {
    enabled: false,
    toolName: null,
    description: null,
    requiresPromotionGate: true
  }
};

test('default MIDAS flow component catalog passes', async () => {
  const result = await inspectFlowComponents(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(result.components.some((component) => component.id === 'work-order-planner'));
  assert.ok(result.components.some((component) => component.id === 'approval-gate'));
});

test('flow component validation rejects high-risk components without approval', () => {
  const catalog = {
    schemaVersion: 'midas.flow-components.v1',
    components: [
      {
        ...validComponent,
        id: 'external-send',
        permissionClass: 'external-action',
        approvalRequired: 'none'
      }
    ]
  };
  const failures = validateFlowComponentCatalog(catalog);
  assert.ok(failures.some((failure) => failure.id === 'flow-component:external-send:approval-gate'));
});

test('flow component validation rejects tool exposure without promotion gate', () => {
  const catalog = {
    schemaVersion: 'midas.flow-components.v1',
    components: [
      {
        ...validComponent,
        promotionStage: 'component-proof',
        toolExposure: {
          enabled: true,
          toolName: 'bad_tool',
          description: 'Runs a workflow as a reusable tool without enough review.',
          requiresPromotionGate: false
        }
      }
    ]
  };
  const failures = validateFlowComponentCatalog(catalog);
  assert.ok(failures.some((failure) => failure.id === 'flow-component:valid-component:tool-exposure-gate'));
  assert.ok(failures.some((failure) => failure.id === 'flow-component:valid-component:tool-exposure-stage'));
});

test('flow component validation rejects secret-bearing port types', () => {
  const catalog = {
    schemaVersion: 'midas.flow-components.v1',
    components: [
      {
        ...validComponent,
        inputs: [
          {
            id: 'api-key',
            type: 'api-key',
            required: true,
            description: 'A forbidden credential-like input.'
          }
        ]
      }
    ]
  };
  const failures = validateFlowComponentCatalog(catalog);
  assert.ok(failures.some((failure) => failure.id.includes('blocked-type')));
});

test('installed workspace includes passing flow components', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-flows-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev',
    tools: 'codex',
    yes: true
  });
  const result = await inspectFlowComponents(temp);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'flows', 'components.json')));
  assert.ok(result.components.some((component) => component.kind === 'evidence'));
});
