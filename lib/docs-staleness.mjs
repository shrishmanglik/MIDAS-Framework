import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const sourcePrefixes = [
  'src/',
  'lib/',
  'bin/',
  'framework/'
];
const docsPrefixes = [
  'docs/',
  'README.md',
  'CONTRIBUTING.md',
  'release-plan.md'
];

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => normalizePath(item.trim()))
    .filter(Boolean);
}

async function gitChangedFiles(target, base = 'HEAD') {
  try {
    const { stdout } = await execFileAsync('git', ['diff', '--name-only', base, '--'], {
      cwd: target,
      timeout: 30000
    });
    return stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(normalizePath);
  } catch {
    return [];
  }
}

export async function inspectDocsStaleness(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const files = parseList(options.files).length > 0
    ? parseList(options.files)
    : await gitChangedFiles(target, options.base ?? 'HEAD');
  const sourceChanges = files.filter((file) => sourcePrefixes.some((prefix) => file === prefix.slice(0, -1) || file.startsWith(prefix)));
  const docsChanges = files.filter((file) => docsPrefixes.some((prefix) => file === prefix || file.startsWith(prefix)));
  const requiresDocs = sourceChanges.length > 0;
  const status = !requiresDocs || docsChanges.length > 0 ? 'pass' : 'fail';
  return {
    status,
    target,
    files,
    sourceChanges,
    docsChanges,
    requiresDocs,
    remediation: status === 'pass'
      ? ''
      : 'Source/framework files changed without matching docs, README, contribution, or release-plan updates.'
  };
}
