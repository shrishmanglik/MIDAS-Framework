import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import {
  defaultLensCatalogFile,
  loadReviewLenses,
  maxLensesPerClass,
  reviewChangeClasses,
  reviewLensesSchemaVersion,
  selectLenses,
  validateReviewLenses
} from '../lib/review-lenses.mjs';

async function readCatalog() {
  return JSON.parse(await fs.readFile(defaultLensCatalogFile, 'utf8'));
}

test('shipped lens catalog passes validation', async () => {
  const catalog = await readCatalog();
  const result = validateReviewLenses(catalog);
  assert.deepEqual(result.failures, []);
  assert.equal(result.status, 'pass');
  assert.equal(result.schemaVersion, reviewLensesSchemaVersion);
  assert.equal(result.lenses.length, 6);
});

test('loadReviewLenses returns the validated catalog', async () => {
  const catalog = await loadReviewLenses();
  assert.equal(catalog.schemaVersion, reviewLensesSchemaVersion);
  assert.deepEqual(catalog.changeClasses, reviewChangeClasses);
});

test('payment change selects security, claim-integrity, and edge-cases', async () => {
  const selection = await selectLenses(['payment']);
  assert.deepEqual(selection.lenses.map((lens) => lens.id).sort(), ['claim-integrity', 'edge-cases', 'security']);
  assert.equal(selection.lensCount, 3);
  assert.equal(selection.baselineExceeded, false);
  assert.equal(selection.justification, null);
});

test('docs change selects spec-compliance only', async () => {
  const selection = await selectLenses(['docs']);
  assert.deepEqual(selection.lenses.map((lens) => lens.id), ['spec-compliance']);
  assert.equal(selection.lensCount, 1);
  assert.equal(selection.baselineExceeded, false);
});

test('auth change selects edge-cases, security, and regression', async () => {
  const selection = await selectLenses(['auth']);
  assert.deepEqual(selection.lenses.map((lens) => lens.id).sort(), ['edge-cases', 'regression', 'security']);
});

test('no single change class ever selects more than the per-class cap', async () => {
  for (const changeClass of reviewChangeClasses) {
    const selection = await selectLenses([changeClass]);
    assert.ok(selection.lensCount >= 1, `${changeClass} must select at least one lens`);
    assert.ok(selection.lensCount <= maxLensesPerClass, `${changeClass} selected ${selection.lensCount} lenses`);
    assert.equal(selection.baselineExceeded, false);
  }
});

test('multi-class selection may exceed the baseline but documents why', async () => {
  const selection = await selectLenses(['payment', 'docs']);
  assert.equal(selection.lensCount, 4);
  assert.equal(selection.baselineExceeded, true);
  assert.match(selection.justification, /payment/);
  assert.match(selection.justification, /docs/);
  assert.match(selection.justification, /spec-compliance \(docs\)/);
});

test('selected lenses carry the question and required evidence', async () => {
  const selection = await selectLenses(['infra']);
  for (const lens of selection.lenses) {
    assert.ok(lens.question.length > 0);
    assert.ok(lens.evidenceRequired.length > 0);
    assert.ok(lens.demandedBy.includes('infra'));
  }
});

test('unknown change class is rejected', async () => {
  await assert.rejects(() => selectLenses(['frontend']), /Unknown change class: frontend/);
  await assert.rejects(() => selectLenses([]), /non-empty array/);
});

test('validator fails a catalog whose class demands more than the cap', async () => {
  const catalog = await readCatalog();
  // Push every lens onto docs — the all-lenses-as-ceremony defect.
  for (const lens of catalog.lenses) {
    if (!lens.applicability.includes('docs')) lens.applicability.push('docs');
  }
  const result = validateReviewLenses(catalog);
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'review-lenses:ceremony:docs'));
});

test('validator fails on missing lens, bad red flags, and uncovered class', async () => {
  const catalog = await readCatalog();
  const removed = catalog.lenses.pop(); // performance
  catalog.lenses[0].redFlags = ['only', 'two'];
  const result = validateReviewLenses(catalog);
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === `review-lenses:missing:${removed.id}`));
  assert.ok(result.failures.some((failure) => failure.id === `review-lenses:${catalog.lenses[0].id}:red-flags`));
});
