import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  defaultQcRubricFile,
  evalScenarioStatuses,
  inspectEvalLibrary,
  loadQcRubric,
  parseScenarioMarkdown,
  requiredRubricDimensions,
  validateQcRubric,
  validateScenarioRecord
} from '../lib/eval-library.mjs';

const packageRoot = path.resolve('.');

async function makeFixtureWorkspace() {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-eval-'));
  await fs.cp(
    path.join(packageRoot, 'framework', 'skills'),
    path.join(workspace, 'framework', 'skills'),
    { recursive: true }
  );
  await fs.cp(
    path.join(packageRoot, 'evals', 'scenarios'),
    path.join(workspace, 'evals', 'scenarios'),
    { recursive: true }
  );
  return workspace;
}

test('current tree: every discipline skill has a valid pressure scenario', async () => {
  const result = await inspectEvalLibrary(packageRoot);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.deepEqual(result.coverage.missing, []);
  assert.deepEqual(result.coverage.orphanScenarios, []);
  assert.ok(result.coverage.requiredSkills.length >= 9);
  assert.ok(result.coverage.requiredSkills.includes('midas-tdd'));
  assert.ok(result.coverage.requiredSkills.includes('midas-verification-before-done'));
  assert.equal(result.coverage.covered.length, result.coverage.requiredSkills.length);
  for (const scenario of result.scenarios) {
    assert.ok(evalScenarioStatuses.includes(scenario.scenarioStatus),
      `Scenario ${scenario.id} has illegal status ${scenario.scenarioStatus}`);
  }
});

test('coverage fails when a scenario file is removed (real fixture)', async () => {
  const workspace = await makeFixtureWorkspace();
  try {
    const before = await inspectEvalLibrary(workspace);
    assert.equal(before.status, 'pass', JSON.stringify(before.failures, null, 2));
    await fs.rm(path.join(workspace, 'evals', 'scenarios', 'midas-tdd.md'));
    const after = await inspectEvalLibrary(workspace);
    assert.equal(after.status, 'fail');
    assert.ok(after.coverage.missing.includes('midas-tdd'));
    assert.ok(after.failures.some((failure) => failure.id === 'eval-coverage:midas-tdd'));
  } finally {
    await fs.rm(workspace, { recursive: true, force: true });
  }
});

test('a scenario naming a nonexistent skill fails as an orphan', async () => {
  const workspace = await makeFixtureWorkspace();
  try {
    await fs.writeFile(
      path.join(workspace, 'evals', 'scenarios', 'midas-phantom.md'),
      '---\nskill: midas-phantom\nclass: pressure\nstatus: RED-PENDING\n---\n# Phantom\n\nPressure body.\n'
    );
    const result = await inspectEvalLibrary(workspace);
    assert.equal(result.status, 'fail');
    assert.ok(result.coverage.orphanScenarios.includes('midas-phantom'));
    assert.ok(result.failures.some((failure) => failure.id === 'eval-orphan:midas-phantom'));
  } finally {
    await fs.rm(workspace, { recursive: true, force: true });
  }
});

test('missing scenarios root fails with a create remediation', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-eval-'));
  try {
    await fs.cp(
      path.join(packageRoot, 'framework', 'skills'),
      path.join(workspace, 'framework', 'skills'),
      { recursive: true }
    );
    const result = await inspectEvalLibrary(workspace);
    assert.equal(result.status, 'fail');
    assert.ok(result.failures.some((failure) => failure.id === 'eval-library:scenarios-root'));
  } finally {
    await fs.rm(workspace, { recursive: true, force: true });
  }
});

test('scenario parser requires frontmatter', () => {
  assert.throws(() => parseScenarioMarkdown('# No frontmatter'), /frontmatter/);
});

test('scenario validation rejects an illegal status', () => {
  const result = validateScenarioRecord({
    fileName: 'midas-tdd.md',
    relativeFile: 'evals/scenarios/midas-tdd.md',
    text: '---\nskill: midas-tdd\nclass: pressure\nstatus: DONE\n---\n# Body\n\nPressure.\n'
  });
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'eval-scenario:midas-tdd:status'));
});

test('scenario validation rejects a skill/file-name mismatch and an empty body', () => {
  const mismatch = validateScenarioRecord({
    fileName: 'midas-tdd.md',
    relativeFile: 'evals/scenarios/midas-tdd.md',
    text: '---\nskill: midas-code-review\nclass: pressure\nstatus: RED-PENDING\n---\n# Body\n\nPressure.\n'
  });
  assert.equal(mismatch.status, 'fail');
  assert.ok(mismatch.failures.some((failure) => failure.id === 'eval-scenario:midas-tdd:skill-file-match'));

  const empty = validateScenarioRecord({
    fileName: 'midas-tdd.md',
    relativeFile: 'evals/scenarios/midas-tdd.md',
    text: '---\nskill: midas-tdd\nclass: pressure\nstatus: RED-PENDING\n---\n'
  });
  assert.equal(empty.status, 'fail');
  assert.ok(empty.failures.some((failure) => failure.id === 'eval-scenario:midas-tdd:body'));
});

test('shipped QC rubric loads and shape-validates', async () => {
  const { rubric, validation } = await loadQcRubric();
  assert.equal(validation.status, 'pass', JSON.stringify(validation.failures, null, 2));
  assert.equal(rubric.schemaVersion, 'midas.qc-rubric.v1');
  const ids = rubric.dimensions.map((dimension) => dimension.id);
  assert.deepEqual([...ids].sort(), [...requiredRubricDimensions].sort());
  for (const dimension of rubric.dimensions) {
    assert.equal(dimension.anchors.length, 5, `${dimension.id} must anchor scores 1-5`);
    assert.ok(dimension.judgePrompts.length >= 2, `${dimension.id} must carry at least 2 judge prompts`);
  }
  assert.ok(await fs.stat(defaultQcRubricFile));
});

test('rubric validator rejects a rubric missing a required dimension', async () => {
  const { rubric } = await loadQcRubric();
  const broken = {
    ...rubric,
    dimensions: rubric.dimensions.filter((dimension) => dimension.id !== 'doctrine-presence')
  };
  const validation = validateQcRubric(broken);
  assert.equal(validation.status, 'fail');
  assert.ok(validation.failures.some((failure) => failure.id === 'qc-rubric:missing:doctrine-presence'));
});

test('rubric validator rejects incomplete anchors and thin judge prompts', async () => {
  const { rubric } = await loadQcRubric();
  const broken = structuredClone(rubric);
  broken.dimensions[0].anchors = broken.dimensions[0].anchors.slice(0, 4);
  broken.dimensions[1].judgePrompts = ['only one prompt'];
  const validation = validateQcRubric(broken);
  assert.equal(validation.status, 'fail');
  assert.ok(validation.failures.some((failure) => failure.id === `qc-rubric:${broken.dimensions[0].id}:anchors`));
  assert.ok(validation.failures.some((failure) => failure.id === `qc-rubric:${broken.dimensions[1].id}:judge-prompts`));
});

test('rubric validator rejects a wrong schema version and bad scale', () => {
  const validation = validateQcRubric({
    schemaVersion: 'midas.qc-rubric.v0',
    scale: { min: 0, max: 10 },
    passThreshold: 4,
    dimensions: []
  });
  assert.equal(validation.status, 'fail');
  assert.ok(validation.failures.some((failure) => failure.id === 'qc-rubric:schema-version'));
  assert.ok(validation.failures.some((failure) => failure.id === 'qc-rubric:scale'));
});
