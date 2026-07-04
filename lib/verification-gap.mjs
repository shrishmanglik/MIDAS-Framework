import fs from 'node:fs/promises';
import path from 'node:path';

const ignoredDirectories = new Set([
  '.git',
  '.midas',
  'node_modules',
  'coverage',
  'dist',
  'build',
  'tmp'
]);

const evidenceExtensions = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.py',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml'
]);

const stopWords = new Set([
  'about',
  'after',
  'against',
  'also',
  'before',
  'being',
  'between',
  'button',
  'could',
  'every',
  'from',
  'have',
  'into',
  'must',
  'need',
  'needs',
  'only',
  'should',
  'that',
  'their',
  'there',
  'this',
  'through',
  'user',
  'with',
  'without',
  'work'
]);

function normalizePath(value) {
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

async function walk(root, files = []) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else if (evidenceExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

function tokenize(text) {
  return [...text.toLowerCase().matchAll(/[a-z][a-z0-9-]{2,}/g)]
    .map((match) => match[0].replace(/^-+|-+$/g, ''))
    .filter((token) => token.length >= 4 && !stopWords.has(token));
}

function extractRequirements(text) {
  const requirements = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    const checkbox = trimmed.match(/^[-*]\s+\[[ xX]\]\s+(.+)$/);
    const match = checkbox
      ? checkbox
      : trimmed.match(/^[-*]\s+(REQ[-_ ]?\d+|AC[-_ ]?\d+|Requirement|Acceptance Criteria)\s*[:.-]\s+(.+)$/i) ??
        trimmed.match(/^(REQ[-_ ]?\d+|AC[-_ ]?\d+|Requirement|Acceptance Criteria)\s*[:.-]\s+(.+)$/i);
    if (!match) continue;
    let idCandidate = null;
    let textValue = match[1];
    if (checkbox) {
      const checkboxText = match[1].trim();
      const idMatch = checkboxText.match(/^(REQ[-_ ]?\d+|AC[-_ ]?\d+)\s*[:.-]\s+(.+)$/i);
      if (idMatch) {
        idCandidate = idMatch[1];
        textValue = idMatch[2];
      }
    } else if (match[1] && /^(REQ|AC)/i.test(match[1])) {
      idCandidate = match[1];
      textValue = match[2];
    }
    const id = idCandidate?.replace(/\s+/g, '-').toUpperCase() ?? `REQ-${String(requirements.length + 1).padStart(3, '0')}`;
    requirements.push({
      id,
      line: index + 1,
      text: textValue.trim(),
      tokens: [...new Set(tokenize(textValue))]
    });
  }
  return requirements;
}

async function findDefaultSpec(target) {
  const candidates = [
    'PRD.md',
    'docs/PRD.md',
    '.midas/PRD.md',
    '.midas/planning/PRD.md'
  ];
  for (const candidate of candidates) {
    const file = path.join(target, candidate);
    if (await exists(file)) return file;
  }

  const workorders = path.join(target, '.midas', 'workorders');
  if (await exists(workorders)) {
    const files = (await fs.readdir(workorders))
      .filter((file) => file.endsWith('.md'))
      .sort()
      .reverse();
    if (files[0]) return path.join(workorders, files[0]);
  }
  return null;
}

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function loadEvidenceFiles(target, specFile, explicitFiles) {
  const files = explicitFiles.length > 0
    ? explicitFiles.map((file) => path.resolve(target, file))
    : await walk(target);
  const normalizedSpec = path.resolve(specFile);
  const evidence = [];
  for (const file of files) {
    if (path.resolve(file) === normalizedSpec) continue;
    if (!await exists(file)) continue;
    const relative = normalizePath(path.relative(target, file));
    if (relative.startsWith('.midas/reports/')) continue;
    const text = await fs.readFile(file, 'utf8').catch(() => '');
    evidence.push({ file, relative, text, tokens: new Set(tokenize(text)) });
  }
  return evidence;
}

function traceRequirement(requirement, evidence) {
  const tokens = requirement.tokens;
  if (tokens.length === 0) {
    return {
      status: 'untestable',
      matchedTokens: [],
      files: []
    };
  }
  const threshold = Math.min(tokens.length, Math.max(2, Math.ceil(tokens.length * 0.45)));
  const matches = [];
  const matchedTokens = new Set();
  for (const item of evidence) {
    const localMatches = tokens.filter((token) => item.tokens.has(token));
    if (localMatches.length > 0) {
      matches.push({ file: item.relative, tokens: localMatches });
      for (const token of localMatches) matchedTokens.add(token);
    }
  }
  return {
    status: matchedTokens.size >= threshold ? 'traced' : 'gap',
    matchedTokens: [...matchedTokens].sort(),
    files: matches
      .filter((match) => match.tokens.length > 0)
      .sort((left, right) => right.tokens.length - left.tokens.length)
      .slice(0, 5)
      .map((match) => match.file)
  };
}

function receiptText(result) {
  const rows = result.requirements.map((requirement) => {
    const files = requirement.files.length > 0 ? requirement.files.join(', ') : 'NONE';
    const tokens = requirement.matchedTokens.length > 0 ? requirement.matchedTokens.join(', ') : 'NONE';
    return `| ${requirement.id} | ${requirement.status} | ${requirement.line} | ${requirement.text.replaceAll('|', '/')} | ${tokens} | ${files} |`;
  }).join('\n');

  return `# MIDAS Verification-Gap Receipt

Status: ${result.status}
Generated At: ${result.generatedAt}
Target: ${result.target}
Spec: ${result.spec}
Evidence Files Scanned: ${result.evidenceFiles}
Requirements Audited: ${result.requirements.length}
Gaps Found: ${result.gaps.length}

## Requirement Trace

| ID | Status | Spec Line | Requirement | Matched Tokens | Evidence Files |
|---|---|---:|---|---|---|
${rows || '| NONE | fail | 0 | No auditable requirements found. | NONE | NONE |'}

## Claim Ceiling

This receipt is a deterministic traceability check. It does not prove runtime correctness, UI quality, security, accessibility, provider readiness, or production release state.

## Required Follow-Up

${result.gaps.length === 0 && result.requirements.length > 0
  ? '- No deterministic requirement gaps were found by this check. Continue with tests, build, UI/runtime evidence, and human review where applicable.'
  : result.gaps.map((gap) => `- Implement or explicitly waive ${gap.id}: ${gap.text}`).join('\n')}
`;
}

export async function verifyCompletionGap(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const specFile = options.spec
    ? path.resolve(target, options.spec)
    : await findDefaultSpec(target);
  const generatedAt = new Date().toISOString();
  if (!specFile || !await exists(specFile)) {
    return {
      status: 'fail',
      generatedAt,
      target,
      spec: specFile ? normalizePath(path.relative(target, specFile)) : 'UNKNOWN',
      evidenceFiles: 0,
      requirements: [],
      gaps: [
        {
          id: 'SPEC-MISSING',
          text: 'No PRD, work order, or explicit --spec file was available for verification.'
        }
      ],
      receipt: null
    };
  }

  const specText = await fs.readFile(specFile, 'utf8');
  const requirements = extractRequirements(specText);
  const evidence = await loadEvidenceFiles(target, specFile, parseList(options['evidence-files'] ?? options.evidenceFiles));
  const traced = requirements.map((requirement) => ({
    ...requirement,
    ...traceRequirement(requirement, evidence)
  }));
  const gaps = traced.filter((requirement) => requirement.status !== 'traced');
  const status = requirements.length > 0 && gaps.length === 0 ? 'pass' : 'fail';
  const reportsDir = path.join(target, '.midas', 'reports');
  await fs.mkdir(reportsDir, { recursive: true });
  const receipt = path.join(reportsDir, 'verification-gap-receipt.md');
  const result = {
    status,
    generatedAt,
    target,
    spec: normalizePath(path.relative(target, specFile)),
    evidenceFiles: evidence.length,
    requirements: traced.map((requirement) => ({
      id: requirement.id,
      line: requirement.line,
      text: requirement.text,
      status: requirement.status,
      matchedTokens: requirement.matchedTokens,
      files: requirement.files
    })),
    gaps: gaps.map((gap) => ({ id: gap.id, text: gap.text, line: gap.line })),
    receipt: normalizePath(path.relative(target, receipt))
  };
  await fs.writeFile(receipt, receiptText(result));
  return result;
}
