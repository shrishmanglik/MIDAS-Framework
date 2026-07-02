import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installWorkspace } from '../lib/installer.mjs';
import {
  inspectQualityScorecard,
  validateQualityScorecard
} from '../lib/quality-scorecard.mjs';

test('default MIDAS quality scorecard passes with local-validation posture', async () => {
  const result = await inspectQualityScorecard(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.equal(result.schemaVersion, 'midas.quality-scorecard.v1');
  assert.ok(result.score >= 80);
  assert.ok(result.components.some((component) => component.id === 'skill-library'));
  assert.ok(result.components.some((component) => component.id === 'harness-adapters'));
  assert.ok(result.warnings.some((warning) => warning.id.includes('not-public-release-ready')));
});

test('quality scorecard rejects missing required dimensions', () => {
  const catalog = {
    schemaVersion: 'midas.quality-scorecard.v1',
    policy: {
      scoreScale: '0-100',
      minOverallScore: 80,
      minComponentScore: 75,
      minRequiredDimensionScore: 70,
      publicReleaseMinScore: 90,
      deterministicOnlyByDefault: true,
      llmJudgesRequireExplicitApproval: true,
      distributionClaimsRequireEvidence: true,
      publicReleaseRequiresApproval: true,
      generatedArtifactsAreNotSourceOfTruth: true,
      externalComponentsRequireLicenseReview: true,
      requiredDimensions: [
        'trigger-clarity',
        'scope-calibration',
        'progressive-disclosure',
        'harness-portability',
        'evidence-discipline',
        'approval-safety',
        'drift-control'
      ],
      allowedComponentKinds: [
        'skill-pack',
        'harness-adapter',
        'agent-profile',
        'work-order',
        'benchmark-receipt',
        'interface-contract',
        'knowledge-pack',
        'run-control',
        'gateway-contract',
        'channel-gateway',
        'release-package'
      ]
    },
    components: [
      {
        id: 'thin-skill',
        kind: 'skill-pack',
        artifactPath: '.midas/skills/thin',
        purpose: 'Validate that missing scorecard dimensions fail deterministically.',
        distributionSurface: 'workspace',
        dimensions: [
          {
            id: 'trigger-clarity',
            score: 90,
            evidence: 'The trigger phrase is present and clear enough for deterministic activation.'
          }
        ],
        risks: [
          'Missing dimensions must be fixed before relying on this component.'
        ],
        releaseGate: {
          claimLevel: 'local-validation',
          publicReleaseReady: false,
          approvalRequired: true,
          evidenceRequired: 'Run midas quality after restoring all required dimensions.'
        }
      }
    ]
  };

  const result = validateQualityScorecard(catalog);
  assert.ok(result.failures.some((failure) => failure.id === 'quality-scorecard:thin-skill:required-dimension:scope-calibration'));
});

test('quality scorecard rejects public release readiness without approval', () => {
  const catalog = JSON.parse(JSON.stringify({
    schemaVersion: 'midas.quality-scorecard.v1',
    policy: {
      scoreScale: '0-100',
      minOverallScore: 80,
      minComponentScore: 75,
      minRequiredDimensionScore: 70,
      publicReleaseMinScore: 90,
      deterministicOnlyByDefault: true,
      llmJudgesRequireExplicitApproval: true,
      distributionClaimsRequireEvidence: true,
      publicReleaseRequiresApproval: true,
      generatedArtifactsAreNotSourceOfTruth: true,
      externalComponentsRequireLicenseReview: true,
      requiredDimensions: [
        'trigger-clarity',
        'scope-calibration',
        'progressive-disclosure',
        'harness-portability',
        'evidence-discipline',
        'approval-safety',
        'drift-control'
      ],
      allowedComponentKinds: [
        'skill-pack',
        'harness-adapter',
        'agent-profile',
        'work-order',
        'benchmark-receipt',
        'interface-contract',
        'knowledge-pack',
        'run-control',
        'gateway-contract',
        'channel-gateway',
        'release-package'
      ]
    },
    components: [
      {
        id: 'release-package',
        kind: 'release-package',
        artifactPath: '.midas/quality/scorecard.json',
        purpose: 'Validate that public release claims keep explicit approval gates.',
        distributionSurface: 'public-release',
        dimensions: [
          { id: 'trigger-clarity', score: 95, evidence: 'The reviewed release package is explicitly named.' },
          { id: 'scope-calibration', score: 95, evidence: 'The release package names bounded public-release posture.' },
          { id: 'progressive-disclosure', score: 95, evidence: 'The package points to evidence instead of embedding all logs.' },
          { id: 'harness-portability', score: 95, evidence: 'The package includes cross-harness validation expectations.' },
          { id: 'evidence-discipline', score: 95, evidence: 'The package requires validation and claim evidence.' },
          { id: 'approval-safety', score: 95, evidence: 'Approval gates are represented as scorecard dimensions.' },
          { id: 'drift-control', score: 95, evidence: 'The package requires freshness and drift checks.' }
        ],
        risks: ['Public readiness still requires explicit approval.'],
        releaseGate: {
          claimLevel: 'public-release',
          publicReleaseReady: true,
          approvalRequired: false,
          evidenceRequired: 'Run final release gates before publication.'
        }
      }
    ]
  }));

  const result = validateQualityScorecard(catalog);
  assert.ok(result.failures.some((failure) => failure.id === 'quality-scorecard:release-package:public-release-approval'));
});

test('installed workspace includes passing quality scorecard', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-quality-'));
  await installWorkspace({
    directory: temp,
    modules: 'core,software-dev,qa',
    tools: 'codex',
    yes: true
  });
  const result = await inspectQualityScorecard(temp);
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.ok(await fs.stat(path.join(temp, '.midas', 'quality', 'scorecard.json')));
  assert.ok(result.components.some((component) => component.kind === 'release-package'));
});
