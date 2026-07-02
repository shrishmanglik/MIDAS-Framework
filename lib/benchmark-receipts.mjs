import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const benchmarkReceiptSchemaVersion = 'midas.benchmark-receipts.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultReceiptsFile = path.join(packageRoot, 'framework', 'benchmarks', 'default-benchmark-receipts.json');
const workspaceReceiptsPath = '.midas/benchmarks/receipts.json';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const sha256Pattern = /^[a-f0-9]{64}$/i;
const requiredClaimCeilings = ['local-validation', 'private-benchmark', 'public-benchmark', 'release-ready'];
const allowedRoutes = new Set(['official-harness', 'official-instance-image', 'representative-micro-eval', 'local-validation', 'manual-replay']);
const guardedClaimPattern = /\b(beat|beats|beating|outperform|outperforms|outperforming|best|leaderboard|official score|state of the art|sota)\b/i;
const comparisonClaimPattern = /\b(uplift|improve|improves|improved|increase|increases|higher|delta|versus|vs\.?|compared|comparison|baseline|raw model|without harness|with harness)\b/i;
const blockedPathPattern = /(^|\/)(\.env|env|secrets?|credentials?|tokens?|private-keys?|browser-storage)(\/|$)/i;

function relativePath(value) {
  return value.replaceAll('\\', '/');
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function failure(id, file, remediation) {
  return {
    id,
    status: 'fail',
    file,
    remediation
  };
}

function stringField(owner, field, value, file, failures, options = {}) {
  const minLength = options.minLength ?? 1;
  const maxLength = options.maxLength ?? 300;
  if (typeof value !== 'string' || value.trim().length < minLength || value.length > maxLength) {
    failures.push(failure(
      `benchmark-receipt:${owner}:${field}`,
      file,
      `${field} must be ${minLength}-${maxLength} characters.`
    ));
    return null;
  }
  return value;
}

function validateEvidencePath(owner, field, value, file, failures) {
  const normalized = typeof value === 'string' ? relativePath(value) : '';
  if (!normalized || path.isAbsolute(normalized) || normalized.includes('..') || blockedPathPattern.test(normalized)) {
    failures.push(failure(
      `benchmark-receipt:${owner}:evidence:${field}`,
      file,
      `${field} must be a safe relative evidence path that does not reference secrets, env files, credentials, tokens, auth stores, or parent directories.`
    ));
  }
  return normalized;
}

function validateSha256(owner, field, value, file, failures) {
  if (typeof value !== 'string' || !sha256Pattern.test(value)) {
    failures.push(failure(
      `benchmark-receipt:${owner}:${field}`,
      file,
      `${field} must be a SHA-256 hex digest.`
    ));
  }
}

function validatePolicy(catalog, file, failures) {
  const policy = catalog.policy;
  if (!isPlainObject(policy)) {
    failures.push(failure('benchmark-receipts:policy', file, 'policy must be an object.'));
    return;
  }
  for (const field of Object.keys(policy)) {
    if (![
      'claimCeilings',
      'publicClaimsRequireApproval',
      'benchmarkClaimsRequireRawResults',
      'requireScorerVersion',
      'requireModelRoute',
      'requireRerunPolicy',
      'requireTaskManifest',
      'requireItemLevelResults',
      'requireEvidenceHashes',
      'requireInferenceParameters',
      'allowedRoutes'
    ].includes(field)) {
      failures.push(failure('benchmark-receipts:policy-field', file, `Unknown policy field "${field}".`));
    }
  }
  if (!Array.isArray(policy.claimCeilings)) {
    failures.push(failure('benchmark-receipts:claim-ceilings', file, 'policy.claimCeilings must be an array.'));
  } else {
    for (const ceiling of requiredClaimCeilings) {
      if (!policy.claimCeilings.includes(ceiling)) {
        failures.push(failure(
          `benchmark-receipts:claim-ceilings:required:${ceiling}`,
          file,
          `policy.claimCeilings must include ${ceiling}.`
        ));
      }
    }
  }
  if (policy.publicClaimsRequireApproval !== true) {
    failures.push(failure('benchmark-receipts:public-claims-require-approval', file, 'Public benchmark claims must require approval.'));
  }
  if (policy.benchmarkClaimsRequireRawResults !== true) {
    failures.push(failure('benchmark-receipts:raw-results-required', file, 'Benchmark claims must require raw result evidence.'));
  }
  if (policy.requireScorerVersion !== true) {
    failures.push(failure('benchmark-receipts:scorer-version-required', file, 'Benchmark receipts must require scorer version or commit evidence.'));
  }
  if (policy.requireModelRoute !== true) {
    failures.push(failure('benchmark-receipts:model-route-required', file, 'Benchmark receipts must require model/provider route evidence.'));
  }
  if (policy.requireRerunPolicy !== true) {
    failures.push(failure('benchmark-receipts:rerun-policy-required', file, 'Benchmark receipts must require a rerun policy.'));
  }
  if (policy.requireTaskManifest !== true) {
    failures.push(failure('benchmark-receipts:task-manifest-required', file, 'Benchmark receipts must require a frozen task manifest path.'));
  }
  if (policy.requireItemLevelResults !== true) {
    failures.push(failure('benchmark-receipts:item-results-required', file, 'Benchmark receipts must require item-level result evidence.'));
  }
  if (policy.requireEvidenceHashes !== true) {
    failures.push(failure('benchmark-receipts:evidence-hashes-required', file, 'Benchmark receipts must require evidence hashes.'));
  }
  if (policy.requireInferenceParameters !== true) {
    failures.push(failure('benchmark-receipts:inference-parameters-required', file, 'Benchmark receipts must require model inference parameters.'));
  }
  if (!Array.isArray(policy.allowedRoutes) || policy.allowedRoutes.length === 0) {
    failures.push(failure('benchmark-receipts:allowed-routes', file, 'policy.allowedRoutes must be a non-empty array.'));
  } else {
    for (const route of policy.allowedRoutes) {
      if (!allowedRoutes.has(route)) {
        failures.push(failure('benchmark-receipts:allowed-routes:value', file, `Unsupported benchmark route: ${route}.`));
      }
    }
  }
}

function validateReceipt(receipt, file, failures) {
  const owner = receipt?.id ?? 'unknown';
  if (!isPlainObject(receipt)) {
    failures.push(failure(`benchmark-receipt:${owner}:shape`, file, 'Receipt entries must be objects.'));
    return;
  }

  const allowedFields = new Set(['id', 'benchmark', 'route', 'scope', 'model', 'inference', 'score', 'scorer', 'evidence', 'comparison', 'rerunPolicy', 'claimBoundary']);
  for (const field of Object.keys(receipt)) {
    if (!allowedFields.has(field)) {
      failures.push(failure(`benchmark-receipt:${owner}:field`, file, `Unknown receipt field "${field}".`));
    }
  }

  if (typeof receipt.id !== 'string' || !idPattern.test(receipt.id)) {
    failures.push(failure(`benchmark-receipt:${owner}:id`, file, 'Receipt id must use lowercase letters, numbers, and hyphen separators.'));
  }
  stringField(owner, 'benchmark', receipt.benchmark, file, failures, { minLength: 2, maxLength: 120 });
  if (typeof receipt.route !== 'string' || !allowedRoutes.has(receipt.route)) {
    failures.push(failure(`benchmark-receipt:${owner}:route`, file, `route must be one of: ${[...allowedRoutes].join(', ')}.`));
  }

  validateScope(receipt, file, failures);
  validateModel(receipt, file, failures);
  validateInference(receipt, file, failures);
  validateScore(receipt, file, failures);
  validateScorer(receipt, file, failures);
  validateEvidence(receipt, file, failures);
  validateComparison(receipt, file, failures);
  validateRerunPolicy(receipt, file, failures);
  validateClaimBoundary(receipt, file, failures);
}

function validateScope(receipt, file, failures) {
  const owner = receipt.id ?? 'unknown';
  const scope = receipt.scope;
  if (!isPlainObject(scope)) {
    failures.push(failure(`benchmark-receipt:${owner}:scope`, file, 'scope must be an object.'));
    return;
  }
  stringField(owner, 'scope.dataset', scope.dataset, file, failures, { minLength: 2, maxLength: 160 });
  stringField(owner, 'scope.split', scope.split, file, failures, { minLength: 2, maxLength: 80 });
  if (!Number.isInteger(scope.sampleCount) || scope.sampleCount < 1) {
    failures.push(failure(`benchmark-receipt:${owner}:scope:sample-count`, file, 'scope.sampleCount must be a positive integer.'));
  }
  if (typeof scope.official !== 'boolean') {
    failures.push(failure(`benchmark-receipt:${owner}:scope:official`, file, 'scope.official must be a boolean.'));
  }
}

function validateModel(receipt, file, failures) {
  const owner = receipt.id ?? 'unknown';
  const model = receipt.model;
  if (!isPlainObject(model)) {
    failures.push(failure(`benchmark-receipt:${owner}:model`, file, 'model must be an object.'));
    return;
  }
  stringField(owner, 'model.provider', model.provider, file, failures, { minLength: 2, maxLength: 80 });
  stringField(owner, 'model.name', model.name, file, failures, { minLength: 1, maxLength: 160 });
  stringField(owner, 'model.route', model.route, file, failures, { minLength: 3, maxLength: 160 });
}

function validateInference(receipt, file, failures) {
  const owner = receipt.id ?? 'unknown';
  const inference = receipt.inference;
  if (!isPlainObject(inference)) {
    failures.push(failure(`benchmark-receipt:${owner}:inference`, file, 'inference must be an object with repeatable model runtime parameters.'));
    return;
  }
  stringField(owner, 'inference.contextWindow', String(inference.contextWindow ?? ''), file, failures, { minLength: 1, maxLength: 40 });
  stringField(owner, 'inference.temperature', String(inference.temperature ?? ''), file, failures, { minLength: 1, maxLength: 40 });
  stringField(owner, 'inference.maxOutputTokens', String(inference.maxOutputTokens ?? ''), file, failures, { minLength: 1, maxLength: 40 });
  stringField(owner, 'inference.timeoutSec', String(inference.timeoutSec ?? ''), file, failures, { minLength: 1, maxLength: 40 });
  stringField(owner, 'inference.seed', String(inference.seed ?? 'not-set'), file, failures, { minLength: 1, maxLength: 80 });
}

function validateScore(receipt, file, failures) {
  const owner = receipt.id ?? 'unknown';
  const score = receipt.score;
  if (!isPlainObject(score)) {
    failures.push(failure(`benchmark-receipt:${owner}:score`, file, 'score must be an object.'));
    return;
  }
  stringField(owner, 'score.metric', score.metric, file, failures, { minLength: 2, maxLength: 80 });
  if (!Number.isFinite(score.value) || score.value < 0 || score.value > 1) {
    failures.push(failure(`benchmark-receipt:${owner}:score:value`, file, 'score.value must be a number from 0 to 1.'));
  }
  if (!Number.isInteger(score.resolved) || score.resolved < 0) {
    failures.push(failure(`benchmark-receipt:${owner}:score:resolved`, file, 'score.resolved must be a non-negative integer.'));
  }
  if (!Number.isInteger(score.total) || score.total < 1) {
    failures.push(failure(`benchmark-receipt:${owner}:score:total`, file, 'score.total must be a positive integer.'));
  }
  if (Number.isInteger(score.resolved) && Number.isInteger(score.total) && score.resolved > score.total) {
    failures.push(failure(`benchmark-receipt:${owner}:score:resolved-total`, file, 'score.resolved cannot exceed score.total.'));
  }
}

function validateScorer(receipt, file, failures) {
  const owner = receipt.id ?? 'unknown';
  const scorer = receipt.scorer;
  if (!isPlainObject(scorer)) {
    failures.push(failure(`benchmark-receipt:${owner}:scorer`, file, 'scorer must be an object.'));
    return;
  }
  stringField(owner, 'scorer.name', scorer.name, file, failures, { minLength: 2, maxLength: 120 });
  stringField(owner, 'scorer.version', scorer.version, file, failures, { minLength: 2, maxLength: 160 });
  stringField(owner, 'scorer.command', scorer.command, file, failures, { minLength: 6, maxLength: 600 });
}

function validateEvidence(receipt, file, failures) {
  const owner = receipt.id ?? 'unknown';
  const evidence = receipt.evidence;
  if (!isPlainObject(evidence)) {
    failures.push(failure(`benchmark-receipt:${owner}:evidence`, file, 'evidence must be an object.'));
    return;
  }
  for (const field of ['rawResultsPath', 'runLogPath', 'taskManifestPath', 'itemResultsPath']) {
    validateEvidencePath(owner, field, evidence[field], file, failures);
  }
  if (evidence.predictionPath !== null) {
    validateEvidencePath(owner, 'predictionPath', evidence.predictionPath, file, failures);
  }
  validateSha256(owner, 'evidence.rawResultsSha256', evidence.rawResultsSha256, file, failures);
  validateSha256(owner, 'evidence.runLogSha256', evidence.runLogSha256, file, failures);
  validateSha256(owner, 'evidence.taskManifestSha256', evidence.taskManifestSha256, file, failures);
  validateSha256(owner, 'evidence.itemResultsSha256', evidence.itemResultsSha256, file, failures);
  stringField(owner, 'evidence.createdAt', evidence.createdAt, file, failures, { minLength: 10, maxLength: 40 });
}

function validateComparisonScore(owner, field, score, file, failures) {
  if (!isPlainObject(score)) {
    failures.push(failure(`benchmark-receipt:${owner}:${field}`, file, `${field} must be a score object.`));
    return;
  }
  if (!Number.isInteger(score.resolved) || score.resolved < 0) {
    failures.push(failure(`benchmark-receipt:${owner}:${field}:resolved`, file, `${field}.resolved must be a non-negative integer.`));
  }
  if (!Number.isInteger(score.total) || score.total < 1) {
    failures.push(failure(`benchmark-receipt:${owner}:${field}:total`, file, `${field}.total must be a positive integer.`));
  }
  if (!Number.isFinite(score.value) || score.value < 0 || score.value > 1) {
    failures.push(failure(`benchmark-receipt:${owner}:${field}:value`, file, `${field}.value must be a number from 0 to 1.`));
  }
}

function validateComparison(receipt, file, failures) {
  const owner = receipt.id ?? 'unknown';
  const summary = receipt.claimBoundary?.allowedSummary;
  const comparison = receipt.comparison;
  const requiresComparison = typeof summary === 'string' && comparisonClaimPattern.test(summary);

  if (comparison === undefined || comparison === null) {
    if (requiresComparison) {
      failures.push(failure(
        `benchmark-receipt:${owner}:comparison-required`,
        file,
        'Uplift, improvement, baseline, raw-vs-harness, or comparison wording requires paired comparison evidence.'
      ));
    }
    return;
  }

  if (!isPlainObject(comparison)) {
    failures.push(failure(`benchmark-receipt:${owner}:comparison`, file, 'comparison must be an object when present.'));
    return;
  }

  stringField(owner, 'comparison.baselineLabel', comparison.baselineLabel, file, failures, { minLength: 2, maxLength: 160 });
  stringField(owner, 'comparison.comparatorLabel', comparison.comparatorLabel, file, failures, { minLength: 2, maxLength: 160 });
  validateComparisonScore(owner, 'comparison.baselineScore', comparison.baselineScore, file, failures);
  validateComparisonScore(owner, 'comparison.comparatorScore', comparison.comparatorScore, file, failures);
  if (!Number.isFinite(comparison.delta) || comparison.delta < -1 || comparison.delta > 1) {
    failures.push(failure(`benchmark-receipt:${owner}:comparison:delta`, file, 'comparison.delta must be a number from -1 to 1.'));
  }
  if (comparison.paired !== true) {
    failures.push(failure(`benchmark-receipt:${owner}:comparison:paired`, file, 'comparison.paired must be true for benchmark uplift evidence.'));
  }
  validateEvidencePath(owner, 'comparison.itemComparisonPath', comparison.itemComparisonPath, file, failures);
  validateSha256(owner, 'comparison.itemComparisonSha256', comparison.itemComparisonSha256, file, failures);
}

function validateRerunPolicy(receipt, file, failures) {
  const owner = receipt.id ?? 'unknown';
  const policy = receipt.rerunPolicy;
  if (!isPlainObject(policy)) {
    failures.push(failure(`benchmark-receipt:${owner}:rerun-policy`, file, 'rerunPolicy must be an object.'));
    return;
  }
  if (!Number.isInteger(policy.minReruns) || policy.minReruns < 0 || policy.minReruns > 100) {
    failures.push(failure(`benchmark-receipt:${owner}:rerun-policy:min-reruns`, file, 'rerunPolicy.minReruns must be an integer from 0 to 100.'));
  }
  stringField(owner, 'rerunPolicy.whenRequired', policy.whenRequired, file, failures, { minLength: 12, maxLength: 300 });
}

function validateClaimBoundary(receipt, file, failures) {
  const owner = receipt.id ?? 'unknown';
  const boundary = receipt.claimBoundary;
  if (!isPlainObject(boundary)) {
    failures.push(failure(`benchmark-receipt:${owner}:claim-boundary`, file, 'claimBoundary must be an object.'));
    return;
  }
  if (!requiredClaimCeilings.includes(boundary.claimLevel)) {
    failures.push(failure(`benchmark-receipt:${owner}:claim-boundary:claim-level`, file, `claimLevel must be one of: ${requiredClaimCeilings.join(', ')}.`));
  }
  if (typeof boundary.publicClaimApproved !== 'boolean') {
    failures.push(failure(`benchmark-receipt:${owner}:claim-boundary:public-claim-approved`, file, 'publicClaimApproved must be a boolean.'));
  }
  const summary = stringField(owner, 'claimBoundary.allowedSummary', boundary.allowedSummary, file, failures, { minLength: 12, maxLength: 500 });
  stringField(owner, 'claimBoundary.limitations', boundary.limitations, file, failures, { minLength: 12, maxLength: 800 });
  if (summary && guardedClaimPattern.test(summary) && boundary.publicClaimApproved !== true) {
    failures.push(failure(
      `benchmark-receipt:${owner}:claim-boundary:guarded-summary`,
      file,
      'Competitive, official-score, leaderboard, best, or superiority wording requires explicit public claim approval.'
    ));
  }
  if (['public-benchmark', 'release-ready'].includes(boundary.claimLevel) && boundary.publicClaimApproved !== true) {
    failures.push(failure(
      `benchmark-receipt:${owner}:claim-boundary:approval-required`,
      file,
      `${boundary.claimLevel} receipts require publicClaimApproved: true.`
    ));
  }
}

export function validateBenchmarkReceipts(catalog, file = 'benchmark-receipts.json') {
  const failures = [];

  if (!isPlainObject(catalog)) {
    return [failure('benchmark-receipts:shape', file, 'Benchmark receipt catalog must be a JSON object.')];
  }

  for (const field of Object.keys(catalog)) {
    if (!['schemaVersion', 'policy', 'receipts'].includes(field)) {
      failures.push(failure('benchmark-receipts:field', file, `Unknown catalog field "${field}".`));
    }
  }

  if (catalog.schemaVersion !== benchmarkReceiptSchemaVersion) {
    failures.push(failure('benchmark-receipts:schema-version', file, `schemaVersion must be ${benchmarkReceiptSchemaVersion}.`));
  }

  validatePolicy(catalog, file, failures);

  if (!Array.isArray(catalog.receipts)) {
    failures.push(failure('benchmark-receipts:receipts', file, 'receipts must be an array.'));
    return failures;
  }

  const seenIds = new Set();
  for (const receipt of catalog.receipts) {
    if (receipt?.id && seenIds.has(receipt.id)) {
      failures.push(failure(`benchmark-receipt:${receipt.id}:duplicate`, file, `Duplicate receipt id: ${receipt.id}.`));
    }
    if (receipt?.id) seenIds.add(receipt.id);
    validateReceipt(receipt, file, failures);
  }

  return failures;
}

export async function inspectBenchmarkReceipts(directory, options = {}) {
  const target = path.resolve(directory);
  const file = options.file
    ? path.resolve(options.file)
    : await exists(path.join(target, workspaceReceiptsPath))
      ? path.join(target, workspaceReceiptsPath)
      : path.join(target, 'framework', 'benchmarks', 'default-benchmark-receipts.json');
  const relativeFile = relativePath(path.relative(target, file));

  if (!await exists(file)) {
    return {
      status: 'fail',
      schemaVersion: benchmarkReceiptSchemaVersion,
      target,
      file: relativeFile,
      receipts: [],
      failures: [
        failure('benchmark-receipts:file', relativeFile, `Create ${relativeFile} or run midas install.`)
      ]
    };
  }

  let catalog;
  try {
    catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      schemaVersion: benchmarkReceiptSchemaVersion,
      target,
      file: relativeFile,
      receipts: [],
      failures: [
        failure('benchmark-receipts:parse', relativeFile, `Unable to parse benchmark receipts: ${error.message}`)
      ]
    };
  }

  const failures = validateBenchmarkReceipts(catalog, relativeFile);
  const receipts = failures.length === 0
    ? catalog.receipts.map((receipt) => ({
      id: receipt.id,
      benchmark: receipt.benchmark,
      route: receipt.route,
      model: receipt.model,
      score: receipt.score,
      claimLevel: receipt.claimBoundary.claimLevel,
      publicClaimApproved: receipt.claimBoundary.publicClaimApproved
    }))
    : [];

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: benchmarkReceiptSchemaVersion,
    target,
    file: relativeFile,
    policy: catalog.policy,
    receipts,
    failures
  };
}

export async function copyDefaultBenchmarkReceipts({ directory }) {
  const target = path.resolve(directory);
  const outFile = path.join(target, workspaceReceiptsPath);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.mkdir(path.join(path.dirname(outFile), 'evidence'), { recursive: true });
  const text = await fs.readFile(defaultReceiptsFile, 'utf8');
  const catalog = JSON.parse(text);
  const failures = validateBenchmarkReceipts(catalog, 'framework/benchmarks/default-benchmark-receipts.json');
  if (failures.length > 0) {
    throw new Error(`Default benchmark receipt policy is invalid: ${failures.map((item) => item.remediation).join('; ')}`);
  }
  await fs.writeFile(outFile, text.endsWith('\n') ? text : `${text}\n`);
  return relativePath(path.relative(target, outFile));
}
