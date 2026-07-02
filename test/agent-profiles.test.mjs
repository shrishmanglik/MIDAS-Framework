import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  evaluateAgentProfiles,
  inspectAgentProfiles,
  loadAgentProfiles,
  renderAgentProfiles,
  validateAgentProfilesShape
} from '../lib/agent-profiles.mjs';
import { installWorkspace } from '../lib/installer.mjs';

test('default agent profiles load and render', async () => {
  const profiles = await loadAgentProfiles();
  const evaluation = evaluateAgentProfiles(profiles);
  const rendered = renderAgentProfiles(profiles);
  assert.equal(evaluation.status, 'pass');
  assert.deepEqual(evaluation.requiredProfileIds, ['planner', 'builder', 'reviewer', 'researcher']);
  assert.match(rendered, /Agent Profiles/);
  assert.match(rendered, /planner/);
  assert.match(rendered, /builder/);
});

test('agent profile shape rejects unknown permissions', async () => {
  const profiles = await loadAgentProfiles();
  const copy = structuredClone(profiles);
  copy.profiles[0].permissions.danger = 'allow';
  assert.throws(
    () => validateAgentProfilesShape(copy),
    /unknown permission key/
  );
});

test('agent profile semantic guard rejects planner edit access', async () => {
  const profiles = await loadAgentProfiles();
  const copy = structuredClone(profiles);
  copy.profiles.find((profile) => profile.id === 'planner').permissions.edit = 'ask';
  const evaluation = evaluateAgentProfiles(copy);
  assert.equal(evaluation.status, 'fail');
  assert.ok(evaluation.failures.some((failure) => failure.id === 'agent-profiles:semantic:planner:edit'));
});

test('agent profile semantic guard rejects non-mutating task delegation', async () => {
  const profiles = await loadAgentProfiles();
  const copy = structuredClone(profiles);
  copy.profiles.find((profile) => profile.id === 'planner').permissions.task = 'allow';
  const evaluation = evaluateAgentProfiles(copy);
  assert.equal(evaluation.status, 'fail');
  assert.ok(evaluation.failures.some((failure) => failure.id === 'agent-profiles:semantic:planner:task'));
});

test('installed workspace includes passing agent profiles', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-agent-profiles-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev',
    tools: 'codex,opencode',
    yes: true
  });
  const inspection = await inspectAgentProfiles(temp);
  const adapter = await fs.readFile(path.join(temp, '.opencode', 'midas', 'MIDAS.md'), 'utf8');
  assert.equal(inspection.status, 'pass', JSON.stringify(inspection.failures, null, 2));
  assert.ok(inspection.profiles.some((profile) => profile.id === 'reviewer'));
  assert.match(adapter, /## Agent Profiles/);
});
