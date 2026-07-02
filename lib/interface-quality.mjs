import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const interfaceQualitySchemaVersion = 'midas.interface-quality.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultQualityFile = path.join(packageRoot, 'framework', 'interface', 'default-interface-quality.json');
const workspaceQualityPath = '.midas/interface/quality.json';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const requiredEvidenceIds = [
  'design-context',
  'contrast-check',
  'responsive-check',
  'overflow-check',
  'motion-review',
  'keyboard-a11y-check',
  'visual-regression-or-screenshot',
  'human-review'
];
const allowedSurfaceTypes = new Set([
  'product-ui',
  'marketing-site',
  'documentation',
  'component-library',
  'admin-tool',
  'dashboard'
]);
const allowedCheckTypes = new Set([
  'manual-review',
  'automated-scan',
  'browser-smoke',
  'screenshot-review',
  'accessibility-audit',
  'performance-check',
  'copy-review'
]);
const allowedRegisters = new Set(['product', 'brand', 'docs', 'mixed']);
const allowedHookModes = new Set(['off', 'advisory', 'blocking']);
const allowedLiveIterationModes = new Set(['disabled', 'approval-required', 'allowed-local']);
const blockedPathPattern = /(^|\/)(\.env|env|secrets?|credentials?|tokens?|private-keys?|browser-storage|cookies|sessions?)(\/|$)/i;

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
      `interface-quality:${owner}:${field}`,
      file,
      `${field} must be ${minLength}-${maxLength} characters.`
    ));
    return null;
  }
  return value;
}

function validateSafeRelativePath(owner, value, file, failures) {
  const normalized = typeof value === 'string' ? relativePath(value) : '';
  if (!normalized || path.isAbsolute(normalized) || normalized.includes('..') || blockedPathPattern.test(normalized)) {
    failures.push(failure(
      `interface-quality:${owner}:design-context:file`,
      file,
      'Design context files must use safe relative paths and must not reference secrets, env files, credentials, tokens, auth stores, or parent directories.'
    ));
  }
  return normalized;
}

function validateStringArray(owner, field, value, allowed, required, file, failures) {
  if (!Array.isArray(value) || value.length === 0) {
    failures.push(failure(`interface-quality:${owner}:${field}`, file, `${field} must be a non-empty array.`));
    return [];
  }
  const normalized = [];
  for (const item of value) {
    if (typeof item !== 'string' || item.trim() === '') {
      failures.push(failure(`interface-quality:${owner}:${field}:value`, file, `${field} values must be non-empty strings.`));
      continue;
    }
    normalized.push(item);
    if (allowed && !allowed.has(item)) {
      failures.push(failure(`interface-quality:${owner}:${field}:unsupported`, file, `Unsupported ${field} value: ${item}.`));
    }
  }
  for (const item of required ?? []) {
    if (!normalized.includes(item)) {
      failures.push(failure(`interface-quality:${owner}:${field}:required:${item}`, file, `${field} must include ${item}.`));
    }
  }
  return normalized;
}

function validatePolicy(catalog, file, failures) {
  const policy = catalog.policy;
  if (!isPlainObject(policy)) {
    failures.push(failure('interface-quality:policy', file, 'policy must be an object.'));
    return;
  }
  const allowedFields = new Set([
    'requiredEvidence',
    'allowedSurfaceTypes',
    'allowedCheckTypes',
    'waiversRequireReason',
    'designSystemDriftRequiresReview',
    'hookFindingsAreAdvisory',
    'liveIterationRequiresApproval'
  ]);
  for (const field of Object.keys(policy)) {
    if (!allowedFields.has(field)) {
      failures.push(failure('interface-quality:policy-field', file, `Unknown policy field "${field}".`));
    }
  }
  validateStringArray('policy', 'requiredEvidence', policy.requiredEvidence, null, requiredEvidenceIds, file, failures);
  validateStringArray('policy', 'allowedSurfaceTypes', policy.allowedSurfaceTypes, allowedSurfaceTypes, requiredEvidenceIds.length > 0 ? [] : [], file, failures);
  validateStringArray('policy', 'allowedCheckTypes', policy.allowedCheckTypes, allowedCheckTypes, [], file, failures);
  if (policy.waiversRequireReason !== true) {
    failures.push(failure('interface-quality:policy:waivers-require-reason', file, 'Interface-quality waivers must require a recorded reason.'));
  }
  if (policy.designSystemDriftRequiresReview !== true) {
    failures.push(failure('interface-quality:policy:design-system-drift-review', file, 'Design-system drift must require review.'));
  }
  if (policy.hookFindingsAreAdvisory !== true) {
    failures.push(failure('interface-quality:policy:hook-findings-advisory', file, 'Hook findings must default to advisory until a project explicitly hardens runtime enforcement.'));
  }
  if (policy.liveIterationRequiresApproval !== true) {
    failures.push(failure('interface-quality:policy:live-iteration-approval', file, 'Live interface iteration must require approval.'));
  }
}

function validateDesignContext(surface, file, failures) {
  const owner = surface.id ?? 'unknown';
  const designContext = surface.designContext;
  if (!isPlainObject(designContext)) {
    failures.push(failure(`interface-quality:${owner}:design-context`, file, 'designContext must be an object.'));
    return;
  }
  const allowedFields = new Set(['required', 'register', 'audience', 'files']);
  for (const field of Object.keys(designContext)) {
    if (!allowedFields.has(field)) {
      failures.push(failure(`interface-quality:${owner}:design-context-field`, file, `Unknown designContext field "${field}".`));
    }
  }
  if (designContext.required !== true) {
    failures.push(failure(`interface-quality:${owner}:design-context-required`, file, 'designContext.required must be true.'));
  }
  if (typeof designContext.register !== 'string' || !allowedRegisters.has(designContext.register)) {
    failures.push(failure(`interface-quality:${owner}:design-context-register`, file, `designContext.register must be one of: ${[...allowedRegisters].join(', ')}.`));
  }
  stringField(owner, 'designContext.audience', designContext.audience, file, failures, { minLength: 6, maxLength: 160 });
  if (!Array.isArray(designContext.files) || designContext.files.length === 0) {
    failures.push(failure(`interface-quality:${owner}:design-context-files`, file, 'designContext.files must be a non-empty array.'));
  } else {
    for (const value of designContext.files) validateSafeRelativePath(owner, value, file, failures);
  }
}

function validateQualityGates(surface, policy, file, failures) {
  const owner = surface.id ?? 'unknown';
  if (!Array.isArray(surface.qualityGates) || surface.qualityGates.length === 0) {
    failures.push(failure(`interface-quality:${owner}:quality-gates`, file, 'qualityGates must be a non-empty array.'));
    return;
  }
  const seen = new Set();
  const gateIds = [];
  const requiredEvidence = Array.isArray(policy?.requiredEvidence) ? policy.requiredEvidence : requiredEvidenceIds;
  const allowedTypes = new Set(Array.isArray(policy?.allowedCheckTypes) ? policy.allowedCheckTypes : []);
  for (const gate of surface.qualityGates) {
    const id = gate?.id ?? 'unknown';
    if (!isPlainObject(gate)) {
      failures.push(failure(`interface-quality:${owner}:quality-gate`, file, 'qualityGates entries must be objects.'));
      continue;
    }
    const allowedFields = new Set(['id', 'type', 'required', 'evidence', 'waiverAllowed']);
    for (const field of Object.keys(gate)) {
      if (!allowedFields.has(field)) {
        failures.push(failure(`interface-quality:${owner}:${id}:quality-gate-field`, file, `Unknown quality gate field "${field}".`));
      }
    }
    if (typeof gate.id !== 'string' || !idPattern.test(gate.id)) {
      failures.push(failure(`interface-quality:${owner}:${id}:id`, file, 'Quality gate id must use lowercase letters, numbers, and hyphen separators.'));
    } else {
      gateIds.push(gate.id);
      if (seen.has(gate.id)) {
        failures.push(failure(`interface-quality:${owner}:${id}:duplicate`, file, `Duplicate quality gate id: ${gate.id}.`));
      }
      seen.add(gate.id);
    }
    if (typeof gate.type !== 'string' || !allowedTypes.has(gate.type)) {
      failures.push(failure(`interface-quality:${owner}:${id}:type`, file, `Quality gate type must be one of policy.allowedCheckTypes.`));
    }
    if (typeof gate.required !== 'boolean') {
      failures.push(failure(`interface-quality:${owner}:${id}:required`, file, 'Quality gate required must be a boolean.'));
    }
    if (typeof gate.waiverAllowed !== 'boolean') {
      failures.push(failure(`interface-quality:${owner}:${id}:waiver-allowed`, file, 'Quality gate waiverAllowed must be a boolean.'));
    }
    stringField(`${owner}:${id}`, 'evidence', gate.evidence, file, failures, { minLength: 24, maxLength: 600 });
  }
  for (const evidenceId of requiredEvidence) {
    const gate = surface.qualityGates.find((item) => item?.id === evidenceId);
    if (!gate) {
      failures.push(failure(`interface-quality:${owner}:required-gate:${evidenceId}`, file, `Surface must include required evidence gate ${evidenceId}.`));
    } else if (gate.required !== true) {
      failures.push(failure(`interface-quality:${owner}:required-gate:${evidenceId}:required`, file, `Required evidence gate ${evidenceId} must set required: true.`));
    }
  }
  if (gateIds.includes('motion-review')) {
    const motion = surface.qualityGates.find((gate) => gate.id === 'motion-review');
    if (motion?.waiverAllowed === true && policy?.waiversRequireReason !== true) {
      failures.push(failure(`interface-quality:${owner}:motion-waiver-policy`, file, 'Motion-review waivers require policy.waiversRequireReason: true.'));
    }
  }
}

function validateRuntime(surface, policy, file, failures) {
  const owner = surface.id ?? 'unknown';
  const runtime = surface.runtime;
  if (!isPlainObject(runtime)) {
    failures.push(failure(`interface-quality:${owner}:runtime`, file, 'runtime must be an object.'));
    return;
  }
  const allowedFields = new Set(['browserEvidenceRequired', 'hookMode', 'liveIteration', 'externalNetworkAllowed']);
  for (const field of Object.keys(runtime)) {
    if (!allowedFields.has(field)) {
      failures.push(failure(`interface-quality:${owner}:runtime-field`, file, `Unknown runtime field "${field}".`));
    }
  }
  if (runtime.browserEvidenceRequired !== true) {
    failures.push(failure(`interface-quality:${owner}:runtime:browser-evidence`, file, 'runtime.browserEvidenceRequired must be true for interface surfaces.'));
  }
  if (typeof runtime.hookMode !== 'string' || !allowedHookModes.has(runtime.hookMode)) {
    failures.push(failure(`interface-quality:${owner}:runtime:hook-mode`, file, `runtime.hookMode must be one of: ${[...allowedHookModes].join(', ')}.`));
  }
  if (typeof runtime.liveIteration !== 'string' || !allowedLiveIterationModes.has(runtime.liveIteration)) {
    failures.push(failure(`interface-quality:${owner}:runtime:live-iteration`, file, `runtime.liveIteration must be one of: ${[...allowedLiveIterationModes].join(', ')}.`));
  }
  if (typeof runtime.externalNetworkAllowed !== 'boolean') {
    failures.push(failure(`interface-quality:${owner}:runtime:external-network`, file, 'runtime.externalNetworkAllowed must be a boolean.'));
  }
  if (runtime.liveIteration !== 'disabled' && policy?.liveIterationRequiresApproval === true && runtime.liveIteration !== 'approval-required') {
    failures.push(failure(`interface-quality:${owner}:runtime:live-iteration-approval`, file, 'Live interface iteration must stay approval-required unless disabled.'));
  }
  if (runtime.externalNetworkAllowed === true && runtime.liveIteration !== 'approval-required') {
    failures.push(failure(`interface-quality:${owner}:runtime:external-network-approval`, file, 'External network use for interface checks requires approval-required live iteration posture.'));
  }
  if (runtime.hookMode === 'blocking' && policy?.hookFindingsAreAdvisory === true) {
    failures.push(failure(`interface-quality:${owner}:runtime:blocking-hook`, file, 'Blocking hook mode conflicts with the default advisory hook policy.'));
  }
}

function validateSurface(surface, catalog, file, failures) {
  const owner = surface?.id ?? 'unknown';
  if (!isPlainObject(surface)) {
    failures.push(failure(`interface-quality:${owner}:shape`, file, 'Surface entries must be objects.'));
    return;
  }
  const allowedFields = new Set([
    'id',
    'name',
    'surfaceType',
    'purpose',
    'designContext',
    'qualityGates',
    'runtime',
    'failureMode',
    'rollback'
  ]);
  for (const field of Object.keys(surface)) {
    if (!allowedFields.has(field)) {
      failures.push(failure(`interface-quality:${owner}:field`, file, `Unknown surface field "${field}".`));
    }
  }
  if (typeof surface.id !== 'string' || !idPattern.test(surface.id)) {
    failures.push(failure(`interface-quality:${owner}:id`, file, 'Surface id must use lowercase letters, numbers, and hyphen separators.'));
  }
  stringField(owner, 'name', surface.name, file, failures, { minLength: 3, maxLength: 120 });
  if (typeof surface.surfaceType !== 'string' || !allowedSurfaceTypes.has(surface.surfaceType)) {
    failures.push(failure(`interface-quality:${owner}:surface-type`, file, `surfaceType must be one of: ${[...allowedSurfaceTypes].join(', ')}.`));
  }
  if (Array.isArray(catalog.policy?.allowedSurfaceTypes) && !catalog.policy.allowedSurfaceTypes.includes(surface.surfaceType)) {
    failures.push(failure(`interface-quality:${owner}:surface-type-policy`, file, 'surfaceType must be included in policy.allowedSurfaceTypes.'));
  }
  stringField(owner, 'purpose', surface.purpose, file, failures, { minLength: 24, maxLength: 500 });
  validateDesignContext(surface, file, failures);
  validateQualityGates(surface, catalog.policy, file, failures);
  validateRuntime(surface, catalog.policy, file, failures);
  stringField(owner, 'failureMode', surface.failureMode, file, failures, { minLength: 24, maxLength: 500 });
  stringField(owner, 'rollback', surface.rollback, file, failures, { minLength: 24, maxLength: 500 });
}

export function validateInterfaceQuality(catalog, file = 'interface-quality.json') {
  const failures = [];

  if (!isPlainObject(catalog)) {
    return [failure('interface-quality:shape', file, 'Interface-quality catalog must be a JSON object.')];
  }

  for (const field of Object.keys(catalog)) {
    if (!['schemaVersion', 'policy', 'surfaces'].includes(field)) {
      failures.push(failure('interface-quality:field', file, `Unknown catalog field "${field}".`));
    }
  }

  if (catalog.schemaVersion !== interfaceQualitySchemaVersion) {
    failures.push(failure('interface-quality:schema-version', file, `schemaVersion must be ${interfaceQualitySchemaVersion}.`));
  }

  validatePolicy(catalog, file, failures);

  if (!Array.isArray(catalog.surfaces) || catalog.surfaces.length === 0) {
    failures.push(failure('interface-quality:surfaces', file, 'surfaces must be a non-empty array.'));
    return failures;
  }

  const seenIds = new Set();
  for (const surface of catalog.surfaces) {
    if (surface?.id && seenIds.has(surface.id)) {
      failures.push(failure(`interface-quality:${surface.id}:duplicate`, file, `Duplicate surface id: ${surface.id}.`));
    }
    if (surface?.id) seenIds.add(surface.id);
    validateSurface(surface, catalog, file, failures);
  }

  return failures;
}

export async function inspectInterfaceQuality(directory, options = {}) {
  const target = path.resolve(directory);
  const file = options.file
    ? path.resolve(options.file)
    : await exists(path.join(target, workspaceQualityPath))
      ? path.join(target, workspaceQualityPath)
      : path.join(target, 'framework', 'interface', 'default-interface-quality.json');
  const relativeFile = relativePath(path.relative(target, file));

  if (!await exists(file)) {
    return {
      status: 'fail',
      schemaVersion: interfaceQualitySchemaVersion,
      target,
      file: relativeFile,
      surfaces: [],
      failures: [
        failure('interface-quality:file', relativeFile, `Create ${relativeFile} or run midas install.`)
      ]
    };
  }

  let catalog;
  try {
    catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      schemaVersion: interfaceQualitySchemaVersion,
      target,
      file: relativeFile,
      surfaces: [],
      failures: [
        failure('interface-quality:parse', relativeFile, `Unable to parse interface-quality catalog: ${error.message}`)
      ]
    };
  }

  const failures = validateInterfaceQuality(catalog, relativeFile);
  const surfaces = failures.length === 0
    ? catalog.surfaces.map((surface) => ({
      id: surface.id,
      surfaceType: surface.surfaceType,
      requiredGates: surface.qualityGates.filter((gate) => gate.required === true).length,
      hookMode: surface.runtime.hookMode,
      liveIteration: surface.runtime.liveIteration,
      browserEvidenceRequired: surface.runtime.browserEvidenceRequired
    }))
    : [];

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: interfaceQualitySchemaVersion,
    target,
    file: relativeFile,
    policy: catalog.policy,
    surfaces,
    failures
  };
}

export async function copyDefaultInterfaceQuality({ directory }) {
  const target = path.resolve(directory);
  const outFile = path.join(target, workspaceQualityPath);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const text = await fs.readFile(defaultQualityFile, 'utf8');
  const catalog = JSON.parse(text);
  const failures = validateInterfaceQuality(catalog, 'framework/interface/default-interface-quality.json');
  if (failures.length > 0) {
    throw new Error(`Default interface-quality policy is invalid: ${failures.map((item) => item.remediation).join('; ')}`);
  }
  await fs.writeFile(outFile, text.endsWith('\n') ? text : `${text}\n`);
  return relativePath(path.relative(target, outFile));
}
