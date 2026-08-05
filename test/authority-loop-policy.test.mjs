import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  loadAuthorityContracts,
  validateAuthorityContracts,
  inspectAuthorityContracts
} from '../lib/authority-contracts.mjs';

const constitutionFile = path.resolve('framework', 'authority', 'default-constitution.json');
const schemaFile = path.resolve('framework', 'authority', 'constitution.schema.json');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function loadDefault() {
  return JSON.parse(await fs.readFile(constitutionFile, 'utf8'));
}

test('default constitution loads with the wave-2 protected invariants present', async () => {
  const result = await loadAuthorityContracts();
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  const byId = new Map(result.constitution.protectedInvariants.map((invariant) => [invariant.id, invariant]));
  assert.ok(byId.has('tdd-negative-test-must-fail-prefix'));
  assert.ok(byId.has('verification-before-done'));
  assert.ok(byId.has('reviewer-session-independence'));
  assert.ok(byId.get('tdd-negative-test-must-fail-prefix').verification.includes('negative-test-red-run'));
  assert.ok(byId.get('verification-before-done').verification.includes('done-claim-evidence-check'));
  assert.ok(byId.get('reviewer-session-independence').verification.includes('reviewer-session-check'));
});

test('default constitution carries the loop policy and inspect surfaces it', async () => {
  const constitution = await loadDefault();
  assert.deepEqual(constitution.loopPolicy, {
    fixLoopMaxRounds: 5,
    escalation: 'route-up-on-cap'
  });
  const result = await inspectAuthorityContracts(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.deepEqual(result.loopPolicy, {
    fixLoopMaxRounds: 5,
    escalation: 'route-up-on-cap'
  });
});

test('validation enforces the new invariants when they are removed', async () => {
  const constitution = clone(await loadDefault());
  constitution.protectedInvariants = constitution.protectedInvariants.filter(
    (invariant) => invariant.id !== 'reviewer-session-independence'
  );
  const failures = validateAuthorityContracts(constitution);
  assert.ok(failures.some((failure) => failure.id === 'authority:constitution:protected-invariants:required:reviewer-session-independence'));

  constitution.protectedInvariants = constitution.protectedInvariants.filter(
    (invariant) => !['tdd-negative-test-must-fail-prefix', 'verification-before-done'].includes(invariant.id)
  );
  const moreFailures = validateAuthorityContracts(constitution);
  assert.ok(moreFailures.some((failure) => failure.id === 'authority:constitution:protected-invariants:required:tdd-negative-test-must-fail-prefix'));
  assert.ok(moreFailures.some((failure) => failure.id === 'authority:constitution:protected-invariants:required:verification-before-done'));
});

test('validation rejects out-of-range and unknown loop policy values', async () => {
  const zeroRounds = clone(await loadDefault());
  zeroRounds.loopPolicy.fixLoopMaxRounds = 0;
  assert.ok(validateAuthorityContracts(zeroRounds).some((failure) => failure.id === 'authority:loop-policy:fix-loop-max-rounds'));

  const fractionalRounds = clone(await loadDefault());
  fractionalRounds.loopPolicy.fixLoopMaxRounds = 2.5;
  assert.ok(validateAuthorityContracts(fractionalRounds).some((failure) => failure.id === 'authority:loop-policy:fix-loop-max-rounds'));

  const badEscalation = clone(await loadDefault());
  badEscalation.loopPolicy.escalation = 'ignore-the-cap';
  assert.ok(validateAuthorityContracts(badEscalation).some((failure) => failure.id === 'authority:loop-policy:escalation'));

  const unknownField = clone(await loadDefault());
  unknownField.loopPolicy.retryForever = true;
  assert.ok(validateAuthorityContracts(unknownField).some((failure) => failure.id === 'authority:constitution:loop-policy-field'));

  const notAnObject = clone(await loadDefault());
  notAnObject.loopPolicy = 'five rounds';
  assert.ok(validateAuthorityContracts(notAnObject).some((failure) => failure.id === 'authority:constitution:loop-policy'));
});

test('a constitution without loopPolicy still validates (workspace back-compat)', async () => {
  const constitution = clone(await loadDefault());
  delete constitution.loopPolicy;
  const failures = validateAuthorityContracts(constitution);
  assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
});

test('constitution JSON schema declares loopPolicy with the same bounds', async () => {
  const schema = JSON.parse(await fs.readFile(schemaFile, 'utf8'));
  const loopPolicy = schema.properties.loopPolicy;
  assert.ok(loopPolicy, 'schema missing loopPolicy property');
  assert.deepEqual(loopPolicy.required, ['fixLoopMaxRounds', 'escalation']);
  assert.equal(loopPolicy.additionalProperties, false);
  assert.equal(loopPolicy.properties.fixLoopMaxRounds.minimum, 1);
  assert.deepEqual(loopPolicy.properties.escalation.enum, ['route-up-on-cap']);
});
