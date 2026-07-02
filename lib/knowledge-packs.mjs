import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const knowledgePackSchemaVersion = 'midas.knowledge-packs.v1';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultCatalogFile = path.join(packageRoot, 'framework', 'knowledge', 'default-knowledge-packs.json');
const workspaceCatalogPath = '.midas/knowledge/packs.json';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedSourceTypes = new Set([
  'project-doc',
  'public-doc',
  'source-code-metadata',
  'release-evidence',
  'run-ledger',
  'work-order',
  'issue-tracker',
  'user-provided',
  'licensed-dataset',
  'generated-output'
]);
const blockedSourceTypes = new Set([
  'secret',
  'credential',
  'token',
  'api-key',
  'private-key',
  'env-file',
  'browser-storage',
  'payment-secret'
]);
const allowedChunkStrategies = new Set(['section', 'paragraph', 'record', 'page', 'metadata', 'qa-pair']);
const allowedApprovals = new Set(['none', 'maintainer', 'owner', 'security', 'explicit-human']);
const requiredQualityGates = new Set(['source-license-review', 'citation-check', 'retrieval-test']);
const allowedQualityGates = new Set([
  'source-license-review',
  'citation-check',
  'retrieval-test',
  'stale-source-review',
  'feedback-loop',
  'publication-gate',
  'privacy-review'
]);

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

function stringField(pack, field, file, failures, options = {}) {
  const value = pack[field];
  const label = options.label ?? field;
  const minLength = options.minLength ?? 1;
  const maxLength = options.maxLength ?? 500;
  if (typeof value !== 'string' || value.trim().length < minLength || value.length > maxLength) {
    failures.push(failure(
      `knowledge-pack:${pack.id ?? 'unknown'}:${field}`,
      file,
      `Knowledge pack ${label} must be ${minLength}-${maxLength} characters.`
    ));
    return null;
  }
  return value;
}

function validateStringArray(values, options, file, failures) {
  const {
    ownerId,
    field,
    allowed,
    blocked,
    minItems = 1,
    requiredValues = []
  } = options;
  if (!Array.isArray(values) || values.length < minItems) {
    failures.push(failure(
      `knowledge-pack:${ownerId}:${field}`,
      file,
      `${field} must contain at least ${minItems} item${minItems === 1 ? '' : 's'}.`
    ));
    return [];
  }
  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || !idPattern.test(value)) {
      failures.push(failure(
        `knowledge-pack:${ownerId}:${field}:format`,
        file,
        `${field} entries must use lowercase letters, numbers, and hyphen separators.`
      ));
      continue;
    }
    if (seen.has(value)) {
      failures.push(failure(
        `knowledge-pack:${ownerId}:${field}:duplicate`,
        file,
        `${field} entries must be unique. Duplicate: ${value}`
      ));
    }
    seen.add(value);
    if (blocked?.has(value)) {
      failures.push(failure(
        `knowledge-pack:${ownerId}:${field}:blocked`,
        file,
        `${field} must not include secret or credential-bearing source type: ${value}`
      ));
    }
    if (allowed && !allowed.has(value)) {
      failures.push(failure(
        `knowledge-pack:${ownerId}:${field}:allowed`,
        file,
        `${field} must use allowed values: ${[...allowed].join(', ')}.`
      ));
    }
  }
  for (const required of requiredValues) {
    if (!seen.has(required)) {
      failures.push(failure(
        `knowledge-pack:${ownerId}:${field}:required:${required}`,
        file,
        `${field} must include required gate: ${required}`
      ));
    }
  }
  return values;
}

function validateSourcePolicy(pack, file, failures) {
  const policy = pack.sourcePolicy;
  const ownerId = pack.id ?? 'unknown';
  if (!isPlainObject(policy)) {
    failures.push(failure(`knowledge-pack:${ownerId}:source-policy`, file, 'sourcePolicy must be an object.'));
    return;
  }
  for (const field of Object.keys(policy)) {
    if (![
      'allowedSourceTypes',
      'citationRequired',
      'licenseReviewRequired',
      'secretsAllowed',
      'piiAllowed',
      'sourceRetention'
    ].includes(field)) {
      failures.push(failure(`knowledge-pack:${ownerId}:source-policy-field`, file, `Unknown sourcePolicy field "${field}".`));
    }
  }
  validateStringArray(policy.allowedSourceTypes, {
    ownerId,
    field: 'allowed-source-types',
    allowed: allowedSourceTypes,
    blocked: blockedSourceTypes
  }, file, failures);
  if (policy.citationRequired !== true) {
    failures.push(failure(`knowledge-pack:${ownerId}:citation-required`, file, 'Knowledge packs must require citations or source evidence.'));
  }
  if (policy.licenseReviewRequired !== true) {
    failures.push(failure(`knowledge-pack:${ownerId}:license-review`, file, 'Knowledge packs must require source/license review.'));
  }
  if (policy.secretsAllowed !== false) {
    failures.push(failure(`knowledge-pack:${ownerId}:secrets-allowed`, file, 'Knowledge packs must explicitly disallow secrets.'));
  }
  if (policy.piiAllowed !== false) {
    failures.push(failure(`knowledge-pack:${ownerId}:pii-allowed`, file, 'Knowledge packs must explicitly disallow PII in the public alpha contract.'));
  }
  if (typeof policy.sourceRetention !== 'string' || policy.sourceRetention.trim().length < 12 || policy.sourceRetention.length > 240) {
    failures.push(failure(`knowledge-pack:${ownerId}:source-retention`, file, 'sourceRetention must describe retention and removal posture in 12-240 characters.'));
  }
}

function validateRetrievalPolicy(pack, file, failures) {
  const policy = pack.retrievalPolicy;
  const ownerId = pack.id ?? 'unknown';
  if (!isPlainObject(policy)) {
    failures.push(failure(`knowledge-pack:${ownerId}:retrieval-policy`, file, 'retrievalPolicy must be an object.'));
    return;
  }
  for (const field of Object.keys(policy)) {
    if (!['chunkStrategy', 'metadataFields', 'retrievalTests', 'staleAfterDays'].includes(field)) {
      failures.push(failure(`knowledge-pack:${ownerId}:retrieval-policy-field`, file, `Unknown retrievalPolicy field "${field}".`));
    }
  }
  if (typeof policy.chunkStrategy !== 'string' || !allowedChunkStrategies.has(policy.chunkStrategy)) {
    failures.push(failure(`knowledge-pack:${ownerId}:chunk-strategy`, file, `chunkStrategy must be one of: ${[...allowedChunkStrategies].join(', ')}.`));
  }
  validateStringArray(policy.metadataFields, {
    ownerId,
    field: 'metadata-fields'
  }, file, failures);
  if (!Number.isInteger(policy.staleAfterDays) || policy.staleAfterDays < 1 || policy.staleAfterDays > 3650) {
    failures.push(failure(`knowledge-pack:${ownerId}:stale-after-days`, file, 'staleAfterDays must be an integer from 1 to 3650.'));
  }
  if (!Array.isArray(policy.retrievalTests) || policy.retrievalTests.length === 0) {
    failures.push(failure(`knowledge-pack:${ownerId}:retrieval-tests`, file, 'retrievalTests must include at least one source-grounding test.'));
    return;
  }
  const seen = new Set();
  for (const [index, test] of policy.retrievalTests.entries()) {
    const prefix = `knowledge-pack:${ownerId}:retrieval-test:${index}`;
    if (!isPlainObject(test)) {
      failures.push(failure(prefix, file, 'retrievalTests entries must be objects.'));
      continue;
    }
    for (const field of Object.keys(test)) {
      if (!['id', 'query', 'expectedEvidence'].includes(field)) {
        failures.push(failure(`${prefix}:field`, file, `Unknown retrieval test field "${field}".`));
      }
    }
    if (typeof test.id !== 'string' || !idPattern.test(test.id)) {
      failures.push(failure(`${prefix}:id`, file, 'Retrieval test id must use lowercase letters, numbers, and hyphen separators.'));
    } else if (seen.has(test.id)) {
      failures.push(failure(`${prefix}:duplicate`, file, `Duplicate retrieval test id: ${test.id}`));
    } else {
      seen.add(test.id);
    }
    if (typeof test.query !== 'string' || test.query.trim().length < 12 || test.query.length > 240) {
      failures.push(failure(`${prefix}:query`, file, 'Retrieval test query must be 12-240 characters.'));
    }
    if (typeof test.expectedEvidence !== 'string' || test.expectedEvidence.trim().length < 12 || test.expectedEvidence.length > 300) {
      failures.push(failure(`${prefix}:expected-evidence`, file, 'Retrieval test expectedEvidence must be 12-300 characters.'));
    }
  }
}

function validateAppExposure(pack, file, failures) {
  const exposure = pack.appExposure;
  const ownerId = pack.id ?? 'unknown';
  if (!isPlainObject(exposure)) {
    failures.push(failure(`knowledge-pack:${ownerId}:app-exposure`, file, 'appExposure must be an object.'));
    return;
  }
  for (const field of Object.keys(exposure)) {
    if (!['enabled', 'appName', 'description', 'requiresPublicationGate', 'approvalRequired'].includes(field)) {
      failures.push(failure(`knowledge-pack:${ownerId}:app-exposure-field`, file, `Unknown appExposure field "${field}".`));
    }
  }
  if (typeof exposure.enabled !== 'boolean') {
    failures.push(failure(`knowledge-pack:${ownerId}:app-exposure-enabled`, file, 'appExposure.enabled must be a boolean.'));
  }
  if (typeof exposure.requiresPublicationGate !== 'boolean') {
    failures.push(failure(`knowledge-pack:${ownerId}:publication-gate`, file, 'appExposure.requiresPublicationGate must be a boolean.'));
  }
  if (typeof exposure.approvalRequired !== 'string' || !allowedApprovals.has(exposure.approvalRequired)) {
    failures.push(failure(`knowledge-pack:${ownerId}:approval-required`, file, `approvalRequired must be one of: ${[...allowedApprovals].join(', ')}.`));
  }
  if (exposure.enabled) {
    if (!exposure.requiresPublicationGate) {
      failures.push(failure(`knowledge-pack:${ownerId}:publication-gate`, file, 'App-exposed knowledge packs must require a publication gate.'));
    }
    if (exposure.approvalRequired === 'none') {
      failures.push(failure(`knowledge-pack:${ownerId}:app-exposure-approval`, file, 'App-exposed knowledge packs must require approval.'));
    }
    if (typeof exposure.appName !== 'string' || exposure.appName.trim().length < 3 || exposure.appName.length > 80) {
      failures.push(failure(`knowledge-pack:${ownerId}:app-name`, file, 'App-exposed knowledge packs must declare an appName in 3-80 characters.'));
    }
    if (typeof exposure.description !== 'string' || exposure.description.trim().length < 24 || exposure.description.length > 500) {
      failures.push(failure(`knowledge-pack:${ownerId}:app-description`, file, 'App-exposed knowledge packs must describe the user-facing use in 24-500 characters.'));
    }
  } else if (exposure.appName !== null || exposure.description !== null) {
    failures.push(failure(`knowledge-pack:${ownerId}:app-exposure-disabled`, file, 'Disabled app exposure must use null appName and description.'));
  }
}

export function validateKnowledgePackCatalog(catalog, file = 'knowledge-packs.json') {
  const failures = [];

  if (!isPlainObject(catalog)) {
    return [failure('knowledge-packs:shape', file, 'Knowledge pack catalog must be a JSON object.')];
  }

  for (const key of Object.keys(catalog)) {
    if (!['schemaVersion', 'packs'].includes(key)) {
      failures.push(failure('knowledge-packs:field', file, `Unknown catalog field "${key}".`));
    }
  }

  if (catalog.schemaVersion !== knowledgePackSchemaVersion) {
    failures.push(failure('knowledge-packs:schema-version', file, `schemaVersion must be ${knowledgePackSchemaVersion}.`));
  }

  if (!Array.isArray(catalog.packs) || catalog.packs.length === 0) {
    failures.push(failure('knowledge-packs:packs', file, 'Catalog packs must be a non-empty array.'));
    return failures;
  }

  const seenIds = new Set();
  for (const [index, pack] of catalog.packs.entries()) {
    const packId = pack?.id ?? `index-${index}`;
    if (!isPlainObject(pack)) {
      failures.push(failure(`knowledge-pack:${packId}:shape`, file, 'Knowledge pack must be a JSON object.'));
      continue;
    }

    const allowedPackFields = new Set([
      'id',
      'name',
      'purpose',
      'sourcePolicy',
      'retrievalPolicy',
      'qualityGates',
      'feedbackLoop',
      'appExposure'
    ]);
    for (const field of Object.keys(pack)) {
      if (!allowedPackFields.has(field)) {
        failures.push(failure(`knowledge-pack:${packId}:field`, file, `Unknown knowledge pack field "${field}".`));
      }
    }

    if (typeof pack.id !== 'string' || !idPattern.test(pack.id)) {
      failures.push(failure(`knowledge-pack:${packId}:id`, file, 'Knowledge pack id must use lowercase letters, numbers, and hyphen separators.'));
    } else if (seenIds.has(pack.id)) {
      failures.push(failure(`knowledge-pack:${pack.id}:duplicate`, file, `Duplicate knowledge pack id: ${pack.id}`));
    } else {
      seenIds.add(pack.id);
    }

    stringField(pack, 'name', file, failures, { minLength: 3, maxLength: 120 });
    stringField(pack, 'purpose', file, failures, { minLength: 24, maxLength: 500 });
    stringField(pack, 'feedbackLoop', file, failures, { minLength: 24, maxLength: 500, label: 'feedback loop' });
    validateSourcePolicy(pack, file, failures);
    validateRetrievalPolicy(pack, file, failures);
    validateStringArray(pack.qualityGates, {
      ownerId: packId,
      field: 'quality-gates',
      allowed: allowedQualityGates,
      requiredValues: [...requiredQualityGates]
    }, file, failures);
    validateAppExposure(pack, file, failures);
  }

  return failures;
}

export async function loadKnowledgePackCatalog(options = {}) {
  const file = path.resolve(options.file ?? defaultCatalogFile);
  const text = await fs.readFile(file, 'utf8');
  const catalog = JSON.parse(text);
  const failures = validateKnowledgePackCatalog(catalog, relativePath(path.relative(options.root ?? packageRoot, file)));
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    file,
    catalog,
    failures
  };
}

export async function inspectKnowledgePacks(directory, options = {}) {
  const target = path.resolve(directory);
  const file = options.file
    ? path.resolve(options.file)
    : await exists(path.join(target, workspaceCatalogPath))
      ? path.join(target, workspaceCatalogPath)
      : path.join(target, 'framework', 'knowledge', 'default-knowledge-packs.json');
  const relativeFile = relativePath(path.relative(target, file));

  if (!await exists(file)) {
    return {
      status: 'fail',
      schemaVersion: knowledgePackSchemaVersion,
      target,
      file: relativeFile,
      packs: [],
      failures: [
        failure('knowledge-packs:file', relativeFile, `Create ${relativeFile} or run midas install.`)
      ]
    };
  }

  let catalog;
  try {
    catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      schemaVersion: knowledgePackSchemaVersion,
      target,
      file: relativeFile,
      packs: [],
      failures: [
        failure('knowledge-packs:parse', relativeFile, `Unable to parse knowledge pack catalog: ${error.message}`)
      ]
    };
  }

  const failures = validateKnowledgePackCatalog(catalog, relativeFile);
  const packs = failures.length === 0
    ? catalog.packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      allowedSourceTypes: pack.sourcePolicy.allowedSourceTypes,
      citationRequired: pack.sourcePolicy.citationRequired,
      licenseReviewRequired: pack.sourcePolicy.licenseReviewRequired,
      retrievalTests: pack.retrievalPolicy.retrievalTests.map((test) => test.id),
      qualityGates: pack.qualityGates,
      appExposure: {
        enabled: pack.appExposure.enabled,
        appName: pack.appExposure.appName,
        approvalRequired: pack.appExposure.approvalRequired
      }
    }))
    : [];

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: knowledgePackSchemaVersion,
    target,
    file: relativeFile,
    packs,
    failures
  };
}

export async function copyDefaultKnowledgePacks({ directory }) {
  const target = path.resolve(directory);
  const outFile = path.join(target, workspaceCatalogPath);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const text = await fs.readFile(defaultCatalogFile, 'utf8');
  const catalog = JSON.parse(text);
  const failures = validateKnowledgePackCatalog(catalog, 'framework/knowledge/default-knowledge-packs.json');
  if (failures.length > 0) {
    throw new Error(`Default knowledge pack catalog is invalid: ${failures.map((item) => item.remediation).join('; ')}`);
  }
  await fs.writeFile(outFile, text.endsWith('\n') ? text : `${text}\n`);
  return relativePath(path.relative(target, outFile));
}
