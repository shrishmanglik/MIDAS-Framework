import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const runControlSchemaVersion = 'midas.run-controls.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultPolicyFile = path.join(packageRoot, 'framework', 'run-control', 'default-run-controls.json');
const workspacePolicyPath = '.midas/run-control/policy.json';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedFilesystems = new Set(['read-only', 'workspace-write', 'product-worktree', 'container', 'external-connector']);
const allowedNetworkModes = new Set(['off', 'read-only', 'approval-required']);
const allowedMutations = new Set([
  'none',
  'workspace-files',
  'generated-files',
  'reports',
  'run-ledger',
  'temporary-files',
  'product-files'
]);
const requiredBlockedMutations = [
  'secrets',
  'credentials',
  'payments',
  'deploys',
  'destructive',
  'public-messages',
  'external-messages'
];
const allowedBlockedMutations = new Set([
  ...requiredBlockedMutations,
  'database-migrations',
  'pricing',
  'auth-policy',
  'production-data'
]);
const allowedChannels = new Set([
  'local-files',
  'user',
  'run-ledger',
  'command-center',
  'issue-tracker',
  'chat',
  'email',
  'slack',
  'browser',
  'webhook',
  'public-web'
]);
const externalChannels = new Set(['chat', 'email', 'slack', 'browser', 'webhook', 'public-web']);
const allowedApprovalDefaults = new Set(['none', 'maintainer', 'owner', 'security', 'explicit-human']);
const allowedApprovalGates = new Set([
  'external-action',
  'money',
  'destructive',
  'deploy',
  'secret-access',
  'public-claim',
  'product-write',
  'security-policy',
  'database-migration'
]);
const requiredApprovalGates = [
  'external-action',
  'money',
  'destructive',
  'deploy',
  'secret-access',
  'public-claim'
];
const allowedEvidenceItems = new Set([
  'objective',
  'scope',
  'files-reviewed',
  'files-changed',
  'commands-run',
  'validation-result',
  'run-ledger',
  'risk-summary',
  'next-action',
  'approval-record'
]);
const requiredEvidenceItems = ['objective', 'run-ledger', 'validation-result', 'next-action'];

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

function stringField(profile, field, file, failures, options = {}) {
  const value = profile[field];
  const label = options.label ?? field;
  const minLength = options.minLength ?? 1;
  const maxLength = options.maxLength ?? 500;
  if (typeof value !== 'string' || value.trim().length < minLength || value.length > maxLength) {
    failures.push(failure(
      `run-control:${profile.id ?? 'unknown'}:${field}`,
      file,
      `Run-control profile ${label} must be ${minLength}-${maxLength} characters.`
    ));
    return null;
  }
  return value;
}

function validateInteger(value, options, file, failures) {
  const { ownerId, field, min, max, label = field } = options;
  if (!Number.isInteger(value) || value < min || value > max) {
    failures.push(failure(
      `run-control:${ownerId}:${field}`,
      file,
      `${label} must be an integer from ${min} to ${max}.`
    ));
  }
}

function validateStringArray(values, options, file, failures) {
  const {
    ownerId,
    field,
    allowed,
    minItems = 1,
    requiredValues = []
  } = options;
  if (!Array.isArray(values) || values.length < minItems) {
    failures.push(failure(
      `run-control:${ownerId}:${field}`,
      file,
      `${field} must contain at least ${minItems} item${minItems === 1 ? '' : 's'}.`
    ));
    return [];
  }

  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || !idPattern.test(value)) {
      failures.push(failure(
        `run-control:${ownerId}:${field}:format`,
        file,
        `${field} entries must use lowercase letters, numbers, and hyphen separators.`
      ));
      continue;
    }
    if (seen.has(value)) {
      failures.push(failure(
        `run-control:${ownerId}:${field}:duplicate`,
        file,
        `${field} entries must be unique. Duplicate: ${value}`
      ));
    }
    seen.add(value);
    if (allowed && !allowed.has(value)) {
      failures.push(failure(
        `run-control:${ownerId}:${field}:allowed`,
        file,
        `${field} must use allowed values: ${[...allowed].join(', ')}.`
      ));
    }
  }

  for (const required of requiredValues) {
    if (!seen.has(required)) {
      failures.push(failure(
        `run-control:${ownerId}:${field}:required:${required}`,
        file,
        `${field} must include required value: ${required}`
      ));
    }
  }
  return values;
}

function requireBooleanTrue(value, ownerId, field, file, failures, remediation) {
  if (value !== true) {
    failures.push(failure(`run-control:${ownerId}:${field}`, file, remediation));
  }
}

function validateScope(profile, file, failures) {
  const ownerId = profile.id ?? 'unknown';
  const scope = profile.scope;
  if (!isPlainObject(scope)) {
    failures.push(failure(`run-control:${ownerId}:scope`, file, 'scope must be an object.'));
    return;
  }
  for (const field of Object.keys(scope)) {
    if (!['maxIterations', 'maxSubtasks', 'maxRuntimeMinutes', 'requiresObjective', 'requiresStopCondition'].includes(field)) {
      failures.push(failure(`run-control:${ownerId}:scope-field`, file, `Unknown scope field "${field}".`));
    }
  }
  validateInteger(scope.maxIterations, { ownerId, field: 'max-iterations', min: 1, max: 25 }, file, failures);
  validateInteger(scope.maxSubtasks, { ownerId, field: 'max-subtasks', min: 0, max: 20 }, file, failures);
  validateInteger(scope.maxRuntimeMinutes, { ownerId, field: 'max-runtime-minutes', min: 5, max: 480 }, file, failures);
  requireBooleanTrue(scope.requiresObjective, ownerId, 'requires-objective', file, failures, 'Run-control profiles must require a stated objective.');
  requireBooleanTrue(scope.requiresStopCondition, ownerId, 'requires-stop-condition', file, failures, 'Run-control profiles must require a stop condition.');
}

function validateSandbox(profile, file, failures) {
  const ownerId = profile.id ?? 'unknown';
  const sandbox = profile.sandbox;
  if (!isPlainObject(sandbox)) {
    failures.push(failure(`run-control:${ownerId}:sandbox`, file, 'sandbox must be an object.'));
    return;
  }
  for (const field of Object.keys(sandbox)) {
    if (!['filesystem', 'network', 'externalActions', 'secretsAllowed', 'allowedMutation', 'blockedMutation'].includes(field)) {
      failures.push(failure(`run-control:${ownerId}:sandbox-field`, file, `Unknown sandbox field "${field}".`));
    }
  }
  if (typeof sandbox.filesystem !== 'string' || !allowedFilesystems.has(sandbox.filesystem)) {
    failures.push(failure(`run-control:${ownerId}:filesystem`, file, `filesystem must be one of: ${[...allowedFilesystems].join(', ')}.`));
  }
  if (typeof sandbox.network !== 'string' || !allowedNetworkModes.has(sandbox.network)) {
    failures.push(failure(`run-control:${ownerId}:network`, file, `network must be one of: ${[...allowedNetworkModes].join(', ')}. Unrestricted network is not allowed.`));
  }
  if (typeof sandbox.externalActions !== 'boolean') {
    failures.push(failure(`run-control:${ownerId}:external-actions`, file, 'externalActions must be a boolean.'));
  }
  if (sandbox.secretsAllowed !== false) {
    failures.push(failure(`run-control:${ownerId}:secrets-allowed`, file, 'Run-control profiles must explicitly disallow secrets.'));
  }

  const allowedMutation = validateStringArray(sandbox.allowedMutation, {
    ownerId,
    field: 'allowed-mutation',
    allowed: allowedMutations
  }, file, failures);
  if (allowedMutation.includes('none') && allowedMutation.length > 1) {
    failures.push(failure(`run-control:${ownerId}:allowed-mutation:none`, file, 'allowedMutation cannot combine none with write scopes.'));
  }
  if (sandbox.filesystem === 'read-only') {
    const writeValues = allowedMutation.filter((value) => ['workspace-files', 'generated-files', 'temporary-files', 'product-files'].includes(value));
    if (writeValues.length > 0) {
      failures.push(failure(`run-control:${ownerId}:read-only-mutation`, file, 'Read-only profiles must not allow workspace, generated, temporary, or product file mutation.'));
    }
  }

  validateStringArray(sandbox.blockedMutation, {
    ownerId,
    field: 'blocked-mutation',
    allowed: allowedBlockedMutations,
    requiredValues: requiredBlockedMutations
  }, file, failures);
}

function validateSubagents(profile, file, failures) {
  const ownerId = profile.id ?? 'unknown';
  const subagents = profile.subagents;
  if (!isPlainObject(subagents)) {
    failures.push(failure(`run-control:${ownerId}:subagents`, file, 'subagents must be an object.'));
    return;
  }
  for (const field of Object.keys(subagents)) {
    if (!['enabled', 'maxConcurrent', 'requiresInstructionPacket', 'requiresEvidence', 'inheritsParentApprovals'].includes(field)) {
      failures.push(failure(`run-control:${ownerId}:subagents-field`, file, `Unknown subagents field "${field}".`));
    }
  }
  if (typeof subagents.enabled !== 'boolean') {
    failures.push(failure(`run-control:${ownerId}:subagents-enabled`, file, 'subagents.enabled must be a boolean.'));
  }
  validateInteger(subagents.maxConcurrent, { ownerId, field: 'subagents-max-concurrent', min: 0, max: 10 }, file, failures);
  if (subagents.enabled) {
    if (profile.scope?.maxSubtasks < 1) {
      failures.push(failure(`run-control:${ownerId}:subagents-max-subtasks`, file, 'Profiles with subagents enabled must allow at least one subtask.'));
    }
    requireBooleanTrue(subagents.requiresInstructionPacket, ownerId, 'subagents-instruction-packet', file, failures, 'Enabled subagents must require an instruction packet.');
    requireBooleanTrue(subagents.requiresEvidence, ownerId, 'subagents-evidence', file, failures, 'Enabled subagents must require evidence.');
    requireBooleanTrue(subagents.inheritsParentApprovals, ownerId, 'subagents-parent-approvals', file, failures, 'Enabled subagents must inherit parent approval gates.');
    if (subagents.maxConcurrent < 1) {
      failures.push(failure(`run-control:${ownerId}:subagents-concurrency`, file, 'Enabled subagents must allow at least one concurrent worker.'));
    }
  } else if (subagents.maxConcurrent !== 0) {
    failures.push(failure(`run-control:${ownerId}:subagents-disabled-concurrency`, file, 'Disabled subagents must set maxConcurrent to 0.'));
  }
}

function validateMessageGateway(profile, file, failures) {
  const ownerId = profile.id ?? 'unknown';
  const gateway = profile.messageGateway;
  if (!isPlainObject(gateway)) {
    failures.push(failure(`run-control:${ownerId}:message-gateway`, file, 'messageGateway must be an object.'));
    return;
  }
  for (const field of Object.keys(gateway)) {
    if (!['enabled', 'allowedChannels', 'requiresApprovalForExternal', 'blocksDirectPublicMessages', 'recordsUserAndThread'].includes(field)) {
      failures.push(failure(`run-control:${ownerId}:message-gateway-field`, file, `Unknown messageGateway field "${field}".`));
    }
  }
  if (typeof gateway.enabled !== 'boolean') {
    failures.push(failure(`run-control:${ownerId}:message-gateway-enabled`, file, 'messageGateway.enabled must be a boolean.'));
  }
  const allowed = validateStringArray(gateway.allowedChannels, {
    ownerId,
    field: 'allowed-channels',
    allowed: allowedChannels,
    minItems: gateway.enabled ? 1 : 0
  }, file, failures);
  if (typeof gateway.requiresApprovalForExternal !== 'boolean') {
    failures.push(failure(`run-control:${ownerId}:gateway-approval-external`, file, 'requiresApprovalForExternal must be a boolean.'));
  }
  requireBooleanTrue(gateway.blocksDirectPublicMessages, ownerId, 'gateway-blocks-public', file, failures, 'Message gateways must block direct public messages by default.');
  if (gateway.enabled) {
    requireBooleanTrue(gateway.recordsUserAndThread, ownerId, 'gateway-records-user-thread', file, failures, 'Enabled message gateways must record user and thread identity.');
  }
  if (allowed.some((channel) => externalChannels.has(channel)) && gateway.requiresApprovalForExternal !== true) {
    failures.push(failure(`run-control:${ownerId}:gateway-external-approval`, file, 'External message channels must require approval.'));
  }
}

function validateApprovals(profile, file, failures) {
  const ownerId = profile.id ?? 'unknown';
  const approvals = profile.approvals;
  if (!isPlainObject(approvals)) {
    failures.push(failure(`run-control:${ownerId}:approvals`, file, 'approvals must be an object.'));
    return [];
  }
  for (const field of Object.keys(approvals)) {
    if (!['default', 'requiredFor'].includes(field)) {
      failures.push(failure(`run-control:${ownerId}:approvals-field`, file, `Unknown approvals field "${field}".`));
    }
  }
  if (typeof approvals.default !== 'string' || !allowedApprovalDefaults.has(approvals.default)) {
    failures.push(failure(`run-control:${ownerId}:approval-default`, file, `approval default must be one of: ${[...allowedApprovalDefaults].join(', ')}.`));
  }
  const requiredFor = validateStringArray(approvals.requiredFor, {
    ownerId,
    field: 'approval-required-for',
    allowed: allowedApprovalGates,
    requiredValues: requiredApprovalGates
  }, file, failures);
  if (profile.sandbox?.externalActions === true && !requiredFor.includes('external-action')) {
    failures.push(failure(`run-control:${ownerId}:external-action-gate`, file, 'Profiles allowing external actions must require the external-action approval gate.'));
  }
  if (profile.sandbox?.allowedMutation?.includes('product-files') && !requiredFor.includes('product-write')) {
    failures.push(failure(`run-control:${ownerId}:product-write-gate`, file, 'Profiles allowing product file mutation must require the product-write approval gate.'));
  }
  return requiredFor;
}

function validateEvidence(profile, file, failures) {
  const ownerId = profile.id ?? 'unknown';
  const evidence = profile.evidence;
  if (!isPlainObject(evidence)) {
    failures.push(failure(`run-control:${ownerId}:evidence`, file, 'evidence must be an object.'));
    return;
  }
  for (const field of Object.keys(evidence)) {
    if (!['required', 'checkpointEverySteps'].includes(field)) {
      failures.push(failure(`run-control:${ownerId}:evidence-field`, file, `Unknown evidence field "${field}".`));
    }
  }
  validateStringArray(evidence.required, {
    ownerId,
    field: 'evidence-required',
    allowed: allowedEvidenceItems,
    requiredValues: requiredEvidenceItems
  }, file, failures);
  validateInteger(evidence.checkpointEverySteps, { ownerId, field: 'checkpoint-every-steps', min: 1, max: 10 }, file, failures);
}

function validateCloseout(profile, file, failures) {
  const ownerId = profile.id ?? 'unknown';
  const closeout = profile.closeout;
  if (!isPlainObject(closeout)) {
    failures.push(failure(`run-control:${ownerId}:closeout`, file, 'closeout must be an object.'));
    return;
  }
  for (const field of Object.keys(closeout)) {
    if (!['requiresRunLedger', 'requiresNextAction', 'requiresRiskSummary', 'requiresStateUpdate'].includes(field)) {
      failures.push(failure(`run-control:${ownerId}:closeout-field`, file, `Unknown closeout field "${field}".`));
    }
  }
  requireBooleanTrue(closeout.requiresRunLedger, ownerId, 'closeout-run-ledger', file, failures, 'Closeout must require a run ledger.');
  requireBooleanTrue(closeout.requiresNextAction, ownerId, 'closeout-next-action', file, failures, 'Closeout must require a next action.');
  requireBooleanTrue(closeout.requiresRiskSummary, ownerId, 'closeout-risk-summary', file, failures, 'Closeout must require a risk summary.');
  requireBooleanTrue(closeout.requiresStateUpdate, ownerId, 'closeout-state-update', file, failures, 'Closeout must require state or workspace status update.');
}

export function validateRunControlPolicy(policy, file = 'run-control-policy.json') {
  const failures = [];

  if (!isPlainObject(policy)) {
    return [failure('run-controls:shape', file, 'Run-control policy must be a JSON object.')];
  }

  for (const key of Object.keys(policy)) {
    if (!['schemaVersion', 'profiles'].includes(key)) {
      failures.push(failure('run-controls:field', file, `Unknown policy field "${key}".`));
    }
  }

  if (policy.schemaVersion !== runControlSchemaVersion) {
    failures.push(failure('run-controls:schema-version', file, `schemaVersion must be ${runControlSchemaVersion}.`));
  }

  if (!Array.isArray(policy.profiles) || policy.profiles.length === 0) {
    failures.push(failure('run-controls:profiles', file, 'profiles must be a non-empty array.'));
    return failures;
  }

  const seenIds = new Set();
  for (const [index, profile] of policy.profiles.entries()) {
    const profileId = profile?.id ?? `index-${index}`;
    if (!isPlainObject(profile)) {
      failures.push(failure(`run-control:${profileId}:shape`, file, 'Run-control profile must be a JSON object.'));
      continue;
    }

    const allowedProfileFields = new Set([
      'id',
      'name',
      'purpose',
      'scope',
      'sandbox',
      'subagents',
      'messageGateway',
      'approvals',
      'evidence',
      'closeout'
    ]);
    for (const field of Object.keys(profile)) {
      if (!allowedProfileFields.has(field)) {
        failures.push(failure(`run-control:${profileId}:field`, file, `Unknown run-control profile field "${field}".`));
      }
    }

    if (typeof profile.id !== 'string' || !idPattern.test(profile.id)) {
      failures.push(failure(`run-control:${profileId}:id`, file, 'Run-control profile id must use lowercase letters, numbers, and hyphen separators.'));
    } else if (seenIds.has(profile.id)) {
      failures.push(failure(`run-control:${profile.id}:duplicate`, file, `Duplicate run-control profile id: ${profile.id}`));
    } else {
      seenIds.add(profile.id);
    }

    stringField(profile, 'name', file, failures, { minLength: 3, maxLength: 120 });
    stringField(profile, 'purpose', file, failures, { minLength: 24, maxLength: 500 });
    validateScope(profile, file, failures);
    validateSandbox(profile, file, failures);
    validateSubagents(profile, file, failures);
    validateMessageGateway(profile, file, failures);
    validateApprovals(profile, file, failures);
    validateEvidence(profile, file, failures);
    validateCloseout(profile, file, failures);
  }

  return failures;
}

export async function loadRunControlPolicy(options = {}) {
  const file = path.resolve(options.file ?? defaultPolicyFile);
  const text = await fs.readFile(file, 'utf8');
  const policy = JSON.parse(text);
  const failures = validateRunControlPolicy(policy, relativePath(path.relative(options.root ?? packageRoot, file)));
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    file,
    policy,
    failures
  };
}

export async function inspectRunControls(directory, options = {}) {
  const target = path.resolve(directory);
  const file = options.file
    ? path.resolve(options.file)
    : await exists(path.join(target, workspacePolicyPath))
      ? path.join(target, workspacePolicyPath)
      : path.join(target, 'framework', 'run-control', 'default-run-controls.json');
  const relativeFile = relativePath(path.relative(target, file));

  if (!await exists(file)) {
    return {
      status: 'fail',
      schemaVersion: runControlSchemaVersion,
      target,
      file: relativeFile,
      profiles: [],
      failures: [
        failure('run-controls:file', relativeFile, `Create ${relativeFile} or run midas install.`)
      ]
    };
  }

  let policy;
  try {
    policy = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      schemaVersion: runControlSchemaVersion,
      target,
      file: relativeFile,
      profiles: [],
      failures: [
        failure('run-controls:parse', relativeFile, `Unable to parse run-control policy: ${error.message}`)
      ]
    };
  }

  const failures = validateRunControlPolicy(policy, relativeFile);
  const profiles = failures.length === 0
    ? policy.profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      maxRuntimeMinutes: profile.scope.maxRuntimeMinutes,
      maxSubtasks: profile.scope.maxSubtasks,
      filesystem: profile.sandbox.filesystem,
      network: profile.sandbox.network,
      subagentsEnabled: profile.subagents.enabled,
      messageGatewayEnabled: profile.messageGateway.enabled,
      approvalRequiredFor: profile.approvals.requiredFor,
      checkpointEverySteps: profile.evidence.checkpointEverySteps
    }))
    : [];

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: runControlSchemaVersion,
    target,
    file: relativeFile,
    profiles,
    failures
  };
}

export async function copyDefaultRunControls({ directory }) {
  const target = path.resolve(directory);
  const outFile = path.join(target, workspacePolicyPath);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const text = await fs.readFile(defaultPolicyFile, 'utf8');
  const policy = JSON.parse(text);
  const failures = validateRunControlPolicy(policy, 'framework/run-control/default-run-controls.json');
  if (failures.length > 0) {
    throw new Error(`Default run-control policy is invalid: ${failures.map((item) => item.remediation).join('; ')}`);
  }
  await fs.writeFile(outFile, text.endsWith('\n') ? text : `${text}\n`);
  return relativePath(path.relative(target, outFile));
}
