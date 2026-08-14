import fs from 'node:fs/promises';
import path from 'node:path';

export const agentLibrarySchemaVersion = 'midas.agent.v1';

const allowedActions = new Set(['allow', 'ask', 'deny']);
const permissionKeys = ['read', 'search', 'edit', 'shell', 'web', 'task'];
const allowedModelTiers = new Set(['frontier', 'open', 'local']);
const routedDownTiers = new Set(['open', 'local']);
const requiredSections = [
  'Purpose',
  'Capabilities',
  'Behavioral Traits',
  'Workflow Position',
  'Response Approach',
  'Guardrails',
  'Claim Ceiling'
];
const maxBodyLines = 200;
const reviewerClassPattern = /(review|audit)/;
const researcherClassPattern = /research/;

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

function coerceScalar(raw) {
  const value = raw.replace(/^["']|["']$/g, '');
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return Number.parseInt(value, 10);
  return value;
}

export function parseAgentMarkdown(text) {
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    throw new Error('Agent file must start with YAML frontmatter.');
  }
  const normalized = text.replace(/\r\n/g, '\n');
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) throw new Error('Agent frontmatter must end with --- on its own line.');
  const rawFrontmatter = normalized.slice(4, end);
  const body = normalized.slice(end + 5).trim();
  const frontmatter = {};
  let openObjectKey = null;
  for (const line of rawFrontmatter.split('\n')) {
    if (line.trim() === '') continue;
    const nested = line.match(/^ {2}([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*?)\s*$/);
    if (nested && openObjectKey) {
      frontmatter[openObjectKey][nested[1]] = coerceScalar(nested[2]);
      continue;
    }
    const match = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*?)\s*$/);
    if (!match) throw new Error(`Unsupported agent frontmatter line: ${line}`);
    if (match[2] === '') {
      openObjectKey = match[1];
      frontmatter[match[1]] = {};
      continue;
    }
    openObjectKey = null;
    frontmatter[match[1]] = coerceScalar(match[2]);
  }
  return { frontmatter, body };
}

function validAgentName(name) {
  return /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(name) && !name.includes('--');
}

function validatePermissions(permissions, failures, id) {
  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
    failures.push({
      id: `agent:${id}:permissions`,
      status: 'fail',
      remediation: 'Agent permissions must be a frontmatter object over read/search/edit/shell/web/task.'
    });
    return;
  }
  for (const key of Object.keys(permissions)) {
    if (!permissionKeys.includes(key)) {
      failures.push({
        id: `agent:${id}:permissions-unknown`,
        status: 'fail',
        remediation: `Agent permissions has unknown key: ${key}.`
      });
    }
  }
  for (const key of permissionKeys) {
    if (!allowedActions.has(permissions[key])) {
      failures.push({
        id: `agent:${id}:permission-${key}`,
        status: 'fail',
        remediation: `Agent permission ${key} must be allow, ask, or deny.`
      });
    }
  }
}

function validateSemanticInvariants(id, permissions, failures) {
  if (!permissions || typeof permissions !== 'object') return;
  if (reviewerClassPattern.test(id) && permissions.edit !== 'deny') {
    failures.push({
      id: `agent:${id}:semantic-reviewer-edit`,
      status: 'fail',
      remediation: 'Reviewer-class agents (name containing review/audit) must keep edit permission at deny. Route mutation to builder.'
    });
  }
  if (researcherClassPattern.test(id) && permissions.shell !== 'deny') {
    failures.push({
      id: `agent:${id}:semantic-researcher-shell`,
      status: 'fail',
      remediation: 'Researcher-class agents (name containing research) must keep shell permission at deny.'
    });
  }
}

export function validateAgentRecord({ fileName, relativeFile, text }) {
  const failures = [];
  const expectedName = fileName.replace(/\.md$/i, '');
  let parsed;
  try {
    parsed = parseAgentMarkdown(text);
  } catch (error) {
    return {
      status: 'fail',
      agent: { id: expectedName, file: relativeFile },
      failures: [
        {
          id: `agent:${expectedName}:frontmatter`,
          status: 'fail',
          remediation: error.message
        }
      ]
    };
  }

  const { frontmatter, body } = parsed;
  const id = typeof frontmatter.name === 'string' && frontmatter.name !== '' ? frontmatter.name : expectedName;

  if (typeof frontmatter.name !== 'string' || !validAgentName(frontmatter.name)) {
    failures.push({
      id: `agent:${id}:name`,
      status: 'fail',
      remediation: 'Agent name must be 1-64 lowercase letters, numbers, and hyphens; no leading/trailing or consecutive hyphens.'
    });
  }
  if (frontmatter.name !== expectedName) {
    failures.push({
      id: `agent:${id}:file-match`,
      status: 'fail',
      remediation: `Agent name must match its filename. Expected ${expectedName}.`
    });
  }
  if (typeof frontmatter.description !== 'string' || frontmatter.description.trim() === '' || frontmatter.description.length > 1024) {
    failures.push({
      id: `agent:${id}:description`,
      status: 'fail',
      remediation: 'Agent description must be 1-1024 characters.'
    });
  } else if (!/\bUse (when|for)\b/i.test(frontmatter.description)) {
    failures.push({
      id: `agent:${id}:description-trigger`,
      status: 'fail',
      remediation: 'Agent description must state a dispatch trigger ("Use when" or "Use for"), never summarize its own process.'
    });
  }
  if (typeof frontmatter.license !== 'string' || frontmatter.license.trim() === '') {
    failures.push({
      id: `agent:${id}:license`,
      status: 'fail',
      remediation: 'Agent files must declare a license field (with source attribution in the Provenance line when adapted).'
    });
  }
  if (!allowedModelTiers.has(frontmatter['model-tier'])) {
    failures.push({
      id: `agent:${id}:model-tier`,
      status: 'fail',
      remediation: 'Agent model-tier must be frontier, open, or local.'
    });
  }
  if (frontmatter.escalation !== undefined && (typeof frontmatter.escalation !== 'string' || frontmatter.escalation.trim() === '')) {
    failures.push({
      id: `agent:${id}:escalation`,
      status: 'fail',
      remediation: 'Agent escalation must be a non-empty policy string when present.'
    });
  }
  if (routedDownTiers.has(frontmatter['model-tier'])) {
    if (frontmatter['gold-reference'] !== true || frontmatter['deterministic-check'] !== true) {
      failures.push({
        id: `agent:${id}:routing-flags`,
        status: 'fail',
        remediation: 'Agents routed to open or local tiers must declare gold-reference: true and deterministic-check: true. Without both, route the work up to frontier.'
      });
    }
  }
  if (!Number.isInteger(frontmatter.maxSteps) || frontmatter.maxSteps < 1 || frontmatter.maxSteps > 40) {
    failures.push({
      id: `agent:${id}:max-steps`,
      status: 'fail',
      remediation: 'Agent maxSteps must be an integer from 1 to 40.'
    });
  }
  validatePermissions(frontmatter.permissions, failures, id);
  validateSemanticInvariants(id, frontmatter.permissions, failures);

  if (body.length === 0) {
    failures.push({
      id: `agent:${id}:body`,
      status: 'fail',
      remediation: 'Agent file must include a persona body after frontmatter.'
    });
  }
  for (const section of requiredSections) {
    const heading = new RegExp(`^##\\s+${section}\\s*$`, 'm');
    if (!heading.test(body)) {
      failures.push({
        id: `agent:${id}:section-${section.toLowerCase().replaceAll(' ', '-')}`,
        status: 'fail',
        remediation: `Agent body must include a "## ${section}" section.`
      });
    }
  }
  const lineCount = body.split(/\n/).length;
  if (lineCount > maxBodyLines) {
    failures.push({
      id: `agent:${id}:body-lines`,
      status: 'fail',
      remediation: `Agent body is ${lineCount} lines; the persona budget is ${maxBodyLines} lines. Trim, do not extend.`
    });
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    agent: {
      id,
      file: relativeFile,
      modelTier: frontmatter['model-tier'] ?? null,
      escalation: frontmatter.escalation ?? null,
      goldReference: frontmatter['gold-reference'] === true,
      deterministicCheck: frontmatter['deterministic-check'] === true,
      maxSteps: Number.isInteger(frontmatter.maxSteps) ? frontmatter.maxSteps : null,
      permissions: frontmatter.permissions && typeof frontmatter.permissions === 'object' ? frontmatter.permissions : null,
      bodyLines: lineCount
    },
    failures
  };
}

export async function inspectAgentLibrary(directory, options = {}) {
  const target = path.resolve(directory);
  const root = options.root
    ? path.resolve(options.root)
    : path.join(target, 'framework', 'agents', 'roster');
  const relativeRoot = relativePath(path.relative(target, root) || '.');
  if (!await exists(root)) {
    return {
      status: 'fail',
      schemaVersion: agentLibrarySchemaVersion,
      target,
      root: relativeRoot,
      agents: [],
      failures: [
        {
          id: 'agent-library:root',
          status: 'fail',
          remediation: `Create agent roster root: ${relativeRoot}`
        }
      ]
    };
  }

  const agents = [];
  const failures = [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  for (const fileName of files) {
    const file = path.join(root, fileName);
    const inspection = validateAgentRecord({
      fileName,
      relativeFile: relativePath(path.relative(target, file)),
      text: await fs.readFile(file, 'utf8')
    });
    agents.push(inspection.agent);
    failures.push(...inspection.failures);
  }
  if (agents.length === 0) {
    failures.push({
      id: 'agent-library:empty',
      status: 'fail',
      remediation: 'Add at least one midas.agent.v1 roster file under the agent roster root.'
    });
  }
  const ids = agents.map((agent) => agent.id);
  for (const id of new Set(ids.filter((value, index) => ids.indexOf(value) !== index))) {
    failures.push({
      id: `agent-library:duplicate:${id}`,
      status: 'fail',
      remediation: `Agent ids must be unique. Duplicate: ${id}`
    });
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: agentLibrarySchemaVersion,
    target,
    root: relativeRoot,
    agents,
    failures
  };
}
