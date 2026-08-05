import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import { resolveCustomize } from '../lib/customize.mjs';

const execFileAsync = promisify(execFile);
const cli = path.resolve('bin/midas.mjs');

async function makeWorkspace({ defaults, team, user, skill = 'work-order' } = {}) {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-customize-'));
  const skillDir = path.join(temp, '.midas', 'skills', skill);
  await fs.mkdir(skillDir, { recursive: true });
  if (defaults !== undefined) {
    await fs.writeFile(path.join(skillDir, 'customize.json'), JSON.stringify(defaults, null, 2));
  }
  if (team !== undefined) {
    await fs.writeFile(path.join(temp, '.midas', 'team.customize.json'), JSON.stringify(team, null, 2));
  }
  if (user !== undefined) {
    await fs.writeFile(path.join(temp, '.midas', 'user.customize.json'), JSON.stringify(user, null, 2));
  }
  return temp;
}

test('unknown skill fails closed', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-customize-none-'));
  const result = await resolveCustomize({ directory: temp, skill: 'no-such-skill' });
  assert.equal(result.status, 'fail');
  assert.match(result.error, /Unknown skill/);
});

test('default-only layer resolves with default provenance on every key', async () => {
  const temp = await makeWorkspace({
    defaults: { depthBand: 'quick-fix', evidence: { required: true }, reviewers: ['rook'] }
  });
  const result = await resolveCustomize({ directory: temp, skill: 'work-order' });
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.config, { depthBand: 'quick-fix', evidence: { required: true }, reviewers: ['rook'] });
  assert.equal(result.provenance.depthBand, 'default');
  assert.equal(result.provenance['evidence.required'], 'default');
  assert.equal(result.provenance.reviewers, 'default');
  assert.equal(result.layers.default.contributes, true);
  assert.equal(result.layers.team.found, false);
  assert.equal(result.layers.user.found, false);
});

test('precedence: user beats team beats default, per key', async () => {
  const temp = await makeWorkspace({
    defaults: { a: 1, b: 1, c: 1 },
    team: { 'work-order': { b: 2, c: 2 } },
    user: { 'work-order': { c: 3 } }
  });
  const result = await resolveCustomize({ directory: temp, skill: 'work-order' });
  assert.deepEqual(result.config, { a: 1, b: 2, c: 3 });
  assert.equal(result.provenance.a, 'default');
  assert.equal(result.provenance.b, 'team');
  assert.equal(result.provenance.c, 'user');
});

test('objects deep-merge: sibling keys from lower layers survive', async () => {
  const temp = await makeWorkspace({
    defaults: { gates: { tests: true, lint: true, pixels: false } },
    team: { 'work-order': { gates: { pixels: true } } }
  });
  const result = await resolveCustomize({ directory: temp, skill: 'work-order' });
  assert.deepEqual(result.config.gates, { tests: true, lint: true, pixels: true });
  assert.equal(result.provenance['gates.tests'], 'default');
  assert.equal(result.provenance['gates.lint'], 'default');
  assert.equal(result.provenance['gates.pixels'], 'team');
});

test('arrays replace wholesale, never merge', async () => {
  const temp = await makeWorkspace({
    defaults: { reviewers: ['rook', 'kai'], tags: ['a'] },
    user: { 'work-order': { reviewers: ['mira'] } }
  });
  const result = await resolveCustomize({ directory: temp, skill: 'work-order' });
  assert.deepEqual(result.config.reviewers, ['mira']);
  assert.deepEqual(result.config.tags, ['a']);
  assert.equal(result.provenance.reviewers, 'user');
  assert.equal(result.provenance.tags, 'default');
});

test('scalar overrides object and object overrides scalar, with provenance', async () => {
  const temp = await makeWorkspace({
    defaults: { limit: { soft: 5, hard: 10 }, mode: 'strict' },
    team: { 'work-order': { limit: 3, mode: { level: 'relaxed' } } }
  });
  const result = await resolveCustomize({ directory: temp, skill: 'work-order' });
  assert.equal(result.config.limit, 3);
  assert.deepEqual(result.config.mode, { level: 'relaxed' });
  assert.equal(result.provenance.limit, 'team');
  assert.equal(result.provenance['mode.level'], 'team');
});

test('explicit null overrides and is traceable', async () => {
  const temp = await makeWorkspace({
    defaults: { cap: 10 },
    user: { 'work-order': { cap: null } }
  });
  const result = await resolveCustomize({ directory: temp, skill: 'work-order' });
  assert.equal(result.config.cap, null);
  assert.equal(result.provenance.cap, 'user');
});

test('team/user files without this skill key contribute nothing', async () => {
  const temp = await makeWorkspace({
    defaults: { a: 1 },
    team: { 'other-skill': { a: 99 } }
  });
  const result = await resolveCustomize({ directory: temp, skill: 'work-order' });
  assert.deepEqual(result.config, { a: 1 });
  assert.equal(result.layers.team.found, true);
  assert.equal(result.layers.team.contributes, false);
});

test('malformed layer JSON warns instead of crashing', async () => {
  const temp = await makeWorkspace({ defaults: { a: 1 } });
  await fs.writeFile(path.join(temp, '.midas', 'team.customize.json'), '{ not json');
  const result = await resolveCustomize({ directory: temp, skill: 'work-order' });
  assert.equal(result.status, 'warn');
  assert.deepEqual(result.config, { a: 1 });
  assert.ok(result.findings.some((finding) => finding.layer === 'team'));
});

test('skill with no customize.json anywhere resolves to empty config', async () => {
  const temp = await makeWorkspace({});
  const result = await resolveCustomize({ directory: temp, skill: 'work-order' });
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.config, {});
  assert.deepEqual(result.provenance, {});
});

test('repo framework/skills fallback resolves for shipped skills', async () => {
  const result = await resolveCustomize({ directory: path.resolve('.'), skill: 'work-order' });
  assert.notEqual(result.status, 'fail');
});

test('cli: midas customize <skill> prints resolved config + provenance', async () => {
  const temp = await makeWorkspace({
    defaults: { depthBand: 'quick-fix' },
    user: { 'work-order': { depthBand: 'strategic-system' } }
  });
  const { stdout } = await execFileAsync(process.execPath, [cli, 'customize', 'work-order', '--directory', temp]);
  const result = JSON.parse(stdout.trim());
  assert.equal(result.config.depthBand, 'strategic-system');
  assert.equal(result.provenance.depthBand, 'user');
});

test('cli: midas customize without a skill errors', async () => {
  await assert.rejects(
    () => execFileAsync(process.execPath, [cli, 'customize']),
    (error) => {
      assert.match(error.stderr, /customize requires a skill name/);
      return true;
    }
  );
});
