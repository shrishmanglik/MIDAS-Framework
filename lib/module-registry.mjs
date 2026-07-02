import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowedStatuses = new Set(['alpha', 'beta', 'stable', 'deprecated']);
const optionalArrayFields = [
  'workflows',
  'commands',
  'guardrails',
  'controls',
  'lanes',
  'checks',
  'quality'
];
const allowedFields = new Set([
  'id',
  'name',
  'status',
  'purpose',
  ...optionalArrayFields
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function moduleFailure(file, reason) {
  return {
    id: 'module-registry:manifest',
    status: 'fail',
    file,
    remediation: reason
  };
}

export function validateModuleManifest(module, file = 'module.json') {
  const failures = [];

  if (!isPlainObject(module)) {
    return [moduleFailure(file, 'Module manifest must be a JSON object.')];
  }

  const required = ['id', 'name', 'status', 'purpose'];
  for (const field of required) {
    if (typeof module[field] !== 'string' || module[field].trim() === '') {
      failures.push(moduleFailure(file, `Module field "${field}" must be a non-empty string.`));
    }
  }

  if (typeof module.id === 'string' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(module.id)) {
    failures.push(moduleFailure(file, 'Module id must use lowercase letters, numbers, and hyphen separators.'));
  }

  if (typeof module.status === 'string' && !allowedStatuses.has(module.status)) {
    failures.push(moduleFailure(file, 'Module status must be alpha, beta, stable, or deprecated.'));
  }

  for (const field of Object.keys(module)) {
    if (!allowedFields.has(field)) {
      failures.push(moduleFailure(file, `Unknown module field "${field}".`));
    }
  }

  for (const field of optionalArrayFields) {
    if (module[field] === undefined) continue;
    if (!Array.isArray(module[field]) || module[field].some((item) => typeof item !== 'string' || item.trim() === '')) {
      failures.push(moduleFailure(file, `Module field "${field}" must be an array of non-empty strings.`));
    }
  }

  return failures;
}

export async function loadModuleRegistry(options = {}) {
  const root = path.resolve(options.root ?? packageRoot);
  const modulesDir = path.join(root, 'framework', 'modules');
  const entries = await fs.readdir(modulesDir, { withFileTypes: true });
  const modules = [];
  const failures = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(modulesDir, entry.name, 'module.json');
    const relative = path.relative(root, manifestPath).replaceAll('\\', '/');
    try {
      const text = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(text);
      const manifestFailures = validateModuleManifest(manifest, relative);
      failures.push(...manifestFailures);
      if (manifestFailures.length === 0) {
        modules.push({
          id: manifest.id,
          name: manifest.name,
          status: manifest.status,
          purpose: manifest.purpose,
          workflows: manifest.workflows ?? [],
          commands: manifest.commands ?? [],
          guardrails: manifest.guardrails ?? [],
          controls: manifest.controls ?? [],
          lanes: manifest.lanes ?? [],
          checks: manifest.checks ?? [],
          quality: manifest.quality ?? []
        });
      }
    } catch (error) {
      failures.push(moduleFailure(relative, `Unable to read or parse module manifest: ${error.message}`));
    }
  }

  modules.sort((left, right) => left.id.localeCompare(right.id));

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    root,
    modules,
    failures
  };
}
