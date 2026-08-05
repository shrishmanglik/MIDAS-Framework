import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { marketplaceSchemaVersion, validateMarketplace } from '../lib/pack.mjs';

test('shipped marketplace manifest passes with all references real on disk', async () => {
  const result = await validateMarketplace();
  assert.deepEqual(result.failures, []);
  assert.equal(result.status, 'pass');
  assert.deepEqual(
    result.bundles,
    [
      { id: 'discipline-skills', kind: 'skills', itemCount: 9 },
      { id: 'core-skills', kind: 'skills', itemCount: 7 },
      { id: 'agents-roster', kind: 'agents', itemCount: 14 }
    ]
  );
});

async function writeFixture(temp) {
  await fs.mkdir(path.join(temp, 'framework', 'skills', 'demo-skill'), { recursive: true });
  await fs.mkdir(path.join(temp, 'framework', 'agents', 'roster'), { recursive: true });
  await fs.writeFile(
    path.join(temp, 'framework', 'skills', 'demo-skill', 'SKILL.md'),
    '---\nname: demo-skill\ndescription: Demo. Use when testing.\nlicense: Apache-2.0\n---\nBody.\n'
  );
  await fs.writeFile(path.join(temp, 'framework', 'agents', 'roster', 'demo-agent.md'), '# demo-agent\n');
  await fs.writeFile(
    path.join(temp, 'framework', 'marketplace.json'),
    JSON.stringify({
      schemaVersion: marketplaceSchemaVersion,
      name: 'fixture-marketplace',
      description: 'Fixture manifest for reference-integrity tests.',
      bundles: [
        {
          id: 'fixture-skills',
          name: 'Fixture Skills',
          kind: 'skills',
          description: 'One real skill.',
          items: [{ id: 'demo-skill', path: 'framework/skills/demo-skill' }]
        },
        {
          id: 'fixture-agents',
          name: 'Fixture Agents',
          kind: 'agents',
          description: 'One real agent.',
          items: [{ id: 'demo-agent', path: 'framework/agents/roster/demo-agent.md' }]
        }
      ]
    }, null, 2)
  );
}

test('reference integrity fails when a referenced skill is removed from disk', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-marketplace-'));
  await writeFixture(temp);
  const before = await validateMarketplace({ directory: temp });
  assert.deepEqual(before.failures, []);
  assert.equal(before.status, 'pass');

  // Remove the referenced skill directory — the manifest entry is now a lie.
  await fs.rm(path.join(temp, 'framework', 'skills', 'demo-skill'), { recursive: true, force: true });
  const after = await validateMarketplace({ directory: temp });
  assert.equal(after.status, 'fail');
  assert.ok(after.failures.some((failure) => failure.id === 'marketplace:fixture-skills:demo-skill:paths-real'));
  await fs.rm(temp, { recursive: true, force: true });
});

test('reference integrity fails when a referenced agent file is removed', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-marketplace-agent-'));
  await writeFixture(temp);
  await fs.rm(path.join(temp, 'framework', 'agents', 'roster', 'demo-agent.md'), { force: true });
  const result = await validateMarketplace({ directory: temp });
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'marketplace:fixture-agents:demo-agent:paths-real'));
  await fs.rm(temp, { recursive: true, force: true });
});

test('traversal and absolute item paths are rejected before touching disk', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-marketplace-path-'));
  await writeFixture(temp);
  const manifestFile = path.join(temp, 'framework', 'marketplace.json');
  const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
  manifest.bundles[0].items.push({ id: 'escape', path: '../outside-skill' });
  await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2));
  const result = await validateMarketplace({ directory: temp });
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'marketplace:fixture-skills:escape:path'));
  await fs.rm(temp, { recursive: true, force: true });
});

test('missing manifest and wrong schemaVersion fail closed', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-marketplace-schema-'));
  const missing = await validateMarketplace({ directory: temp });
  assert.equal(missing.status, 'fail');
  assert.equal(missing.failures[0].id, 'marketplace:file');

  await writeFixture(temp);
  const manifestFile = path.join(temp, 'framework', 'marketplace.json');
  const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
  manifest.schemaVersion = 'midas.marketplace.v0';
  await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2));
  const wrongSchema = await validateMarketplace({ directory: temp });
  assert.equal(wrongSchema.status, 'fail');
  assert.ok(wrongSchema.failures.some((failure) => failure.id === 'marketplace:schema-version'));
  await fs.rm(temp, { recursive: true, force: true });
});
