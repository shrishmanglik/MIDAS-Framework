/**
 * midas.autorun.v1 — work-order frontmatter state machine.
 *
 * A work-order markdown file carries its execution state in YAML frontmatter.
 * States: clarify -> spec -> implement -> review -> finalize, plus HALTED.
 *
 * Transition rules:
 * - Forward one step only: clarify->spec, spec->implement, implement->review,
 *   review->finalize. No skips, with ONE documented exception:
 * - Fast-path (quick-flow): clarify->implement is legal ONLY when the advance is
 *   requested with `fastPath: true`. It records `fastPath: true` in frontmatter.
 * - Review is never skipped: implement->finalize is illegal in every mode, and the
 *   fast-path never spans review.
 * - Rework loop: review->implement is legal and requires a reason (structured
 *   rejection, not a skip).
 * - HALT is legal from any non-terminal state and REQUIRES a reason. Halting
 *   records `haltedFrom`; resume returns to exactly that state.
 * - finalize is terminal. No transitions out.
 *
 * Continue-until-HALT contract (the external-orchestrator poll surface):
 * An orchestrator polls `midas next <workorder>` (or pollAutorun()). While
 * `status === "active"` it dispatches `nextAction` and advances the state when
 * the action's evidence is in. There are NO session-boundary pauses: only a HALT
 * condition (status "halted", with machine-readable `haltReason`) or reaching
 * `finalize` (status "complete") ends a run. A halted run resumes via
 * resumeAutorun() once the halt reason is resolved; mid-run replans route through
 * the correct-course skill, which halts, edits the work order, and resumes.
 *
 * All functions operate on the work-order file's frontmatter only; the markdown
 * body below the frontmatter is preserved byte-for-byte, as are any frontmatter
 * keys this module does not manage.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

export const AUTORUN_SCHEMA = 'midas.autorun.v1';
export const AUTORUN_STATES = ['clarify', 'spec', 'implement', 'review', 'finalize'];
export const HALTED = 'HALTED';

const MANAGED_KEYS = new Set(['autorun', 'state', 'fastPath', 'haltReason', 'haltedFrom', 'updatedAt']);

const NEXT_ACTION_CONTRACTS = {
  clarify: {
    action: 'clarify-requirements',
    description: 'Resolve open questions and pin acceptance details in the work order. Advance to spec (or implement via fast-path for quick-flow).'
  },
  spec: {
    action: 'write-spec',
    description: 'Write the implementation spec/plan for the work order. Advance to implement.'
  },
  implement: {
    action: 'implement',
    description: 'Implement the work order with evidence. Advance to review. Review is never skipped.'
  },
  review: {
    action: 'review',
    description: 'Independent review of the implementation. Advance to finalize, or back to implement with a rework reason.'
  },
  finalize: {
    action: 'finalize-and-close',
    description: 'Record evidence, close the ledger entry, and clean up. Terminal state.'
  }
};

function legalTargets(state) {
  switch (state) {
    case 'clarify':
      return ['spec', 'implement'];
    case 'spec':
      return ['implement'];
    case 'implement':
      return ['review'];
    case 'review':
      return ['finalize', 'implement'];
    case 'finalize':
      return [];
    default:
      return [];
  }
}

function splitFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { lines: null, body: text };
  const match = /\n---(\n|$)/.exec(normalized.slice(3));
  if (!match) return { lines: null, body: text };
  const end = 3 + match.index;
  const block = normalized.slice(4, end);
  const bodyStart = end + match[0].length;
  const body = bodyStart >= normalized.length ? '' : normalized.slice(bodyStart);
  return { lines: block.split('\n'), body };
}

function parseManaged(lines) {
  const managed = {};
  const foreign = [];
  const history = [];
  let inHistory = false;
  for (const line of lines ?? []) {
    if (/^history:\s*$/.test(line)) {
      inHistory = true;
      continue;
    }
    if (inHistory && /^\s+-\s/.test(line)) {
      history.push(line.replace(/^\s+-\s/, '').replace(/^["']|["']$/g, ''));
      continue;
    }
    inHistory = false;
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (match && MANAGED_KEYS.has(match[1])) {
      managed[match[1]] = match[2].replace(/^["']|["']$/g, '');
    } else {
      foreign.push(line);
    }
  }
  return { managed, foreign, history };
}

function renderFrontmatter({ managed, foreign, history }) {
  const lines = ['---'];
  for (const line of foreign) {
    if (line.trim() !== '') lines.push(line);
  }
  lines.push(`autorun: ${AUTORUN_SCHEMA}`);
  lines.push(`state: ${managed.state}`);
  if (managed.fastPath === 'true' || managed.fastPath === true) lines.push('fastPath: true');
  if (managed.haltReason) lines.push(`haltReason: "${String(managed.haltReason).replace(/"/g, "'")}"`);
  if (managed.haltedFrom) lines.push(`haltedFrom: ${managed.haltedFrom}`);
  lines.push(`updatedAt: ${managed.updatedAt}`);
  if (history.length > 0) {
    lines.push('history:');
    for (const entry of history) {
      lines.push(`  - "${String(entry).replace(/"/g, "'")}"`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

async function loadWorkOrder(file) {
  const resolved = path.resolve(file);
  const text = await fs.readFile(resolved, 'utf8');
  const { lines, body } = splitFrontmatter(text);
  const { managed, foreign, history } = parseManaged(lines);
  return { file: resolved, text, hasFrontmatter: lines !== null, managed, foreign, history, body };
}

async function saveWorkOrder(record) {
  const frontmatter = renderFrontmatter(record);
  await fs.writeFile(record.file, `${frontmatter}\n${record.body}`);
}

function validState(state) {
  return state === HALTED || AUTORUN_STATES.includes(state);
}

/**
 * Read the autorun state of a work-order file. Never mutates.
 * Returns { schema, workOrder, status, state, ... } even when uninitialized.
 */
export async function readAutorun(file) {
  const record = await loadWorkOrder(file);
  const state = record.managed.state;
  if (!record.hasFrontmatter || record.managed.autorun !== AUTORUN_SCHEMA || !validState(state)) {
    return {
      schema: AUTORUN_SCHEMA,
      workOrder: record.file,
      status: 'uninitialized',
      state: null,
      reasonNotScorable: !record.hasFrontmatter
        ? 'work order has no frontmatter'
        : record.managed.autorun !== AUTORUN_SCHEMA
          ? 'frontmatter does not declare autorun: midas.autorun.v1'
          : `invalid state: ${state}`
    };
  }
  return {
    schema: AUTORUN_SCHEMA,
    workOrder: record.file,
    status: state === HALTED ? 'halted' : state === 'finalize' ? 'complete' : 'active',
    state,
    fastPath: record.managed.fastPath === 'true',
    haltReason: record.managed.haltReason ?? null,
    haltedFrom: record.managed.haltedFrom ?? null,
    updatedAt: record.managed.updatedAt ?? null,
    history: record.history
  };
}

/**
 * Initialize midas.autorun.v1 frontmatter on a work-order file at state clarify.
 * Fails if the file already carries autorun state.
 */
export async function initAutorun({ file, state = 'clarify' }) {
  const record = await loadWorkOrder(file);
  if (record.hasFrontmatter && record.managed.autorun === AUTORUN_SCHEMA) {
    throw new Error(`Work order already initialized at state ${record.managed.state}: ${record.file}`);
  }
  if (!AUTORUN_STATES.includes(state)) {
    throw new Error(`Cannot initialize at unknown state: ${state}`);
  }
  const now = new Date().toISOString();
  record.managed = { state, updatedAt: now };
  record.history = [`${now} initialized at ${state}`];
  if (!record.hasFrontmatter) {
    // Whole file becomes body under new frontmatter.
    record.body = record.text;
    record.foreign = [];
  }
  await saveWorkOrder(record);
  return readAutorun(file);
}

/**
 * Advance the state machine. Enforces:
 * - forward-only single steps (see legalTargets)
 * - fast-path clarify->implement only with fastPath: true (quick-flow)
 * - review->implement rework requires a reason
 * - review is never skipped (implement->finalize always illegal)
 * - HALTED cannot be advanced; use resumeAutorun
 * - finalize is terminal
 */
export async function advanceAutorun({ file, to, reason, fastPath = false }) {
  const record = await loadWorkOrder(file);
  if (!record.hasFrontmatter || record.managed.autorun !== AUTORUN_SCHEMA) {
    throw new Error(`Work order is not autorun-initialized; run initAutorun first: ${path.resolve(file)}`);
  }
  const from = record.managed.state;
  if (from === HALTED) {
    throw new Error('Work order is HALTED; resolve the halt reason and resume before advancing.');
  }
  if (from === 'finalize') {
    throw new Error('finalize is terminal; no transitions out.');
  }
  if (!AUTORUN_STATES.includes(to)) {
    throw new Error(`Unknown target state: ${to}`);
  }
  if (!legalTargets(from).includes(to)) {
    throw new Error(`Illegal transition ${from} -> ${to}. Legal targets from ${from}: ${legalTargets(from).join(', ') || '(none)'}.`);
  }
  if (from === 'clarify' && to === 'implement' && !fastPath) {
    throw new Error('clarify -> implement is the quick-flow fast-path and requires fastPath: true (spec is being skipped on record).');
  }
  if (from === 'review' && to === 'implement' && !reason) {
    throw new Error('review -> implement rework requires a reason.');
  }
  const now = new Date().toISOString();
  const usedFastPath = from === 'clarify' && to === 'implement';
  record.managed.state = to;
  record.managed.updatedAt = now;
  if (usedFastPath) record.managed.fastPath = 'true';
  delete record.managed.haltReason;
  delete record.managed.haltedFrom;
  record.history.push(`${now} ${from}->${to}${usedFastPath ? ' (fast-path)' : ''}${reason ? `: ${reason}` : ''}`);
  await saveWorkOrder(record);
  return readAutorun(file);
}

/** HALT from any non-terminal state. reason is mandatory and becomes data. */
export async function haltAutorun({ file, reason }) {
  if (!reason || String(reason).trim() === '') {
    throw new Error('HALT requires a reason.');
  }
  const record = await loadWorkOrder(file);
  if (!record.hasFrontmatter || record.managed.autorun !== AUTORUN_SCHEMA) {
    throw new Error(`Work order is not autorun-initialized; run initAutorun first: ${path.resolve(file)}`);
  }
  const from = record.managed.state;
  if (from === HALTED) {
    throw new Error(`Work order is already HALTED (reason: ${record.managed.haltReason ?? 'unrecorded'}).`);
  }
  if (from === 'finalize') {
    throw new Error('finalize is terminal; a completed run cannot be halted.');
  }
  const now = new Date().toISOString();
  record.managed.state = HALTED;
  record.managed.haltReason = reason;
  record.managed.haltedFrom = from;
  record.managed.updatedAt = now;
  record.history.push(`${now} ${from}->HALTED: ${reason}`);
  await saveWorkOrder(record);
  return readAutorun(file);
}

/** Resume a HALTED work order back to the exact state it halted from. */
export async function resumeAutorun({ file, reason }) {
  const record = await loadWorkOrder(file);
  if (!record.hasFrontmatter || record.managed.autorun !== AUTORUN_SCHEMA) {
    throw new Error(`Work order is not autorun-initialized; run initAutorun first: ${path.resolve(file)}`);
  }
  if (record.managed.state !== HALTED) {
    throw new Error(`Work order is not HALTED (state: ${record.managed.state}).`);
  }
  const target = record.managed.haltedFrom;
  if (!AUTORUN_STATES.includes(target)) {
    throw new Error(`Cannot resume: haltedFrom is missing or invalid (${target ?? 'unset'}).`);
  }
  const now = new Date().toISOString();
  record.managed.state = target;
  record.managed.updatedAt = now;
  delete record.managed.haltReason;
  delete record.managed.haltedFrom;
  record.history.push(`${now} HALTED->${target} (resumed)${reason ? `: ${reason}` : ''}`);
  await saveWorkOrder(record);
  return readAutorun(file);
}

/**
 * The external-orchestrator poll surface backing `midas next <workorder>`.
 * Read-only. Returns current state plus the next-action contract as data.
 */
export async function pollAutorun({ file }) {
  const snapshot = await readAutorun(file);
  if (snapshot.status === 'uninitialized') {
    return {
      ...snapshot,
      nextAction: {
        action: 'initialize-autorun',
        description: `Initialize midas.autorun.v1 frontmatter on this work order (${snapshot.reasonNotScorable}).`,
        allowedTransitions: ['clarify'],
        haltAllowed: false,
        terminal: false
      }
    };
  }
  if (snapshot.status === 'halted') {
    return {
      ...snapshot,
      nextAction: {
        action: 'resolve-halt',
        description: `Run is HALTED (${snapshot.haltReason ?? 'no reason recorded'}). Resolve the halt condition, then resume to ${snapshot.haltedFrom ?? 'the halted state'}. Mid-run replans route through the correct-course skill.`,
        allowedTransitions: snapshot.haltedFrom ? [snapshot.haltedFrom] : [],
        haltAllowed: false,
        terminal: false
      }
    };
  }
  if (snapshot.status === 'complete') {
    return {
      ...snapshot,
      nextAction: {
        action: 'none',
        description: 'Run complete. finalize is terminal; pick the next work order.',
        allowedTransitions: [],
        haltAllowed: false,
        terminal: true
      }
    };
  }
  const contract = NEXT_ACTION_CONTRACTS[snapshot.state];
  return {
    ...snapshot,
    nextAction: {
      ...contract,
      allowedTransitions: legalTargets(snapshot.state),
      haltAllowed: true,
      terminal: false
    }
  };
}
