import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const authoritySchemaVersion = 'midas.authority.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultAuthorityFile = path.join(packageRoot, 'framework', 'authority', 'default-constitution.json');
const workspaceAuthorityPath = '.midas/authority/constitution.json';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedAuthoritySources = new Set([
  'current-request',
  'project-constitution',
  'live-evidence',
  'verified-results',
  'approved-human-decision',
  'project-context',
  'work-order',
  'memory',
  'handoff'
]);
const requiredAuthoritySources = [
  'current-request',
  'project-constitution',
  'live-evidence',
  'verified-results'
];
const lowerEvidenceAuthoritySources = ['memory', 'handoff'];
const requiredConflictBooleans = [
  'higherAuthorityWins',
  'liveEvidenceOverridesMemory',
  'verifiedResultsOverrideSelfReport',
  'markUnknownWhenUnverified',
  'doNotInferSecrets'
];
const allowedInvariantOwners = new Set(['owner', 'maintainer', 'security', 'reviewer']);
const requiredInvariantIds = ['no-secret-read', 'public-boundary', 'evidence-before-claim', 'approval-gates'];
const allowedInvariantVerification = new Set([
  'public-boundary-scan',
  'workspace-validator',
  'run-ledger',
  'test-suite',
  'diff-inspection',
  'approval-record',
  'context-snapshot',
  'secret-scan',
  'release-gate',
  'benchmark-raw-results'
]);
const requiredBeforeClaimingDone = [
  'run-local-checks',
  'inspect-diff',
  'record-evidence',
  'update-run-ledger',
  'no-unverified-claims'
];
const requiredEscalationRuleIds = [
  'destructive-action',
  'secret-or-credential-access',
  'external-service-or-provider',
  'public-claim-or-release',
  'payment-or-money',
  'deploy-or-migration'
];
const allowedClaimCeilings = new Set([
  'local-validation',
  'private-benchmark',
  'public-benchmark',
  'release-ready'
]);
const requiredClaimCeilings = ['local-validation', 'private-benchmark'];

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

function unknownFields(object, allowed, ownerId, section, file, failures) {
  for (const field of Object.keys(object)) {
    if (!allowed.has(field)) {
      failures.push(failure(`authority:${ownerId}:${section}-field`, file, `Unknown ${section} field "${field}".`));
    }
  }
}

function validateString(value, ownerId, field, file, failures, options = {}) {
  const minLength = options.minLength ?? 1;
  const maxLength = options.maxLength ?? 500;
  if (typeof value !== 'string' || value.trim().length < minLength || value.length > maxLength) {
    failures.push(failure(
      `authority:${ownerId}:${field}`,
      file,
      `${field} must be ${minLength}-${maxLength} characters.`
    ));
    return null;
  }
  return value;
}

function validateBoolean(value, ownerId, field, file, failures) {
  if (typeof value !== 'boolean') {
    failures.push(failure(`authority:${ownerId}:${field}`, file, `${field} must be a boolean.`));
  }
}

function requireBooleanTrue(value, ownerId, field, file, failures, remediation) {
  if (value !== true) {
    failures.push(failure(`authority:${ownerId}:${field}`, file, remediation));
  }
}

function validateStringArray(values, options, file, failures) {
  const {
    ownerId,
    field,
    allowed,
    minItems = 1,
    requiredValues = [],
    requireIdPattern = true
  } = options;
  if (!Array.isArray(values) || values.length < minItems) {
    failures.push(failure(
      `authority:${ownerId}:${field}`,
      file,
      `${field} must contain at least ${minItems} item${minItems === 1 ? '' : 's'}.`
    ));
    return [];
  }

  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || value.trim() === '' || (requireIdPattern && !idPattern.test(value))) {
      failures.push(failure(
        `authority:${ownerId}:${field}:format`,
        file,
        `${field} entries must use lowercase letters, numbers, and hyphen separators.`
      ));
      continue;
    }
    if (seen.has(value)) {
      failures.push(failure(
        `authority:${ownerId}:${field}:duplicate`,
        file,
        `${field} entries must be unique. Duplicate: ${value}`
      ));
    }
    seen.add(value);
    if (allowed && !allowed.has(value)) {
      failures.push(failure(
        `authority:${ownerId}:${field}:allowed`,
        file,
        `${field} must use allowed values: ${[...allowed].join(', ')}.`
      ));
    }
  }

  for (const required of requiredValues) {
    if (!seen.has(required)) {
      failures.push(failure(
        `authority:${ownerId}:${field}:required:${required}`,
        file,
        `${field} must include required value: ${required}`
      ));
    }
  }
  return values;
}

function rank(values, item) {
  const index = values.indexOf(item);
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function validateAuthorityOrder(constitution, file, failures) {
  const order = validateStringArray(constitution.authorityOrder, {
    ownerId: 'constitution',
    field: 'authority-order',
    allowed: allowedAuthoritySources,
    minItems: 4,
    requiredValues: requiredAuthoritySources
  }, file, failures);
  if (order.length === 0) return;

  if (order[0] !== 'current-request') {
    failures.push(failure(
      'authority:constitution:current-request-first',
      file,
      'current-request must be the first authority source so latest explicit user instructions are never buried under memory.'
    ));
  }

  for (const lower of lowerEvidenceAuthoritySources) {
    if (rank(order, 'live-evidence') > rank(order, lower)) {
      failures.push(failure(
        `authority:constitution:live-evidence-rank:${lower}`,
        file,
        `live-evidence must outrank ${lower}.`
      ));
    }
    if (rank(order, 'verified-results') > rank(order, lower)) {
      failures.push(failure(
        `authority:constitution:verified-results-rank:${lower}`,
        file,
        `verified-results must outrank ${lower}.`
      ));
    }
  }
}

function validateConflictPolicy(constitution, file, failures) {
  const policy = constitution.conflictPolicy;
  if (!isPlainObject(policy)) {
    failures.push(failure('authority:constitution:conflict-policy', file, 'conflictPolicy must be an object.'));
    return;
  }
  unknownFields(policy, new Set(requiredConflictBooleans), 'constitution', 'conflict-policy', file, failures);
  for (const field of requiredConflictBooleans) {
    validateBoolean(policy[field], 'constitution', field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`), file, failures);
    requireBooleanTrue(policy[field], 'constitution', field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`), file, failures, `conflictPolicy.${field} must be true.`);
  }
}

function validateProtectedInvariants(constitution, file, failures) {
  const invariants = constitution.protectedInvariants;
  if (!Array.isArray(invariants) || invariants.length === 0) {
    failures.push(failure('authority:constitution:protected-invariants', file, 'protectedInvariants must contain at least one invariant.'));
    return;
  }
  const seen = new Set();
  for (const invariant of invariants) {
    const ownerId = isPlainObject(invariant) && typeof invariant.id === 'string' ? invariant.id : 'unknown';
    if (!isPlainObject(invariant)) {
      failures.push(failure('authority:invariant:shape', file, 'Each protected invariant must be an object.'));
      continue;
    }
    unknownFields(invariant, new Set(['id', 'statement', 'owner', 'verification']), ownerId, 'invariant', file, failures);
    const id = validateString(invariant.id, ownerId, 'id', file, failures, { minLength: 3, maxLength: 80 });
    if (id && !idPattern.test(id)) {
      failures.push(failure(`authority:invariant:${id}:id-format`, file, 'Invariant ids must use lowercase letters, numbers, and hyphen separators.'));
    }
    if (id && seen.has(id)) {
      failures.push(failure(`authority:invariant:${id}:duplicate`, file, `Duplicate protected invariant id: ${id}`));
    }
    if (id) seen.add(id);
    validateString(invariant.statement, ownerId, 'statement', file, failures, { minLength: 40, maxLength: 600 });
    if (typeof invariant.owner !== 'string' || !allowedInvariantOwners.has(invariant.owner)) {
      failures.push(failure(`authority:invariant:${ownerId}:owner`, file, `Invariant owner must be one of: ${[...allowedInvariantOwners].join(', ')}.`));
    }
    validateStringArray(invariant.verification, {
      ownerId: `invariant:${ownerId}`,
      field: 'verification',
      allowed: allowedInvariantVerification
    }, file, failures);
  }
  for (const required of requiredInvariantIds) {
    if (!seen.has(required)) {
      failures.push(failure(`authority:constitution:protected-invariants:required:${required}`, file, `protectedInvariants must include ${required}.`));
    }
  }
}

function validateVerificationPolicy(constitution, file, failures) {
  const policy = constitution.verificationPolicy;
  if (!isPlainObject(policy)) {
    failures.push(failure('authority:constitution:verification-policy', file, 'verificationPolicy must be an object.'));
    return;
  }
  unknownFields(policy, new Set(['beforeClaimingDone', 'requiresFailedCheckRepairPacket', 'claimRequiresEvidence']), 'constitution', 'verification-policy', file, failures);
  validateStringArray(policy.beforeClaimingDone, {
    ownerId: 'verification-policy',
    field: 'before-claiming-done',
    requiredValues: requiredBeforeClaimingDone
  }, file, failures);
  validateBoolean(policy.requiresFailedCheckRepairPacket, 'verification-policy', 'requires-failed-check-repair-packet', file, failures);
  validateBoolean(policy.claimRequiresEvidence, 'verification-policy', 'claim-requires-evidence', file, failures);
  requireBooleanTrue(policy.requiresFailedCheckRepairPacket, 'verification-policy', 'requires-failed-check-repair-packet', file, failures, 'Failed checks must require a bounded repair packet before retry or closeout.');
  requireBooleanTrue(policy.claimRequiresEvidence, 'verification-policy', 'claim-requires-evidence', file, failures, 'Claims must require recorded evidence.');
}

function validateEscalationRules(constitution, file, failures) {
  const rules = constitution.escalationRules;
  if (!Array.isArray(rules) || rules.length === 0) {
    failures.push(failure('authority:constitution:escalation-rules', file, 'escalationRules must contain at least one rule.'));
    return;
  }
  const seen = new Set();
  for (const rule of rules) {
    const ownerId = isPlainObject(rule) && typeof rule.id === 'string' ? rule.id : 'unknown';
    if (!isPlainObject(rule)) {
      failures.push(failure('authority:escalation-rule:shape', file, 'Each escalation rule must be an object.'));
      continue;
    }
    unknownFields(rule, new Set(['id', 'trigger', 'requiresApproval']), ownerId, 'escalation-rule', file, failures);
    const id = validateString(rule.id, ownerId, 'id', file, failures, { minLength: 3, maxLength: 80 });
    if (id && !idPattern.test(id)) {
      failures.push(failure(`authority:escalation-rule:${id}:id-format`, file, 'Escalation rule ids must use lowercase letters, numbers, and hyphen separators.'));
    }
    if (id && seen.has(id)) {
      failures.push(failure(`authority:escalation-rule:${id}:duplicate`, file, `Duplicate escalation rule id: ${id}`));
    }
    if (id) seen.add(id);
    validateString(rule.trigger, ownerId, 'trigger', file, failures, { minLength: 40, maxLength: 700 });
    validateBoolean(rule.requiresApproval, ownerId, 'requires-approval', file, failures);
    requireBooleanTrue(rule.requiresApproval, ownerId, 'requires-approval', file, failures, `Escalation rule ${ownerId} must require approval.`);
  }
  for (const required of requiredEscalationRuleIds) {
    if (!seen.has(required)) {
      failures.push(failure(`authority:constitution:escalation-rules:required:${required}`, file, `escalationRules must include ${required}.`));
    }
  }
}

function validateClaimPolicy(constitution, file, failures) {
  const policy = constitution.claimPolicy;
  if (!isPlainObject(policy)) {
    failures.push(failure('authority:constitution:claim-policy', file, 'claimPolicy must be an object.'));
    return;
  }
  unknownFields(policy, new Set(['claimCeilings', 'publicClaimsRequireApproval', 'benchmarkClaimsRequireRawResults', 'unknownsStayUnknown']), 'constitution', 'claim-policy', file, failures);
  validateStringArray(policy.claimCeilings, {
    ownerId: 'claim-policy',
    field: 'claim-ceilings',
    allowed: allowedClaimCeilings,
    requiredValues: requiredClaimCeilings
  }, file, failures);
  validateBoolean(policy.publicClaimsRequireApproval, 'claim-policy', 'public-claims-require-approval', file, failures);
  validateBoolean(policy.benchmarkClaimsRequireRawResults, 'claim-policy', 'benchmark-claims-require-raw-results', file, failures);
  validateBoolean(policy.unknownsStayUnknown, 'claim-policy', 'unknowns-stay-unknown', file, failures);
  requireBooleanTrue(policy.publicClaimsRequireApproval, 'claim-policy', 'public-claims-require-approval', file, failures, 'Public claims must require explicit approval.');
  requireBooleanTrue(policy.benchmarkClaimsRequireRawResults, 'claim-policy', 'benchmark-claims-require-raw-results', file, failures, 'Benchmark claims must require raw results and scorer evidence.');
  requireBooleanTrue(policy.unknownsStayUnknown, 'claim-policy', 'unknowns-stay-unknown', file, failures, 'Unknown states must remain unknown until verified.');
}

export function validateAuthorityContracts(constitution, file = 'authority constitution') {
  const failures = [];
  if (!isPlainObject(constitution)) {
    return [failure('authority:constitution:shape', file, 'Authority constitution must be a JSON object.')];
  }

  unknownFields(constitution, new Set([
    'schemaVersion',
    'authorityOrder',
    'conflictPolicy',
    'protectedInvariants',
    'verificationPolicy',
    'escalationRules',
    'claimPolicy'
  ]), 'constitution', 'constitution', file, failures);

  if (constitution.schemaVersion !== authoritySchemaVersion) {
    failures.push(failure('authority:constitution:schema-version', file, `schemaVersion must be ${authoritySchemaVersion}.`));
  }

  validateAuthorityOrder(constitution, file, failures);
  validateConflictPolicy(constitution, file, failures);
  validateProtectedInvariants(constitution, file, failures);
  validateVerificationPolicy(constitution, file, failures);
  validateEscalationRules(constitution, file, failures);
  validateClaimPolicy(constitution, file, failures);
  return failures;
}

export async function loadAuthorityContracts(options = {}) {
  const file = path.resolve(options.file ?? defaultAuthorityFile);
  const text = await fs.readFile(file, 'utf8');
  const constitution = JSON.parse(text);
  const failures = validateAuthorityContracts(constitution, relativePath(path.relative(options.root ?? packageRoot, file)));
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    file,
    constitution,
    failures
  };
}

export async function inspectAuthorityContracts(directory, options = {}) {
  const target = path.resolve(directory);
  const file = options.file
    ? path.resolve(options.file)
    : await exists(path.join(target, workspaceAuthorityPath))
      ? path.join(target, workspaceAuthorityPath)
      : path.join(target, 'framework', 'authority', 'default-constitution.json');
  const relativeFile = relativePath(path.relative(target, file));

  if (!await exists(file)) {
    return {
      status: 'fail',
      schemaVersion: authoritySchemaVersion,
      target,
      file: relativeFile,
      authorityOrder: [],
      protectedInvariants: [],
      escalationRules: [],
      claimCeilings: [],
      failures: [
        failure('authority:file', relativeFile, `Create ${relativeFile} or run midas install.`)
      ]
    };
  }

  let constitution;
  try {
    constitution = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      schemaVersion: authoritySchemaVersion,
      target,
      file: relativeFile,
      authorityOrder: [],
      protectedInvariants: [],
      escalationRules: [],
      claimCeilings: [],
      failures: [
        failure('authority:parse', relativeFile, `Unable to parse authority constitution: ${error.message}`)
      ]
    };
  }

  const failures = validateAuthorityContracts(constitution, relativeFile);
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: authoritySchemaVersion,
    target,
    file: relativeFile,
    authorityOrder: failures.length === 0 ? constitution.authorityOrder : [],
    protectedInvariants: failures.length === 0
      ? constitution.protectedInvariants.map((invariant) => ({
        id: invariant.id,
        owner: invariant.owner,
        verification: invariant.verification
      }))
      : [],
    escalationRules: failures.length === 0
      ? constitution.escalationRules.map((rule) => ({
        id: rule.id,
        requiresApproval: rule.requiresApproval
      }))
      : [],
    claimCeilings: failures.length === 0 ? constitution.claimPolicy.claimCeilings : [],
    failures
  };
}

export async function copyDefaultAuthorityContracts({ directory }) {
  const target = path.resolve(directory);
  const outFile = path.join(target, workspaceAuthorityPath);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const text = await fs.readFile(defaultAuthorityFile, 'utf8');
  const constitution = JSON.parse(text);
  const failures = validateAuthorityContracts(constitution, 'framework/authority/default-constitution.json');
  if (failures.length > 0) {
    throw new Error(`Default authority constitution is invalid: ${failures.map((item) => item.remediation).join('; ')}`);
  }
  await fs.writeFile(outFile, text.endsWith('\n') ? text : `${text}\n`);
  return relativePath(path.relative(target, outFile));
}
