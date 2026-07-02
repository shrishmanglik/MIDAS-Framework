import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  inspectAuthorityContracts,
  validateAuthorityContracts
} from '../lib/authority-contracts.mjs';

const validConstitution = {
  schemaVersion: 'midas.authority.v1',
  authorityOrder: [
    'current-request',
    'project-constitution',
    'live-evidence',
    'verified-results',
    'approved-human-decision',
    'project-context',
    'work-order',
    'memory',
    'handoff'
  ],
  conflictPolicy: {
    higherAuthorityWins: true,
    liveEvidenceOverridesMemory: true,
    verifiedResultsOverrideSelfReport: true,
    markUnknownWhenUnverified: true,
    doNotInferSecrets: true
  },
  protectedInvariants: [
    {
      id: 'no-secret-read',
      statement: 'Secret material is never read, printed, summarized, or committed unless a separate approval explicitly authorizes the exact action.',
      owner: 'security',
      verification: ['secret-scan', 'workspace-validator']
    },
    {
      id: 'public-boundary',
      statement: 'Public framework files stay source-neutral and exclude non-public operating material, product-specific context, and unsupported public claims.',
      owner: 'maintainer',
      verification: ['public-boundary-scan', 'release-gate']
    },
    {
      id: 'evidence-before-claim',
      statement: 'Completion, release readiness, benchmark, security, and compatibility claims require recorded local evidence before closeout.',
      owner: 'reviewer',
      verification: ['run-ledger', 'test-suite', 'diff-inspection']
    },
    {
      id: 'approval-gates',
      statement: 'Deploys, public releases, public claims, money movement, destructive operations, external messages, and approval-policy changes require approval.',
      owner: 'owner',
      verification: ['approval-record', 'release-gate']
    }
  ],
  verificationPolicy: {
    beforeClaimingDone: [
      'run-local-checks',
      'inspect-diff',
      'record-evidence',
      'update-run-ledger',
      'no-unverified-claims'
    ],
    requiresFailedCheckRepairPacket: true,
    claimRequiresEvidence: true
  },
  escalationRules: [
    {
      id: 'destructive-action',
      trigger: 'Deleting, overwriting, rewriting history, or performing a hard-to-reverse local operation requires approval.',
      requiresApproval: true
    },
    {
      id: 'secret-or-credential-access',
      trigger: 'Reading, printing, forwarding, storing, or modifying secrets, credentials, tokens, environment files, or auth stores requires approval.',
      requiresApproval: true
    },
    {
      id: 'external-service-or-provider',
      trigger: 'Changing provider, auth, model route, endpoint, account, webhook, or external-service configuration requires approval.',
      requiresApproval: true
    },
    {
      id: 'public-claim-or-release',
      trigger: 'Publishing, pushing, packaging for public release, submitting a benchmark, or making public claims requires approval.',
      requiresApproval: true
    },
    {
      id: 'payment-or-money',
      trigger: 'Creating or changing prices, checkouts, invoices, subscriptions, refunds, charges, or other money-moving records requires approval.',
      requiresApproval: true
    },
    {
      id: 'deploy-or-migration',
      trigger: 'Deploying, migrating data, changing production schemas, or modifying live infrastructure requires approval.',
      requiresApproval: true
    }
  ],
  claimPolicy: {
    claimCeilings: ['local-validation', 'private-benchmark', 'public-benchmark', 'release-ready'],
    publicClaimsRequireApproval: true,
    benchmarkClaimsRequireRawResults: true,
    unknownsStayUnknown: true
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('default MIDAS authority constitution passes', async () => {
  const result = await inspectAuthorityContracts(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.equal(result.authorityOrder[0], 'current-request');
  assert.ok(result.protectedInvariants.some((invariant) => invariant.id === 'no-secret-read'));
  assert.ok(result.escalationRules.some((rule) => rule.id === 'public-claim-or-release'));
});

test('authority validation requires live evidence and verified results to outrank memory', () => {
  const constitution = clone(validConstitution);
  constitution.authorityOrder = [
    'current-request',
    'project-constitution',
    'memory',
    'handoff',
    'live-evidence',
    'verified-results'
  ];
  const failures = validateAuthorityContracts(constitution);
  assert.ok(failures.some((failure) => failure.id === 'authority:constitution:live-evidence-rank:memory'));
  assert.ok(failures.some((failure) => failure.id === 'authority:constitution:verified-results-rank:handoff'));
});

test('authority validation rejects missing protected invariants', () => {
  const constitution = clone(validConstitution);
  constitution.protectedInvariants = constitution.protectedInvariants.filter((invariant) => invariant.id !== 'public-boundary');
  const failures = validateAuthorityContracts(constitution);
  assert.ok(failures.some((failure) => failure.id === 'authority:constitution:protected-invariants:required:public-boundary'));
});

test('authority validation requires completion evidence discipline', () => {
  const constitution = clone(validConstitution);
  constitution.verificationPolicy.beforeClaimingDone = ['run-local-checks'];
  constitution.verificationPolicy.claimRequiresEvidence = false;
  const failures = validateAuthorityContracts(constitution);
  assert.ok(failures.some((failure) => failure.id === 'authority:verification-policy:before-claiming-done:required:inspect-diff'));
  assert.ok(failures.some((failure) => failure.id === 'authority:verification-policy:claim-requires-evidence'));
});

test('authority validation requires escalation for public claims and secret access', () => {
  const constitution = clone(validConstitution);
  constitution.escalationRules = constitution.escalationRules.filter((rule) => !['public-claim-or-release', 'secret-or-credential-access'].includes(rule.id));
  const failures = validateAuthorityContracts(constitution);
  assert.ok(failures.some((failure) => failure.id === 'authority:constitution:escalation-rules:required:public-claim-or-release'));
  assert.ok(failures.some((failure) => failure.id === 'authority:constitution:escalation-rules:required:secret-or-credential-access'));
});

test('authority validation requires benchmark claim ceilings and raw-result evidence', () => {
  const constitution = clone(validConstitution);
  constitution.claimPolicy.claimCeilings = ['release-ready'];
  constitution.claimPolicy.benchmarkClaimsRequireRawResults = false;
  const failures = validateAuthorityContracts(constitution);
  assert.ok(failures.some((failure) => failure.id === 'authority:claim-policy:claim-ceilings:required:local-validation'));
  assert.ok(failures.some((failure) => failure.id === 'authority:claim-policy:benchmark-claims-require-raw-results'));
});

test('installed workspace includes a passing authority constitution', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-authority-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,operator-runtime',
    tools: 'codex',
    yes: true
  });
  const result = await inspectAuthorityContracts(temp);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'authority', 'constitution.json')));
  assert.ok(result.claimCeilings.includes('private-benchmark'));
});
