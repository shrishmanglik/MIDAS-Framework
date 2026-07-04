import fs from 'node:fs/promises';
import path from 'node:path';
import { inspectSkillLibrary, validateSkillRecord } from './skill-library.mjs';

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

export async function validateSkillPack(targetPath, options = {}) {
  const target = path.resolve(targetPath ?? '.');
  const skillFile = path.join(target, 'SKILL.md');
  if (await exists(skillFile)) {
    const inspection = validateSkillRecord({
      directoryName: path.basename(target),
      relativeFile: 'SKILL.md',
      text: await fs.readFile(skillFile, 'utf8')
    });
    return {
      status: inspection.status,
      target,
      mode: 'single-skill',
      strict: Boolean(options.strict),
      skills: [inspection.skill],
      warnings: inspection.warnings,
      failures: inspection.failures
    };
  }

  const library = await inspectSkillLibrary(target, { root: target });
  return {
    ...library,
    target,
    root: normalizePath(path.relative(target, path.resolve(target)) || '.'),
    mode: 'skill-library',
    strict: Boolean(options.strict)
  };
}
