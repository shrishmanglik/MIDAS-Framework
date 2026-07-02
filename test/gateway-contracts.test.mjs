import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  inspectGatewayContracts,
  validateGatewayContracts
} from '../lib/gateway-contracts.mjs';

const validGateway = {
  id: 'reviewed-control',
  name: 'Reviewed Control',
  purpose: 'Controls an authenticated private control plane with schema validation, approval gates, bounded events, and run evidence.',
  transport: {
    kind: 'websocket',
    exposure: 'private-network',
    requiresAuthentication: true,
    allowedOrigins: ['localhost', 'private-network'],
    requiresHandshake: true,
    validatesSchema: true
  },
  identity: {
    requiresDeviceIdentity: true,
    requiresPairing: true,
    recordsOperator: true,
    recordsSession: true,
    rotatesTokens: true
  },
  protocol: {
    schemaValidated: true,
    supportsCapabilityDiscovery: true,
    requiresIdempotencyForSideEffects: true,
    rejectsUnknownMethods: true,
    supportsCancellation: true
  },
  events: {
    emitsRunEvents: true,
    emitsHealthEvents: true,
    retention: 'bounded',
    retentionDays: 30,
    gapRecovery: 'event-replay'
  },
  state: {
    storesRunState: true,
    storesPairingState: true,
    redactsSensitiveLogs: true,
    blocksSecretEcho: true
  },
  sandbox: {
    defaultMode: 'non-main',
    nonMainRequiresSandbox: true,
    elevatedToolsRequireApproval: true,
    bindsRunControlProfile: true
  },
  remote: {
    remoteAccess: 'private-network',
    requiresExplicitEnable: true,
    requiresEncryption: true,
    requiresApprovedOrigins: true
  },
  diagnostics: {
    doctorChecks: ['schema', 'auth', 'exposure', 'events', 'sandbox', 'state', 'remote', 'identity', 'protocol', 'approvals'],
    fixMode: 'advisory-only',
    recordsFindings: true
  },
  approvals: {
    default: 'maintainer',
    requiredFor: ['remote-exposure', 'public-ingress', 'secret-access', 'elevated-tool', 'destructive', 'deploy', 'money', 'capability-change', 'approval-policy-change']
  },
  evidence: {
    required: ['gateway-id', 'session-id', 'operator-or-device', 'schema-check', 'event-log', 'approval-record', 'remote-origin', 'run-ledger', 'diagnostic-report'],
    recordsRunLedger: true,
    retentionDays: 30
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function catalog(gateway) {
  return {
    schemaVersion: 'midas.gateway-contracts.v1',
    gateways: [gateway]
  };
}

test('default MIDAS gateway contract catalog passes', async () => {
  const result = await inspectGatewayContracts(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(result.gateways.some((gateway) => gateway.id === 'local-operator-gateway'));
  assert.ok(result.gateways.some((gateway) => gateway.id === 'private-control-gateway'));
  assert.ok(result.gateways.some((gateway) => gateway.id === 'reviewed-automation-gateway'));
});

test('gateway contract validation rejects non-local control planes without auth', () => {
  const gateway = clone(validGateway);
  gateway.transport.requiresAuthentication = false;
  const failures = validateGatewayContracts(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'gateway-contract:reviewed-control:external-auth'));
});

test('gateway contract validation requires handshake and schema validation', () => {
  const gateway = clone(validGateway);
  gateway.transport.requiresHandshake = false;
  gateway.transport.validatesSchema = false;
  const failures = validateGatewayContracts(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'gateway-contract:reviewed-control:handshake-required'));
  assert.ok(failures.some((failure) => failure.id === 'gateway-contract:reviewed-control:schema-required'));
});

test('gateway contract validation requires idempotency for side effects', () => {
  const gateway = clone(validGateway);
  gateway.protocol.requiresIdempotencyForSideEffects = false;
  const failures = validateGatewayContracts(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'gateway-contract:reviewed-control:idempotency-required'));
});

test('gateway contract validation requires pairing state for paired gateways', () => {
  const gateway = clone(validGateway);
  gateway.state.storesPairingState = false;
  const failures = validateGatewayContracts(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'gateway-contract:reviewed-control:stores-pairing-state-required'));
});

test('gateway contract validation rejects non-local gateways without sandbox mode', () => {
  const gateway = clone(validGateway);
  gateway.sandbox.defaultMode = 'off';
  const failures = validateGatewayContracts(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'gateway-contract:reviewed-control:remote-sandbox-required'));
});

test('gateway contract validation requires encrypted remote access', () => {
  const gateway = clone(validGateway);
  gateway.remote.requiresEncryption = false;
  const failures = validateGatewayContracts(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'gateway-contract:reviewed-control:remote-encryption'));
});

test('gateway contract validation requires remote approvals and evidence', () => {
  const gateway = clone(validGateway);
  gateway.approvals.requiredFor = gateway.approvals.requiredFor.filter((gate) => gate !== 'remote-exposure');
  gateway.evidence.required = gateway.evidence.required.filter((item) => item !== 'remote-origin');
  const failures = validateGatewayContracts(catalog(gateway));
  assert.ok(failures.some((failure) => failure.id === 'gateway-contract:reviewed-control:approval-required-for:required:remote-exposure'));
  assert.ok(failures.some((failure) => failure.id === 'gateway-contract:reviewed-control:evidence-required:required:remote-origin'));
});

test('installed workspace includes passing gateway contracts', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-gateway-contracts-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,operator-runtime',
    tools: 'codex',
    yes: true
  });
  const result = await inspectGatewayContracts(temp);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'gateways', 'contracts.json')));
  assert.ok(result.gateways.every((gateway) => gateway.evidenceRequired.includes('run-ledger')));
});
