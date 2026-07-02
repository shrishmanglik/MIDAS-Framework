import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const gatewayContractsSchemaVersion = 'midas.gateway-contracts.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultContractsFile = path.join(packageRoot, 'framework', 'gateways', 'default-gateway-contracts.json');
const workspaceContractsPath = '.midas/gateways/contracts.json';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedTransportKinds = new Set(['cli', 'stdio', 'http', 'websocket', 'webhook', 'message-bridge']);
const allowedExposures = new Set(['local-only', 'private-network', 'external-inbound', 'public-inbound']);
const nonLocalExposures = new Set(['private-network', 'external-inbound', 'public-inbound']);
const publicExposures = new Set(['public-inbound']);
const allowedOrigins = new Set(['localhost', 'private-network', 'approved-domain', 'approved-ip-range', 'approved-workspace']);
const allowedRetention = new Set(['none', 'bounded', 'persistent']);
const allowedGapRecovery = new Set(['none', 'snapshot-refresh', 'event-replay', 'manual-restart']);
const allowedSandboxModes = new Set(['off', 'non-main', 'all']);
const allowedRemoteAccess = new Set(['disabled', 'private-network', 'tailnet-or-vpn', 'public']);
const allowedDoctorChecks = new Set(['schema', 'auth', 'exposure', 'events', 'sandbox', 'state', 'remote', 'identity', 'protocol', 'approvals']);
const requiredDoctorChecks = ['schema', 'auth', 'exposure', 'events', 'state'];
const allowedFixModes = new Set(['none', 'advisory-only', 'bounded-auto-fix']);
const allowedApprovalDefaults = new Set(['none', 'maintainer', 'owner', 'security', 'explicit-human']);
const allowedApprovalGates = new Set([
  'remote-exposure',
  'public-ingress',
  'secret-access',
  'elevated-tool',
  'destructive',
  'deploy',
  'money',
  'external-message',
  'file-egress',
  'capability-change',
  'approval-policy-change'
]);
const baseApprovalGates = ['secret-access', 'elevated-tool', 'destructive', 'deploy', 'money'];
const allowedEvidenceItems = new Set([
  'gateway-id',
  'session-id',
  'operator-or-device',
  'schema-check',
  'event-log',
  'approval-record',
  'remote-origin',
  'run-ledger',
  'diagnostic-report'
]);
const requiredEvidenceItems = ['gateway-id', 'session-id', 'operator-or-device', 'schema-check', 'event-log', 'run-ledger'];

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

function stringField(gateway, field, file, failures, options = {}) {
  const value = gateway[field];
  const minLength = options.minLength ?? 1;
  const maxLength = options.maxLength ?? 500;
  if (typeof value !== 'string' || value.trim().length < minLength || value.length > maxLength) {
    failures.push(failure(
      `gateway-contract:${gateway.id ?? 'unknown'}:${field}`,
      file,
      `${field} must be ${minLength}-${maxLength} characters.`
    ));
    return null;
  }
  return value;
}

function validateInteger(value, options, file, failures) {
  const { ownerId, field, min, max, label = field } = options;
  if (!Number.isInteger(value) || value < min || value > max) {
    failures.push(failure(
      `gateway-contract:${ownerId}:${field}`,
      file,
      `${label} must be an integer from ${min} to ${max}.`
    ));
  }
}

function validateBoolean(value, ownerId, field, file, failures) {
  if (typeof value !== 'boolean') {
    failures.push(failure(
      `gateway-contract:${ownerId}:${field}`,
      file,
      `${field} must be a boolean.`
    ));
  }
}

function requireBooleanTrue(value, ownerId, field, file, failures, remediation) {
  if (value !== true) {
    failures.push(failure(`gateway-contract:${ownerId}:${field}`, file, remediation));
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
      `gateway-contract:${ownerId}:${field}`,
      file,
      `${field} must contain at least ${minItems} item${minItems === 1 ? '' : 's'}.`
    ));
    return [];
  }

  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || !idPattern.test(value)) {
      failures.push(failure(
        `gateway-contract:${ownerId}:${field}:format`,
        file,
        `${field} entries must use lowercase letters, numbers, and hyphen separators.`
      ));
      continue;
    }
    if (seen.has(value)) {
      failures.push(failure(
        `gateway-contract:${ownerId}:${field}:duplicate`,
        file,
        `${field} entries must be unique. Duplicate: ${value}`
      ));
    }
    seen.add(value);
    if (allowed && !allowed.has(value)) {
      failures.push(failure(
        `gateway-contract:${ownerId}:${field}:allowed`,
        file,
        `${field} must use allowed values: ${[...allowed].join(', ')}.`
      ));
    }
  }

  for (const required of requiredValues) {
    if (!seen.has(required)) {
      failures.push(failure(
        `gateway-contract:${ownerId}:${field}:required:${required}`,
        file,
        `${field} must include required value: ${required}`
      ));
    }
  }
  return values;
}

function unknownFields(object, allowed, ownerId, section, file, failures) {
  for (const field of Object.keys(object)) {
    if (!allowed.has(field)) {
      failures.push(failure(`gateway-contract:${ownerId}:${section}-field`, file, `Unknown ${section} field "${field}".`));
    }
  }
}

function isNonLocalGateway(gateway) {
  return nonLocalExposures.has(gateway.transport?.exposure) || gateway.remote?.remoteAccess !== 'disabled';
}

function validateTransport(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const transport = gateway.transport;
  if (!isPlainObject(transport)) {
    failures.push(failure(`gateway-contract:${ownerId}:transport`, file, 'transport must be an object.'));
    return;
  }

  unknownFields(transport, new Set(['kind', 'exposure', 'requiresAuthentication', 'allowedOrigins', 'requiresHandshake', 'validatesSchema']), ownerId, 'transport', file, failures);
  if (typeof transport.kind !== 'string' || !allowedTransportKinds.has(transport.kind)) {
    failures.push(failure(`gateway-contract:${ownerId}:transport-kind`, file, `transport.kind must be one of: ${[...allowedTransportKinds].join(', ')}.`));
  }
  if (typeof transport.exposure !== 'string' || !allowedExposures.has(transport.exposure)) {
    failures.push(failure(`gateway-contract:${ownerId}:transport-exposure`, file, `transport.exposure must be one of: ${[...allowedExposures].join(', ')}.`));
  }
  validateBoolean(transport.requiresAuthentication, ownerId, 'requires-authentication', file, failures);
  validateBoolean(transport.requiresHandshake, ownerId, 'requires-handshake', file, failures);
  validateBoolean(transport.validatesSchema, ownerId, 'validates-schema', file, failures);
  const origins = validateStringArray(transport.allowedOrigins, {
    ownerId,
    field: 'allowed-origins',
    allowed: allowedOrigins
  }, file, failures);

  requireBooleanTrue(transport.requiresHandshake, ownerId, 'handshake-required', file, failures, 'Gateway transports must require a handshake before command frames are accepted.');
  requireBooleanTrue(transport.validatesSchema, ownerId, 'schema-required', file, failures, 'Gateway transports must validate command and event frames against schema.');
  if (nonLocalExposures.has(transport.exposure) && transport.requiresAuthentication !== true) {
    failures.push(failure(`gateway-contract:${ownerId}:external-auth`, file, 'Private, external, and public control-plane exposures must require authentication.'));
  }
  if (nonLocalExposures.has(transport.exposure) && origins.length === 0) {
    failures.push(failure(`gateway-contract:${ownerId}:external-origins`, file, 'Non-local gateway exposures must declare approved origins.'));
  }
}

function validateIdentity(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const identity = gateway.identity;
  if (!isPlainObject(identity)) {
    failures.push(failure(`gateway-contract:${ownerId}:identity`, file, 'identity must be an object.'));
    return;
  }

  unknownFields(identity, new Set(['requiresDeviceIdentity', 'requiresPairing', 'recordsOperator', 'recordsSession', 'rotatesTokens']), ownerId, 'identity', file, failures);
  for (const field of ['requiresDeviceIdentity', 'requiresPairing', 'recordsOperator', 'recordsSession', 'rotatesTokens']) {
    validateBoolean(identity[field], ownerId, field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`), file, failures);
  }
  requireBooleanTrue(identity.recordsOperator, ownerId, 'records-operator', file, failures, 'Gateway contracts must record an operator, device, or service identity.');
  requireBooleanTrue(identity.recordsSession, ownerId, 'records-session', file, failures, 'Gateway contracts must record session identity.');
  if (isNonLocalGateway(gateway)) {
    requireBooleanTrue(identity.requiresDeviceIdentity, ownerId, 'device-identity-required', file, failures, 'Non-local gateways must require device or service identity.');
    requireBooleanTrue(identity.requiresPairing, ownerId, 'pairing-required', file, failures, 'Non-local gateways must require an explicit pairing or approval boundary.');
  }
}

function validateProtocol(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const protocol = gateway.protocol;
  if (!isPlainObject(protocol)) {
    failures.push(failure(`gateway-contract:${ownerId}:protocol`, file, 'protocol must be an object.'));
    return;
  }

  unknownFields(protocol, new Set(['schemaValidated', 'supportsCapabilityDiscovery', 'requiresIdempotencyForSideEffects', 'rejectsUnknownMethods', 'supportsCancellation']), ownerId, 'protocol', file, failures);
  requireBooleanTrue(protocol.schemaValidated, ownerId, 'protocol-schema-validated', file, failures, 'Gateway protocols must be schema validated.');
  requireBooleanTrue(protocol.supportsCapabilityDiscovery, ownerId, 'capability-discovery', file, failures, 'Gateway protocols must support capability discovery.');
  requireBooleanTrue(protocol.requiresIdempotencyForSideEffects, ownerId, 'idempotency-required', file, failures, 'Side-effecting gateway methods must require idempotency keys or equivalent dedupe.');
  requireBooleanTrue(protocol.rejectsUnknownMethods, ownerId, 'rejects-unknown-methods', file, failures, 'Gateways must reject unknown methods by default.');
  requireBooleanTrue(protocol.supportsCancellation, ownerId, 'supports-cancellation', file, failures, 'Gateways must support cancellation or interruption.');
}

function validateEvents(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const events = gateway.events;
  if (!isPlainObject(events)) {
    failures.push(failure(`gateway-contract:${ownerId}:events`, file, 'events must be an object.'));
    return;
  }

  unknownFields(events, new Set(['emitsRunEvents', 'emitsHealthEvents', 'retention', 'retentionDays', 'gapRecovery']), ownerId, 'events', file, failures);
  validateBoolean(events.emitsRunEvents, ownerId, 'emits-run-events', file, failures);
  validateBoolean(events.emitsHealthEvents, ownerId, 'emits-health-events', file, failures);
  requireBooleanTrue(events.emitsRunEvents, ownerId, 'run-events-required', file, failures, 'Gateway contracts must emit run events.');
  requireBooleanTrue(events.emitsHealthEvents, ownerId, 'health-events-required', file, failures, 'Gateway contracts must emit health events.');
  if (typeof events.retention !== 'string' || !allowedRetention.has(events.retention)) {
    failures.push(failure(`gateway-contract:${ownerId}:event-retention`, file, `events.retention must be one of: ${[...allowedRetention].join(', ')}.`));
  }
  if (typeof events.gapRecovery !== 'string' || !allowedGapRecovery.has(events.gapRecovery)) {
    failures.push(failure(`gateway-contract:${ownerId}:gap-recovery`, file, `events.gapRecovery must be one of: ${[...allowedGapRecovery].join(', ')}.`));
  }
  validateInteger(events.retentionDays, { ownerId, field: 'event-retention-days', min: 0, max: 365 }, file, failures);
  if (events.retention === 'none' && events.retentionDays !== 0) {
    failures.push(failure(`gateway-contract:${ownerId}:retention-none-days`, file, 'events.retentionDays must be 0 when events.retention is none.'));
  }
  if (events.retention !== 'none' && events.retentionDays < 1) {
    failures.push(failure(`gateway-contract:${ownerId}:retention-days`, file, 'Event retention must declare a positive bounded retentionDays value.'));
  }
}

function validateState(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const state = gateway.state;
  if (!isPlainObject(state)) {
    failures.push(failure(`gateway-contract:${ownerId}:state`, file, 'state must be an object.'));
    return;
  }

  unknownFields(state, new Set(['storesRunState', 'storesPairingState', 'redactsSensitiveLogs', 'blocksSecretEcho']), ownerId, 'state', file, failures);
  validateBoolean(state.storesRunState, ownerId, 'stores-run-state', file, failures);
  validateBoolean(state.storesPairingState, ownerId, 'stores-pairing-state', file, failures);
  requireBooleanTrue(state.storesRunState, ownerId, 'stores-run-state-required', file, failures, 'Gateway contracts must store run state or an equivalent recoverable pointer.');
  requireBooleanTrue(state.redactsSensitiveLogs, ownerId, 'redacts-sensitive-logs', file, failures, 'Gateway contracts must redact sensitive logs.');
  requireBooleanTrue(state.blocksSecretEcho, ownerId, 'blocks-secret-echo', file, failures, 'Gateway contracts must block secret echo.');
  if (gateway.identity?.requiresPairing && state.storesPairingState !== true) {
    failures.push(failure(`gateway-contract:${ownerId}:stores-pairing-state-required`, file, 'Gateways that require pairing must store pairing state.'));
  }
}

function validateSandbox(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const sandbox = gateway.sandbox;
  if (!isPlainObject(sandbox)) {
    failures.push(failure(`gateway-contract:${ownerId}:sandbox`, file, 'sandbox must be an object.'));
    return;
  }

  unknownFields(sandbox, new Set(['defaultMode', 'nonMainRequiresSandbox', 'elevatedToolsRequireApproval', 'bindsRunControlProfile']), ownerId, 'sandbox', file, failures);
  if (typeof sandbox.defaultMode !== 'string' || !allowedSandboxModes.has(sandbox.defaultMode)) {
    failures.push(failure(`gateway-contract:${ownerId}:sandbox-mode`, file, `sandbox.defaultMode must be one of: ${[...allowedSandboxModes].join(', ')}.`));
  }
  validateBoolean(sandbox.nonMainRequiresSandbox, ownerId, 'non-main-requires-sandbox', file, failures);
  requireBooleanTrue(sandbox.elevatedToolsRequireApproval, ownerId, 'elevated-tools-approval', file, failures, 'Elevated gateway tools must require approval.');
  requireBooleanTrue(sandbox.bindsRunControlProfile, ownerId, 'binds-run-control', file, failures, 'Gateway contracts must bind to a run-control profile.');
  if (sandbox.nonMainRequiresSandbox && sandbox.defaultMode === 'off') {
    failures.push(failure(`gateway-contract:${ownerId}:non-main-sandbox-off`, file, 'nonMainRequiresSandbox cannot be true when sandbox.defaultMode is off.'));
  }
  if (isNonLocalGateway(gateway) && sandbox.defaultMode === 'off') {
    failures.push(failure(`gateway-contract:${ownerId}:remote-sandbox-required`, file, 'Non-local gateways must use non-main or all sandbox mode.'));
  }
}

function validateRemote(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const remote = gateway.remote;
  if (!isPlainObject(remote)) {
    failures.push(failure(`gateway-contract:${ownerId}:remote`, file, 'remote must be an object.'));
    return;
  }

  unknownFields(remote, new Set(['remoteAccess', 'requiresExplicitEnable', 'requiresEncryption', 'requiresApprovedOrigins']), ownerId, 'remote', file, failures);
  if (typeof remote.remoteAccess !== 'string' || !allowedRemoteAccess.has(remote.remoteAccess)) {
    failures.push(failure(`gateway-contract:${ownerId}:remote-access`, file, `remote.remoteAccess must be one of: ${[...allowedRemoteAccess].join(', ')}.`));
  }
  validateBoolean(remote.requiresExplicitEnable, ownerId, 'requires-explicit-enable', file, failures);
  validateBoolean(remote.requiresEncryption, ownerId, 'requires-encryption', file, failures);
  validateBoolean(remote.requiresApprovedOrigins, ownerId, 'requires-approved-origins', file, failures);
  requireBooleanTrue(remote.requiresExplicitEnable, ownerId, 'explicit-enable-required', file, failures, 'Gateway remote access must require explicit enablement.');
  requireBooleanTrue(remote.requiresApprovedOrigins, ownerId, 'approved-origins-required', file, failures, 'Gateway remote access must require approved origins.');
  if (gateway.transport?.exposure === 'local-only' && remote.remoteAccess !== 'disabled') {
    failures.push(failure(`gateway-contract:${ownerId}:local-remote-disabled`, file, 'Local-only gateways must keep remote.remoteAccess disabled.'));
  }
  if (nonLocalExposures.has(gateway.transport?.exposure) && remote.remoteAccess === 'disabled') {
    failures.push(failure(`gateway-contract:${ownerId}:non-local-remote-classification`, file, 'Non-local gateway exposures must declare remote.remoteAccess.'));
  }
  if (remote.remoteAccess !== 'disabled' && remote.requiresEncryption !== true) {
    failures.push(failure(`gateway-contract:${ownerId}:remote-encryption`, file, 'Remote gateway access must require encryption.'));
  }
  if (remote.remoteAccess === 'public' && !publicExposures.has(gateway.transport?.exposure) && gateway.transport?.exposure !== 'external-inbound') {
    failures.push(failure(`gateway-contract:${ownerId}:public-remote-exposure`, file, 'Public remote access must be paired with external-inbound or public-inbound exposure.'));
  }
}

function validateDiagnostics(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const diagnostics = gateway.diagnostics;
  if (!isPlainObject(diagnostics)) {
    failures.push(failure(`gateway-contract:${ownerId}:diagnostics`, file, 'diagnostics must be an object.'));
    return;
  }

  unknownFields(diagnostics, new Set(['doctorChecks', 'fixMode', 'recordsFindings']), ownerId, 'diagnostics', file, failures);
  validateStringArray(diagnostics.doctorChecks, {
    ownerId,
    field: 'doctor-checks',
    allowed: allowedDoctorChecks,
    requiredValues: requiredDoctorChecks
  }, file, failures);
  if (typeof diagnostics.fixMode !== 'string' || !allowedFixModes.has(diagnostics.fixMode)) {
    failures.push(failure(`gateway-contract:${ownerId}:fix-mode`, file, `diagnostics.fixMode must be one of: ${[...allowedFixModes].join(', ')}.`));
  }
  requireBooleanTrue(diagnostics.recordsFindings, ownerId, 'records-findings', file, failures, 'Gateway diagnostics must record findings.');
}

function validateApprovals(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const approvals = gateway.approvals;
  if (!isPlainObject(approvals)) {
    failures.push(failure(`gateway-contract:${ownerId}:approvals`, file, 'approvals must be an object.'));
    return [];
  }

  unknownFields(approvals, new Set(['default', 'requiredFor']), ownerId, 'approvals', file, failures);
  if (typeof approvals.default !== 'string' || !allowedApprovalDefaults.has(approvals.default)) {
    failures.push(failure(`gateway-contract:${ownerId}:approval-default`, file, `approval default must be one of: ${[...allowedApprovalDefaults].join(', ')}.`));
  }
  const requiredValues = [...baseApprovalGates];
  if (isNonLocalGateway(gateway)) requiredValues.push('remote-exposure');
  if (gateway.transport?.exposure === 'public-inbound' || gateway.remote?.remoteAccess === 'public') requiredValues.push('public-ingress');
  return validateStringArray(approvals.requiredFor, {
    ownerId,
    field: 'approval-required-for',
    allowed: allowedApprovalGates,
    requiredValues
  }, file, failures);
}

function validateEvidence(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const evidence = gateway.evidence;
  if (!isPlainObject(evidence)) {
    failures.push(failure(`gateway-contract:${ownerId}:evidence`, file, 'evidence must be an object.'));
    return;
  }

  unknownFields(evidence, new Set(['required', 'recordsRunLedger', 'retentionDays']), ownerId, 'evidence', file, failures);
  const requiredValues = [...requiredEvidenceItems];
  if (isNonLocalGateway(gateway)) {
    requiredValues.push('approval-record', 'remote-origin');
  }
  const requiredEvidence = validateStringArray(evidence.required, {
    ownerId,
    field: 'evidence-required',
    allowed: allowedEvidenceItems,
    requiredValues
  }, file, failures);
  requireBooleanTrue(evidence.recordsRunLedger, ownerId, 'records-run-ledger', file, failures, 'Gateway contracts must record run-ledger evidence.');
  validateInteger(evidence.retentionDays, { ownerId, field: 'evidence-retention-days', min: 1, max: 365 }, file, failures);
  if (gateway.diagnostics?.recordsFindings && !requiredEvidence.includes('diagnostic-report') && isNonLocalGateway(gateway)) {
    failures.push(failure(`gateway-contract:${ownerId}:diagnostic-report-evidence`, file, 'Non-local gateway diagnostics must retain diagnostic-report evidence.'));
  }
}

export function validateGatewayContracts(catalog, file = 'gateway-contracts.json') {
  const failures = [];

  if (!isPlainObject(catalog)) {
    return [failure('gateway-contracts:shape', file, 'Gateway contract catalog must be a JSON object.')];
  }

  for (const key of Object.keys(catalog)) {
    if (!['schemaVersion', 'gateways'].includes(key)) {
      failures.push(failure('gateway-contracts:field', file, `Unknown catalog field "${key}".`));
    }
  }

  if (catalog.schemaVersion !== gatewayContractsSchemaVersion) {
    failures.push(failure('gateway-contracts:schema-version', file, `schemaVersion must be ${gatewayContractsSchemaVersion}.`));
  }
  if (!Array.isArray(catalog.gateways) || catalog.gateways.length === 0) {
    failures.push(failure('gateway-contracts:gateways', file, 'gateways must be a non-empty array.'));
    return failures;
  }

  const seenIds = new Set();
  for (const [index, gateway] of catalog.gateways.entries()) {
    const gatewayId = gateway?.id ?? `index-${index}`;
    if (!isPlainObject(gateway)) {
      failures.push(failure(`gateway-contract:${gatewayId}:shape`, file, 'Gateway contract must be a JSON object.'));
      continue;
    }

    const allowedGatewayFields = new Set(['id', 'name', 'purpose', 'transport', 'identity', 'protocol', 'events', 'state', 'sandbox', 'remote', 'diagnostics', 'approvals', 'evidence']);
    for (const field of Object.keys(gateway)) {
      if (!allowedGatewayFields.has(field)) {
        failures.push(failure(`gateway-contract:${gatewayId}:field`, file, `Unknown gateway contract field "${field}".`));
      }
    }

    if (typeof gateway.id !== 'string' || !idPattern.test(gateway.id)) {
      failures.push(failure(`gateway-contract:${gatewayId}:id`, file, 'Gateway contract id must use lowercase letters, numbers, and hyphen separators.'));
    } else if (seenIds.has(gateway.id)) {
      failures.push(failure(`gateway-contract:${gateway.id}:duplicate`, file, `Duplicate gateway contract id: ${gateway.id}`));
    } else {
      seenIds.add(gateway.id);
    }

    stringField(gateway, 'name', file, failures, { minLength: 3, maxLength: 120 });
    stringField(gateway, 'purpose', file, failures, { minLength: 24, maxLength: 500 });
    validateTransport(gateway, file, failures);
    validateIdentity(gateway, file, failures);
    validateProtocol(gateway, file, failures);
    validateEvents(gateway, file, failures);
    validateState(gateway, file, failures);
    validateSandbox(gateway, file, failures);
    validateRemote(gateway, file, failures);
    validateDiagnostics(gateway, file, failures);
    validateApprovals(gateway, file, failures);
    validateEvidence(gateway, file, failures);
  }

  return failures;
}

export async function loadGatewayContracts(options = {}) {
  const file = path.resolve(options.file ?? defaultContractsFile);
  const text = await fs.readFile(file, 'utf8');
  const catalog = JSON.parse(text);
  const failures = validateGatewayContracts(catalog, relativePath(path.relative(options.root ?? packageRoot, file)));
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    file,
    catalog,
    failures
  };
}

export async function inspectGatewayContracts(directory, options = {}) {
  const target = path.resolve(directory);
  const file = options.file
    ? path.resolve(options.file)
    : await exists(path.join(target, workspaceContractsPath))
      ? path.join(target, workspaceContractsPath)
      : path.join(target, 'framework', 'gateways', 'default-gateway-contracts.json');
  const relativeFile = relativePath(path.relative(target, file));

  if (!await exists(file)) {
    return {
      status: 'fail',
      schemaVersion: gatewayContractsSchemaVersion,
      target,
      file: relativeFile,
      gateways: [],
      failures: [
        failure('gateway-contracts:file', relativeFile, `Create ${relativeFile} or run midas install.`)
      ]
    };
  }

  let catalog;
  try {
    catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      schemaVersion: gatewayContractsSchemaVersion,
      target,
      file: relativeFile,
      gateways: [],
      failures: [
        failure('gateway-contracts:parse', relativeFile, `Unable to parse gateway contracts: ${error.message}`)
      ]
    };
  }

  const failures = validateGatewayContracts(catalog, relativeFile);
  const gateways = failures.length === 0
    ? catalog.gateways.map((gateway) => ({
      id: gateway.id,
      name: gateway.name,
      kind: gateway.transport.kind,
      exposure: gateway.transport.exposure,
      requiresAuthentication: gateway.transport.requiresAuthentication,
      requiresPairing: gateway.identity.requiresPairing,
      remoteAccess: gateway.remote.remoteAccess,
      sandboxMode: gateway.sandbox.defaultMode,
      eventRetention: gateway.events.retention,
      retentionDays: gateway.events.retentionDays,
      approvalRequiredFor: gateway.approvals.requiredFor,
      evidenceRequired: gateway.evidence.required
    }))
    : [];

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: gatewayContractsSchemaVersion,
    target,
    file: relativeFile,
    gateways,
    failures
  };
}

export async function copyDefaultGatewayContracts({ directory }) {
  const target = path.resolve(directory);
  const outFile = path.join(target, workspaceContractsPath);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const text = await fs.readFile(defaultContractsFile, 'utf8');
  const catalog = JSON.parse(text);
  const failures = validateGatewayContracts(catalog, 'framework/gateways/default-gateway-contracts.json');
  if (failures.length > 0) {
    throw new Error(`Default gateway contracts are invalid: ${failures.map((item) => item.remediation).join('; ')}`);
  }
  await fs.writeFile(outFile, text.endsWith('\n') ? text : `${text}\n`);
  return relativePath(path.relative(target, outFile));
}
