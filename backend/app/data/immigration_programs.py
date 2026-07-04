"""
Canadian immigration programs data for seeding.

Each entry represents a real immigration program with its basic requirements.
"""

IMMIGRATION_PROGRAMS: list[dict] = [
    {
        "name": "Federal Skilled Worker Program (FSWP)",
        "province": "Federal",
        "program_type": "express_entry",
        "min_crs_score": 67,  # Points out of 100 on the FSW grid (not CRS)
        "requirements": {
            "description": "For skilled workers with foreign work experience who want to immigrate to Canada permanently.",
            "minimum_work_experience_years": 1,
            "work_experience_type": "continuous full-time or equivalent part-time in NOC TEER 0, 1, 2, or 3",
            "language_minimum": "CLB 7 in all abilities",
            "education_minimum": "Secondary school or above (with ECA if foreign)",
            "selection_factors": [
                "Language skills",
                "Education",
                "Work experience",
                "Age",
                "Arranged employment in Canada",
                "Adaptability",
            ],
            "proof_of_funds_required": True,
        },
    },
    {
        "name": "Canadian Experience Class (CEC)",
        "province": "Federal",
        "program_type": "express_entry",
        "min_crs_score": None,
        "requirements": {
            "description": "For skilled workers who have Canadian work experience and want to become permanent residents.",
            "minimum_work_experience_years": 1,
            "work_experience_type": "1 year of skilled work experience in Canada in the last 3 years (NOC TEER 0, 1, 2, or 3)",
            "language_minimum_teer_0_1": "CLB 7 in all abilities",
            "language_minimum_teer_2_3": "CLB 5 in all abilities",
            "education_minimum": "No minimum (but education helps CRS score)",
            "proof_of_funds_required": False,
        },
    },
    {
        "name": "Federal Skilled Trades Program (FSTP)",
        "province": "Federal",
        "program_type": "express_entry",
        "min_crs_score": None,
        "requirements": {
            "description": "For skilled workers who want to become permanent residents based on being qualified in a skilled trade.",
            "minimum_work_experience_years": 2,
            "work_experience_type": "2 years of full-time work experience in a skilled trade within the last 5 years",
            "language_minimum_speaking_listening": "CLB 5",
            "language_minimum_reading_writing": "CLB 4",
            "qualification": "Certificate of qualification from Canadian province/territory OR valid job offer",
            "proof_of_funds_required": False,
        },
    },
    {
        "name": "Ontario Human Capital Priorities (HCP)",
        "province": "Ontario",
        "program_type": "provincial_nominee",
        "min_crs_score": 400,
        "requirements": {
            "description": "Ontario's Express Entry-linked stream targeting high-skilled workers already in the federal Express Entry pool.",
            "eligible_programs": ["Federal Skilled Worker", "Canadian Experience Class"],
            "work_experience_type": "NOC TEER 0, 1, 2, or 3",
            "language_minimum": "CLB 7 in all abilities",
            "education_minimum": "Bachelor's degree or above",
            "minimum_work_experience_years": 1,
            "settlement_funds_required": True,
            "intent_to_reside_in_ontario": True,
        },
    },
    {
        "name": "British Columbia Provincial Nominee Program — Tech",
        "province": "British Columbia",
        "program_type": "provincial_nominee",
        "min_crs_score": None,
        "requirements": {
            "description": "BC PNP Tech is a fast-track immigration pathway for in-demand tech workers.",
            "eligible_occupations": [
                "Software engineers and designers (NOC 21231)",
                "Computer programmers and interactive media developers (NOC 21230)",
                "Information systems analysts and consultants (NOC 21222)",
                "Database analysts and data administrators (NOC 21223)",
                "Web designers (NOC 21233)",
                "Computer network and web technicians (NOC 22220)",
            ],
            "job_offer_required": True,
            "job_offer_duration_minimum_days": 365,
            "language_minimum": "CLB 4 (TEER 2/3) or no minimum (TEER 0/1)",
            "minimum_work_experience_years": 2,
        },
    },
    {
        "name": "Alberta Advantage Immigration Program (AAIP)",
        "province": "Alberta",
        "program_type": "provincial_nominee",
        "min_crs_score": 300,
        "requirements": {
            "description": "Alberta's immigration program for workers with skills needed in the province.",
            "streams": [
                "Alberta Express Entry Stream",
                "Alberta Opportunity Stream",
                "Alberta Tech Pathway",
            ],
            "express_entry_stream_requirements": {
                "minimum_crs_score": 300,
                "strong_ties_to_alberta": True,
                "occupation_in_demand": True,
            },
            "language_minimum": "CLB 5 for TEER 2/3, CLB 4 for TEER 4/5",
            "minimum_work_experience_years": 1,
        },
    },
    {
        "name": "Saskatchewan Immigrant Nominee Program (SINP) — Express Entry",
        "province": "Saskatchewan",
        "program_type": "provincial_nominee",
        "min_crs_score": 60,  # Points on SINP grid, not CRS
        "requirements": {
            "description": "Saskatchewan's Express Entry sub-category for skilled workers.",
            "minimum_sinp_points": 60,
            "work_experience_type": "At least 1 year in a skilled occupation (NOC TEER 0, 1, 2, or 3)",
            "language_minimum": "CLB 7 in all abilities",
            "education_minimum": "Post-secondary education (with ECA if foreign)",
            "minimum_work_experience_years": 1,
            "proof_of_funds_required": True,
            "occupation_must_be_on_demand_list": True,
        },
    },
    {
        "name": "Nova Scotia Nominee Program — Labour Market Priorities",
        "province": "Nova Scotia",
        "program_type": "provincial_nominee",
        "min_crs_score": None,
        "requirements": {
            "description": "Nova Scotia's Express Entry-linked stream that targets candidates with skills needed in the province.",
            "eligible_programs": ["Federal Skilled Worker", "Canadian Experience Class"],
            "language_minimum": "CLB 7 in all abilities",
            "education_minimum": "Post-secondary education",
            "minimum_work_experience_years": 1,
            "invitation_only": True,
            "work_experience_type": "Experience in an occupation targeted by Nova Scotia",
        },
    },
]
