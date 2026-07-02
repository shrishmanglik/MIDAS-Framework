import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectProjectContext, writeContextSnapshot } from '../lib/context-inspector.mjs';
import { installWorkspace } from '../lib/installer.mjs';
import { validateTarget } from '../lib/validator.mjs';

test('installed workspace writes a passing context snapshot', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-context-'));
  await installWorkspace({ directory: temp, modules: 'core,software-dev', tools: 'codex,claude-code', yes: true });

  const inspection = await inspectProjectContext(temp);
  assert.equal(inspection.status, 'pass', JSON.stringify(inspection, null, 2));
  assert.deepEqual(inspection.manifest.modules, ['core', 'software-dev']);
  assert.deepEqual(inspection.manifest.tools, ['codex', 'claude-code']);
  assert.ok(inspection.interfaceQuality.surfaces.includes('product-interface'));
  assert.ok(inspection.qualityScorecard.components.includes('skill-library'));
  assert.ok(inspection.qualityScorecard.score >= 80);
  assert.equal(inspection.warnings.length, 0);
});

test('context inspection warns when snapshot is stale', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-context-stale-'));
  await installWorkspace({ directory: temp, modules: 'core', tools: 'codex', yes: true });
  await fs.appendFile(path.join(temp, '.midas', 'project-context.md'), '\n## Local Notes\n\n- Keep this note in sync.\n');

  const inspection = await inspectProjectContext(temp);
  assert.equal(inspection.status, 'warn');
  assert.ok(inspection.warnings.some((warning) => warning.id === 'context-snapshot:stale'));

  const validation = await validateTarget(temp);
  assert.equal(validation.status, 'pass');
  assert.ok(validation.checks.some((check) => check.id === 'workspace:context-health' && check.warnings > 0));
});

test('context --write equivalent refreshes stale snapshot', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-context-refresh-'));
  await installWorkspace({ directory: temp, modules: 'core', tools: 'codex', yes: true });
  await fs.appendFile(path.join(temp, '.midas', 'project-context.md'), '\n## Local Notes\n\n- Refreshed context note.\n');

  await writeContextSnapshot({ directory: temp });
  const inspection = await inspectProjectContext(temp);
  assert.equal(inspection.status, 'pass', JSON.stringify(inspection, null, 2));
});

test('context inspection fails when project context disagrees with manifest', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-context-mismatch-'));
  await installWorkspace({ directory: temp, modules: 'core,qa', tools: 'codex', yes: true });
  const contextFile = path.join(temp, '.midas', 'project-context.md');
  const text = await fs.readFile(contextFile, 'utf8');
  await fs.writeFile(contextFile, text.replace('- qa\n', ''));

  const inspection = await inspectProjectContext(temp);
  assert.equal(inspection.status, 'fail');
  assert.ok(inspection.failures.some((failure) => failure.id === 'context:modules-match'));
});
