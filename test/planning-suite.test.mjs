import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createPlanningPacket } from '../lib/planning-suite.mjs';

test('planning suite creates PRD, DESIGN, EXPERIENCE, and handoff files', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-plan-'));
  const result = await createPlanningPacket({
    directory: temp,
    workOrder: 'demo-work',
    objective: 'Ship one verified planning slice'
  });
  assert.equal(result.status, 'created');
  assert.equal(result.files.length, 4);
  assert.ok(result.files.includes('.midas/planning/demo-work/PRD.md'));
  const prd = await fs.readFile(path.join(temp, '.midas', 'planning', 'demo-work', 'PRD.md'), 'utf8');
  assert.match(prd, /REQ-001/);
  assert.match(prd, /Ship one verified planning slice/);
});
