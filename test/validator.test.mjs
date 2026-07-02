import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { validateTarget } from '../lib/validator.mjs';

test('repository validator passes current public candidate', async () => {
  const result = await validateTarget(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
});

test('validator fails on sensitive absolute local path', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-boundary-'));
  await fs.writeFile(path.join(temp, 'package.json'), '{}');
  await fs.mkdir(path.join(temp, 'bin'));
  await fs.writeFile(path.join(temp, 'bin', 'midas.mjs'), '');
  const drive = 'C:';
  const segment = ['private', 'workspace'].join('-');
  const privateRoot = `${drive}/${segment}/example`;
  await fs.writeFile(path.join(temp, 'README.md'), `Bad path: ${privateRoot}`);
  const result = await validateTarget(temp);
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id.includes('private-root-path')));
});
