import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fixtures } from '../evals/deception/fixtures.mjs';
import { verifyCompletionGap } from '../lib/verification-gap.mjs';

async function build(fixture) {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), `midas-dec-${fixture.id}-`));
  for (const [relative, body] of Object.entries(fixture.files)) {
    const target = path.join(temp, relative);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body);
  }
  return temp;
}

// Each fixture is its own test so a regression names the exact deception that got through, rather
// than reporting that "the suite" failed.
for (const fixture of fixtures) {
  const label = `${fixture.id} [${fixture.category}] ${fixture.description}`;

  if (fixture.expect === 'must-not-pass') {
    test(`deception refused: ${label}`, async () => {
      const temp = await build(fixture);
      const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
      assert.notEqual(
        result.status,
        'pass',
        `FALSE PASS. This fixture fakes completion and the gate accepted it:\n${fixture.description}`
      );
    });
  }

  if (fixture.expect === 'must-pass') {
    test(`honest work accepted: ${label}`, async () => {
      const temp = await build(fixture);
      const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
      assert.equal(
        result.status,
        'pass',
        `FALSE FAILURE. This is real work and the gate refused it, which is how a gate gets ` +
        `switched off:\n${JSON.stringify(result.requirements, null, 2)}`
      );
    });
  }

  if (fixture.expect === 'known-limit') {
    // Pinned deliberately. If one of these ever starts being caught, that is a genuine capability
    // gain and the fixture should be promoted to must-not-pass in the same change, not left here
    // quietly passing for the wrong reason.
    test(`known limit still stands: ${label}`, async () => {
      const temp = await build(fixture);
      const result = await verifyCompletionGap({ directory: temp, spec: 'PRD.md' });
      assert.equal(
        result.status,
        'pass',
        `This deception is documented as undetectable by a static tracer and it was just caught. ` +
        `Promote ${fixture.id} to must-not-pass and update evals/deception/README.md.`
      );
      assert.ok(fixture.limit, `${fixture.id} must document WHY it cannot be caught`);
    });
  }
}

test('the suite reports its own score, and every fixture declares an expectation', () => {
  const expectations = new Set(fixtures.map((fixture) => fixture.expect));
  for (const value of expectations) {
    assert.ok(
      ['must-not-pass', 'must-pass', 'known-limit'].includes(value),
      `unknown expectation: ${value}`
    );
  }
  const ids = fixtures.map((fixture) => fixture.id);
  assert.equal(new Set(ids).size, ids.length, 'fixture ids must be unique');
  assert.ok(
    fixtures.filter((fixture) => fixture.expect === 'must-pass').length >= 3,
    'a suite with no honest fixtures would reward a gate that refuses everything'
  );
});
