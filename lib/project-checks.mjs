import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const maxTimeoutMs = 600000;
const defaultTimeoutMs = 120000;
const blockedCommands = new Set(['bash', 'cmd', 'cmd.exe', 'del', 'erase', 'format', 'powershell', 'powershell.exe', 'pwsh', 'rm', 'rmdir', 'sh']);

function isPlainCommand(command) {
  return !command.includes('/') && !command.includes('\\');
}

function normalizeTimeout(value) {
  if (value === undefined) return defaultTimeoutMs;
  if (!Number.isInteger(value) || value < 1000 || value > maxTimeoutMs) {
    throw new Error(`Project check timeout must be an integer between 1000 and ${maxTimeoutMs}.`);
  }
  return value;
}

function resolveContainedPath(root, value) {
  const resolved = path.resolve(root, value ?? '.');
  const relative = path.relative(root, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Project check paths must stay inside the workspace.');
  }
  return resolved;
}

function normalizeCommand(root, check) {
  if (typeof check.command !== 'string' || check.command.trim() === '') {
    throw new Error(`Project check ${check.id} must declare a command.`);
  }

  const command = check.command.trim();
  const basename = path.basename(command).toLowerCase();
  if (blockedCommands.has(basename)) {
    throw new Error(`Project check ${check.id} uses a blocked shell or destructive command.`);
  }

  if (isPlainCommand(command)) return command;
  return resolveContainedPath(root, command);
}

export function validateProjectChecksConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Project checks config must be an object.');
  }
  if (config.version !== '0.1') {
    throw new Error('Project checks config version must be 0.1.');
  }
  if (!Array.isArray(config.checks)) {
    throw new Error('Project checks config must include a checks array.');
  }

  const seen = new Set();
  for (const check of config.checks) {
    if (!check || typeof check !== 'object' || Array.isArray(check)) {
      throw new Error('Each project check must be an object.');
    }
    if (typeof check.id !== 'string' || !/^[a-z0-9][a-z0-9-]{1,60}$/i.test(check.id)) {
      throw new Error('Each project check id must be a short slug.');
    }
    if (seen.has(check.id)) throw new Error(`Duplicate project check id: ${check.id}`);
    seen.add(check.id);
    if (typeof check.command !== 'string' || check.command.trim() === '') {
      throw new Error(`Project check ${check.id} must declare a command.`);
    }
    if (blockedCommands.has(path.basename(check.command.trim()).toLowerCase())) {
      throw new Error(`Project check ${check.id} uses a blocked shell or destructive command.`);
    }
    if (check.args !== undefined && (!Array.isArray(check.args) || check.args.some((arg) => typeof arg !== 'string'))) {
      throw new Error(`Project check ${check.id} args must be a string array.`);
    }
    if (check.cwd !== undefined && typeof check.cwd !== 'string') {
      throw new Error(`Project check ${check.id} cwd must be a string.`);
    }
    if (check.enabled !== undefined && typeof check.enabled !== 'boolean') {
      throw new Error(`Project check ${check.id} enabled must be boolean.`);
    }
    normalizeTimeout(check.timeoutMs);
  }
  return config;
}

export async function loadProjectChecks(target) {
  const file = path.join(target, '.midas', 'checks.json');
  const text = await fs.readFile(file, 'utf8');
  return validateProjectChecksConfig(JSON.parse(text));
}

export async function runProjectChecks(target, options = {}) {
  const config = await loadProjectChecks(target);
  const enabled = config.checks.filter((check) => check.enabled !== false);
  const results = [];

  for (const check of enabled) {
    const cwd = resolveContainedPath(target, check.cwd ?? '.');
    const command = normalizeCommand(target, check);
    const args = check.args ?? [];
    const timeout = normalizeTimeout(check.timeoutMs);
    const started = Date.now();

    try {
      const output = await execFileAsync(command, args, {
        cwd,
        timeout,
        windowsHide: true,
        maxBuffer: options.maxBuffer ?? 1024 * 1024
      });
      results.push({
        id: check.id,
        status: 'pass',
        command,
        args,
        elapsedMs: Date.now() - started,
        stdout: output.stdout.slice(-4000),
        stderr: output.stderr.slice(-4000)
      });
    } catch (error) {
      results.push({
        id: check.id,
        status: 'fail',
        command,
        args,
        elapsedMs: Date.now() - started,
        exitCode: error.code ?? null,
        stdout: String(error.stdout ?? '').slice(-4000),
        stderr: String(error.stderr ?? error.message ?? '').slice(-4000)
      });
    }
  }

  return {
    status: results.every((result) => result.status === 'pass') ? 'pass' : 'fail',
    total: enabled.length,
    results
  };
}
