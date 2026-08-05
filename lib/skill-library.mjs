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
export const skillValidationModes = ['strict', 'interop'];
export const knownResourceDirectories = ['scripts', 'references', 'assets', 'agents'];
export const skillChecklistFileName = 'checklist.md';
export const skillChecklistMinItems = 3;
export const skillChecklistMaxItems = 40;
const checklistItemPattern = /^\s*[-*]\s\[[ xX]\]\s?(.*)$/;
const checklistCheckboxLikePattern = /^\s*[-*]\s\[/;
const descriptionProcessPattern = /\bstep\s+\d|\bfirst\b[^.;]*\bthen\b/i;
const progressiveDisclosureLineThreshold = 300;
const referenceTocHeadLines = 40;
const tocHeadingPattern = /^#{1,6}\s+.*(contents|table of)/i;
const negativeScopePattern = /\b(?:not\s+for|do\s+not|never\s+for)\b/i;

function resolveMode(mode) {
  if (mode === undefined || mode === null) return 'strict';
  if (!skillValidationModes.includes(mode)) {
    throw new Error(`Unknown skill validation mode: ${mode}. Supported: ${skillValidationModes.join(', ')}.`);
  }
  return mode;
}

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

function checkProgressiveDisclosure({ id, lineCount, resources, warnings }) {
  if (!resources) return;
  const directories = resources.directories ?? [];
  if (lineCount > progressiveDisclosureLineThreshold && !directories.includes('references')) {
    warnings.push({
      id: `skill:${id}:progressive-disclosure`,
      status: 'warn',
      remediation: `SKILL.md body is ${lineCount} lines with no references/ directory beside it; consider progressive disclosure — keep the body lean and move deep detail into references/.`
    });
  }
  for (const directory of directories) {
    if (!knownResourceDirectories.includes(directory)) {
      warnings.push({
        id: `skill:${id}:unknown-resource-dir`,
        status: 'warn',
        remediation: `Unknown resource directory "${directory}/". Recognized resource directories: ${knownResourceDirectories.map((name) => `${name}/`).join(', ')}.`
      });
    }
  }
  for (const reference of resources.referenceFiles ?? []) {
    if (reference.lineCount <= progressiveDisclosureLineThreshold) continue;
    const firstLines = reference.firstLines ?? [];
    if (!firstLines.some((line) => tocHeadingPattern.test(line))) {
      warnings.push({
        id: `skill:${id}:reference-toc`,
        status: 'warn',
        remediation: `${reference.path} is ${reference.lineCount} lines without a "Contents" or "Table of" heading in its first ${referenceTocHeadLines} lines; add a table of contents so agents can navigate it without loading the whole file.`
      });
    }
  }
}

export function lintSkillChecklist(text, id) {
  const failures = [];
  const items = [];
  const normalized = text.replace(/\r\n/g, '\n');
  for (const line of normalized.split('\n')) {
    if (!checklistCheckboxLikePattern.test(line)) continue;
    const match = line.match(checklistItemPattern);
    if (!match) {
      failures.push({
        id: `skill:${id}:checklist-malformed`,
        status: 'fail',
        remediation: `checklist.md line is checkbox-like but malformed (use "- [ ] item"): ${line.trim()}`
      });
      continue;
    }
    items.push(match[1].trim());
  }
  for (const item of items) {
    if (item === '') {
      failures.push({
        id: `skill:${id}:checklist-empty-item`,
        status: 'fail',
        remediation: 'checklist.md contains an empty checkbox item; every item must state a checkable fact.'
      });
    }
  }
  if (items.length < skillChecklistMinItems || items.length > skillChecklistMaxItems) {
    failures.push({
      id: `skill:${id}:checklist-count`,
      status: 'fail',
      remediation: `checklist.md must contain ${skillChecklistMinItems}-${skillChecklistMaxItems} checkbox items ("- [ ] ..."); found ${items.length}.`
    });
  }
  return { itemCount: items.length, items, failures };
}

export async function collectSkillResources(skillDirectory) {
  const resources = { directories: [], referenceFiles: [] };
  if (!await exists(skillDirectory)) return resources;
  const entries = await fs.readdir(skillDirectory, { withFileTypes: true });
  resources.directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  if (!resources.directories.includes('references')) return resources;
  const stack = [path.join(skillDirectory, 'references')];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!entry.isFile()) continue;
      const lines = (await fs.readFile(full, 'utf8')).replace(/\r\n/g, '\n').split('\n');
      resources.referenceFiles.push({
        path: relativePath(path.relative(skillDirectory, full)),
        lineCount: lines.length,
        firstLines: lines.slice(0, referenceTocHeadLines)
      });
    }
  }
  resources.referenceFiles.sort((a, b) => a.path.localeCompare(b.path));
  return resources;
}

export function validateSkillRecord({ directoryName, relativeFile, text, resources = null, checklist = null }, options = {}) {
  const mode = resolveMode(options.mode);
  const failures = [];
  const warnings = [];
  const hints = [];
  const strictGaps = [];
  let parsed;
  try {
    parsed = parseSkillMarkdown(text);
  } catch (error) {
    return {
      status: 'fail',
      validationMode: mode,
      skill: {
        id: directoryName,
        file: relativeFile
      },
      warnings: [],
      hints: [],
      strictGaps: [],
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
  // Strict-only findings: hard failures in strict mode, downgraded to warnings
  // (and reported as strictGaps) in interop mode.
  const strictFindings = [];
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
    strictFindings.push({
      id: `skill:${id}:description-trigger`,
      status: 'fail',
      remediation: 'Skill description must include a clear trigger phrase such as "Use when" or "Use for".'
    });
  }
  if (typeof frontmatter.license !== 'string' || frontmatter.license.trim() === '') {
    strictFindings.push({
      id: `skill:${id}:license`,
      status: 'fail',
      remediation: 'MIDAS skill packs must declare a license field or bundled license reference.'
    });
  }
  if (frontmatter.compatibility !== undefined && (frontmatter.compatibility.trim() === '' || frontmatter.compatibility.length > 500)) {
    strictFindings.push({
      id: `skill:${id}:compatibility`,
      status: 'fail',
      remediation: 'Skill compatibility must be 1-500 characters when present.'
    });
  }
  validateAllowedTools(frontmatter['allowed-tools'], strictFindings, id);
  if (body.length === 0) {
    strictFindings.push({
      id: `skill:${id}:body`,
      status: 'fail',
      remediation: 'SKILL.md must include instructions after frontmatter.'
    });
  }
  const lineCount = body.split(/\n/).length;
  if (lineCount > 500) {
    strictFindings.push({
      id: `skill:${id}:body-lines`,
      status: 'fail',
      remediation: `SKILL.md body is ${lineCount} lines; keep it under 500 lines and move details to references/.`
    });
  }
  validateSkillLinks(body, strictFindings, id);
  if (mode === 'strict') {
    failures.push(...strictFindings);
  } else {
    for (const finding of strictFindings) {
      warnings.push({ ...finding, status: 'warn', strictStatus: 'fail' });
      strictGaps.push({ ...finding, status: 'warn', strictStatus: 'fail' });
    }
  }
  warnOnSuspiciousBody(body, warnings, id);
  checkProgressiveDisclosure({ id, lineCount, resources, warnings });
  let checklistItemCount = null;
  if (checklist !== null) {
    const lint = lintSkillChecklist(checklist.text ?? '', id);
    checklistItemCount = lint.itemCount;
    failures.push(...lint.failures);
  }
  if (typeof frontmatter.description === 'string'
    && descriptionProcessPattern.test(frontmatter.description)) {
    warnings.push({
      id: `skill:${id}:description-process`,
      status: 'warn',
      remediation: 'Skill description appears to summarize the skill\'s process steps. Descriptions state capability + trigger ("Use when..."); the process belongs in the body.'
    });
  }
  if (typeof frontmatter.description === 'string' && frontmatter.description.trim() !== ''
    && !negativeScopePattern.test(frontmatter.description)) {
    hints.push({
      id: `skill:${id}:description-negative-scope`,
      status: 'info',
      remediation: 'Consider adding a negative-scope clause to the description ("not for", "Do NOT", "never for") so agents decline out-of-scope triggers.'
    });
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    validationMode: mode,
    skill: {
      id,
      file: relativeFile,
      descriptionChars: frontmatter.description?.length ?? 0,
      hasLicense: Boolean(frontmatter.license),
      compatibility: frontmatter.compatibility ?? null,
      allowedTools: frontmatter['allowed-tools'] ?? null,
      bodyLines: lineCount,
      hasChecklist: checklist !== null,
      checklistItems: checklistItemCount
    },
    warnings,
    hints,
    strictGaps,
    failures
  };
}

export async function inspectSkillLibrary(directory, options = {}) {
  const mode = resolveMode(options.mode);
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
      validationMode: mode,
      target,
      root: relativeRoot,
      skills: [],
      warnings: [],
      hints: [],
      strictGaps: [],
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
  const hints = [];
  const strictGaps = [];
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
    const checklistFile = path.join(dir, skillChecklistFileName);
    const checklist = await exists(checklistFile)
      ? {
        relativeFile: relativePath(path.relative(target, checklistFile)),
        text: await fs.readFile(checklistFile, 'utf8')
      }
      : null;
    const inspection = validateSkillRecord({
      directoryName,
      relativeFile,
      text: await fs.readFile(file, 'utf8'),
      resources: await collectSkillResources(dir),
      checklist
    }, { mode });
    skills.push(inspection.skill);
    warnings.push(...inspection.warnings);
    hints.push(...inspection.hints);
    strictGaps.push(...inspection.strictGaps);
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
    validationMode: mode,
    target,
    root: relativeRoot,
    skills,
    warnings,
    hints,
    strictGaps,
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
    const checklistSource = path.join(dir, skillChecklistFileName);
    if (await exists(checklistSource)) {
      const checklistDestination = path.join(destination, skillChecklistFileName);
      await fs.writeFile(checklistDestination, await fs.readFile(checklistSource, 'utf8'));
      generated.push(relativePath(path.relative(target, checklistDestination)));
    }
  }
  return generated;
}
