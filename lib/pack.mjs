import fs from 'node:fs/promises';
import path from 'node:path';

const bundleTargets = ['chatgpt-web', 'claude-web', 'gemini-web'];

function bundleText(target) {
  return `# MIDAS ${target} Bundle

Status: generated

Use this bundle as project context for planning or review. It is not a substitute for repository source, tests, or human approval.

## Operating Contract

- One active objective.
- Clear constraints.
- No secret values.
- No external or production actions without approval.
- Evidence before claims.
- Retrospective after meaningful work.
`;
}

export async function createBundle({ directory = '.', out }) {
  const target = path.resolve(directory);
  const bundleDir = path.resolve(out ?? path.join(target, '.midas', 'bundles'));
  await fs.mkdir(bundleDir, { recursive: true });
  const files = [];
  for (const bundle of bundleTargets) {
    const file = path.join(bundleDir, `${bundle}.md`);
    await fs.writeFile(file, bundleText(bundle));
    files.push(path.relative(target, file).replaceAll('\\', '/'));
  }
  return {
    status: 'packed',
    target,
    files
  };
}
