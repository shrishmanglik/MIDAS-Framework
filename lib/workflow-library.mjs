import fs from 'node:fs/promises';
import path from 'node:path';
import { inspectAgentLibrary } from './agent-library.mjs';

export const workflowLibrarySchemaVersion = 'midas.workflow.v2';

const allowedModelTiers = new Set(['frontier', 'open', 'local']);
const requiredGateVerdicts = ['PASS', 'CONCERNS', 'FAIL'];
const keyPattern = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/;
const slugPattern = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

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

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, '');
}

function parseValue(raw) {
  const value = raw.trim();
  const arrayMatch = value.match(/^\[(.*)\]$/);
  if (arrayMatch) {
    return arrayMatch[1]
      .split(',')
      .map((entry) => stripQuotes(entry.trim()))
      .filter((entry) => entry !== '');
  }
  const scalar = stripQuotes(value);
  if (scalar === 'true') return true;
  if (scalar === 'false') return false;
  return scalar;
}

/**
 * Minimal line-based parser for the midas.workflow.v2 format.
 *
 * The repository has no YAML dependency by design; workflow files use a
 * deliberately canonical subset of YAML so this parser stays deterministic:
 * - top-level scalars at column 0 (`key: value`), plus `steps:` and `rules:` blocks
 * - step items open with `  - key: value`; step fields sit at 4 spaces
 * - one nesting level inside a step (`handoff:` / `gate:` at 4 spaces,
 *   their fields at 6 spaces)
 * - lists inside steps are inline flow arrays only (`[a, b]`), never block lists
 * - rules items are `  - text`
 * Anything outside that subset is a parse error, not a silent guess.
 */
export function parseWorkflowV2(text) {
  const workflow = { steps: [], rules: [] };
  let mode = null;
  let currentStep = null;
  let objectKey = null;

  for (const raw of text.replace(/\r\n/g, '\n').split('\n')) {
    if (raw.trim() === '' || raw.trim().startsWith('#')) continue;
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();

    if (indent === 0) {
      const match = line.match(keyPattern);
      if (!match) throw new Error(`Unsupported workflow line: ${line}`);
      mode = null;
      currentStep = null;
      objectKey = null;
      if (match[2] === '') {
        if (match[1] !== 'steps' && match[1] !== 'rules') {
          throw new Error(`Unsupported workflow block: ${match[1]}`);
        }
        mode = match[1];
      } else {
        workflow[match[1]] = parseValue(match[2]);
      }
      continue;
    }

    if (mode === 'rules') {
      if (indent === 2 && line.startsWith('- ')) {
        workflow.rules.push(stripQuotes(line.slice(2).trim()));
        continue;
      }
      throw new Error(`Unsupported rules line: ${line}`);
    }

    if (mode !== 'steps') throw new Error(`Indented line outside steps or rules: ${line}`);

    if (indent === 2 && line.startsWith('- ')) {
      currentStep = {};
      objectKey = null;
      workflow.steps.push(currentStep);
      const match = line.slice(2).trim().match(keyPattern);
      if (!match || match[2] === '') {
        throw new Error(`Workflow step items must open with an inline field: ${line}`);
      }
      currentStep[match[1]] = parseValue(match[2]);
      continue;
    }

    const match = line.match(keyPattern);
    if (!match || !currentStep) throw new Error(`Unsupported workflow step line: ${line}`);
    if (indent === 4) {
      objectKey = null;
      if (match[2] === '') {
        currentStep[match[1]] = {};
        objectKey = match[1];
      } else {
        currentStep[match[1]] = parseValue(match[2]);
      }
      continue;
    }
    if (indent === 6 && objectKey) {
      currentStep[objectKey][match[1]] = parseValue(match[2]);
      continue;
    }
    throw new Error(`Unsupported workflow indentation: ${raw}`);
  }

  return workflow;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function validateHandoff(workflowId, step, stepIds, failures) {
  const handoff = step.handoff;
  if (!handoff || typeof handoff !== 'object' || Array.isArray(handoff)) {
    failures.push({
      id: `workflow:${workflowId}:step:${step.id}:handoff`,
      status: 'fail',
      remediation: 'Every step must declare a handoff object with after and enables arrays.'
    });
    return;
  }
  for (const edgeKey of ['after', 'enables']) {
    const edges = handoff[edgeKey];
    if (!isStringArray(edges)) {
      failures.push({
        id: `workflow:${workflowId}:step:${step.id}:handoff-${edgeKey}`,
        status: 'fail',
        remediation: `Step handoff.${edgeKey} must be an inline array of step ids (use [] when empty).`
      });
      continue;
    }
    for (const target of edges) {
      if (!stepIds.has(target)) {
        failures.push({
          id: `workflow:${workflowId}:step:${step.id}:handoff-${edgeKey}-unknown`,
          status: 'fail',
          remediation: `Step handoff.${edgeKey} references a step id that does not exist in this workflow: ${target}.`
        });
      } else if (target === step.id) {
        failures.push({
          id: `workflow:${workflowId}:step:${step.id}:handoff-${edgeKey}-self`,
          status: 'fail',
          remediation: `Step handoff.${edgeKey} must not reference the step itself.`
        });
      }
    }
  }
  const unknownKeys = Object.keys(handoff).filter((key) => key !== 'after' && key !== 'enables');
  for (const key of unknownKeys) {
    failures.push({
      id: `workflow:${workflowId}:step:${step.id}:handoff-unknown-key`,
      status: 'fail',
      remediation: `Step handoff has unknown key: ${key}. Only after and enables are allowed.`
    });
  }
}

function validateGate(workflowId, step, failures) {
  const gate = step.gate;
  if (gate === undefined) return;
  if (!gate || typeof gate !== 'object' || Array.isArray(gate)) {
    failures.push({
      id: `workflow:${workflowId}:step:${step.id}:gate`,
      status: 'fail',
      remediation: 'Step gate must be an object with type, verdicts, concernsRequire, and failBlocks.'
    });
    return;
  }
  if (gate.type !== 'readiness') {
    failures.push({
      id: `workflow:${workflowId}:step:${step.id}:gate-type`,
      status: 'fail',
      remediation: 'Gate type must be readiness.'
    });
  }
  const verdicts = isStringArray(gate.verdicts) ? [...gate.verdicts].sort() : null;
  const expected = [...requiredGateVerdicts].sort();
  if (!verdicts || verdicts.length !== expected.length || verdicts.some((value, index) => value !== expected[index])) {
    failures.push({
      id: `workflow:${workflowId}:step:${step.id}:gate-verdicts`,
      status: 'fail',
      remediation: 'Gate verdicts must be exactly [PASS, CONCERNS, FAIL].'
    });
  }
  if (gate.concernsRequire !== 'owners') {
    failures.push({
      id: `workflow:${workflowId}:step:${step.id}:gate-concerns`,
      status: 'fail',
      remediation: 'Gate concernsRequire must be owners: a CONCERNS verdict without named owners is theater.'
    });
  }
  if (gate.failBlocks !== true) {
    failures.push({
      id: `workflow:${workflowId}:step:${step.id}:gate-fail-blocks`,
      status: 'fail',
      remediation: 'Gate failBlocks must be true: a FAIL verdict blocks the enabled steps.'
    });
  }
}

function detectCycle(workflowId, steps, failures) {
  const ids = steps.map((step) => step.id).filter((id) => typeof id === 'string');
  const edges = new Map(ids.map((id) => [id, new Set()]));
  for (const step of steps) {
    if (typeof step.id !== 'string' || !step.handoff || typeof step.handoff !== 'object') continue;
    const after = isStringArray(step.handoff.after) ? step.handoff.after : [];
    const enables = isStringArray(step.handoff.enables) ? step.handoff.enables : [];
    for (const predecessor of after) {
      if (edges.has(predecessor) && predecessor !== step.id) edges.get(predecessor).add(step.id);
    }
    for (const successor of enables) {
      if (edges.has(step.id) && edges.has(successor) && successor !== step.id) edges.get(step.id).add(successor);
    }
  }
  const inDegree = new Map(ids.map((id) => [id, 0]));
  for (const targets of edges.values()) {
    for (const target of targets) inDegree.set(target, (inDegree.get(target) ?? 0) + 1);
  }
  const queue = ids.filter((id) => inDegree.get(id) === 0);
  let visited = 0;
  while (queue.length > 0) {
    const current = queue.shift();
    visited += 1;
    for (const target of edges.get(current) ?? []) {
      inDegree.set(target, inDegree.get(target) - 1);
      if (inDegree.get(target) === 0) queue.push(target);
    }
  }
  if (visited < ids.length) {
    const stuck = ids.filter((id) => inDegree.get(id) > 0);
    failures.push({
      id: `workflow:${workflowId}:handoff-cycle`,
      status: 'fail',
      remediation: `Workflow handoff graph must be acyclic. Cycle involves: ${stuck.join(', ')}.`
    });
  }
}

export function validateWorkflowRecord({ fileName, relativeFile, text, rosterIds }) {
  const failures = [];
  const expectedId = fileName.replace(/\.ya?ml$/i, '');
  let workflow;
  try {
    workflow = parseWorkflowV2(text);
  } catch (error) {
    return {
      status: 'fail',
      workflow: { id: expectedId, file: relativeFile },
      failures: [
        {
          id: `workflow:${expectedId}:parse`,
          status: 'fail',
          remediation: error.message
        }
      ]
    };
  }

  const id = typeof workflow.id === 'string' && workflow.id !== '' ? workflow.id : expectedId;
  const roster = new Set(rosterIds ?? []);

  if (workflow.schemaVersion !== workflowLibrarySchemaVersion) {
    failures.push({
      id: `workflow:${id}:schema-version`,
      status: 'fail',
      remediation: `Workflow must declare schemaVersion: ${workflowLibrarySchemaVersion}.`
    });
  }
  if (typeof workflow.id !== 'string' || !slugPattern.test(workflow.id)) {
    failures.push({
      id: `workflow:${id}:id`,
      status: 'fail',
      remediation: 'Workflow id must be 1-64 lowercase letters, numbers, and hyphens.'
    });
  }
  if (workflow.id !== expectedId) {
    failures.push({
      id: `workflow:${id}:file-match`,
      status: 'fail',
      remediation: `Workflow id must match its filename. Expected ${expectedId}.`
    });
  }
  if (typeof workflow.name !== 'string' || workflow.name.trim() === '') {
    failures.push({
      id: `workflow:${id}:name`,
      status: 'fail',
      remediation: 'Workflow must declare a non-empty name.'
    });
  }
  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    failures.push({
      id: `workflow:${id}:steps`,
      status: 'fail',
      remediation: 'Workflow must declare at least one step.'
    });
  }

  const steps = Array.isArray(workflow.steps) ? workflow.steps : [];
  const stepIds = new Set(steps.map((step) => step.id).filter((value) => typeof value === 'string'));
  const seen = new Set();

  for (const [index, step] of steps.entries()) {
    const stepLabel = typeof step.id === 'string' && step.id !== '' ? step.id : `#${index + 1}`;
    if (typeof step.id !== 'string' || !slugPattern.test(step.id)) {
      failures.push({
        id: `workflow:${id}:step:${stepLabel}:id`,
        status: 'fail',
        remediation: 'Every step must declare a slug id (lowercase letters, numbers, hyphens).'
      });
    } else if (seen.has(step.id)) {
      failures.push({
        id: `workflow:${id}:step:${step.id}:duplicate`,
        status: 'fail',
        remediation: `Step ids must be unique within a workflow. Duplicate: ${step.id}.`
      });
    } else {
      seen.add(step.id);
    }
    if (typeof step.agent !== 'string' || step.agent.trim() === '') {
      failures.push({
        id: `workflow:${id}:step:${stepLabel}:agent`,
        status: 'fail',
        remediation: 'Every step must name the roster agent that executes it.'
      });
    } else if (!roster.has(step.agent)) {
      failures.push({
        id: `workflow:${id}:step:${stepLabel}:agent-unknown`,
        status: 'fail',
        remediation: `Step names an agent that does not exist in the roster: ${step.agent}. A workflow referencing a nonexistent agent dies on dispatch.`
      });
    }
    if (step.skill !== undefined && (typeof step.skill !== 'string' || step.skill.trim() === '')) {
      failures.push({
        id: `workflow:${id}:step:${stepLabel}:skill`,
        status: 'fail',
        remediation: 'Step skill must be a non-empty string when present.'
      });
    }
    if (step['model-tier'] !== undefined && !allowedModelTiers.has(step['model-tier'])) {
      failures.push({
        id: `workflow:${id}:step:${stepLabel}:model-tier`,
        status: 'fail',
        remediation: 'Step model-tier must be frontier, open, or local when present.'
      });
    }
    validateHandoff(id, { ...step, id: stepLabel }, stepIds, failures);
    validateGate(id, { ...step, id: stepLabel }, failures);
  }

  detectCycle(id, steps, failures);

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    workflow: {
      id,
      file: relativeFile,
      schemaVersion: typeof workflow.schemaVersion === 'string' ? workflow.schemaVersion : null,
      name: typeof workflow.name === 'string' ? workflow.name : null,
      steps: steps.length,
      agents: [...new Set(steps.map((step) => step.agent).filter((value) => typeof value === 'string'))],
      gates: steps.filter((step) => step.gate !== undefined).length
    },
    failures
  };
}

export async function inspectWorkflowLibrary(directory, options = {}) {
  const target = path.resolve(directory);
  const root = options.root
    ? path.resolve(options.root)
    : path.join(target, 'framework', 'workflows');
  const relativeRoot = relativePath(path.relative(target, root) || '.');
  if (!await exists(root)) {
    return {
      status: 'fail',
      schemaVersion: workflowLibrarySchemaVersion,
      target,
      root: relativeRoot,
      workflows: [],
      failures: [
        {
          id: 'workflow-library:root',
          status: 'fail',
          remediation: `Create workflow root: ${relativeRoot}`
        }
      ]
    };
  }

  let rosterIds = options.rosterIds;
  const failures = [];
  if (!Array.isArray(rosterIds)) {
    const rosterInspection = await inspectAgentLibrary(target);
    rosterIds = rosterInspection.agents.map((agent) => agent.id);
    if (rosterIds.length === 0) {
      failures.push({
        id: 'workflow-library:roster',
        status: 'fail',
        remediation: 'Workflow validation requires a readable agent roster; none was found.'
      });
    }
  }

  const workflows = [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && /\.ya?ml$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  for (const fileName of files) {
    const file = path.join(root, fileName);
    const inspection = validateWorkflowRecord({
      fileName,
      relativeFile: relativePath(path.relative(target, file)),
      text: await fs.readFile(file, 'utf8'),
      rosterIds
    });
    workflows.push(inspection.workflow);
    failures.push(...inspection.failures);
  }
  if (workflows.length === 0) {
    failures.push({
      id: 'workflow-library:empty',
      status: 'fail',
      remediation: 'Add at least one midas.workflow.v2 file under the workflow root.'
    });
  }
  const ids = workflows.map((workflow) => workflow.id);
  for (const id of new Set(ids.filter((value, index) => ids.indexOf(value) !== index))) {
    failures.push({
      id: `workflow-library:duplicate:${id}`,
      status: 'fail',
      remediation: `Workflow ids must be unique. Duplicate: ${id}`
    });
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: workflowLibrarySchemaVersion,
    target,
    root: relativeRoot,
    workflows,
    failures
  };
}
