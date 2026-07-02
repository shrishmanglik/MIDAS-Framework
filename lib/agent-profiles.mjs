import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const agentProfilesSchemaVersion = 'midas.agent-profiles.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultProfilesPath = path.join(packageRoot, 'framework', 'agents', 'default-agent-profiles.json');
const allowedModes = new Set(['primary', 'subagent', 'system']);
const allowedActions = new Set(['allow', 'ask', 'deny']);
const permissionKeys = ['read', 'search', 'edit', 'shell', 'web', 'task'];
const requiredProfileIds = ['planner', 'builder', 'reviewer', 'researcher'];
const nonMutatingProfileIds = ['planner', 'reviewer', 'researcher'];

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

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function validatePermissions(permissions, id) {
  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
    throw new Error(`Agent profile ${id} permissions must be an object.`);
  }
  for (const key of Object.keys(permissions)) {
    if (!permissionKeys.includes(key)) {
      throw new Error(`Agent profile ${id} has unknown permission key: ${key}.`);
    }
  }
  for (const key of permissionKeys) {
    if (!allowedActions.has(permissions[key])) {
      throw new Error(`Agent profile ${id} permission ${key} must be allow, ask, or deny.`);
    }
  }
}

export function validateAgentProfilesShape(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Agent profiles config must be an object.');
  }
  if (config.schemaVersion !== agentProfilesSchemaVersion) {
    throw new Error(`Agent profiles schemaVersion must be ${agentProfilesSchemaVersion}.`);
  }
  if (!Array.isArray(config.profiles)) {
    throw new Error('Agent profiles config must include profiles array.');
  }
  const seen = new Set();
  for (const profile of config.profiles) {
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      throw new Error('Agent profile entries must be objects.');
    }
    requireString(profile.id, 'Agent profile id');
    if (!/^[a-z][a-z0-9-]*$/.test(profile.id)) {
      throw new Error(`Agent profile id ${profile.id} must be lowercase kebab-case.`);
    }
    if (seen.has(profile.id)) throw new Error(`Duplicate agent profile: ${profile.id}.`);
    seen.add(profile.id);
    if (!allowedModes.has(profile.mode)) {
      throw new Error(`Agent profile ${profile.id} mode must be primary, subagent, or system.`);
    }
    requireString(profile.description, `Agent profile ${profile.id} description`);
    if (!Number.isInteger(profile.maxSteps) || profile.maxSteps < 1 || profile.maxSteps > 40) {
      throw new Error(`Agent profile ${profile.id} maxSteps must be an integer from 1 to 40.`);
    }
    validatePermissions(profile.permissions, profile.id);
  }
  return config;
}

export function evaluateAgentProfiles(config) {
  validateAgentProfilesShape(config);
  const failures = [];
  const profiles = config.profiles.map((profile) => ({
    id: profile.id,
    mode: profile.mode,
    maxSteps: profile.maxSteps,
    permissions: profile.permissions
  }));
  const profileMap = new Map(config.profiles.map((profile) => [profile.id, profile]));

  for (const id of requiredProfileIds) {
    if (!profileMap.has(id)) {
      failures.push({
        id: `agent-profiles:required:${id}`,
        status: 'fail',
        remediation: `Restore required MIDAS agent profile: ${id}.`
      });
    }
  }

  for (const id of nonMutatingProfileIds) {
    const profile = profileMap.get(id);
    if (!profile) continue;
    if (profile.permissions.edit !== 'deny') {
      failures.push({
        id: `agent-profiles:semantic:${id}:edit`,
        status: 'fail',
        remediation: `${id} must keep edit permission at deny. Use builder for workspace mutation.`
      });
    }
    if (profile.permissions.shell === 'allow') {
      failures.push({
        id: `agent-profiles:semantic:${id}:shell`,
        status: 'fail',
        remediation: `${id} must not allow shell by default. Use ask or deny.`
      });
    }
    if (profile.permissions.task === 'allow') {
      failures.push({
        id: `agent-profiles:semantic:${id}:task`,
        status: 'fail',
        remediation: `${id} must not allow task delegation by default. Use ask or deny.`
      });
    }
  }

  const builder = profileMap.get('builder');
  if (builder) {
    for (const key of ['edit', 'shell', 'task']) {
      if (builder.permissions[key] === 'allow') {
        failures.push({
          id: `agent-profiles:semantic:builder:${key}`,
          status: 'fail',
          remediation: `builder ${key} permission must stay approval-aware. Use ask, not allow.`
        });
      }
    }
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: config.schemaVersion,
    profiles,
    requiredProfileIds,
    failures
  };
}

export async function loadAgentProfiles(options = {}) {
  const root = path.resolve(options.root ?? packageRoot);
  const file = options.file
    ? path.resolve(options.file)
    : path.join(root, 'framework', 'agents', 'default-agent-profiles.json');
  const text = await fs.readFile(file, 'utf8').catch(async (error) => {
    if (file !== defaultProfilesPath) throw error;
    return fs.readFile(defaultProfilesPath, 'utf8');
  });
  return validateAgentProfilesShape(JSON.parse(text));
}

export async function writeAgentProfiles({ directory, profiles }) {
  const target = path.resolve(directory);
  const config = validateAgentProfilesShape(profiles ?? await loadAgentProfiles());
  await fs.mkdir(path.join(target, '.midas'), { recursive: true });
  const file = path.join(target, '.midas', 'agent-profiles.json');
  await fs.writeFile(file, `${JSON.stringify(config, null, 2)}\n`);
  return {
    file: relativePath(path.relative(target, file)),
    profiles: config
  };
}

export function renderAgentProfiles(config) {
  validateAgentProfilesShape(config);
  return `## Agent Profiles

${config.profiles.map((profile) => {
    const permissions = permissionKeys.map((key) => `${key}=${profile.permissions[key]}`).join(', ');
    return `- ${profile.id} (${profile.mode}, max ${profile.maxSteps} steps): ${profile.description} Permissions: ${permissions}.`;
  }).join('\n')}
`;
}

export async function inspectAgentProfiles(directory) {
  const target = path.resolve(directory);
  const file = path.join(target, '.midas', 'agent-profiles.json');
  if (!await exists(file)) {
    return {
      status: 'fail',
      target,
      file: relativePath(path.relative(target, file)),
      profiles: [],
      failures: [
        {
          id: 'agent-profiles:file',
          status: 'fail',
          remediation: 'Run midas install or midas update to create .midas/agent-profiles.json.'
        }
      ]
    };
  }
  try {
    const config = await loadAgentProfiles({ file });
    return {
      target,
      file: relativePath(path.relative(target, file)),
      ...evaluateAgentProfiles(config)
    };
  } catch (error) {
    return {
      status: 'fail',
      target,
      file: relativePath(path.relative(target, file)),
      profiles: [],
      failures: [
        {
          id: 'agent-profiles:shape',
          status: 'fail',
          remediation: error.message
        }
      ]
    };
  }
}
