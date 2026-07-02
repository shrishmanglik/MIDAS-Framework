import fs from 'node:fs/promises';
import path from 'node:path';

function safeSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'work-order';
}

export async function recommendNextAction(directory = '.') {
  const target = path.resolve(directory);
  const statusPath = path.join(target, '.midas', 'sprint-status.yaml');
  try {
    const text = await fs.readFile(statusPath, 'utf8');
    const nextLine = text.split(/\r?\n/).find((line) => line.startsWith('next_action:'));
    return {
      status: 'ready',
      target,
      nextAction: nextLine ? nextLine.replace('next_action:', '').trim() : 'create or select one MIDAS work order',
      depthBand: text.includes('strategic-system') ? 'strategic-system' : 'quick-fix'
    };
  } catch {
    return {
      status: 'missing_workspace',
      target,
      nextAction: 'run midas install before asking for the next action',
      depthBand: 'setup'
    };
  }
}

export async function createQuickWorkOrder({ directory = '.', intent }) {
  const target = path.resolve(directory);
  const workorderDir = path.join(target, '.midas', 'workorders');
  await fs.mkdir(workorderDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const slug = safeSlug(intent);
  const file = path.join(workorderDir, `${stamp}-${slug}.md`);
  const body = `# MIDAS Quick Work Order

Status: ready
Depth band: quick-fix

## Objective

${intent}

## Constraints

- Keep scope narrow.
- Do not read secrets or .env values.
- Do not take destructive, money-moving, public, or production actions without explicit approval.

## Done Criteria

- Change or analysis is complete.
- Evidence is recorded.
- Next action is clear.
`;
  await fs.writeFile(file, body);
  return {
    status: 'created',
    file: path.relative(target, file).replaceAll('\\', '/')
  };
}
