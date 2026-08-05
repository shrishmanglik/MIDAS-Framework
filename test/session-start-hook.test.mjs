import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const hookScript = path.resolve('hooks', 'session-start.mjs');

test('session-start emits valid JSON carrying the using-midas bootstrap', async () => {
  const { stdout } = await execFileAsync(process.execPath, [hookScript]);
  const output = JSON.parse(stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, 'SessionStart');
  const context = output.hookSpecificOutput.additionalContext;
  assert.match(context, /<MIDAS-BOOTSTRAP importance="critical">/);
  assert.match(context, /<\/MIDAS-BOOTSTRAP>$/);
  assert.match(context, /name: using-midas/);
  assert.match(context, /## The Trigger Law/);
  assert.match(context, /## Red Flags/);
  assert.match(context, /## Binding Authority Context/);
});

test('session-start degrades to empty context when the bootstrap skill is missing', async () => {
  // Copy the script somewhere with no framework/ tree beside it; the script
  // resolves the bootstrap relative to its own location, so this simulates a
  // broken or partial install.
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-hook-'));
  await fs.mkdir(path.join(temp, 'hooks'), { recursive: true });
  const orphanScript = path.join(temp, 'hooks', 'session-start.mjs');
  await fs.copyFile(hookScript, orphanScript);

  const { stdout, stderr } = await execFileAsync(process.execPath, [orphanScript]);
  const output = JSON.parse(stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.equal(output.hookSpecificOutput.additionalContext, '');
  assert.match(stderr, /bootstrap skill not readable/);
});

test('hooks.json wires session-start on startup, clear, and compact', async () => {
  const config = JSON.parse(await fs.readFile(path.resolve('hooks', 'hooks.json'), 'utf8'));
  const [entry] = config.hooks.SessionStart;
  assert.equal(entry.matcher, 'startup|clear|compact');
  assert.ok(entry.hooks.some((hook) => hook.type === 'command' && hook.command.includes('hooks/session-start.mjs')));
});
