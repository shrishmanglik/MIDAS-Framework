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

test('validator distinguishes auth field declarations from literal secrets', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-secret-boundary-'));
  await fs.writeFile(path.join(temp, 'package.json'), '{}');
  await fs.mkdir(path.join(temp, 'bin'));
  await fs.writeFile(path.join(temp, 'bin', 'midas.mjs'), '');
  await fs.mkdir(path.join(temp, 'src'));
  await fs.writeFile(
    path.join(temp, 'src', 'auth.ts'),
    'export interface AuthResponse { access_token: string; refresh_token: string; password: string; }\n'
  );

  let result = await validateTarget(temp);
  assert.ok(!result.failures.some((failure) => failure.id.includes('secret-assignment')));

  const secretLine = ['const access_', 'token = ', '"hardcoded-token-value";\n'].join('');
  await fs.writeFile(path.join(temp, 'src', 'bad.ts'), secretLine);
  result = await validateTarget(temp);
  assert.ok(result.failures.some((failure) => failure.id.includes('secret-assignment')));
});

test('validator fails cleanly on partial workspace artifacts', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-partial-workspace-'));
  await fs.writeFile(path.join(temp, 'package.json'), '{}');
  await fs.mkdir(path.join(temp, 'bin'));
  await fs.writeFile(path.join(temp, 'bin', 'midas.mjs'), '');
  await fs.mkdir(path.join(temp, '.midas', 'reports'), { recursive: true });
  await fs.writeFile(path.join(temp, '.midas', 'reports', 'verification-gap-receipt.md'), '# Receipt');

  const result = await validateTarget(temp);
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'workspace:.midas/_config/manifest.yaml'));
  assert.ok(result.checks.some((check) => check.id === 'repo:package.json'));
});

test('validator fails on machine-local absolute paths', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-local-path-'));
  await fs.writeFile(path.join(temp, 'package.json'), '{}');
  await fs.mkdir(path.join(temp, 'bin'));
  await fs.writeFile(path.join(temp, 'bin', 'midas.mjs'), '');

  const spacedRoot = ['D:/Some', 'Workspace/notes/'].join(' ');
  await fs.writeFile(path.join(temp, 'README.md'), `Evidence path: ${spacedRoot}`);
  let result = await validateTarget(temp);
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id.includes('machine-local-path')));

  const profileRoot = ['C:/Use', 'rs/someone/project/file.txt'].join('');
  await fs.writeFile(path.join(temp, 'README.md'), `Evidence path: ${profileRoot}`);
  result = await validateTarget(temp);
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id.includes('machine-local-path')));

  await fs.writeFile(path.join(temp, 'README.md'), 'Neutral path: C:/tools/example.txt and relative ./docs/notes.md');
  result = await validateTarget(temp);
  assert.ok(!result.failures.some((failure) => failure.id.includes('machine-local-path')));
});

test('validator scans committed harness dot-directories', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-dot-dir-'));
  await fs.writeFile(path.join(temp, 'package.json'), '{}');
  await fs.mkdir(path.join(temp, 'bin'));
  await fs.writeFile(path.join(temp, 'bin', 'midas.mjs'), '');
  await fs.mkdir(path.join(temp, '.claude', 'skills'), { recursive: true });

  const internalPhrase = ['internal', 'framework'].join(' ');
  await fs.writeFile(
    path.join(temp, '.claude', 'skills', 'CLAUDE.md'),
    `This is the company ${internalPhrase} for building software.`
  );
  const result = await validateTarget(temp);
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id.includes('private-methodology-reference')));
});

test('validator still skips unlisted dot-directories and caches', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-dot-skip-'));
  await fs.writeFile(path.join(temp, 'package.json'), '{}');
  await fs.mkdir(path.join(temp, 'bin'));
  await fs.writeFile(path.join(temp, 'bin', 'midas.mjs'), '');
  await fs.mkdir(path.join(temp, '.cache'), { recursive: true });

  const internalPhrase = ['internal', 'framework'].join(' ');
  await fs.writeFile(path.join(temp, '.cache', 'notes.md'), `Cached ${internalPhrase} text.`);
  const result = await validateTarget(temp);
  assert.ok(!result.failures.some((failure) => failure.id.includes('private-methodology-reference')));
});

test('validator rejects internal work identifiers and organization-only references', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-internal-work-reference-'));
  await fs.writeFile(path.join(temp, 'package.json'), '{}');
  await fs.mkdir(path.join(temp, 'bin'));
  await fs.writeFile(path.join(temp, 'bin', 'midas.mjs'), '');

  const internalReferences = [
    ['MIDAS', 'BRIDGE', '004'].join('-'),
    ['MS', '1'].join('-'),
    ['MD', '4'].join('-'),
    ['dev', 'studio'].join('-'),
    ['operating', 'estate'].join(' ')
  ].join('\n');
  await fs.writeFile(path.join(temp, 'README.md'), internalReferences);

  const result = await validateTarget(temp);
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id.includes('internal-work-reference')));
});
