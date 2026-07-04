"""
Comprehensive Ranking System (CRS) scoring rules based on published IRCC formulas.

Reference: https://www.canada.ca/en/immigration-refugees-citizenship/services/
           immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system/grid.html

All point values correspond to the official CRS grid as of 2024.
"""

# ─── Section A: Core / Human Capital Factors ──────────────────────────────────

# Age points: age -> (single_points, with_spouse_points)
AGE_POINTS: dict[int, tuple[int, int]] = {
    17: (0, 0),
    18: (99, 90),
    19: (105, 95),
    20: (110, 100),
    21: (110, 100),
    22: (110, 100),
    23: (110, 100),
    24: (110, 100),
    25: (110, 100),
    26: (110, 100),
    27: (110, 100),
    28: (110, 100),
    29: (110, 100),
    30: (105, 95),
    31: (99, 90),
    32: (94, 85),
    33: (88, 80),
    34: (83, 75),
    35: (77, 70),
    36: (72, 65),
    37: (66, 60),
    38: (61, 55),
    39: (55, 50),
    40: (50, 45),
    41: (39, 35),
    42: (28, 25),
    43: (17, 15),
    44: (6, 5),
    45: (0, 0),
}

# Education level -> (single_points, with_spouse_points)
EDUCATION_POINTS: dict[str, tuple[int, int]] = {
    "none": (0, 0),
    "high_school": (30, 28),
    "one_year_post_secondary": (90, 84),
    "two_year_post_secondary": (98, 91),
    "bachelors": (120, 112),
    "two_or_more_post_secondary": (128, 119),
    "masters": (135, 126),
    "phd": (150, 140),
}

# First official language: CLB level -> points per ability (speaking, listening, reading, writing)
# Single applicant
FIRST_LANGUAGE_POINTS_SINGLE: dict[int, int] = {
    3: 0,
    4: 6,
    5: 6,
    6: 9,
    7: 17,
    8: 23,
    9: 31,
    10: 34,
}

# First official language with spouse
FIRST_LANGUAGE_POINTS_WITH_SPOUSE: dict[int, int] = {
    3: 0,
    4: 6,
    5: 6,
    6: 8,
    7: 16,
    8: 22,
    9: 29,
    10: 32,
}

# Second official language: CLB level -> points per ability
SECOND_LANGUAGE_POINTS_SINGLE: dict[int, int] = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 1,
    6: 1,
    7: 3,
    8: 3,
    9: 6,
    10: 6,
}

SECOND_LANGUAGE_POINTS_WITH_SPOUSE: dict[int, int] = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 1,
    6: 1,
    7: 3,
    8: 3,
    9: 6,
    10: 6,
}

# Canadian work experience: years -> (single_points, with_spouse_points)
CANADIAN_WORK_EXPERIENCE_POINTS: dict[int, tuple[int, int]] = {
    0: (0, 0),
    1: (40, 35),
    2: (53, 46),
    3: (64, 56),
    4: (72, 63),
    5: (80, 70),
}

# ─── Section B: Spouse / Common-Law Partner Factors ───────────────────────────

# Spouse education level -> points
SPOUSE_EDUCATION_POINTS: dict[str, int] = {
    "none": 0,
    "high_school": 2,
    "one_year_post_secondary": 6,
    "two_year_post_secondary": 7,
    "bachelors": 8,
    "two_or_more_post_secondary": 9,
    "masters": 10,
    "phd": 10,
}

# Spouse first language CLB -> points per ability
SPOUSE_LANGUAGE_POINTS: dict[int, int] = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 1,
    6: 1,
    7: 3,
    8: 3,
    9: 5,
    10: 5,
}

# Spouse Canadian work experience: years -> points
SPOUSE_CANADIAN_WORK_EXPERIENCE_POINTS: dict[int, int] = {
    0: 0,
    1: 5,
    2: 7,
    3: 8,
    4: 9,
    5: 10,
}

# ─── Section C: Skill Transferability ─────────────────────────────────────────

# Education + Language (CLB 7+ and post-secondary)
# education_level -> {clb_range -> points}
EDUCATION_LANGUAGE_TRANSFER: dict[str, dict[str, int]] = {
    "one_year_post_secondary": {"clb_7": 13, "clb_9": 25},
    "two_year_post_secondary": {"clb_7": 13, "clb_9": 25},
    "bachelors": {"clb_7": 13, "clb_9": 25},
    "two_or_more_post_secondary": {"clb_7": 25, "clb_9": 50},
    "masters": {"clb_7": 25, "clb_9": 50},
    "phd": {"clb_7": 25, "clb_9": 50},
}

# Education + Canadian Work Experience
# education_level -> {years_range -> points}
EDUCATION_WORK_TRANSFER: dict[str, dict[str, int]] = {
    "one_year_post_secondary": {"1_year": 13, "2_years": 25},
    "two_year_post_secondary": {"1_year": 13, "2_years": 25},
    "bachelors": {"1_year": 13, "2_years": 25},
    "two_or_more_post_secondary": {"1_year": 25, "2_years": 50},
    "masters": {"1_year": 25, "2_years": 50},
    "phd": {"1_year": 25, "2_years": 50},
}

# Foreign Work Experience + Language
# foreign_years -> {clb_range -> points}
FOREIGN_WORK_LANGUAGE_TRANSFER: dict[str, dict[str, int]] = {
    "1_2_years": {"clb_7": 13, "clb_9": 25},
    "3_plus_years": {"clb_7": 25, "clb_9": 50},
}

# Foreign Work Experience + Canadian Work Experience
# foreign_years -> {canadian_years -> points}
FOREIGN_CANADIAN_WORK_TRANSFER: dict[str, dict[str, int]] = {
    "1_2_years": {"1_year": 13, "2_years": 25},
    "3_plus_years": {"1_year": 25, "2_years": 50},
}

# Certificate of Qualification (trades) + Language
CERTIFICATE_LANGUAGE_TRANSFER: dict[str, int] = {
    "clb_5": 25,
    "clb_7": 50,
}

# ─── Section D: Additional Points ─────────────────────────────────────────────

ADDITIONAL_POINTS: dict[str, int] = {
    "provincial_nomination": 600,
    "job_offer_noc_00": 200,     # Senior management (NOC 00)
    "job_offer_other": 50,       # Other NOC TEER 0,1,2,3
    "canadian_education_1_2_years": 15,
    "canadian_education_3_plus_years": 30,
    "french_proficiency_clb7_english_clb4": 25,   # French CLB 7+ with English CLB 4 or less
    "french_proficiency_clb7_english_clb5": 50,   # French CLB 7+ with English CLB 5+
    "sibling_in_canada": 15,
}

# ─── Maximum Values ──────────────────────────────────────────────────────────

MAX_CORE_HUMAN_CAPITAL_SINGLE: int = 500
MAX_CORE_HUMAN_CAPITAL_WITH_SPOUSE: int = 460
MAX_SPOUSE_FACTORS: int = 40
MAX_SKILL_TRANSFERABILITY: int = 100
MAX_ADDITIONAL_POINTS: int = 600
MAX_CRS_SCORE: int = 1200
