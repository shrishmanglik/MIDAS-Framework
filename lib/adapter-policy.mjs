import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultPolicyPath = path.join(packageRoot, 'framework', 'adapters', 'default-permission-policy.json');

function listMarkdown(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function assertStringList(policy, key) {
  if (!Array.isArray(policy[key]) || policy[key].some((value) => typeof value !== 'string' || value.trim() === '')) {
    throw new Error(`Adapter permission policy field ${key} must be a non-empty string list.`);
  }
}

export function validateAdapterPolicy(policy) {
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) {
    throw new Error('Adapter permission policy must be an object.');
  }
  for (const key of ['version', 'default_mode']) {
    if (typeof policy[key] !== 'string' || policy[key].trim() === '') {
      throw new Error(`Adapter permission policy field ${key} must be a non-empty string.`);
    }
  }
  for (const key of ['approval_required_for', 'protected_content', 'evidence_required']) {
    assertStringList(policy, key);
  }
  if (policy.adapter_rules !== undefined) assertStringList(policy, 'adapter_rules');
  return policy;
}

export async function loadAdapterPolicy(options = {}) {
  const root = path.resolve(options.root ?? packageRoot);
  const file = options.file
    ? path.resolve(options.file)
    : path.join(root, 'framework', 'adapters', 'default-permission-policy.json');
  const text = await fs.readFile(file, 'utf8').catch(async (error) => {
    if (file !== defaultPolicyPath) throw error;
    return fs.readFile(defaultPolicyPath, 'utf8');
  });
  return validateAdapterPolicy(JSON.parse(text));
}

export function renderAdapterPolicy(policy) {
  validateAdapterPolicy(policy);
  const adapterRules = policy.adapter_rules?.length
    ? `\n## Operating Rules\n\n${listMarkdown(policy.adapter_rules)}\n`
    : '';

  return `## Permission Policy

Default mode: ${policy.default_mode}

### Approval Required For

${listMarkdown(policy.approval_required_for)}

### Protected Content

${listMarkdown(policy.protected_content)}

### Evidence Required

${listMarkdown(policy.evidence_required)}
${adapterRules}`;
}
