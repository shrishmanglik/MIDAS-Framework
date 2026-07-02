import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createHarnessInventory, inspectHarnessInventory, loadHarnessInventory, validateHarnessInventoryShape } from '../lib/harness-inventory.mjs';
import { installWorkspace } from '../lib/installer.mjs';
import { validateTarget } from '../lib/validator.mjs';

test('installed workspace writes a valid harness inventory', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-inventory-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev,qa',
    tools: 'codex,cursor',
    yes: true
  });

  const inventory = await loadHarnessInventory(temp);
  assert.equal(inventory.schemaVersion, 'midas.harness-inventory.v1');
  assert.deepEqual(inventory.adapters.map((adapter) => adapter.id), ['codex', 'cursor']);
  assert.equal(inventory.adapters[0].adapterPath, '.codex/skills/midas/MIDAS.md');
  assert.match(inventory.adapters[0].contentHash, /^sha256:[a-f0-9]{64}$/);
});

test('inventory inspection detects missing adapter files', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-inventory-drift-'));
  await installWorkspace({ directory: temp, modules: 'core', tools: 'codex', yes: true });
  await fs.rm(path.join(temp, '.codex', 'skills', 'midas', 'MIDAS.md'));

  const inspection = await inspectHarnessInventory(temp);
  assert.equal(inspection.status, 'fail');
  assert.ok(inspection.failures.some((failure) => failure.id === 'harness-inventory:adapter:codex'));

  const validation = await validateTarget(temp);
  assert.equal(validation.status, 'fail');
  assert.ok(validation.failures.some((failure) => failure.id === 'workspace:harness-inventory'));
});

test('inventory inspection detects changed adapter content', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-inventory-hash-'));
  await installWorkspace({ directory: temp, modules: 'core', tools: 'codex', yes: true });
  await fs.writeFile(path.join(temp, '.codex', 'skills', 'midas', 'MIDAS.md'), '# weakened adapter\n');

  const inspection = await inspectHarnessInventory(temp);
  assert.equal(inspection.status, 'fail');
  assert.ok(inspection.failures.some((failure) => failure.id === 'harness-inventory:adapter-hash:codex'));
});

test('inventory inspection rejects directories at adapter file paths', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-inventory-dir-'));
  await installWorkspace({ directory: temp, modules: 'core', tools: 'codex', yes: true });
  const adapterFile = path.join(temp, '.codex', 'skills', 'midas', 'MIDAS.md');
  await fs.rm(adapterFile);
  await fs.mkdir(adapterFile);

  const inspection = await inspectHarnessInventory(temp);
  assert.equal(inspection.status, 'fail');
  assert.ok(inspection.failures.some((failure) => failure.id === 'harness-inventory:adapter:codex'));
});

test('inventory shape rejects unsafe adapter paths', () => {
  const inventory = createHarnessInventory({
    modules: ['core'],
    tools: ['codex'],
    policyVersion: '0.1'
  });
  inventory.adapters[0].adapterPath = '../leak.md';
  assert.throws(
    () => validateHarnessInventoryShape(inventory),
    /workspace-relative path/
  );
});
