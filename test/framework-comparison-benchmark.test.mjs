import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatBenchmarkReport,
  scoreFrameworkResults
} from '../lib/framework-comparison-benchmark.mjs';

const sampleItems = [
  {
    framework: 'midas',
    id: 'install-noninteractive',
    label: 'Noninteractive install creates a project harness',
    status: 'pass',
    expectation: 'exit-zero',
    durationMs: 100,
    note: ''
  },
  {
    framework: 'midas',
    id: 'verification-gap-detects-missing',
    label: 'Verification-gap gate catches an omitted requirement',
    status: 'pass',
    expectation: 'exit-nonzero',
    durationMs: 90,
    note: ''
  },
  {
    framework: 'bmad',
    id: 'install-noninteractive',
    label: 'Noninteractive install creates a project harness',
    status: 'fail',
    expectation: 'exit-zero',
    durationMs: 500,
    note: 'Installer failed locally.'
  },
  {
    framework: 'bmad',
    id: 'verification-gap-detects-missing',
    label: 'Verification-gap gate catches an omitted requirement',
    status: 'fail',
    expectation: 'deterministic-local-cli-capability',
    durationMs: 0,
    note: 'No deterministic local CLI command is exposed by the pinned BMAD installer.'
  }
];

test('scoreFrameworkResults ranks by pass rate and preserves failures', () => {
  const summary = scoreFrameworkResults(sampleItems);
  assert.equal(summary.winner, 'midas');
  assert.equal(summary.tie, false);
  assert.equal(summary.frameworks[0].score, 1);
  assert.equal(summary.frameworks[1].score, 0);
  assert.equal(summary.frameworks[1].failures.length, 2);
});

test('formatBenchmarkReport keeps benchmark claim boundary explicit', () => {
  const summary = scoreFrameworkResults(sampleItems);
  const report = formatBenchmarkReport({
    generatedAt: '2026-07-04T00:00:00.000Z',
    bmadDirectory: 'D:/tmp/BMAD-METHOD',
    midasDirectory: 'D:/tmp/midas-framework',
    summary,
    items: sampleItems
  });
  assert.match(report, /private local validation/i);
  assert.match(report, /does not measure public adoption/i);
  assert.match(report, /Not allowed: MIDAS is globally better than BMAD/i);
});
