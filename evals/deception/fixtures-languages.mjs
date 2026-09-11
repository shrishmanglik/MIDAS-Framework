// Six languages the gate could not read, added 2026-09-11.
//
// An independent reviewer built a complete, genuinely tested project in each of these and the gate
// returned `evidenceFiles: 0` with a receipt instructing the author to "implement or explicitly
// waive" REQ-001. Refusing to read a language is a defensible limit. Reporting unread code as
// unwritten is the worst false refusal this tool can produce, because it is a confident claim about
// the world made from having looked at nothing.
//
// A language needs three things, not one. Adding the extension makes the files readable; without an
// EXPORT shape there is no symbol for a test to exercise, and without a TEST convention the file
// holding the tests is not recognised as one. Two out of three still refuses every project in that
// language, silently, which is how the original list came to contain languages nobody could pass.
// Each fixture here exercises all three, so dropping any one of them turns the suite red.
//
// The seventh language, whatever it turns out to be, gets the NO-READABLE-SOURCE gap instead: a
// named refusal that says which extensions were passed over, rather than a verdict about the work.

const SPEC = '# PRD\n\n- [ ] REQ-001: The system must reconcile the carrier file against the payroll extract and flag mismatches.\n';

export const languageShapes = [
  {
    id: 'elixir-exunit',
    files: {
      'PRD.md': SPEC,
      'lib/reconciler.ex': [
        'defmodule Billing.Reconciler do',
        '  def reconcile_carrier_payroll(carrier, payroll) do',
        '    mismatches = Enum.reject(carrier, fn row -> row in payroll end)',
        '    %{mismatches: mismatches, flagged: length(mismatches)}',
        '  end',
        'end'
      ].join('\n'),
      'test/reconciler_test.exs': [
        'defmodule Billing.ReconcilerTest do',
        '  use ExUnit.Case',
        '  alias Billing.Reconciler',
        '',
        '  test "reconcile the carrier file against the payroll extract and flag mismatches" do',
        '    result = Reconciler.reconcile_carrier_payroll([1], [])',
        '    assert result.flagged == 1',
        '  end',
        'end'
      ].join('\n')
    }
  },
  {
    // Kebab-case is the third naming convention after camelCase and snake_case, and tokenize split
    // neither it nor the symbol filter accepted it, so `reconcile-carrier-payroll` was one
    // meaningless token belonging to a symbol that was discarded before it could be donated.
    id: 'clojure-test',
    files: {
      'PRD.md': SPEC,
      'src/billing/reconcile.clj': [
        '(ns billing.reconcile)',
        '',
        ';; Compare the carrier file with the payroll extract.',
        '(defn reconcile-carrier-payroll [carrier payroll]',
        '  (let [mismatches (remove (set payroll) carrier)]',
        '    {:mismatches mismatches :flagged (count mismatches)}))'
      ].join('\n'),
      'test/billing/reconcile_test.clj': [
        '(ns billing.reconcile-test',
        '  (:require [clojure.test :refer [deftest is]]',
        '            [billing.reconcile :refer [reconcile-carrier-payroll]]))',
        '',
        '(deftest flags-mismatches-between-carrier-file-and-payroll-extract',
        '  (is (= 1 (:flagged (reconcile-carrier-payroll [1] [])))))'
      ].join('\n')
    }
  },
  {
    // Haskell applies by juxtaposition, so the call site has no parentheses and looks like a bare
    // mention. A gate that only recognises `name(` cannot see any Haskell call at all.
    id: 'haskell-hspec',
    files: {
      'PRD.md': SPEC,
      'src/Reconcile.hs': [
        'module Reconcile (reconcileCarrierPayroll) where',
        '',
        'reconcileCarrierPayroll :: [Int] -> [Int] -> ([Int], Int)',
        'reconcileCarrierPayroll carrier payroll =',
        '  let mismatches = filter (`notElem` payroll) carrier',
        '  in (mismatches, length mismatches)'
      ].join('\n'),
      'test/ReconcileSpec.hs': [
        'module ReconcileSpec (spec) where',
        '',
        'import Test.Hspec',
        'import Reconcile (reconcileCarrierPayroll)',
        '',
        'spec :: Spec',
        'spec = describe "the carrier file and the payroll extract" $',
        '  it "flags mismatches" $',
        '    fst (reconcileCarrierPayroll [1] []) `shouldBe` [1]'
      ].join('\n')
    }
  },
  {
    // `shouldBe` has no word boundary after "should", so the assertion vocabulary missed every
    // hspec assertion ever written.
    id: 'perl-testmore',
    files: {
      'PRD.md': SPEC,
      'lib/Reconcile.pm': [
        'package Reconcile;',
        'use strict;',
        '',
        'sub reconcile_carrier_payroll {',
        '    my ($carrier, $payroll) = @_;',
        '    my %seen = map { $_ => 1 } @$payroll;',
        '    my @mismatches = grep { !$seen{$_} } @$carrier;',
        '    return { mismatches => \\@mismatches, flagged => scalar @mismatches };',
        '}',
        '1;'
      ].join('\n'),
      't/reconcile.t': [
        'use strict;',
        'use Test::More tests => 1;',
        'use Reconcile;',
        '',
        'my $result = Reconcile::reconcile_carrier_payroll([1], []);',
        "is($result->{flagged}, 1, 'carrier file payroll extract mismatches');"
      ].join('\n')
    }
  },
  {
    id: 'dart-test',
    files: {
      'PRD.md': SPEC,
      'lib/reconcile.dart': [
        'Map<String, dynamic> reconcileCarrierPayroll(List<int> carrier, List<int> payroll) {',
        '  final mismatches = carrier.where((row) => !payroll.contains(row)).toList();',
        "  return {'mismatches': mismatches, 'flagged': mismatches.length};",
        '}'
      ].join('\n'),
      'test/reconcile_test.dart': [
        "import 'package:test/test.dart';",
        "import '../lib/reconcile.dart';",
        '',
        'void main() {',
        "  test('carrier file payroll extract mismatches', () {",
        "    expect(reconcileCarrierPayroll([1], [])['flagged'], 1);",
        '  });',
        '}'
      ].join('\n')
    }
  },
  {
    // `.m` is Objective-C to one population and MATLAB to another, and they disagree about `%`:
    // comment in one, modulo in the other. The profile is chosen by CONTENT for this extension.
    // The modulo below is what pins that choice - under the MATLAB profile it starts a comment and
    // takes the message send on the same line with it, so the test exercises nothing.
    id: 'objc-xctest',
    files: {
      'PRD.md': SPEC,
      'Reconciler.m': [
        '#import "Reconciler.h"',
        '',
        '@implementation Reconciler',
        '',
        '- (NSDictionary *)reconcileCarrierPayroll:(NSArray *)carrier payroll:(NSArray *)payroll {',
        '    NSMutableArray *mismatches = [NSMutableArray array];',
        '    for (id row in carrier) {',
        '        if (![payroll containsObject:row]) [mismatches addObject:row];',
        '    }',
        '    return @{@"mismatches": mismatches, @"flagged": @(mismatches.count)};',
        '}',
        '',
        '@end'
      ].join('\n'),
      'ReconcilerTests.m': [
        '#import <XCTest/XCTest.h>',
        '#import "Reconciler.h"',
        '',
        '@interface ReconcilerTests : XCTestCase',
        '@end',
        '',
        '@implementation ReconcilerTests',
        '',
        '- (void)testCarrierFilePayrollExtractMismatches {',
        '    Reconciler *subject = [[Reconciler alloc] init];',
        '    NSUInteger parity = 3 % 2; NSDictionary *result = [subject reconcileCarrierPayroll:@[@1] payroll:@[]];',
        '    XCTAssertEqualObjects(result[@"flagged"], @(parity));',
        '}',
        '',
        '@end'
      ].join('\n')
    }
  }
];
