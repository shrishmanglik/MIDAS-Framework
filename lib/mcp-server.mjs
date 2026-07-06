import readline from 'node:readline';
import { inspectProjectContext } from './context-inspector.mjs';
import { installWorkspace } from './installer.mjs';
import { addMemory, searchMemories, showMemory } from './memory-vault.mjs';
import { createPlanningPacket } from './planning-suite.mjs';
import { createQuickWorkOrder, recommendNextAction } from './router.mjs';
import { validateTarget } from './validator.mjs';
import { verifyCompletionGap } from './verification-gap.mjs';
import { fetchWeb } from './web-access.mjs';

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = { name: 'midas-framework', version: '0.1.0-alpha.0' };

function dirSchema(extra = {}) {
  return {
    type: 'object',
    properties: {
      directory: { type: 'string', description: 'Target project directory. Defaults to the server working directory.' },
      ...extra.properties
    },
    required: extra.required ?? []
  };
}

export function listMcpTools() {
  return [
    {
      name: 'midas_next',
      description: 'Recommend the next MIDAS action for a project workspace.',
      inputSchema: dirSchema()
    },
    {
      name: 'midas_validate',
      description: 'Validate a MIDAS repo or installed workspace, including public-boundary hygiene.',
      inputSchema: dirSchema()
    },
    {
      name: 'midas_install',
      description: 'Create or refresh a .midas workspace in a project directory.',
      inputSchema: dirSchema({
        properties: {
          modules: { type: 'string', description: 'Comma-separated module list, e.g. core,software-dev,qa.' },
          tools: { type: 'string', description: 'Comma-separated harness list, e.g. claude-code,codex.' }
        }
      })
    },
    {
      name: 'midas_context',
      description: 'Inspect project context snapshot health and drift.',
      inputSchema: dirSchema()
    },
    {
      name: 'midas_quick',
      description: 'Create a scoped quick work order.',
      inputSchema: dirSchema({
        properties: { intent: { type: 'string', description: 'One-line work-order objective.' } },
        required: ['intent']
      })
    },
    {
      name: 'midas_plan',
      description: 'Create local-first PRD, DESIGN, EXPERIENCE, and handoff planning files for a work order.',
      inputSchema: dirSchema({
        properties: {
          workOrder: { type: 'string', description: 'Work-order slug.' },
          objective: { type: 'string', description: 'Planning objective.' }
        },
        required: ['objective']
      })
    },
    {
      name: 'midas_verify',
      description: 'Run verification-gap traceability from a spec to implementation evidence.',
      inputSchema: dirSchema({
        properties: { spec: { type: 'string', description: 'Path to the spec/PRD file.' } },
        required: ['spec']
      })
    },
    {
      name: 'midas_memory_add',
      description: 'Save one durable memory entry to the .midas/memory vault.',
      inputSchema: dirSchema({
        properties: {
          name: { type: 'string', description: 'Short kebab-case slug.' },
          description: { type: 'string', description: 'One-line summary used for recall.' },
          type: { type: 'string', enum: ['user', 'feedback', 'project', 'reference', 'learning'] },
          body: { type: 'string', description: 'Memory body. Link related memories with [[name]].' },
          tags: { type: 'string', description: 'Comma-separated tags.' }
        },
        required: ['description']
      })
    },
    {
      name: 'midas_memory_search',
      description: 'Deterministically search the .midas/memory vault and return ranked matches.',
      inputSchema: dirSchema({
        properties: {
          query: { type: 'string' },
          limit: { type: 'number' }
        },
        required: ['query']
      })
    },
    {
      name: 'midas_memory_show',
      description: 'Show one memory entry by name.',
      inputSchema: dirSchema({
        properties: { name: { type: 'string' } },
        required: ['name']
      })
    },
    {
      name: 'midas_web_fetch',
      description: 'Fetch a public http(s) URL, extract readable text and links, and return an evidence receipt. Refuses private/loopback hosts.',
      inputSchema: dirSchema({
        properties: {
          url: { type: 'string' },
          render: { type: 'boolean', description: 'Render with local Playwright Chromium if installed.' },
          save: { type: 'boolean', description: 'Write a fetch receipt under .midas/reports/web/.' },
          maxBytes: { type: 'number' }
        },
        required: ['url']
      })
    }
  ];
}

export async function callMcpTool(name, args = {}, defaults = {}) {
  const directory = args.directory ?? defaults.directory ?? '.';
  switch (name) {
    case 'midas_next':
      return recommendNextAction(directory);
    case 'midas_validate':
      return validateTarget(directory);
    case 'midas_install':
      return installWorkspace({ directory, modules: args.modules, tools: args.tools, yes: true });
    case 'midas_context':
      return inspectProjectContext(directory);
    case 'midas_quick':
      return createQuickWorkOrder({ directory, intent: args.intent });
    case 'midas_plan':
      return createPlanningPacket({ directory, workOrder: args.workOrder, objective: args.objective });
    case 'midas_verify':
      return verifyCompletionGap({ directory, spec: args.spec });
    case 'midas_memory_add':
      return addMemory({ directory, name: args.name, description: args.description, type: args.type ?? 'project', body: args.body ?? '', tags: args.tags ?? [] });
    case 'midas_memory_search':
      return searchMemories({ directory, query: args.query, limit: args.limit });
    case 'midas_memory_show':
      return showMemory({ directory, name: args.name });
    case 'midas_web_fetch':
      return fetchWeb({ directory, url: args.url, render: Boolean(args.render), save: Boolean(args.save), maxBytes: args.maxBytes });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function handleMcpMessage(message, defaults = {}) {
  if (message === null || typeof message !== 'object' || Array.isArray(message)) {
    return { jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid request' } };
  }
  const { id, method, params } = message;
  const isNotification = id === undefined || id === null;

  try {
    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: params?.protocolVersion ?? PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO
        }
      };
    }
    if (method === 'notifications/initialized' || method === 'initialized') return null;
    if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
    if (method === 'tools/list') {
      return { jsonrpc: '2.0', id, result: { tools: listMcpTools() } };
    }
    if (method === 'tools/call') {
      const result = await callMcpTool(params?.name, params?.arguments ?? {}, defaults);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: result?.status === 'fail'
        }
      };
    }
    if (isNotification) return null;
    return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
  } catch (error) {
    if (isNotification) return null;
    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      }
    };
  }
}

export function startMcpServer({ directory = '.', input = process.stdin, output = process.stdout } = {}) {
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let message;
    try {
      message = JSON.parse(trimmed);
    } catch {
      output.write(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })}\n`);
      return;
    }
    const response = await handleMcpMessage(message, { directory });
    if (response) output.write(`${JSON.stringify(response)}\n`);
  });
  process.stderr.write(`midas mcp server ready (stdio, protocol ${PROTOCOL_VERSION}, directory ${directory})\n`);
  return rl;
}
