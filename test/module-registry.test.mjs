import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { loadModuleRegistry, validateModuleManifest } from '../lib/module-registry.mjs';

test('module registry loads all public module manifests', async () => {
  const result = await loadModuleRegistry({ root: path.resolve('.') });
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.deepEqual(
    result.modules.map((module) => module.id),
    ['builder', 'core', 'operator-runtime', 'qa', 'software-dev']
  );
});

test('module manifest validation rejects unknown fields', () => {
  const failures = validateModuleManifest({
    id: 'bad-module',
    name: 'Bad Module',
    status: 'alpha',
    purpose: 'Exercise validator.',
    surprise: true
  });
  assert.ok(failures.some((failure) => failure.remediation.includes('Unknown module field')));
});
