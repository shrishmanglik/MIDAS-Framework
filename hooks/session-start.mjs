#!/usr/bin/env node
// SessionStart hook: injects the using-midas bootstrap skill into new sessions
// (startup, clear, compact) so MIDAS discipline is present before the first
// action instead of depending on the agent choosing to read it.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bootstrapFile = path.join(packageRoot, 'framework', 'skills', 'using-midas', 'SKILL.md');

let additionalContext = '';
try {
  const text = await fs.readFile(bootstrapFile, 'utf8');
  additionalContext = [
    '<MIDAS-BOOTSTRAP importance="critical">',
    'The MIDAS bootstrap below is binding for this session.',
    'It is the full content of the using-midas skill; load every other MIDAS skill through your harness skill mechanism.',
    '',
    text.trim(),
    '</MIDAS-BOOTSTRAP>'
  ].join('\n');
} catch (error) {
  // A missing bootstrap must degrade, never block session startup — but say so
  // on stderr so the gap is visible instead of silently injecting nothing.
  process.stderr.write(`midas session-start: bootstrap skill not readable (${error.message}); injecting empty context.\n`);
}

// Claude Code hook contract: JSON on stdout with hookSpecificOutput.additionalContext.
process.stdout.write(`${JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext
  }
}, null, 2)}\n`);
