import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const qualityScorecardSchemaVersion = 'midas.quality-scorecard.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultScorecardFile = path.join(packageRoot, 'framework', 'quality', 'default-quality-scorecard.json');
const workspaceScorecardPath = '.midas/quality/scorecard.json';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const blockedPathPattern = /(^|\/)(\.env|env|secrets?|credentials?|tokens?|private-keys?|browser-storage|cookies|sessions?)(\/|$)/i;
const requiredClaimLevels = ['local-validation', 'private-preview', 'public-release'];
const requiredPolicyDimensions = [
  'trigger-clarity',
  'scope-calibration',
  'progressive-disclosure',
  'harness-portability',
  'evidence-discipline',
  'approval-safety',
  'drift-control'
];
const requiredComponentKinds = [
  'skill-pack',
  'harness-adapter',
  'agent-profile',
  'work-order',
  'benchmark-receipt',
  'engineering-discipline',
  'interface-contract',
  'knowledge-pack',
  'run-control',
  'gateway-contract',
  'channel-gateway',
  'release-package'
];

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

function warning(id, file, remediation) {
  return {
    id,
    status: 'warn',
    file,
    remediation
  };
}

function stringField(owner, field, value, file, failures, options = {}) {
  const minLength = options.minLength ?? 1;
  const maxLength = options.maxLength ?? 300;
  if (typeof value !== 'string' || value.trim().length < minLength || value.length > maxLength) {
    failures.push(failure(
      `quality-scorecard:${owner}:${field}`,
      file,
      `${field} must be ${minLength}-${maxLength} characters.`
    ));
    return null;
  }
  return value;
}

function validateSafePath(owner, value, file, failures) {
  const normalized = typeof value === 'string' ? relativePath(value) : '';
  if (!normalized || path.isAbsolute(normalized) || normalized.includes('..') || blockedPathPattern.test(normalized)) {
    failures.push(failure(
      `quality-scorecard:${owner}:artifact-path`,
      file,
      'artifactPath must be a safe relative path that does not reference secrets, env files, credentials, tokens, auth stores, or parent directories.'
    ));
  }
  return normalized;
}

function validateStringArray(owner, field, value, required, file, failures) {
  if (!Array.isArray(value) || value.length === 0) {
    failures.push(failure(`quality-scorecard:${owner}:${field}`, file, `${field} must be a non-empty array.`));
    return [];
  }
  const normalized = [];
  const seen = new Set();
  for (const item of value) {
    if (typeof item !== 'string' || item.trim() === '') {
      failures.push(failure(`quality-scorecard:${owner}:${field}:value`, file, `${field} values must be non-empty strings.`));
      continue;
    }
    normalized.push(item);
    if (seen.has(item)) {
      failures.push(failure(`quality-scorecard:${owner}:${field}:duplicate`, file, `${field} values must be unique. Duplicate: ${item}.`));
    }
    seen.add(item);
  }
  for (const item of required) {
    if (!normalized.includes(item)) {
      failures.push(failure(`quality-scorecard:${owner}:${field}:required:${item}`, file, `${field} must include ${item}.`));
    }
  }
  return normalized;
}

function scoreField(owner, field, value, file, failures) {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    failures.push(failure(`quality-scorecard:${owner}:${field}`, file, `${field} must be an integer from 0 to 100.`));
    return 0;
  }
  return value;
}

function validatePolicy(catalog, file, failures) {
  const policy = catalog.policy;
  if (!isPlainObject(policy)) {
    failures.push(failure('quality-scorecard:policy', file, 'policy must be an object.'));
    return;
  }
  const allowedFields = new Set([
    'scoreScale',
    'minOverallScore',
    'minComponentScore',
    'minRequiredDimensionScore',
    'publicReleaseMinScore',
    'deterministicOnlyByDefault',
    'llmJudgesRequireExplicitApproval',
    'distributionClaimsRequireEvidence',
    'publicReleaseRequiresApproval',
    'generatedArtifactsAreNotSourceOfTruth',
    'externalComponentsRequireLicenseReview',
    'requiredDimensions',
    'allowedComponentKinds'
  ]);
  for (const field of Object.keys(policy)) {
    if (!allowedFields.has(field)) {
      failures.push(failure('quality-scorecard:policy-field', file, `Unknown policy field "${field}".`));
    }
  }
  if (policy.scoreScale !== '0-100') {
    failures.push(failure('quality-scorecard:policy:score-scale', file, 'policy.scoreScale must be "0-100".'));
  }
  scoreField('policy', 'minOverallScore', policy.minOverallScore, file, failures);
  scoreField('policy', 'minComponentScore', policy.minComponentScore, file, failures);
  scoreField('policy', 'minRequiredDimensionScore', policy.minRequiredDimensionScore, file, failures);
  scoreField('policy', 'publicReleaseMinScore', policy.publicReleaseMinScore, file, failures);
  if (Number.isInteger(policy.publicReleaseMinScore) && Number.isInteger(policy.minOverallScore) && policy.publicReleaseMinScore < policy.minOverallScore) {
    failures.push(failure('quality-scorecard:policy:public-release-min-score', file, 'publicReleaseMinScore cannot be lower than minOverallScore.'));
  }
  if (policy.deterministicOnlyByDefault !== true) {
    failures.push(failure('quality-scorecard:policy:deterministic-default', file, 'Quality scorecards must default to deterministic checks only.'));
  }
  if (policy.llmJudgesRequireExplicitApproval !== true) {
    failures.push(failure('quality-scorecard:policy:llm-approval', file, 'LLM or Monte Carlo quality judges must require explicit approval.'));
  }
  if (policy.distributionClaimsRequireEvidence !== true) {
    failures.push(failure('quality-scorecard:policy:claim-evidence', file, 'Distribution or quality claims must require evidence.'));
  }
  if (policy.publicReleaseRequiresApproval !== true) {
    failures.push(failure('quality-scorecard:policy:public-release-approval', file, 'Public release readiness must require approval.'));
  }
  if (policy.generatedArtifactsAreNotSourceOfTruth !== true) {
    failures.push(failure('quality-scorecard:policy:generated-source-truth', file, 'Generated artifacts must not be treated as source of truth.'));
  }
  if (policy.externalComponentsRequireLicenseReview !== true) {
    failures.push(failure('quality-scorecard:policy:license-review', file, 'External components must require license review before distribution.'));
  }
  validateStringArray('policy', 'requiredDimensions', policy.requiredDimensions, requiredPolicyDimensions, file, failures);
  validateStringArray('policy', 'allowedComponentKinds', policy.allowedComponentKinds, requiredComponentKinds, file, failures);
}

function validateDimension(componentId, dimension, component, catalog, file, failures) {
  const id = dimension?.id ?? 'unknown';
  if (!isPlainObject(dimension)) {
    failures.push(failure(`quality-scorecard:${componentId}:dimension`, file, 'Dimension entries must be objects.'));
    return null;
  }
  const allowedFields = new Set(['id', 'score', 'evidence']);
  for (const field of Object.keys(dimension)) {
    if (!allowedFields.has(field)) {
      failures.push(failure(`quality-scorecard:${componentId}:${id}:dimension-field`, file, `Unknown dimension field "${field}".`));
    }
  }
  if (typeof dimension.id !== 'string' || !idPattern.test(dimension.id)) {
    failures.push(failure(`quality-scorecard:${componentId}:${id}:id`, file, 'Dimension id must use lowercase letters, numbers, and hyphen separators.'));
  }
  const score = scoreField(`${componentId}:${id}`, 'score', dimension.score, file, failures);
  stringField(`${componentId}:${id}`, 'evidence', dimension.evidence, file, failures, { minLength: 20, maxLength: 600 });
  if (
    Array.isArray(catalog.policy?.requiredDimensions)
    && catalog.policy.requiredDimensions.includes(dimension.id)
    && Number.isInteger(catalog.policy.minRequiredDimensionScore)
    && score < catalog.policy.minRequiredDimensionScore
  ) {
    failures.push(failure(
      `quality-scorecard:${componentId}:${id}:required-score`,
      file,
      `Required dimension ${dimension.id} must score at least ${catalog.policy.minRequiredDimensionScore}.`
    ));
  }
  return {
    id: dimension.id,
    score,
    evidence: dimension.evidence
  };
}

function validateReleaseGate(componentId, component, catalog, componentScore, file, failures, warnings) {
  const gate = component.releaseGate;
  if (!isPlainObject(gate)) {
    failures.push(failure(`quality-scorecard:${componentId}:release-gate`, file, 'releaseGate must be an object.'));
    return null;
  }
  const allowedFields = new Set(['claimLevel', 'publicReleaseReady', 'approvalRequired', 'evidenceRequired']);
  for (const field of Object.keys(gate)) {
    if (!allowedFields.has(field)) {
      failures.push(failure(`quality-scorecard:${componentId}:release-gate-field`, file, `Unknown releaseGate field "${field}".`));
    }
  }
  if (!requiredClaimLevels.includes(gate.claimLevel)) {
    failures.push(failure(`quality-scorecard:${componentId}:claim-level`, file, `claimLevel must be one of: ${requiredClaimLevels.join(', ')}.`));
  }
  if (typeof gate.publicReleaseReady !== 'boolean') {
    failures.push(failure(`quality-scorecard:${componentId}:public-release-ready`, file, 'publicReleaseReady must be a boolean.'));
  }
  if (typeof gate.approvalRequired !== 'boolean') {
    failures.push(failure(`quality-scorecard:${componentId}:approval-required`, file, 'approvalRequired must be a boolean.'));
  }
  stringField(componentId, 'releaseGate.evidenceRequired', gate.evidenceRequired, file, failures, { minLength: 24, maxLength: 600 });
  if ((gate.publicReleaseReady === true || gate.claimLevel === 'public-release') && catalog.policy?.publicReleaseRequiresApproval === true && gate.approvalRequired !== true) {
    failures.push(failure(`quality-scorecard:${componentId}:public-release-approval`, file, 'Public release readiness must keep approvalRequired true.'));
  }
  if (
    gate.publicReleaseReady === true
    && Number.isInteger(catalog.policy?.publicReleaseMinScore)
    && componentScore < catalog.policy.publicReleaseMinScore
  ) {
    failures.push(failure(
      `quality-scorecard:${componentId}:public-release-score`,
      file,
      `publicReleaseReady components must score at least ${catalog.policy.publicReleaseMinScore}.`
    ));
  }
  if (gate.publicReleaseReady !== true) {
    warnings.push(warning(
      `quality-scorecard:${componentId}:not-public-release-ready`,
      file,
      'Component is locally validated but not marked public-release-ready; keep public claims blocked until release review passes.'
    ));
  }
  return gate;
}

function validateComponent(component, catalog, file, failures, warnings) {
  const owner = component?.id ?? 'unknown';
  if (!isPlainObject(component)) {
    failures.push(failure(`quality-scorecard:${owner}:shape`, file, 'Component entries must be objects.'));
    return null;
  }
  const allowedFields = new Set([
    'id',
    'kind',
    'artifactPath',
    'purpose',
    'distributionSurface',
    'dimensions',
    'risks',
    'releaseGate'
  ]);
  for (const field of Object.keys(component)) {
    if (!allowedFields.has(field)) {
      failures.push(failure(`quality-scorecard:${owner}:field`, file, `Unknown component field "${field}".`));
    }
  }
  if (typeof component.id !== 'string' || !idPattern.test(component.id)) {
    failures.push(failure(`quality-scorecard:${owner}:id`, file, 'Component id must use lowercase letters, numbers, and hyphen separators.'));
  }
  if (typeof component.kind !== 'string' || !catalog.policy?.allowedComponentKinds?.includes(component.kind)) {
    failures.push(failure(`quality-scorecard:${owner}:kind`, file, 'Component kind must be listed in policy.allowedComponentKinds.'));
  }
  validateSafePath(owner, component.artifactPath, file, failures);
  stringField(owner, 'purpose', component.purpose, file, failures, { minLength: 24, maxLength: 600 });
  stringField(owner, 'distributionSurface', component.distributionSurface, file, failures, { minLength: 3, maxLength: 120 });
  if (!Array.isArray(component.risks)) {
    failures.push(failure(`quality-scorecard:${owner}:risks`, file, 'risks must be an array.'));
  } else {
    for (const risk of component.risks) {
      stringField(owner, 'risk', risk, file, failures, { minLength: 10, maxLength: 400 });
    }
  }
  if (!Array.isArray(component.dimensions) || component.dimensions.length === 0) {
    failures.push(failure(`quality-scorecard:${owner}:dimensions`, file, 'dimensions must be a non-empty array.'));
    return null;
  }
  const dimensions = [];
  const seen = new Set();
  for (const dimension of component.dimensions) {
    const record = validateDimension(owner, dimension, component, catalog, file, failures);
    if (!record) continue;
    if (seen.has(record.id)) {
      failures.push(failure(`quality-scorecard:${owner}:${record.id}:duplicate`, file, `Duplicate dimension id: ${record.id}.`));
    }
    seen.add(record.id);
    dimensions.push(record);
  }
  for (const required of catalog.policy?.requiredDimensions ?? requiredPolicyDimensions) {
    if (!seen.has(required)) {
      failures.push(failure(`quality-scorecard:${owner}:required-dimension:${required}`, file, `Component must include required dimension ${required}.`));
    }
  }
  const score = dimensions.length > 0
    ? Math.round(dimensions.reduce((total, dimension) => total + dimension.score, 0) / dimensions.length)
    : 0;
  if (Number.isInteger(catalog.policy?.minComponentScore) && score < catalog.policy.minComponentScore) {
    failures.push(failure(
      `quality-scorecard:${owner}:component-score`,
      file,
      `Component score ${score} is below minComponentScore ${catalog.policy.minComponentScore}.`
    ));
  }
  const releaseGate = validateReleaseGate(owner, component, catalog, score, file, failures, warnings);
  return {
    id: component.id,
    kind: component.kind,
    artifactPath: component.artifactPath,
    distributionSurface: component.distributionSurface,
    score,
    dimensions,
    releaseGate
  };
}

export function validateQualityScorecard(catalog, file = 'quality-scorecard.json') {
  const failures = [];
  const warnings = [];
  const components = [];

  if (!isPlainObject(catalog)) {
    return {
      components,
      warnings,
      failures: [failure('quality-scorecard:shape', file, 'Quality scorecard must be a JSON object.')]
    };
  }
  for (const field of Object.keys(catalog)) {
    if (!['schemaVersion', 'policy', 'components'].includes(field)) {
      failures.push(failure('quality-scorecard:field', file, `Unknown scorecard field "${field}".`));
    }
  }
  if (catalog.schemaVersion !== qualityScorecardSchemaVersion) {
    failures.push(failure('quality-scorecard:schema-version', file, `schemaVersion must be ${qualityScorecardSchemaVersion}.`));
  }
  validatePolicy(catalog, file, failures);
  if (!Array.isArray(catalog.components) || catalog.components.length === 0) {
    failures.push(failure('quality-scorecard:components', file, 'components must be a non-empty array.'));
    return { components, warnings, failures };
  }
  const seenIds = new Set();
  for (const component of catalog.components) {
    if (component?.id && seenIds.has(component.id)) {
      failures.push(failure(`quality-scorecard:${component.id}:duplicate`, file, `Duplicate component id: ${component.id}.`));
    }
    if (component?.id) seenIds.add(component.id);
    const record = validateComponent(component, catalog, file, failures, warnings);
    if (record) components.push(record);
  }
  return { components, warnings, failures };
}

export async function inspectQualityScorecard(directory, options = {}) {
  const target = path.resolve(directory);
  const file = options.file
    ? path.resolve(options.file)
    : await exists(path.join(target, workspaceScorecardPath))
      ? path.join(target, workspaceScorecardPath)
      : path.join(target, 'framework', 'quality', 'default-quality-scorecard.json');
  const relativeFile = relativePath(path.relative(target, file));
  let catalog;
  try {
    catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      target,
      file: relativeFile,
      schemaVersion: qualityScorecardSchemaVersion,
      policy: null,
      score: 0,
      components: [],
      warnings: [],
      failures: [
        failure('quality-scorecard:load', relativeFile, `Unable to load quality scorecard: ${error.message}`)
      ]
    };
  }
  const validation = validateQualityScorecard(catalog, relativeFile);
  const score = validation.components.length > 0
    ? Math.round(validation.components.reduce((total, component) => total + component.score, 0) / validation.components.length)
    : 0;
  if (
    validation.failures.length === 0
    && Number.isInteger(catalog.policy?.minOverallScore)
    && score < catalog.policy.minOverallScore
  ) {
    validation.failures.push(failure(
      'quality-scorecard:overall-score',
      relativeFile,
      `Overall quality score ${score} is below minOverallScore ${catalog.policy.minOverallScore}.`
    ));
  }
  return {
    status: validation.failures.length === 0 ? 'pass' : 'fail',
    target,
    file: relativeFile,
    schemaVersion: catalog.schemaVersion ?? qualityScorecardSchemaVersion,
    policy: catalog.policy ?? null,
    score,
    components: validation.components,
    warnings: validation.warnings,
    failures: validation.failures
  };
}

export async function copyDefaultQualityScorecard({ directory }) {
  const target = path.resolve(directory);
  const out = path.join(target, workspaceScorecardPath);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.copyFile(defaultScorecardFile, out);
  return relativePath(path.relative(target, out));
}
