import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const channelGatewaysSchemaVersion = 'midas.channel-gateways.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultGatewaysFile = path.join(packageRoot, 'framework', 'channels', 'default-channel-gateways.json');
const workspaceGatewaysPath = '.midas/channels/gateways.json';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedKinds = new Set(['local-console', 'web-console', 'messaging', 'api', 'scheduler']);
const allowedExposures = new Set(['local-only', 'private-network', 'external-inbound', 'public-inbound']);
const externalExposures = new Set(['private-network', 'external-inbound', 'public-inbound']);
const publicExposures = new Set(['public-inbound']);
const allowedOrigins = new Set(['localhost', 'private-network', 'approved-workspace', 'approved-domain', 'approved-ip-range']);
const allowedSessionIsolation = new Set(['per-user', 'per-thread', 'per-project', 'shared-group']);
const allowedGroupModes = new Set(['disabled', 'mention-only', 'reply-or-mention', 'all-messages']);
const allowedRetention = new Set(['none', 'bounded', 'persistent']);
const allowedDirections = new Set(['inbound', 'reply', 'proactive', 'file-ingress', 'file-egress']);
const externalMessageDirections = new Set(['reply', 'proactive', 'file-egress']);
const allowedRoots = new Set(['workspace', 'generated', 'explicit-allowlist']);
const allowedTools = new Set([
  'read',
  'write',
  'edit',
  'shell',
  'browser',
  'mcp',
  'memory',
  'scheduler',
  'web-fetch',
  'web-search',
  'send-file'
]);
const highRiskTools = new Set(['shell', 'browser', 'mcp', 'scheduler', 'send-file']);
const allowedApprovalDefaults = new Set(['none', 'maintainer', 'owner', 'security', 'explicit-human']);
const allowedApprovalGates = new Set([
  'external-message',
  'public-message',
  'file-ingress',
  'file-egress',
  'shell',
  'browser',
  'mcp',
  'scheduler',
  'secret-access',
  'deploy',
  'destructive',
  'money'
]);
const baseApprovalGates = ['external-message', 'public-message', 'file-egress', 'secret-access', 'deploy', 'destructive', 'money'];
const allowedEvidenceItems = new Set([
  'session-id',
  'channel-id',
  'user-or-thread',
  'approval-record',
  'tool-calls',
  'files-received',
  'files-sent',
  'cancellation-state',
  'retention-state',
  'run-ledger',
  'risk-summary'
]);
const requiredEvidenceItems = ['session-id', 'channel-id', 'user-or-thread', 'tool-calls', 'cancellation-state', 'retention-state'];

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
      `channel-gateway:${gateway.id ?? 'unknown'}:${field}`,
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
      `channel-gateway:${ownerId}:${field}`,
      file,
      `${label} must be an integer from ${min} to ${max}.`
    ));
  }
}

function validateBoolean(value, ownerId, field, file, failures) {
  if (typeof value !== 'boolean') {
    failures.push(failure(
      `channel-gateway:${ownerId}:${field}`,
      file,
      `${field} must be a boolean.`
    ));
  }
}

function requireBooleanTrue(value, ownerId, field, file, failures, remediation) {
  if (value !== true) {
    failures.push(failure(`channel-gateway:${ownerId}:${field}`, file, remediation));
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
      `channel-gateway:${ownerId}:${field}`,
      file,
      `${field} must contain at least ${minItems} item${minItems === 1 ? '' : 's'}.`
    ));
    return [];
  }

  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || !idPattern.test(value)) {
      failures.push(failure(
        `channel-gateway:${ownerId}:${field}:format`,
        file,
        `${field} entries must use lowercase letters, numbers, and hyphen separators.`
      ));
      continue;
    }
    if (seen.has(value)) {
      failures.push(failure(
        `channel-gateway:${ownerId}:${field}:duplicate`,
        file,
        `${field} entries must be unique. Duplicate: ${value}`
      ));
    }
    seen.add(value);
    if (allowed && !allowed.has(value)) {
      failures.push(failure(
        `channel-gateway:${ownerId}:${field}:allowed`,
        file,
        `${field} must use allowed values: ${[...allowed].join(', ')}.`
      ));
    }
  }

  for (const required of requiredValues) {
    if (!seen.has(required)) {
      failures.push(failure(
        `channel-gateway:${ownerId}:${field}:required:${required}`,
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
      failures.push(failure(`channel-gateway:${ownerId}:${section}-field`, file, `Unknown ${section} field "${field}".`));
    }
  }
}

function validateSurface(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const surface = gateway.surface;
  if (!isPlainObject(surface)) {
    failures.push(failure(`channel-gateway:${ownerId}:surface`, file, 'surface must be an object.'));
    return;
  }

  unknownFields(surface, new Set(['kind', 'exposure', 'requiresAuthentication', 'allowedOrigins', 'recordsSessionIdentity', 'supportsCancellation']), ownerId, 'surface', file, failures);
  if (typeof surface.kind !== 'string' || !allowedKinds.has(surface.kind)) {
    failures.push(failure(`channel-gateway:${ownerId}:surface-kind`, file, `surface.kind must be one of: ${[...allowedKinds].join(', ')}.`));
  }
  if (typeof surface.exposure !== 'string' || !allowedExposures.has(surface.exposure)) {
    failures.push(failure(`channel-gateway:${ownerId}:surface-exposure`, file, `surface.exposure must be one of: ${[...allowedExposures].join(', ')}.`));
  }
  validateBoolean(surface.requiresAuthentication, ownerId, 'requires-authentication', file, failures);
  validateBoolean(surface.recordsSessionIdentity, ownerId, 'records-session-identity', file, failures);
  validateBoolean(surface.supportsCancellation, ownerId, 'supports-cancellation', file, failures);
  const origins = validateStringArray(surface.allowedOrigins, {
    ownerId,
    field: 'allowed-origins',
    allowed: allowedOrigins
  }, file, failures);

  if (externalExposures.has(surface.exposure) && surface.requiresAuthentication !== true) {
    failures.push(failure(`channel-gateway:${ownerId}:external-auth`, file, 'Private, external, and public channel exposures must require authentication.'));
  }
  if (externalExposures.has(surface.exposure) && origins.length === 0) {
    failures.push(failure(`channel-gateway:${ownerId}:external-origins`, file, 'External channel exposures must declare approved origins.'));
  }
  if ((externalExposures.has(surface.exposure) || publicExposures.has(surface.exposure)) && surface.recordsSessionIdentity !== true) {
    failures.push(failure(`channel-gateway:${ownerId}:external-session-identity`, file, 'External channel exposures must record session identity.'));
  }
  if ((externalExposures.has(surface.exposure) || publicExposures.has(surface.exposure)) && surface.supportsCancellation !== true) {
    failures.push(failure(`channel-gateway:${ownerId}:external-cancellation`, file, 'External channel exposures must support cancellation or interruption.'));
  }
}

function validateSession(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const session = gateway.session;
  if (!isPlainObject(session)) {
    failures.push(failure(`channel-gateway:${ownerId}:session`, file, 'session must be an object.'));
    return;
  }

  unknownFields(session, new Set(['isolation', 'groupMode', 'requiresTrigger', 'maxConcurrentSessions', 'contextRetention', 'maxRetainedTurns']), ownerId, 'session', file, failures);
  if (typeof session.isolation !== 'string' || !allowedSessionIsolation.has(session.isolation)) {
    failures.push(failure(`channel-gateway:${ownerId}:session-isolation`, file, `session.isolation must be one of: ${[...allowedSessionIsolation].join(', ')}.`));
  }
  if (typeof session.groupMode !== 'string' || !allowedGroupModes.has(session.groupMode)) {
    failures.push(failure(`channel-gateway:${ownerId}:group-mode`, file, `session.groupMode must be one of: ${[...allowedGroupModes].join(', ')}.`));
  }
  validateBoolean(session.requiresTrigger, ownerId, 'requires-trigger', file, failures);
  validateInteger(session.maxConcurrentSessions, { ownerId, field: 'max-concurrent-sessions', min: 1, max: 100 }, file, failures);
  if (typeof session.contextRetention !== 'string' || !allowedRetention.has(session.contextRetention)) {
    failures.push(failure(`channel-gateway:${ownerId}:context-retention`, file, `session.contextRetention must be one of: ${[...allowedRetention].join(', ')}.`));
  }
  validateInteger(session.maxRetainedTurns, { ownerId, field: 'max-retained-turns', min: 0, max: 200 }, file, failures);

  if (gateway.surface && externalExposures.has(gateway.surface.exposure)) {
    requireBooleanTrue(session.requiresTrigger, ownerId, 'external-trigger', file, failures, 'External channels must require an explicit trigger, mention, or request boundary.');
    if (session.groupMode === 'all-messages') {
      failures.push(failure(`channel-gateway:${ownerId}:external-all-messages`, file, 'External group channels must not process all messages by default.'));
    }
  }
  if (session.contextRetention === 'none' && session.maxRetainedTurns !== 0) {
    failures.push(failure(`channel-gateway:${ownerId}:retention-none-turns`, file, 'session.maxRetainedTurns must be 0 when contextRetention is none.'));
  }
  if (session.contextRetention !== 'none' && session.maxRetainedTurns < 1) {
    failures.push(failure(`channel-gateway:${ownerId}:retention-turns`, file, 'Channels with retained context must keep at least one retained turn and declare the bound.'));
  }
  if (session.isolation === 'shared-group' && gateway.surface && externalExposures.has(gateway.surface.exposure)) {
    failures.push(failure(`channel-gateway:${ownerId}:external-shared-group`, file, 'External channels must not use shared group context without a project-specific review.'));
  }
}

function validateMessage(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const message = gateway.message;
  if (!isPlainObject(message)) {
    failures.push(failure(`channel-gateway:${ownerId}:message`, file, 'message must be an object.'));
    return [];
  }

  unknownFields(message, new Set(['allowedDirections', 'externalSendRequiresApproval', 'publicMessageRequiresApproval', 'blocksSecrets', 'redactsLogs']), ownerId, 'message', file, failures);
  const directions = validateStringArray(message.allowedDirections, {
    ownerId,
    field: 'allowed-directions',
    allowed: allowedDirections
  }, file, failures);
  validateBoolean(message.externalSendRequiresApproval, ownerId, 'external-send-approval', file, failures);
  validateBoolean(message.publicMessageRequiresApproval, ownerId, 'public-message-approval', file, failures);
  requireBooleanTrue(message.blocksSecrets, ownerId, 'blocks-secrets', file, failures, 'Channel gateways must block secrets in messages and attachments.');
  requireBooleanTrue(message.redactsLogs, ownerId, 'redacts-logs', file, failures, 'Channel gateways must redact sensitive values in logs.');

  const maySendExternally = gateway.surface && externalExposures.has(gateway.surface.exposure) && directions.some((direction) => externalMessageDirections.has(direction));
  if (maySendExternally && message.externalSendRequiresApproval !== true) {
    failures.push(failure(`channel-gateway:${ownerId}:external-send-gate`, file, 'External-facing replies, proactive messages, and file egress must require approval.'));
  }
  if ((gateway.surface && publicExposures.has(gateway.surface.exposure)) && message.publicMessageRequiresApproval !== true) {
    failures.push(failure(`channel-gateway:${ownerId}:public-message-gate`, file, 'Public-facing channels must require approval for public messages.'));
  }
  return directions;
}

function validateFiles(gateway, directions, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const files = gateway.files;
  if (!isPlainObject(files)) {
    failures.push(failure(`channel-gateway:${ownerId}:files`, file, 'files must be an object.'));
    return;
  }

  unknownFields(files, new Set(['uploadsEnabled', 'downloadsEnabled', 'allowedRoots', 'maxUploadMb', 'maxDownloadMb', 'rejectsPathTraversal', 'scansBeforeUse', 'blocksExecutableUploads']), ownerId, 'files', file, failures);
  validateBoolean(files.uploadsEnabled, ownerId, 'uploads-enabled', file, failures);
  validateBoolean(files.downloadsEnabled, ownerId, 'downloads-enabled', file, failures);
  validateStringArray(files.allowedRoots, {
    ownerId,
    field: 'allowed-roots',
    allowed: allowedRoots
  }, file, failures);
  validateInteger(files.maxUploadMb, { ownerId, field: 'max-upload-mb', min: 0, max: 100 }, file, failures);
  validateInteger(files.maxDownloadMb, { ownerId, field: 'max-download-mb', min: 0, max: 100 }, file, failures);
  requireBooleanTrue(files.rejectsPathTraversal, ownerId, 'rejects-path-traversal', file, failures, 'File ingress and egress must reject path traversal.');
  requireBooleanTrue(files.scansBeforeUse, ownerId, 'scans-before-use', file, failures, 'Uploaded or shared files must be scanned or reviewed before use.');
  requireBooleanTrue(files.blocksExecutableUploads, ownerId, 'blocks-executable-uploads', file, failures, 'File upload channels must block executable uploads.');

  if (files.uploadsEnabled && !directions.includes('file-ingress')) {
    failures.push(failure(`channel-gateway:${ownerId}:upload-direction`, file, 'files.uploadsEnabled requires file-ingress in message.allowedDirections.'));
  }
  if (files.uploadsEnabled && files.maxUploadMb < 1) {
    failures.push(failure(`channel-gateway:${ownerId}:upload-size`, file, 'Enabled uploads must declare a positive maxUploadMb.'));
  }
  if (files.downloadsEnabled && !directions.includes('file-egress')) {
    failures.push(failure(`channel-gateway:${ownerId}:download-direction`, file, 'files.downloadsEnabled requires file-egress in message.allowedDirections.'));
  }
  if (files.downloadsEnabled && files.maxDownloadMb < 1) {
    failures.push(failure(`channel-gateway:${ownerId}:download-size`, file, 'Enabled downloads must declare a positive maxDownloadMb.'));
  }
}

function validateTools(gateway, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const tools = gateway.tools;
  if (!isPlainObject(tools)) {
    failures.push(failure(`channel-gateway:${ownerId}:tools`, file, 'tools must be an object.'));
    return [];
  }

  unknownFields(tools, new Set(['exposed', 'highRiskRequiresApproval', 'shellRequiresWorkspaceBound', 'mcpRequiresAllowlist', 'browserRequiresDomainAllowlist']), ownerId, 'tools', file, failures);
  const exposed = validateStringArray(tools.exposed, {
    ownerId,
    field: 'exposed-tools',
    allowed: allowedTools,
    minItems: 0
  }, file, failures);
  validateBoolean(tools.highRiskRequiresApproval, ownerId, 'high-risk-approval', file, failures);
  validateBoolean(tools.shellRequiresWorkspaceBound, ownerId, 'shell-workspace-bound', file, failures);
  validateBoolean(tools.mcpRequiresAllowlist, ownerId, 'mcp-allowlist', file, failures);
  validateBoolean(tools.browserRequiresDomainAllowlist, ownerId, 'browser-domain-allowlist', file, failures);

  if (exposed.some((tool) => highRiskTools.has(tool)) && tools.highRiskRequiresApproval !== true) {
    failures.push(failure(`channel-gateway:${ownerId}:high-risk-tools-approval`, file, 'High-risk channel tools must require approval.'));
  }
  if (exposed.includes('shell') && tools.shellRequiresWorkspaceBound !== true) {
    failures.push(failure(`channel-gateway:${ownerId}:shell-workspace-required`, file, 'Shell exposure must be workspace-bound.'));
  }
  if (exposed.includes('mcp') && tools.mcpRequiresAllowlist !== true) {
    failures.push(failure(`channel-gateway:${ownerId}:mcp-allowlist-required`, file, 'MCP exposure must require an allowlist.'));
  }
  if (exposed.includes('browser') && tools.browserRequiresDomainAllowlist !== true) {
    failures.push(failure(`channel-gateway:${ownerId}:browser-domain-required`, file, 'Browser exposure must require a domain allowlist.'));
  }
  return exposed;
}

function validateApprovals(gateway, directions, exposedTools, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const approvals = gateway.approvals;
  if (!isPlainObject(approvals)) {
    failures.push(failure(`channel-gateway:${ownerId}:approvals`, file, 'approvals must be an object.'));
    return [];
  }

  unknownFields(approvals, new Set(['default', 'requiredFor']), ownerId, 'approvals', file, failures);
  if (typeof approvals.default !== 'string' || !allowedApprovalDefaults.has(approvals.default)) {
    failures.push(failure(`channel-gateway:${ownerId}:approval-default`, file, `approval default must be one of: ${[...allowedApprovalDefaults].join(', ')}.`));
  }
  const required = validateStringArray(approvals.requiredFor, {
    ownerId,
    field: 'approval-required-for',
    allowed: allowedApprovalGates,
    requiredValues: baseApprovalGates
  }, file, failures);

  if (gateway.surface && externalExposures.has(gateway.surface.exposure) && !required.includes('external-message')) {
    failures.push(failure(`channel-gateway:${ownerId}:external-message-approval`, file, 'External channels must require the external-message approval gate.'));
  }
  if (gateway.surface && publicExposures.has(gateway.surface.exposure) && !required.includes('public-message')) {
    failures.push(failure(`channel-gateway:${ownerId}:public-message-approval-required`, file, 'Public channels must require the public-message approval gate.'));
  }
  if (directions.includes('file-ingress') && !required.includes('file-ingress')) {
    failures.push(failure(`channel-gateway:${ownerId}:file-ingress-approval`, file, 'File-ingress channels must require the file-ingress approval gate.'));
  }
  if (directions.includes('file-egress') && !required.includes('file-egress')) {
    failures.push(failure(`channel-gateway:${ownerId}:file-egress-approval`, file, 'File-egress channels must require the file-egress approval gate.'));
  }
  for (const tool of ['shell', 'browser', 'mcp', 'scheduler']) {
    if (exposedTools.includes(tool) && !required.includes(tool)) {
      failures.push(failure(`channel-gateway:${ownerId}:${tool}-approval-required`, file, `${tool} exposure must require the ${tool} approval gate.`));
    }
  }
  return required;
}

function validateEvidence(gateway, directions, file, failures) {
  const ownerId = gateway.id ?? 'unknown';
  const evidence = gateway.evidence;
  if (!isPlainObject(evidence)) {
    failures.push(failure(`channel-gateway:${ownerId}:evidence`, file, 'evidence must be an object.'));
    return;
  }

  unknownFields(evidence, new Set(['required', 'retentionDays', 'recordsRunLedger']), ownerId, 'evidence', file, failures);
  const requiredEvidence = validateStringArray(evidence.required, {
    ownerId,
    field: 'evidence-required',
    allowed: allowedEvidenceItems,
    requiredValues: requiredEvidenceItems
  }, file, failures);
  validateInteger(evidence.retentionDays, { ownerId, field: 'retention-days', min: 0, max: 365 }, file, failures);
  requireBooleanTrue(evidence.recordsRunLedger, ownerId, 'records-run-ledger', file, failures, 'Channel gateways must record run-ledger evidence.');
  if ((gateway.surface && externalExposures.has(gateway.surface.exposure)) && !requiredEvidence.includes('approval-record')) {
    failures.push(failure(`channel-gateway:${ownerId}:approval-evidence`, file, 'External channels must retain approval-record evidence.'));
  }
  if (directions.includes('file-ingress') && !requiredEvidence.includes('files-received')) {
    failures.push(failure(`channel-gateway:${ownerId}:files-received-evidence`, file, 'File-ingress channels must record files-received evidence.'));
  }
  if (directions.includes('file-egress') && !requiredEvidence.includes('files-sent')) {
    failures.push(failure(`channel-gateway:${ownerId}:files-sent-evidence`, file, 'File-egress channels must record files-sent evidence.'));
  }
}

export function validateChannelGateways(catalog, file = 'channel-gateways.json') {
  const failures = [];

  if (!isPlainObject(catalog)) {
    return [failure('channel-gateways:shape', file, 'Channel gateway catalog must be a JSON object.')];
  }

  for (const key of Object.keys(catalog)) {
    if (!['schemaVersion', 'gateways'].includes(key)) {
      failures.push(failure('channel-gateways:field', file, `Unknown catalog field "${key}".`));
    }
  }

  if (catalog.schemaVersion !== channelGatewaysSchemaVersion) {
    failures.push(failure('channel-gateways:schema-version', file, `schemaVersion must be ${channelGatewaysSchemaVersion}.`));
  }
  if (!Array.isArray(catalog.gateways) || catalog.gateways.length === 0) {
    failures.push(failure('channel-gateways:gateways', file, 'gateways must be a non-empty array.'));
    return failures;
  }

  const seenIds = new Set();
  for (const [index, gateway] of catalog.gateways.entries()) {
    const gatewayId = gateway?.id ?? `index-${index}`;
    if (!isPlainObject(gateway)) {
      failures.push(failure(`channel-gateway:${gatewayId}:shape`, file, 'Channel gateway must be a JSON object.'));
      continue;
    }

    const allowedGatewayFields = new Set(['id', 'name', 'purpose', 'surface', 'session', 'message', 'files', 'tools', 'approvals', 'evidence']);
    for (const field of Object.keys(gateway)) {
      if (!allowedGatewayFields.has(field)) {
        failures.push(failure(`channel-gateway:${gatewayId}:field`, file, `Unknown channel gateway field "${field}".`));
      }
    }

    if (typeof gateway.id !== 'string' || !idPattern.test(gateway.id)) {
      failures.push(failure(`channel-gateway:${gatewayId}:id`, file, 'Channel gateway id must use lowercase letters, numbers, and hyphen separators.'));
    } else if (seenIds.has(gateway.id)) {
      failures.push(failure(`channel-gateway:${gateway.id}:duplicate`, file, `Duplicate channel gateway id: ${gateway.id}`));
    } else {
      seenIds.add(gateway.id);
    }

    stringField(gateway, 'name', file, failures, { minLength: 3, maxLength: 120 });
    stringField(gateway, 'purpose', file, failures, { minLength: 24, maxLength: 500 });
    validateSurface(gateway, file, failures);
    validateSession(gateway, file, failures);
    const directions = validateMessage(gateway, file, failures);
    validateFiles(gateway, directions, file, failures);
    const exposedTools = validateTools(gateway, file, failures);
    validateApprovals(gateway, directions, exposedTools, file, failures);
    validateEvidence(gateway, directions, file, failures);
  }

  return failures;
}

export async function loadChannelGateways(options = {}) {
  const file = path.resolve(options.file ?? defaultGatewaysFile);
  const text = await fs.readFile(file, 'utf8');
  const catalog = JSON.parse(text);
  const failures = validateChannelGateways(catalog, relativePath(path.relative(options.root ?? packageRoot, file)));
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    file,
    catalog,
    failures
  };
}

export async function inspectChannelGateways(directory, options = {}) {
  const target = path.resolve(directory);
  const file = options.file
    ? path.resolve(options.file)
    : await exists(path.join(target, workspaceGatewaysPath))
      ? path.join(target, workspaceGatewaysPath)
      : path.join(target, 'framework', 'channels', 'default-channel-gateways.json');
  const relativeFile = relativePath(path.relative(target, file));

  if (!await exists(file)) {
    return {
      status: 'fail',
      schemaVersion: channelGatewaysSchemaVersion,
      target,
      file: relativeFile,
      gateways: [],
      failures: [
        failure('channel-gateways:file', relativeFile, `Create ${relativeFile} or run midas install.`)
      ]
    };
  }

  let catalog;
  try {
    catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      schemaVersion: channelGatewaysSchemaVersion,
      target,
      file: relativeFile,
      gateways: [],
      failures: [
        failure('channel-gateways:parse', relativeFile, `Unable to parse channel gateways: ${error.message}`)
      ]
    };
  }

  const failures = validateChannelGateways(catalog, relativeFile);
  const gateways = failures.length === 0
    ? catalog.gateways.map((gateway) => ({
      id: gateway.id,
      name: gateway.name,
      kind: gateway.surface.kind,
      exposure: gateway.surface.exposure,
      requiresAuthentication: gateway.surface.requiresAuthentication,
      supportsCancellation: gateway.surface.supportsCancellation,
      groupMode: gateway.session.groupMode,
      contextRetention: gateway.session.contextRetention,
      maxConcurrentSessions: gateway.session.maxConcurrentSessions,
      allowedDirections: gateway.message.allowedDirections,
      uploadsEnabled: gateway.files.uploadsEnabled,
      downloadsEnabled: gateway.files.downloadsEnabled,
      exposedTools: gateway.tools.exposed,
      approvalRequiredFor: gateway.approvals.requiredFor,
      retentionDays: gateway.evidence.retentionDays
    }))
    : [];

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: channelGatewaysSchemaVersion,
    target,
    file: relativeFile,
    gateways,
    failures
  };
}

export async function copyDefaultChannelGateways({ directory }) {
  const target = path.resolve(directory);
  const outFile = path.join(target, workspaceGatewaysPath);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const text = await fs.readFile(defaultGatewaysFile, 'utf8');
  const catalog = JSON.parse(text);
  const failures = validateChannelGateways(catalog, 'framework/channels/default-channel-gateways.json');
  if (failures.length > 0) {
    throw new Error(`Default channel gateways are invalid: ${failures.map((item) => item.remediation).join('; ')}`);
  }
  await fs.writeFile(outFile, text.endsWith('\n') ? text : `${text}\n`);
  return relativePath(path.relative(target, outFile));
}
