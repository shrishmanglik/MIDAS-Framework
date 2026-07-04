import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultTimeoutMs = 60000;

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function compact(value, limit = 4000) {
  const text = String(value ?? '');
  return text.length > limit ? `${text.slice(0, limit)}\n...[truncated]` : text;
}

function compactLog(value, limit = 1000) {
  return compact(value, limit)
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join('\n');
}

function commandText(file, args) {
  return [file, ...args].map((part) => (/\s/.test(part) ? `"${part}"` : part)).join(' ');
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function sha256(file) {
  return crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function runProcess({ cwd, args, timeoutMs = defaultTimeoutMs }) {
  const started = Date.now();
  try {
    const result = await execFileAsync(process.execPath, args, {
      cwd,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024 * 50,
      windowsHide: true
    });
    return {
      exitCode: 0,
      timedOut: false,
      durationMs: Date.now() - started,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? ''
    };
  } catch (error) {
    return {
      exitCode: typeof error.code === 'number' ? error.code : 1,
      timedOut: error.killed === true || /timed out/i.test(error.message),
      durationMs: Date.now() - started,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? error.message
    };
  }
}

function passedByExpectation(processResult, expectation) {
  if (expectation === 'exit-zero') return processResult.exitCode === 0;
  if (expectation === 'exit-nonzero') return processResult.exitCode !== 0;
  return false;
}

function classifyStatus(processResult, expectation) {
  return passedByExpectation(processResult, expectation) ? 'pass' : 'fail';
}

async function runCase({ framework, id, label, cwd, args, expectation = 'exit-zero', timeoutMs, note, parse }) {
  const processResult = await runProcess({ cwd, args, timeoutMs });
  const parsed = parse?.(processResult) ?? parseJson(processResult.stdout);
  return {
    framework,
    id,
    label,
    status: classifyStatus(processResult, expectation),
    expectation,
    command: commandText('node', args),
    cwd: normalizePath(cwd),
    durationMs: processResult.durationMs,
    exitCode: processResult.exitCode,
    timedOut: processResult.timedOut,
    note: note ?? '',
    parsed,
    stdout: compact(processResult.stdout),
    stderr: compact(processResult.stderr)
  };
}

function unavailableCase({ framework, id, label, note }) {
  return {
    framework,
    id,
    label,
    status: 'fail',
    expectation: 'deterministic-local-cli-capability',
    command: 'UNAVAILABLE',
    cwd: '',
    durationMs: 0,
    exitCode: null,
    timedOut: false,
    note,
    parsed: null,
    stdout: '',
    stderr: ''
  };
}

function blockedCase({ framework, id, label, note }) {
  return {
    framework,
    id,
    label,
    status: 'fail',
    expectation: 'previous-step-required',
    command: 'BLOCKED',
    cwd: '',
    durationMs: 0,
    exitCode: null,
    timedOut: false,
    note,
    parsed: null,
    stdout: '',
    stderr: ''
  };
}

function parseBmadSkillValidation(processResult) {
  const parsed = parseJson(processResult.stdout);
  if (!parsed) return null;
  return {
    status: processResult.exitCode === 0 ? 'pass' : 'fail',
    skills: parsed.skills?.length ?? null,
    totalFindings: parsed.summary?.totalFindings ?? null,
    critical: parsed.summary?.critical ?? null,
    high: parsed.summary?.high ?? null
  };
}

function parseInstall(processResult) {
  const parsed = parseJson(processResult.stdout);
  if (parsed) {
    return {
      status: parsed.status,
      generated: parsed.generated?.length ?? null,
      modules: parsed.modules ?? null,
      tools: parsed.tools ?? null
    };
  }
  return null;
}

async function writeText(file, text) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, text);
}

async function runMidasBenchmark() {
  const cli = path.join(packageRoot, 'bin', 'midas.mjs');
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-bmad-bench-midas-'));
  const results = [];

  results.push(await runCase({
    framework: 'midas',
    id: 'cli-help',
    label: 'CLI boots and prints command surface',
    cwd: packageRoot,
    args: [cli, '--help']
  }));

  results.push(await runCase({
    framework: 'midas',
    id: 'install-noninteractive',
    label: 'Noninteractive install creates a project harness',
    cwd: packageRoot,
    args: [
      cli,
      'install',
      '--directory',
      temp,
      '--modules',
      'core,software-dev,qa,agentic-agile',
      '--tools',
      'codex',
      '--yes'
    ],
    parse: parseInstall
  }));

  results.push(await runCase({
    framework: 'midas',
    id: 'workspace-validate',
    label: 'Installed workspace validates',
    cwd: packageRoot,
    args: [cli, 'validate', temp]
  }));

  results.push(await runCase({
    framework: 'midas',
    id: 'skill-library-strict',
    label: 'Native skill library passes strict validation',
    cwd: packageRoot,
    args: [cli, 'validate-pack', 'framework/skills', '--strict']
  }));

  await writeText(path.join(temp, 'PRD.md'), '- [ ] REQ-001: Render evidence panel receipt trace\n');
  await writeText(path.join(temp, 'src', 'app.ts'), 'export const panel = "placeholder";\n');
  results.push(await runCase({
    framework: 'midas',
    id: 'verification-gap-detects-missing',
    label: 'Verification-gap gate catches an omitted requirement',
    cwd: packageRoot,
    args: [cli, 'verify', '--directory', temp, '--spec', 'PRD.md'],
    expectation: 'exit-nonzero'
  }));

  await writeText(path.join(temp, 'src', 'app.ts'), 'export const panel = "evidence panel receipt trace";\n');
  results.push(await runCase({
    framework: 'midas',
    id: 'verification-gap-passes-implemented',
    label: 'Verification-gap gate passes after evidence exists',
    cwd: packageRoot,
    args: [cli, 'verify', '--directory', temp, '--spec', 'PRD.md']
  }));

  await writeText(path.join(temp, 'DESIGN.md'), '- Component: Evidence Panel\n- Component: Review Drawer\n');
  await writeText(path.join(temp, 'EXPERIENCE.md'), 'Step 1 from: Evidence Panel to: Evidence Panel\n');
  results.push(await runCase({
    framework: 'midas',
    id: 'ux-spine-detects-unmapped',
    label: 'UX spine gate catches an unmapped design component',
    cwd: packageRoot,
    args: [cli, 'ux-spine', '--directory', temp, '--design', 'DESIGN.md', '--experience', 'EXPERIENCE.md'],
    expectation: 'exit-nonzero'
  }));

  await writeText(path.join(temp, 'EXPERIENCE.md'), 'Step 1 from: Evidence Panel to: Review Drawer\n');
  results.push(await runCase({
    framework: 'midas',
    id: 'ux-spine-passes-mapped',
    label: 'UX spine gate passes after design maps to experience',
    cwd: packageRoot,
    args: [cli, 'ux-spine', '--directory', temp, '--design', 'DESIGN.md', '--experience', 'EXPERIENCE.md']
  }));

  results.push(await runCase({
    framework: 'midas',
    id: 'docs-staleness-detects-source-only',
    label: 'Docs staleness gate catches source changes without docs',
    cwd: packageRoot,
    args: [cli, 'docs-staleness', '--directory', temp, '--files', 'lib/new-feature.mjs'],
    expectation: 'exit-nonzero'
  }));

  results.push(await runCase({
    framework: 'midas',
    id: 'docs-staleness-passes-with-docs',
    label: 'Docs staleness gate passes when docs accompany source',
    cwd: packageRoot,
    args: [cli, 'docs-staleness', '--directory', temp, '--files', 'lib/new-feature.mjs,docs/new-feature.md']
  }));

  results.push(await runCase({
    framework: 'midas',
    id: 'runtime-repair-record',
    label: 'Runtime workflow records repair evidence after a failed check',
    cwd: packageRoot,
    args: [cli, 'run-workflow', 'software-delivery', '--directory', temp, '--objective', 'Benchmark repair capture']
  }));
  results.push(await runCase({
    framework: 'midas',
    id: 'runtime-repair-packet',
    label: 'Runtime observation creates a bounded repair packet',
    cwd: packageRoot,
    args: [
      cli,
      'observe',
      '--directory',
      temp,
      '--step',
      'verification',
      '--check',
      'unit-tests',
      '--status',
      'failed',
      '--summary',
      'expected output mismatch',
      '--evidence',
      'AssertionError expected evidence panel receipt trace',
      '--max-attempts',
      '2'
    ]
  }));

  return { temp, results };
}

async function runBmadBenchmark({ bmadDirectory }) {
  const root = path.resolve(bmadDirectory);
  const cli = path.join(root, 'tools', 'installer', 'bmad-cli.js');
  const validator = path.join(root, 'tools', 'validate-skills.js');
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-bmad-bench-bmad-'));
  const results = [];

  if (!await exists(cli)) {
    return {
      temp,
      results: [
        unavailableCase({
          framework: 'bmad',
          id: 'cli-help',
          label: 'CLI boots and prints command surface',
          note: `BMAD installer CLI not found at ${normalizePath(cli)}.`
        })
      ]
    };
  }

  const help = await runCase({
    framework: 'bmad',
    id: 'cli-help',
    label: 'CLI boots and prints command surface',
    cwd: root,
    args: [cli, '--help']
  });
  results.push(help);

  const install = await runCase({
    framework: 'bmad',
    id: 'install-noninteractive',
    label: 'Noninteractive install creates a project harness',
    cwd: root,
    args: [
      cli,
      'install',
      '--directory',
      temp,
      '--modules',
      'bmm',
      '--tools',
      'codex',
      '--yes',
      '--user-name',
      'benchmark'
    ],
    parse: parseInstall
  });
  results.push(install);

  if (install.status === 'pass') {
    results.push(await runCase({
      framework: 'bmad',
      id: 'workspace-validate',
      label: 'Installed workspace validates',
      cwd: root,
      args: [cli, 'status', '--directory', temp]
    }));
  } else {
    results.push(blockedCase({
      framework: 'bmad',
      id: 'workspace-validate',
      label: 'Installed workspace validates',
      note: 'Skipped because BMAD noninteractive install did not complete.'
    }));
  }

  if (await exists(validator)) {
    results.push(await runCase({
      framework: 'bmad',
      id: 'skill-library-strict',
      label: 'Native skill library passes strict validation',
      cwd: root,
      args: [validator, '--strict', '--json'],
      parse: parseBmadSkillValidation
    }));
  } else {
    results.push(unavailableCase({
      framework: 'bmad',
      id: 'skill-library-strict',
      label: 'Native skill library passes strict validation',
      note: `BMAD skill validator not found at ${normalizePath(validator)}.`
    }));
  }

  const helpText = `${help.stdout}\n${help.stderr}`.toLowerCase();
  const hasVerifierCli = /verification-gap|verify|ux-spine|docs-staleness|observe|run-workflow/.test(helpText);
  const noLocalGateNote = hasVerifierCli
    ? 'BMAD help text contains a possible gate command, but no paired local command mapping was implemented in this benchmark.'
    : 'No deterministic local CLI command is exposed by the pinned BMAD installer for this MIDAS gate.';

  for (const item of [
    ['verification-gap-detects-missing', 'Verification-gap gate catches an omitted requirement'],
    ['verification-gap-passes-implemented', 'Verification-gap gate passes after evidence exists'],
    ['ux-spine-detects-unmapped', 'UX spine gate catches an unmapped design component'],
    ['ux-spine-passes-mapped', 'UX spine gate passes after design maps to experience'],
    ['docs-staleness-detects-source-only', 'Docs staleness gate catches source changes without docs'],
    ['docs-staleness-passes-with-docs', 'Docs staleness gate passes when docs accompany source'],
    ['runtime-repair-record', 'Runtime workflow records repair evidence after a failed check'],
    ['runtime-repair-packet', 'Runtime observation creates a bounded repair packet']
  ]) {
    results.push(unavailableCase({
      framework: 'bmad',
      id: item[0],
      label: item[1],
      note: noLocalGateNote
    }));
  }

  return { temp, results };
}

export function scoreFrameworkResults(results) {
  const byFramework = new Map();
  for (const result of results) {
    const bucket = byFramework.get(result.framework) ?? {
      framework: result.framework,
      passed: 0,
      total: 0,
      durationMs: 0,
      failures: []
    };
    bucket.total += 1;
    bucket.durationMs += result.durationMs ?? 0;
    if (result.status === 'pass') {
      bucket.passed += 1;
    } else {
      bucket.failures.push({
        id: result.id,
        label: result.label,
        note: result.note || result.stderr || 'Case did not meet the benchmark expectation.'
      });
    }
    byFramework.set(result.framework, bucket);
  }
  const frameworks = [...byFramework.values()].map((item) => ({
    ...item,
    score: item.total > 0 ? Number((item.passed / item.total).toFixed(4)) : 0
  })).sort((left, right) => right.score - left.score || left.durationMs - right.durationMs);

  return {
    frameworks,
    winner: frameworks.length > 0 ? frameworks[0].framework : null,
    tie: frameworks.length > 1 && frameworks[0].score === frameworks[1].score
  };
}

export function formatBenchmarkReport(result) {
  const rows = result.items.map((item) => `| ${item.framework} | ${item.id} | ${item.status} | ${item.durationMs} | ${item.expectation} | ${item.note.replaceAll('|', '/')} |`).join('\n');
  const summaryRows = result.summary.frameworks.map((item) => `| ${item.framework} | ${item.passed}/${item.total} | ${item.score} | ${item.durationMs} |`).join('\n');
  const winnerText = result.summary.tie
    ? 'Tie on this local executable benchmark.'
    : `${result.summary.winner} has the higher local executable benchmark score.`;
  return `# MIDAS vs BMAD Local Executable Benchmark

Generated At: ${result.generatedAt}
Claim Level: private local validation
BMAD Directory: ${normalizePath(result.bmadDirectory)}
MIDAS Directory: ${normalizePath(result.midasDirectory)}

## Result

${winnerText}

This benchmark measures local Codex-executable framework controls only. It does not measure public adoption, prompt corpus breadth, web-bundle quality, community health, official leaderboard performance, or production customer outcomes.

## Summary

| Framework | Passed | Score | Duration Ms |
|---|---:|---:|---:|
${summaryRows}

## Item Results

| Framework | Case | Status | Duration Ms | Expectation | Note |
|---|---|---|---:|---|---|
${rows}

## Claim Boundary

- Allowed claim: MIDAS outscored the pinned local BMAD checkout on this private local executable controls suite.
- Not allowed: MIDAS is globally better than BMAD, more adopted, more complete, or superior on public benchmarks.
- Rerun required after MIDAS framework changes, BMAD commit changes, dependency changes, Node changes, or benchmark case changes.
`;
}

async function writeEvidence({ target, result }) {
  const evidenceRoot = path.join(target, '.midas', 'benchmarks', 'evidence');
  await fs.mkdir(evidenceRoot, { recursive: true });
  const runId = `midas-vs-bmad-${result.generatedAt.replace(/[:.]/g, '-')}`;
  const evidenceDir = path.join(evidenceRoot, runId);
  await fs.mkdir(evidenceDir, { recursive: true });
  const rawResultsPath = path.join(evidenceDir, 'raw-results.json');
  const itemResultsPath = path.join(evidenceDir, 'item-results.jsonl');
  const taskManifestPath = path.join(evidenceDir, 'task-manifest.json');
  const reportPath = path.join(evidenceDir, 'report.md');
  const runLogPath = path.join(evidenceDir, 'run.log');

  await fs.writeFile(rawResultsPath, JSON.stringify(result, null, 2) + '\n');
  await fs.writeFile(itemResultsPath, result.items.map((item) => JSON.stringify({
    framework: item.framework,
    id: item.id,
    status: item.status,
    durationMs: item.durationMs,
    exitCode: item.exitCode,
    note: item.note
  })).join('\n') + '\n');
  await fs.writeFile(taskManifestPath, JSON.stringify({
    schemaVersion: 'midas.framework-comparison-benchmark.v1',
    benchmark: 'MIDAS vs BMAD local executable controls',
    cases: result.items.map((item) => ({
      framework: item.framework,
      id: item.id,
      label: item.label,
      expectation: item.expectation
    })),
    limitations: [
      'Private local validation only.',
      'No public leaderboard claim.',
      'No product adoption, community, web bundle, or prompt corpus score.'
    ]
  }, null, 2) + '\n');
  await fs.writeFile(reportPath, formatBenchmarkReport(result));
  await fs.writeFile(runLogPath, result.items.map((item) => [
    `CASE ${item.framework}:${item.id}`,
    `status=${item.status} exit=${item.exitCode} durationMs=${item.durationMs}`,
    `command=${item.command}`,
    item.stderr ? `stderr=${compactLog(item.stderr)}` : '',
    item.stdout ? `stdout=${compactLog(item.stdout)}` : ''
  ].filter(Boolean).join('\n')).join('\n\n') + '\n');

  const evidence = {
    directory: normalizePath(path.relative(target, evidenceDir)),
    rawResultsPath: normalizePath(path.relative(target, rawResultsPath)),
    itemResultsPath: normalizePath(path.relative(target, itemResultsPath)),
    taskManifestPath: normalizePath(path.relative(target, taskManifestPath)),
    reportPath: normalizePath(path.relative(target, reportPath)),
    runLogPath: normalizePath(path.relative(target, runLogPath)),
    rawResultsSha256: await sha256(rawResultsPath),
    itemResultsSha256: await sha256(itemResultsPath),
    taskManifestSha256: await sha256(taskManifestPath),
    reportSha256: await sha256(reportPath),
    runLogSha256: await sha256(runLogPath)
  };

  return evidence;
}

export async function runFrameworkComparisonBenchmark(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const bmadDirectory = path.resolve(options.bmadDirectory ?? '');
  if (!options.bmadDirectory) {
    throw new Error('benchmark-bmad requires --bmad-directory <path-to-BMAD-METHOD>.');
  }
  const generatedAt = new Date().toISOString();

  const midas = await runMidasBenchmark();
  const bmad = await runBmadBenchmark({ bmadDirectory });
  const items = [...midas.results, ...bmad.results];
  const summary = scoreFrameworkResults(items);
  const result = {
    schemaVersion: 'midas.framework-comparison-benchmark.v1',
    generatedAt,
    claimLevel: 'private-local-validation',
    midasDirectory: packageRoot,
    bmadDirectory,
    tempDirectories: {
      midas: midas.temp,
      bmad: bmad.temp
    },
    summary,
    items
  };
  result.evidence = await writeEvidence({ target, result });
  return result;
}
