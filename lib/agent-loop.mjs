import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { addMemory, searchMemories } from './memory-vault.mjs';
import { runProjectChecks } from './project-checks.mjs';
import { validateTarget } from './validator.mjs';
import { fetchWeb } from './web-access.mjs';

const MAX_FILE_BYTES = 200_000;
const MAX_STEPS_CEILING = 50;
const BLOCKED_READ_PATTERNS = [/\.env(\.|$)/i, /(^|[\\/])secrets?([\\/]|$)/i, /\.pem$/i, /\.key$/i, /id_rsa/i, /credentials/i];

function containedPath(root, value) {
  const resolved = path.resolve(root, value ?? '.');
  const relative = path.relative(root, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Agent file paths must stay inside the target directory.');
  }
  return resolved;
}

function assertReadable(relativePath) {
  if (BLOCKED_READ_PATTERNS.some((pattern) => pattern.test(relativePath))) {
    throw new Error(`Refusing to touch protected path: ${relativePath}`);
  }
}

export function agentToolDefinitions({ allowWrites, allowWeb }) {
  const tools = [
    {
      name: 'list_files',
      description: 'List files under a directory inside the project (bounded, skips node_modules/.git).',
      input_schema: { type: 'object', properties: { path: { type: 'string' } }, required: [] }
    },
    {
      name: 'read_file',
      description: 'Read one text file inside the project. Secrets and env files are blocked.',
      input_schema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] }
    },
    {
      name: 'memory_search',
      description: 'Search the .midas/memory vault for durable project knowledge.',
      input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }
    },
    {
      name: 'memory_add',
      description: 'Save a durable memory entry (name, description, body).',
      input_schema: {
        type: 'object',
        properties: { name: { type: 'string' }, description: { type: 'string' }, body: { type: 'string' }, type: { type: 'string' } },
        required: ['description']
      }
    },
    {
      name: 'run_checks',
      description: 'Run the project-declared checks from .midas/checks.json (no arbitrary shell).',
      input_schema: { type: 'object', properties: {}, required: [] }
    },
    {
      name: 'midas_validate',
      description: 'Validate the workspace and public boundary.',
      input_schema: { type: 'object', properties: {}, required: [] }
    },
    {
      name: 'finish',
      description: 'End the run with a summary, evidence statements, and a next action.',
      input_schema: {
        type: 'object',
        properties: { summary: { type: 'string' }, evidence: { type: 'string' }, nextAction: { type: 'string' } },
        required: ['summary']
      }
    }
  ];
  if (allowWrites) {
    tools.push({
      name: 'write_file',
      description: 'Write one text file inside the project. Only available because --allow-writes was set.',
      input_schema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] }
    });
  }
  if (allowWeb) {
    tools.push({
      name: 'web_fetch',
      description: 'Fetch a public http(s) URL and return extracted text with an evidence receipt.',
      input_schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] }
    });
  }
  return tools;
}

async function listFilesBounded(root, subPath) {
  const start = containedPath(root, subPath);
  const results = [];
  const stack = [start];
  while (stack.length && results.length < 200) {
    const current = stack.pop();
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (['node_modules', '.git', '.venv'].includes(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else results.push(path.relative(root, full).replaceAll('\\', '/'));
      if (results.length >= 200) break;
    }
  }
  return results.sort();
}

export async function executeAgentTool(tool, input, context) {
  const { directory, allowWrites, allowWeb } = context;
  const root = path.resolve(directory);
  switch (tool) {
    case 'list_files':
      return { files: await listFilesBounded(root, input.path ?? '.') };
    case 'read_file': {
      assertReadable(input.path ?? '');
      const file = containedPath(root, input.path);
      const stat = await fs.stat(file);
      if (stat.size > MAX_FILE_BYTES) return { error: `File exceeds ${MAX_FILE_BYTES} bytes; read a narrower file.` };
      return { path: input.path, content: await fs.readFile(file, 'utf8') };
    }
    case 'write_file': {
      if (!allowWrites) throw new Error('write_file requires --allow-writes.');
      assertReadable(input.path ?? '');
      const file = containedPath(root, input.path);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, String(input.content ?? ''));
      return { status: 'written', path: input.path, bytes: Buffer.byteLength(String(input.content ?? ''), 'utf8') };
    }
    case 'web_fetch': {
      if (!allowWeb) throw new Error('web_fetch is disabled for this run (use --allow-web).');
      const receipt = await fetchWeb({ directory, url: input.url, save: true });
      return { url: receipt.url, httpStatus: receipt.httpStatus, title: receipt.title, text: receipt.text.slice(0, 20_000), evidenceFile: receipt.evidenceFile };
    }
    case 'memory_search':
      return searchMemories({ directory, query: input.query });
    case 'memory_add':
      return addMemory({ directory, name: input.name, description: input.description, body: input.body ?? '', type: input.type ?? 'learning' });
    case 'run_checks':
      return runProjectChecks(root);
    case 'midas_validate':
      return validateTarget(root);
    case 'finish':
      return { status: 'finished', summary: input.summary, evidence: input.evidence ?? '', nextAction: input.nextAction ?? '' };
    default:
      throw new Error(`Unknown agent tool: ${tool}`);
  }
}

async function callAnthropic({ apiKey, model, system, messages, tools }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model, max_tokens: 4096, system, messages, tools })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${detail.slice(0, 400)}`);
  }
  return response.json();
}

function buildSystemPrompt({ objective, allowWrites }) {
  return [
    'You are a MIDAS-bounded software agent. You operate inside one project directory with a fixed tool set.',
    'Rules: evidence before claims; keep scope narrow; never invent file contents; never claim checks passed without running them.',
    allowWrites ? 'Writes are enabled but must stay minimal and reversible.' : 'This run is read-only: do not attempt writes.',
    'When the objective is met (or blocked), call the finish tool with a summary, evidence, and next action.',
    `Objective: ${objective}`
  ].join('\n');
}

export async function runAgentLoop({
  directory = '.',
  objective,
  provider = 'manual',
  model = 'claude-sonnet-5',
  maxSteps = 12,
  allowWrites = false,
  allowWeb = false,
  script
}) {
  if (!objective || !String(objective).trim()) throw new Error('agent requires an --objective.');
  const boundedSteps = Math.min(Number(maxSteps) || 12, MAX_STEPS_CEILING);
  const runId = `agent-${new Date().toISOString().replace(/[:.]/g, '-')}-${crypto.randomUUID().slice(0, 8)}`;
  const runDir = path.join(path.resolve(directory), '.midas', 'runtime', 'agent-runs', runId);
  await fs.mkdir(runDir, { recursive: true });
  const events = [];
  const record = (event) => events.push({ at: new Date().toISOString(), ...event });
  const context = { directory, allowWrites: Boolean(allowWrites), allowWeb: Boolean(allowWeb) };
  const tools = agentToolDefinitions(context);
  record({ type: 'run-started', objective, provider, maxSteps: boundedSteps, allowWrites: context.allowWrites, allowWeb: context.allowWeb });

  let outcome = { status: 'incomplete', summary: '', evidence: '', nextAction: 'Resume with a narrower objective or more steps.' };

  if (provider === 'manual') {
    outcome = {
      status: 'manual',
      summary: 'Manual provider selected: no model was called. Use the printed tool list and run tools via midas commands, or rerun with --provider anthropic-api.',
      evidence: '',
      nextAction: 'Rerun with --provider anthropic-api (requires ANTHROPIC_API_KEY) or --provider script --script <file.jsonl>.',
      tools: tools.map((tool) => tool.name)
    };
  } else if (provider === 'script') {
    if (!script) throw new Error('script provider requires --script <file.jsonl>.');
    const lines = (await fs.readFile(path.resolve(script), 'utf8')).split(/\r?\n/).filter((line) => line.trim());
    let steps = 0;
    for (const line of lines) {
      if (steps >= boundedSteps) break;
      steps += 1;
      const action = JSON.parse(line);
      record({ type: 'tool-call', step: steps, tool: action.tool, input: action.input ?? {} });
      try {
        const result = await executeAgentTool(action.tool, action.input ?? {}, context);
        record({ type: 'tool-result', step: steps, tool: action.tool, ok: true, result });
        if (action.tool === 'finish') {
          outcome = { status: 'finished', summary: result.summary, evidence: result.evidence, nextAction: result.nextAction };
          break;
        }
      } catch (error) {
        record({ type: 'tool-result', step: steps, tool: action.tool, ok: false, error: error.message });
      }
    }
  } else if (provider === 'anthropic-api') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('anthropic-api provider requires the ANTHROPIC_API_KEY environment variable.');
    const system = buildSystemPrompt({ objective, allowWrites: context.allowWrites });
    const messages = [{ role: 'user', content: `Begin. Work toward the objective with the available tools. Objective: ${objective}` }];
    for (let step = 1; step <= boundedSteps; step += 1) {
      const reply = await callAnthropic({ apiKey, model, system, messages, tools });
      record({ type: 'model-turn', step, stopReason: reply.stop_reason, usage: reply.usage });
      messages.push({ role: 'assistant', content: reply.content });
      const toolUses = reply.content.filter((block) => block.type === 'tool_use');
      if (toolUses.length === 0) {
        const text = reply.content.filter((block) => block.type === 'text').map((block) => block.text).join('\n');
        outcome = { status: 'stopped', summary: text.slice(0, 2000), evidence: '', nextAction: 'Model ended without calling finish; review the transcript.' };
        break;
      }
      const toolResults = [];
      let finished = false;
      for (const use of toolUses) {
        record({ type: 'tool-call', step, tool: use.name, input: use.input });
        try {
          const result = await executeAgentTool(use.name, use.input ?? {}, context);
          record({ type: 'tool-result', step, tool: use.name, ok: true });
          toolResults.push({ type: 'tool_result', tool_use_id: use.id, content: JSON.stringify(result).slice(0, 40_000) });
          if (use.name === 'finish') {
            outcome = { status: 'finished', summary: result.summary, evidence: result.evidence, nextAction: result.nextAction };
            finished = true;
          }
        } catch (error) {
          record({ type: 'tool-result', step, tool: use.name, ok: false, error: error.message });
          toolResults.push({ type: 'tool_result', tool_use_id: use.id, content: `Error: ${error.message}`, is_error: true });
        }
      }
      messages.push({ role: 'user', content: toolResults });
      if (finished) break;
    }
  } else {
    throw new Error(`Unknown provider: ${provider}. Use manual, script, or anthropic-api.`);
  }

  record({ type: 'run-ended', status: outcome.status });
  const run = {
    runId,
    objective,
    provider,
    model: provider === 'anthropic-api' ? model : null,
    startedAt: events[0].at,
    endedAt: events[events.length - 1].at,
    allowWrites: context.allowWrites,
    allowWeb: context.allowWeb,
    maxSteps: boundedSteps,
    outcome
  };
  await fs.writeFile(path.join(runDir, 'run.json'), JSON.stringify(run, null, 2));
  await fs.writeFile(path.join(runDir, 'events.jsonl'), events.map((event) => JSON.stringify(event)).join('\n') + '\n');
  return {
    ...run,
    eventCount: events.length,
    runDir: path.relative(path.resolve(directory), runDir).replaceAll('\\', '/')
  };
}
