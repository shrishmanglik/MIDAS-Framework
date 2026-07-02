import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  inspectInterfaceQuality,
  validateInterfaceQuality
} from '../lib/interface-quality.mjs';

const validCatalog = {
  schemaVersion: 'midas.interface-quality.v1',
  policy: {
    requiredEvidence: [
      'design-context',
      'contrast-check',
      'responsive-check',
      'overflow-check',
      'motion-review',
      'keyboard-a11y-check',
      'visual-regression-or-screenshot',
      'human-review'
    ],
    allowedSurfaceTypes: [
      'product-ui',
      'marketing-site',
      'documentation',
      'component-library',
      'admin-tool',
      'dashboard'
    ],
    allowedCheckTypes: [
      'manual-review',
      'automated-scan',
      'browser-smoke',
      'screenshot-review',
      'accessibility-audit',
      'performance-check',
      'copy-review'
    ],
    waiversRequireReason: true,
    designSystemDriftRequiresReview: true,
    hookFindingsAreAdvisory: true,
    liveIterationRequiresApproval: true
  },
  surfaces: [
    {
      id: 'product-interface',
      name: 'Product interface',
      surfaceType: 'product-ui',
      purpose: 'User-facing product screens must carry interface evidence before release claims are made.',
      designContext: {
        required: true,
        register: 'product',
        audience: 'primary product users',
        files: ['PRODUCT.md', 'DESIGN.md']
      },
      qualityGates: [
        gate('design-context', 'manual-review'),
        gate('contrast-check', 'accessibility-audit'),
        gate('responsive-check', 'browser-smoke'),
        gate('overflow-check', 'browser-smoke'),
        gate('motion-review', 'manual-review', true),
        gate('keyboard-a11y-check', 'accessibility-audit'),
        gate('visual-regression-or-screenshot', 'screenshot-review', true),
        gate('human-review', 'manual-review')
      ],
      runtime: {
        browserEvidenceRequired: true,
        hookMode: 'advisory',
        liveIteration: 'approval-required',
        externalNetworkAllowed: false
      },
      failureMode: 'Block interface release claims until missing evidence is captured or waived.',
      rollback: 'Revert the changed surface or keep it behind a reviewed preview path.'
    }
  ]
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function gate(id, type, waiverAllowed = false) {
  return {
    id,
    type,
    required: true,
    evidence: `Evidence must be recorded for ${id} before an interface claim is made.`,
    waiverAllowed
  };
}

test('default MIDAS interface-quality policy passes', async () => {
  const result = await inspectInterfaceQuality(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.equal(result.schemaVersion, 'midas.interface-quality.v1');
  assert.ok(result.surfaces.some((surface) => surface.id === 'product-interface'));
  assert.ok(result.policy.requiredEvidence.includes('contrast-check'));
});

test('interface quality rejects missing required evidence gates', () => {
  const catalog = clone(validCatalog);
  catalog.surfaces[0].qualityGates = catalog.surfaces[0].qualityGates.filter((gate) => gate.id !== 'overflow-check');
  const failures = validateInterfaceQuality(catalog);
  assert.ok(failures.some((failure) => failure.id === 'interface-quality:product-interface:required-gate:overflow-check'));
});

test('interface quality rejects unsafe design context paths', () => {
  const catalog = clone(validCatalog);
  catalog.surfaces[0].designContext.files = ['../DESIGN.md', '.midas/interface/.env'];
  const failures = validateInterfaceQuality(catalog);
  assert.ok(failures.some((failure) => failure.id === 'interface-quality:product-interface:design-context:file'));
});

test('interface quality rejects weakened review and live-iteration posture', () => {
  const catalog = clone(validCatalog);
  catalog.policy.waiversRequireReason = false;
  catalog.policy.liveIterationRequiresApproval = false;
  catalog.surfaces[0].runtime.hookMode = 'blocking';
  catalog.surfaces[0].runtime.liveIteration = 'allowed-local';
  const failures = validateInterfaceQuality(catalog);
  assert.ok(failures.some((failure) => failure.id === 'interface-quality:policy:waivers-require-reason'));
  assert.ok(failures.some((failure) => failure.id === 'interface-quality:policy:live-iteration-approval'));
  assert.ok(failures.some((failure) => failure.id === 'interface-quality:product-interface:runtime:blocking-hook'));
});

test('installed workspace includes passing interface-quality policy', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-interface-quality-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev,qa',
    tools: 'codex',
    yes: true
  });
  const result = await inspectInterfaceQuality(temp);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'interface', 'quality.json')));
});
