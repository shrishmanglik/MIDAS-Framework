import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_FACTSHEET_UTF8_BYTES,
  evaluateDomainAiGuard,
  verifyCitationGroundedOutput,
  verifyFactSheetSize,
  verifyZeroEmDash,
  verifyZeroEnterpriseJargon
} from '../lib/domain-ai-harness.mjs';

const sampleFactSheet = {
  engine: 'pyswisseph 2.10.03 · Lahiri Chitrapaksha',
  facts: {
    ascendant: 'Taurus 14.25',
    shukraLongitude: '4.30',
    alignmentScore: 92,
    windowStartDay: 14
  },
  citations: [
    { id: 'BPHS-32-14', label: 'Brihat Parashara Hora Shastra Ch. 32 Shloka 14' },
    { id: 'DE441', label: 'Swiss Ephemeris DE441' }
  ]
};

test('verifyFactSheetSize accepts deterministic FactSheet under 3,000 UTF-8 bytes and rejects oversized or malformed payloads', () => {
  const passResult = verifyFactSheetSize(sampleFactSheet);
  assert.equal(passResult.valid, true);
  assert.ok(passResult.byteLength > 0 && passResult.byteLength < MAX_FACTSHEET_UTF8_BYTES);
  assert.equal(passResult.failures.length, 0);

  const oversized = {
    ...sampleFactSheet,
    facts: {
      ...sampleFactSheet.facts,
      padding: 'x'.repeat(3050)
    }
  };
  const failOversized = verifyFactSheetSize(oversized);
  assert.equal(failOversized.valid, false);
  assert.ok(failOversized.byteLength >= 3000);
  assert.ok(failOversized.failures.some((f) => f.code === 'FACTSHEET_BYTE_LIMIT_EXCEEDED'));

  const missingFields = verifyFactSheetSize({ engine: '', facts: {}, citations: [] });
  assert.equal(missingFields.valid, false);
  assert.ok(missingFields.failures.some((f) => f.code === 'FACTSHEET_MISSING_ENGINE'));
  assert.ok(missingFields.failures.some((f) => f.code === 'FACTSHEET_MISSING_FACTS'));
  assert.ok(missingFields.failures.some((f) => f.code === 'FACTSHEET_MISSING_CITATIONS'));
});

test('verifyZeroEmDash passes clean prose and rejects unicode or HTML entity em dashes', () => {
  assert.equal(verifyZeroEmDash('Favourable window after May 14: Venus enters Taurus.').valid, true);

  const withUnicodeEmDash = verifyZeroEmDash('Favourable window \u2014 Venus enters Taurus.');
  assert.equal(withUnicodeEmDash.valid, false);
  assert.equal(withUnicodeEmDash.count, 1);
  assert.ok(withUnicodeEmDash.failures.some((f) => f.code === 'HUMAN_TASTE_EM_DASH_FORBIDDEN'));

  const withHtmlEntity = verifyZeroEmDash('Favourable window &mdash; Venus enters Taurus.');
  assert.equal(withHtmlEntity.valid, false);
});

test('verifyZeroEnterpriseJargon rejects enterprise buzzwords and AI-slop vocabulary', () => {
  const clean = verifyZeroEnterpriseJargon(
    'Built for solo founders and small accounting studios to save 6 hours every Friday.'
  );
  assert.equal(clean.valid, true);

  const dirty = verifyZeroEnterpriseJargon(
    'Our enterprise-grade, AI-powered platform unlocks seamless synergy for Fortune 500 teams.'
  );
  assert.equal(dirty.valid, false);
  assert.ok(dirty.matchedTerms.includes('enterprise-grade'));
  assert.ok(dirty.matchedTerms.includes('ai-powered'));
  assert.ok(dirty.matchedTerms.includes('seamless'));
  assert.ok(dirty.matchedTerms.includes('synergy'));
  assert.ok(dirty.matchedTerms.includes('fortune 500'));
});

test('verifyCitationGroundedOutput enforces canonical citation grounding and blocks invented numbers', () => {
  const groundedProse =
    'Your alignment score is 92 after day 14 with Shukra at 4.30 degrees [cite: BPHS-32-14] verified against Swiss Ephemeris DE441.';
  const ok = verifyCitationGroundedOutput(groundedProse, sampleFactSheet);
  assert.equal(ok.valid, true, JSON.stringify(ok.failures));
  assert.ok(ok.citedSources.length >= 1);

  const hallucinatedCitation = verifyCitationGroundedOutput(
    'Your alignment score is 92 after day 14 [cite: INVENTED-SUTRA-99].',
    sampleFactSheet
  );
  assert.equal(hallucinatedCitation.valid, false);
  assert.ok(hallucinatedCitation.failures.some((f) => f.code === 'OUTPUT_UNGROUNDED_CITATION'));

  const hallucinatedNumber = verifyCitationGroundedOutput(
    'Your alignment score is 99.8 after day 27 [cite: BPHS-32-14].',
    sampleFactSheet
  );
  assert.equal(hallucinatedNumber.valid, false);
  assert.ok(hallucinatedNumber.failures.some((f) => f.code === 'OUTPUT_UNGROUNDED_NUMBERS'));
  assert.deepEqual(hallucinatedNumber.ungroundedNumbers, ['99.8', '27']);
});

test('evaluateDomainAiGuard returns pass only when FactSheet size, human taste, and citation grounding all hold', () => {
  const goodOutput =
    'Favourable window after day 14: Shukra at 4.30 degrees gives a 92 alignment score per Brihat Parashara Hora Shastra Ch. 32 Shloka 14.';
  const passReceipt = evaluateDomainAiGuard({
    factSheet: sampleFactSheet,
    output: goodOutput
  });
  assert.equal(passReceipt.status, 'pass', JSON.stringify(passReceipt.failures));
  assert.ok(passReceipt.byteLength < 3000);

  const badReceipt = evaluateDomainAiGuard({
    factSheet: sampleFactSheet,
    output: 'Seamless enterprise-grade reading \u2014 97% alignment [cite: FAKE-1].'
  });
  assert.equal(badReceipt.status, 'fail');
  const codes = new Set(badReceipt.failures.map((f) => f.code));
  assert.ok(codes.has('HUMAN_TASTE_EM_DASH_FORBIDDEN'));
  assert.ok(codes.has('HUMAN_TASTE_ENTERPRISE_JARGON'));
  assert.ok(codes.has('OUTPUT_UNGROUNDED_CITATION'));
  assert.ok(codes.has('OUTPUT_UNGROUNDED_NUMBERS'));
});
