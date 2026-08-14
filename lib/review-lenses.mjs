import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const reviewLensesSchemaVersion = 'midas.review-lenses.v1';
export const reviewChangeClasses = ['payment', 'auth', 'schema', 'ui', 'infra', 'docs'];
export const maxLensesPerClass = 3;

const requiredLensIds = [
  'edge-cases',
  'security',
  'spec-compliance',
  'regression',
  'claim-integrity',
  'performance'
];

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const defaultLensCatalogFile = path.join(packageRoot, 'framework', 'review', 'lenses.json');

function fail(failures, id, remediation) {
  failures.push({ id, status: 'fail', remediation });
}

export function validateReviewLenses(catalog) {
  const failures = [];
  if (!catalog || typeof catalog !== 'object') {
    fail(failures, 'review-lenses:catalog', 'Lens catalog must be a JSON object.');
    return { status: 'fail', failures, lenses: [] };
  }
  if (catalog.schemaVersion !== reviewLensesSchemaVersion) {
    fail(failures, 'review-lenses:schema-version', `schemaVersion must be ${reviewLensesSchemaVersion}.`);
  }
  const declaredClasses = Array.isArray(catalog.changeClasses) ? catalog.changeClasses : [];
  if (declaredClasses.join(',') !== reviewChangeClasses.join(',')) {
    fail(failures, 'review-lenses:change-classes', `changeClasses must be exactly: ${reviewChangeClasses.join(', ')}.`);
  }
  const lenses = Array.isArray(catalog.lenses) ? catalog.lenses : [];
  if (!Array.isArray(catalog.lenses)) {
    fail(failures, 'review-lenses:lenses', 'lenses must be an array.');
  }
  const seen = new Set();
  for (const lens of lenses) {
    const id = typeof lens?.id === 'string' ? lens.id : '(missing-id)';
    if (seen.has(id)) {
      fail(failures, `review-lenses:${id}:duplicate`, `Lens ids must be unique. Duplicate: ${id}`);
    }
    seen.add(id);
    if (typeof lens?.name !== 'string' || lens.name.trim() === '') {
      fail(failures, `review-lenses:${id}:name`, 'Every lens requires a non-empty name.');
    }
    if (typeof lens?.question !== 'string' || lens.question.trim() === '') {
      fail(failures, `review-lenses:${id}:question`, 'Every lens requires the one question it asks of a diff.');
    }
    if (!Array.isArray(lens?.applicability) || lens.applicability.length === 0) {
      fail(failures, `review-lenses:${id}:applicability`, 'Every lens requires a non-empty applicability array of change classes.');
    } else {
      for (const changeClass of lens.applicability) {
        if (!reviewChangeClasses.includes(changeClass)) {
          fail(failures, `review-lenses:${id}:applicability-class`, `Unknown change class "${changeClass}". Supported: ${reviewChangeClasses.join(', ')}.`);
        }
      }
    }
    if (!Array.isArray(lens?.redFlags) || lens.redFlags.length < 3 || lens.redFlags.length > 6) {
      fail(failures, `review-lenses:${id}:red-flags`, 'Every lens requires 3-6 redFlags.');
    }
    if (typeof lens?.evidenceRequired !== 'string' || lens.evidenceRequired.trim() === '') {
      fail(failures, `review-lenses:${id}:evidence`, 'Every lens requires evidenceRequired describing what proof satisfies it.');
    }
  }
  for (const required of requiredLensIds) {
    if (!seen.has(required)) {
      fail(failures, `review-lenses:missing:${required}`, `Catalog must include the ${required} lens.`);
    }
  }
  // Anti-ceremony invariant: no single change class may demand more than
  // maxLensesPerClass lenses, and every class must be covered by at least one.
  for (const changeClass of reviewChangeClasses) {
    const applicable = lenses.filter((lens) => Array.isArray(lens?.applicability) && lens.applicability.includes(changeClass));
    if (applicable.length === 0) {
      fail(failures, `review-lenses:coverage:${changeClass}`, `Change class "${changeClass}" has no applicable lens.`);
    }
    if (applicable.length > maxLensesPerClass) {
      fail(
        failures,
        `review-lenses:ceremony:${changeClass}`,
        `Change class "${changeClass}" maps to ${applicable.length} lenses (${applicable.map((lens) => lens.id).join(', ')}); the cap is ${maxLensesPerClass}. All-lenses-as-ceremony is the failure mode this catalog exists to prevent.`
      );
    }
  }
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: reviewLensesSchemaVersion,
    failures,
    lenses: lenses.map((lens) => lens?.id).filter(Boolean)
  };
}

export async function loadReviewLenses(file = defaultLensCatalogFile) {
  const catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  const validation = validateReviewLenses(catalog);
  if (validation.status !== 'pass') {
    const detail = validation.failures.map((failure) => failure.remediation).join(' ');
    throw new Error(`Review lens catalog failed validation: ${detail}`);
  }
  return catalog;
}

export async function selectLenses(changeClassList, options = {}) {
  if (!Array.isArray(changeClassList) || changeClassList.length === 0) {
    throw new Error('selectLenses requires a non-empty array of change classes.');
  }
  const classes = [...new Set(changeClassList)];
  for (const changeClass of classes) {
    if (!reviewChangeClasses.includes(changeClass)) {
      throw new Error(`Unknown change class: ${changeClass}. Supported: ${reviewChangeClasses.join(', ')}.`);
    }
  }
  const catalog = options.catalog ?? await loadReviewLenses(options.catalogFile);
  const validation = validateReviewLenses(catalog);
  if (validation.status !== 'pass') {
    throw new Error(`selectLenses refused an invalid catalog: ${validation.failures.map((failure) => failure.id).join(', ')}`);
  }
  const demandedBy = new Map();
  for (const lens of catalog.lenses) {
    for (const changeClass of classes) {
      if (!lens.applicability.includes(changeClass)) continue;
      if (!demandedBy.has(lens.id)) demandedBy.set(lens.id, []);
      demandedBy.get(lens.id).push(changeClass);
    }
  }
  const selected = catalog.lenses
    .filter((lens) => demandedBy.has(lens.id))
    .map((lens) => ({
      id: lens.id,
      name: lens.name,
      question: lens.question,
      evidenceRequired: lens.evidenceRequired,
      demandedBy: demandedBy.get(lens.id)
    }));
  const baselineExceeded = selected.length > maxLensesPerClass;
  if (baselineExceeded && classes.length === 1) {
    // Guarded by the validator; kept as a hard stop so a hand-edited catalog
    // can never turn a single-class review into ceremony.
    throw new Error(`Change class ${classes[0]} selected ${selected.length} lenses; the per-class cap is ${maxLensesPerClass}.`);
  }
  return {
    status: 'selected',
    schemaVersion: reviewLensesSchemaVersion,
    changeClasses: classes,
    lensCount: selected.length,
    lenses: selected,
    baselineExceeded,
    justification: baselineExceeded
      ? `Selection exceeds the ${maxLensesPerClass}-lens baseline because ${classes.length} change classes (${classes.join(', ')}) each demand distinct lenses: ${selected.map((lens) => `${lens.id} (${lens.demandedBy.join('+')})`).join('; ')}.`
      : null
  };
}
