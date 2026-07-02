import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  inspectEngineeringDiscipline,
  validateEngineeringDiscipline
} from '../lib/engineering-discipline.mjs';

const validPolicy = {
  schemaVersion: 'midas.engineering-discipline.v1',
  policy: {
    strictnessDefault: 'standard',
    simpleTaskFastPath: true,
    maxChangedFilesWithoutPlan: 6,
    maxNewModulesWithoutApproval: 1,
    evidenceBeforeClaims: true,
    preserveUnrelatedCode: true,
    approvalsRequiredFor: [
      'broad-refactor',
      'destructive-change',
      'external-action',
      'secret-access',
      'public-claim',
      'new-runtime-dependency'
    ]
  },
  rules: [
    {
      id: 'assumption-control',
      name: 'Assumption Control',
      purpose: 'Surface uncertain requirements before implementation so agents do not silently choose a risky interpretation.',
      appliesTo: ['bug-fix', 'feature-slice'],
      triggers: ['The request has multiple plausible interpretations.'],
      preflight: ['objective', 'assumptions', 'ambiguities', 'clarifying-question'],
      during: ['scope-boundary'],
      closeout: ['evidence-summary'],
      failureModes: ['Agent implements hidden assumptions as if they were confirmed requirements.'],
      remediation: ['Pause, name the ambiguity, and get the missing decision before mutating high-risk files.']
    },
    {
      id: 'scope-minimization',
      name: 'Scope Minimization',
      purpose: 'Keep implementation bounded to the requested outcome and block speculative features or abstractions.',
      appliesTo: ['simple-change', 'bug-fix'],
      triggers: ['The implementation starts adding unrequested optional flexibility.'],
      preflight: ['objective', 'scope-boundary', 'non-goals'],
      during: ['no-speculative-features'],
      closeout: ['changed-files'],
      failureModes: ['Agent ships an overbuilt solution that is harder to review and maintain.'],
      remediation: ['Replace speculative structure with the smallest change that satisfies the stated done criteria.']
    },
    {
      id: 'diff-hygiene',
      name: 'Diff Hygiene',
      purpose: 'Preserve unrelated code and behavior while cleaning up only artifacts created by the current change.',
      appliesTo: ['simple-change', 'bug-fix'],
      triggers: ['The patch changes nearby formatting, comments, names, or control flow outside the requested scope.'],
      preflight: ['existing-style'],
      during: ['changed-files', 'line-justification', 'orphan-cleanup'],
      closeout: ['rollback-note'],
      failureModes: ['Agent introduces review noise or behavior drift through drive-by cleanup.'],
      remediation: ['Revert unrelated edits and remove only unused artifacts introduced by the current patch.']
    },
    {
      id: 'verification-loop',
      name: 'Verification Loop',
      purpose: 'Convert work into success criteria and evidence so completion claims are tied to observed checks.',
      appliesTo: ['bug-fix', 'feature-slice'],
      triggers: ['The request has a user-visible or production-facing outcome.'],
      preflight: ['objective', 'precheck'],
      during: ['postcheck', 'evidence-summary'],
      closeout: ['risk-summary'],
      failureModes: ['Agent declares success from intent rather than reproducible checks or observed evidence.'],
      remediation: ['Record success criteria, run the smallest relevant checks, and report unverified areas explicitly.']
    }
  ]
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('default MIDAS engineering discipline policy passes', async () => {
  const result = await inspectEngineeringDiscipline(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.equal(result.schemaVersion, 'midas.engineering-discipline.v1');
  assert.equal(result.strictness, 'standard');
  assert.ok(result.rules.some((rule) => rule.id === 'assumption-control'));
  assert.ok(result.rules.some((rule) => rule.id === 'scope-minimization'));
  assert.ok(result.rules.some((rule) => rule.id === 'diff-hygiene'));
  assert.ok(result.rules.some((rule) => rule.id === 'verification-loop'));
});

test('engineering discipline validation requires all core rules', () => {
  const policy = clone(validPolicy);
  policy.rules = policy.rules.filter((rule) => rule.id !== 'diff-hygiene');
  const failures = validateEngineeringDiscipline(policy);
  assert.ok(failures.some((failure) => failure.id === 'engineering-discipline:required-rule:diff-hygiene'));
});

test('engineering discipline validation requires evidence before claims', () => {
  const policy = clone(validPolicy);
  policy.policy.evidenceBeforeClaims = false;
  const failures = validateEngineeringDiscipline(policy);
  assert.ok(failures.some((failure) => failure.id === 'engineering-discipline:policy:evidence-before-claims'));
});

test('engineering discipline validation rejects missing semantic checkpoints', () => {
  const policy = clone(validPolicy);
  const rule = policy.rules.find((item) => item.id === 'scope-minimization');
  rule.during = rule.during.filter((checkpoint) => checkpoint !== 'no-speculative-features');
  const failures = validateEngineeringDiscipline(policy);
  assert.ok(failures.some((failure) => failure.id === 'engineering-discipline:scope-minimization:checkpoint-required:no-speculative-features'));
});

test('engineering discipline validation rejects unknown checkpoints', () => {
  const policy = clone(validPolicy);
  const rule = policy.rules.find((item) => item.id === 'diff-hygiene');
  rule.during.push('rewrite-everything');
  const failures = validateEngineeringDiscipline(policy);
  assert.ok(failures.some((failure) => failure.id === 'engineering-discipline:diff-hygiene:during:allowed'));
});

test('installed workspace includes passing engineering discipline', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-engineering-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev',
    tools: 'codex',
    yes: true
  });
  const result = await inspectEngineeringDiscipline(temp);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'engineering', 'discipline.json')));
  assert.ok(result.maxChangedFilesWithoutPlan >= 1);
});
