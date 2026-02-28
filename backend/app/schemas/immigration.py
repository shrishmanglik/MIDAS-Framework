from uuid import UUID

from pydantic import BaseModel, Field


class LanguageScores(BaseModel):
    speaking: int = Field(..., ge=0, le=12, description="CLB level for speaking")
    listening: int = Field(..., ge=0, le=12, description="CLB level for listening")
    reading: int = Field(..., ge=0, le=12, description="CLB level for reading")
    writing: int = Field(..., ge=0, le=12, description="CLB level for writing")


class CRSInput(BaseModel):
    # Personal
    age: int = Field(..., ge=17, le=45, description="Applicant age")
    has_spouse: bool = Field(False, description="Whether applicant has a spouse/common-law partner")

    # Education
    education_level: str = Field(
        ...,
        description="Education level: none, high_school, one_year_post_secondary, two_year_post_secondary, bachelors, two_or_more_post_secondary, masters, phd",
    )

    # Language
    first_language: LanguageScores = Field(..., description="First official language CLB scores")
    second_language: LanguageScores | None = Field(None, description="Second official language CLB scores (optional)")

    # Work experience
    canadian_work_experience_years: int = Field(0, ge=0, le=5, description="Years of Canadian work experience")
    foreign_work_experience_years: int = Field(0, ge=0, le=5, description="Years of foreign work experience")

    # Spouse factors (only if has_spouse=True)
    spouse_education_level: str | None = Field(None, description="Spouse's education level")
    spouse_first_language: LanguageScores | None = Field(None, description="Spouse's first language CLB scores")
    spouse_canadian_work_experience_years: int = Field(0, ge=0, le=5)

    # Additional factors
    has_certificate_of_qualification: bool = Field(False, description="Certificate of qualification in a trade")
    has_provincial_nomination: bool = Field(False, description="Provincial/territorial nomination")
    job_offer_noc_level: str | None = Field(
        None, description="Job offer NOC level: noc_00, other, or None for no job offer"
    )
    canadian_education_years: int = Field(0, ge=0, le=5, description="Years of Canadian post-secondary education")
    has_sibling_in_canada: bool = Field(False, description="Sibling who is a Canadian citizen/PR")
    french_clb7_plus: bool = Field(False, description="French language CLB 7+ in all abilities")
    english_clb5_plus: bool = Field(False, description="English CLB 5+ in all abilities (for French bonus)")


class CRSBreakdown(BaseModel):
    core_human_capital: int
    spouse_factors: int
    skill_transferability: int
    additional_points: int


class CRSResult(BaseModel):
    total_score: int
    breakdown: CRSBreakdown
    eligible_programs: list[str]


class ProgramResponse(BaseModel):
    id: UUID
    name: str
    province: str
    program_type: str
    min_crs_score: int | None
    requirements: dict
    active: bool

    model_config = {"from_attributes": True}


class PostLandingTask(BaseModel):
    step: int
    title: str
    description: str
    timeline: str
    links: list[str] = []


class PostLandingTaskResponse(BaseModel):
    tasks: list[PostLandingTask]
