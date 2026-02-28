"""
Immigration service -- orchestrates CRS calculation, program matching,
post-landing checklists, and Express Entry draw history.
"""

from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.immigration import EEDraw, ImmigrationProgram
from app.schemas.immigration import (
    CRSInput,
    CRSResult,
    PostLandingTask,
    PostLandingTaskResponse,
    ProgramResponse,
)
from app.services.crs_calculator import CRSCalculator
from app.services.pnp_matcher import PNPMatcher


class ImmigrationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    def calculate_crs(self, input_data: CRSInput) -> CRSResult:
        """Calculate CRS score and match eligible programs."""
        result = CRSCalculator.calculate(input_data)
        matched = PNPMatcher.match_programs(result.total_score, input_data)
        result.eligible_programs = [m["name"] for m in matched]
        return result

    def match_pathways(self, crs_score: int, profile: CRSInput) -> list[dict]:
        """Match profile to eligible immigration pathways with detailed reasons."""
        return PNPMatcher.match_programs(crs_score, profile)

    async def get_programs(self, province: str | None = None) -> list[ProgramResponse]:
        """Get all active immigration programs, optionally filtered by province."""
        query = select(ImmigrationProgram).where(ImmigrationProgram.active.is_(True))
        if province:
            query = query.where(ImmigrationProgram.province == province)
        query = query.order_by(ImmigrationProgram.name)

        result = await self.session.execute(query)
        programs = result.scalars().all()

        return [
            ProgramResponse(
                id=p.id,
                name=p.name,
                province=p.province,
                program_type=p.program_type,
                min_crs_score=p.min_crs_score,
                requirements=p.requirements_json,
                active=p.active,
            )
            for p in programs
        ]

    async def get_recent_draws(self, limit: int = 10) -> list[dict]:
        """Get most recent Express Entry draws."""
        query = select(EEDraw).order_by(EEDraw.draw_date.desc()).limit(limit)
        result = await self.session.execute(query)
        draws = result.scalars().all()

        return [
            {
                "draw_number": d.draw_number,
                "draw_date": d.draw_date.isoformat(),
                "min_score": d.min_score,
                "invitations": d.invitations,
                "program_type": d.program_type,
            }
            for d in draws
        ]

    @staticmethod
    def get_post_landing_checklist() -> PostLandingTaskResponse:
        """Return a comprehensive post-landing checklist for new permanent residents."""
        tasks = [
            PostLandingTask(
                step=1,
                title="Apply for a Social Insurance Number (SIN)",
                description="Visit a Service Canada office with your Confirmation of Permanent Residence (COPR) and a valid identification document. The SIN is required for working and accessing government programs.",
                timeline="Within the first week of arrival",
                links=["https://www.canada.ca/en/employment-social-development/services/sin.html"],
            ),
            PostLandingTask(
                step=2,
                title="Apply for provincial health insurance",
                description="Apply for your provincial or territorial health insurance plan. Note that most provinces have a waiting period of up to 3 months before coverage begins. Consider private health insurance during the waiting period.",
                timeline="Within the first week of arrival",
                links=["https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/new-life-canada/health-care.html"],
            ),
            PostLandingTask(
                step=3,
                title="Open a Canadian bank account",
                description="Open a bank account at a Canadian financial institution. Bring your passport, COPR, and SIN. Consider both a chequing and savings account.",
                timeline="Within the first 2 weeks",
                links=[],
            ),
            PostLandingTask(
                step=4,
                title="Find housing",
                description="Secure temporary or permanent housing. Research rental markets, understand tenant rights in your province, and review lease agreements carefully before signing.",
                timeline="First 1-2 months",
                links=[],
            ),
            PostLandingTask(
                step=5,
                title="Register for language training (if needed)",
                description="If English or French is not your first language, register for free government-funded language classes (LINC for English, CLIC for French).",
                timeline="Within the first month",
                links=["https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/new-life-canada/improve-english-french.html"],
            ),
            PostLandingTask(
                step=6,
                title="File your first Canadian tax return",
                description="As a permanent resident, you must file a Canadian tax return each year. Register for a CRA My Account and file by April 30 for the previous tax year. This is important for accessing benefits like the Canada Child Benefit and GST/HST credit.",
                timeline="Before April 30 of the following year",
                links=["https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/tax-slips/a-]"],
            ),
            PostLandingTask(
                step=7,
                title="Apply for Permanent Resident Card",
                description="Your PR Card should arrive by mail within a few months of landing. If you need to travel internationally before it arrives, contact IRCC. The card is valid for 5 years.",
                timeline="Automatically mailed; follow up if not received within 180 days",
                links=["https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card.html"],
            ),
            PostLandingTask(
                step=8,
                title="Get your foreign credentials assessed",
                description="If you have professional qualifications from another country, contact the relevant Canadian regulatory body in your province to understand the credential recognition process.",
                timeline="Within the first 3 months",
                links=["https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/new-life-canada/credential-assessment.html"],
            ),
            PostLandingTask(
                step=9,
                title="Obtain a driver's license",
                description="Exchange your foreign driver's license for a Canadian one at your provincial licensing office. Requirements vary by province. Some provinces have exchange agreements with certain countries.",
                timeline="Within 60-90 days of arrival",
                links=[],
            ),
            PostLandingTask(
                step=10,
                title="Understand your residency obligations",
                description="To maintain permanent resident status, you must be physically present in Canada for at least 730 days (2 years) within every 5-year period. Keep records of your travel and time spent in Canada.",
                timeline="Ongoing",
                links=["https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/understand-pr-status.html"],
            ),
        ]
        return PostLandingTaskResponse(tasks=tasks)
