import fs from 'node:fs/promises';
import path from 'node:path';

function normalizePath(value) {
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

function extractDesignComponents(text) {
  const components = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    const match =
      trimmed.match(/^[-*]\s*(?:component|view|page)\s*:\s*(.+)$/i) ??
      trimmed.match(/^#{2,4}\s+(?:Component|View|Page)\s*:\s*(.+)$/i) ??
      trimmed.match(/^[-*]\s*\[component\]\s*(.+)$/i);
    if (!match) continue;
    const name = match[1].trim();
    if (name) components.push({ name, line: index + 1 });
  }
  return components;
}

function extractExperienceReferences(text) {
  const refs = new Set();
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  for (const line of lines) {
    const matches = [
      ...line.matchAll(/\b(?:from|source|component|view|page|target|to)\s*:\s*([^>|,\n]+)/gi),
      ...line.matchAll(/`([^`]+)`/g)
    ];
    for (const match of matches) {
      const value = match[1].trim().toLowerCase();
      if (value) refs.add(value);
    }
  }
  return refs;
}

function containsReference(component, references, experienceText) {
  const normalized = component.name.toLowerCase();
  if (references.has(normalized)) return true;
  return experienceText.toLowerCase().includes(normalized);
}

function reportText(result) {
  const rows = result.components.map((component) => `| ${component.name.replaceAll('|', '/')} | ${component.status} | ${component.line} |`).join('\n');
  return `# MIDAS UX Spine Alignment Report

Status: ${result.status}
Generated At: ${result.generatedAt}
Design: ${result.design}
Experience: ${result.experience}
Components Audited: ${result.components.length}
Unmapped Components: ${result.unmapped.length}

## Component Mapping

| Component | Status | DESIGN.md Line |
|---|---|---:|
${rows || '| NONE | fail | 0 |'}

## Claim Ceiling

This report checks structural alignment between design components and experience references. It does not prove visual quality, accessibility, runtime behavior, or production readiness.
`;
}

export async function inspectUxSpine(options = {}) {
  const target = path.resolve(options.directory ?? '.');
  const designFile = path.resolve(target, options.design ?? 'DESIGN.md');
  const experienceFile = path.resolve(target, options.experience ?? 'EXPERIENCE.md');
  const generatedAt = new Date().toISOString();
  const failures = [];
  if (!await exists(designFile)) failures.push({ id: 'DESIGN-MISSING', text: 'DESIGN.md is missing.' });
  if (!await exists(experienceFile)) failures.push({ id: 'EXPERIENCE-MISSING', text: 'EXPERIENCE.md is missing.' });
  if (failures.length > 0) {
    return {
      status: 'fail',
      generatedAt,
      target,
      design: normalizePath(path.relative(target, designFile)),
      experience: normalizePath(path.relative(target, experienceFile)),
      components: [],
      unmapped: failures,
      report: null
    };
  }

  const designText = await fs.readFile(designFile, 'utf8');
  const experienceText = await fs.readFile(experienceFile, 'utf8');
  const references = extractExperienceReferences(experienceText);
  const components = extractDesignComponents(designText).map((component) => ({
    ...component,
    status: containsReference(component, references, experienceText) ? 'mapped' : 'unmapped'
  }));
  const unmapped = components.filter((component) => component.status !== 'mapped');
  const status = components.length > 0 && unmapped.length === 0 ? 'pass' : 'fail';
  const reportsDir = path.join(target, '.midas', 'reports');
  await fs.mkdir(reportsDir, { recursive: true });
  const report = path.join(reportsDir, 'ux-spine-report.md');
  const result = {
    status,
    generatedAt,
    target,
    design: normalizePath(path.relative(target, designFile)),
    experience: normalizePath(path.relative(target, experienceFile)),
    components,
    unmapped,
    report: normalizePath(path.relative(target, report))
  };
  await fs.writeFile(report, reportText(result));
  return result;
}
