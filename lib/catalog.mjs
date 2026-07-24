export const supportedTools = [
  'codex',
  'claude-code',
  'cursor',
  'opencode',
  'gemini',
  'copilot'
];

// Adapter paths must match what each runtime actually loads. A file the tool never
// reads is inert no matter how correct its contents are.
//
//   claude-code  Claude Code discovers skills at .claude/skills/<name>/SKILL.md and
//                requires YAML frontmatter with `name` and `description`.
//   codex        Codex reads AGENTS.md at the project root. That file is shared with
//                the project, so MIDAS writes a delimited block into it rather than
//                owning the whole file (mode: 'merge').
//
// The remaining three paths are MIDAS-owned conventions and are NOT verified against
// those runtimes' current loaders. Treat them as unverified until someone confirms
// them against a real cursor / gemini / copilot install.
const toolAdapters = {
  codex: { path: 'AGENTS.md', mode: 'merge', verified: true },
  'claude-code': { path: '.claude/skills/midas/SKILL.md', mode: 'own', verified: true },
  cursor: { path: '.cursor/rules/midas/MIDAS.md', mode: 'own', verified: false },
  opencode: { path: '.opencode/midas/MIDAS.md', mode: 'own', verified: false },
  gemini: { path: '.gemini/midas/MIDAS.md', mode: 'own', verified: false },
  copilot: { path: '.github/copilot/midas/MIDAS.md', mode: 'own', verified: false }
};

export function adapterFilePath(tool) {
  return toolAdapters[tool]?.path;
}

export function adapterMode(tool) {
  return toolAdapters[tool]?.mode;
}

export function adapterLoaderVerified(tool) {
  return toolAdapters[tool]?.verified === true;
}

export function toolDirectory(tool) {
  const file = adapterFilePath(tool);
  if (!file) return undefined;
  const index = file.lastIndexOf('/');
  return index === -1 ? '.' : file.slice(0, index);
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
