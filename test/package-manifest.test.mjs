import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('public package manifest includes the Apache NOTICE file', async () => {
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
  assert.ok(packageJson.files.includes('NOTICE'));
});
