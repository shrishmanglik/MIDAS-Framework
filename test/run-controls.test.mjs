import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  inspectRunControls,
  validateRunControlPolicy
} from '../lib/run-controls.mjs';

const validProfile = {
  id: 'valid-run',
  name: 'Valid Run',
  purpose: 'Controls a bounded project run with explicit approval gates, evidence, and closeout requirements.',
  scope: {
    maxIterations: 5,
    maxSubtasks: 1,
    maxRuntimeMinutes: 60,
    requiresObjective: true,
    requiresStopCondition: true
  },
  sandbox: {
    filesystem: 'workspace-write',
    network: 'read-only',
    externalActions: false,
    secretsAllowed: false,
    allowedMutation: ['workspace-files', 'reports', 'run-ledger'],
    blockedMutation: [
      'secrets',
      'credentials',
      'payments',
      'deploys',
      'destructive',
      'public-messages',
      'external-messages'
    ]
  },
  subagents: {
    enabled: true,
    maxConcurrent: 1,
    requiresInstructionPacket: true,
    requiresEvidence: true,
    inheritsParentApprovals: true
  },
  messageGateway: {
    enabled: true,
    allowedChannels: ['local-files', 'run-ledger'],
    requiresApprovalForExternal: true,
    blocksDirectPublicMessages: true,
    recordsUserAndThread: true
  },
  approvals: {
    default: 'maintainer',
    requiredFor: [
      'external-action',
      'money',
      'destructive',
      'deploy',
      'secret-access',
      'public-claim'
    ]
  },
  evidence: {
    required: ['objective', 'scope', 'files-changed', 'validation-result', 'run-ledger', 'risk-summary', 'next-action'],
    checkpointEverySteps: 2
  },
  closeout: {
    requiresRunLedger: true,
    requiresNextAction: true,
    requiresRiskSummary: true,
    requiresStateUpdate: true
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function policy(profile) {
  return {
    schemaVersion: 'midas.run-controls.v1',
    profiles: [profile]
  };
}

test('default MIDAS run-control policy passes', async () => {
  const result = await inspectRunControls(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(result.profiles.some((profile) => profile.id === 'focused-run'));
  assert.ok(result.profiles.some((profile) => profile.id === 'long-horizon-run'));
  assert.ok(result.profiles.some((profile) => profile.id === 'external-action-review'));
});

test('run-control validation rejects secret allowance', () => {
  const profile = clone(validProfile);
  profile.sandbox.secretsAllowed = true;
  const failures = validateRunControlPolicy(policy(profile));
  assert.ok(failures.some((failure) => failure.id === 'run-control:valid-run:secrets-allowed'));
});

test('run-control validation rejects unrestricted network values', () => {
  const profile = clone(validProfile);
  profile.sandbox.network = 'unrestricted';
  const failures = validateRunControlPolicy(policy(profile));
  assert.ok(failures.some((failure) => failure.id === 'run-control:valid-run:network'));
});

test('run-control validation requires high-risk approval gates', () => {
  const profile = clone(validProfile);
  profile.approvals.requiredFor = profile.approvals.requiredFor.filter((gate) => gate !== 'deploy');
  const failures = validateRunControlPolicy(policy(profile));
  assert.ok(failures.some((failure) => failure.id === 'run-control:valid-run:approval-required-for:required:deploy'));
});

test('run-control validation rejects external channels without approval', () => {
  const profile = clone(validProfile);
  profile.messageGateway.allowedChannels = ['local-files', 'email'];
  profile.messageGateway.requiresApprovalForExternal = false;
  const failures = validateRunControlPolicy(policy(profile));
  assert.ok(failures.some((failure) => failure.id === 'run-control:valid-run:gateway-external-approval'));
});

test('run-control validation requires subagent instruction packets', () => {
  const profile = clone(validProfile);
  profile.subagents.requiresInstructionPacket = false;
  const failures = validateRunControlPolicy(policy(profile));
  assert.ok(failures.some((failure) => failure.id === 'run-control:valid-run:subagents-instruction-packet'));
});

test('run-control validation rejects read-only profiles with write mutation', () => {
  const profile = clone(validProfile);
  profile.sandbox.filesystem = 'read-only';
  const failures = validateRunControlPolicy(policy(profile));
  assert.ok(failures.some((failure) => failure.id === 'run-control:valid-run:read-only-mutation'));
});

test('run-control validation requires run-ledger closeout', () => {
  const profile = clone(validProfile);
  profile.closeout.requiresRunLedger = false;
  const failures = validateRunControlPolicy(policy(profile));
  assert.ok(failures.some((failure) => failure.id === 'run-control:valid-run:closeout-run-ledger'));
});

test('installed workspace includes passing run controls', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-run-controls-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,operator-runtime',
    tools: 'codex',
    yes: true
  });
  const result = await inspectRunControls(temp);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'run-control', 'policy.json')));
  assert.ok(result.profiles.every((profile) => profile.approvalRequiredFor.includes('external-action')));
});
