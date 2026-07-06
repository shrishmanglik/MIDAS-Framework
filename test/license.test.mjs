import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { generateLicenseKeypair, installLicense, licenseStatus, signLicense, verifyLicenseDocument } from '../lib/license.mjs';

test('license keygen, sign, install, and verify roundtrip', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-license-'));
  const keys = await generateLicenseKeypair({ out: temp });
  const signed = await signLicense({
    privateKey: keys.privateKey,
    licensee: 'test@example.com',
    features: 'mcp,agent',
    out: path.join(temp, 'license.json')
  });
  assert.equal(signed.status, 'signed');
  assert.deepEqual(signed.features, ['mcp', 'agent']);

  const project = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-license-project-'));
  await installLicense({ directory: project, file: signed.file });

  const unverified = await licenseStatus({ directory: project });
  assert.equal(unverified.status, 'unverified');

  const verified = await licenseStatus({ directory: project, publicKey: keys.publicKey });
  assert.equal(verified.status, 'licensed');
  assert.equal(verified.licensee, 'test@example.com');
});

test('license verification rejects tampered payloads and expiry', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-license-tamper-'));
  const keys = await generateLicenseKeypair({ out: temp });
  const signed = await signLicense({
    privateKey: keys.privateKey,
    licensee: 'honest@example.com',
    out: path.join(temp, 'license.json')
  });
  const publicPem = await fs.readFile(keys.publicKey, 'utf8');
  const document = JSON.parse(await fs.readFile(signed.file, 'utf8'));

  assert.equal(verifyLicenseDocument(document, publicPem).valid, true);

  const tampered = structuredClone(document);
  tampered.payload.licensee = 'attacker@example.com';
  assert.equal(verifyLicenseDocument(tampered, publicPem).valid, false);

  const expired = await signLicense({
    privateKey: keys.privateKey,
    licensee: 'old@example.com',
    expires: '2020-01-01T00:00:00Z',
    out: path.join(temp, 'expired.json')
  });
  const expiredDoc = JSON.parse(await fs.readFile(expired.file, 'utf8'));
  const verdict = verifyLicenseDocument(expiredDoc, publicPem);
  assert.equal(verdict.valid, false);
  assert.match(verdict.reason, /expired/i);
});

test('license status is honest when nothing is installed', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-license-none-'));
  const status = await licenseStatus({ directory: temp });
  assert.equal(status.status, 'unlicensed');
  assert.equal(status.tier, 'free');
});
