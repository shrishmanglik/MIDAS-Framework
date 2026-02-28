"""
Fully deterministic CRS (Comprehensive Ranking System) calculator.

Uses lookup tables from app.data.crs_rules. Matches published IRCC formulas.
No AI involvement -- pure Python computation.
"""

from app.data.crs_rules import (
    ADDITIONAL_POINTS,
    AGE_POINTS,
    CANADIAN_WORK_EXPERIENCE_POINTS,
    CERTIFICATE_LANGUAGE_TRANSFER,
    EDUCATION_LANGUAGE_TRANSFER,
    EDUCATION_POINTS,
    EDUCATION_WORK_TRANSFER,
    FIRST_LANGUAGE_POINTS_SINGLE,
    FIRST_LANGUAGE_POINTS_WITH_SPOUSE,
    FOREIGN_CANADIAN_WORK_TRANSFER,
    FOREIGN_WORK_LANGUAGE_TRANSFER,
    MAX_ADDITIONAL_POINTS,
    MAX_CORE_HUMAN_CAPITAL_SINGLE,
    MAX_CORE_HUMAN_CAPITAL_WITH_SPOUSE,
    MAX_SKILL_TRANSFERABILITY,
    MAX_SPOUSE_FACTORS,
    SECOND_LANGUAGE_POINTS_SINGLE,
    SECOND_LANGUAGE_POINTS_WITH_SPOUSE,
    SPOUSE_CANADIAN_WORK_EXPERIENCE_POINTS,
    SPOUSE_EDUCATION_POINTS,
    SPOUSE_LANGUAGE_POINTS,
)
from app.schemas.immigration import CRSBreakdown, CRSInput, CRSResult, LanguageScores


class CRSCalculator:
    """Deterministic CRS score calculator based on official IRCC rules."""

    # ── Section A: Core / Human Capital Factors ───────────────

    @staticmethod
    def calculate_age_points(age: int, has_spouse: bool) -> int:
        """Calculate age-based points. Max 110 (single) or 100 (with spouse)."""
        if age < 17 or age > 45:
            return 0
        entry = AGE_POINTS.get(age, (0, 0))
        return entry[1] if has_spouse else entry[0]

    @staticmethod
    def calculate_education_points(level: str, has_spouse: bool) -> int:
        """Calculate education points. Max 150 (single) or 140 (with spouse)."""
        entry = EDUCATION_POINTS.get(level, (0, 0))
        return entry[1] if has_spouse else entry[0]

    @staticmethod
    def calculate_language_points(
        scores: LanguageScores | None,
        is_first: bool,
        has_spouse: bool,
    ) -> int:
        """
        Calculate language points for one language (first or second).

        For the first language: each ability scored individually based on CLB level.
        For the second language: same structure with different point values.
        Max per ability varies by table.
        """
        if scores is None:
            return 0

        total = 0
        abilities = [scores.speaking, scores.listening, scores.reading, scores.writing]

        for clb_level in abilities:
            # Clamp CLB to the table range
            clamped = min(clb_level, 10)

            if is_first:
                table = FIRST_LANGUAGE_POINTS_WITH_SPOUSE if has_spouse else FIRST_LANGUAGE_POINTS_SINGLE
            else:
                table = SECOND_LANGUAGE_POINTS_WITH_SPOUSE if has_spouse else SECOND_LANGUAGE_POINTS_SINGLE

            # Find the best matching key (exact or the highest key <= clamped)
            points = 0
            for key in sorted(table.keys()):
                if key <= clamped:
                    points = table[key]
            total += points

        return total

    @staticmethod
    def calculate_canadian_work_experience_points(years: int, has_spouse: bool) -> int:
        """Calculate Canadian work experience points. Max 80 (single) or 70 (with spouse)."""
        clamped = min(years, 5)
        entry = CANADIAN_WORK_EXPERIENCE_POINTS.get(clamped, (0, 0))
        return entry[1] if has_spouse else entry[0]

    # ── Section B: Spouse Factors ─────────────────────────────

    @staticmethod
    def calculate_spouse_education_points(level: str | None) -> int:
        """Spouse education points. Max 10."""
        if level is None:
            return 0
        return SPOUSE_EDUCATION_POINTS.get(level, 0)

    @staticmethod
    def calculate_spouse_language_points(scores: LanguageScores | None) -> int:
        """Spouse first language points. Max 20 (5 per ability)."""
        if scores is None:
            return 0

        total = 0
        abilities = [scores.speaking, scores.listening, scores.reading, scores.writing]
        for clb_level in abilities:
            clamped = min(clb_level, 10)
            points = 0
            for key in sorted(SPOUSE_LANGUAGE_POINTS.keys()):
                if key <= clamped:
                    points = SPOUSE_LANGUAGE_POINTS[key]
            total += points
        return total

    @staticmethod
    def calculate_spouse_work_experience_points(years: int) -> int:
        """Spouse Canadian work experience points. Max 10."""
        clamped = min(years, 5)
        return SPOUSE_CANADIAN_WORK_EXPERIENCE_POINTS.get(clamped, 0)

    # ── Section C: Skill Transferability ──────────────────────

    @staticmethod
    def _get_min_clb(scores: LanguageScores | None) -> int:
        """Get the minimum CLB level across all four abilities."""
        if scores is None:
            return 0
        return min(scores.speaking, scores.listening, scores.reading, scores.writing)

    @classmethod
    def calculate_skill_transferability(cls, input_data: CRSInput) -> int:
        """
        Calculate skill transferability points (Section C).
        Capped at 100 total. Two sub-categories, each capped at 50.
        """
        education_group = 0  # education+language and education+work (max 50 combined)
        foreign_group = 0    # foreign work+language and foreign work+canadian work (max 50 combined)

        min_first_clb = cls._get_min_clb(input_data.first_language)
        education = input_data.education_level
        canadian_years = input_data.canadian_work_experience_years
        foreign_years = input_data.foreign_work_experience_years

        # ── Education + Language ──────────────────────────────
        if education in EDUCATION_LANGUAGE_TRANSFER and min_first_clb >= 7:
            transfer_table = EDUCATION_LANGUAGE_TRANSFER[education]
            if min_first_clb >= 9:
                education_group += transfer_table.get("clb_9", 0)
            else:
                education_group += transfer_table.get("clb_7", 0)

        # ── Education + Canadian Work Experience ──────────────
        if education in EDUCATION_WORK_TRANSFER and canadian_years >= 1:
            transfer_table = EDUCATION_WORK_TRANSFER[education]
            if canadian_years >= 2:
                education_group += transfer_table.get("2_years", 0)
            else:
                education_group += transfer_table.get("1_year", 0)

        education_group = min(education_group, 50)

        # ── Foreign Work Experience + Language ────────────────
        if foreign_years >= 1 and min_first_clb >= 7:
            if foreign_years >= 3:
                fkey = "3_plus_years"
            else:
                fkey = "1_2_years"
            transfer_table = FOREIGN_WORK_LANGUAGE_TRANSFER.get(fkey, {})
            if min_first_clb >= 9:
                foreign_group += transfer_table.get("clb_9", 0)
            else:
                foreign_group += transfer_table.get("clb_7", 0)

        # ── Foreign Work Experience + Canadian Work Experience ─
        if foreign_years >= 1 and canadian_years >= 1:
            if foreign_years >= 3:
                fkey = "3_plus_years"
            else:
                fkey = "1_2_years"
            transfer_table = FOREIGN_CANADIAN_WORK_TRANSFER.get(fkey, {})
            if canadian_years >= 2:
                foreign_group += transfer_table.get("2_years", 0)
            else:
                foreign_group += transfer_table.get("1_year", 0)

        foreign_group = min(foreign_group, 50)

        # ── Certificate of Qualification + Language ───────────
        certificate_points = 0
        if input_data.has_certificate_of_qualification and min_first_clb >= 5:
            if min_first_clb >= 7:
                certificate_points = CERTIFICATE_LANGUAGE_TRANSFER.get("clb_7", 0)
            else:
                certificate_points = CERTIFICATE_LANGUAGE_TRANSFER.get("clb_5", 0)
        certificate_points = min(certificate_points, 50)

        total = education_group + foreign_group + certificate_points
        return min(total, MAX_SKILL_TRANSFERABILITY)

    # ── Section D: Additional Points ──────────────────────────

    @staticmethod
    def calculate_additional_points(input_data: CRSInput) -> int:
        """Calculate additional points (Section D). Max 600."""
        total = 0

        if input_data.has_provincial_nomination:
            total += ADDITIONAL_POINTS["provincial_nomination"]

        if input_data.job_offer_noc_level == "noc_00":
            total += ADDITIONAL_POINTS["job_offer_noc_00"]
        elif input_data.job_offer_noc_level == "other":
            total += ADDITIONAL_POINTS["job_offer_other"]

        if input_data.canadian_education_years >= 3:
            total += ADDITIONAL_POINTS["canadian_education_3_plus_years"]
        elif input_data.canadian_education_years >= 1:
            total += ADDITIONAL_POINTS["canadian_education_1_2_years"]

        # French language bonus
        if input_data.french_clb7_plus:
            if input_data.english_clb5_plus:
                total += ADDITIONAL_POINTS["french_proficiency_clb7_english_clb5"]
            else:
                total += ADDITIONAL_POINTS["french_proficiency_clb7_english_clb4"]

        if input_data.has_sibling_in_canada:
            total += ADDITIONAL_POINTS["sibling_in_canada"]

        return min(total, MAX_ADDITIONAL_POINTS)

    # ── Full Calculation ──────────────────────────────────────

    @classmethod
    def calculate(cls, input_data: CRSInput) -> CRSResult:
        """
        Calculate the complete CRS score.

        Returns total score with breakdown into:
        - Core / Human Capital factors (Section A)
        - Spouse factors (Section B) — if applicable
        - Skill Transferability (Section C)
        - Additional points (Section D)
        """
        has_spouse = input_data.has_spouse

        # ── Section A: Core Human Capital ─────────────────────
        age_pts = cls.calculate_age_points(input_data.age, has_spouse)
        edu_pts = cls.calculate_education_points(input_data.education_level, has_spouse)
        first_lang_pts = cls.calculate_language_points(input_data.first_language, is_first=True, has_spouse=has_spouse)
        second_lang_pts = cls.calculate_language_points(
            input_data.second_language, is_first=False, has_spouse=has_spouse
        )
        work_pts = cls.calculate_canadian_work_experience_points(input_data.canadian_work_experience_years, has_spouse)

        core_max = MAX_CORE_HUMAN_CAPITAL_WITH_SPOUSE if has_spouse else MAX_CORE_HUMAN_CAPITAL_SINGLE
        core_human_capital = min(age_pts + edu_pts + first_lang_pts + second_lang_pts + work_pts, core_max)

        # ── Section B: Spouse Factors ─────────────────────────
        spouse_factors = 0
        if has_spouse:
            sp_edu = cls.calculate_spouse_education_points(input_data.spouse_education_level)
            sp_lang = cls.calculate_spouse_language_points(input_data.spouse_first_language)
            sp_work = cls.calculate_spouse_work_experience_points(input_data.spouse_canadian_work_experience_years)
            spouse_factors = min(sp_edu + sp_lang + sp_work, MAX_SPOUSE_FACTORS)

        # ── Section C: Skill Transferability ──────────────────
        skill_transferability = cls.calculate_skill_transferability(input_data)

        # ── Section D: Additional Points ──────────────────────
        additional = cls.calculate_additional_points(input_data)

        total_score = core_human_capital + spouse_factors + skill_transferability + additional

        breakdown = CRSBreakdown(
            core_human_capital=core_human_capital,
            spouse_factors=spouse_factors,
            skill_transferability=skill_transferability,
            additional_points=additional,
        )

        return CRSResult(
            total_score=total_score,
            breakdown=breakdown,
            eligible_programs=[],  # Will be populated by PNPMatcher
        )
