import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectAdapterContracts, loadAdapterContracts, validateAdapterContractsShape } from '../lib/adapter-contracts.mjs';
import { installWorkspace } from '../lib/installer.mjs';
import { validateTarget } from '../lib/validator.mjs';

test('default adapter contracts cover supported adapter paths', async () => {
  const config = await loadAdapterContracts();
  assert.equal(config.schemaVersion, 'midas.adapter-contracts.v1');
  assert.ok(config.contracts.some((contract) => contract.id === 'codex'));
  assert.ok(config.contracts.some((contract) => contract.adapterPath === '.github/copilot/midas/MIDAS.md'));
});

test('adapter contract shape rejects duplicate contracts', async () => {
  const config = await loadAdapterContracts();
  config.contracts.push({ ...config.contracts[0] });
  assert.throws(
    () => validateAdapterContractsShape(config),
    /Duplicate adapter contract/
  );
});

test('adapter contracts inspect only installed workspace adapters', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-adapter-contracts-'));
  await installWorkspace({ directory: temp, modules: 'core,qa', tools: 'codex', yes: true });

  const inspection = await inspectAdapterContracts(temp);
  assert.equal(inspection.status, 'pass', JSON.stringify(inspection, null, 2));
  assert.deepEqual(inspection.adapters.map((adapter) => adapter.id), ['codex']);

  const validation = await validateTarget(temp);
  assert.equal(validation.status, 'pass', JSON.stringify(validation.failures, null, 2));
});

test('adapter contracts fail when required adapter phrases are removed', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-adapter-contract-drift-'));
  await installWorkspace({ directory: temp, modules: 'core', tools: 'codex', yes: true });
  const adapterFile = path.join(temp, 'AGENTS.md');
  const text = await fs.readFile(adapterFile, 'utf8');
  await fs.writeFile(adapterFile, text.replace('Approval Required For', 'Approval Gate'));

  const inspection = await inspectAdapterContracts(temp);
  assert.equal(inspection.status, 'fail');
  assert.ok(inspection.failures.some((failure) => failure.id === 'adapter-contract:codex:phrase'));
});
