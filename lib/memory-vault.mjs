import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const VAULT_DIR = ['.midas', 'memory'];
const ENTRY_DIR = 'entries';
const INDEX_FILE = 'MEMORY.md';
const ALLOWED_TYPES = new Set(['user', 'feedback', 'project', 'reference', 'learning']);
const MAX_BODY_BYTES = 64 * 1024;

function vaultRoot(directory) {
  return path.join(path.resolve(directory), ...VAULT_DIR);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function tokenize(value) {
  return String(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

export function parseMemoryEntry(text) {
  const lines = String(text).split(/\r?\n/);
  if (lines[0] !== '---') return null;
  const meta = {};
  let bodyStart = lines.length;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index] === '---') {
      bodyStart = index + 1;
      break;
    }
    const match = lines[index].match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (match) meta[match[1]] = match[2].trim();
  }
  const body = lines.slice(bodyStart).join('\n').trim();
  if (!meta.name || !meta.description) return null;
  return {
    name: meta.name,
    description: meta.description,
    type: ALLOWED_TYPES.has(meta.type) ? meta.type : 'project',
    created: meta.created ?? '',
    updated: meta.updated ?? '',
    tags: (meta.tags ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    links: [...body.matchAll(/\[\[([^\]\r\n]+)\]\]/g)].map((match) => match[1].trim()),
    body
  };
}

function renderEntry(entry) {
  return [
    '---',
    `name: ${entry.name}`,
    `description: ${entry.description}`,
    `type: ${entry.type}`,
    `created: ${entry.created}`,
    `updated: ${entry.updated}`,
    `tags: ${entry.tags.join(', ')}`,
    '---',
    '',
    entry.body,
    ''
  ].join('\n');
}

async function readEntries(root) {
  const entriesDir = path.join(root, ENTRY_DIR);
  let files = [];
  try {
    files = (await fs.readdir(entriesDir)).filter((file) => file.endsWith('.md'));
  } catch {
    return [];
  }
  const entries = [];
  for (const file of files.sort()) {
    const text = await fs.readFile(path.join(entriesDir, file), 'utf8');
    const parsed = parseMemoryEntry(text);
    if (parsed) entries.push({ ...parsed, file: `${ENTRY_DIR}/${file}` });
  }
  return entries;
}

async function writeIndex(root, entries) {
  const lines = ['# MIDAS Memory Index', ''];
  for (const entry of entries) {
    lines.push(`- [${entry.name}](${entry.file}) — ${entry.description}`);
  }
  lines.push('');
  await fs.writeFile(path.join(root, INDEX_FILE), lines.join('\n'));
}

export async function addMemory({ directory = '.', name, description, type = 'project', body = '', tags = [] }) {
  if (!description || !String(description).trim()) {
    throw new Error('memory add requires a description.');
  }
  if (!ALLOWED_TYPES.has(type)) {
    throw new Error(`memory type must be one of: ${[...ALLOWED_TYPES].join(', ')}`);
  }
  if (Buffer.byteLength(String(body), 'utf8') > MAX_BODY_BYTES) {
    throw new Error(`memory body exceeds ${MAX_BODY_BYTES} bytes; split it into linked entries.`);
  }
  const root = vaultRoot(directory);
  await fs.mkdir(path.join(root, ENTRY_DIR), { recursive: true });
  const slug = slugify(name || description) || `memory-${crypto.randomUUID().slice(0, 8)}`;
  const file = path.join(root, ENTRY_DIR, `${slug}.md`);
  const now = new Date().toISOString();
  let created = now;
  try {
    const existing = parseMemoryEntry(await fs.readFile(file, 'utf8'));
    if (existing?.created) created = existing.created;
  } catch {
    // new entry
  }
  const entry = {
    name: slug,
    description: String(description).trim(),
    type,
    created,
    updated: now,
    tags: Array.isArray(tags) ? tags : String(tags).split(',').map((tag) => tag.trim()).filter(Boolean),
    body: String(body).trim()
  };
  await fs.writeFile(file, renderEntry(entry));
  const entries = await readEntries(root);
  await writeIndex(root, entries);
  return {
    status: 'saved',
    name: slug,
    file: path.relative(path.resolve(directory), file).replaceAll('\\', '/'),
    entryCount: entries.length
  };
}

export async function listMemories({ directory = '.' } = {}) {
  const entries = await readEntries(vaultRoot(directory));
  return {
    status: 'pass',
    entryCount: entries.length,
    entries: entries.map(({ body, ...rest }) => rest)
  };
}

export async function showMemory({ directory = '.', name }) {
  if (!name) throw new Error('memory show requires a name.');
  const entries = await readEntries(vaultRoot(directory));
  const entry = entries.find((candidate) => candidate.name === slugify(name));
  if (!entry) return { status: 'missing', name: slugify(name) };
  return { status: 'pass', entry };
}

export async function searchMemories({ directory = '.', query, limit = 5 }) {
  if (!query || !String(query).trim()) throw new Error('memory search requires a query.');
  const entries = await readEntries(vaultRoot(directory));
  const queryTokens = tokenize(query);
  const scored = entries
    .map((entry) => {
      const nameTokens = new Set(tokenize(`${entry.name} ${entry.description}`));
      const tagTokens = new Set(entry.tags.flatMap(tokenize));
      const bodyTokens = new Set(tokenize(entry.body));
      let score = 0;
      for (const token of queryTokens) {
        if (nameTokens.has(token)) score += 3;
        if (tagTokens.has(token)) score += 2;
        if (bodyTokens.has(token)) score += 1;
      }
      return { entry, score };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, Number(limit) || 5);
  return {
    status: 'pass',
    query,
    matchCount: scored.length,
    matches: scored.map(({ entry, score }) => ({
      name: entry.name,
      description: entry.description,
      type: entry.type,
      file: entry.file,
      score,
      excerpt: entry.body.slice(0, 320)
    }))
  };
}

export async function inspectMemoryLinks({ directory = '.' } = {}) {
  const entries = await readEntries(vaultRoot(directory));
  const known = new Set(entries.map((entry) => entry.name));
  const dangling = [];
  const edges = [];
  for (const entry of entries) {
    for (const link of entry.links) {
      const target = slugify(link);
      edges.push({ from: entry.name, to: target });
      if (!known.has(target)) dangling.push({ from: entry.name, to: target });
    }
  }
  return {
    status: 'pass',
    entryCount: entries.length,
    edgeCount: edges.length,
    danglingCount: dangling.length,
    dangling,
    note: 'Dangling links are markers for memories worth writing, not errors.'
  };
}
