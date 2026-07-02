import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adapterFilePath, assertSupportedTools, supportedTools } from './catalog.mjs';

export const adapterContractsSchemaVersion = 'midas.adapter-contracts.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultContractsPath = path.join(packageRoot, 'framework', 'adapters', 'adapter-contracts.json');

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function isFile(file) {
  try {
    const stats = await fs.stat(file);
    return stats.isFile();
  } catch {
    return false;
  }
}

function assertStringList(value, field) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    throw new Error(`${field} must be a non-empty string list.`);
  }
}

function assertSafeRelativePath(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} must be a non-empty string.`);
  }
  if (path.isAbsolute(value) || value.includes('..') || value.includes('\\')) {
    throw new Error(`${field} must be a forward-slash workspace-relative path.`);
  }
}

export function validateAdapterContractsShape(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Adapter contracts config must be an object.');
  }
  if (config.schemaVersion !== adapterContractsSchemaVersion) {
    throw new Error(`Adapter contracts schemaVersion must be ${adapterContractsSchemaVersion}.`);
  }
  if (!Array.isArray(config.contracts) || config.contracts.length === 0) {
    throw new Error('Adapter contracts config must include contracts.');
  }
  const ids = config.contracts.map((contract) => contract.id);
  assertSupportedTools(ids);
  const seen = new Set();
  for (const contract of config.contracts) {
    if (seen.has(contract.id)) throw new Error(`Duplicate adapter contract: ${contract.id}.`);
    seen.add(contract.id);
    if (typeof contract.kind !== 'string' || contract.kind.trim() === '') {
      throw new Error(`Adapter contract kind for ${contract.id} must be a non-empty string.`);
    }
    assertSafeRelativePath(contract.adapterPath, `adapterPath for ${contract.id}`);
    const expected = adapterFilePath(contract.id);
    if (contract.adapterPath !== expected) {
      throw new Error(`Adapter contract path for ${contract.id} must be ${expected}.`);
    }
    if (!Number.isInteger(contract.maxChars) || contract.maxChars < 1000) {
      throw new Error(`Adapter contract maxChars for ${contract.id} must be an integer >= 1000.`);
    }
    assertStringList(contract.requiredHeadings, `requiredHeadings for ${contract.id}`);
    assertStringList(contract.requiredPhrases, `requiredPhrases for ${contract.id}`);
  }
  const missing = supportedTools.filter((tool) => !seen.has(tool));
  if (missing.length > 0) {
    throw new Error(`Adapter contracts missing supported tools: ${missing.join(', ')}`);
  }
  return config;
}

export async function loadAdapterContracts(options = {}) {
  const root = path.resolve(options.root ?? packageRoot);
  const file = options.file
    ? path.resolve(options.file)
    : path.join(root, 'framework', 'adapters', 'adapter-contracts.json');
  const text = await fs.readFile(file, 'utf8').catch(async (error) => {
    if (file !== defaultContractsPath) throw error;
    return fs.readFile(defaultContractsPath, 'utf8');
  });
  return validateAdapterContractsShape(JSON.parse(text));
}

async function parseManifestTools(target) {
  const file = path.join(target, '.midas', '_config', 'manifest.yaml');
  const text = await fs.readFile(file, 'utf8');
  const tools = [];
  let inTools = false;
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === 'tools:') {
      inTools = true;
      continue;
    }
    if (inTools && /^\S/.test(line)) break;
    const match = inTools ? line.match(/^\s*-\s+(.+?)\s*$/) : null;
    if (match) tools.push(match[1]);
  }
  assertSupportedTools(tools);
  return tools;
}

function inspectAdapterText(contract, text) {
  const failures = [];
  for (const heading of contract.requiredHeadings) {
    if (!text.includes(heading)) {
      failures.push({
        id: `adapter-contract:${contract.id}:heading`,
        status: 'fail',
        remediation: `Regenerate ${contract.adapterPath}; missing required heading: ${heading}`
      });
    }
  }
  for (const phrase of contract.requiredPhrases) {
    if (!text.includes(phrase)) {
      failures.push({
        id: `adapter-contract:${contract.id}:phrase`,
        status: 'fail',
        remediation: `Regenerate ${contract.adapterPath}; missing required phrase: ${phrase}`
      });
    }
  }
  if (text.length > contract.maxChars) {
    failures.push({
      id: `adapter-contract:${contract.id}:budget`,
      status: 'fail',
      remediation: `${contract.adapterPath} is ${text.length} chars; keep it under ${contract.maxChars} chars.`
    });
  }
  return failures;
}

export async function inspectAdapterContracts(directory, options = {}) {
  const target = path.resolve(directory);
  const contractsConfig = await loadAdapterContracts(options);
  const installedTools = await parseManifestTools(target).catch(() => contractsConfig.contracts.map((contract) => contract.id));
  const installed = new Set(installedTools);
  const results = [];
  const failures = [];

  for (const contract of contractsConfig.contracts.filter((item) => installed.has(item.id))) {
    const file = path.join(target, contract.adapterPath);
    const present = await exists(file);
    const regularFile = await isFile(file);
    const result = {
      id: contract.id,
      kind: contract.kind,
      adapterPath: contract.adapterPath,
      present,
      regularFile,
      charCount: 0,
      status: 'pass'
    };

    if (!present || !regularFile) {
      result.status = 'fail';
      failures.push({
        id: `adapter-contract:${contract.id}:file`,
        status: 'fail',
        remediation: `Regenerate missing or invalid adapter file: ${contract.adapterPath}`
      });
      results.push(result);
      continue;
    }

    const text = await fs.readFile(file, 'utf8');
    result.charCount = text.length;
    const adapterFailures = inspectAdapterText(contract, text);
    if (adapterFailures.length > 0) {
      result.status = 'fail';
      failures.push(...adapterFailures);
    }
    results.push(result);
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    target,
    schemaVersion: contractsConfig.schemaVersion,
    adapters: results,
    failures
  };
}
