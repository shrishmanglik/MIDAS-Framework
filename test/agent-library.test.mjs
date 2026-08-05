import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {
  agentLibrarySchemaVersion,
  inspectAgentLibrary,
  parseAgentMarkdown,
  validateAgentRecord
} from '../lib/agent-library.mjs';

const rosterNames = [
  'planner',
  'builder',
  'reviewer',
  'researcher',
  'backend-architect',
  'frontend-developer',
  'security-auditor',
  'code-reviewer',
  'test-automator',
  'deployment-engineer',
  'data-engineer',
  'debugger',
  'docs-engineer',
  'performance-engineer'
];

function buildAgent({
  name = 'sample-agent',
  description = 'Do sample work with evidence attached. Use when validating the agent format.',
  license = 'Apache-2.0',
  modelTier = 'frontier',
  routingFlags = false,
  escalation,
  maxSteps = 12,
  permissions = {},
  omitSection = null,
  bodyPadLines = 0
} = {}) {
  const perms = {
    read: 'allow',
    search: 'allow',
    edit: 'ask',
    shell: 'ask',
    web: 'ask',
    task: 'deny',
    ...permissions
  };
  const frontmatterLines = [
    '---',
    `name: ${name}`,
    `description: ${description}`,
    `license: ${license}`,
    `model-tier: ${modelTier}`
  ];
  if (escalation) frontmatterLines.push(`escalation: ${escalation}`);
  if (routingFlags) {
    frontmatterLines.push('gold-reference: true');
    frontmatterLines.push('deterministic-check: true');
  }
  frontmatterLines.push(`maxSteps: ${maxSteps}`);
  frontmatterLines.push('permissions:');
  for (const [key, value] of Object.entries(perms)) {
    frontmatterLines.push(`  ${key}: ${value}`);
  }
  frontmatterLines.push('---');

  const sections = [
    'Purpose',
    'Capabilities',
    'Behavioral Traits',
    'Workflow Position',
    'Response Approach',
    'Guardrails',
    'Claim Ceiling'
  ];
  const bodyParts = [];
  for (const section of sections) {
    if (section === omitSection) continue;
    bodyParts.push(`## ${section}`);
    bodyParts.push('');
    bodyParts.push(`Content for ${section.toLowerCase()}.`);
    bodyParts.push('');
  }
  if (bodyPadLines > 0) {
    bodyParts.push(...Array.from({ length: bodyPadLines }, (_, index) => `Padding line ${index + 1}.`));
  }
  bodyParts.push('*Provenance: test fixture, 2026-08-05.*');
  return `${frontmatterLines.join('\n')}\n\n${bodyParts.join('\n')}\n`;
}

function validate(text, name = 'sample-agent') {
  return validateAgentRecord({
    fileName: `${name}.md`,
    relativeFile: `framework/agents/roster/${name}.md`,
    text
  });
}

test('default MIDAS agent roster passes with all 14 seed agents', async () => {
  const result = await inspectAgentLibrary(path.resolve('.'));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
  assert.equal(result.schemaVersion, agentLibrarySchemaVersion);
  assert.equal(result.agents.length, rosterNames.length);
  for (const name of rosterNames) {
    assert.ok(result.agents.some((agent) => agent.id === name), `missing roster agent: ${name}`);
  }
});

test('roster reviewer-class agents keep edit deny and open-tier agents carry routing flags', async () => {
  const result = await inspectAgentLibrary(path.resolve('.'));
  for (const agent of result.agents) {
    if (/(review|audit)/.test(agent.id)) {
      assert.equal(agent.permissions.edit, 'deny', `${agent.id} must deny edit`);
    }
    if (agent.modelTier === 'open' || agent.modelTier === 'local') {
      assert.equal(agent.goldReference, true, `${agent.id} missing gold-reference`);
      assert.equal(agent.deterministicCheck, true, `${agent.id} missing deterministic-check`);
    }
    assert.ok(agent.bodyLines <= 200, `${agent.id} body exceeds 200 lines`);
  }
});

test('agent parser requires frontmatter', () => {
  assert.throws(() => parseAgentMarkdown('# No frontmatter here'), /frontmatter/);
});

test('agent parser reads nested permissions, booleans, and integers', () => {
  const { frontmatter } = parseAgentMarkdown(buildAgent({ modelTier: 'open', routingFlags: true }));
  assert.equal(frontmatter.maxSteps, 12);
  assert.equal(frontmatter['gold-reference'], true);
  assert.equal(frontmatter['deterministic-check'], true);
  assert.deepEqual(frontmatter.permissions, {
    read: 'allow',
    search: 'allow',
    edit: 'ask',
    shell: 'ask',
    web: 'ask',
    task: 'deny'
  });
});

test('valid frontier agent passes validation', () => {
  const result = validate(buildAgent());
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
});

test('valid open-tier agent with routing flags passes validation', () => {
  const result = validate(buildAgent({
    modelTier: 'open',
    routingFlags: true,
    escalation: 'route to frontier after 2 deterministic-check failures'
  }));
  assert.equal(result.status, 'pass', JSON.stringify(result.failures, null, 2));
});

test('rejects open-tier agent without gold-reference and deterministic-check flags', () => {
  const result = validate(buildAgent({ modelTier: 'open', routingFlags: false }));
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-agent:routing-flags'));
});

test('rejects local-tier agent without routing flags', () => {
  const result = validate(buildAgent({ modelTier: 'local', routingFlags: false }));
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-agent:routing-flags'));
});

test('rejects reviewer-class agent with edit allow', () => {
  const result = validate(
    buildAgent({ name: 'sample-reviewer', permissions: { edit: 'allow' } }),
    'sample-reviewer'
  );
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-reviewer:semantic-reviewer-edit'));
});

test('rejects audit-named agent with edit ask', () => {
  const result = validate(
    buildAgent({ name: 'sample-auditor', permissions: { edit: 'ask' } }),
    'sample-auditor'
  );
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-auditor:semantic-reviewer-edit'));
});

test('rejects researcher-class agent with shell allow', () => {
  const result = validate(
    buildAgent({ name: 'sample-researcher', permissions: { edit: 'deny', shell: 'allow' } }),
    'sample-researcher'
  );
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-researcher:semantic-researcher-shell'));
});

test('rejects missing required section', () => {
  const result = validate(buildAgent({ omitSection: 'Guardrails' }));
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-agent:section-guardrails'));
});

test('rejects missing claim ceiling section', () => {
  const result = validate(buildAgent({ omitSection: 'Claim Ceiling' }));
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-agent:section-claim-ceiling'));
});

test('rejects body over 200 lines', () => {
  const result = validate(buildAgent({ bodyPadLines: 200 }));
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-agent:body-lines'));
});

test('rejects description without a dispatch trigger', () => {
  const result = validate(buildAgent({ description: 'Summarizes its own process in loving detail.' }));
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-agent:description-trigger'));
});

test('rejects name that does not match filename', () => {
  const result = validate(buildAgent({ name: 'other-name' }), 'sample-agent');
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:other-name:file-match'));
});

test('rejects missing license', () => {
  const result = validate(buildAgent({ license: '' }));
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-agent:license'));
});

test('rejects unknown model tier', () => {
  const result = validate(buildAgent({ modelTier: 'gigantic' }));
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-agent:model-tier'));
});

test('rejects out-of-range maxSteps', () => {
  for (const maxSteps of [0, 41]) {
    const result = validate(buildAgent({ maxSteps }));
    assert.equal(result.status, 'fail');
    assert.ok(result.failures.some((failure) => failure.id === 'agent:sample-agent:max-steps'));
  }
});

test('rejects invalid and incomplete permissions', () => {
  const badAction = validate(buildAgent({ permissions: { web: 'maybe' } }));
  assert.equal(badAction.status, 'fail');
  assert.ok(badAction.failures.some((failure) => failure.id === 'agent:sample-agent:permission-web'));

  const text = buildAgent().replace('  task: deny\n', '');
  const missingKey = validate(text);
  assert.equal(missingKey.status, 'fail');
  assert.ok(missingKey.failures.some((failure) => failure.id === 'agent:sample-agent:permission-task'));

  const unknownKey = validate(buildAgent().replace('permissions:\n', 'permissions:\n  teleport: allow\n'));
  assert.equal(unknownKey.status, 'fail');
  assert.ok(unknownKey.failures.some((failure) => failure.id === 'agent:sample-agent:permissions-unknown'));
});

test('rejects empty escalation policy', () => {
  const text = buildAgent().replace('model-tier: frontier\n', 'model-tier: frontier\nescalation:  \n');
  const result = validate(text);
  assert.equal(result.status, 'fail', JSON.stringify(result.failures, null, 2));
});

test('inspect fails cleanly on a missing roster root', async () => {
  const result = await inspectAgentLibrary(path.resolve('.'), {
    root: path.join(path.resolve('.'), 'framework', 'agents', 'no-such-roster')
  });
  assert.equal(result.status, 'fail');
  assert.ok(result.failures.some((failure) => failure.id === 'agent-library:root'));
});
