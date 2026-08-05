import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { parseSkillMarkdown, validateSkillRecord } from '../lib/skill-library.mjs';

const skillFile = path.resolve('framework', 'skills', 'using-midas', 'SKILL.md');
const constitutionFile = path.resolve('framework', 'authority', 'default-constitution.json');

test('using-midas bootstrap passes the skill validator', async () => {
  const text = await fs.readFile(skillFile, 'utf8');
  const result = validateSkillRecord({
    directoryName: 'using-midas',
    relativeFile: 'framework/skills/using-midas/SKILL.md',
    text
  });
  assert.deepEqual(result.failures, []);
  assert.equal(result.status, 'pass');
});

test('using-midas description is a trigger contract, not a process summary', async () => {
  const { frontmatter } = parseSkillMarkdown(await fs.readFile(skillFile, 'utf8'));
  assert.match(frontmatter.description, /^Use when starting any session/);
});

test('using-midas body stays within the bootstrap budget and carries red flags', async () => {
  const { body } = parseSkillMarkdown(await fs.readFile(skillFile, 'utf8'));
  const lines = body.split('\n');
  assert.ok(lines.length <= 150, `bootstrap body is ${lines.length} lines; keep it under 150`);
  const redFlagRows = lines.filter((line) => /^\| "/.test(line));
  assert.ok(redFlagRows.length >= 8 && redFlagRows.length <= 10, `expected 8-10 red-flag rows, found ${redFlagRows.length}`);
});

test('using-midas renders the constitution authority order and invariants', async () => {
  // Drift guard: the bootstrap injects authority context as binding text, so it
  // must list exactly what default-constitution.json declares.
  const { body } = parseSkillMarkdown(await fs.readFile(skillFile, 'utf8'));
  const constitution = JSON.parse(await fs.readFile(constitutionFile, 'utf8'));
  for (const level of constitution.authorityOrder) {
    assert.ok(body.includes(level), `authority order entry missing from bootstrap: ${level}`);
  }
  for (const invariant of constitution.protectedInvariants) {
    assert.ok(body.includes(`**${invariant.id}**`), `protected invariant missing from bootstrap: ${invariant.id}`);
  }
});
