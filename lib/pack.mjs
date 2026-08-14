import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSkillMarkdown } from './skill-library.mjs';

export const skillPackageSchemaVersion = 'midas.skill-package.v1';
export const marketplaceSchemaVersion = 'midas.marketplace.v1';
export const marketplaceBundleKinds = ['skills', 'agents'];

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const defaultMarketplaceFile = path.join(packageRoot, 'framework', 'marketplace.json');

const bundleTargets = ['chatgpt-web', 'claude-web', 'gemini-web'];

function bundleText(target) {
  return `# MIDAS ${target} Bundle

Status: generated

Use this bundle as project context for planning or review. It is not a substitute for repository source, tests, or human approval.

## Operating Contract

- One active objective.
- Clear constraints.
- No secret values.
- No external or production actions without approval.
- Evidence before claims.
- Retrospective after meaningful work.
`;
}

export async function createBundle({ directory = '.', out }) {
  const target = path.resolve(directory);
  const bundleDir = path.resolve(out ?? path.join(target, '.midas', 'bundles'));
  await fs.mkdir(bundleDir, { recursive: true });
  const files = [];
  for (const bundle of bundleTargets) {
    const file = path.join(bundleDir, `${bundle}.md`);
    await fs.writeFile(file, bundleText(bundle));
    files.push(path.relative(target, file).replaceAll('\\', '/'));
  }
  return {
    status: 'packed',
    target,
    files
  };
}

// --- deterministic single-skill packaging (.skill = ustar archive) ---

const TAR_BLOCK = 512;

function octal(value, length) {
  return value.toString(8).padStart(length - 1, '0') + '\0';
}

function tarHeader(name, size) {
  const header = Buffer.alloc(TAR_BLOCK);
  header.write(name, 0, 100, 'utf8');
  header.write(octal(0o644, 8), 100);      // mode
  header.write(octal(0, 8), 108);           // uid
  header.write(octal(0, 8), 116);           // gid
  header.write(octal(size, 12), 124);       // size
  header.write(octal(0, 12), 136);          // mtime pinned to epoch for determinism
  header.write('        ', 148);            // checksum placeholder (8 spaces)
  header.write('0', 156);                   // typeflag: regular file
  header.write('ustar\0', 257);             // magic
  header.write('00', 263);                  // version
  let checksum = 0;
  for (const byte of header) checksum += byte;
  header.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148);
  return header;
}

function tarPad(size) {
  const remainder = size % TAR_BLOCK;
  return remainder === 0 ? Buffer.alloc(0) : Buffer.alloc(TAR_BLOCK - remainder);
}

function buildTar(entries) {
  const chunks = [];
  for (const entry of entries) {
    if (entry.name.length > 100) {
      throw new Error(`Archive entry name exceeds the 100-character ustar limit: ${entry.name}`);
    }
    chunks.push(tarHeader(entry.name, entry.data.length), entry.data, tarPad(entry.data.length));
  }
  chunks.push(Buffer.alloc(TAR_BLOCK * 2)); // end-of-archive marker
  return Buffer.concat(chunks);
}

function parseTar(buffer) {
  const entries = [];
  let offset = 0;
  let foundEndMarker = false;
  while (offset + TAR_BLOCK <= buffer.length) {
    const header = buffer.subarray(offset, offset + TAR_BLOCK);
    if (header.every((byte) => byte === 0)) {
      const secondEndBlock = buffer.subarray(offset + TAR_BLOCK, offset + (TAR_BLOCK * 2));
      if (secondEndBlock.length !== TAR_BLOCK || !secondEndBlock.every((byte) => byte === 0)) {
        throw new Error('Corrupt archive: incomplete end-of-archive marker.');
      }
      if (!buffer.subarray(offset + (TAR_BLOCK * 2)).every((byte) => byte === 0)) {
        throw new Error('Corrupt archive: non-zero data follows the end-of-archive marker.');
      }
      foundEndMarker = true;
      break;
    }
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const size = Number.parseInt(header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim(), 8);
    if (!Number.isFinite(size)) throw new Error(`Corrupt archive header at offset ${offset}.`);
    const start = offset + TAR_BLOCK;
    if (start + size > buffer.length) {
      throw new Error(`Corrupt archive: entry ${name} is truncated.`);
    }
    entries.push({ name, size, data: buffer.subarray(start, start + size) });
    offset = start + size + tarPad(size).length;
  }
  if (!foundEndMarker) throw new Error('Corrupt archive: missing end-of-archive marker.');
  return entries;
}

function isSafeArchivePath(value) {
  if (typeof value !== 'string' || value.length === 0 || value.includes('\0') || value.includes('\\')) {
    return false;
  }
  if (/^[A-Za-z]:/.test(value) || path.posix.isAbsolute(value) || path.win32.isAbsolute(value)) return false;
  return value.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..');
}

async function listFilesRecursive(root) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) files.push(full);
    }
  }
  return files.sort((a, b) => {
    const left = path.relative(root, a).replaceAll('\\', '/');
    const right = path.relative(root, b).replaceAll('\\', '/');
    return left < right ? -1 : left > right ? 1 : 0;
  });
}

export async function packSkill({ skillDir, out, version }) {
  const source = path.resolve(skillDir);
  const skillFile = path.join(source, 'SKILL.md');
  const skillText = await fs.readFile(skillFile, 'utf8');
  const { frontmatter } = parseSkillMarkdown(skillText);
  const name = frontmatter.name ?? path.basename(source);
  const resolvedVersion = version
    ?? frontmatter.version
    ?? JSON.parse(await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8')).version;
  const skillBytes = Buffer.from(skillText, 'utf8');
  const sha256 = crypto.createHash('sha256').update(skillBytes).digest('hex');

  const files = await listFilesRecursive(source);
  const fileEntries = [];
  for (const file of files) {
    fileEntries.push({
      name: `skill/${path.relative(source, file).replaceAll('\\', '/')}`,
      data: await fs.readFile(file)
    });
  }
  const manifest = {
    schemaVersion: skillPackageSchemaVersion,
    name,
    version: resolvedVersion,
    license: frontmatter.license ?? 'UNSPECIFIED',
    sha256,
    files: fileEntries.map((entry) => entry.name),
    fileSha256: Object.fromEntries(fileEntries.map((entry) => [
      entry.name,
      crypto.createHash('sha256').update(entry.data).digest('hex')
    ]))
  };
  const archive = buildTar([
    { name: 'manifest.json', data: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8') },
    ...fileEntries
  ]);

  const outFile = path.resolve(out ?? path.join('.midas', 'dist', `${name}-${resolvedVersion}.skill`));
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, archive);
  return {
    status: 'packed',
    file: outFile,
    name,
    version: resolvedVersion,
    license: manifest.license,
    sha256,
    bytes: archive.length,
    entries: manifest.files
  };
}

export async function readSkillPackage(file) {
  const entries = parseTar(await fs.readFile(path.resolve(file)));
  const manifestEntry = entries.find((entry) => entry.name === 'manifest.json');
  if (!manifestEntry) throw new Error('.skill package is missing manifest.json.');
  const manifest = JSON.parse(manifestEntry.data.toString('utf8'));
  if (manifest.schemaVersion !== skillPackageSchemaVersion) {
    throw new Error(`Unsupported .skill schemaVersion: ${manifest.schemaVersion}`);
  }
  return {
    manifest,
    entries: entries.map((entry) => ({ name: entry.name, size: entry.size, data: entry.data }))
  };
}

export async function verifySkillPackage(file) {
  const { manifest, entries } = await readSkillPackage(file);
  const failures = [];
  const entryCounts = new Map();
  for (const entry of entries) {
    entryCounts.set(entry.name, (entryCounts.get(entry.name) ?? 0) + 1);
  }
  for (const [name, count] of entryCounts) {
    if (count > 1) {
      failures.push({ id: 'skill-package:duplicate-entry', status: 'fail', remediation: `Archive entry ${name} appears ${count} times.` });
    }
  }
  const declaredFiles = Array.isArray(manifest.files) ? manifest.files : [];
  const unsafePaths = new Set([
    ...entries.map((entry) => entry.name),
    ...declaredFiles
  ].filter((name) => !isSafeArchivePath(name)));
  for (const unsafePath of unsafePaths) {
    failures.push({ id: 'skill-package:unsafe-path', status: 'fail', remediation: `Archive path is not safe and relative: ${unsafePath}` });
  }
  const declaredSet = new Set(declaredFiles);
  if (declaredSet.size !== declaredFiles.length) {
    failures.push({ id: 'skill-package:duplicate-declaration', status: 'fail', remediation: 'Manifest files must not contain duplicate paths.' });
  }
  const archiveFiles = entries.filter((entry) => entry.name !== 'manifest.json');
  for (const entry of archiveFiles) {
    if (!declaredSet.has(entry.name)) {
      failures.push({ id: 'skill-package:undeclared-entry', status: 'fail', remediation: `Archive contains undeclared entry ${entry.name}.` });
    }
  }
  const skillEntry = entries.find((entry) => entry.name === 'skill/SKILL.md');
  if (!skillEntry) {
    failures.push({ id: 'skill-package:skill-md', status: 'fail', remediation: 'Package must contain skill/SKILL.md.' });
  } else {
    const actual = crypto.createHash('sha256').update(skillEntry.data).digest('hex');
    if (actual !== manifest.sha256) {
      failures.push({
        id: 'skill-package:sha256',
        status: 'fail',
        remediation: `manifest sha256 ${manifest.sha256} does not match packaged SKILL.md (${actual}).`
      });
    }
  }
  const fileSha256 = manifest.fileSha256;
  if (fileSha256 === null || typeof fileSha256 !== 'object' || Array.isArray(fileSha256)) {
    failures.push({ id: 'skill-package:file-hashes', status: 'fail', remediation: 'Manifest must declare fileSha256 for every packaged file.' });
  }
  for (const declared of declaredFiles) {
    const entry = entries.find((candidate) => candidate.name === declared);
    if (!entry) {
      failures.push({ id: 'skill-package:missing-entry', status: 'fail', remediation: `Manifest lists ${declared} but the archive does not contain it.` });
      continue;
    }
    const expected = fileSha256?.[declared];
    const actual = crypto.createHash('sha256').update(entry.data).digest('hex');
    if (typeof expected !== 'string' || expected !== actual) {
      failures.push({ id: 'skill-package:file-sha256', status: 'fail', remediation: `Manifest hash for ${declared} does not match the packaged bytes.` });
    }
  }
  return { status: failures.length === 0 ? 'pass' : 'fail', manifest, failures };
}

// --- marketplace manifest validation (paths_real) ---

async function pathExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export async function validateMarketplace({ directory = packageRoot, manifestPath } = {}) {
  const root = path.resolve(directory);
  const file = path.resolve(manifestPath ?? path.join(root, 'framework', 'marketplace.json'));
  const failures = [];
  if (!await pathExists(file)) {
    return {
      status: 'fail',
      file,
      bundles: [],
      failures: [{ id: 'marketplace:file', status: 'fail', remediation: `Create marketplace manifest: ${file}` }]
    };
  }
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return {
      status: 'fail',
      file,
      bundles: [],
      failures: [{ id: 'marketplace:parse', status: 'fail', remediation: `marketplace.json is not valid JSON: ${error.message}` }]
    };
  }
  if (manifest.schemaVersion !== marketplaceSchemaVersion) {
    failures.push({ id: 'marketplace:schema-version', status: 'fail', remediation: `schemaVersion must be ${marketplaceSchemaVersion}.` });
  }
  const bundles = Array.isArray(manifest.bundles) ? manifest.bundles : [];
  if (bundles.length === 0) {
    failures.push({ id: 'marketplace:bundles', status: 'fail', remediation: 'bundles must be a non-empty array.' });
  }
  const bundleIds = new Set();
  const summaries = [];
  for (const bundle of bundles) {
    const bundleId = typeof bundle?.id === 'string' ? bundle.id : '(missing-id)';
    if (bundleIds.has(bundleId)) {
      failures.push({ id: `marketplace:${bundleId}:duplicate`, status: 'fail', remediation: `Bundle ids must be unique. Duplicate: ${bundleId}` });
    }
    bundleIds.add(bundleId);
    if (!marketplaceBundleKinds.includes(bundle?.kind)) {
      failures.push({ id: `marketplace:${bundleId}:kind`, status: 'fail', remediation: `Bundle kind must be one of: ${marketplaceBundleKinds.join(', ')}.` });
    }
    if (typeof bundle?.description !== 'string' || bundle.description.trim() === '') {
      failures.push({ id: `marketplace:${bundleId}:description`, status: 'fail', remediation: 'Every bundle requires a description.' });
    }
    const items = Array.isArray(bundle?.items) ? bundle.items : [];
    if (items.length === 0) {
      failures.push({ id: `marketplace:${bundleId}:items`, status: 'fail', remediation: 'Every bundle requires a non-empty items array.' });
    }
    const itemIds = new Set();
    for (const item of items) {
      const itemId = typeof item?.id === 'string' ? item.id : '(missing-id)';
      if (itemIds.has(itemId)) {
        failures.push({ id: `marketplace:${bundleId}:${itemId}:duplicate`, status: 'fail', remediation: `Item ids must be unique within a bundle. Duplicate: ${itemId}` });
      }
      itemIds.add(itemId);
      if (typeof item?.path !== 'string' || item.path.includes('..') || path.isAbsolute(item.path) || item.path.includes('\\')) {
        failures.push({ id: `marketplace:${bundleId}:${itemId}:path`, status: 'fail', remediation: 'Item paths must be workspace-relative, forward-slash, no traversal.' });
        continue;
      }
      // paths_real: the referenced artifact must exist on disk.
      const target = path.join(root, item.path);
      if (bundle?.kind === 'skills') {
        if (!await pathExists(path.join(target, 'SKILL.md'))) {
          failures.push({ id: `marketplace:${bundleId}:${itemId}:paths-real`, status: 'fail', remediation: `Referenced skill does not exist on disk: ${item.path}/SKILL.md` });
        }
      } else if (!await pathExists(target)) {
        failures.push({ id: `marketplace:${bundleId}:${itemId}:paths-real`, status: 'fail', remediation: `Referenced file does not exist on disk: ${item.path}` });
      }
    }
    summaries.push({ id: bundleId, kind: bundle?.kind ?? null, itemCount: items.length });
  }
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: marketplaceSchemaVersion,
    file,
    bundles: summaries,
    failures
  };
}
