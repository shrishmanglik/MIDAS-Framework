import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectAdapterContracts } from '../lib/adapter-contracts.mjs';
import { installWorkspace } from '../lib/installer.mjs';
import { parseSkillMarkdown, validateSkillRecord } from '../lib/skill-library.mjs';

const loaderContractPaths = [
  'AGENTS.md',
  '.claude/skills/midas/SKILL.md',
  '.cursor/rules/midas/MIDAS.md',
  '.opencode/midas/MIDAS.md',
  '.gemini/midas/MIDAS.md',
  '.github/copilot/midas/MIDAS.md'
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

test('installer emits a loader-verified Claude Code skill that passes the skill validator', async () => {
  const { temp, result } = await installAll();
  const relativeFile = '.claude/skills/midas/SKILL.md';
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
});

test('installer preserves each runtime adapter contract path and does not create an inert Codex skill', async () => {
  const { temp, result } = await installAll();
  for (const relativeFile of loaderContractPaths) {
    await fs.access(path.join(temp, relativeFile));
    assert.ok(result.generated.includes(relativeFile), `generated list missing ${relativeFile}`);
  }
  const contracts = await inspectAdapterContracts(temp);
  assert.deepEqual(contracts.failures, []);
  assert.equal(contracts.status, 'pass');
  await assert.rejects(fs.access(path.join(temp, '.codex/skills/midas/SKILL.md')));
});
