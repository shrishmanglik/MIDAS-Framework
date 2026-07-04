import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { validateSkillPack } from '../lib/skill-pack-validator.mjs';

test('validate skill pack validates a single default skill folder', async () => {
  const result = await validateSkillPack(path.resolve('framework/skills/verification-gap'), { strict: true });
  assert.equal(result.status, 'pass');
  assert.equal(result.mode, 'single-skill');
  assert.equal(result.skills[0].id, 'verification-gap');
});
