import fs from 'node:fs/promises';
import path from 'node:path';
import { inspectAgentProfiles, loadAgentProfiles } from './agent-profiles.mjs';
import { inspectAdapterContracts, loadAdapterContracts } from './adapter-contracts.mjs';
import { loadAdapterPolicy } from './adapter-policy.mjs';
import { inspectAuthorityContracts } from './authority-contracts.mjs';
import { inspectBenchmarkReceipts } from './benchmark-receipts.mjs';
import { inspectChannelGateways } from './channel-gateways.mjs';
import { inspectProjectContext } from './context-inspector.mjs';
import { inspectEngineeringDiscipline } from './engineering-discipline.mjs';
import { inspectFlowComponents } from './flow-components.mjs';
import { inspectGatewayContracts } from './gateway-contracts.mjs';
import { inspectHarnessInventory } from './harness-inventory.mjs';
import { inspectInterfaceQuality } from './interface-quality.mjs';
import { inspectKnowledgePacks } from './knowledge-packs.mjs';
import { loadModuleRegistry } from './module-registry.mjs';
import { loadProjectChecks, runProjectChecks } from './project-checks.mjs';
import { inspectQualityScorecard } from './quality-scorecard.mjs';
import { inspectRunControls } from './run-controls.mjs';
import { inspectRuntimeRuns } from './runtime-runner.mjs';
import { inspectSkillLibrary } from './skill-library.mjs';
import { parseWorkflowDefinition } from './workflow-runner.mjs';

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function phrase(parts, separator = ' ') {
  return parts.join(separator);
}

const methodologyReferenceTerms = [
  phrase(['private', 'methodology']),
  phrase(['source', 'history'], '-'),
  `${phrase(['repo', 'by', 'repo'], '-')} ${phrase(['synthesis'])}`,
  phrase(['internal', 'operating', 'system'])
];

const productReferenceTerms = [
  phrase(['private', 'product']),
  phrase(['client', 'product']),
  phrase(['customer', 'product']),
  phrase(['internal', 'product'])
];

const forbiddenPatterns = [
  { id: 'private-root-path', pattern: /\b[A-Z]:(?:\/|\\)[^\r\n]*(?:private|internal|confidential|client|customer)[^\r\n]*(?:\/|\\)/i, severity: 'high' },
  { id: 'secret-assignment', pattern: /\b(api[_-]?key|secret[_-]?key|private[_-]?key|access[_-]?token|refresh[_-]?token)\s*[:=]\s*["']?[^"'\s]+/i, severity: 'critical' },
  { id: 'private-methodology-reference', pattern: new RegExp(`\\b(${methodologyReferenceTerms.map(escapePattern).join('|')})\\b`, 'i'), severity: 'medium' },
  { id: 'private-product-reference', pattern: new RegExp(`\\b(${productReferenceTerms.map(escapePattern).join('|')})\\b`, 'i'), severity: 'medium' }
];

const ignoredDirectories = new Set([
  'node_modules',
  '.git',
  '.midas',
  'tmp',
  'coverage'
]);

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function walk(root, files = []) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue;
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

async function validateWorkspace(target, options = {}) {
  const checks = [];
  const required = [
    '.midas/_config/manifest.yaml',
    '.midas/project-context.md',
    '.midas/sprint-status.yaml',
    '.midas/checks.json',
    '.midas/agent-profiles.json',
    '.midas/authority/constitution.json',
    '.midas/benchmarks/receipts.json',
    '.midas/channels/gateways.json',
    '.midas/engineering/discipline.json',
    '.midas/flows/components.json',
    '.midas/gateways/contracts.json',
    '.midas/interface/quality.json',
    '.midas/knowledge/packs.json',
    '.midas/quality/scorecard.json',
    '.midas/run-control/policy.json',
    '.midas/runtime/runs',
    '.midas/skills',
    '.midas/harness-inventory.json',
    '.midas/context-snapshot.json',
    '.midas/workorders',
    '.midas/run-ledger'
  ];
  for (const file of required) {
    const present = await exists(path.join(target, file));
    checks.push({
      id: `workspace:${file}`,
      status: present ? 'pass' : 'fail',
      remediation: present ? '' : `Run midas install --directory ${target}`
    });
  }

  if (await exists(path.join(target, '.midas', 'checks.json'))) {
    try {
      const projectChecks = await loadProjectChecks(target);
      checks.push({
        id: 'workspace:project-checks-config',
        status: 'pass',
        remediation: ''
      });
      if (options.runChecks) {
        const run = await runProjectChecks(target);
        if (run.total === 0) {
          checks.push({
            id: 'workspace:project-checks:none-enabled',
            status: 'pass',
            remediation: 'Enable checks in .midas/checks.json when this project has runnable local verification.'
          });
        }
        for (const result of run.results) {
          checks.push({
            id: `workspace:project-check:${result.id}`,
            status: result.status,
            elapsedMs: result.elapsedMs,
            remediation: result.status === 'pass' ? '' : `Command failed: ${result.command} ${(result.args ?? []).join(' ')}`
          });
        }
      } else if (projectChecks.checks.some((check) => check.enabled !== false)) {
        checks.push({
          id: 'workspace:project-checks:available',
          status: 'pass',
          remediation: 'Run midas validate --run-checks to execute declared project checks.'
        });
      }
    } catch (error) {
      checks.push({
        id: 'workspace:project-checks-config',
        status: 'fail',
        remediation: `Fix .midas/checks.json: ${error.message}`
      });
    }
  }

  if (await exists(path.join(target, '.midas', 'harness-inventory.json'))) {
    const inspection = await inspectHarnessInventory(target);
    checks.push({
      id: 'workspace:harness-inventory',
      status: inspection.status,
      remediation: inspection.status === 'pass' ? '' : 'Fix .midas/harness-inventory.json or regenerate adapters with midas update.'
    });
    for (const failure of inspection.failures) {
      checks.push(failure);
    }
  }

  const agentProfilesInspection = await inspectAgentProfiles(target);
  checks.push({
    id: 'workspace:agent-profiles',
    status: agentProfilesInspection.status,
    remediation: agentProfilesInspection.status === 'pass' ? '' : 'Fix .midas/agent-profiles.json or regenerate with midas update.'
  });
  for (const failure of agentProfilesInspection.failures) {
    checks.push(failure);
  }

  const skillInspection = await inspectSkillLibrary(target);
  checks.push({
    id: 'workspace:skills',
    status: skillInspection.status,
    warnings: skillInspection.warnings.length,
    remediation: skillInspection.status === 'pass' ? '' : 'Fix .midas/skills or regenerate with midas update.'
  });
  for (const failure of skillInspection.failures) {
    checks.push(failure);
  }

  const authorityInspection = await inspectAuthorityContracts(target);
  checks.push({
    id: 'workspace:authority',
    status: authorityInspection.status,
    remediation: authorityInspection.status === 'pass' ? '' : 'Fix .midas/authority/constitution.json or regenerate with midas update.'
  });
  for (const failure of authorityInspection.failures) {
    checks.push(failure);
  }

  const benchmarkInspection = await inspectBenchmarkReceipts(target);
  checks.push({
    id: 'workspace:benchmark-receipts',
    status: benchmarkInspection.status,
    remediation: benchmarkInspection.status === 'pass' ? '' : 'Fix .midas/benchmarks/receipts.json or regenerate with midas update.'
  });
  for (const failure of benchmarkInspection.failures) {
    checks.push(failure);
  }

  const engineeringDisciplineInspection = await inspectEngineeringDiscipline(target);
  checks.push({
    id: 'workspace:engineering-discipline',
    status: engineeringDisciplineInspection.status,
    remediation: engineeringDisciplineInspection.status === 'pass' ? '' : 'Fix .midas/engineering/discipline.json or regenerate with midas update.'
  });
  for (const failure of engineeringDisciplineInspection.failures) {
    checks.push(failure);
  }

  const interfaceInspection = await inspectInterfaceQuality(target);
  checks.push({
    id: 'workspace:interface-quality',
    status: interfaceInspection.status,
    remediation: interfaceInspection.status === 'pass' ? '' : 'Fix .midas/interface/quality.json or regenerate with midas update.'
  });
  for (const failure of interfaceInspection.failures) {
    checks.push(failure);
  }

  const flowComponentInspection = await inspectFlowComponents(target);
  checks.push({
    id: 'workspace:flow-components',
    status: flowComponentInspection.status,
    remediation: flowComponentInspection.status === 'pass' ? '' : 'Fix .midas/flows/components.json or regenerate with midas update.'
  });
  for (const failure of flowComponentInspection.failures) {
    checks.push(failure);
  }

  const gatewayContractInspection = await inspectGatewayContracts(target);
  checks.push({
    id: 'workspace:gateway-contracts',
    status: gatewayContractInspection.status,
    remediation: gatewayContractInspection.status === 'pass' ? '' : 'Fix .midas/gateways/contracts.json or regenerate with midas update.'
  });
  for (const failure of gatewayContractInspection.failures) {
    checks.push(failure);
  }

  const knowledgePackInspection = await inspectKnowledgePacks(target);
  checks.push({
    id: 'workspace:knowledge-packs',
    status: knowledgePackInspection.status,
    remediation: knowledgePackInspection.status === 'pass' ? '' : 'Fix .midas/knowledge/packs.json or regenerate with midas update.'
  });
  for (const failure of knowledgePackInspection.failures) {
    checks.push(failure);
  }

  const runControlInspection = await inspectRunControls(target);
  checks.push({
    id: 'workspace:run-controls',
    status: runControlInspection.status,
    remediation: runControlInspection.status === 'pass' ? '' : 'Fix .midas/run-control/policy.json or regenerate with midas update.'
  });
  for (const failure of runControlInspection.failures) {
    checks.push(failure);
  }

  const qualityInspection = await inspectQualityScorecard(target);
  checks.push({
    id: 'workspace:quality-scorecard',
    status: qualityInspection.status,
    warnings: qualityInspection.warnings.length,
    remediation: qualityInspection.status === 'pass' ? '' : 'Fix .midas/quality/scorecard.json or regenerate with midas update.'
  });
  for (const failure of qualityInspection.failures) {
    checks.push(failure);
  }

  const runtimeInspection = await inspectRuntimeRuns(target);
  checks.push({
    id: 'workspace:runtime-runs',
    status: runtimeInspection.status,
    remediation: runtimeInspection.status === 'pass' ? '' : 'Fix .midas/runtime/runs or regenerate workspace with midas update.'
  });
  for (const failure of runtimeInspection.failures) {
    checks.push(failure);
  }

  const channelGatewayInspection = await inspectChannelGateways(target);
  checks.push({
    id: 'workspace:channel-gateways',
    status: channelGatewayInspection.status,
    remediation: channelGatewayInspection.status === 'pass' ? '' : 'Fix .midas/channels/gateways.json or regenerate with midas update.'
  });
  for (const failure of channelGatewayInspection.failures) {
    checks.push(failure);
  }

  const adapterInspection = await inspectAdapterContracts(target);
  checks.push({
    id: 'workspace:adapter-contracts',
    status: adapterInspection.status,
    remediation: adapterInspection.status === 'pass' ? '' : 'Regenerate adapter files with midas update.'
  });
  for (const failure of adapterInspection.failures) {
    checks.push(failure);
  }

  if (await exists(path.join(target, '.midas'))) {
    const inspection = await inspectProjectContext(target);
    checks.push({
      id: 'workspace:context-health',
      status: inspection.status === 'fail' ? 'fail' : 'pass',
      warnings: inspection.warnings.length,
      remediation: inspection.status === 'fail'
        ? 'Fix context, manifest, checks, harness inventory, or regenerate with midas update.'
        : inspection.warnings.length > 0
          ? 'Review warnings with midas context and refresh .midas/context-snapshot.json when intended.'
          : ''
    });
    for (const failure of inspection.failures) {
      checks.push(failure);
    }
  }
  return checks;
}

async function validateRepository(target) {
  const checks = [];
  const required = [
    'README.md',
    'LICENSE',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'CODE_OF_CONDUCT.md',
    'release-plan.md',
    'package.json',
    'bin/midas.mjs',
    'lib/agent-profiles.mjs',
    'lib/adapter-policy.mjs',
    'lib/adapter-contracts.mjs',
    'lib/authority-contracts.mjs',
    'lib/benchmark-receipts.mjs',
    'lib/channel-gateways.mjs',
    'lib/cli.mjs',
    'lib/context-inspector.mjs',
    'lib/engineering-discipline.mjs',
    'lib/flow-components.mjs',
    'lib/gateway-contracts.mjs',
    'lib/harness-inventory.mjs',
    'lib/interface-quality.mjs',
    'lib/knowledge-packs.mjs',
    'lib/module-registry.mjs',
    'lib/project-checks.mjs',
    'lib/quality-scorecard.mjs',
    'lib/run-controls.mjs',
    'lib/runtime-runner.mjs',
    'lib/skill-library.mjs',
    'lib/workflow-runner.mjs',
    'docs/capability-map.md',
    'docs/implementation-backlog.md',
    'docs/architecture.md',
    'framework/agents/default-agent-profiles.json',
    'framework/adapters/default-permission-policy.json',
    'framework/adapters/adapter-contracts.json',
    'framework/adapters/permission-policy.schema.json',
    'framework/authority/default-constitution.json',
    'framework/authority/constitution.schema.json',
    'framework/benchmarks/default-benchmark-receipts.json',
    'framework/benchmarks/benchmark-receipts.schema.json',
    'framework/channels/default-channel-gateways.json',
    'framework/channels/channel-gateways.schema.json',
    'framework/engineering/default-engineering-discipline.json',
    'framework/engineering/engineering-discipline.schema.json',
    'framework/flows/default-flow-components.json',
    'framework/flows/flow-components.schema.json',
    'framework/gateways/default-gateway-contracts.json',
    'framework/gateways/gateway-contracts.schema.json',
    'framework/interface/default-interface-quality.json',
    'framework/interface/interface-quality.schema.json',
    'framework/knowledge/default-knowledge-packs.json',
    'framework/knowledge/knowledge-packs.schema.json',
    'framework/quality/default-quality-scorecard.json',
    'framework/quality/quality-scorecard.schema.json',
    'framework/run-control/default-run-controls.json',
    'framework/run-control/run-controls.schema.json',
    'framework/skills/terminal-repair/SKILL.md',
    'framework/skills/work-order/SKILL.md',
    'framework/skills/verification/SKILL.md',
    'framework/modules/module.schema.json',
    'framework/templates/work-order-template.md',
    'framework/templates/project-context-template.md',
    'framework/workflows/software-delivery.yaml'
  ];

  for (const file of required) {
    const present = await exists(path.join(target, file));
    checks.push({
      id: `repo:${file}`,
      status: present ? 'pass' : 'fail',
      remediation: present ? '' : `Create ${file}`
    });
  }

  try {
    const result = await loadAgentProfiles({ root: target });
    checks.push({
      id: 'agent-profiles:default',
      status: result.profiles.length > 0 ? 'pass' : 'fail',
      remediation: result.profiles.length > 0 ? '' : 'Define at least one default agent profile.'
    });
  } catch (error) {
    checks.push({
      id: 'agent-profiles:default',
      status: 'fail',
      remediation: `Unable to load default agent profiles: ${error.message}`
    });
  }

  try {
    const result = await inspectSkillLibrary(target);
    checks.push({
      id: 'skill-library:default',
      status: result.status,
      warnings: result.warnings.length,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/skills SKILL.md files.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'skill-library:default',
      status: 'fail',
      remediation: `Unable to inspect default skill library: ${error.message}`
    });
  }

  try {
    const result = await inspectAuthorityContracts(target);
    checks.push({
      id: 'authority:default',
      status: result.status,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/authority/default-constitution.json.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'authority:default',
      status: 'fail',
      remediation: `Unable to inspect default authority constitution: ${error.message}`
    });
  }

  try {
    const result = await inspectBenchmarkReceipts(target);
    checks.push({
      id: 'benchmark-receipts:default',
      status: result.status,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/benchmarks/default-benchmark-receipts.json.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'benchmark-receipts:default',
      status: 'fail',
      remediation: `Unable to inspect default benchmark receipts: ${error.message}`
    });
  }

  try {
    const result = await inspectEngineeringDiscipline(target);
    checks.push({
      id: 'engineering-discipline:default',
      status: result.status,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/engineering/default-engineering-discipline.json.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'engineering-discipline:default',
      status: 'fail',
      remediation: `Unable to inspect default engineering discipline policy: ${error.message}`
    });
  }

  try {
    const result = await inspectInterfaceQuality(target);
    checks.push({
      id: 'interface-quality:default',
      status: result.status,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/interface/default-interface-quality.json.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'interface-quality:default',
      status: 'fail',
      remediation: `Unable to inspect default interface-quality policy: ${error.message}`
    });
  }

  try {
    const result = await inspectFlowComponents(target);
    checks.push({
      id: 'flow-components:default',
      status: result.status,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/flows/default-flow-components.json.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'flow-components:default',
      status: 'fail',
      remediation: `Unable to inspect default flow component catalog: ${error.message}`
    });
  }

  try {
    const result = await inspectGatewayContracts(target);
    checks.push({
      id: 'gateway-contracts:default',
      status: result.status,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/gateways/default-gateway-contracts.json.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'gateway-contracts:default',
      status: 'fail',
      remediation: `Unable to inspect default gateway contracts: ${error.message}`
    });
  }

  try {
    const result = await inspectKnowledgePacks(target);
    checks.push({
      id: 'knowledge-packs:default',
      status: result.status,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/knowledge/default-knowledge-packs.json.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'knowledge-packs:default',
      status: 'fail',
      remediation: `Unable to inspect default knowledge pack catalog: ${error.message}`
    });
  }

  try {
    const result = await inspectRunControls(target);
    checks.push({
      id: 'run-controls:default',
      status: result.status,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/run-control/default-run-controls.json.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'run-controls:default',
      status: 'fail',
      remediation: `Unable to inspect default run-control policy: ${error.message}`
    });
  }

  try {
    const result = await inspectQualityScorecard(target);
    checks.push({
      id: 'quality-scorecard:default',
      status: result.status,
      warnings: result.warnings.length,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/quality/default-quality-scorecard.json.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'quality-scorecard:default',
      status: 'fail',
      remediation: `Unable to inspect default quality scorecard: ${error.message}`
    });
  }

  try {
    const result = await inspectChannelGateways(target);
    checks.push({
      id: 'channel-gateways:default',
      status: result.status,
      remediation: result.status === 'pass' ? '' : 'Fix default framework/channels/default-channel-gateways.json.'
    });
    for (const failure of result.failures) {
      checks.push(failure);
    }
  } catch (error) {
    checks.push({
      id: 'channel-gateways:default',
      status: 'fail',
      remediation: `Unable to inspect default channel gateways: ${error.message}`
    });
  }

  try {
    await loadAdapterContracts({ root: target });
    checks.push({
      id: 'adapter-contracts:default',
      status: 'pass',
      remediation: ''
    });
  } catch (error) {
    checks.push({
      id: 'adapter-contracts:default',
      status: 'fail',
      remediation: `Unable to load default adapter contracts: ${error.message}`
    });
  }

  try {
    await loadAdapterPolicy({ root: target });
    checks.push({
      id: 'adapter-policy:default',
      status: 'pass',
      remediation: ''
    });
  } catch (error) {
    checks.push({
      id: 'adapter-policy:default',
      status: 'fail',
      remediation: `Unable to load default adapter permission policy: ${error.message}`
    });
  }

  try {
    const registry = await loadModuleRegistry({ root: target });
    for (const failure of registry.failures) {
      checks.push(failure);
    }
    checks.push({
      id: 'module-registry:has-modules',
      status: registry.modules.length > 0 ? 'pass' : 'fail',
      remediation: registry.modules.length > 0 ? '' : 'Create at least one valid module manifest.'
    });
  } catch (error) {
    checks.push({
      id: 'module-registry:load',
      status: 'fail',
      remediation: `Unable to load module registry: ${error.message}`
    });
  }

  try {
    const workflowText = await fs.readFile(path.join(target, 'framework', 'workflows', 'software-delivery.yaml'), 'utf8');
    const workflow = parseWorkflowDefinition(workflowText);
    checks.push({
      id: 'workflow:software-delivery:id',
      status: workflow.id === 'software-delivery' ? 'pass' : 'fail',
      remediation: workflow.id === 'software-delivery' ? '' : 'Set workflow id to software-delivery.'
    });
    checks.push({
      id: 'workflow:software-delivery:steps',
      status: workflow.steps.length >= 3 ? 'pass' : 'fail',
      remediation: workflow.steps.length >= 3 ? '' : 'Define at least three executable workflow steps.'
    });
  } catch (error) {
    checks.push({
      id: 'workflow:software-delivery:parse',
      status: 'fail',
      remediation: `Unable to parse software-delivery workflow: ${error.message}`
    });
  }

  const files = await walk(target);
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8').catch(() => '');
    for (const rule of forbiddenPatterns) {
      if (rule.pattern.test(text)) {
        checks.push({
          id: `public-boundary:${rule.id}`,
          status: 'fail',
          severity: rule.severity,
          file: path.relative(target, file).replaceAll('\\', '/'),
          remediation: 'Remove private paths, secret assignments, internal-only framework names, or product-specific references from public candidate files.'
        });
      }
    }
  }
  return checks;
}

export async function validateTarget(target, options = {}) {
  const absolute = path.resolve(target);
  const workspace = await exists(path.join(absolute, '.midas'));
  const repository = await exists(path.join(absolute, 'package.json')) && await exists(path.join(absolute, 'bin', 'midas.mjs'));
  const checks = [];

  if (workspace) checks.push(...await validateWorkspace(absolute, options));
  if (repository) checks.push(...await validateRepository(absolute));
  if (!workspace && !repository) {
    checks.push({
      id: 'target-kind',
      status: 'fail',
      remediation: 'Target must be a MIDAS repo or a project containing .midas/.'
    });
  }

  const failures = checks.filter((check) => check.status !== 'pass');
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    target: absolute,
    checks,
    failures
  };
}
