import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRuntimeRun, unfinishedRuntimeSteps } from './runtime-runner.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function cleanScalar(value) {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function safeSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'workflow';
}

export function parseWorkflowDefinition(text) {
  const workflow = { steps: [], rules: [] };
  let currentList = null;
  let currentStep = null;

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const topLevel = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (topLevel) {
      const [, key, value] = topLevel;
      if (key === 'steps' || key === 'rules') {
        currentList = key;
        currentStep = null;
      } else {
        workflow[key] = cleanScalar(value);
        currentList = null;
        currentStep = null;
      }
      continue;
    }

    const listItem = line.match(/^\s+-\s*(.*)$/);
    if (listItem && currentList === 'rules') {
      workflow.rules.push(cleanScalar(listItem[1]));
      continue;
    }

    if (listItem && currentList === 'steps') {
      currentStep = {};
      workflow.steps.push(currentStep);
      const inline = listItem[1].match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (inline) currentStep[inline[1]] = cleanScalar(inline[2]);
      continue;
    }

    const nested = line.match(/^\s+([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (nested && currentList === 'steps' && currentStep) {
      currentStep[nested[1]] = cleanScalar(nested[2]);
    }
  }

  return workflow;
}

async function workspaceExists(target) {
  try {
    await fs.access(path.join(target, '.midas', '_config', 'manifest.yaml'));
    return true;
  } catch {
    return false;
  }
}

function workflowWorkOrderBody(workflow, objective) {
  const steps = workflow.steps
    .map((step) => `- [ ] ${step.name ?? step.id}: ${step.output ?? 'record output'}`)
    .join('\n');
  const rules = workflow.rules.map((rule) => `- ${rule}`).join('\n');

  return `# MIDAS Workflow Run: ${workflow.name ?? workflow.id}

Status: ready
Workflow: ${workflow.id}
Depth band: strategic-system

## Objective

${objective || 'Move one scoped objective through the selected workflow.'}

## Purpose

${workflow.purpose ?? 'Execute a scoped MIDAS workflow and record evidence.'}

## Steps

${steps}

## Rules

${rules}

## Evidence To Record

- files changed or reviewed
- commands run
- verification result
- unresolved risks
- next action
`;
}

function ledgerBody(workflow, workOrderFile) {
  return `# MIDAS Workflow Ledger Entry

Status: started
Workflow: ${workflow.id}
Work order: ${workOrderFile}

## Evidence

- pending

## Closeout

- pending
`;
}

function splitList(value, fallback) {
  if (!value || value === true) return fallback;
  const values = String(value)
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length > 0 ? values : fallback;
}

function markdownList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

async function latestLedgerFile(ledgerDir) {
  const entries = await fs.readdir(ledgerDir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'README.md') continue;
    const full = path.join(ledgerDir, entry.name);
    const stat = await fs.stat(full);
    files.push({ full, modified: stat.mtimeMs });
  }
  files.sort((left, right) => right.modified - left.modified);
  return files[0]?.full;
}

function replaceSection(text, heading, body) {
  const pattern = new RegExp(`## ${heading}\\n[\\s\\S]*?(?=\\n## |$)`);
  const next = `## ${heading}\n\n${body.trim()}\n`;
  if (pattern.test(text)) return text.replace(pattern, next);
  return `${text.trim()}\n\n${next}`;
}

function sprintStatusBody(status, nextAction) {
  return `# MIDAS Sprint Status

status: ${status}
current_objective: workflow closeout recorded
current_depth_band: strategic-system
next_action: ${nextAction || 'select the next scoped work order'}
blocked: ${status === 'blocked'}
`;
}

export async function runWorkflow(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const workflowId = safeSlug(options.workflow ?? 'software-delivery');
  const workflowFile = path.join(packageRoot, 'framework', 'workflows', `${workflowId}.yaml`);

  if (!await workspaceExists(target)) {
    throw new Error('run-workflow requires an installed MIDAS workspace. Run midas install first.');
  }

  const text = await fs.readFile(workflowFile, 'utf8');
  const workflow = parseWorkflowDefinition(text);
  if (!workflow.id || workflow.steps.length === 0) {
    throw new Error(`Workflow ${workflowId} is missing id or steps.`);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const workOrderDir = path.join(target, '.midas', 'workorders');
  const ledgerDir = path.join(target, '.midas', 'run-ledger');
  await fs.mkdir(workOrderDir, { recursive: true });
  await fs.mkdir(ledgerDir, { recursive: true });

  const workOrderPath = path.join(workOrderDir, `${stamp}-${workflow.id}.md`);
  const ledgerPath = path.join(ledgerDir, `${stamp}-${workflow.id}.md`);
  const workOrderFile = path.relative(target, workOrderPath).replaceAll('\\', '/');
  const ledgerFile = path.relative(target, ledgerPath).replaceAll('\\', '/');

  await fs.writeFile(workOrderPath, workflowWorkOrderBody(workflow, options.objective));
  await fs.writeFile(ledgerPath, ledgerBody(workflow, workOrderFile));
  const runtime = await createRuntimeRun({
    directory: target,
    workflow,
    objective: options.objective,
    runControl: options.runControl,
    workOrderFile,
    ledgerFile
  });

  return {
    status: 'created',
    target,
    workflow: workflow.id,
    runControl: runtime.runControl,
    runtime,
    files: [workOrderFile, ledgerFile, runtime.file, runtime.events]
  };
}

export async function closeoutWorkflow(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const status = safeSlug(options.status ?? 'completed');
  const allowedStatuses = new Set(['completed', 'partial', 'blocked']);

  if (!allowedStatuses.has(status)) {
    throw new Error('closeout status must be completed, partial, or blocked.');
  }
  if (!await workspaceExists(target)) {
    throw new Error('closeout requires an installed MIDAS workspace. Run midas install first.');
  }

  const ledgerDir = path.join(target, '.midas', 'run-ledger');
  const ledgerPath = options.ledger
    ? path.resolve(target, options.ledger)
    : await latestLedgerFile(ledgerDir);

  if (!ledgerPath) {
    throw new Error('closeout requires a run-ledger entry. Run midas run-workflow first.');
  }
  if (!ledgerPath.startsWith(path.resolve(ledgerDir))) {
    throw new Error('closeout ledger must be inside .midas/run-ledger.');
  }

  const evidence = splitList(options.evidence, ['not recorded']);
  const risks = splitList(options.risks, ['none recorded']);
  const nextAction = options.nextAction && options.nextAction !== true
    ? String(options.nextAction).trim()
    : 'select the next scoped work order';
  const timestamp = new Date().toISOString();
  const unfinishedSteps = await unfinishedRuntimeSteps(target);
  const runtimeWarnings = status === 'completed' && unfinishedSteps.length > 0
    ? [`Runtime has unfinished steps: ${unfinishedSteps.map((step) => step.id).join(', ')}`]
    : [];

  let ledger = await fs.readFile(ledgerPath, 'utf8');
  ledger = ledger.replace(/^Status:\s*.+$/m, `Status: ${status}`);
  ledger = replaceSection(ledger, 'Evidence', markdownList(evidence));
  ledger = replaceSection(
    ledger,
    'Closeout',
    [
      `Closed at: ${timestamp}`,
      '',
      `Result: ${status}`,
      '',
      'Risks:',
      markdownList(risks),
      '',
      `Next action: ${nextAction}`
    ].join('\n')
  );

  await fs.writeFile(ledgerPath, ledger);
  await fs.writeFile(path.join(target, '.midas', 'sprint-status.yaml'), sprintStatusBody(status, nextAction));

  return {
    status,
    target,
    warnings: runtimeWarnings,
    files: [
      path.relative(target, ledgerPath).replaceAll('\\', '/'),
      '.midas/sprint-status.yaml'
    ]
  };
}
