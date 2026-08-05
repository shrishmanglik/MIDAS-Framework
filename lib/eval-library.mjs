import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const evalLibrarySchemaVersion = 'midas.eval-library.v1';
export const qcRubricSchemaVersion = 'midas.qc-rubric.v1';
export const evalScenarioStatuses = ['RED-PENDING', 'RED-CAPTURED', 'GREEN', 'REGRESSED'];
export const evalScenarioClasses = ['pressure'];
export const disciplineSkillPrefix = 'midas-';
export const requiredRubricDimensions = ['clarity', 'disambiguation', 'doctrine-presence', 'actionability'];
export const rubricAnchorScores = [1, 2, 3, 4, 5];
const minimumJudgePrompts = 2;

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const defaultQcRubricFile = path.join(packageRoot, 'framework', 'agents', 'qc-rubric.json');

function relativePath(value) {
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

async function listDirectories(root) {
  if (!await exists(root)) return [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

export function parseScenarioMarkdown(text) {
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    throw new Error('Scenario file must start with YAML frontmatter.');
  }
  const normalized = text.replace(/\r\n/g, '\n');
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) throw new Error('Scenario frontmatter must end with --- on its own line.');
  const rawFrontmatter = normalized.slice(4, end);
  const body = normalized.slice(end + 5).trim();
  const frontmatter = {};
  for (const line of rawFrontmatter.split('\n')) {
    if (line.trim() === '') continue;
    const match = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*?)\s*$/);
    if (!match) throw new Error(`Unsupported scenario frontmatter line: ${line}`);
    frontmatter[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return { frontmatter, body };
}

export function validateScenarioRecord({ fileName, relativeFile, text }) {
  const failures = [];
  const baseName = fileName.replace(/\.md$/i, '');
  let parsed;
  try {
    parsed = parseScenarioMarkdown(text);
  } catch (error) {
    return {
      status: 'fail',
      scenario: { id: baseName, file: relativeFile },
      failures: [
        {
          id: `eval-scenario:${baseName}:frontmatter`,
          status: 'fail',
          remediation: error.message
        }
      ]
    };
  }
  const { frontmatter, body } = parsed;
  const id = frontmatter.skill ?? baseName;
  if (typeof frontmatter.skill !== 'string' || frontmatter.skill.trim() === '') {
    failures.push({
      id: `eval-scenario:${baseName}:skill`,
      status: 'fail',
      remediation: 'Scenario frontmatter must declare the skill it pressures (skill: <name>).'
    });
  } else if (frontmatter.skill !== baseName) {
    failures.push({
      id: `eval-scenario:${baseName}:skill-file-match`,
      status: 'fail',
      remediation: `Scenario skill field must match the file name. Expected ${baseName}, found ${frontmatter.skill}.`
    });
  }
  if (!evalScenarioClasses.includes(frontmatter.class)) {
    failures.push({
      id: `eval-scenario:${baseName}:class`,
      status: 'fail',
      remediation: `Scenario class must be one of: ${evalScenarioClasses.join(', ')}.`
    });
  }
  if (!evalScenarioStatuses.includes(frontmatter.status)) {
    failures.push({
      id: `eval-scenario:${baseName}:status`,
      status: 'fail',
      remediation: `Scenario status must be one of: ${evalScenarioStatuses.join(', ')}. Found: ${frontmatter.status ?? '(missing)'}.`
    });
  }
  if (body.length === 0) {
    failures.push({
      id: `eval-scenario:${baseName}:body`,
      status: 'fail',
      remediation: 'Scenario must include a pressure situation after the frontmatter.'
    });
  }
  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    scenario: {
      id,
      file: relativeFile,
      skill: frontmatter.skill ?? null,
      class: frontmatter.class ?? null,
      scenarioStatus: frontmatter.status ?? null,
      bodyLines: body === '' ? 0 : body.split('\n').length
    },
    failures
  };
}

export async function inspectEvalLibrary(directory, options = {}) {
  const target = path.resolve(directory);
  const skillsRoot = options.skillsRoot
    ? path.resolve(options.skillsRoot)
    : path.join(target, 'framework', 'skills');
  const scenariosRoot = options.scenariosRoot
    ? path.resolve(options.scenariosRoot)
    : path.join(target, 'evals', 'scenarios');
  const failures = [];
  const scenarios = [];

  const skillDirectories = await listDirectories(skillsRoot);
  const disciplineSkills = skillDirectories.filter((name) => name.startsWith(disciplineSkillPrefix));
  if (!await exists(skillsRoot)) {
    failures.push({
      id: 'eval-library:skills-root',
      status: 'fail',
      remediation: `Skill library root not found: ${relativePath(path.relative(target, skillsRoot) || '.')}`
    });
  }
  if (!await exists(scenariosRoot)) {
    failures.push({
      id: 'eval-library:scenarios-root',
      status: 'fail',
      remediation: `Create the eval scenarios root: ${relativePath(path.relative(target, scenariosRoot) || '.')}`
    });
  } else {
    const entries = await fs.readdir(scenariosRoot, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
    for (const fileName of files) {
      const file = path.join(scenariosRoot, fileName);
      const inspection = validateScenarioRecord({
        fileName,
        relativeFile: relativePath(path.relative(target, file)),
        text: await fs.readFile(file, 'utf8')
      });
      scenarios.push(inspection.scenario);
      failures.push(...inspection.failures);
    }
  }

  const coveredSkills = new Set(
    scenarios
      .map((scenario) => scenario.skill)
      .filter((skill) => typeof skill === 'string' && skill !== '')
  );
  const missing = disciplineSkills.filter((skill) => !coveredSkills.has(skill));
  for (const skill of missing) {
    failures.push({
      id: `eval-coverage:${skill}`,
      status: 'fail',
      remediation: `Discipline skill ${skill} has no pressure scenario. Create evals/scenarios/${skill}.md.`
    });
  }
  const knownSkills = new Set(skillDirectories);
  const orphanScenarios = scenarios
    .filter((scenario) => typeof scenario.skill === 'string' && scenario.skill !== '' && !knownSkills.has(scenario.skill))
    .map((scenario) => scenario.skill);
  for (const skill of orphanScenarios) {
    failures.push({
      id: `eval-orphan:${skill}`,
      status: 'fail',
      remediation: `Scenario targets skill "${skill}" but framework/skills/${skill}/ does not exist. A scenario naming a nonexistent skill dies on step one.`
    });
  }

  const statusCounts = {};
  for (const status of evalScenarioStatuses) statusCounts[status] = 0;
  for (const scenario of scenarios) {
    if (evalScenarioStatuses.includes(scenario.scenarioStatus)) {
      statusCounts[scenario.scenarioStatus] += 1;
    }
  }

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    schemaVersion: evalLibrarySchemaVersion,
    target,
    skillsRoot: relativePath(path.relative(target, skillsRoot) || '.'),
    scenariosRoot: relativePath(path.relative(target, scenariosRoot) || '.'),
    scenarios,
    coverage: {
      requiredSkills: disciplineSkills,
      covered: disciplineSkills.filter((skill) => coveredSkills.has(skill)),
      missing,
      orphanScenarios
    },
    statusCounts,
    failures
  };
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

export function validateQcRubric(rubric) {
  const failures = [];
  if (rubric === null || typeof rubric !== 'object' || Array.isArray(rubric)) {
    return {
      status: 'fail',
      failures: [
        {
          id: 'qc-rubric:shape',
          status: 'fail',
          remediation: 'QC rubric must be a JSON object.'
        }
      ]
    };
  }
  if (rubric.schemaVersion !== qcRubricSchemaVersion) {
    failures.push({
      id: 'qc-rubric:schema-version',
      status: 'fail',
      remediation: `QC rubric schemaVersion must be ${qcRubricSchemaVersion}.`
    });
  }
  const scale = rubric.scale;
  if (scale === null || typeof scale !== 'object' || scale.min !== 1 || scale.max !== 5) {
    failures.push({
      id: 'qc-rubric:scale',
      status: 'fail',
      remediation: 'QC rubric scale must be { "min": 1, "max": 5 }.'
    });
  }
  if (!Number.isInteger(rubric.passThreshold) || rubric.passThreshold < 1 || rubric.passThreshold > 5) {
    failures.push({
      id: 'qc-rubric:pass-threshold',
      status: 'fail',
      remediation: 'QC rubric passThreshold must be an integer between 1 and 5.'
    });
  }
  const dimensions = Array.isArray(rubric.dimensions) ? rubric.dimensions : null;
  if (!dimensions) {
    failures.push({
      id: 'qc-rubric:dimensions',
      status: 'fail',
      remediation: 'QC rubric must declare a dimensions array.'
    });
    return { status: 'fail', failures };
  }
  const seen = new Set();
  for (const dimension of dimensions) {
    const id = dimension?.id ?? '(missing id)';
    if (!isNonEmptyString(dimension?.id)) {
      failures.push({
        id: 'qc-rubric:dimension-id',
        status: 'fail',
        remediation: 'Every rubric dimension must declare a non-empty id.'
      });
      continue;
    }
    if (seen.has(id)) {
      failures.push({
        id: `qc-rubric:${id}:duplicate`,
        status: 'fail',
        remediation: `Rubric dimension ids must be unique. Duplicate: ${id}`
      });
    }
    seen.add(id);
    if (!isNonEmptyString(dimension.description)) {
      failures.push({
        id: `qc-rubric:${id}:description`,
        status: 'fail',
        remediation: `Dimension ${id} must have a non-empty description.`
      });
    }
    const anchors = Array.isArray(dimension.anchors) ? dimension.anchors : [];
    const anchorScores = anchors
      .filter((anchor) => Number.isInteger(anchor?.score) && isNonEmptyString(anchor?.meaning))
      .map((anchor) => anchor.score)
      .sort((a, b) => a - b);
    if (anchorScores.length !== rubricAnchorScores.length
      || rubricAnchorScores.some((score, index) => anchorScores[index] !== score)) {
      failures.push({
        id: `qc-rubric:${id}:anchors`,
        status: 'fail',
        remediation: `Dimension ${id} must anchor every score 1-5 exactly once, each with a non-empty meaning.`
      });
    }
    const judgePrompts = Array.isArray(dimension.judgePrompts) ? dimension.judgePrompts : [];
    if (judgePrompts.filter((prompt) => isNonEmptyString(prompt)).length < minimumJudgePrompts) {
      failures.push({
        id: `qc-rubric:${id}:judge-prompts`,
        status: 'fail',
        remediation: `Dimension ${id} must include at least ${minimumJudgePrompts} non-empty judge prompts.`
      });
    }
  }
  for (const required of requiredRubricDimensions) {
    if (!seen.has(required)) {
      failures.push({
        id: `qc-rubric:missing:${required}`,
        status: 'fail',
        remediation: `QC rubric must include the required dimension: ${required}.`
      });
    }
  }
  return { status: failures.length === 0 ? 'pass' : 'fail', failures };
}

export async function loadQcRubric(file = defaultQcRubricFile) {
  const text = await fs.readFile(file, 'utf8');
  const rubric = JSON.parse(text);
  return { rubric, validation: validateQcRubric(rubric) };
}
