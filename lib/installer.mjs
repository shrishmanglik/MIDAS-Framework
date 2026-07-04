import fs from 'node:fs/promises';
import path from 'node:path';
import { loadAgentProfiles, renderAgentProfiles, writeAgentProfiles } from './agent-profiles.mjs';
import { loadAdapterPolicy, renderAdapterPolicy } from './adapter-policy.mjs';
import { copyDefaultAuthorityContracts } from './authority-contracts.mjs';
import { copyDefaultBenchmarkReceipts } from './benchmark-receipts.mjs';
import {
  assertSupportedModules,
  assertSupportedTools,
  toolDirectory,
  normalizeList,
  supportedModules,
  supportedTools
} from './catalog.mjs';
import { copyDefaultChannelGateways } from './channel-gateways.mjs';
import { writeContextSnapshot } from './context-inspector.mjs';
import { copyDefaultEngineeringDiscipline } from './engineering-discipline.mjs';
import { copyDefaultFlowComponents } from './flow-components.mjs';
import { copyDefaultGatewayContracts } from './gateway-contracts.mjs';
import { writeHarnessInventory } from './harness-inventory.mjs';
import { copyDefaultInterfaceQuality } from './interface-quality.mjs';
import { copyDefaultKnowledgePacks } from './knowledge-packs.mjs';
import { copyDefaultQualityScorecard } from './quality-scorecard.mjs';
import { copyDefaultRunControls } from './run-controls.mjs';
import { copyDefaultSkills } from './skill-library.mjs';

function yamlList(values, indent = 2) {
  const pad = ' '.repeat(indent);
  return values.map((value) => `${pad}- ${value}`).join('\n');
}

function adapterText(tool, modules, policy, agentProfiles) {
  return `# MIDAS ${tool} Adapter

Status: generated
Role: use MIDAS as the project harness, not as a replacement for human approval.

## Load Order

1. Read .midas/project-context.md.
2. Read .midas/_config/manifest.yaml.
3. Check .midas/sprint-status.yaml.
4. Pick one work order or create one with midas quick.

## Active Modules

${modules.map((module) => `- ${module}`).join('\n')}

${renderAgentProfiles(agentProfiles)}

${renderAdapterPolicy(policy)}
`;
}

function projectContext(modules, tools, agentProfiles) {
  return `# MIDAS Project Context

Status: generated

## Purpose

This project uses MIDAS to coordinate agentic software work through explicit context, work orders, validation, and retrospectives.

## Active Modules

${modules.map((module) => `- ${module}`).join('\n')}

## Harness Targets

${tools.map((tool) => `- ${tool}`).join('\n')}

## Agent Profiles

${agentProfiles.profiles.map((profile) => `- ${profile.id}: ${profile.description}`).join('\n')}

## Current Rules

- Use quick work orders for isolated low-risk changes.
- Use deeper planning for architecture, auth, payment, data, security, regulated claims, releases, and public commitments.
- Keep generated harness files subordinate to source code and human-reviewed project state.
- Record decisions that affect multiple files, agents, modules, public claims, or user-facing behavior.
- Use authority contracts to resolve instruction conflicts, preserve protected invariants, and keep claims evidence-bound.
- Use benchmark receipts before recording or repeating benchmark, leaderboard, model-comparison, or release-readiness claims.
- Use run-control profiles for long-running, delegated, external-facing, or approval-sensitive work.
- Use gateway contracts before exposing a control plane through CLI, web, socket, webhook, or messaging surfaces.
- Use channel gateway contracts before exposing agents through web, chat, scheduler, API, or file-transfer surfaces.
- Use interface-quality contracts before making release, publication, or product-readiness claims about UI-facing surfaces.
- Use quality scorecards before making distribution, package, public-release, or component-quality claims.
- Use engineering discipline before broad edits, refactors, bug fixes, release work, or completion claims.

## Validation

Run:

\`\`\`bash
midas validate .
\`\`\`
`;
}

function sprintStatus() {
  return `# MIDAS Sprint Status

status: active
current_objective: establish project context
current_depth_band: strategic-system
next_action: review the project context and create the first work order
blocked: false
`;
}

function checksConfig() {
  return JSON.stringify({
    version: '0.1',
    checks: [
      {
        id: 'project-tests',
        command: 'node',
        args: ['--test'],
        cwd: '.',
        enabled: false,
        timeoutMs: 120000
      }
    ]
  }, null, 2) + '\n';
}

function manifest(directory, modules, tools) {
  const createdAt = new Date().toISOString();
  return `name: midas-workspace
created_at: ${createdAt}
directory: ${directory.replaceAll('\\', '/')}
channel: alpha
modules:
${yamlList(modules)}
tools:
${yamlList(tools)}
source:
  package: '@midas-framework/alpha'
  generated_by: midas install
policy:
  no_secret_read: true
  no_external_action_without_approval: true
  generated_files_are_not_source_of_truth: true
`;
}

export async function installWorkspace(options) {
  const target = path.resolve(options.directory ?? '.');
  const modules = normalizeList(options.modules, supportedModules.map((module) => module.id));
  const tools = normalizeList(options.tools, supportedTools);
  assertSupportedModules(modules);
  assertSupportedTools(tools);
  const policy = await loadAdapterPolicy();
  const agentProfiles = await loadAgentProfiles();

  const midasDir = path.join(target, '.midas');
  await fs.mkdir(path.join(midasDir, '_config'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'authority'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'benchmarks'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'channels'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'engineering'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'flows'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'gateways'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'interface'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'knowledge'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'planning'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'quality'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'reports'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'run-control'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'run-ledger'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'runtime', 'runs'), { recursive: true });
  await fs.mkdir(path.join(midasDir, 'workorders'), { recursive: true });

  await fs.writeFile(path.join(midasDir, '_config', 'manifest.yaml'), manifest(target, modules, tools));
  await fs.writeFile(path.join(midasDir, 'project-context.md'), projectContext(modules, tools, agentProfiles));
  await fs.writeFile(path.join(midasDir, 'sprint-status.yaml'), sprintStatus());
  await fs.writeFile(path.join(midasDir, 'checks.json'), checksConfig());
  await fs.writeFile(path.join(midasDir, 'run-ledger', 'README.md'), '# MIDAS Run Ledger\n\nRecord meaningful runs here.\n');
  const profileWrite = await writeAgentProfiles({ directory: target, profiles: agentProfiles });
  const skillFiles = await copyDefaultSkills({ directory: target });
  const authorityFile = await copyDefaultAuthorityContracts({ directory: target });
  const benchmarkReceiptsFile = await copyDefaultBenchmarkReceipts({ directory: target });
  const engineeringDisciplineFile = await copyDefaultEngineeringDiscipline({ directory: target });
  const flowComponentsFile = await copyDefaultFlowComponents({ directory: target });
  const gatewayContractsFile = await copyDefaultGatewayContracts({ directory: target });
  const interfaceQualityFile = await copyDefaultInterfaceQuality({ directory: target });
  const knowledgePacksFile = await copyDefaultKnowledgePacks({ directory: target });
  const qualityScorecardFile = await copyDefaultQualityScorecard({ directory: target });
  const runControlsFile = await copyDefaultRunControls({ directory: target });
  const channelGatewaysFile = await copyDefaultChannelGateways({ directory: target });

  const generated = [
    path.join(midasDir, '_config', 'manifest.yaml'),
    path.join(midasDir, 'project-context.md'),
    path.join(midasDir, 'sprint-status.yaml'),
    path.join(midasDir, 'checks.json'),
    path.join(midasDir, 'planning'),
    path.join(midasDir, 'reports'),
    path.join(target, profileWrite.file),
    path.join(target, authorityFile),
    path.join(target, benchmarkReceiptsFile),
    path.join(target, engineeringDisciplineFile),
    path.join(target, flowComponentsFile),
    path.join(target, gatewayContractsFile),
    path.join(target, interfaceQualityFile),
    path.join(target, knowledgePacksFile),
    path.join(target, qualityScorecardFile),
    path.join(target, runControlsFile),
    path.join(target, channelGatewaysFile),
    ...skillFiles.map((file) => path.join(target, file))
  ];

  for (const tool of tools) {
    const relative = toolDirectory(tool);
    const adapterDir = path.join(target, relative);
    await fs.mkdir(adapterDir, { recursive: true });
    const file = path.join(adapterDir, 'MIDAS.md');
    await fs.writeFile(file, adapterText(tool, modules, policy, agentProfiles));
    generated.push(file);
  }

  const inventory = await writeHarnessInventory({
    directory: target,
    modules,
    tools,
    policyVersion: policy.version
  });
  generated.push(path.join(target, inventory.file));

  const contextSnapshot = await writeContextSnapshot({ directory: target });
  generated.push(path.join(target, contextSnapshot.file));

  return {
    status: 'installed',
    target,
    modules,
    tools,
    generated: generated.map((file) => path.relative(target, file).replaceAll('\\', '/'))
  };
}
