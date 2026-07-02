import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import { loadProjectChecks, runProjectChecks, validateProjectChecksConfig } from '../lib/project-checks.mjs';
import { validateTarget } from '../lib/validator.mjs';

test('installed workspace includes project check config', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-checks-install-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,qa',
    tools: 'codex',
    yes: true
  });
  const config = await loadProjectChecks(temp);
  assert.equal(config.version, '0.1');
  const defaultCheck = config.checks.find((check) => check.id === 'project-tests');
  assert.equal(defaultCheck.command, 'node');
  assert.deepEqual(defaultCheck.args, ['--test']);
  assert.equal(defaultCheck.enabled, false);
});

test('project check config rejects blocked shell commands', async () => {
  const config = {
    version: '0.1',
    checks: [
      {
        id: 'bad-shell',
        command: 'powershell',
        args: ['-Command', 'Write-Output bad'],
        enabled: true
      }
    ]
  };
  assert.throws(
    () => validateProjectChecksConfig(config),
    /blocked shell/
  );
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-checks-blocked-'));
  await installWorkspace({ directory: temp, modules: 'core', tools: 'codex', yes: true });
  await fs.writeFile(path.join(temp, '.midas', 'checks.json'), JSON.stringify(config, null, 2));
  const result = await validateTarget(temp, { runChecks: true });
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'workspace:project-checks-config'));
});

test('validate can run enabled project checks', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-checks-run-'));
  await installWorkspace({ directory: temp, modules: 'core,qa', tools: 'codex', yes: true });
  const config = {
    version: '0.1',
    checks: [
      {
        id: 'node-smoke',
        command: 'node',
        args: ['-e', 'console.log("project check ok")'],
        cwd: '.',
        enabled: true,
        timeoutMs: 10000
      }
    ]
  };
  await fs.writeFile(path.join(temp, '.midas', 'checks.json'), JSON.stringify(config, null, 2));
  const result = await validateTarget(temp, { runChecks: true });
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(result.checks.some((check) => check.id === 'workspace:project-check:node-smoke' && check.status === 'pass'));
});

test('generated default project check is execFile safe when enabled', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-checks-default-run-'));
  await installWorkspace({ directory: temp, modules: 'core,qa', tools: 'codex', yes: true });
  await fs.writeFile(
    path.join(temp, 'project.test.mjs'),
    [
      "import assert from 'node:assert/strict';",
      "import test from 'node:test';",
      '',
      "test('project smoke', () => {",
      "  assert.equal(2 + 2, 4);",
      '});',
      ''
    ].join('\n')
  );
  const config = await loadProjectChecks(temp);
  config.checks[0].enabled = true;
  await fs.writeFile(path.join(temp, '.midas', 'checks.json'), JSON.stringify(config, null, 2));
  const result = await validateTarget(temp, { runChecks: true });
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(result.checks.some((check) => check.id === 'workspace:project-check:project-tests' && check.status === 'pass'));
});

test('validate reports failing project checks', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-checks-fail-'));
  await installWorkspace({ directory: temp, modules: 'core,qa', tools: 'codex', yes: true });
  const config = {
    version: '0.1',
    checks: [
      {
        id: 'node-fail',
        command: 'node',
        args: ['-e', 'process.exit(7)'],
        cwd: '.',
        enabled: true,
        timeoutMs: 10000
      }
    ]
  };
  await fs.writeFile(path.join(temp, '.midas', 'checks.json'), JSON.stringify(config, null, 2));
  const result = await validateTarget(temp, { runChecks: true });
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'workspace:project-check:node-fail'));
});
