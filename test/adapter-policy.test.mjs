import assert from 'node:assert/strict';
import test from 'node:test';
import { loadAdapterPolicy, renderAdapterPolicy, validateAdapterPolicy } from '../lib/adapter-policy.mjs';

test('default adapter permission policy loads and renders', async () => {
  const policy = await loadAdapterPolicy();
  const rendered = renderAdapterPolicy(policy);
  assert.match(rendered, /Permission Policy/);
  assert.match(rendered, /Approval Required For/);
  assert.match(rendered, /Evidence Required/);
});

test('adapter permission policy rejects incomplete shapes', () => {
  assert.throws(
    () => validateAdapterPolicy({ version: '0.1' }),
    /default_mode/
  );
});
