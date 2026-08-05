/**
 * MD-4 config layering (MIDAS-BRIDGE-004): 3-layer customize.json resolver.
 *
 * Layers, lowest to highest precedence:
 *   1. default — the skill's own customize.json:
 *        <dir>/.midas/skills/<skill>/customize.json (installed workspace) or,
 *        failing that, <dir>/framework/skills/<skill>/customize.json (repo).
 *   2. team    — <dir>/.midas/team.customize.json
 *   3. user    — <dir>/.midas/user.customize.json
 *
 * The team and user files are maps KEYED BY SKILL NAME:
 *   { "work-order": { ... }, "midas-tdd": { ... } }
 * Only the subtree for the requested skill contributes; an absent key means the
 * layer contributes nothing.
 *
 * Deterministic merge rules:
 *   - plain objects deep-merge, key by key
 *   - arrays REPLACE wholesale (no element merging)
 *   - scalars (including explicit null) override
 *
 * The result carries a provenance map: dot-path -> winning layer name
 * ("default" | "team" | "user") for every leaf value and for every replaced
 * array, so a resolved value is always traceable to the layer that set it.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

export const CUSTOMIZE_LAYERS = ['default', 'team', 'user'];

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function readJsonIfExists(file) {
  try {
    const text = await fs.readFile(file, 'utf8');
    return { found: true, value: JSON.parse(text), error: null };
  } catch (error) {
    if (error.code === 'ENOENT') return { found: false, value: null, error: null };
    return { found: false, value: null, error: `${path.basename(file)}: ${error.message}` };
  }
}

function joinPath(prefix, key) {
  return prefix ? `${prefix}.${key}` : key;
}

function stampProvenance(provenance, layer, value, prefix) {
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      provenance[prefix || '.'] = layer;
      return;
    }
    for (const key of keys) stampProvenance(provenance, layer, value[key], joinPath(prefix, key));
    return;
  }
  // Arrays and scalars are atomic: one provenance entry at their own path.
  provenance[prefix || '.'] = layer;
}

function mergeLayer(base, overlay, layer, provenance, prefix = '') {
  if (!isPlainObject(base) || !isPlainObject(overlay)) {
    stampProvenance(provenance, layer, overlay, prefix);
    return overlay;
  }
  const result = { ...base };
  for (const key of Object.keys(overlay)) {
    const childPath = joinPath(prefix, key);
    if (isPlainObject(overlay[key]) && isPlainObject(result[key])) {
      result[key] = mergeLayer(result[key], overlay[key], layer, provenance, childPath);
    } else {
      result[key] = overlay[key];
      stampProvenance(provenance, layer, overlay[key], childPath);
    }
  }
  return result;
}

async function firstExisting(candidates) {
  for (const candidate of candidates) {
    try {
      await fs.stat(candidate);
      return candidate;
    } catch {
      // keep looking
    }
  }
  return null;
}

/**
 * Resolve the effective customize config for one skill across the three layers.
 * Returns { status, skill, layers, config, provenance, findings }.
 */
export async function resolveCustomize({ directory = '.', skill }) {
  if (!skill || String(skill).trim() === '') {
    throw new Error('customize requires a skill name.');
  }
  const target = path.resolve(directory);
  const findings = [];

  const skillDir = await firstExisting([
    path.join(target, '.midas', 'skills', skill),
    path.join(target, 'framework', 'skills', skill)
  ]);
  if (!skillDir) {
    return {
      status: 'fail',
      skill,
      target,
      error: `Unknown skill: ${skill}. Looked in .midas/skills/ and framework/skills/.`,
      config: null,
      provenance: null
    };
  }

  const layerPaths = {
    default: path.join(skillDir, 'customize.json'),
    team: path.join(target, '.midas', 'team.customize.json'),
    user: path.join(target, '.midas', 'user.customize.json')
  };

  const layers = {};
  const layerValues = {};
  for (const layer of CUSTOMIZE_LAYERS) {
    const file = layerPaths[layer];
    const read = await readJsonIfExists(file);
    if (read.error) {
      findings.push({ layer, file: path.relative(target, file).replaceAll('\\', '/'), issue: read.error });
    }
    let value = read.found ? read.value : null;
    if (value !== null && layer !== 'default') {
      // team/user files are keyed by skill name; take this skill's subtree.
      if (!isPlainObject(value)) {
        findings.push({
          layer,
          file: path.relative(target, file).replaceAll('\\', '/'),
          issue: 'layer file must be a JSON object keyed by skill name'
        });
        value = null;
      } else {
        value = Object.prototype.hasOwnProperty.call(value, skill) ? value[skill] : null;
      }
    }
    if (value !== null && !isPlainObject(value)) {
      findings.push({
        layer,
        file: path.relative(target, file).replaceAll('\\', '/'),
        issue: `config for skill "${skill}" must be a JSON object`
      });
      value = null;
    }
    layerValues[layer] = value;
    layers[layer] = {
      file: path.relative(target, file).replaceAll('\\', '/'),
      found: read.found,
      contributes: value !== null && Object.keys(value).length > 0
    };
  }

  let config = {};
  const provenance = {};
  for (const layer of CUSTOMIZE_LAYERS) {
    if (layerValues[layer] === null) continue;
    config = mergeLayer(config, layerValues[layer], layer, provenance);
  }

  return {
    status: findings.length > 0 ? 'warn' : 'pass',
    skill,
    target,
    layers,
    config,
    provenance,
    findings
  };
}
