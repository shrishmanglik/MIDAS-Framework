import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const flowComponentSchemaVersion = 'midas.flow-components.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultCatalogFile = path.join(packageRoot, 'framework', 'flows', 'default-flow-components.json');
const workspaceCatalogPath = '.midas/flows/components.json';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const toolNamePattern = /^[a-z][a-z0-9_]{2,63}$/;
const allowedKinds = new Set(['source', 'transform', 'decision', 'action', 'evidence', 'approval', 'output']);
const allowedPortTypes = new Set([
  'text',
  'markdown',
  'json',
  'table',
  'file-metadata',
  'event',
  'report',
  'state-update',
  'command',
  'approval',
  'artifact'
]);
const blockedPortTypes = new Set(['secret', 'credential', 'token', 'api-key', 'private-key']);
const allowedPermissionClasses = new Set([
  'read-only',
  'internal-write',
  'product-write',
  'external-action',
  'money',
  'destructive'
]);
const allowedPromotionStages = new Set([
  'draft',
  'component-proof',
  'flow-proof',
  'review-ready',
  'tool-ready',
  'production-ready'
]);
const allowedApprovals = new Set(['none', 'maintainer', 'owner', 'security', 'explicit-human']);
const exposedToolStages = new Set(['tool-ready', 'production-ready']);
const highRiskPermissionClasses = new Set(['external-action', 'money', 'destructive']);

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

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function failure(id, file, remediation) {
  return {
    id,
    status: 'fail',
    file,
    remediation
  };
}

function stringField(component, field, file, failures, options = {}) {
  const value = component[field];
  const label = options.label ?? field;
  const minLength = options.minLength ?? 1;
  const maxLength = options.maxLength ?? 500;
  if (typeof value !== 'string' || value.trim().length < minLength || value.length > maxLength) {
    failures.push(failure(
      `flow-component:${component.id ?? 'unknown'}:${field}`,
      file,
      `Component ${label} must be ${minLength}-${maxLength} characters.`
    ));
    return null;
  }
  return value;
}

function validatePorts(component, field, file, failures) {
  const ports = component[field];
  if (!Array.isArray(ports) || ports.length === 0) {
    failures.push(failure(
      `flow-component:${component.id ?? 'unknown'}:${field}`,
      file,
      `Component ${field} must be a non-empty array.`
    ));
    return [];
  }

  const seen = new Set();
  for (const [index, port] of ports.entries()) {
    const prefix = `flow-component:${component.id ?? 'unknown'}:${field}:${index}`;
    if (!isPlainObject(port)) {
      failures.push(failure(prefix, file, `Component ${field} entries must be objects.`));
      continue;
    }
    for (const key of Object.keys(port)) {
      if (!['id', 'type', 'required', 'description'].includes(key)) {
        failures.push(failure(`${prefix}:field`, file, `Unknown port field "${key}".`));
      }
    }
    if (typeof port.id !== 'string' || !idPattern.test(port.id)) {
      failures.push(failure(`${prefix}:id`, file, 'Port id must use lowercase letters, numbers, and hyphen separators.'));
    } else if (seen.has(port.id)) {
      failures.push(failure(`${prefix}:duplicate`, file, `Duplicate ${field} port id: ${port.id}`));
    } else {
      seen.add(port.id);
    }
    if (typeof port.type !== 'string' || port.type.trim() === '') {
      failures.push(failure(`${prefix}:type`, file, 'Port type must be a non-empty string.'));
    } else {
      if (blockedPortTypes.has(port.type)) {
        failures.push(failure(`${prefix}:blocked-type`, file, `Port type must not carry secret material: ${port.type}`));
      }
      if (!allowedPortTypes.has(port.type)) {
        failures.push(failure(`${prefix}:allowed-type`, file, `Port type must be one of: ${[...allowedPortTypes].join(', ')}.`));
      }
    }
    if (port.required !== undefined && typeof port.required !== 'boolean') {
      failures.push(failure(`${prefix}:required`, file, 'Port required must be a boolean when present.'));
    }
    if (typeof port.description !== 'string' || port.description.trim().length < 12 || port.description.length > 240) {
      failures.push(failure(`${prefix}:description`, file, 'Port description must be 12-240 characters.'));
    }
  }
  return ports;
}

export function validateFlowComponentCatalog(catalog, file = 'flow-components.json') {
  const failures = [];

  if (!isPlainObject(catalog)) {
    return [failure('flow-components:shape', file, 'Flow component catalog must be a JSON object.')];
  }

  for (const key of Object.keys(catalog)) {
    if (!['schemaVersion', 'components'].includes(key)) {
      failures.push(failure('flow-components:field', file, `Unknown catalog field "${key}".`));
    }
  }

  if (catalog.schemaVersion !== flowComponentSchemaVersion) {
    failures.push(failure('flow-components:schema-version', file, `schemaVersion must be ${flowComponentSchemaVersion}.`));
  }

  if (!Array.isArray(catalog.components) || catalog.components.length === 0) {
    failures.push(failure('flow-components:components', file, 'Catalog components must be a non-empty array.'));
    return failures;
  }

  const seenIds = new Set();
  for (const [index, component] of catalog.components.entries()) {
    const componentId = component?.id ?? `index-${index}`;
    if (!isPlainObject(component)) {
      failures.push(failure(`flow-component:${componentId}:shape`, file, 'Component must be a JSON object.'));
      continue;
    }

    const allowedComponentFields = new Set([
      'id',
      'name',
      'kind',
      'purpose',
      'inputs',
      'outputs',
      'permissionClass',
      'promotionStage',
      'approvalRequired',
      'evidence',
      'failureMode',
      'rollback',
      'toolExposure'
    ]);
    for (const field of Object.keys(component)) {
      if (!allowedComponentFields.has(field)) {
        failures.push(failure(`flow-component:${componentId}:field`, file, `Unknown component field "${field}".`));
      }
    }

    if (typeof component.id !== 'string' || !idPattern.test(component.id)) {
      failures.push(failure(`flow-component:${componentId}:id`, file, 'Component id must use lowercase letters, numbers, and hyphen separators.'));
    } else if (seenIds.has(component.id)) {
      failures.push(failure(`flow-component:${component.id}:duplicate`, file, `Duplicate flow component id: ${component.id}`));
    } else {
      seenIds.add(component.id);
    }

    stringField(component, 'name', file, failures, { minLength: 3, maxLength: 120 });
    stringField(component, 'purpose', file, failures, { minLength: 24, maxLength: 500 });
    stringField(component, 'evidence', file, failures, { minLength: 20, maxLength: 500 });
    stringField(component, 'failureMode', file, failures, { minLength: 20, maxLength: 500, label: 'failure mode' });
    stringField(component, 'rollback', file, failures, { minLength: 20, maxLength: 500 });

    if (typeof component.kind !== 'string' || !allowedKinds.has(component.kind)) {
      failures.push(failure(`flow-component:${componentId}:kind`, file, `Component kind must be one of: ${[...allowedKinds].join(', ')}.`));
    }
    if (typeof component.permissionClass !== 'string' || !allowedPermissionClasses.has(component.permissionClass)) {
      failures.push(failure(`flow-component:${componentId}:permission-class`, file, `Permission class must be one of: ${[...allowedPermissionClasses].join(', ')}.`));
    }
    if (typeof component.promotionStage !== 'string' || !allowedPromotionStages.has(component.promotionStage)) {
      failures.push(failure(`flow-component:${componentId}:promotion-stage`, file, `Promotion stage must be one of: ${[...allowedPromotionStages].join(', ')}.`));
    }
    if (typeof component.approvalRequired !== 'string' || !allowedApprovals.has(component.approvalRequired)) {
      failures.push(failure(`flow-component:${componentId}:approval-required`, file, `Approval required must be one of: ${[...allowedApprovals].join(', ')}.`));
    }

    validatePorts(component, 'inputs', file, failures);
    validatePorts(component, 'outputs', file, failures);

    if (highRiskPermissionClasses.has(component.permissionClass) && component.approvalRequired === 'none') {
      failures.push(failure(
        `flow-component:${componentId}:approval-gate`,
        file,
        'External-action, money, and destructive components must require approval.'
      ));
    }

    if (!isPlainObject(component.toolExposure)) {
      failures.push(failure(`flow-component:${componentId}:tool-exposure`, file, 'toolExposure must be an object.'));
      continue;
    }
    const toolExposure = component.toolExposure;
    for (const field of Object.keys(toolExposure)) {
      if (!['enabled', 'toolName', 'description', 'requiresPromotionGate'].includes(field)) {
        failures.push(failure(`flow-component:${componentId}:tool-exposure-field`, file, `Unknown toolExposure field "${field}".`));
      }
    }
    if (typeof toolExposure.enabled !== 'boolean') {
      failures.push(failure(`flow-component:${componentId}:tool-exposure-enabled`, file, 'toolExposure.enabled must be a boolean.'));
    }
    if (typeof toolExposure.requiresPromotionGate !== 'boolean') {
      failures.push(failure(`flow-component:${componentId}:tool-exposure-gate`, file, 'toolExposure.requiresPromotionGate must be a boolean.'));
    }

    if (toolExposure.enabled) {
      if (!toolExposure.requiresPromotionGate) {
        failures.push(failure(`flow-component:${componentId}:tool-exposure-gate`, file, 'Tool-exposed components must require a promotion gate.'));
      }
      if (!exposedToolStages.has(component.promotionStage)) {
        failures.push(failure(`flow-component:${componentId}:tool-exposure-stage`, file, 'Tool-exposed components must be tool-ready or production-ready.'));
      }
      if (component.approvalRequired === 'none') {
        failures.push(failure(`flow-component:${componentId}:tool-exposure-approval`, file, 'Tool-exposed components must require approval.'));
      }
      if (typeof toolExposure.toolName !== 'string' || !toolNamePattern.test(toolExposure.toolName)) {
        failures.push(failure(`flow-component:${componentId}:tool-name`, file, 'Tool name must be 3-64 chars, start with a letter, and use lowercase letters, numbers, or underscores.'));
      }
      if (typeof toolExposure.description !== 'string' || toolExposure.description.trim().length < 24 || toolExposure.description.length > 500) {
        failures.push(failure(`flow-component:${componentId}:tool-description`, file, 'Tool description must clearly describe the action in 24-500 characters.'));
      }
    } else {
      if (toolExposure.toolName !== null || toolExposure.description !== null) {
        failures.push(failure(`flow-component:${componentId}:tool-exposure-disabled`, file, 'Disabled tool exposure must use null toolName and description.'));
      }
    }
  }

  return failures;
}

export async function loadFlowComponentCatalog(options = {}) {
  const file = path.resolve(options.file ?? defaultCatalogFile);
  const text = await fs.readFile(file, 'utf8');
  const catalog = JSON.parse(text);
  const failures = validateFlowComponentCatalog(catalog, relativePath(path.relative(options.root ?? packageRoot, file)));
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    file,
    catalog,
    failures
  };
}

export async function inspectFlowComponents(directory, options = {}) {
  const target = path.resolve(directory);
  const file = options.file
    ? path.resolve(options.file)
    : await exists(path.join(target, workspaceCatalogPath))
      ? path.join(target, workspaceCatalogPath)
      : path.join(target, 'framework', 'flows', 'default-flow-components.json');
  const relativeFile = relativePath(path.relative(target, file));

  if (!await exists(file)) {
    return {
      status: 'fail',
      schemaVersion: flowComponentSchemaVersion,
      target,
      file: relativeFile,
      components: [],
      failures: [
        failure('flow-components:file', relativeFile, `Create ${relativeFile} or run midas install.`)
      ]
    };
  }

  let catalog;
  try {
    catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      schemaVersion: flowComponentSchemaVersion,
      target,
      file: relativeFile,
      components: [],
      failures: [
        failure('flow-components:parse', relativeFile, `Unable to parse flow component catalog: ${error.message}`)
      ]
    };
  }

  const failures = validateFlowComponentCatalog(catalog, relativeFile);
  const components = failures.length === 0
    ? catalog.components.map((component) => ({
      id: component.id,
      name: component.name,
      kind: component.kind,
      permissionClass: component.permissionClass,
      promotionStage: component.promotionStage,
      approvalRequired: component.approvalRequired,
      inputs: component.inputs.map((port) => ({ id: port.id, type: port.type, required: Boolean(port.required) })),
      outputs: component.outputs.map((port) => ({ id: port.id, type: port.type })),
      toolExposure: {
        enabled: component.toolExposure.enabled,
        toolName: component.toolExposure.toolName
      }
    }))
    : [];

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: flowComponentSchemaVersion,
    target,
    file: relativeFile,
    components,
    failures
  };
}

export async function copyDefaultFlowComponents({ directory }) {
  const target = path.resolve(directory);
  const outFile = path.join(target, workspaceCatalogPath);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const text = await fs.readFile(defaultCatalogFile, 'utf8');
  const catalog = JSON.parse(text);
  const failures = validateFlowComponentCatalog(catalog, 'framework/flows/default-flow-components.json');
  if (failures.length > 0) {
    throw new Error(`Default flow component catalog is invalid: ${failures.map((item) => item.remediation).join('; ')}`);
  }
  await fs.writeFile(outFile, text.endsWith('\n') ? text : `${text}\n`);
  return relativePath(path.relative(target, outFile));
}
