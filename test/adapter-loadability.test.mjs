import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import { mergeMidasBlock, extractMidasBlock, MIDAS_BLOCK_START } from '../lib/adapter-markers.mjs';

// A generated adapter is only useful if the target runtime actually loads it.
// Presence and character count are not evidence of that; these tests assert the
// shape each loader requires.

async function installInto(tools) {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-loadability-'));
  await installWorkspace({ directory: temp, modules: 'core', tools, yes: true });
  return temp;
}

test('claude-code adapter is a discoverable Claude Code skill', async () => {
  const temp = await installInto('claude-code');
  const file = path.join(temp, '.claude', 'skills', 'midas', 'SKILL.md');

  const text = await fs.readFile(file, 'utf8');

  // Claude Code loads .claude/skills/<name>/SKILL.md and requires YAML frontmatter
  // with name and description. A bare MIDAS.md without frontmatter is never loaded.
  assert.ok(text.startsWith('---\n'), 'SKILL.md must open with YAML frontmatter');
  const end = text.indexOf('\n---', 3);
  assert.ok(end > 0, 'frontmatter must be closed');

  const frontmatter = text.slice(4, end);
  assert.match(frontmatter, /^name: midas$/m, 'frontmatter needs a name');
  assert.match(frontmatter, /^description: .{40,}/m, 'frontmatter needs a usable description');

  // The skill directory name and the declared name must agree.
  assert.equal(path.basename(path.dirname(file)), 'midas');

  // Body survives the frontmatter.
  assert.match(text, /## Load Order/);
});

test('codex adapter is written into AGENTS.md, which is what Codex reads', async () => {
  const temp = await installInto('codex');
  const agents = await fs.readFile(path.join(temp, 'AGENTS.md'), 'utf8');
  assert.match(agents, /# MIDAS codex Adapter/);
  assert.ok(extractMidasBlock(agents), 'AGENTS.md must contain a delimited MIDAS block');

  // Nothing should be written to the old inert location.
  await assert.rejects(
    () => fs.stat(path.join(temp, '.codex', 'skills', 'midas', 'MIDAS.md')),
    'the superseded .codex path must no longer be generated'
  );
});

test('installing over an existing AGENTS.md preserves the project content', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-agents-merge-'));
  const original = '# Our Project\n\nDo not delete this line.\n';
  await fs.writeFile(path.join(temp, 'AGENTS.md'), original);

  await installWorkspace({ directory: temp, modules: 'core', tools: 'codex', yes: true });

  const merged = await fs.readFile(path.join(temp, 'AGENTS.md'), 'utf8');
  assert.match(merged, /Do not delete this line\./, 'existing guidance must survive install');
  assert.match(merged, /# MIDAS codex Adapter/, 'MIDAS block must be added');
});

test('reinstalling is idempotent and does not stack duplicate blocks', async () => {
  const temp = await installInto('codex');
  await installWorkspace({ directory: temp, modules: 'core', tools: 'codex', yes: true });

  const agents = await fs.readFile(path.join(temp, 'AGENTS.md'), 'utf8');
  const occurrences = agents.split(MIDAS_BLOCK_START).length - 1;
  assert.equal(occurrences, 1, 'reinstall must replace the block, not append another');
});

test('mergeMidasBlock handles empty, marked, and unmarked files', () => {
  assert.match(mergeMidasBlock('', 'BODY'), /BODY/);

  const withBlock = mergeMidasBlock('# Head\n', 'FIRST');
  assert.match(withBlock, /# Head/);

  const replaced = mergeMidasBlock(withBlock, 'SECOND');
  assert.match(replaced, /SECOND/);
  assert.doesNotMatch(replaced, /FIRST/, 'old block body must be replaced');
  assert.match(replaced, /# Head/, 'surrounding content must be preserved');
});
