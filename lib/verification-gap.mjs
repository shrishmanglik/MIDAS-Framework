import fs from 'node:fs/promises';
import path from 'node:path';

// Deterministic traceability: does a requirement in a spec correspond to an implementation and to
// something that would fail if that implementation broke?
//
// This file has been attacked twice and rewritten twice, and the history matters more than the code.
//
// 2026-09-10, first defect: a spec, a NOTES.md restating the requirements in prose, and no code at
// all returned `pass`. Token matches from every file were pooled, so markdown supplied the
// vocabulary. A receipt terminating in another document that also just says so.
//
// 2026-09-10, second round: an independent reviewer got SIXTEEN further deceptions through the fix,
// in four classes, and found the gate refused every pytest project on earth. Every one of those is
// addressed below and every one has a fixture in evals/deception. The classes were:
//
//   A  the symbol check was `code.includes(symbol)`, so a symbol MENTIONED in a comment, a string,
//      or an unused import counted as the code being exercised
//   B  classifyEvidence tested the PATH before the extension, so any .md under test/ or spec/ was
//      classified as a test and prose became evidence again through a different door
//   C  token overlap is not semantics: generic vocabulary matched unrelated code, and the symbol
//      donor did not have to be the same file that supplied the vocabulary
//   D  --evidence-files took any path, including outside the project, with no extension allowlist
//
// The rules that came out of it:
//   - content type beats location. A .md inside test/ is prose.
//   - a test counts only when it CALLS a symbol, or asserts on one, outside of strings and comments
//   - the symbol donor must be a source file that itself carried the requirement's vocabulary
//   - evidence files must live inside the project and be a type this tool can read
//
// What it still cannot do is in evals/deception/README.md, stated plainly, including the cases that
// are catchable in principle but not by reading files.

const ignoredDirectories = new Set([
  '.git',
  '.midas',
  'node_modules',
  'coverage',
  'dist',
  'build',
  'tmp',
  '.venv',
  'venv',
  '__pycache__',
  'vendor',
  'target'
]);

// Prose and data can never establish a requirement, whatever directory they sit in.
const proseExtensions = new Set(['.md', '.txt', '.rst', '.adoc']);
const configExtensions = new Set(['.json', '.yaml', '.yml', '.toml', '.ini']);
// Markup and styling describe presentation. They are read as context so a template restating a
// requirement cannot supply the vocabulary that lets an unrelated module donate a symbol (class C).
const markupExtensions = new Set(['.html', '.htm', '.css', '.scss', '.svg']);

// Languages the gate can actually read. Adding one means adding its comment style, its export
// shape and its test convention below; a language listed here with none of those would silently
// refuse every project written in it, which is the defect that made this list grow.
const sourceExtensions = new Set([
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx',
  '.py', '.go', '.rb', '.java', '.kt', '.rs', '.cs', '.php', '.swift', '.scala',
  '.c', '.h', '.cpp', '.hpp'
]);

const hashCommentLanguages = new Set(['.py', '.rb', '.sh', '.yaml', '.yml', '.toml']);

const readableExtensions = new Set([
  ...proseExtensions, ...configExtensions, ...markupExtensions, ...sourceExtensions
]);

const testPathPatterns = [
  /(^|\/)tests?\//,
  /(^|\/)__tests__\//,
  /(^|\/)spec\//,
  /\.test\.[a-z]+$/,
  /\.spec\.[a-z]+$/,
  /(^|\/)test_[^/]+\.[a-z]+$/,
  /_test\.[a-z]+$/,
  /(^|\/)[^/]*Test\.(java|kt|cs|scala)$/
];

// A test only counts when something in it could actually fail. These are per language because
// `def test_reconcile(...)` never matches a JavaScript test regex, and the first version of this
// file refused every pytest and unittest project on earth as a result.
const liveTestPatterns = [
  /\b(?:test|it|describe|bench)\s*\(/,              // node:test, jest, vitest, mocha, jasmine
  /^\s*def\s+test_\w+\s*\(/m,                       // pytest
  /^\s*(?:async\s+)?def\s+test\w*\s*\(\s*self/m,    // unittest methods
  /\bclass\s+Test\w+\s*[(:]/,                       // unittest / pytest classes
  /^\s*func\s+(?:Test|Benchmark|Fuzz)\w+\s*\(/m,    // go
  /@Test\b/,                                        // junit, testng
  /#\[\s*test\s*\]/,                                // rust
  /\[\s*Test(?:Method)?\s*\]/,                      // nunit, mstest
  /^\s*public\s+function\s+test\w+/m,               // phpunit
  /\b(?:expect|assert\w*)\s*\(/                     // a bare assertion is still a live check
];

const exportPatterns = [
  /\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
  /\bexport\s+(?:const|let|var|class)\s+([A-Za-z_$][\w$]*)/g,
  /\bexport\s+default\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/g,
  /\bexport\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/gm,          // export default identifier
  /\bexport\s*\{([^}]*)\}/g,
  /\bmodule\.exports\s*=\s*\{([^}]*)\}/g,                        // CommonJS object form
  /\bmodule\.exports\.([A-Za-z_$][\w$]*)/g,
  /\bmodule\.exports\s*=\s*([A-Za-z_$][\w$]*)\s*;?\s*$/gm,
  /\bexports\.([A-Za-z_$][\w$]*)/g,
  /^\s*(?:async\s+)?def\s+([A-Za-z_][\w]*)/gm,                   // python, ruby
  /^\s*class\s+([A-Za-z_][\w]*)/gm,
  /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_][\w]*)\s*\(/gm,         // go, including methods
  /^\s*pub\s+(?:async\s+)?fn\s+([A-Za-z_][\w]*)/gm,              // rust
  /\b(?:public|internal|protected)\s+(?:static\s+)?[\w<>\[\],\s]+?\s+([A-Za-z_][\w]*)\s*\(/g,
  /^\s*(?:public\s+|private\s+|protected\s+)?function\s+([A-Za-z_][\w]*)\s*\(/gm
];

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function classifyEvidence(relative) {
  const lower = relative.toLowerCase();
  const extension = path.extname(lower);
  // CONTENT TYPE BEATS LOCATION. This ordering is the fix for deception class B: the previous
  // version checked the path first, so tests/PLAN.md, spec/notes.md and test/fixtures/cases.json
  // were all classified as tests, and prose became evidence again through a directory name.
  if (proseExtensions.has(extension)) return 'prose';
  if (configExtensions.has(extension)) return 'config';
  if (markupExtensions.has(extension)) return 'markup';
  if (testPathPatterns.some((pattern) => pattern.test(lower))) return 'test';
  return 'source';
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
    } else if (readableExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

// A comment is not an implementation and it is not a test. The `#` rule is applied only to
// languages that use it, because stripping it from JavaScript ate `#privateField` declarations and
// stripping it from CSS ate every id selector.
function stripComments(text, extension) {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|\s)\/\/[^\n]*/g, ' ');
  if (hashCommentLanguages.has(extension)) out = out.replace(/(^|\s)#[^\n]*/g, ' ');
  return out;
}

// String literals are where a deceptive test hides its evidence: a symbol named inside a test title
// or a comment-shaped string looks identical to a symbol being used, to a substring search.
function stripStrings(code) {
  return code
    .replace(/"""[\s\S]*?"""/g, ' ')
    .replace(/'''[\s\S]*?'''/g, ' ')
    .replace(/`(?:\\.|[^`\\])*`/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, ' ')
    .replace(/'(?:\\.|[^'\\])*'/g, ' ');
}

function exportedSymbols(code) {
  const found = new Set();
  for (const pattern of exportPatterns) {
    for (const match of code.matchAll(pattern)) {
      for (const part of (match[1] ?? '').split(',')) {
        const name = part.split(/\s+as\s+/i).pop().trim().replace(/[:=].*$/, '').trim();
        if (/^[A-Za-z_$][\w$]*$/.test(name) && name.length >= 2) found.add(name);
      }
    }
  }
  return found;
}

function hasLiveTest(code) {
  return liveTestPatterns.some((pattern) => pattern.test(code));
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Deception class A. `code.includes(symbol)` accepted a symbol that appeared in a comment, inside a
// string, or in an unused import. A test is evidence when it CALLS the thing or asserts about it,
// so that is what is checked, against code with comments and strings already removed.
function testExercises(code, symbols) {
  const bare = stripStrings(code);
  const lines = bare.split('\n');
  for (const symbol of symbols) {
    const escaped = escapeForRegExp(symbol);
    const called = new RegExp(`(?:\\b|\\.)${escaped}\\s*\\(`).test(bare) ||
      new RegExp(`\\b${escaped}\\s*\\.\\s*\\w+\\s*\\(`).test(bare);
    if (called) return symbol;
    // An assertion ABOUT the symbol counts, because a test can legitimately assert on an exported
    // constant without calling anything. A bare truthiness check does not: `assert.ok(glossary)`
    // proves the import resolved and nothing else, and it is exactly how a dictionary of the spec's
    // own vocabulary was passing itself off as an implementation.
    const trivial = new RegExp(
      `(?:assert(?:\\.ok|\\.isOk|\\.isDefined)?|expect)\\s*\\(\\s*${escaped}\\s*\\)\\s*` +
      `(?:;|$|\\.(?:toBeTruthy|toBeDefined|toBeInstanceOf)\\s*\\()`, 'm');
    const asserted = lines.some((line) =>
      /\b(?:assert\w*|expect|should|verify)\b/i.test(line) &&
      new RegExp(`\\b${escaped}\\b`).test(line) &&
      !trivial.test(line));
    if (asserted) return symbol;
  }
  return null;
}

const stopWords = new Set([
  'about', 'after', 'against', 'also', 'before', 'being', 'between', 'button', 'could', 'every',
  'from', 'have', 'into', 'must', 'need', 'needs', 'only', 'should', 'that', 'their', 'there',
  'this', 'through', 'user', 'with', 'without', 'work'
]);

function tokenize(text) {
  // Identifiers are split before lowercasing, so `reconcileCarrierPayroll` yields reconcile,
  // carrier and payroll instead of one meaningless token. Without this the tracer cannot see the
  // vocabulary of the code it is tracing.
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
  const candidates = ['PRD.md', 'docs/PRD.md', '.midas/PRD.md', '.midas/planning/PRD.md'];
  for (const candidate of candidates) {
    const file = path.join(target, candidate);
    if (await exists(file)) return file;
  }
  const workorders = path.join(target, '.midas', 'workorders');
  if (await exists(workorders)) {
    const files = (await fs.readdir(workorders)).filter((file) => file.endsWith('.md')).sort().reverse();
    if (files[0]) return path.join(workorders, files[0]);
  }
  return null;
}

function parseList(value) {
  if (!value) return [];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

async function loadEvidenceFiles(target, specFile, explicitFiles) {
  // Deception class D: --evidence-files accepted any path, so a caller could point the gate at
  // another repository's implementation and pass a project containing only a spec. Evidence has to
  // live inside the project under test and be a file type this tool can actually read.
  const rejected = [];
  let files;
  if (explicitFiles.length > 0) {
    files = [];
    for (const entry of explicitFiles) {
      const resolved = path.resolve(target, entry);
      const relative = path.relative(target, resolved);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        rejected.push({ file: entry, reason: 'outside the project directory' });
        continue;
      }
      if (!readableExtensions.has(path.extname(resolved).toLowerCase())) {
        rejected.push({ file: entry, reason: 'not a file type this check can read' });
        continue;
      }
      files.push(resolved);
    }
  } else {
    files = await walk(target);
  }

  const normalizedSpec = path.resolve(specFile);
  const evidence = [];
  for (const file of files) {
    if (path.resolve(file) === normalizedSpec) continue;
    if (!await exists(file)) continue;
    const relative = normalizePath(path.relative(target, file));
    let text;
    try {
      text = await fs.readFile(file, 'utf8');
    } catch (error) {
      // An unreadable file is reported, never silently treated as empty. The previous version
      // swallowed every read error into "" and a permission failure looked like a clean non-match.
      rejected.push({ file: relative, reason: `unreadable: ${error.code ?? error.message}` });
      continue;
    }
    const kind = classifyEvidence(relative);
    const extension = path.extname(relative).toLowerCase();
    const code = kind === 'source' || kind === 'test' ? stripComments(text, extension) : text;
    evidence.push({
      relative,
      code,
      kind,
      tokens: new Set(tokenize(code)),
      symbols: kind === 'source' ? exportedSymbols(code) : new Set(),
      live: kind === 'test' ? hasLiveTest(code) : false
    });
  }
  return { evidence, rejected };
}

function traceRequirement(requirement, evidence) {
  const tokens = requirement.tokens;
  if (tokens.length === 0) {
    return { status: 'untestable', matchedTokens: [], files: [], testFiles: [], contextFiles: [] };
  }
  // Floor raised from 2 to 3. At two tokens a requirement written in generic vocabulary was
  // satisfied by unrelated code in any real repository (deception class C1).
  const threshold = Math.min(tokens.length, Math.max(3, Math.ceil(tokens.length * 0.45)));
  const testThreshold = Math.min(tokens.length, Math.max(2, Math.ceil(tokens.length * 0.3)));

  const sourceMatches = [];
  const sourceTokens = new Set();
  for (const item of evidence) {
    if (item.kind !== 'source') continue;
    const local = tokens.filter((token) => item.tokens.has(token));
    if (local.length === 0) continue;
    sourceMatches.push({ file: item.relative, tokens: local, symbols: item.symbols });
    for (const token of local) sourceTokens.add(token);
  }

  // Deception class C3: symbols were pooled across every source file that shared a single token, so
  // vocabulary could come from an HTML template while the symbol came from an unrelated module.
  // Only a file that genuinely carries the requirement's vocabulary may donate a symbol.
  const subjectSymbols = new Set();
  for (const match of sourceMatches) {
    if (match.tokens.length < 2) continue;
    for (const symbol of match.symbols) subjectSymbols.add(symbol);
  }

  const testMatches = [];
  const testTokens = new Set();
  const contextFiles = [];
  for (const item of evidence) {
    const local = tokens.filter((token) => item.tokens.has(token));
    if (local.length === 0) continue;
    if (item.kind === 'source') continue;
    if (item.kind !== 'test') {
      contextFiles.push(item.relative);
      continue;
    }
    if (!item.live) continue;
    const exercised = subjectSymbols.size > 0 ? testExercises(item.code, subjectSymbols) : null;
    if (!exercised) continue;
    testMatches.push({ file: item.relative, tokens: local, symbol: exercised });
    for (const token of local) testTokens.add(token);
  }

  const rank = (list) => list
    .sort((left, right) => right.tokens.length - left.tokens.length)
    .slice(0, 5)
    .map((match) => match.file);

  const implemented = sourceTokens.size >= threshold;
  const exercised = testTokens.size >= testThreshold;

  let status;
  if (!implemented) status = 'gap';
  else if (!exercised) status = 'implemented-untested';
  else status = 'traced';

  return {
    status,
    // Source and test matches are reported separately. Unioning them let the receipt over-report
    // how much of a requirement the implementation actually covered.
    matchedTokens: [...sourceTokens].sort(),
    testMatchedTokens: [...testTokens].sort(),
    files: rank(sourceMatches),
    testFiles: rank(testMatches),
    contextFiles: contextFiles.slice(0, 5)
  };
}

function receiptText(result) {
  const rows = result.requirements.map((requirement) => {
    const files = requirement.files.length > 0 ? requirement.files.join(', ') : 'NONE';
    const tests = (requirement.testFiles ?? []).length > 0 ? requirement.testFiles.join(', ') : 'NONE';
    return `| ${requirement.id} | ${requirement.status} | ${requirement.line} | ${requirement.text.replaceAll('|', '/')} | ${files} | ${tests} |`;
  }).join('\n');

  const rejected = (result.rejectedEvidence ?? []).length > 0
    ? `\n## Evidence that was refused\n\n${result.rejectedEvidence.map((item) => `- ${item.file}: ${item.reason}`).join('\n')}\n`
    : '';

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

Statuses: \`traced\` means source implements it AND a test calls or asserts on a symbol that source
exports. \`implemented-untested\` means source matched but no qualifying test did, and it does NOT
pass. \`gap\` means no source matched. \`untestable\` means the requirement carried no distinctive
vocabulary to trace.
${rejected}
## What does not count as evidence

Prose, data and markup never establish a requirement, whatever directory they sit in: a Markdown
file inside \`test/\` is still prose. A test counts only when it calls a symbol the matched
implementation exports, or asserts on one, outside strings and comments.

## Claim Ceiling

This is a deterministic traceability check over file contents. It does not execute your tests, so
it cannot prove a matching test asserts the right thing, that it is not skipped at runtime, or that
the implementation it calls does anything. It does not prove runtime correctness, security,
accessibility or release state. Known deceptions it cannot detect are listed in
\`evals/deception/README.md\`; that list is maintained deliberately and is not claimed to be
complete.

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
  const specFile = options.spec ? path.resolve(target, options.spec) : await findDefaultSpec(target);
  const generatedAt = new Date().toISOString();
  if (!specFile || !await exists(specFile)) {
    return {
      status: 'fail',
      generatedAt,
      target,
      spec: specFile ? normalizePath(path.relative(target, specFile)) : 'UNKNOWN',
      evidenceFiles: 0,
      requirements: [],
      gaps: [{
        id: 'SPEC-MISSING',
        status: 'spec-missing',
        text: 'No PRD, work order, or explicit --spec file was available for verification.'
      }],
      rejectedEvidence: [],
      receipt: null
    };
  }

  const specText = await fs.readFile(specFile, 'utf8');
  const requirements = extractRequirements(specText);
  const { evidence, rejected } = await loadEvidenceFiles(
    target, specFile, parseList(options['evidence-files'] ?? options.evidenceFiles));
  const traced = requirements.map((requirement) => ({
    ...requirement,
    ...traceRequirement(requirement, evidence)
  }));
  const gaps = traced.filter((requirement) => requirement.status !== 'traced');

  // A spec nothing could be parsed out of is a failure with a NAMED cause. The previous version
  // returned status `fail` with an empty gaps array, so any consumer branching on
  // `gaps.length === 0` read an unparseable spec as success.
  if (requirements.length === 0) {
    gaps.push({
      id: 'SPEC-UNPARSEABLE',
      status: 'spec-unparseable',
      text: 'No auditable requirements were found in the spec. Requirements must be checkbox items ' +
            'or lines prefixed REQ-n, AC-n, Requirement: or Acceptance Criteria:.'
    });
  }

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
      testMatchedTokens: requirement.testMatchedTokens ?? [],
      files: requirement.files,
      testFiles: requirement.testFiles ?? [],
      contextFiles: requirement.contextFiles ?? []
    })),
    gaps: gaps.map((gap) => ({ id: gap.id, text: gap.text, line: gap.line, status: gap.status })),
    rejectedEvidence: rejected,
    receipt: normalizePath(path.relative(target, receipt))
  };
  await fs.writeFile(receipt, receiptText(result));
  return result;
}
