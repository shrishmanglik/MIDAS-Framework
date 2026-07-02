import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  inspectChannelGateways,
  validateChannelGateways
} from '../lib/channel-gateways.mjs';

const validGateway = {
  id: 'reviewed-web',
  name: 'Reviewed Web',
  purpose: 'Controls a reviewed web channel with bounded sessions, file handling, and approval-gated tool exposure.',
  surface: {
    kind: 'web-console',
    exposure: 'private-network',
    requiresAuthentication: true,
    allowedOrigins: ['localhost', 'private-network'],
    recordsSessionIdentity: true,
    supportsCancellation: true
  },
  session: {
    isolation: 'per-user',
    groupMode: 'disabled',
    requiresTrigger: true,
    maxConcurrentSessions: 5,
    contextRetention: 'bounded',
    maxRetainedTurns: 20
  },
  message: {
    allowedDirections: ['inbound', 'reply', 'file-ingress', 'file-egress'],
    externalSendRequiresApproval: true,
    publicMessageRequiresApproval: true,
    blocksSecrets: true,
    redactsLogs: true
  },
  files: {
    uploadsEnabled: true,
    downloadsEnabled: true,
    allowedRoots: ['workspace', 'generated'],
    maxUploadMb: 25,
    maxDownloadMb: 25,
    rejectsPathTraversal: true,
    scansBeforeUse: true,
    blocksExecutableUploads: true
  },
  tools: {
    exposed: ['read', 'write', 'edit', 'web-fetch', 'memory', 'send-file'],
    highRiskRequiresApproval: true,
    shellRequiresWorkspaceBound: true,
    mcpRequiresAllowlist: true,
    browserRequiresDomainAllowlist: true
  },
  approvals: {
    default: 'maintainer',
    requiredFor: ['external-message', 'public-message', 'file-ingress', 'file-egress', 'secret-access', 'deploy', 'destructive', 'money']
  },
  evidence: {
    required: ['session-id', 'channel-id', 'user-or-thread', 'approval-record', 'tool-calls', 'files-received', 'files-sent', 'cancellation-state', 'retention-state'],
    retentionDays: 30,
    recordsRunLedger: true
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function catalog(gateway) {
  return {
    schemaVersion: 'midas.channel-gateways.v1',
    gateways: [gateway]
  };
}

test('default MIDAS channel gateway catalog passes', async () => {
  const result = await inspectChannelGateways(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(result.gateways.some((gateway) => gateway.id === 'local-console'));
  assert.ok(result.gateways.some((gateway) => gateway.id === 'private-web-console'));
  assert.ok(result.gateways.some((gateway) => gateway.id === 'reviewed-message-bridge'));
});

test('channel gateway validation rejects public surfaces without auth', () => {
  const gateway = clone(validGateway);
  gateway.surface.exposure = 'public-inbound';
  gateway.surface.requiresAuthentication = false;
  const failures = validateChannelGateways(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:external-auth'));
});

test('channel gateway validation rejects external all-message group ingestion', () => {
  const gateway = clone(validGateway);
  gateway.session.isolation = 'per-thread';
  gateway.session.groupMode = 'all-messages';
  const failures = validateChannelGateways(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:external-all-messages'));
});

test('channel gateway validation requires explicit triggers for external channels', () => {
  const gateway = clone(validGateway);
  gateway.session.requiresTrigger = false;
  const failures = validateChannelGateways(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:external-trigger'));
});

test('channel gateway validation requires file ingress policy guards', () => {
  const gateway = clone(validGateway);
  gateway.files.rejectsPathTraversal = false;
  gateway.files.scansBeforeUse = false;
  gateway.files.blocksExecutableUploads = false;
  const failures = validateChannelGateways(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:rejects-path-traversal'));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:scans-before-use'));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:blocks-executable-uploads'));
});

test('channel gateway validation requires file egress approval and evidence', () => {
  const gateway = clone(validGateway);
  gateway.approvals.requiredFor = gateway.approvals.requiredFor.filter((gate) => gate !== 'file-egress');
  gateway.evidence.required = gateway.evidence.required.filter((item) => item !== 'files-sent');
  const failures = validateChannelGateways(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:approval-required-for:required:file-egress'));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:files-sent-evidence'));
});

test('channel gateway validation requires shell workspace bounds and approval', () => {
  const gateway = clone(validGateway);
  gateway.tools.exposed.push('shell');
  gateway.tools.shellRequiresWorkspaceBound = false;
  const failures = validateChannelGateways(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:shell-workspace-required'));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:shell-approval-required'));
});

test('channel gateway validation requires MCP allowlists and approval', () => {
  const gateway = clone(validGateway);
  gateway.tools.exposed.push('mcp');
  gateway.tools.mcpRequiresAllowlist = false;
  const failures = validateChannelGateways(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:mcp-allowlist-required'));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:mcp-approval-required'));
});

test('channel gateway validation requires retained session bounds', () => {
  const gateway = clone(validGateway);
  gateway.session.contextRetention = 'persistent';
  gateway.session.maxRetainedTurns = 0;
  const failures = validateChannelGateways(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'channel-gateway:reviewed-web:retention-turns'));
});

test('installed workspace includes passing channel gateways', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-channel-gateways-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,operator-runtime',
    tools: 'codex',
    yes: true
  });
  const result = await inspectChannelGateways(temp);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'channels', 'gateways.json')));
  assert.ok(result.gateways.every((gateway) => gateway.approvalRequiredFor.includes('external-message')));
});
