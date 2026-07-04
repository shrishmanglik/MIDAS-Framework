export const supportedTools = [
  'codex',
  'claude-code',
  'cursor',
  'opencode',
  'gemini',
  'copilot'
];

const toolDirectories = {
  codex: '.codex/skills/midas',
  'claude-code': '.claude/skills/midas',
  cursor: '.cursor/rules/midas',
  opencode: '.opencode/midas',
  gemini: '.gemini/midas',
  copilot: '.github/copilot/midas'
};

export function toolDirectory(tool) {
  return toolDirectories[tool];
}

export function adapterFilePath(tool) {
  const directory = toolDirectory(tool);
  if (!directory) return undefined;
  return `${directory}/MIDAS.md`;
}

export const supportedModules = [
  {
    id: 'core',
    name: 'MIDAS Core',
    summary: 'Configuration, manifest, public-boundary checks, next-action routing, and project execution discipline.'
  },
  {
    id: 'software-dev',
    name: 'Software Development',
    summary: 'Brief, PRD, architecture, ADR, story, implementation, review, and retrospective workflows.'
  },
  {
    id: 'agentic-agile',
    name: 'Agentic Agile',
    summary: 'Local planning, UX spine, verification-gap, docs-staleness, and direct agent handoff gates.'
  },
  {
    id: 'builder',
    name: 'Builder Strategy',
    summary: 'Product/business strategy, positioning, launch readiness, and operator decision artifacts.'
  },
  {
    id: 'qa',
    name: 'Quality Assurance',
    summary: 'Fast QA plus launch/risk QA for security, payments, auth, data, regulated claims, and releases.'
  },
  {
    id: 'operator-runtime',
    name: 'Operator Runtime',
    summary: 'Supervised long-running run control, permission boundaries, ledgers, and recovery notes.'
  }
];

export function normalizeList(value, defaults) {
  if (!value) return defaults;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function assertSupportedModules(modules) {
  const known = new Set(supportedModules.map((module) => module.id));
  const unknown = modules.filter((module) => !known.has(module));
  if (unknown.length > 0) {
    throw new Error(`Unknown module(s): ${unknown.join(', ')}`);
  }
}

export function assertSupportedTools(tools) {
  const known = new Set(supportedTools);
  const unknown = tools.filter((tool) => !known.has(tool));
  if (unknown.length > 0) {
    throw new Error(`Unknown tool(s): ${unknown.join(', ')}`);
  }
}
