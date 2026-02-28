"""
Provincial Nominee Program (PNP) matcher.

Rule-based matching of CRS profiles to eligible immigration programs.
No AI involvement -- pure deterministic logic.
"""

from app.data.immigration_programs import IMMIGRATION_PROGRAMS
from app.schemas.immigration import CRSInput


class PNPMatcher:
    """Matches applicant profiles to eligible immigration programs."""

    @staticmethod
    def _get_min_clb(scores) -> int:
        if scores is None:
            return 0
        return min(scores.speaking, scores.listening, scores.reading, scores.writing)

    @classmethod
    def match_programs(cls, crs_score: int, profile: CRSInput) -> list[dict]:
        """
        Match an applicant's profile to eligible immigration programs.

        Args:
            crs_score: The applicant's total CRS score.
            profile: The applicant's full CRS input data.

        Returns:
            List of matching programs with name, province, and match reason.
        """
        matches = []
        min_first_clb = cls._get_min_clb(profile.first_language)

        for program in IMMIGRATION_PROGRAMS:
            name = program["name"]
            reqs = program["requirements"]
            reasons = []

            # ── Federal Skilled Worker ────────────────────────
            if "Federal Skilled Worker" in name:
                if min_first_clb < 7:
                    continue
                min_work = reqs.get("minimum_work_experience_years", 0)
                if profile.foreign_work_experience_years < min_work and profile.canadian_work_experience_years < min_work:
                    continue
                if profile.education_level in ("none",):
                    continue
                reasons.append("Meets language requirement (CLB 7+)")
                reasons.append("Meets work experience requirement")

            # ── Canadian Experience Class ─────────────────────
            elif "Canadian Experience Class" in name:
                if profile.canadian_work_experience_years < 1:
                    continue
                # CEC CLB requirement depends on NOC TEER
                if min_first_clb < 5:
                    continue
                reasons.append("Has Canadian work experience")
                if min_first_clb >= 7:
                    reasons.append("Qualifies for NOC TEER 0/1 occupations (CLB 7+)")
                else:
                    reasons.append("Qualifies for NOC TEER 2/3 occupations (CLB 5+)")

            # ── Federal Skilled Trades ────────────────────────
            elif "Federal Skilled Trades" in name:
                if not profile.has_certificate_of_qualification:
                    continue
                speaking_listening_min = min(
                    profile.first_language.speaking if profile.first_language else 0,
                    profile.first_language.listening if profile.first_language else 0,
                )
                if speaking_listening_min < 5:
                    continue
                reasons.append("Has certificate of qualification")
                reasons.append("Meets speaking/listening CLB requirement")

            # ── Ontario HCP ───────────────────────────────────
            elif "Ontario" in program["province"] and "Human Capital" in name:
                min_crs = program.get("min_crs_score") or 400
                if crs_score < min_crs:
                    continue
                if min_first_clb < 7:
                    continue
                if profile.education_level not in ("bachelors", "two_or_more_post_secondary", "masters", "phd"):
                    continue
                reasons.append(f"CRS score {crs_score} meets minimum {min_crs}")
                reasons.append("Meets education requirement (bachelor's+)")
                reasons.append("Meets language requirement (CLB 7+)")

            # ── BC PNP Tech ───────────────────────────────────
            elif "British Columbia" in program["province"] and "Tech" in name:
                # BC PNP Tech requires a valid job offer
                if profile.job_offer_noc_level is None:
                    continue
                total_work = profile.canadian_work_experience_years + profile.foreign_work_experience_years
                if total_work < 2:
                    continue
                reasons.append("Has a qualifying job offer")
                reasons.append("Meets work experience requirement (2+ years)")

            # ── Alberta AAIP ──────────────────────────────────
            elif "Alberta" in program["province"]:
                min_crs = 300
                if crs_score < min_crs:
                    continue
                if min_first_clb < 5:
                    continue
                reasons.append(f"CRS score {crs_score} meets Alberta minimum {min_crs}")

            # ── Saskatchewan SINP ─────────────────────────────
            elif "Saskatchewan" in program["province"]:
                if min_first_clb < 7:
                    continue
                if profile.education_level in ("none", "high_school"):
                    continue
                total_work = profile.canadian_work_experience_years + profile.foreign_work_experience_years
                if total_work < 1:
                    continue
                reasons.append("Meets language requirement (CLB 7+)")
                reasons.append("Has post-secondary education")

            # ── Nova Scotia ───────────────────────────────────
            elif "Nova Scotia" in program["province"]:
                if min_first_clb < 7:
                    continue
                if profile.education_level in ("none", "high_school"):
                    continue
                total_work = profile.canadian_work_experience_years + profile.foreign_work_experience_years
                if total_work < 1:
                    continue
                reasons.append("Meets language requirement (CLB 7+)")
                reasons.append("Invitation-based; profile may be considered")

            else:
                continue

            if reasons:
                matches.append({
                    "name": name,
                    "province": program["province"],
                    "program_type": program["program_type"],
                    "match_reasons": reasons,
                })

        return matches
