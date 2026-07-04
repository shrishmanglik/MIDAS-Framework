"""
Unit tests for the PNP Matcher service.
"""

import pytest

from app.schemas.immigration import CRSInput, LanguageScores
from app.services.pnp_matcher import PNPMatcher


def make_crs_input(**overrides) -> CRSInput:
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


class TestPNPMatcher:
    def test_fsw_eligible_with_high_clb_and_work(self):
        """FSW requires CLB 7+ and at least 1 year work experience."""
        profile = make_crs_input(
            first_language=LanguageScores(speaking=8, listening=8, reading=8, writing=8),
            foreign_work_experience_years=2,
        )
        matches = PNPMatcher.match_programs(450, profile)
        names = [m["name"] for m in matches]
        assert any("Federal Skilled Worker" in n for n in names)

    def test_cec_eligible_with_canadian_experience(self):
        """CEC requires 1+ year Canadian work experience."""
        profile = make_crs_input(
            canadian_work_experience_years=2,
            first_language=LanguageScores(speaking=7, listening=7, reading=7, writing=7),
        )
        matches = PNPMatcher.match_programs(400, profile)
        names = [m["name"] for m in matches]
        assert any("Canadian Experience Class" in n for n in names)

    def test_cec_ineligible_without_canadian_experience(self):
        """CEC should not match without Canadian work experience."""
        profile = make_crs_input(
            canadian_work_experience_years=0,
            foreign_work_experience_years=3,
        )
        matches = PNPMatcher.match_programs(400, profile)
        names = [m["name"] for m in matches]
        assert not any("Canadian Experience Class" in n for n in names)

    def test_ontario_hcp_requires_high_crs_and_bachelors(self):
        """Ontario HCP requires CRS 400+, CLB 7+, and bachelor's+."""
        profile = make_crs_input(
            education_level="bachelors",
            first_language=LanguageScores(speaking=8, listening=8, reading=8, writing=8),
        )
        matches = PNPMatcher.match_programs(450, profile)
        names = [m["name"] for m in matches]
        assert any("Ontario" in n for n in names)

    def test_ontario_hcp_ineligible_low_crs(self):
        """Ontario HCP should not match with CRS below 400."""
        profile = make_crs_input(education_level="bachelors")
        matches = PNPMatcher.match_programs(350, profile)
        names = [m["name"] for m in matches]
        assert not any("Ontario" in n and "Human Capital" in n for n in names)

    def test_bc_pnp_tech_requires_job_offer(self):
        """BC PNP Tech requires a job offer and 2+ years work experience."""
        profile = make_crs_input(
            job_offer_noc_level="other",
            canadian_work_experience_years=1,
            foreign_work_experience_years=2,
        )
        matches = PNPMatcher.match_programs(400, profile)
        names = [m["name"] for m in matches]
        assert any("British Columbia" in n for n in names)

    def test_bc_pnp_tech_no_job_offer_excluded(self):
        """BC PNP Tech should not match without a job offer."""
        profile = make_crs_input(
            job_offer_noc_level=None,
            canadian_work_experience_years=3,
        )
        matches = PNPMatcher.match_programs(400, profile)
        names = [m["name"] for m in matches]
        assert not any("British Columbia" in n and "Tech" in n for n in names)

    def test_fstp_requires_certificate(self):
        """Federal Skilled Trades requires a certificate of qualification."""
        profile = make_crs_input(
            has_certificate_of_qualification=True,
            first_language=LanguageScores(speaking=6, listening=6, reading=5, writing=5),
        )
        matches = PNPMatcher.match_programs(300, profile)
        names = [m["name"] for m in matches]
        assert any("Skilled Trades" in n for n in names)

    def test_low_clb_excludes_most_programs(self):
        """Very low CLB scores should exclude most programs."""
        profile = make_crs_input(
            first_language=LanguageScores(speaking=3, listening=3, reading=3, writing=3),
            education_level="high_school",
        )
        matches = PNPMatcher.match_programs(200, profile)
        assert len(matches) == 0
