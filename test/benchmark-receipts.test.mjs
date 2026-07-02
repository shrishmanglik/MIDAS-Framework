import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  inspectBenchmarkReceipts,
  validateBenchmarkReceipts
} from '../lib/benchmark-receipts.mjs';

const validReceiptCatalog = {
  schemaVersion: 'midas.benchmark-receipts.v1',
  policy: {
    claimCeilings: ['local-validation', 'private-benchmark', 'public-benchmark', 'release-ready'],
    publicClaimsRequireApproval: true,
    benchmarkClaimsRequireRawResults: true,
    requireScorerVersion: true,
    requireModelRoute: true,
    requireRerunPolicy: true,
    requireTaskManifest: true,
    requireItemLevelResults: true,
    requireEvidenceHashes: true,
    requireInferenceParameters: true,
    allowedRoutes: ['official-harness', 'official-instance-image', 'representative-micro-eval', 'local-validation', 'manual-replay']
  },
  receipts: [
    {
      id: 'sample-benchmark-private',
      benchmark: 'Representative task benchmark private slice',
      route: 'official-instance-image',
      scope: {
        dataset: 'representative-task-suite-v1',
        split: 'private-local',
        sampleCount: 5,
        official: false
      },
      model: {
        provider: 'local-provider',
        name: 'local-coder-model',
        route: 'local-model-api'
      },
      inference: {
        contextWindow: 8192,
        temperature: 0,
        maxOutputTokens: 2048,
        timeoutSec: 600,
        seed: 'not-set'
      },
      score: {
        metric: 'accuracy',
        resolved: 5,
        total: 5,
        value: 1
      },
      scorer: {
        name: 'representative-task-scorer',
        version: '0.1.1',
        command: 'task-scorer run --dataset-path ./datasets/representative-task-suite-v1'
      },
      evidence: {
        rawResultsPath: '.midas/benchmarks/evidence/results.json',
        runLogPath: '.midas/benchmarks/evidence/run.log',
        predictionPath: '.midas/benchmarks/evidence/preds.jsonl',
        taskManifestPath: '.midas/benchmarks/evidence/task-manifest.json',
        itemResultsPath: '.midas/benchmarks/evidence/item-results.jsonl',
        rawResultsSha256: 'a'.repeat(64),
        runLogSha256: 'b'.repeat(64),
        taskManifestSha256: 'c'.repeat(64),
        itemResultsSha256: 'd'.repeat(64),
        createdAt: '2026-06-23T22:00:00Z'
      },
      rerunPolicy: {
        minReruns: 1,
        whenRequired: 'Rerun after model, scorer, prompt, strategy, or dataset changes.'
      },
      claimBoundary: {
        claimLevel: 'private-benchmark',
        publicClaimApproved: false,
        allowedSummary: 'Private local slice resolved all five selected tasks with archived raw evidence.',
        limitations: 'Private local slice only; not a public leaderboard score or broad framework superiority claim.'
      }
    }
  ]
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('default MIDAS benchmark receipt policy passes', async () => {
  const result = await inspectBenchmarkReceipts(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.equal(result.schemaVersion, 'midas.benchmark-receipts.v1');
  assert.deepEqual(result.receipts, []);
  assert.ok(result.policy.claimCeilings.includes('private-benchmark'));
});

test('benchmark receipts reject unsupported public superiority claims', () => {
  const catalog = clone(validReceiptCatalog);
  catalog.receipts[0].claimBoundary.allowedSummary = 'MIDAS outperforms every framework on the official leaderboard.';
  const failures = validateBenchmarkReceipts(catalog);
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipt:sample-benchmark-private:claim-boundary:guarded-summary'));
});

test('benchmark receipts require scorer, model route, and raw evidence policy', () => {
  const catalog = clone(validReceiptCatalog);
  catalog.policy.benchmarkClaimsRequireRawResults = false;
  catalog.policy.requireScorerVersion = false;
  catalog.policy.requireModelRoute = false;
  catalog.policy.requireTaskManifest = false;
  catalog.policy.requireItemLevelResults = false;
  catalog.policy.requireEvidenceHashes = false;
  catalog.policy.requireInferenceParameters = false;
  const failures = validateBenchmarkReceipts(catalog);
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipts:raw-results-required'));
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipts:scorer-version-required'));
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipts:model-route-required'));
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipts:task-manifest-required'));
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipts:item-results-required'));
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipts:evidence-hashes-required'));
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipts:inference-parameters-required'));
});

test('benchmark receipts reject unsafe evidence paths', () => {
  const catalog = clone(validReceiptCatalog);
  catalog.receipts[0].evidence.rawResultsPath = '../outside/results.json';
  catalog.receipts[0].evidence.runLogPath = '.midas/benchmarks/evidence/.env';
  catalog.receipts[0].evidence.rawResultsSha256 = 'not-a-hash';
  const failures = validateBenchmarkReceipts(catalog);
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipt:sample-benchmark-private:evidence:rawResultsPath'));
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipt:sample-benchmark-private:evidence:runLogPath'));
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipt:sample-benchmark-private:evidence.rawResultsSha256'));
});

test('benchmark receipts require paired comparison evidence for uplift claims', () => {
  const catalog = clone(validReceiptCatalog);
  catalog.receipts[0].claimBoundary.allowedSummary = 'MIDAS improved the raw model baseline on this private paired slice.';
  let failures = validateBenchmarkReceipts(catalog);
  assert.ok(failures.some((failure) => failure.id === 'benchmark-receipt:sample-benchmark-private:comparison-required'));

  catalog.receipts[0].comparison = {
    baselineLabel: 'raw local model without MIDAS',
    comparatorLabel: 'local model with MIDAS harness',
    baselineScore: { resolved: 2, total: 5, value: 0.4 },
    comparatorScore: { resolved: 5, total: 5, value: 1 },
    delta: 0.6,
    paired: true,
    itemComparisonPath: '.midas/benchmarks/evidence/item-comparison.jsonl',
    itemComparisonSha256: 'e'.repeat(64)
  };
  failures = validateBenchmarkReceipts(catalog);
  assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
});

test('installed workspace includes passing benchmark receipts policy', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-benchmark-receipts-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,qa',
    tools: 'codex',
    yes: true
  });
  const result = await inspectBenchmarkReceipts(temp);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'benchmarks', 'receipts.json')));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'benchmarks', 'evidence')));
});
