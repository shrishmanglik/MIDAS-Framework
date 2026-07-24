import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';

const privateTerms = [
  ['M', 'D', 'S'].join(''),
  ['source', 'history'].join('-'),
  ['repo', 'by', 'repo'].join('-'),
  ['bench', 'mark'].join(''),
  ['B', 'M', 'A', 'D'].join('')
];
const privateTermsPattern = new RegExp(privateTerms.join('|'), 'i');

const adapterFiles = [
  'AGENTS.md',
  '.claude/skills/midas/SKILL.md',
  '.cursor/rules/midas/MIDAS.md',
  '.opencode/midas/MIDAS.md',
  '.gemini/midas/MIDAS.md',
  '.github/copilot/midas/MIDAS.md'
];

test('generated adapters share the MIDAS contract', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-adapters-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev,qa',
    tools: 'codex,claude-code,cursor,opencode,gemini,copilot',
    yes: true
  });

  for (const relative of adapterFiles) {
    const text = await fs.readFile(path.join(temp, relative), 'utf8');
    assert.match(text, /Read \.midas\/project-context\.md/);
    assert.match(text, /## Active Modules/);
    assert.match(text, /- core/);
    assert.match(text, /## Permission Policy/);
    assert.match(text, /Approval Required For/);
    assert.match(text, /Protected Content/);
    assert.match(text, /Evidence Required/);
    assert.doesNotMatch(text, privateTermsPattern);
  }
});
