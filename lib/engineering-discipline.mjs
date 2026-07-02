import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const engineeringDisciplineSchemaVersion = 'midas.engineering-discipline.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultPolicyFile = path.join(packageRoot, 'framework', 'engineering', 'default-engineering-discipline.json');
const workspacePolicyPath = '.midas/engineering/discipline.json';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const requiredRuleIds = [
  'assumption-control',
  'scope-minimization',
  'diff-hygiene',
  'verification-loop'
];
const allowedStrictness = new Set(['advisory', 'standard', 'strict']);
const allowedTaskClasses = new Set(['simple-change', 'bug-fix', 'feature-slice', 'refactor', 'research', 'release']);
const allowedApprovals = new Set([
  'broad-refactor',
  'destructive-change',
  'external-action',
  'secret-access',
  'public-claim',
  'new-runtime-dependency'
]);
const requiredApprovals = [
  'broad-refactor',
  'destructive-change',
  'external-action',
  'secret-access',
  'public-claim'
];
const allowedCheckpoints = new Set([
  'objective',
  'assumptions',
  'ambiguities',
  'tradeoffs',
  'clarifying-question',
  'scope-boundary',
  'non-goals',
  'no-speculative-features',
  'existing-style',
  'changed-files',
  'line-justification',
  'orphan-cleanup',
  'precheck',
  'test-first-when-bug',
  'postcheck',
  'evidence-summary',
  'risk-summary',
  'rollback-note'
]);
const ruleCheckpointRequirements = new Map([
  ['assumption-control', ['assumptions', 'ambiguities', 'clarifying-question']],
  ['scope-minimization', ['scope-boundary', 'non-goals', 'no-speculative-features']],
  ['diff-hygiene', ['existing-style', 'changed-files', 'line-justification', 'orphan-cleanup']],
  ['verification-loop', ['objective', 'precheck', 'postcheck', 'evidence-summary']]
]);

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

function stringField(ownerId, field, value, file, failures, options = {}) {
  const minLength = options.minLength ?? 1;
  const maxLength = options.maxLength ?? 500;
  if (typeof value !== 'string' || value.trim().length < minLength || value.length > maxLength) {
    failures.push(failure(
      `engineering-discipline:${ownerId}:${field}`,
      file,
      `${field} must be ${minLength}-${maxLength} characters.`
    ));
    return null;
  }
  return value;
}

function integerField(ownerId, field, value, file, failures, options) {
  const { min, max } = options;
  if (!Number.isInteger(value) || value < min || value > max) {
    failures.push(failure(
      `engineering-discipline:${ownerId}:${field}`,
      file,
      `${field} must be an integer from ${min} to ${max}.`
    ));
  }
}

function validateStringArray(ownerId, field, values, file, failures, options = {}) {
  const minItems = options.minItems ?? 1;
  const allowed = options.allowed ?? null;
  const required = options.required ?? [];
  const minLength = options.minLength ?? 1;
  const maxLength = options.maxLength ?? 300;

  if (!Array.isArray(values) || values.length < minItems) {
    failures.push(failure(
      `engineering-discipline:${ownerId}:${field}`,
      file,
      `${field} must contain at least ${minItems} item${minItems === 1 ? '' : 's'}.`
    ));
    return [];
  }

  const seen = new Set();
  const normalized = [];
  for (const value of values) {
    if (typeof value !== 'string' || value.trim().length < minLength || value.length > maxLength) {
      failures.push(failure(
        `engineering-discipline:${ownerId}:${field}:value`,
        file,
        `${field} values must be ${minLength}-${maxLength} characters.`
      ));
      continue;
    }
    normalized.push(value);
    if (seen.has(value)) {
      failures.push(failure(
        `engineering-discipline:${ownerId}:${field}:duplicate`,
        file,
        `${field} values must be unique. Duplicate: ${value}.`
      ));
    }
    seen.add(value);
    if (allowed && !allowed.has(value)) {
      failures.push(failure(
        `engineering-discipline:${ownerId}:${field}:allowed`,
        file,
        `${field} must use allowed values: ${[...allowed].join(', ')}.`
      ));
    }
  }

  for (const requiredValue of required) {
    if (!seen.has(requiredValue)) {
      failures.push(failure(
        `engineering-discipline:${ownerId}:${field}:required:${requiredValue}`,
        file,
        `${field} must include required value: ${requiredValue}.`
      ));
    }
  }

  return normalized;
}

function validateBooleanTrue(ownerId, field, value, file, failures, remediation) {
  if (value !== true) {
    failures.push(failure(`engineering-discipline:${ownerId}:${field}`, file, remediation));
  }
}

function validatePolicy(policy, file, failures) {
  if (!isPlainObject(policy)) {
    failures.push(failure('engineering-discipline:policy', file, 'policy must be an object.'));
    return;
  }
  const allowedFields = new Set([
    'strictnessDefault',
    'simpleTaskFastPath',
    'maxChangedFilesWithoutPlan',
    'maxNewModulesWithoutApproval',
    'evidenceBeforeClaims',
    'preserveUnrelatedCode',
    'approvalsRequiredFor'
  ]);
  for (const field of Object.keys(policy)) {
    if (!allowedFields.has(field)) {
      failures.push(failure('engineering-discipline:policy-field', file, `Unknown policy field "${field}".`));
    }
  }
  if (typeof policy.strictnessDefault !== 'string' || !allowedStrictness.has(policy.strictnessDefault)) {
    failures.push(failure('engineering-discipline:policy:strictness', file, `strictnessDefault must be one of: ${[...allowedStrictness].join(', ')}.`));
  }
  if (typeof policy.simpleTaskFastPath !== 'boolean') {
    failures.push(failure('engineering-discipline:policy:simple-task-fast-path', file, 'simpleTaskFastPath must be a boolean.'));
  }
  integerField('policy', 'max-changed-files-without-plan', policy.maxChangedFilesWithoutPlan, file, failures, { min: 1, max: 25 });
  integerField('policy', 'max-new-modules-without-approval', policy.maxNewModulesWithoutApproval, file, failures, { min: 0, max: 5 });
  validateBooleanTrue('policy', 'evidence-before-claims', policy.evidenceBeforeClaims, file, failures, 'Engineering discipline must require evidence before completion, release, or benchmark claims.');
  validateBooleanTrue('policy', 'preserve-unrelated-code', policy.preserveUnrelatedCode, file, failures, 'Engineering discipline must preserve unrelated code and comments.');
  validateStringArray('policy', 'approvals-required-for', policy.approvalsRequiredFor, file, failures, {
    allowed: allowedApprovals,
    required: requiredApprovals
  });
}

function collectCheckpoints(rule) {
  return new Set([
    ...(Array.isArray(rule.preflight) ? rule.preflight : []),
    ...(Array.isArray(rule.during) ? rule.during : []),
    ...(Array.isArray(rule.closeout) ? rule.closeout : [])
  ]);
}

function validateRule(rule, index, file, failures) {
  const ownerId = rule?.id ?? `index-${index}`;
  if (!isPlainObject(rule)) {
    failures.push(failure(`engineering-discipline:${ownerId}:shape`, file, 'Rule entries must be objects.'));
    return null;
  }

  const allowedFields = new Set([
    'id',
    'name',
    'purpose',
    'appliesTo',
    'triggers',
    'preflight',
    'during',
    'closeout',
    'failureModes',
    'remediation'
  ]);
  for (const field of Object.keys(rule)) {
    if (!allowedFields.has(field)) {
      failures.push(failure(`engineering-discipline:${ownerId}:field`, file, `Unknown rule field "${field}".`));
    }
  }

  if (typeof rule.id !== 'string' || !idPattern.test(rule.id)) {
    failures.push(failure(`engineering-discipline:${ownerId}:id`, file, 'Rule id must use lowercase letters, numbers, and hyphen separators.'));
  }
  stringField(ownerId, 'name', rule.name, file, failures, { minLength: 3, maxLength: 120 });
  stringField(ownerId, 'purpose', rule.purpose, file, failures, { minLength: 30, maxLength: 600 });
  validateStringArray(ownerId, 'applies-to', rule.appliesTo, file, failures, {
    allowed: allowedTaskClasses
  });
  validateStringArray(ownerId, 'triggers', rule.triggers, file, failures, {
    minLength: 12,
    maxLength: 300
  });
  validateStringArray(ownerId, 'preflight', rule.preflight, file, failures, {
    minItems: 1,
    allowed: allowedCheckpoints
  });
  validateStringArray(ownerId, 'during', rule.during, file, failures, {
    minItems: 1,
    allowed: allowedCheckpoints
  });
  validateStringArray(ownerId, 'closeout', rule.closeout, file, failures, {
    minItems: 1,
    allowed: allowedCheckpoints
  });
  validateStringArray(ownerId, 'failure-modes', rule.failureModes, file, failures, {
    minLength: 20,
    maxLength: 500
  });
  validateStringArray(ownerId, 'remediation', rule.remediation, file, failures, {
    minLength: 20,
    maxLength: 500
  });

  const requiredCheckpoints = ruleCheckpointRequirements.get(rule.id) ?? [];
  const checkpoints = collectCheckpoints(rule);
  for (const checkpoint of requiredCheckpoints) {
    if (!checkpoints.has(checkpoint)) {
      failures.push(failure(
        `engineering-discipline:${ownerId}:checkpoint-required:${checkpoint}`,
        file,
        `${ownerId} must include checkpoint ${checkpoint} in preflight, during, or closeout.`
      ));
    }
  }

  return rule;
}

export function validateEngineeringDiscipline(policy, file = 'engineering-discipline.json') {
  const failures = [];

  if (!isPlainObject(policy)) {
    return [failure('engineering-discipline:shape', file, 'Engineering discipline policy must be a JSON object.')];
  }

  for (const field of Object.keys(policy)) {
    if (!['schemaVersion', 'policy', 'rules'].includes(field)) {
      failures.push(failure('engineering-discipline:field', file, `Unknown policy field "${field}".`));
    }
  }

  if (policy.schemaVersion !== engineeringDisciplineSchemaVersion) {
    failures.push(failure('engineering-discipline:schema-version', file, `schemaVersion must be ${engineeringDisciplineSchemaVersion}.`));
  }

  validatePolicy(policy.policy, file, failures);

  if (!Array.isArray(policy.rules) || policy.rules.length === 0) {
    failures.push(failure('engineering-discipline:rules', file, 'rules must be a non-empty array.'));
    return failures;
  }

  const seen = new Set();
  for (const [index, rule] of policy.rules.entries()) {
    const record = validateRule(rule, index, file, failures);
    if (!record?.id) continue;
    if (seen.has(record.id)) {
      failures.push(failure(`engineering-discipline:${record.id}:duplicate`, file, `Duplicate engineering discipline rule id: ${record.id}.`));
    }
    seen.add(record.id);
  }

  for (const ruleId of requiredRuleIds) {
    if (!seen.has(ruleId)) {
      failures.push(failure(
        `engineering-discipline:required-rule:${ruleId}`,
        file,
        `Engineering discipline must include required rule: ${ruleId}.`
      ));
    }
  }

  return failures;
}

export async function inspectEngineeringDiscipline(directory, options = {}) {
  const target = path.resolve(directory);
  const file = options.file
    ? path.resolve(options.file)
    : await exists(path.join(target, workspacePolicyPath))
      ? path.join(target, workspacePolicyPath)
      : path.join(target, 'framework', 'engineering', 'default-engineering-discipline.json');
  const relativeFile = relativePath(path.relative(target, file));

  if (!await exists(file)) {
    return {
      status: 'fail',
      schemaVersion: engineeringDisciplineSchemaVersion,
      target,
      file: relativeFile,
      strictness: null,
      rules: [],
      failures: [
        failure('engineering-discipline:file', relativeFile, `Create ${relativeFile} or run midas install.`)
      ]
    };
  }

  let policy;
  try {
    policy = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      schemaVersion: engineeringDisciplineSchemaVersion,
      target,
      file: relativeFile,
      strictness: null,
      rules: [],
      failures: [
        failure('engineering-discipline:parse', relativeFile, `Unable to parse engineering discipline policy: ${error.message}`)
      ]
    };
  }

  const failures = validateEngineeringDiscipline(policy, relativeFile);
  const rules = failures.length === 0
    ? policy.rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      appliesTo: rule.appliesTo,
      preflight: rule.preflight.length,
      during: rule.during.length,
      closeout: rule.closeout.length
    }))
    : [];

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: engineeringDisciplineSchemaVersion,
    target,
    file: relativeFile,
    strictness: policy.policy?.strictnessDefault ?? null,
    simpleTaskFastPath: policy.policy?.simpleTaskFastPath ?? null,
    maxChangedFilesWithoutPlan: policy.policy?.maxChangedFilesWithoutPlan ?? null,
    rules,
    failures
  };
}

export async function copyDefaultEngineeringDiscipline({ directory }) {
  const target = path.resolve(directory);
  const outFile = path.join(target, workspacePolicyPath);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const text = await fs.readFile(defaultPolicyFile, 'utf8');
  const policy = JSON.parse(text);
  const failures = validateEngineeringDiscipline(policy, 'framework/engineering/default-engineering-discipline.json');
  if (failures.length > 0) {
    throw new Error(`Default engineering discipline policy is invalid: ${failures.map((item) => item.remediation).join('; ')}`);
  }
  await fs.writeFile(outFile, text.endsWith('\n') ? text : `${text}\n`);
  return relativePath(path.relative(target, outFile));
}
