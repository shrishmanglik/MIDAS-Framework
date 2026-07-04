import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectDocsStaleness } from '../lib/docs-staleness.mjs';

test('docs staleness fails when source changes without docs', async () => {
  const result = await inspectDocsStaleness({
    directory: '.',
    files: 'lib/verification-gap.mjs'
  });
  assert.equal(result.status, 'fail');
  assert.equal(result.requiresDocs, true);
});

test('docs staleness passes when source and docs change together', async () => {
  const result = await inspectDocsStaleness({
    directory: '.',
    files: 'lib/verification-gap.mjs,docs/architecture.md'
  });
  assert.equal(result.status, 'pass');
});
