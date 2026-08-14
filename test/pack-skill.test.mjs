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
  assert.equal(Object.keys(manifest.fileSha256).length, manifest.files.length);

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

test('verifySkillPackage fails when a packaged checklist is tampered', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-pack-resource-tamper-'));
  const out = path.join(temp, 'tampered-resource.skill');
  await packSkill({ skillDir: path.resolve('framework/skills/midas-tdd'), out });
  const bytes = await fs.readFile(out);
  const marker = Buffer.from('TDD gate checklist');
  const index = bytes.indexOf(marker, bytes.indexOf(Buffer.from('skill/checklist.md')));
  assert.ok(index > 0, 'expected to find checklist content to tamper with');
  bytes[index] = bytes[index] === 0x43 ? 0x63 : 0x43;
  await fs.writeFile(out, bytes);
  const verification = await verifySkillPackage(out);
  assert.equal(verification.status, 'fail');
  assert.ok(verification.failures.some((failure) => failure.id === 'skill-package:file-sha256'));
  await fs.rm(temp, { recursive: true, force: true });
});

test('verifySkillPackage rejects undeclared archive entries', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-pack-undeclared-'));
  const out = path.join(temp, 'undeclared.skill');
  await packSkill({ skillDir: path.resolve('framework/skills/midas-tdd'), out });
  const bytes = await fs.readFile(out);
  const declared = Buffer.from('skill/checklist.md');
  const replacement = Buffer.from('skill/checklist.xy');
  const index = bytes.indexOf(declared);
  assert.ok(index > 0, 'expected manifest declaration for checklist');
  replacement.copy(bytes, index);
  await fs.writeFile(out, bytes);
  const verification = await verifySkillPackage(out);
  assert.equal(verification.status, 'fail');
  assert.ok(verification.failures.some((failure) => failure.id === 'skill-package:undeclared-entry'));
  await fs.rm(temp, { recursive: true, force: true });
});

test('verifySkillPackage rejects duplicate archive entries', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-pack-duplicate-'));
  const out = path.join(temp, 'duplicate.skill');
  await packSkill({ skillDir: path.resolve('framework/skills/midas-tdd'), out });
  const bytes = await fs.readFile(out);
  const headerIndex = bytes.lastIndexOf(Buffer.from('skill/checklist.md'));
  assert.ok(headerIndex > 0, 'expected checklist archive header');
  bytes.fill(0, headerIndex, headerIndex + 100);
  Buffer.from('skill/SKILL.md').copy(bytes, headerIndex);
  await fs.writeFile(out, bytes);
  const verification = await verifySkillPackage(out);
  assert.equal(verification.status, 'fail');
  assert.ok(verification.failures.some((failure) => failure.id === 'skill-package:duplicate-entry'));
  await fs.rm(temp, { recursive: true, force: true });
});

test('verifySkillPackage rejects a truncated archive', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-pack-truncated-'));
  const out = path.join(temp, 'truncated.skill');
  await packSkill({ skillDir: sourceSkill, out });
  const bytes = await fs.readFile(out);
  await fs.writeFile(out, bytes.subarray(0, bytes.length - 1));
  await assert.rejects(() => verifySkillPackage(out), /end-of-archive marker/);
  await fs.rm(temp, { recursive: true, force: true });
});

test('verifySkillPackage rejects manifest-declared traversal paths', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-pack-traversal-'));
  const out = path.join(temp, 'traversal.skill');
  await packSkill({ skillDir: path.resolve('framework/skills/midas-tdd'), out });
  const bytes = await fs.readFile(out);
  const declared = Buffer.from('skill/checklist.md');
  const traversal = Buffer.from('../outside-file.xx');
  assert.equal(traversal.length, declared.length, 'fixture replacement must preserve archive offsets');

  let replacements = 0;
  let index = bytes.indexOf(declared);
  while (index >= 0) {
    traversal.copy(bytes, index);
    replacements += 1;
    index = bytes.indexOf(declared, index + traversal.length);
  }
  assert.equal(replacements, 3, 'expected manifest files, fileSha256, and archive header paths');
  await fs.writeFile(out, bytes);

  const verification = await verifySkillPackage(out);
  assert.equal(verification.status, 'fail');
  assert.ok(verification.failures.some((failure) => failure.id === 'skill-package:unsafe-path'));
  await fs.rm(temp, { recursive: true, force: true });
});

test('verifySkillPackage rejects Windows drive-relative paths', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-pack-drive-relative-'));
  const out = path.join(temp, 'drive-relative.skill');
  await packSkill({ skillDir: path.resolve('framework/skills/midas-tdd'), out });
  const bytes = await fs.readFile(out);
  const declared = Buffer.from('skill/checklist.md');
  const driveRelative = Buffer.from('C:evil/outside.xxx');
  assert.equal(driveRelative.length, declared.length, 'fixture replacement must preserve archive offsets');

  let replacements = 0;
  let index = bytes.indexOf(declared);
  while (index >= 0) {
    driveRelative.copy(bytes, index);
    replacements += 1;
    index = bytes.indexOf(declared, index + driveRelative.length);
  }
  assert.equal(replacements, 3, 'expected manifest files, fileSha256, and archive header paths');
  await fs.writeFile(out, bytes);

  const verification = await verifySkillPackage(out);
  assert.equal(verification.status, 'fail');
  assert.ok(verification.failures.some((failure) => failure.id === 'skill-package:unsafe-path'));
  await fs.rm(temp, { recursive: true, force: true });
});
