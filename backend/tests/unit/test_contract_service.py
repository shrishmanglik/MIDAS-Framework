"""
Unit tests for the Contract Service.

Tests clause detection (keyword/pattern matching) and risk scoring.
"""

import pytest

from app.services.contract_service import ContractService


# Sample contract texts for testing

FULL_CONTRACT = """
AGREEMENT

This Software Services Agreement ("Agreement") is entered into by and between
Party A and Party B.

1. CONFIDENTIALITY
   Each party agrees to hold in strict confidence all Confidential Information
   received from the other party. Confidential Information shall not be disclosed
   to any third party without the prior written consent of the disclosing party.

2. NON-COMPETE
   During the term of this Agreement and for a period of 12 months following
   termination, the Receiving Party shall not compete with the Disclosing Party.

3. INDEMNIFICATION
   Each party shall indemnify, defend, and hold harmless the other party from
   and against any and all claims arising out of a breach of this Agreement.

4. LIMITATION OF LIABILITY
   IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR
   CONSEQUENTIAL DAMAGES. The total aggregate liability shall not exceed the fees
   paid under this Agreement.

5. TERMINATION
   Either party may terminate this Agreement upon 30 days prior written notice.
   The right to terminate for material breach is preserved.

6. GOVERNING LAW
   This Agreement shall be governed by and construed in accordance with the
   laws of the Province of Ontario and the jurisdiction of Canadian courts.

7. INTELLECTUAL PROPERTY
   All work product and intellectual property created under this Agreement
   shall be the sole property of the Client. The Service Provider hereby assigns
   all right, title, and interest.

8. FORCE MAJEURE
   Neither party shall be liable for failure to perform due to force majeure
   events or acts of God beyond reasonable control.

9. ASSIGNMENT
   Neither party may assign this Agreement without the prior written consent
   of the other party.

10. DISPUTE RESOLUTION
    Any dispute arising out of this Agreement shall be resolved through
    binding arbitration in Ontario.

11. ENTIRE AGREEMENT
    This Agreement constitutes the entire agreement and supersedes all prior
    agreements between the parties.

12. DATA PROTECTION
    Each party shall comply with applicable data protection laws including
    PIPEDA and protect all personal information accordingly.
"""

MINIMAL_CONTRACT = """
SIMPLE AGREEMENT

Party A agrees to provide services to Party B.
Party B agrees to pay Party A $5000.
This agreement is valid for 12 months.
"""

MISSING_PROTECTION_CONTRACT = """
SERVICE AGREEMENT

1. CONFIDENTIALITY
   All information shared between parties is confidential.
   Confidential information shall not be disclosed.

2. NON-COMPETE
   The contractor shall not compete with the company for 2 years.

3. INDEMNIFICATION
   The contractor shall indemnify the company against all claims.
"""


class TestClauseExtraction:
    def test_full_contract_detects_all_clauses(self):
        clauses = ContractService.extract_clauses(FULL_CONTRACT)
        types = {c["clause_type"] for c in clauses}
        assert "confidentiality" in types
        assert "non_compete" in types
        assert "indemnification" in types
        assert "limitation_of_liability" in types
        assert "termination" in types
        assert "governing_law" in types
        assert "intellectual_property" in types
        assert "force_majeure" in types
        assert "assignment" in types
        assert "dispute_resolution" in types
        assert "entire_agreement" in types
        assert "data_protection" in types

    def test_minimal_contract_detects_few_clauses(self):
        clauses = ContractService.extract_clauses(MINIMAL_CONTRACT)
        assert len(clauses) < 3

    def test_clause_has_required_fields(self):
        clauses = ContractService.extract_clauses(FULL_CONTRACT)
        for clause in clauses:
            assert "clause_type" in clause
            assert "name" in clause
            assert "risk_level" in clause
            assert "excerpt" in clause

    def test_each_clause_reported_once(self):
        clauses = ContractService.extract_clauses(FULL_CONTRACT)
        types = [c["clause_type"] for c in clauses]
        assert len(types) == len(set(types))

    def test_excerpt_contains_context(self):
        clauses = ContractService.extract_clauses(FULL_CONTRACT)
        conf_clause = next(c for c in clauses if c["clause_type"] == "confidentiality")
        assert len(conf_clause["excerpt"]) > 20


class TestRiskScoring:
    def test_full_contract_low_risk(self):
        clauses = ContractService.extract_clauses(FULL_CONTRACT)
        missing = ContractService.detect_missing_clauses(clauses)
        score = ContractService.score_risk(clauses, missing, FULL_CONTRACT)
        assert score < 0.3  # Should be low risk

    def test_minimal_contract_higher_risk(self):
        clauses = ContractService.extract_clauses(MINIMAL_CONTRACT)
        missing = ContractService.detect_missing_clauses(clauses)
        score = ContractService.score_risk(clauses, missing, MINIMAL_CONTRACT)
        assert score > 0.3  # Should be higher risk

    def test_missing_clauses_increase_risk(self):
        clauses = ContractService.extract_clauses(MISSING_PROTECTION_CONTRACT)
        missing = ContractService.detect_missing_clauses(clauses)
        score = ContractService.score_risk(clauses, missing, MISSING_PROTECTION_CONTRACT)
        assert len(missing) > 0
        assert score > 0.0

    def test_risk_score_bounded(self):
        clauses = ContractService.extract_clauses("")
        missing = ContractService.detect_missing_clauses(clauses)
        score = ContractService.score_risk(clauses, missing, "")
        assert 0.0 <= score <= 1.0

    def test_risk_score_max_1(self):
        """Even with everything bad, score should not exceed 1.0."""
        score = ContractService.score_risk([], list({"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"}), "short")
        assert score <= 1.0


class TestMissingClauseDetection:
    def test_full_contract_no_missing_essentials(self):
        clauses = ContractService.extract_clauses(FULL_CONTRACT)
        missing = ContractService.detect_missing_clauses(clauses)
        assert len(missing) == 0

    def test_minimal_contract_missing_essentials(self):
        clauses = ContractService.extract_clauses(MINIMAL_CONTRACT)
        missing = ContractService.detect_missing_clauses(clauses)
        assert "confidentiality" in missing or "termination" in missing or "governing_law" in missing

    def test_missing_returns_sorted_list(self):
        clauses = ContractService.extract_clauses(MINIMAL_CONTRACT)
        missing = ContractService.detect_missing_clauses(clauses)
        assert missing == sorted(missing)
