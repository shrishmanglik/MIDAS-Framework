import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const LICENSE_FILE = ['.midas', '_config', 'license.json'];

function canonicalPayload(payload) {
  const ordered = {};
  for (const key of Object.keys(payload).sort()) ordered[key] = payload[key];
  return JSON.stringify(ordered);
}

export async function generateLicenseKeypair({ out = '.' } = {}) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const outDir = path.resolve(out);
  await fs.mkdir(outDir, { recursive: true });
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
  const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const publicPath = path.join(outDir, 'midas-license-public.pem');
  const privatePath = path.join(outDir, 'midas-license-private.pem');
  await fs.writeFile(publicPath, publicPem);
  await fs.writeFile(privatePath, privatePem, { mode: 0o600 });
  return {
    status: 'created',
    publicKey: publicPath,
    privateKey: privatePath,
    warning: 'Keep the private key out of any repository. Only the public key ships with a distribution.'
  };
}

export async function signLicense({ privateKey, licensee, features = [], expires, out }) {
  if (!privateKey) throw new Error('license sign requires --private-key <pem-path>.');
  if (!licensee) throw new Error('license sign requires --licensee <name-or-email>.');
  const keyPem = await fs.readFile(path.resolve(privateKey), 'utf8');
  const payload = {
    licensee,
    features: Array.isArray(features) ? features : String(features).split(',').map((feature) => feature.trim()).filter(Boolean),
    issuedAt: new Date().toISOString(),
    expires: expires ?? null,
    licenseId: crypto.randomUUID()
  };
  const signature = crypto.sign(null, Buffer.from(canonicalPayload(payload)), keyPem).toString('base64');
  const license = { payload, signature, algorithm: 'ed25519' };
  const outPath = path.resolve(out ?? `midas-license-${payload.licenseId.slice(0, 8)}.json`);
  await fs.writeFile(outPath, JSON.stringify(license, null, 2));
  return { status: 'signed', file: outPath, licenseId: payload.licenseId, features: payload.features };
}

export function verifyLicenseDocument(license, publicKeyPem) {
  if (!license?.payload || !license?.signature) {
    return { valid: false, reason: 'License document is missing payload or signature.' };
  }
  let valid = false;
  try {
    valid = crypto.verify(
      null,
      Buffer.from(canonicalPayload(license.payload)),
      publicKeyPem,
      Buffer.from(license.signature, 'base64')
    );
  } catch (error) {
    return { valid: false, reason: `Signature check failed: ${error.message}` };
  }
  if (!valid) return { valid: false, reason: 'Signature does not match payload.' };
  if (license.payload.expires && new Date(license.payload.expires).getTime() < Date.now()) {
    return { valid: false, reason: `License expired at ${license.payload.expires}.` };
  }
  return { valid: true, reason: 'Signature valid.' };
}

export async function installLicense({ directory = '.', file }) {
  if (!file) throw new Error('license install requires a license file path.');
  const text = await fs.readFile(path.resolve(file), 'utf8');
  const license = JSON.parse(text);
  if (!license?.payload || !license?.signature) throw new Error('Not a MIDAS license document.');
  const target = path.join(path.resolve(directory), ...LICENSE_FILE);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(license, null, 2));
  return { status: 'installed', file: path.relative(path.resolve(directory), target).replaceAll('\\', '/') };
}

export async function licenseStatus({ directory = '.', publicKey } = {}) {
  const target = path.join(path.resolve(directory), ...LICENSE_FILE);
  let license;
  try {
    license = JSON.parse(await fs.readFile(target, 'utf8'));
  } catch {
    return {
      status: 'unlicensed',
      tier: 'free',
      note: 'No license installed. All current MIDAS features work without one; licensing is a scaffold for future paid distributions.'
    };
  }
  if (!publicKey) {
    return {
      status: 'unverified',
      tier: 'free',
      licensee: license.payload?.licensee ?? null,
      note: 'License present but no public key was provided for verification (--public-key <pem-path>).'
    };
  }
  const keyPem = await fs.readFile(path.resolve(publicKey), 'utf8');
  const verdict = verifyLicenseDocument(license, keyPem);
  return {
    status: verdict.valid ? 'licensed' : 'invalid',
    tier: verdict.valid ? 'licensed' : 'free',
    reason: verdict.reason,
    licensee: license.payload?.licensee ?? null,
    features: license.payload?.features ?? [],
    expires: license.payload?.expires ?? null
  };
}
