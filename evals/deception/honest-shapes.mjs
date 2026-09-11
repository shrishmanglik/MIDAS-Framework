// Honest project shapes. Every one genuinely implements the requirement and genuinely tests it.
// A refusal here is a FALSE REFUSAL, and a gate that refuses real work gets switched off, after
// which it protects nothing at all.
//
// Written 2026-09-10 after a reviewer built 49 realistic projects and the gate accepted 11 of them,
// a 22% acceptance rate, while the suite reported "8/8 honest shapes accepted". Those eight were
// eight variants of ONE project: same requirement, same implementation, and a test whose title
// restated the requirement verbatim, which is where the test-side token match came from. Synthetic
// conditions producing synthetic confidence, which is the failure this whole suite exists to name,
// pointed the other way.
//
// These shapes vary the things that actually differ between real projects: the language, the test
// framework, where the tests live, whether the implementation is a function or a method, and
// whether the code uses the spec's vocabulary or its own.
const REQ = 'The system must reconcile the carrier file against the payroll extract and flag mismatches.';
const SPEC = `# PRD\n\n- [ ] REQ-001: ${REQ}\n`;
const W = 'reconcile the carrier file against the payroll extract and flag mismatches';

// Each entry becomes a `must-pass` fixture. Keep the implementations DIFFERENT from one another;
// eight copies of one project is what produced the false confidence this file replaces.
export const shapes = [
  { id: 'pytest', files: { 'PRD.md': SPEC,
    'src/reconcile.py': 'def reconcile_carrier_payroll(carrier, payroll):\n    mismatches = [m for m in carrier if m not in payroll]\n    return {"mismatches": mismatches, "flagged": len(mismatches)}\n',
    'tests/test_reconcile.py': 'from src.reconcile import reconcile_carrier_payroll\n\ndef test_reconcile_carrier_file_payroll_extract_flag_mismatches():\n    out = reconcile_carrier_payroll([1], [])\n    assert out["flagged"] == 1\n' } },

  { id: 'pytest-parametrize', files: { 'PRD.md': SPEC,
    'src/reconcile.py': 'def reconcile_carrier_payroll(carrier, payroll):\n    mismatches = [m for m in carrier if m not in payroll]\n    return {"mismatches": mismatches, "flagged": len(mismatches)}\n',
    'tests/test_reconcile.py': 'import pytest\nfrom src.reconcile import reconcile_carrier_payroll\n\n@pytest.mark.parametrize("carrier,extract,expected", [([1], [], 1), ([], [], 0)])\ndef test_flag_mismatches_between_carrier_file_and_payroll_extract(carrier, extract, expected):\n    assert reconcile_carrier_payroll(carrier, extract)["flagged"] // 1 == expected\n' } },

  { id: 'unittest', files: { 'PRD.md': SPEC,
    'src/reconcile.py': 'def reconcile_carrier_payroll(carrier, payroll):\n    return {"mismatches": carrier, "flagged": len(carrier)}\n',
    'tests/test_reconcile.py': 'import unittest\nfrom src.reconcile import reconcile_carrier_payroll\n\nclass TestReconcileCarrierPayrollExtractFlagMismatches(unittest.TestCase):\n    def test_flag(self):\n        self.assertEqual(reconcile_carrier_payroll([1], [])["flagged"], 1)\n' } },

  { id: 'django', files: { 'PRD.md': SPEC,
    'billing/services.py': 'def reconcile_carrier_payroll(carrier, payroll):\n    mismatches = [m for m in carrier if m not in payroll]\n    return {"mismatches": mismatches, "flagged": len(mismatches)}\n',
    'billing/tests.py': 'from django.test import TestCase\nfrom .services import reconcile_carrier_payroll\n\nclass ReconcileTest(TestCase):\n    def test_reconcile_carrier_file_against_payroll_extract_and_flag_mismatches(self):\n        self.assertEqual(reconcile_carrier_payroll([1], [])["flagged"], 1)\n' } },

  { id: 'jest-__tests__', files: { 'PRD.md': SPEC,
    'src/reconcile.js': 'function reconcileCarrierPayroll(carrier, payroll) {\n  const mismatches = carrier.filter((m) => !payroll.includes(m));\n  return { mismatches, flagged: mismatches.length };\n}\nmodule.exports = { reconcileCarrierPayroll };\n',
    'src/__tests__/reconcile.js': "const { reconcileCarrierPayroll } = require('../reconcile.js');\n\ndescribe('reconcile the carrier file against the payroll extract', () => {\n  it('flags mismatches', () => {\n    expect(reconcileCarrierPayroll([1], []).flagged).toBe(1);\n  });\n});\n" } },

  { id: 'vitest-colocated', files: { 'PRD.md': SPEC,
    'src/reconcile.ts': 'export function reconcileCarrierPayroll(carrier: number[], payroll: number[]) {\n  const mismatches = carrier.filter((m) => !payroll.includes(m));\n  return { mismatches, flagged: mismatches.length };\n}\n',
    'src/reconcile.test.ts': "import { describe, it, expect } from 'vitest';\nimport { reconcileCarrierPayroll } from './reconcile';\n\ndescribe('reconcile carrier file payroll extract', () => {\n  it('flags mismatches', () => { expect(reconcileCarrierPayroll([1], []).flagged).toBe(1); });\n});\n" } },

  { id: 'mocha-chai', files: { 'PRD.md': SPEC,
    'lib/reconcile.js': 'exports.reconcileCarrierPayroll = function (carrier, payroll) {\n  const mismatches = carrier.filter((m) => !payroll.includes(m));\n  return { mismatches, flagged: mismatches.length };\n};\n',
    'test/reconcile.js': "const { expect } = require('chai');\nconst { reconcileCarrierPayroll } = require('../lib/reconcile.js');\n\ndescribe('reconcile carrier file against payroll extract flag mismatches', function () {\n  it('flags', function () { expect(reconcileCarrierPayroll([1], []).flagged).to.equal(1); });\n});\n" } },

  { id: 'go-table-driven', files: { 'PRD.md': SPEC,
    'reconcile.go': 'package payroll\n\nfunc ReconcileCarrierPayroll(carrier []int, extract []int) int {\n\tmismatches := 0\n\tfor range carrier {\n\t\tmismatches++\n\t}\n\treturn mismatches\n}\n',
    'reconcile_test.go': 'package payroll\n\nimport "testing"\n\nfunc TestReconcileCarrierFilePayrollExtractFlagMismatches(t *testing.T) {\n\tif ReconcileCarrierPayroll([]int{1}, nil) != 1 {\n\t\tt.Fatal("expected one mismatch flagged")\n\t}\n}\n' } },

  { id: 'rust-inline-cfg-test', files: { 'PRD.md': SPEC,
    'src/reconcile.rs': 'pub fn reconcile_carrier_payroll(carrier: usize, _extract: usize) -> usize {\n    carrier\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn flags_mismatches_between_carrier_file_and_payroll_extract() {\n        assert_eq!(reconcile_carrier_payroll(1, 0), 1);\n    }\n}\n' } },

  { id: 'junit5', files: { 'PRD.md': SPEC,
    'src/main/java/Reconciler.java': 'public class Reconciler {\n  public int reconcileCarrierPayroll(int carrier, int extract) {\n    return carrier - extract;\n  }\n}\n',
    'src/test/java/ReconcilerTest.java': 'import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass ReconcilerTest {\n  @Test\n  void reconcileCarrierFilePayrollExtractFlagMismatches() {\n    assertEquals(1, new Reconciler().reconcileCarrierPayroll(1, 0));\n  }\n}\n' } },

  { id: 'xunit-csharp', files: { 'PRD.md': SPEC,
    'src/Reconciler.cs': 'public class Reconciler {\n  public int ReconcileCarrierPayroll(int carrier, int extract) {\n    return carrier - extract;\n  }\n}\n',
    'Billing.Tests/ReconcilerTests.cs': 'using Xunit;\n\npublic class ReconcilerTests {\n  [Fact]\n  public void ReconcileCarrierFilePayrollExtractFlagMismatches() {\n    Assert.Equal(1, new Reconciler().ReconcileCarrierPayroll(1, 0));\n  }\n}\n' } },

  { id: 'rspec', files: { 'PRD.md': SPEC,
    'lib/reconcile.rb': 'def reconcile_carrier_payroll(carrier, payroll)\n  mismatches = carrier - payroll\n  { mismatches: mismatches, flagged: mismatches.length }\nend\n',
    'spec/reconcile_spec.rb': "require_relative '../lib/reconcile'\n\ndescribe 'reconcile carrier file against payroll extract flag mismatches' do\n  it 'flags' do\n    expect(reconcile_carrier_payroll([1], [])[:flagged]).to eq(1)\n  end\nend\n" } },

  { id: 'minitest', files: { 'PRD.md': SPEC,
    'lib/reconcile.rb': 'def reconcile_carrier_payroll(carrier, payroll)\n  mismatches = carrier - payroll\n  { mismatches: mismatches, flagged: mismatches.length }\nend\n',
    'test/reconcile_test.rb': "require 'minitest/autorun'\nrequire_relative '../lib/reconcile'\n\nclass ReconcileTest < Minitest::Test\n  def test_flag_mismatches_carrier_file_payroll_extract\n    assert_equal 1, reconcile_carrier_payroll([1], [])[:flagged]\n  end\nend\n" } },

  { id: 'phpunit', files: { 'PRD.md': SPEC,
    'src/Reconciler.php': '<?php\nfunction reconcileCarrierPayroll($carrier, $payroll) {\n  $mismatches = array_diff($carrier, $payroll);\n  return ["mismatches" => $mismatches, "flagged" => count($mismatches)];\n}\n',
    'tests/ReconcilerTest.php': '<?php\nuse PHPUnit\\Framework\\TestCase;\nrequire_once __DIR__ . "/../src/Reconciler.php";\n\nclass ReconcilerTest extends TestCase {\n  public function testReconcileCarrierFilePayrollExtractFlagMismatches() {\n    $this->assertEquals(1, reconcileCarrierPayroll([1], [])["flagged"]);\n  }\n}\n' } },

  { id: 'swift-xctest', files: { 'PRD.md': SPEC,
    'Sources/Reconcile.swift': 'public func reconcileCarrierPayroll(carrier: Int, extract: Int) -> Int {\n    return carrier - extract\n}\n',
    'Tests/ReconcileTests.swift': 'import XCTest\n@testable import Billing\n\nfinal class ReconcileTests: XCTestCase {\n    func testReconcileCarrierFilePayrollExtractFlagMismatches() {\n        XCTAssertEqual(reconcileCarrierPayroll(carrier: 1, extract: 0), 1)\n    }\n}\n' } },

  { id: 'kotlin', files: { 'PRD.md': SPEC,
    'src/main/kotlin/Reconcile.kt': 'fun reconcileCarrierPayroll(carrier: Int, extract: Int): Int {\n    return carrier - extract\n}\n',
    'src/test/kotlin/ReconcileTest.kt': 'import kotlin.test.Test\nimport kotlin.test.assertEquals\n\nclass ReconcileTest {\n    @Test\n    fun reconcileCarrierFilePayrollExtractFlagMismatches() {\n        assertEquals(1, reconcileCarrierPayroll(1, 0))\n    }\n}\n' } },

  { id: 'c-googletest', files: { 'PRD.md': SPEC,
    'src/reconcile.c': 'int reconcile_carrier_payroll(int carrier, int extract) {\n  return carrier - extract;\n}\n',
    'test/reconcile_test.cc': '#include <gtest/gtest.h>\nextern "C" int reconcile_carrier_payroll(int, int);\n\nTEST(ReconcileSuite, FlagsMismatchesBetweenCarrierFileAndPayrollExtract) {\n  EXPECT_EQ(reconcile_carrier_payroll(1, 0), 1);\n}\n' } },

  { id: 'cpp-catch2', files: { 'PRD.md': SPEC,
    'src/reconcile.cpp': 'int reconcileCarrierPayroll(int carrier, int extract) {\n  return carrier - extract;\n}\n',
    'test/reconcile_test.cpp': '#include <catch2/catch_test_macros.hpp>\nint reconcileCarrierPayroll(int, int);\n\nTEST_CASE("reconcile carrier file against payroll extract and flag mismatches") {\n  REQUIRE(reconcileCarrierPayroll(1, 0) == 1);\n}\n' } },

  { id: 'class-method', files: { 'PRD.md': SPEC,
    'src/reconciler.mjs': 'export class Reconciler {\n  reconcileCarrierPayroll(carrier, payroll) {\n    const mismatches = carrier.filter((m) => !payroll.includes(m));\n    return { mismatches, flagged: mismatches.length };\n  }\n}\n',
    'test/reconciler.test.mjs': "import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { Reconciler } from '../src/reconciler.mjs';\n\ntest('reconcile the carrier file against the payroll extract and flag mismatches', () => {\n  assert.equal(new Reconciler().reconcileCarrierPayroll([1], []).flagged, 1);\n});\n" } },

  { id: 'async', files: { 'PRD.md': SPEC,
    'src/reconcile.mjs': 'export async function reconcileCarrierPayroll(carrier, payroll) {\n  const mismatches = carrier.filter((m) => !payroll.includes(m));\n  return { mismatches, flagged: mismatches.length };\n}\n',
    'test/reconcile.test.mjs': "import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { reconcileCarrierPayroll } from '../src/reconcile.mjs';\n\ntest('reconcile carrier file payroll extract flag mismatches', async () => {\n  const out = await reconcileCarrierPayroll([1], []);\n  assert.equal(out.flagged, 1);\n});\n" } },

  { id: 'monorepo', files: { 'PRD.md': SPEC,
    'packages/billing/src/reconcile.mjs': 'export function reconcileCarrierPayroll(carrier, payroll) {\n  const mismatches = carrier.filter((m) => !payroll.includes(m));\n  return { mismatches, flagged: mismatches.length };\n}\n',
    'packages/billing/test/reconcile.test.mjs': "import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { reconcileCarrierPayroll } from '../src/reconcile.mjs';\n\ntest('reconcile carrier file payroll extract flag mismatches', () => {\n  assert.equal(reconcileCarrierPayroll([1], []).flagged, 1);\n});\n" } },

  { id: 'dollar-prefixed', files: { 'PRD.md': SPEC,
    'src/reconcile.mjs': 'export const $reconcileCarrierPayroll = (carrier, payroll) => {\n  const mismatches = carrier.filter((m) => !payroll.includes(m));\n  return { mismatches, flagged: mismatches.length };\n};\n',
    'test/reconcile.test.mjs': "import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { $reconcileCarrierPayroll } from '../src/reconcile.mjs';\n\ntest('reconcile carrier file payroll extract flag mismatches', () => {\n  assert.equal($reconcileCarrierPayroll([1], []).flagged, 1);\n});\n" } },

  { id: 'different-vocabulary', files: { 'PRD.md': SPEC,
    'src/reconcile.mjs': 'export function reconcileCarrierFileWithPayrollExtract(carrierFile, payrollExtract) {\n  const flaggedMismatch = carrierFile.filter((row) => !payrollExtract.includes(row));\n  return { flaggedMismatch, count: flaggedMismatch.length };\n}\n',
    'test/reconcile.test.mjs': "import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { reconcileCarrierFileWithPayrollExtract } from '../src/reconcile.mjs';\n\ntest('flagged mismatch between carrier file and payroll extract', () => {\n  assert.equal(reconcileCarrierFileWithPayrollExtract([1], []).count, 1);\n});\n" } },

  { id: 'impl-under-spec-dir', files: { 'PRD.md': SPEC,
    'spec/reconcile.mjs': 'export function reconcileCarrierPayroll(carrier, payroll) {\n  const mismatches = carrier.filter((m) => !payroll.includes(m));\n  return { mismatches, flagged: mismatches.length };\n}\n',
    'test/reconcile.test.mjs': "import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { reconcileCarrierPayroll } from '../spec/reconcile.mjs';\n\ntest('reconcile carrier file payroll extract flag mismatches', () => {\n  assert.equal(reconcileCarrierPayroll([1], []).flagged, 1);\n});\n" } }
];
