import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

// Different agent runtimes look for different entrypoints: Codex reads AGENTS.md,
// Claude Code reads CLAUDE.md. Both must exist, and CLAUDE.md must delegate to
// AGENTS.md so the guidance cannot silently fork into two diverging copies.

test('AGENTS.md exists and carries the framework guide', async () => {
  const agents = await fs.readFile('AGENTS.md', 'utf8');
  assert.match(agents, /# MIDAS Framework/);
  for (const required of ['npm test', 'npm run validate', 'docs/public-boundary.md']) {
    assert.ok(agents.includes(required), `AGENTS.md must mention ${required}`);
  }
});

test('CLAUDE.md delegates to AGENTS.md instead of duplicating it', async () => {
  const claude = await fs.readFile('CLAUDE.md', 'utf8');
  assert.match(claude, /AGENTS\.md/, 'CLAUDE.md must point at AGENTS.md');

  // A pointer file, not a second guide. If this trips, the two have forked.
  const agents = await fs.readFile('AGENTS.md', 'utf8');
  assert.ok(
    claude.length < agents.length,
    'CLAUDE.md should stay a pointer; move new guidance into AGENTS.md'
  );
});

test('the public-boundary rule is restated in both entrypoints', async () => {
  const [agents, claude] = await Promise.all([
    fs.readFile('AGENTS.md', 'utf8'),
    fs.readFile('CLAUDE.md', 'utf8')
  ]);
  for (const [name, body] of [['AGENTS.md', agents], ['CLAUDE.md', claude]]) {
    assert.match(body, /public repository/i, `${name} must state that the repo is public`);
  }
});
