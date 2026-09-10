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

// Evidence is classified, because "a file mentions these words" is not the same claim as "this
// behaviour is implemented and something would fail if it broke".
//
// The defect this fixes, reproduced 2026-09-10: a spec with two requirements and a NOTES.md that
// restated them in prose - including the sentence "NOTHING IS IMPLEMENTED YET. NO CODE HAS BEEN
// WRITTEN." - returned status `pass` with both requirements `traced`, because tracing counted token
// overlap against every file including markdown. That is a receipt terminating in another document
// that also just says so, shipped inside the one feature this framework exists for.
const testPathPatterns = [
  /(^|\/)tests?\//,
  /(^|\/)__tests__\//,
  /(^|\/)spec\//,
  /\.test\.[a-z]+$/,
  /\.spec\.[a-z]+$/,
  /(^|\/)test_[^/]+\.py$/,
  /_test\.[a-z]+$/
];

const proseExtensions = new Set(['.md', '.txt', '.rst']);
const configExtensions = new Set(['.json', '.yaml', '.yml']);

function classifyEvidence(relative) {
  const lower = relative.toLowerCase();
  if (testPathPatterns.some((pattern) => pattern.test(lower))) return 'test';
  const extension = path.extname(lower);
  if (proseExtensions.has(extension)) return 'prose';
  if (configExtensions.has(extension)) return 'config';
  return 'source';
}

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

// A comment is not an implementation and it is not a test. Stripping them first is what stops a
// commented-out function and a `// TODO: flag mismatches` from carrying a requirement's vocabulary.
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|\s)\/\/[^\n]*/g, ' ')
    .replace(/(^|\s)#[^\n]*/g, ' ');
}

// Symbols a source file offers to the outside world. A test that never mentions one of these is not
// exercising this code, whatever its title says.
const exportPatterns = [
  /\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
  /\bexport\s+(?:const|let|var|class)\s+([A-Za-z_$][\w$]*)/g,
  /\bexport\s+default\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/g,
  /\bexport\s*\{([^}]*)\}/g,
  /\bmodule\.exports\.([A-Za-z_$][\w$]*)/g,
  /\bexports\.([A-Za-z_$][\w$]*)/g,
  /^\s*def\s+([A-Za-z_][\w]*)/gm,
  /^\s*class\s+([A-Za-z_][\w]*)/gm
];

function exportedSymbols(code) {
  const found = new Set();
  for (const pattern of exportPatterns) {
    for (const match of code.matchAll(pattern)) {
      for (const part of match[1].split(',')) {
        const name = part.split(/\s+as\s+/i).pop().trim();
        if (/^[A-Za-z_$][\w$]*$/.test(name) && name.length >= 3) found.add(name);
      }
    }
  }
  return found;
}

// A test file is only evidence when something in it could actually fail. Skipped and todo tests are
// declarations of intent; a file of comments is not a test at all.
function hasLiveTest(code) {
  if (!/\b(?:test|it|describe)\s*\(/.test(code)) return false;
  return true;
}

function tokenize(text) {
  // Identifiers are split before lowercasing, so `reconcileCarrierPayroll` yields reconcile,
  // carrier and payroll instead of one meaningless token. Without this the tracer cannot see the
  // vocabulary of the code it is supposed to be tracing, and it was previously masked because
  // matches from every file were pooled: prose supplied the words that the source could not.
  const split = text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_]+/g, ' ')
    .toLowerCase();
  return [...split.matchAll(/[a-z][a-z0-9-]{2,}/g)]
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
    const kind = classifyEvidence(relative);
    // Source and test files are read with comments removed, so prose hidden inside code cannot
    // stand in for the code. Prose files keep their full text; they are context either way.
    const code = kind === 'source' || kind === 'test' ? stripComments(text) : text;
    evidence.push({
      file,
      relative,
      text,
      code,
      kind,
      tokens: new Set(tokenize(code)),
      symbols: kind === 'source' ? exportedSymbols(code) : new Set(),
      live: kind === 'test' ? hasLiveTest(code) : false
    });
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

  // Tokens are counted PER EVIDENCE KIND, never pooled. Pooling is what let prose satisfy a
  // requirement: markdown supplied the words and the total cleared the threshold without a line of
  // code existing.
  const perKind = { source: new Set(), test: new Set(), config: new Set(), prose: new Set() };
  const matches = { source: [], test: [], config: [], prose: [] };

  // Source first, because the symbols it exports decide which tests count.
  const matchedSource = evidence.filter((item) =>
    item.kind === 'source' && tokens.some((token) => item.tokens.has(token)));
  for (const item of matchedSource) {
    const localMatches = tokens.filter((token) => item.tokens.has(token));
    matches.source.push({ file: item.relative, tokens: localMatches });
    for (const token of localMatches) perKind.source.add(token);
  }
  const subjectSymbols = new Set();
  for (const item of matchedSource) for (const symbol of item.symbols) subjectSymbols.add(symbol);

  for (const item of evidence) {
    if (item.kind === 'source') continue;
    const localMatches = tokens.filter((token) => item.tokens.has(token));
    if (localMatches.length === 0) continue;
    if (item.kind === 'test') {
      // The rule that closed six false passes on 2026-09-10: a test whose TITLE carries the
      // requirement's words is not evidence. It has to touch the code. So the file must contain a
      // live test call, and must mention a symbol the matched implementation actually exports.
      // This is what separates a test that would fail if the behaviour broke from a test that
      // merely mentions the behaviour.
      if (!item.live) continue;
      if (subjectSymbols.size === 0) continue;
      const touchesSubject = [...subjectSymbols].some((symbol) => item.code.includes(symbol));
      if (!touchesSubject) continue;
    }
    matches[item.kind].push({ file: item.relative, tokens: localMatches });
    for (const token of localMatches) perKind[item.kind].add(token);
  }

  const rank = (kind) => matches[kind]
    .sort((left, right) => right.tokens.length - left.tokens.length)
    .slice(0, 5)
    .map((match) => match.file);

  const implemented = perKind.source.size >= threshold;
  // A test bar below the source bar, deliberately: test names are terser than requirement prose, so
  // demanding the same overlap would reject legitimate tests and push users to disable the gate.
  const testThreshold = Math.min(tokens.length, Math.max(2, Math.ceil(tokens.length * 0.3)));
  const exercised = perKind.test.size >= testThreshold;

  let status;
  if (!implemented) status = 'gap';
  else if (!exercised) status = 'implemented-untested';
  else status = 'traced';

  return {
    status,
    // Reported separately so a reader can see WHY it passed, and so prose is visibly not evidence.
    matchedTokens: [...new Set([...perKind.source, ...perKind.test])].sort(),
    files: rank('source'),
    testFiles: rank('test'),
    contextFiles: [...rank('prose'), ...rank('config')].slice(0, 5)
  };
}

function receiptText(result) {
  const rows = result.requirements.map((requirement) => {
    const files = requirement.files.length > 0 ? requirement.files.join(', ') : 'NONE';
    const tests = (requirement.testFiles ?? []).length > 0 ? requirement.testFiles.join(', ') : 'NONE';
    return `| ${requirement.id} | ${requirement.status} | ${requirement.line} | ${requirement.text.replaceAll('|', '/')} | ${files} | ${tests} |`;
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

| ID | Status | Spec Line | Requirement | Source Evidence | Test Evidence |
|---|---|---:|---|---|---|
${rows || '| NONE | fail | 0 | No auditable requirements found. | NONE | NONE |'}

Statuses: \`traced\` means source implements it AND a test file exercises it. \`implemented-untested\`
means source matched but no test did, and it does NOT pass. \`gap\` means no source matched.

## What does not count as evidence

Prose and configuration never establish a requirement. Markdown, text and JSON may restate a
requirement word for word while nothing is built, so they are recorded as context and excluded from
the trace. Only source files can implement a requirement and only test files can exercise it.

## Claim Ceiling

This receipt is a deterministic traceability check over file contents. It does not execute your
tests, so it cannot prove a matching test actually asserts the behaviour, and it does not prove
runtime correctness, UI quality, security, accessibility, provider readiness, or production release
state. It proves that an implementation file and a test file both carry the requirement's
vocabulary, which is a floor and not a guarantee.

## Required Follow-Up

${result.gaps.length === 0 && result.requirements.length > 0
  ? '- No deterministic requirement gaps were found by this check. Continue with tests, build, UI/runtime evidence, and human review where applicable.'
  : result.gaps.map((gap) => gap.status === 'implemented-untested'
      ? `- Write a test that would fail if ${gap.id} broke: ${gap.text}`
      : `- Implement or explicitly waive ${gap.id}: ${gap.text}`).join('\n')}
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
      files: requirement.files,
      testFiles: requirement.testFiles ?? [],
      contextFiles: requirement.contextFiles ?? []
    })),
    gaps: gaps.map((gap) => ({ id: gap.id, text: gap.text, line: gap.line, status: gap.status })),
    receipt: normalizePath(path.relative(target, receipt))
  };
  await fs.writeFile(receipt, receiptText(result));
  return result;
}
