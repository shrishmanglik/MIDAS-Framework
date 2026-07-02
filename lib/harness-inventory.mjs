import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { adapterFilePath, assertSupportedTools, supportedTools } from './catalog.mjs';

const schemaVersion = 'midas.harness-inventory.v1';

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

async function isFile(file) {
  try {
    const stats = await fs.stat(file);
    return stats.isFile();
  } catch {
    return false;
  }
}

export function hashText(text) {
  return `sha256:${crypto.createHash('sha256').update(text).digest('hex')}`;
}

function assertSafeRelativePath(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} must be a non-empty string.`);
  }
  if (path.isAbsolute(value) || value.includes('..') || value.includes('\\')) {
    throw new Error(`${field} must be a forward-slash workspace-relative path.`);
  }
}

export function createHarnessInventory({ modules, tools, policyVersion, adapterHashes = {} }) {
  assertSupportedTools(tools);
  return {
    schemaVersion,
    generatedBy: 'midas install',
    modules,
    permissionPolicy: {
      source: 'shared-adapter-permission-policy',
      version: policyVersion
    },
    adapters: tools.map((tool) => ({
      id: tool,
      status: 'generated',
      adapterPath: adapterFilePath(tool),
      contentHash: adapterHashes[tool] ?? null,
      verification: {
        required: true,
        command: 'midas inventory'
      }
    })),
    checks: [
      {
        id: 'adapter-files-present',
        description: 'Every generated adapter path listed here must exist in the workspace.'
      },
      {
        id: 'manifest-tools-match',
        description: 'The installed manifest tool list must match this inventory.'
      }
    ]
  };
}

export function validateHarnessInventoryShape(inventory) {
  if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory)) {
    throw new Error('Harness inventory must be an object.');
  }
  if (inventory.schemaVersion !== schemaVersion) {
    throw new Error(`Harness inventory schemaVersion must be ${schemaVersion}.`);
  }
  if (!Array.isArray(inventory.adapters)) {
    throw new Error('Harness inventory adapters must be an array.');
  }
  const toolIds = inventory.adapters.map((adapter) => adapter.id);
  assertSupportedTools(toolIds);
  const seen = new Set();
  for (const adapter of inventory.adapters) {
    if (seen.has(adapter.id)) throw new Error(`Duplicate harness adapter: ${adapter.id}.`);
    seen.add(adapter.id);
    assertSafeRelativePath(adapter.adapterPath, `adapterPath for ${adapter.id}`);
    const expected = adapterFilePath(adapter.id);
    if (adapter.adapterPath !== expected) {
      throw new Error(`Adapter path for ${adapter.id} must be ${expected}.`);
    }
    if (adapter.status !== 'generated') {
      throw new Error(`Adapter status for ${adapter.id} must be generated.`);
    }
    if (adapter.contentHash !== null && adapter.contentHash !== undefined) {
      if (typeof adapter.contentHash !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(adapter.contentHash)) {
        throw new Error(`Adapter contentHash for ${adapter.id} must be a sha256 digest or null.`);
      }
    }
  }
  if (inventory.permissionPolicy !== undefined) {
    if (!inventory.permissionPolicy || typeof inventory.permissionPolicy !== 'object') {
      throw new Error('Harness inventory permissionPolicy must be an object.');
    }
    if (typeof inventory.permissionPolicy.source !== 'string' || inventory.permissionPolicy.source.trim() === '') {
      throw new Error('Harness inventory permissionPolicy.source must be a non-empty string.');
    }
  }
  return inventory;
}

async function readAdapterHashes(target, tools) {
  const hashes = {};
  for (const tool of tools) {
    const file = path.join(target, adapterFilePath(tool));
    const text = await fs.readFile(file, 'utf8').catch(() => null);
    if (text !== null) hashes[tool] = hashText(text);
  }
  return hashes;
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
  return tools;
}

export async function writeHarnessInventory({ directory, modules, tools, policyVersion }) {
  const target = path.resolve(directory);
  const adapterHashes = await readAdapterHashes(target, tools);
  const inventory = createHarnessInventory({ modules, tools, policyVersion, adapterHashes });
  validateHarnessInventoryShape(inventory);
  const file = path.join(target, '.midas', 'harness-inventory.json');
  await fs.writeFile(file, `${JSON.stringify(inventory, null, 2)}\n`);
  return {
    file: relativePath(path.relative(target, file)),
    inventory
  };
}

export async function loadHarnessInventory(directory) {
  const target = path.resolve(directory);
  const file = path.join(target, '.midas', 'harness-inventory.json');
  const inventory = JSON.parse(await fs.readFile(file, 'utf8'));
  return validateHarnessInventoryShape(inventory);
}

export async function inspectHarnessInventory(directory) {
  const target = path.resolve(directory);
  const failures = [];
  const inventoryFile = path.join(target, '.midas', 'harness-inventory.json');
  if (!await exists(inventoryFile)) {
    return {
      status: 'fail',
      target,
      inventory: null,
      adapters: [],
      failures: [
        {
          id: 'harness-inventory:file',
          status: 'fail',
          remediation: 'Run midas install or midas update to create .midas/harness-inventory.json.'
        }
      ]
    };
  }

  let inventory;
  try {
    inventory = await loadHarnessInventory(target);
  } catch (error) {
    return {
      status: 'fail',
      target,
      inventory: null,
      adapters: [],
      failures: [
        {
          id: 'harness-inventory:shape',
          status: 'fail',
          remediation: error.message
        }
      ]
    };
  }

  const manifestTools = await parseManifestTools(target).catch((error) => {
    failures.push({
      id: 'harness-inventory:manifest',
      status: 'fail',
      remediation: `Unable to read installed manifest tools: ${error.message}`
    });
    return [];
  });
  const inventoryTools = inventory.adapters.map((adapter) => adapter.id);
  const missingFromInventory = manifestTools.filter((tool) => !inventoryTools.includes(tool));
  const extraInInventory = inventoryTools.filter((tool) => !manifestTools.includes(tool));
  if (missingFromInventory.length > 0 || extraInInventory.length > 0) {
    failures.push({
      id: 'harness-inventory:manifest-tools-match',
      status: 'fail',
      remediation: `Manifest/tools drift. Missing from inventory: ${missingFromInventory.join(', ') || 'none'}; extra in inventory: ${extraInInventory.join(', ') || 'none'}.`
    });
  }

  const adapters = [];
  for (const adapter of inventory.adapters) {
    const file = path.join(target, adapter.adapterPath);
    const present = await isFile(file);
    const actualHash = present ? hashText(await fs.readFile(file, 'utf8')) : null;
    const hashMatches = !adapter.contentHash || adapter.contentHash === actualHash;
    const status = !present ? 'missing' : hashMatches ? 'present' : 'changed';
    adapters.push({
      id: adapter.id,
      adapterPath: adapter.adapterPath,
      status
    });
    if (!present) {
      failures.push({
        id: `harness-inventory:adapter:${adapter.id}`,
        status: 'fail',
        remediation: `Regenerate missing adapter path: ${adapter.adapterPath}`
      });
    } else if (!hashMatches) {
      failures.push({
        id: `harness-inventory:adapter-hash:${adapter.id}`,
        status: 'fail',
        remediation: `Regenerate changed adapter path: ${adapter.adapterPath}`
      });
    }
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    target,
    schemaVersion: inventory.schemaVersion,
    manifestTools,
    inventoryTools,
    adapters,
    checks: inventory.checks ?? [],
    failures
  };
}

export { schemaVersion as harnessInventorySchemaVersion, supportedTools as harnessInventorySupportedTools };
