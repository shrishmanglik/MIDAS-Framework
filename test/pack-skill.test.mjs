import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { packSkill, readSkillPackage, skillPackageSchemaVersion, verifySkillPackage } from '../lib/pack.mjs';

const sourceSkill = path.resolve('framework/skills/verification-gap');

test('.skill roundtrip: manifest hash matches the packaged SKILL.md', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-pack-skill-'));
  const out = path.join(temp, 'verification-gap.skill');
  const packed = await packSkill({ skillDir: sourceSkill, out });
  assert.equal(packed.status, 'packed');
  assert.equal(packed.name, 'verification-gap');
  assert.equal(packed.license, 'Apache-2.0');

  const { manifest, entries } = await readSkillPackage(out);
  assert.equal(manifest.schemaVersion, skillPackageSchemaVersion);
  assert.equal(manifest.name, 'verification-gap');
  assert.equal(manifest.sha256, packed.sha256);

  const skillEntry = entries.find((entry) => entry.name === 'skill/SKILL.md');
  assert.ok(skillEntry, 'archive must contain skill/SKILL.md');
  const packagedHash = crypto.createHash('sha256').update(skillEntry.data).digest('hex');
  assert.equal(packagedHash, manifest.sha256);

  const onDiskHash = crypto.createHash('sha256')
    .update(await fs.readFile(path.join(sourceSkill, 'SKILL.md')))
    .digest('hex');
  assert.equal(onDiskHash, manifest.sha256);

  const verification = await verifySkillPackage(out);
  assert.deepEqual(verification.failures, []);
  assert.equal(verification.status, 'pass');
  await fs.rm(temp, { recursive: true, force: true });
});

test('packing the same skill twice is byte-identical (deterministic)', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-pack-det-'));
  const first = path.join(temp, 'a.skill');
  const second = path.join(temp, 'b.skill');
  await packSkill({ skillDir: sourceSkill, out: first });
  await packSkill({ skillDir: sourceSkill, out: second });
  assert.ok((await fs.readFile(first)).equals(await fs.readFile(second)));
  await fs.rm(temp, { recursive: true, force: true });
});

test('verifySkillPackage fails a tampered archive', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-pack-tamper-'));
  const out = path.join(temp, 'tampered.skill');
  await packSkill({ skillDir: sourceSkill, out });
  const bytes = await fs.readFile(out);
  // Flip a byte inside the packaged SKILL.md body (past manifest + headers).
  const marker = Buffer.from('Verification-Gap');
  const index = bytes.indexOf(marker);
  assert.ok(index > 0, 'expected to find skill body content to tamper with');
  bytes[index] = bytes[index] === 0x56 ? 0x76 : 0x56;
  await fs.writeFile(out, bytes);
  const verification = await verifySkillPackage(out);
  assert.equal(verification.status, 'fail');
  assert.ok(verification.failures.some((failure) => failure.id === 'skill-package:sha256'));
  await fs.rm(temp, { recursive: true, force: true });
});
