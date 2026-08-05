import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectAdapterContracts } from '../lib/adapter-contracts.mjs';
import { installWorkspace } from '../lib/installer.mjs';
import { parseSkillMarkdown, validateSkillRecord } from '../lib/skill-library.mjs';

const adapterDirs = [
  '.codex/skills/midas',
  '.claude/skills/midas',
  '.cursor/rules/midas',
  '.opencode/midas',
  '.gemini/midas',
  '.github/copilot/midas'
];

async function installAll() {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-adapter-skill-'));
  const result = await installWorkspace({
    directory: temp,
    modules: 'core,software-dev,qa',
    tools: 'codex,claude-code,cursor,opencode,gemini,copilot',
    yes: true
  });
  return { temp, result };
}

test('installer emits a SKILL.md per adapter that passes the skill validator', async () => {
  const { temp, result } = await installAll();
  for (const dir of adapterDirs) {
    const relativeFile = `${dir}/SKILL.md`;
    const text = await fs.readFile(path.join(temp, relativeFile), 'utf8');
    const inspection = validateSkillRecord({
      directoryName: 'midas',
      relativeFile,
      text
    });
    assert.deepEqual(inspection.failures, []);
    assert.equal(inspection.status, 'pass');

    const { frontmatter, body } = parseSkillMarkdown(text);
    assert.equal(frontmatter.name, 'midas');
    assert.match(frontmatter.description, /^Use when working in this repository/);
    assert.equal(frontmatter.license, 'Apache-2.0');
    assert.match(body, /## Load Order/);
    assert.match(body, /## Permission Policy/);
    assert.match(body, /## Session Hooks/);
    assert.match(body, /hooks\/session-start\.mjs/);
    assert.ok(result.generated.includes(relativeFile), `generated list missing ${relativeFile}`);
  }
});

test('installer keeps MIDAS.md for one release with a deprecation note on top', async () => {
  const { temp } = await installAll();
  for (const dir of adapterDirs) {
    const text = await fs.readFile(path.join(temp, `${dir}/MIDAS.md`), 'utf8');
    assert.match(text, /^> DEPRECATED:/);
    assert.match(text, /superseded by the SKILL\.md/);
    // The full adapter contract body must survive the deprecation wrapper.
    assert.match(text, /## Load Order/);
    assert.match(text, /## Permission Policy/);
  }
  // The deprecation note must not push MIDAS.md over its adapter-contract budget.
  const contracts = await inspectAdapterContracts(temp);
  assert.deepEqual(contracts.failures, []);
  assert.equal(contracts.status, 'pass');
});
