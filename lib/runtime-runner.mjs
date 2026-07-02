import fs from 'node:fs/promises';
import path from 'node:path';

const allowedStepStatuses = new Set(['pending', 'in-progress', 'completed', 'blocked', 'skipped']);
const allowedObservationStatuses = new Set(['failed', 'passed', 'warning', 'unknown']);

function safeSlug(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'run';
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
}

function relative(target, file) {
  return path.relative(target, file).replaceAll('\\', '/');
}

function runtimeRoot(target) {
  return path.join(target, '.midas', 'runtime', 'runs');
}

async function loadRunControlProfile(target, profileId) {
  const file = path.join(target, '.midas', 'run-control', 'policy.json');
  const policy = await readJson(file);
  const profile = policy.profiles?.find((candidate) => candidate.id === profileId);
  if (!profile) {
    throw new Error(`Unknown run-control profile: ${profileId}`);
  }
  return profile;
}

function defaultAgentForStep(stepId) {
  if (['context', 'work-order', 'design'].includes(stepId)) return 'planner';
  if (['verification', 'closeout'].includes(stepId)) return 'reviewer';
  return 'builder';
}

async function appendEvent(runDir, event) {
  const entry = {
    timestamp: new Date().toISOString(),
    ...event
  };
  await fs.appendFile(path.join(runDir, 'events.jsonl'), JSON.stringify(entry) + '\n');
}

function compactText(value, fallback, maxLength = 4000) {
  const text = String(value ?? '').trim();
  if (!text) return fallback;
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function repairFocus(summary, evidence) {
  const text = `${summary}\n${evidence}`.toLowerCase();
  const focus = [];
  if (/(permission|executable|chmod)/.test(text)) {
    focus.push('file permissions or executable bits');
  }
  if (/(dos|crlf|line ending|\r)/.test(text)) {
    focus.push('line endings and newline normalization');
  }
  if (/(shebang|interpreter|\/bin\/sh|\/usr\/bin\/env)/.test(text)) {
    focus.push('script interpreter and shebang correctness');
  }
  if (/(parquet|csv|schema|dataframe|pyarrow|pandas)/.test(text)) {
    focus.push('data format conversion, schema preservation, and required output path');
  }
  if (/(exact|expected|actual|diff|whitespace|trailing newline)/.test(text)) {
    focus.push('exact output, whitespace, casing, and trailing newline requirements');
  }
  if (/(timeout|hang|long-running|agent_timeout)/.test(text)) {
    focus.push('command timeout, unnecessary loops, and shortest deterministic implementation path');
  }
  if (/(test|pytest|assert|failed|failure)/.test(text)) {
    focus.push('failing test assertions and the smallest reproducible check');
  }
  return [...new Set(focus)].slice(0, 6);
}

function repairPacketBody({ run, step, observation, focus, maxAttempts }) {
  const focusLines = focus.length > 0
    ? focus.map((item) => `- ${item}`).join('\n')
    : '- inspect the failing evidence, reproduce the smallest failure, and repair only the observed cause';

  return `# MIDAS Repair Packet

Run: ${run.runId}
Step: ${step.id}
Check: ${observation.check}
Status: ${observation.status}
Created: ${observation.createdAt}
Max attempts: ${maxAttempts}

## Observation

${observation.summary}

## Evidence

${observation.evidence || 'No evidence text recorded.'}

## Repair Focus

${focusLines}

## Repair Discipline

1. Reproduce or inspect the exact failed check before changing behavior.
2. Make the smallest targeted change that addresses the observed failure.
3. Preserve names, paths, casing, formats, whitespace, and trailing newline requirements.
4. Run the narrowest relevant verification command after the repair.
5. Stop when the check passes, or record the next failed observation before another attempt.
`;
}

export async function createRuntimeRun(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const runControlId = safeSlug(options.runControl ?? 'focused-run');
  await loadRunControlProfile(target, runControlId);

  const createdAt = new Date().toISOString();
  const runId = `${createdAt.replace(/[:.]/g, '-')}-${safeSlug(options.workflow?.id ?? 'workflow')}`;
  const runDir = path.join(runtimeRoot(target), runId);
  await fs.mkdir(path.join(runDir, 'handoffs'), { recursive: true });

  const run = {
    schemaVersion: 'midas.runtime-run.v1',
    runId,
    status: 'active',
    workflow: {
      id: options.workflow?.id,
      name: options.workflow?.name ?? options.workflow?.id
    },
    runControl: runControlId,
    objective: options.objective || 'Move one scoped objective through the selected workflow.',
    createdAt,
    updatedAt: createdAt,
    workOrder: options.workOrderFile,
    ledger: options.ledgerFile,
    currentStep: options.workflow?.steps?.[0]?.id ?? null,
    steps: (options.workflow?.steps ?? []).map((step) => ({
      id: step.id,
      name: step.name ?? step.id,
      output: step.output ?? 'record output',
      agentProfile: defaultAgentForStep(step.id),
      status: 'pending',
      evidence: [],
      observations: [],
      repairAttempts: [],
      handoffs: [],
      updatedAt: null
    }))
  };

  await writeJson(path.join(runDir, 'run.json'), run);
  await appendEvent(runDir, {
    type: 'run.created',
    runId,
    workflow: run.workflow.id,
    runControl: runControlId,
    currentStep: run.currentStep
  });

  return {
    runId,
    runControl: runControlId,
    file: relative(target, path.join(runDir, 'run.json')),
    events: relative(target, path.join(runDir, 'events.jsonl'))
  };
}

async function listRunDirs(target) {
  const root = runtimeRoot(target);
  if (!await exists(root)) return [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const runFile = path.join(root, entry.name, 'run.json');
    if (!await exists(runFile)) continue;
    const stat = await fs.stat(runFile);
    dirs.push({ name: entry.name, dir: path.join(root, entry.name), modified: stat.mtimeMs });
  }
  dirs.sort((left, right) => right.modified - left.modified);
  return dirs;
}

export async function latestRuntimeRun(target) {
  const dirs = await listRunDirs(path.resolve(target));
  return dirs[0]?.dir ?? null;
}

function summarizeRun(run, target, runDir) {
  const steps = Array.isArray(run.steps) ? run.steps : [];
  return {
    runId: run.runId,
    status: run.status,
    workflow: run.workflow?.id,
    runControl: run.runControl,
    currentStep: run.currentStep,
    completedSteps: steps.filter((step) => step.status === 'completed').length,
    totalSteps: steps.length,
    file: relative(target, path.join(runDir, 'run.json'))
  };
}

export async function getRunStatus(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const runDir = options.runId
    ? path.join(runtimeRoot(target), options.runId)
    : await latestRuntimeRun(target);
  if (!runDir || !await exists(path.join(runDir, 'run.json'))) {
    return {
      status: 'none',
      target,
      runs: []
    };
  }
  const run = await readJson(path.join(runDir, 'run.json'));
  return {
    status: 'pass',
    target,
    latest: summarizeRun(run, target, runDir),
    steps: run.steps
  };
}

function nextCurrentStep(steps) {
  const next = steps.find((step) => !['completed', 'skipped'].includes(step.status));
  return next?.id ?? null;
}

function runStatusFromSteps(steps) {
  if (steps.some((step) => step.status === 'blocked')) return 'blocked';
  if (steps.every((step) => ['completed', 'skipped'].includes(step.status))) return 'completed';
  return 'active';
}

export async function updateRuntimeStep(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const status = safeSlug(options.status ?? 'in-progress');
  if (!allowedStepStatuses.has(status)) {
    throw new Error('step status must be pending, in-progress, completed, blocked, or skipped.');
  }
  if (status === 'completed' && (!options.evidence || options.evidence === true)) {
    throw new Error('completed steps require evidence.');
  }

  const runDir = options.runId
    ? path.join(runtimeRoot(target), options.runId)
    : await latestRuntimeRun(target);
  if (!runDir || !await exists(path.join(runDir, 'run.json'))) {
    throw new Error('step requires a runtime run. Run midas run-workflow first.');
  }

  const runFile = path.join(runDir, 'run.json');
  const run = await readJson(runFile);
  const step = run.steps.find((candidate) => candidate.id === options.step);
  if (!step) {
    throw new Error(`Unknown runtime step: ${options.step}`);
  }
  if (step.status === 'completed' && status !== 'completed') {
    throw new Error('completed steps cannot move backward.');
  }

  const timestamp = new Date().toISOString();
  step.status = status;
  step.updatedAt = timestamp;
  if (options.evidence && options.evidence !== true) {
    step.evidence.push(String(options.evidence));
  }

  let handoffFile = null;
  if (options.handoff && options.handoff !== true) {
    const handoffName = `${timestamp.replace(/[:.]/g, '-')}-${step.id}-to-${safeSlug(options.handoff)}.md`;
    const handoffPath = path.join(runDir, 'handoffs', handoffName);
    const body = `# MIDAS Runtime Handoff

Run: ${run.runId}
Step: ${step.id}
To: ${options.handoff}
Status: ${status}
Created: ${timestamp}

## Evidence

${step.evidence.map((item) => `- ${item}`).join('\n') || '- not recorded'}
`;
    await fs.writeFile(handoffPath, body);
    handoffFile = relative(target, handoffPath);
    step.handoffs.push(handoffFile);
  }

  run.status = runStatusFromSteps(run.steps);
  run.currentStep = nextCurrentStep(run.steps);
  run.updatedAt = timestamp;
  await writeJson(runFile, run);
  await appendEvent(runDir, {
    type: 'step.updated',
    runId: run.runId,
    step: step.id,
    status,
    evidenceRecorded: Boolean(options.evidence && options.evidence !== true),
    handoff: handoffFile
  });

  return {
    status: 'updated',
    target,
    runId: run.runId,
    step: step.id,
    stepStatus: status,
    runStatus: run.status,
    currentStep: run.currentStep,
    handoff: handoffFile,
    file: relative(target, runFile)
  };
}

export async function recordRuntimeObservation(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const observationStatus = safeSlug(options.status ?? 'unknown');
  if (!allowedObservationStatuses.has(observationStatus)) {
    throw new Error('observation status must be failed, passed, warning, or unknown.');
  }
  if (!options.step) {
    throw new Error('observe requires --step <id>.');
  }
  const check = safeSlug(options.check ?? options.step);
  const summary = compactText(options.summary, 'Observation recorded without a summary.');
  const evidence = options.evidence && options.evidence !== true
    ? compactText(options.evidence, '', 6000)
    : '';
  const maxAttempts = Number.isInteger(Number(options.maxAttempts))
    ? Math.max(1, Math.min(10, Number(options.maxAttempts)))
    : 3;

  const runDir = options.runId
    ? path.join(runtimeRoot(target), options.runId)
    : await latestRuntimeRun(target);
  if (!runDir || !await exists(path.join(runDir, 'run.json'))) {
    throw new Error('observe requires a runtime run. Run midas run-workflow first.');
  }

  const runFile = path.join(runDir, 'run.json');
  const run = await readJson(runFile);
  const step = run.steps.find((candidate) => candidate.id === options.step);
  if (!step) {
    throw new Error(`Unknown runtime step: ${options.step}`);
  }

  const timestamp = new Date().toISOString();
  step.observations ??= [];
  step.repairAttempts ??= [];
  const observation = {
    id: `${timestamp.replace(/[:.]/g, '-')}-${check}`,
    check,
    status: observationStatus,
    summary,
    evidence,
    createdAt: timestamp
  };
  const focus = repairFocus(summary, evidence);
  step.observations.push(observation);

  let repairPacket = null;
  if (observationStatus !== 'passed') {
    await fs.mkdir(path.join(runDir, 'repairs'), { recursive: true });
    const packetPath = path.join(runDir, 'repairs', `${observation.id}.md`);
    await fs.writeFile(packetPath, repairPacketBody({ run, step, observation, focus, maxAttempts }));
    repairPacket = relative(target, packetPath);
    step.repairAttempts.push({
      observationId: observation.id,
      check,
      status: 'open',
      packet: repairPacket,
      maxAttempts,
      focus,
      createdAt: timestamp
    });
    if (step.status === 'pending') step.status = 'in-progress';
    run.status = runStatusFromSteps(run.steps);
    run.currentStep = step.id;
  }

  step.updatedAt = timestamp;
  run.updatedAt = timestamp;
  await writeJson(runFile, run);
  await appendEvent(runDir, {
    type: 'observation.recorded',
    runId: run.runId,
    step: step.id,
    check,
    observationStatus,
    repairPacket
  });

  return {
    status: 'recorded',
    target,
    runId: run.runId,
    step: step.id,
    check,
    observationStatus,
    repairPacket,
    focus,
    recommendation: observationStatus === 'passed'
      ? 'Mark the step completed only after all required evidence is recorded.'
      : 'Use the repair packet for the next bounded attempt, then record the new verification result.',
    file: relative(target, runFile)
  };
}

export async function inspectRuntimeRuns(targetInput) {
  const target = path.resolve(targetInput);
  const root = runtimeRoot(target);
  const failures = [];
  const runs = [];

  if (!await exists(root)) {
    return {
      status: 'fail',
      target,
      runs,
      failures: [{
        id: 'runtime:runs-directory',
        status: 'fail',
        remediation: 'Run midas install to create .midas/runtime/runs.'
      }]
    };
  }

  const dirs = await listRunDirs(target);
  for (const { dir } of dirs) {
    const runFile = path.join(dir, 'run.json');
    const eventsFile = path.join(dir, 'events.jsonl');
    let run = null;
    try {
      run = await readJson(runFile);
    } catch (error) {
      failures.push({
        id: 'runtime:run-json',
        status: 'fail',
        file: relative(target, runFile),
        remediation: `Fix malformed runtime run JSON: ${error.message}`
      });
      continue;
    }

    runs.push(summarizeRun(run, target, dir));
    if (run.schemaVersion !== 'midas.runtime-run.v1') {
      failures.push({
        id: 'runtime:schema-version',
        status: 'fail',
        file: relative(target, runFile),
        remediation: 'Set schemaVersion to midas.runtime-run.v1.'
      });
    }
    if (!run.runId || !run.workflow?.id || !run.runControl || !Array.isArray(run.steps)) {
      failures.push({
        id: 'runtime:shape',
        status: 'fail',
        file: relative(target, runFile),
        remediation: 'Runtime run requires runId, workflow.id, runControl, and steps.'
      });
    }
    for (const step of run.steps ?? []) {
      if (!step.id || !allowedStepStatuses.has(step.status) || !Array.isArray(step.evidence)) {
        failures.push({
          id: 'runtime:step-shape',
          status: 'fail',
          file: relative(target, runFile),
          remediation: 'Every runtime step requires id, valid status, and evidence array.'
        });
        break;
      }
      if (step.observations !== undefined && !Array.isArray(step.observations)) {
        failures.push({
          id: 'runtime:step-observations',
          status: 'fail',
          file: relative(target, runFile),
          remediation: 'Runtime step observations must be an array when present.'
        });
      }
      if (step.repairAttempts !== undefined && !Array.isArray(step.repairAttempts)) {
        failures.push({
          id: 'runtime:step-repair-attempts',
          status: 'fail',
          file: relative(target, runFile),
          remediation: 'Runtime step repairAttempts must be an array when present.'
        });
      }
      for (const observation of step.observations ?? []) {
        if (!observation.id || !observation.check || !allowedObservationStatuses.has(observation.status)) {
          failures.push({
            id: 'runtime:observation-shape',
            status: 'fail',
            file: relative(target, runFile),
            remediation: 'Every runtime observation requires id, check, and a valid status.'
          });
          break;
        }
      }
      for (const attempt of step.repairAttempts ?? []) {
        if (!attempt.packet || !await exists(path.join(target, attempt.packet))) {
          failures.push({
            id: 'runtime:repair-packet',
            status: 'fail',
            file: relative(target, runFile),
            remediation: 'Every runtime repair attempt must reference an existing repair packet.'
          });
          break;
        }
      }
    }
    if (!await exists(eventsFile)) {
      failures.push({
        id: 'runtime:events',
        status: 'fail',
        file: relative(target, eventsFile),
        remediation: 'Runtime runs require events.jsonl.'
      });
    }
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    target,
    runs,
    failures
  };
}

export async function unfinishedRuntimeSteps(targetInput) {
  const target = path.resolve(targetInput);
  const runDir = await latestRuntimeRun(target);
  if (!runDir) return [];
  const run = await readJson(path.join(runDir, 'run.json'));
  return run.steps.filter((step) => !['completed', 'skipped'].includes(step.status));
}
