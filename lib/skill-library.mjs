import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const skillLibrarySchemaVersion = 'midas.skill-library.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultSkillsDir = path.join(packageRoot, 'framework', 'skills');
const blockedAllowedToolPatterns = [
  /\bBash\((rm|rmdir|del|format|shutdown|Remove-Item)\b/i,
  /\bBash\([^)]*\|[^)]*(sh|bash|powershell|pwsh)\b/i,
  /\bWrite\b/i
];
const suspiciousBodyPatterns = [
  /ignore\s+(all\s+)?approval/i,
  /skip\s+(human\s+)?review/i,
  /disable\s+.{0,60}verification/i,
  /without\s+(asking|confirmation)/i,
  /bypass\s+.{0,60}gate/i
];

function relativePath(value) {
  return value.replaceAll('\\', '/');
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function listSkillDirectories(root) {
  if (!await exists(root)) return [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

export function parseSkillMarkdown(text) {
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    throw new Error('SKILL.md must start with YAML frontmatter.');
  }
  const normalized = text.replace(/\r\n/g, '\n');
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) throw new Error('SKILL.md frontmatter must end with --- on its own line.');
  const rawFrontmatter = normalized.slice(4, end);
  const body = normalized.slice(end + 5).trim();
  const frontmatter = {};
  for (const line of rawFrontmatter.split('\n')) {
    if (line.trim() === '') continue;
    const match = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*?)\s*$/);
    if (!match) throw new Error(`Unsupported SKILL.md frontmatter line: ${line}`);
    frontmatter[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return { frontmatter, body };
}

function validSkillName(name) {
  return /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(name) && !name.includes('--');
}

function validateAllowedTools(value, failures, id) {
  if (value === undefined) return;
  if (typeof value !== 'string' || value.trim() === '') {
    failures.push({
      id: `skill:${id}:allowed-tools`,
      status: 'fail',
      remediation: 'allowed-tools must be a non-empty space-separated string when present.'
    });
    return;
  }
  for (const token of value.split(/\s+/).filter(Boolean)) {
    if (!/^[A-Za-z][A-Za-z0-9_-]*(\([A-Za-z0-9_.*:/ -]{1,120}\))?$/.test(token)) {
      failures.push({
        id: `skill:${id}:allowed-tools-token`,
        status: 'fail',
        remediation: `allowed-tools contains unsupported token: ${token}`
      });
    }
    if (blockedAllowedToolPatterns.some((pattern) => pattern.test(token))) {
      failures.push({
        id: `skill:${id}:allowed-tools-danger`,
        status: 'fail',
        remediation: `allowed-tools must not pre-approve destructive or shell-pipe tokens: ${token}`
      });
    }
  }
}

function validateSkillLinks(body, failures, id) {
  const links = [...body.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
  for (const link of links) {
    if (/^[a-z]+:/i.test(link)) continue;
    if (link.includes('..') || path.isAbsolute(link) || link.includes('\\')) {
      failures.push({
        id: `skill:${id}:reference-path`,
        status: 'fail',
        remediation: `Skill references must stay workspace-relative and forward-slash only: ${link}`
      });
    }
  }
}

function warnOnSuspiciousBody(body, warnings, id) {
  if (suspiciousBodyPatterns.some((pattern) => pattern.test(body))) {
    warnings.push({
      id: `skill:${id}:body-advisory`,
      status: 'warn',
      remediation: 'Review SKILL.md body for instructions that weaken approvals, human review, verification, or release gates.'
    });
  }
}

export function validateSkillRecord({ directoryName, relativeFile, text }) {
  const failures = [];
  const warnings = [];
  let parsed;
  try {
    parsed = parseSkillMarkdown(text);
  } catch (error) {
    return {
      status: 'fail',
      skill: {
        id: directoryName,
        file: relativeFile
      },
      warnings: [],
      failures: [
        {
          id: `skill:${directoryName}:frontmatter`,
          status: 'fail',
          remediation: error.message
        }
      ]
    };
  }

  const { frontmatter, body } = parsed;
  const id = frontmatter.name ?? directoryName;
  if (!validSkillName(frontmatter.name ?? '')) {
    failures.push({
      id: `skill:${id}:name`,
      status: 'fail',
      remediation: 'Skill name must be 1-64 lowercase letters, numbers, and hyphens; it cannot start/end with a hyphen or contain consecutive hyphens.'
    });
  }
  if (frontmatter.name !== directoryName) {
    failures.push({
      id: `skill:${id}:directory-match`,
      status: 'fail',
      remediation: `Skill name must match parent directory. Expected ${directoryName}.`
    });
  }
  if (typeof frontmatter.description !== 'string' || frontmatter.description.trim() === '' || frontmatter.description.length > 1024) {
    failures.push({
      id: `skill:${id}:description`,
      status: 'fail',
      remediation: 'Skill description must be 1-1024 characters.'
    });
  } else if (!/\bUse (when|for)\b/i.test(frontmatter.description)) {
    failures.push({
      id: `skill:${id}:description-trigger`,
      status: 'fail',
      remediation: 'Skill description must include a clear trigger phrase such as "Use when" or "Use for".'
    });
  }
  if (typeof frontmatter.license !== 'string' || frontmatter.license.trim() === '') {
    failures.push({
      id: `skill:${id}:license`,
      status: 'fail',
      remediation: 'MIDAS skill packs must declare a license field or bundled license reference.'
    });
  }
  if (frontmatter.compatibility !== undefined && (frontmatter.compatibility.trim() === '' || frontmatter.compatibility.length > 500)) {
    failures.push({
      id: `skill:${id}:compatibility`,
      status: 'fail',
      remediation: 'Skill compatibility must be 1-500 characters when present.'
    });
  }
  validateAllowedTools(frontmatter['allowed-tools'], failures, id);
  if (body.length === 0) {
    failures.push({
      id: `skill:${id}:body`,
      status: 'fail',
      remediation: 'SKILL.md must include instructions after frontmatter.'
    });
  }
  const lineCount = body.split(/\n/).length;
  if (lineCount > 500) {
    failures.push({
      id: `skill:${id}:body-lines`,
      status: 'fail',
      remediation: `SKILL.md body is ${lineCount} lines; keep it under 500 lines and move details to references/.`
    });
  }
  validateSkillLinks(body, failures, id);
  warnOnSuspiciousBody(body, warnings, id);

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    skill: {
      id,
      file: relativeFile,
      descriptionChars: frontmatter.description?.length ?? 0,
      hasLicense: Boolean(frontmatter.license),
      compatibility: frontmatter.compatibility ?? null,
      allowedTools: frontmatter['allowed-tools'] ?? null,
      bodyLines: lineCount
    },
    warnings,
    failures
  };
}

export async function inspectSkillLibrary(directory, options = {}) {
  const target = path.resolve(directory);
  const root = options.root
    ? path.resolve(options.root)
    : await exists(path.join(target, '.midas'))
      ? path.join(target, '.midas', 'skills')
      : path.join(target, 'framework', 'skills');
  const relativeRoot = relativePath(path.relative(target, root) || '.');
  if (!await exists(root)) {
    return {
      status: 'fail',
      target,
      root: relativeRoot,
      skills: [],
      failures: [
        {
          id: 'skill-library:root',
          status: 'fail',
          remediation: `Create skill library root: ${relativeRoot}`
        }
      ]
    };
  }

  const skills = [];
  const failures = [];
  const warnings = [];
  const directories = await listSkillDirectories(root);
  for (const dir of directories) {
    const directoryName = path.basename(dir);
    const file = path.join(dir, 'SKILL.md');
    const relativeFile = relativePath(path.relative(target, file));
    if (!await exists(file)) {
      failures.push({
        id: `skill:${directoryName}:file`,
        status: 'fail',
        remediation: `Create ${relativeFile}.`
      });
      continue;
    }
    const inspection = validateSkillRecord({
      directoryName,
      relativeFile,
      text: await fs.readFile(file, 'utf8')
    });
    skills.push(inspection.skill);
    warnings.push(...inspection.warnings);
    failures.push(...inspection.failures);
  }
  if (skills.length === 0) {
    failures.push({
      id: 'skill-library:empty',
      status: 'fail',
      remediation: 'Add at least one valid skill folder containing SKILL.md.'
    });
  }
  const ids = skills.map((skill) => skill.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  for (const id of new Set(duplicateIds)) {
    failures.push({
      id: `skill-library:duplicate:${id}`,
      status: 'fail',
      remediation: `Skill ids must be unique. Duplicate: ${id}`
    });
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: skillLibrarySchemaVersion,
    target,
    root: relativeRoot,
    skills,
    warnings,
    failures
  };
}

export async function copyDefaultSkills({ directory }) {
  const target = path.resolve(directory);
  const outRoot = path.join(target, '.midas', 'skills');
  await fs.mkdir(outRoot, { recursive: true });
  const generated = [];
  for (const dir of await listSkillDirectories(defaultSkillsDir)) {
    const skillName = path.basename(dir);
    const destination = path.join(outRoot, skillName);
    await fs.mkdir(destination, { recursive: true });
    const text = await fs.readFile(path.join(dir, 'SKILL.md'), 'utf8');
    const file = path.join(destination, 'SKILL.md');
    await fs.writeFile(file, text);
    generated.push(relativePath(path.relative(target, file)));
  }
  return generated;
}
