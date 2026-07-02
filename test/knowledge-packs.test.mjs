import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  inspectKnowledgePacks,
  validateKnowledgePackCatalog
} from '../lib/knowledge-packs.mjs';

const validPack = {
  id: 'valid-pack',
  name: 'Valid Pack',
  purpose: 'Collects reviewed project knowledge with citations, retrieval tests, and publication controls.',
  sourcePolicy: {
    allowedSourceTypes: ['project-doc', 'public-doc'],
    citationRequired: true,
    licenseReviewRequired: true,
    secretsAllowed: false,
    piiAllowed: false,
    sourceRetention: 'Keep reviewed source references and remove stale or disallowed entries.'
  },
  retrievalPolicy: {
    chunkStrategy: 'section',
    metadataFields: ['source-path', 'title', 'updated-at'],
    retrievalTests: [
      {
        id: 'source-grounding',
        query: 'Which reviewed source supports this answer?',
        expectedEvidence: 'Answer must cite a reviewed project or public document.'
      }
    ],
    staleAfterDays: 90
  },
  qualityGates: [
    'source-license-review',
    'citation-check',
    'retrieval-test',
    'stale-source-review'
  ],
  feedbackLoop: 'Incorrect answers create a reviewed correction work order before the pack is refreshed.',
  appExposure: {
    enabled: false,
    appName: null,
    description: null,
    requiresPublicationGate: true,
    approvalRequired: 'maintainer'
  }
};

function catalog(pack) {
  return {
    schemaVersion: 'midas.knowledge-packs.v1',
    packs: [pack]
  };
}

test('default MIDAS knowledge pack catalog passes', async () => {
  const result = await inspectKnowledgePacks(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(result.packs.some((pack) => pack.id === 'project-docs'));
  assert.ok(result.packs.some((pack) => pack.id === 'release-evidence'));
});

test('knowledge pack validation rejects secret allowance', () => {
  const failures = validateKnowledgePackCatalog(catalog({
    ...validPack,
    sourcePolicy: {
      ...validPack.sourcePolicy,
      secretsAllowed: true
    }
  }));
  assert.ok(failures.some((failure) => failure.id === 'knowledge-pack:valid-pack:secrets-allowed'));
});

test('knowledge pack validation rejects blocked source types', () => {
  const failures = validateKnowledgePackCatalog(catalog({
    ...validPack,
    sourcePolicy: {
      ...validPack.sourcePolicy,
      allowedSourceTypes: ['project-doc', 'credential']
    }
  }));
  assert.ok(failures.some((failure) => failure.id === 'knowledge-pack:valid-pack:allowed-source-types:blocked'));
});

test('knowledge pack validation requires citations and license review', () => {
  const failures = validateKnowledgePackCatalog(catalog({
    ...validPack,
    sourcePolicy: {
      ...validPack.sourcePolicy,
      citationRequired: false,
      licenseReviewRequired: false
    }
  }));
  assert.ok(failures.some((failure) => failure.id === 'knowledge-pack:valid-pack:citation-required'));
  assert.ok(failures.some((failure) => failure.id === 'knowledge-pack:valid-pack:license-review'));
});

test('knowledge pack validation requires retrieval tests', () => {
  const failures = validateKnowledgePackCatalog(catalog({
    ...validPack,
    retrievalPolicy: {
      ...validPack.retrievalPolicy,
      retrievalTests: []
    }
  }));
  assert.ok(failures.some((failure) => failure.id === 'knowledge-pack:valid-pack:retrieval-tests'));
});

test('knowledge pack validation rejects app exposure without publication gate', () => {
  const failures = validateKnowledgePackCatalog(catalog({
    ...validPack,
    appExposure: {
      enabled: true,
      appName: 'Review App',
      description: 'Makes reviewed knowledge available through a user-facing app surface.',
      requiresPublicationGate: false,
      approvalRequired: 'none'
    }
  }));
  assert.ok(failures.some((failure) => failure.id === 'knowledge-pack:valid-pack:publication-gate'));
  assert.ok(failures.some((failure) => failure.id === 'knowledge-pack:valid-pack:app-exposure-approval'));
});

test('installed workspace includes passing knowledge packs', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-knowledge-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev',
    tools: 'codex',
    yes: true
  });
  const result = await inspectKnowledgePacks(temp);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'knowledge', 'packs.json')));
  assert.ok(result.packs.every((pack) => pack.citationRequired));
});
