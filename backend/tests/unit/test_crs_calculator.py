"""
Unit tests for the CRS Calculator.

Tests cover age scoring, education scoring, language scoring,
work experience, skill transferability, additional points,
full calculation, and edge cases.
"""

import pytest

from app.schemas.immigration import CRSInput, LanguageScores
from app.services.crs_calculator import CRSCalculator


# ── Helpers ───────────────────────────────────────────────────

def make_crs_input(**overrides) -> CRSInput:
    """Create a CRSInput with sensible defaults, overridden by kwargs."""
    defaults = {
        "age": 28,
        "has_spouse": False,
        "education_level": "bachelors",
        "first_language": LanguageScores(speaking=9, listening=9, reading=9, writing=9),
        "second_language": None,
        "canadian_work_experience_years": 0,
        "foreign_work_experience_years": 0,
        "spouse_education_level": None,
        "spouse_first_language": None,
        "spouse_canadian_work_experience_years": 0,
        "has_certificate_of_qualification": False,
        "has_provincial_nomination": False,
        "job_offer_noc_level": None,
        "canadian_education_years": 0,
        "has_sibling_in_canada": False,
        "french_clb7_plus": False,
        "english_clb5_plus": False,
    }
    defaults.update(overrides)
    return CRSInput(**defaults)


# ── Age Points ────────────────────────────────────────────────

class TestAgePoints:
    def test_age_20_single_max_points(self):
        assert CRSCalculator.calculate_age_points(20, has_spouse=False) == 110

    def test_age_29_single_max_points(self):
        assert CRSCalculator.calculate_age_points(29, has_spouse=False) == 110

    def test_age_20_with_spouse(self):
        assert CRSCalculator.calculate_age_points(20, has_spouse=True) == 100

    def test_age_30_single_declining(self):
        assert CRSCalculator.calculate_age_points(30, has_spouse=False) == 105

    def test_age_40_single(self):
        assert CRSCalculator.calculate_age_points(40, has_spouse=False) == 50

    def test_age_45_zero_points(self):
        assert CRSCalculator.calculate_age_points(45, has_spouse=False) == 0

    def test_age_over_45_zero_points(self):
        assert CRSCalculator.calculate_age_points(46, has_spouse=False) == 0

    def test_age_under_17_zero_points(self):
        assert CRSCalculator.calculate_age_points(16, has_spouse=False) == 0

    def test_age_18_single(self):
        assert CRSCalculator.calculate_age_points(18, has_spouse=False) == 99

    def test_age_44_single(self):
        assert CRSCalculator.calculate_age_points(44, has_spouse=False) == 6


# ── Education Points ─────────────────────────────────────────

class TestEducationPoints:
    def test_phd_single(self):
        assert CRSCalculator.calculate_education_points("phd", has_spouse=False) == 150

    def test_masters_single(self):
        assert CRSCalculator.calculate_education_points("masters", has_spouse=False) == 135

    def test_bachelors_single(self):
        assert CRSCalculator.calculate_education_points("bachelors", has_spouse=False) == 120

    def test_high_school_single(self):
        assert CRSCalculator.calculate_education_points("high_school", has_spouse=False) == 30

    def test_none_education(self):
        assert CRSCalculator.calculate_education_points("none", has_spouse=False) == 0

    def test_phd_with_spouse(self):
        assert CRSCalculator.calculate_education_points("phd", has_spouse=True) == 140

    def test_bachelors_with_spouse(self):
        assert CRSCalculator.calculate_education_points("bachelors", has_spouse=True) == 112

    def test_unknown_education_level(self):
        assert CRSCalculator.calculate_education_points("unknown_level", has_spouse=False) == 0


# ── Language Points ───────────────────────────────────────────

class TestLanguagePoints:
    def test_first_language_clb10_single(self):
        scores = LanguageScores(speaking=10, listening=10, reading=10, writing=10)
        pts = CRSCalculator.calculate_language_points(scores, is_first=True, has_spouse=False)
        assert pts == 136  # 34 * 4

    def test_first_language_clb9_single(self):
        scores = LanguageScores(speaking=9, listening=9, reading=9, writing=9)
        pts = CRSCalculator.calculate_language_points(scores, is_first=True, has_spouse=False)
        assert pts == 124  # 31 * 4

    def test_first_language_clb7_single(self):
        scores = LanguageScores(speaking=7, listening=7, reading=7, writing=7)
        pts = CRSCalculator.calculate_language_points(scores, is_first=True, has_spouse=False)
        assert pts == 68  # 17 * 4

    def test_first_language_clb4_single(self):
        scores = LanguageScores(speaking=4, listening=4, reading=4, writing=4)
        pts = CRSCalculator.calculate_language_points(scores, is_first=True, has_spouse=False)
        assert pts == 24  # 6 * 4

    def test_none_language(self):
        pts = CRSCalculator.calculate_language_points(None, is_first=True, has_spouse=False)
        assert pts == 0

    def test_second_language_clb9_single(self):
        scores = LanguageScores(speaking=9, listening=9, reading=9, writing=9)
        pts = CRSCalculator.calculate_language_points(scores, is_first=False, has_spouse=False)
        assert pts == 24  # 6 * 4

    def test_mixed_clb_levels(self):
        scores = LanguageScores(speaking=10, listening=8, reading=7, writing=9)
        pts = CRSCalculator.calculate_language_points(scores, is_first=True, has_spouse=False)
        # speaking=34, listening=23, reading=17, writing=31
        assert pts == 105

    def test_first_language_with_spouse_clb10(self):
        scores = LanguageScores(speaking=10, listening=10, reading=10, writing=10)
        pts = CRSCalculator.calculate_language_points(scores, is_first=True, has_spouse=True)
        assert pts == 128  # 32 * 4


# ── Canadian Work Experience Points ──────────────────────────

class TestWorkExperiencePoints:
    def test_zero_years_single(self):
        assert CRSCalculator.calculate_canadian_work_experience_points(0, has_spouse=False) == 0

    def test_one_year_single(self):
        assert CRSCalculator.calculate_canadian_work_experience_points(1, has_spouse=False) == 40

    def test_five_years_single(self):
        assert CRSCalculator.calculate_canadian_work_experience_points(5, has_spouse=False) == 80

    def test_three_years_with_spouse(self):
        assert CRSCalculator.calculate_canadian_work_experience_points(3, has_spouse=True) == 56

    def test_clamped_at_five(self):
        assert CRSCalculator.calculate_canadian_work_experience_points(10, has_spouse=False) == 80


# ── Skill Transferability ────────────────────────────────────

class TestSkillTransferability:
    def test_education_and_language_bachelors_clb9(self):
        data = make_crs_input(education_level="bachelors",
                              first_language=LanguageScores(speaking=9, listening=9, reading=9, writing=9))
        pts = CRSCalculator.calculate_skill_transferability(data)
        assert pts == 25  # bachelors + clb9 = 25

    def test_education_and_language_masters_clb9(self):
        data = make_crs_input(education_level="masters",
                              first_language=LanguageScores(speaking=9, listening=9, reading=9, writing=9))
        pts = CRSCalculator.calculate_skill_transferability(data)
        assert pts == 50  # masters + clb9 = 50

    def test_education_and_work_bachelors_2years(self):
        data = make_crs_input(education_level="bachelors",
                              first_language=LanguageScores(speaking=5, listening=5, reading=5, writing=5),
                              canadian_work_experience_years=2)
        pts = CRSCalculator.calculate_skill_transferability(data)
        # education+work: bachelors+2yr = 25, no language combo (CLB < 7)
        assert pts == 25

    def test_capped_at_100(self):
        data = make_crs_input(
            education_level="masters",
            first_language=LanguageScores(speaking=10, listening=10, reading=10, writing=10),
            canadian_work_experience_years=3,
            foreign_work_experience_years=3,
            has_certificate_of_qualification=True,
        )
        pts = CRSCalculator.calculate_skill_transferability(data)
        assert pts <= 100

    def test_no_transferability_low_education(self):
        data = make_crs_input(education_level="high_school",
                              first_language=LanguageScores(speaking=5, listening=5, reading=5, writing=5))
        pts = CRSCalculator.calculate_skill_transferability(data)
        assert pts == 0


# ── Additional Points ────────────────────────────────────────

class TestAdditionalPoints:
    def test_provincial_nomination(self):
        data = make_crs_input(has_provincial_nomination=True)
        pts = CRSCalculator.calculate_additional_points(data)
        assert pts == 600

    def test_job_offer_noc_00(self):
        data = make_crs_input(job_offer_noc_level="noc_00")
        pts = CRSCalculator.calculate_additional_points(data)
        assert pts == 200

    def test_job_offer_other(self):
        data = make_crs_input(job_offer_noc_level="other")
        pts = CRSCalculator.calculate_additional_points(data)
        assert pts == 50

    def test_canadian_education_3_years(self):
        data = make_crs_input(canadian_education_years=3)
        pts = CRSCalculator.calculate_additional_points(data)
        assert pts == 30

    def test_canadian_education_1_year(self):
        data = make_crs_input(canadian_education_years=1)
        pts = CRSCalculator.calculate_additional_points(data)
        assert pts == 15

    def test_sibling_in_canada(self):
        data = make_crs_input(has_sibling_in_canada=True)
        pts = CRSCalculator.calculate_additional_points(data)
        assert pts == 15

    def test_french_with_english(self):
        data = make_crs_input(french_clb7_plus=True, english_clb5_plus=True)
        pts = CRSCalculator.calculate_additional_points(data)
        assert pts == 50

    def test_french_without_english(self):
        data = make_crs_input(french_clb7_plus=True, english_clb5_plus=False)
        pts = CRSCalculator.calculate_additional_points(data)
        assert pts == 25


# ── Full Calculation ─────────────────────────────────────────

class TestFullCalculation:
    def test_strong_single_applicant(self):
        """A strong single applicant: age 28, masters, CLB 10, 3yr Canadian work."""
        data = make_crs_input(
            age=28,
            has_spouse=False,
            education_level="masters",
            first_language=LanguageScores(speaking=10, listening=10, reading=10, writing=10),
            canadian_work_experience_years=3,
        )
        result = CRSCalculator.calculate(data)
        # Core: 110(age) + 135(edu) + 136(lang) + 64(work) = 445
        assert result.breakdown.core_human_capital > 400
        assert result.total_score > 400

    def test_minimal_applicant(self):
        """Minimal applicant: age 45, high school, CLB 4, no work."""
        data = make_crs_input(
            age=45,
            education_level="high_school",
            first_language=LanguageScores(speaking=4, listening=4, reading=4, writing=4),
            canadian_work_experience_years=0,
        )
        result = CRSCalculator.calculate(data)
        # Core: 0(age) + 30(edu) + 24(lang) + 0(work) = 54
        assert result.breakdown.core_human_capital < 100
        assert result.total_score < 100

    def test_with_provincial_nomination(self):
        """Provincial nomination should add 600 points."""
        data = make_crs_input(has_provincial_nomination=True)
        result = CRSCalculator.calculate(data)
        assert result.breakdown.additional_points == 600
        assert result.total_score >= 600

    def test_score_has_all_sections(self):
        """Verify the total is the sum of all breakdown sections."""
        data = make_crs_input(
            age=25,
            has_spouse=True,
            education_level="masters",
            first_language=LanguageScores(speaking=9, listening=9, reading=9, writing=9),
            canadian_work_experience_years=2,
            foreign_work_experience_years=2,
            spouse_education_level="bachelors",
            spouse_first_language=LanguageScores(speaking=7, listening=7, reading=7, writing=7),
            spouse_canadian_work_experience_years=1,
        )
        result = CRSCalculator.calculate(data)
        expected_total = (
            result.breakdown.core_human_capital
            + result.breakdown.spouse_factors
            + result.breakdown.skill_transferability
            + result.breakdown.additional_points
        )
        assert result.total_score == expected_total

    def test_spouse_factors_zero_when_single(self):
        data = make_crs_input(has_spouse=False)
        result = CRSCalculator.calculate(data)
        assert result.breakdown.spouse_factors == 0

    def test_eligible_programs_initially_empty(self):
        """CRSCalculator.calculate returns empty eligible_programs (PNPMatcher fills them)."""
        data = make_crs_input()
        result = CRSCalculator.calculate(data)
        assert result.eligible_programs == []
