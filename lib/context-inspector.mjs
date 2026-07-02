import fs from 'node:fs/promises';
import path from 'node:path';
import { inspectAuthorityContracts } from './authority-contracts.mjs';
import { inspectBenchmarkReceipts } from './benchmark-receipts.mjs';
import { inspectChannelGateways } from './channel-gateways.mjs';
import { inspectAgentProfiles } from './agent-profiles.mjs';
import { adapterFilePath, assertSupportedModules, assertSupportedTools } from './catalog.mjs';
import { inspectEngineeringDiscipline } from './engineering-discipline.mjs';
import { inspectGatewayContracts } from './gateway-contracts.mjs';
import { hashText, loadHarnessInventory } from './harness-inventory.mjs';
import { inspectInterfaceQuality } from './interface-quality.mjs';
import { loadProjectChecks } from './project-checks.mjs';
import { inspectQualityScorecard } from './quality-scorecard.mjs';

export const contextSnapshotSchemaVersion = 'midas.context-snapshot.v1';

const contextBudgets = {
  projectContextChars: 12000,
  adapterChars: 9000
};

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

async function readOptionalText(target, relative) {
  const file = path.join(target, relative);
  const present = await exists(file);
  if (!present) {
    return {
      path: relativePath(relative),
      present: false
    };
  }
  const text = await fs.readFile(file, 'utf8');
  return {
    path: relativePath(relative),
    present: true,
    sha256: hashText(text),
    charCount: text.length,
    lineCount: text.split(/\r?\n/).length,
    text
  };
}

function publicFileRecord(record) {
  const { text, ...publicRecord } = record;
  return publicRecord;
}

function parseYamlListBlock(text, key) {
  const values = [];
  let inBlock = false;
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === `${key}:`) {
      inBlock = true;
      continue;
    }
    if (inBlock && /^\S/.test(line)) break;
    const match = inBlock ? line.match(/^\s*-\s+(.+?)\s*$/) : null;
    if (match) values.push(match[1]);
  }
  return values;
}

function parseMarkdownListAfterHeading(text, heading) {
  const values = [];
  let inBlock = false;
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === `## ${heading}`) {
      inBlock = true;
      continue;
    }
    if (inBlock && line.startsWith('## ')) break;
    const match = inBlock ? line.match(/^\s*-\s+(.+?)\s*$/) : null;
    if (match) values.push(match[1]);
  }
  return values;
}

function compareSets(expected, actual, id, label, failures) {
  const missing = expected.filter((item) => !actual.includes(item));
  const extra = actual.filter((item) => !expected.includes(item));
  if (missing.length > 0 || extra.length > 0) {
    failures.push({
      id,
      status: 'fail',
      remediation: `${label} drift. Missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}.`
    });
  }
}

async function readAdapterRecords(target, tools) {
  const adapters = [];
  for (const tool of tools) {
    const adapterPath = adapterFilePath(tool);
    const record = await readOptionalText(target, adapterPath);
    adapters.push({
      id: tool,
      path: adapterPath,
      present: record.present,
      sha256: record.sha256 ?? null,
      charCount: record.charCount ?? 0,
      lineCount: record.lineCount ?? 0
    });
  }
  return adapters;
}

async function readProjectChecksSummary(target) {
  try {
    const projectChecks = await loadProjectChecks(target);
    return {
      status: 'pass',
      total: projectChecks.checks.length,
      enabled: projectChecks.checks.filter((check) => check.enabled !== false).length
    };
  } catch (error) {
    return {
      status: 'fail',
      error: error.message,
      total: 0,
      enabled: 0
    };
  }
}

async function readHarnessInventorySummary(target) {
  try {
    const inventory = await loadHarnessInventory(target);
    return {
      status: 'pass',
      schemaVersion: inventory.schemaVersion,
      tools: inventory.adapters.map((adapter) => adapter.id)
    };
  } catch (error) {
    return {
      status: 'fail',
      error: error.message,
      tools: []
    };
  }
}

async function readChannelGatewaysSummary(target) {
  try {
    const inspection = await inspectChannelGateways(target);
    return {
      status: inspection.status,
      schemaVersion: inspection.schemaVersion,
      gateways: inspection.gateways.map((gateway) => gateway.id),
      failures: inspection.failures
    };
  } catch (error) {
    return {
      status: 'fail',
      error: error.message,
      gateways: [],
      failures: []
    };
  }
}

async function readGatewayContractsSummary(target) {
  try {
    const inspection = await inspectGatewayContracts(target);
    return {
      status: inspection.status,
      schemaVersion: inspection.schemaVersion,
      gateways: inspection.gateways.map((gateway) => gateway.id),
      failures: inspection.failures
    };
  } catch (error) {
    return {
      status: 'fail',
      error: error.message,
      gateways: [],
      failures: []
    };
  }
}

async function readAuthoritySummary(target) {
  try {
    const inspection = await inspectAuthorityContracts(target);
    return {
      status: inspection.status,
      schemaVersion: inspection.schemaVersion,
      authorityOrder: inspection.authorityOrder,
      protectedInvariants: inspection.protectedInvariants.map((invariant) => invariant.id),
      escalationRules: inspection.escalationRules.map((rule) => rule.id),
      claimCeilings: inspection.claimCeilings,
      failures: inspection.failures
    };
  } catch (error) {
    return {
      status: 'fail',
      error: error.message,
      authorityOrder: [],
      protectedInvariants: [],
      escalationRules: [],
      claimCeilings: [],
      failures: []
    };
  }
}

async function readBenchmarkReceiptsSummary(target) {
  try {
    const inspection = await inspectBenchmarkReceipts(target);
    return {
      status: inspection.status,
      schemaVersion: inspection.schemaVersion,
      receiptCount: inspection.receipts.length,
      claimCeilings: inspection.policy?.claimCeilings ?? [],
      failures: inspection.failures
    };
  } catch (error) {
    return {
      status: 'fail',
      error: error.message,
      receiptCount: 0,
      claimCeilings: [],
      failures: []
    };
  }
}

async function readInterfaceQualitySummary(target) {
  try {
    const inspection = await inspectInterfaceQuality(target);
    return {
      status: inspection.status,
      schemaVersion: inspection.schemaVersion,
      surfaces: inspection.surfaces.map((surface) => surface.id),
      requiredEvidence: inspection.policy?.requiredEvidence ?? [],
      failures: inspection.failures
    };
  } catch (error) {
    return {
      status: 'fail',
      error: error.message,
      surfaces: [],
      requiredEvidence: [],
      failures: []
    };
  }
}

async function readEngineeringDisciplineSummary(target) {
  try {
    const inspection = await inspectEngineeringDiscipline(target);
    return {
      status: inspection.status,
      schemaVersion: inspection.schemaVersion,
      strictness: inspection.strictness,
      rules: inspection.rules.map((rule) => rule.id),
      failures: inspection.failures
    };
  } catch (error) {
    return {
      status: 'fail',
      error: error.message,
      strictness: null,
      rules: [],
      failures: []
    };
  }
}

async function readQualityScorecardSummary(target) {
  try {
    const inspection = await inspectQualityScorecard(target);
    return {
      status: inspection.status,
      schemaVersion: inspection.schemaVersion,
      score: inspection.score,
      components: inspection.components.map((component) => component.id),
      warnings: inspection.warnings,
      failures: inspection.failures
    };
  } catch (error) {
    return {
      status: 'fail',
      error: error.message,
      score: 0,
      components: [],
      warnings: [],
      failures: []
    };
  }
}

export async function buildContextSnapshot(directory) {
  const target = path.resolve(directory);
  const manifestFile = await readOptionalText(target, '.midas/_config/manifest.yaml');
  const projectContextFile = await readOptionalText(target, '.midas/project-context.md');
  const sprintStatusFile = await readOptionalText(target, '.midas/sprint-status.yaml');
  const checksFile = await readOptionalText(target, '.midas/checks.json');
  const agentProfilesFile = await readOptionalText(target, '.midas/agent-profiles.json');
  const authorityFile = await readOptionalText(target, '.midas/authority/constitution.json');
  const benchmarkReceiptsFile = await readOptionalText(target, '.midas/benchmarks/receipts.json');
  const channelGatewaysFile = await readOptionalText(target, '.midas/channels/gateways.json');
  const engineeringDisciplineFile = await readOptionalText(target, '.midas/engineering/discipline.json');
  const interfaceQualityFile = await readOptionalText(target, '.midas/interface/quality.json');
  const qualityScorecardFile = await readOptionalText(target, '.midas/quality/scorecard.json');
  const gatewayContractsFile = await readOptionalText(target, '.midas/gateways/contracts.json');
  const harnessInventoryFile = await readOptionalText(target, '.midas/harness-inventory.json');

  const modules = manifestFile.present ? parseYamlListBlock(manifestFile.text, 'modules') : [];
  const tools = manifestFile.present ? parseYamlListBlock(manifestFile.text, 'tools') : [];
  const contextModules = projectContextFile.present
    ? parseMarkdownListAfterHeading(projectContextFile.text, 'Active Modules')
    : [];
  const contextTools = projectContextFile.present
    ? parseMarkdownListAfterHeading(projectContextFile.text, 'Harness Targets')
    : [];

  return {
    schemaVersion: contextSnapshotSchemaVersion,
    generatedBy: 'midas context',
    files: {
      manifest: publicFileRecord(manifestFile),
      projectContext: publicFileRecord(projectContextFile),
      sprintStatus: publicFileRecord(sprintStatusFile),
      checks: publicFileRecord(checksFile),
      agentProfiles: publicFileRecord(agentProfilesFile),
      authority: publicFileRecord(authorityFile),
      benchmarkReceipts: publicFileRecord(benchmarkReceiptsFile),
      channelGateways: publicFileRecord(channelGatewaysFile),
      engineeringDiscipline: publicFileRecord(engineeringDisciplineFile),
      interfaceQuality: publicFileRecord(interfaceQualityFile),
      qualityScorecard: publicFileRecord(qualityScorecardFile),
      gatewayContracts: publicFileRecord(gatewayContractsFile),
      harnessInventory: publicFileRecord(harnessInventoryFile)
    },
    manifest: {
      modules,
      tools
    },
    projectContext: {
      modules: contextModules,
      tools: contextTools,
      charCount: projectContextFile.charCount ?? 0,
      lineCount: projectContextFile.lineCount ?? 0
    },
    checks: await readProjectChecksSummary(target),
    agentProfiles: await inspectAgentProfiles(target),
    authority: await readAuthoritySummary(target),
    benchmarkReceipts: await readBenchmarkReceiptsSummary(target),
    channelGateways: await readChannelGatewaysSummary(target),
    engineeringDiscipline: await readEngineeringDisciplineSummary(target),
    interfaceQuality: await readInterfaceQualitySummary(target),
    qualityScorecard: await readQualityScorecardSummary(target),
    gatewayContracts: await readGatewayContractsSummary(target),
    harnessInventory: await readHarnessInventorySummary(target),
    adapters: await readAdapterRecords(target, tools)
  };
}

export function validateContextSnapshotShape(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('Context snapshot must be an object.');
  }
  if (snapshot.schemaVersion !== contextSnapshotSchemaVersion) {
    throw new Error(`Context snapshot schemaVersion must be ${contextSnapshotSchemaVersion}.`);
  }
  if (!snapshot.manifest || !Array.isArray(snapshot.manifest.modules) || !Array.isArray(snapshot.manifest.tools)) {
    throw new Error('Context snapshot manifest must include modules and tools arrays.');
  }
  assertSupportedModules(snapshot.manifest.modules);
  assertSupportedTools(snapshot.manifest.tools);
  if (!snapshot.projectContext || !Array.isArray(snapshot.projectContext.modules) || !Array.isArray(snapshot.projectContext.tools)) {
    throw new Error('Context snapshot projectContext must include modules and tools arrays.');
  }
  if (!Array.isArray(snapshot.adapters)) {
    throw new Error('Context snapshot adapters must be an array.');
  }
  if (!snapshot.agentProfiles || !Array.isArray(snapshot.agentProfiles.profiles)) {
    throw new Error('Context snapshot agentProfiles must include profiles array.');
  }
  if (!snapshot.authority || !Array.isArray(snapshot.authority.authorityOrder)) {
    throw new Error('Context snapshot authority must include authorityOrder array.');
  }
  if (!snapshot.benchmarkReceipts || !Array.isArray(snapshot.benchmarkReceipts.claimCeilings)) {
    throw new Error('Context snapshot benchmarkReceipts must include claimCeilings array.');
  }
  if (!snapshot.channelGateways || !Array.isArray(snapshot.channelGateways.gateways)) {
    throw new Error('Context snapshot channelGateways must include gateways array.');
  }
  if (!snapshot.engineeringDiscipline || !Array.isArray(snapshot.engineeringDiscipline.rules)) {
    throw new Error('Context snapshot engineeringDiscipline must include rules array.');
  }
  if (!snapshot.interfaceQuality || !Array.isArray(snapshot.interfaceQuality.surfaces) || !Array.isArray(snapshot.interfaceQuality.requiredEvidence)) {
    throw new Error('Context snapshot interfaceQuality must include surfaces and requiredEvidence arrays.');
  }
  if (!snapshot.qualityScorecard || !Array.isArray(snapshot.qualityScorecard.components) || !Number.isFinite(snapshot.qualityScorecard.score)) {
    throw new Error('Context snapshot qualityScorecard must include components array and numeric score.');
  }
  if (!snapshot.gatewayContracts || !Array.isArray(snapshot.gatewayContracts.gateways)) {
    throw new Error('Context snapshot gatewayContracts must include gateways array.');
  }
  for (const adapter of snapshot.adapters) {
    if (typeof adapter.id !== 'string' || adapter.id.trim() === '') {
      throw new Error('Context snapshot adapter id must be a non-empty string.');
    }
    if (adapter.path !== adapterFilePath(adapter.id)) {
      throw new Error(`Context snapshot adapter path for ${adapter.id} must be ${adapterFilePath(adapter.id)}.`);
    }
    if (adapter.sha256 !== null && !/^sha256:[a-f0-9]{64}$/.test(adapter.sha256)) {
      throw new Error(`Context snapshot adapter sha256 for ${adapter.id} must be a sha256 digest or null.`);
    }
  }
  return snapshot;
}

async function loadContextSnapshot(directory) {
  const target = path.resolve(directory);
  const file = path.join(target, '.midas', 'context-snapshot.json');
  const snapshot = JSON.parse(await fs.readFile(file, 'utf8'));
  return validateContextSnapshotShape(snapshot);
}

function compareSnapshotFiles(current, previous, warnings) {
  const fields = ['manifest', 'projectContext', 'sprintStatus', 'checks', 'agentProfiles', 'authority', 'benchmarkReceipts', 'channelGateways', 'engineeringDiscipline', 'interfaceQuality', 'qualityScorecard', 'gatewayContracts', 'harnessInventory'];
  const changed = [];
  for (const field of fields) {
    const currentHash = current.files[field]?.sha256 ?? null;
    const previousHash = previous.files[field]?.sha256 ?? null;
    if (currentHash !== previousHash) changed.push(current.files[field]?.path ?? field);
  }
  const currentAdapters = new Map(current.adapters.map((adapter) => [adapter.id, adapter]));
  const previousAdapters = new Map(previous.adapters.map((adapter) => [adapter.id, adapter]));
  for (const [id, adapter] of currentAdapters) {
    const previousAdapter = previousAdapters.get(id);
    if (!previousAdapter || previousAdapter.sha256 !== adapter.sha256 || previousAdapter.present !== adapter.present) {
      changed.push(adapter.path);
    }
  }
  for (const id of previousAdapters.keys()) {
    if (!currentAdapters.has(id)) changed.push(previousAdapters.get(id).path);
  }
  if (changed.length > 0) {
    warnings.push({
      id: 'context-snapshot:stale',
      status: 'warn',
      remediation: `Refresh .midas/context-snapshot.json with midas context --write. Changed: ${changed.join(', ')}.`
    });
  }
}

export function evaluateContextSnapshot(current, previous = null) {
  validateContextSnapshotShape(current);
  const failures = [];
  const warnings = [];

  if (!current.files.manifest.present) {
    failures.push({
      id: 'context:manifest',
      status: 'fail',
      remediation: 'Run midas install or midas update to create .midas/_config/manifest.yaml.'
    });
  }
  if (!current.files.projectContext.present) {
    failures.push({
      id: 'context:project-context',
      status: 'fail',
      remediation: 'Run midas install or midas update to create .midas/project-context.md.'
    });
  }
  if (current.checks.status !== 'pass') {
    failures.push({
      id: 'context:checks-config',
      status: 'fail',
      remediation: `Fix .midas/checks.json: ${current.checks.error}`
    });
  }
  if (current.agentProfiles.status !== 'pass') {
    failures.push({
      id: 'context:agent-profiles',
      status: 'fail',
      remediation: 'Fix .midas/agent-profiles.json or regenerate with midas update.'
    });
  }
  if (current.authority.status !== 'pass') {
    failures.push({
      id: 'context:authority',
      status: 'fail',
      remediation: 'Fix .midas/authority/constitution.json or regenerate with midas update.'
    });
  }
  if (current.benchmarkReceipts.status !== 'pass') {
    failures.push({
      id: 'context:benchmark-receipts',
      status: 'fail',
      remediation: 'Fix .midas/benchmarks/receipts.json or regenerate with midas update.'
    });
  }
  if (current.channelGateways.status !== 'pass') {
    failures.push({
      id: 'context:channel-gateways',
      status: 'fail',
      remediation: 'Fix .midas/channels/gateways.json or regenerate with midas update.'
    });
  }
  if (current.engineeringDiscipline.status !== 'pass') {
    failures.push({
      id: 'context:engineering-discipline',
      status: 'fail',
      remediation: 'Fix .midas/engineering/discipline.json or regenerate with midas update.'
    });
  }
  if (current.interfaceQuality.status !== 'pass') {
    failures.push({
      id: 'context:interface-quality',
      status: 'fail',
      remediation: 'Fix .midas/interface/quality.json or regenerate with midas update.'
    });
  }
  if (current.qualityScorecard.status !== 'pass') {
    failures.push({
      id: 'context:quality-scorecard',
      status: 'fail',
      remediation: 'Fix .midas/quality/scorecard.json or regenerate with midas update.'
    });
  }
  if (current.gatewayContracts.status !== 'pass') {
    failures.push({
      id: 'context:gateway-contracts',
      status: 'fail',
      remediation: 'Fix .midas/gateways/contracts.json or regenerate with midas update.'
    });
  }
  if (current.harnessInventory.status !== 'pass') {
    failures.push({
      id: 'context:harness-inventory',
      status: 'fail',
      remediation: `Fix .midas/harness-inventory.json: ${current.harnessInventory.error}`
    });
  }

  compareSets(current.manifest.modules, current.projectContext.modules, 'context:modules-match', 'Project context module list', failures);
  compareSets(current.manifest.tools, current.projectContext.tools, 'context:tools-match', 'Project context harness target list', failures);
  compareSets(current.manifest.tools, current.harnessInventory.tools, 'context:harness-inventory-tools-match', 'Harness inventory tool list', failures);

  if ((current.files.projectContext.charCount ?? 0) > contextBudgets.projectContextChars) {
    warnings.push({
      id: 'context-budget:project-context',
      status: 'warn',
      remediation: `.midas/project-context.md is ${current.files.projectContext.charCount} chars; keep it under ${contextBudgets.projectContextChars} chars or split supporting detail into docs.`
    });
  }
  for (const adapter of current.adapters) {
    if (!adapter.present) continue;
    if (adapter.charCount > contextBudgets.adapterChars) {
      warnings.push({
        id: `context-budget:adapter:${adapter.id}`,
        status: 'warn',
        remediation: `${adapter.path} is ${adapter.charCount} chars; keep adapter guidance under ${contextBudgets.adapterChars} chars.`
      });
    }
  }

  if (previous) {
    compareSnapshotFiles(current, previous, warnings);
  } else {
    warnings.push({
      id: 'context-snapshot:missing',
      status: 'warn',
      remediation: 'Create .midas/context-snapshot.json with midas context --write.'
    });
  }

  return {
    status: failures.length > 0 ? 'fail' : warnings.length > 0 ? 'warn' : 'pass',
    schemaVersion: current.schemaVersion,
    manifest: current.manifest,
    projectContext: current.projectContext,
    checks: current.checks,
    agentProfiles: current.agentProfiles,
    authority: current.authority,
    benchmarkReceipts: current.benchmarkReceipts,
    channelGateways: current.channelGateways,
    engineeringDiscipline: current.engineeringDiscipline,
    interfaceQuality: current.interfaceQuality,
    qualityScorecard: current.qualityScorecard,
    gatewayContracts: current.gatewayContracts,
    harnessInventory: current.harnessInventory,
    adapters: current.adapters,
    budgets: contextBudgets,
    warnings,
    failures
  };
}

export async function inspectProjectContext(directory) {
  const current = await buildContextSnapshot(directory);
  let previous = null;
  try {
    previous = await loadContextSnapshot(directory);
  } catch {
    previous = null;
  }
  const result = evaluateContextSnapshot(current, previous);
  return {
    target: path.resolve(directory),
    ...result
  };
}

export async function writeContextSnapshot({ directory }) {
  const target = path.resolve(directory);
  const snapshot = await buildContextSnapshot(target);
  validateContextSnapshotShape(snapshot);
  const file = path.join(target, '.midas', 'context-snapshot.json');
  await fs.writeFile(file, `${JSON.stringify(snapshot, null, 2)}\n`);
  return {
    status: 'written',
    file: relativePath(path.relative(target, file)),
    snapshot
  };
}
