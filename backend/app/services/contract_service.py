"""
Contract review service.

Provides deterministic clause detection and risk scoring for uploaded contracts.
Uses keyword/pattern matching -- no AI for the core analysis.
"""

import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ContractParsingError, ResourceNotFoundError
from app.data.clause_library import CLAUSE_LIBRARY
from app.models.contracts import ContractReview, ReviewStatus
from app.schemas.contracts import (
    ClauseFound,
    ClauseResponse,
    ContractReviewResponse,
    ContractUploadResponse,
    RiskAssessment,
)

# Keyword patterns for detecting clause types in contract text
CLAUSE_PATTERNS: dict[str, list[str]] = {
    "confidentiality": [
        r"confidential\s+information",
        r"non[\-\s]?disclosure",
        r"proprietary\s+information",
        r"trade\s+secret",
        r"shall\s+not\s+disclose",
    ],
    "non_compete": [
        r"non[\-\s]?compete",
        r"non[\-\s]?competition",
        r"shall\s+not\s+compete",
        r"restrictive\s+covenant",
        r"competing\s+business",
    ],
    "non_solicitation": [
        r"non[\-\s]?solicitation",
        r"shall\s+not\s+solicit",
        r"not\s+recruit",
        r"not\s+divert\s+any\s+customer",
    ],
    "indemnification": [
        r"indemnif",
        r"hold\s+harmless",
        r"defend\s+and\s+indemnify",
        r"shall\s+indemnify",
    ],
    "limitation_of_liability": [
        r"limitation\s+of\s+liability",
        r"aggregate\s+liability",
        r"consequential\s+damages",
        r"in\s+no\s+event\s+shall.*liable",
        r"cap\s+on\s+liability",
    ],
    "termination": [
        r"terminat(?:ion|e)",
        r"may\s+terminate",
        r"upon\s+termination",
        r"right\s+to\s+terminate",
        r"notice\s+of\s+termination",
    ],
    "governing_law": [
        r"governing\s+law",
        r"governed\s+by.*laws\s+of",
        r"jurisdiction",
        r"submit\s+to\s+the.*courts",
        r"applicable\s+law",
    ],
    "intellectual_property": [
        r"intellectual\s+property",
        r"work\s+product",
        r"hereby\s+assigns",
        r"patent|copyright|trademark",
        r"ownership\s+of\s+ip",
    ],
    "force_majeure": [
        r"force\s+majeure",
        r"act\s+of\s+god",
        r"beyond\s+(?:the\s+)?reasonable\s+control",
        r"unforeseeable\s+event",
    ],
    "assignment": [
        r"assignment",
        r"may\s+not\s+assign",
        r"shall\s+not\s+assign",
        r"transfer\s+(?:this|the)\s+agreement",
    ],
    "dispute_resolution": [
        r"dispute\s+resolution",
        r"arbitration",
        r"mediation",
        r"alternative\s+dispute",
        r"binding\s+arbitration",
    ],
    "entire_agreement": [
        r"entire\s+agreement",
        r"integration\s+clause",
        r"supersedes\s+all\s+prior",
        r"constitutes\s+the\s+entire",
    ],
    "warranty": [
        r"warrant(?:y|ies|s)",
        r"represent(?:ation)?s?\s+and\s+warrant",
        r"as[\-\s]is",
        r"no\s+warranty",
    ],
    "payment_terms": [
        r"payment\s+terms",
        r"invoice",
        r"net\s+\d+\s+days",
        r"late\s+payment",
        r"fees?\s+(?:shall|will)\s+be",
    ],
    "data_protection": [
        r"data\s+protection",
        r"personal\s+(?:information|data)",
        r"privacy",
        r"pipeda",
        r"gdpr",
        r"data\s+breach",
    ],
}

# Risk weights per clause type
CLAUSE_RISK_WEIGHTS: dict[str, float] = {
    "confidentiality": 0.15,
    "non_compete": 0.12,
    "non_solicitation": 0.08,
    "indemnification": 0.15,
    "limitation_of_liability": 0.15,
    "termination": 0.10,
    "governing_law": 0.05,
    "intellectual_property": 0.12,
    "force_majeure": 0.03,
    "assignment": 0.02,
    "dispute_resolution": 0.05,
    "entire_agreement": 0.02,
    "warranty": 0.08,
    "payment_terms": 0.08,
    "data_protection": 0.10,
}

# Clause types that are commonly expected in a standard commercial contract
ESSENTIAL_CLAUSES = {
    "confidentiality",
    "termination",
    "governing_law",
    "limitation_of_liability",
    "indemnification",
}


class ContractService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def upload_and_review(self, user_id: uuid.UUID, filename: str, text_content: str) -> ContractReviewResponse:
        """Upload contract text and perform a deterministic review."""
        if not text_content or len(text_content.strip()) < 50:
            raise ContractParsingError("Contract text is too short or empty to analyze.")

        # Create the review record
        review = ContractReview(
            user_id=user_id,
            filename=filename,
            status=ReviewStatus.processing,
        )
        self.session.add(review)
        await self.session.flush()
        await self.session.refresh(review)

        try:
            # Detect clauses
            clauses_found = self.extract_clauses(text_content)

            # Detect missing essential clauses
            found_types = {c["clause_type"] for c in clauses_found}
            missing = sorted(ESSENTIAL_CLAUSES - found_types)

            # Score risk
            risk_score = self.score_risk(clauses_found, missing, text_content)

            # Determine risk level
            if risk_score < 0.3:
                risk_level = "low"
            elif risk_score < 0.6:
                risk_level = "medium"
            else:
                risk_level = "high"

            # Build risk factors
            risk_factors = []
            if missing:
                risk_factors.append(f"Missing essential clauses: {', '.join(missing)}")
            if len(clauses_found) < 5:
                risk_factors.append("Contract has fewer than 5 identified clause types")
            high_risk_present = [c for c in clauses_found if c["risk_level"] == "high"]
            if high_risk_present:
                risk_factors.append(f"{len(high_risk_present)} high-risk clauses detected — review carefully")
            if not risk_factors:
                risk_factors.append("No significant risk factors identified")

            # Build summary
            summary = (
                f"Analyzed contract '{filename}'. Found {len(clauses_found)} clause type(s). "
                f"Risk score: {risk_score:.2f} ({risk_level}). "
                f"Missing essential clauses: {', '.join(missing) if missing else 'none'}."
            )

            # Update review record
            review.status = ReviewStatus.completed
            review.risk_score = risk_score
            review.summary = summary
            review.clauses_found = [c for c in clauses_found]
            review.missing_clauses = missing
            await self.session.flush()
            await self.session.refresh(review)

            return ContractReviewResponse(
                id=review.id,
                filename=review.filename,
                status=review.status.value,
                risk_score=risk_score,
                risk_assessment=RiskAssessment(
                    overall_score=risk_score,
                    risk_level=risk_level,
                    factors=risk_factors,
                ),
                summary=summary,
                clauses_found=[ClauseFound(**c) for c in clauses_found],
                missing_clauses=missing,
                created_at=review.created_at,
                updated_at=review.updated_at,
            )

        except Exception as exc:
            review.status = ReviewStatus.failed
            review.summary = f"Review failed: {str(exc)}"
            await self.session.flush()
            raise ContractParsingError(f"Failed to analyze contract: {str(exc)}")

    @staticmethod
    def extract_clauses(text: str) -> list[dict]:
        """Extract clauses from contract text using keyword/pattern matching."""
        text_lower = text.lower()
        found = []

        clause_lookup = {c["clause_type"]: c for c in CLAUSE_LIBRARY}

        for clause_type, patterns in CLAUSE_PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, text_lower)
                if match:
                    # Extract a snippet around the match
                    start = max(0, match.start() - 100)
                    end = min(len(text), match.end() + 200)
                    excerpt = text[start:end].strip()
                    if start > 0:
                        excerpt = "..." + excerpt
                    if end < len(text):
                        excerpt = excerpt + "..."

                    lib_entry = clause_lookup.get(clause_type, {})
                    found.append({
                        "clause_type": clause_type,
                        "name": lib_entry.get("name", clause_type.replace("_", " ").title()),
                        "risk_level": lib_entry.get("risk_level", "medium"),
                        "excerpt": excerpt,
                    })
                    break  # Only report each clause type once

        return found

    @staticmethod
    def score_risk(clauses_found: list[dict], missing_clauses: list[str], text: str) -> float:
        """
        Calculate a deterministic risk score between 0.0 and 1.0.

        Factors:
        - Missing essential clauses increase risk.
        - Having high-risk clauses without balancing protections increases risk.
        - Very short contracts increase risk.
        """
        score = 0.0

        # Penalize missing essential clauses
        if missing_clauses:
            score += len(missing_clauses) * 0.12

        # Assess found clauses
        found_types = {c["clause_type"] for c in clauses_found}

        # Penalize contracts with few identified clause types
        if len(found_types) < 3:
            score += 0.15
        elif len(found_types) < 5:
            score += 0.05

        # High-risk clauses without limitation of liability
        high_risk_found = [c for c in clauses_found if c["risk_level"] == "high"]
        if high_risk_found and "limitation_of_liability" not in found_types:
            score += 0.15

        # Non-compete without clear termination
        if "non_compete" in found_types and "termination" not in found_types:
            score += 0.10

        # Very short contract
        word_count = len(text.split())
        if word_count < 500:
            score += 0.10
        elif word_count < 1000:
            score += 0.05

        return min(round(score, 2), 1.0)

    @staticmethod
    def detect_missing_clauses(clauses_found: list[dict]) -> list[str]:
        """Identify essential clauses missing from the contract."""
        found_types = {c["clause_type"] for c in clauses_found}
        return sorted(ESSENTIAL_CLAUSES - found_types)

    async def get_review(self, review_id: uuid.UUID) -> ContractReviewResponse:
        """Get a specific contract review by ID."""
        result = await self.session.execute(
            select(ContractReview).where(ContractReview.id == review_id)
        )
        review = result.scalar_one_or_none()
        if review is None:
            raise ResourceNotFoundError("ContractReview", str(review_id))

        clauses_found_list = review.clauses_found or []
        missing_list = review.missing_clauses or []

        risk_assessment = None
        if review.risk_score is not None:
            if review.risk_score < 0.3:
                risk_level = "low"
            elif review.risk_score < 0.6:
                risk_level = "medium"
            else:
                risk_level = "high"
            risk_assessment = RiskAssessment(
                overall_score=review.risk_score,
                risk_level=risk_level,
                factors=[],
            )

        return ContractReviewResponse(
            id=review.id,
            filename=review.filename,
            status=review.status.value,
            risk_score=review.risk_score,
            risk_assessment=risk_assessment,
            summary=review.summary,
            clauses_found=[ClauseFound(**c) if isinstance(c, dict) else c for c in clauses_found_list],
            missing_clauses=missing_list,
            created_at=review.created_at,
            updated_at=review.updated_at,
        )

    async def get_reviews_for_user(self, user_id: uuid.UUID) -> list[ContractUploadResponse]:
        """Get all contract reviews for a user."""
        result = await self.session.execute(
            select(ContractReview)
            .where(ContractReview.user_id == user_id)
            .order_by(ContractReview.created_at.desc())
        )
        reviews = result.scalars().all()

        return [
            ContractUploadResponse(
                id=r.id,
                filename=r.filename,
                status=r.status.value,
                created_at=r.created_at,
            )
            for r in reviews
        ]

    async def get_clause_library(self) -> list[ClauseResponse]:
        """Get all clauses from the clause library."""
        from app.models.contracts import ClauseLibrary

        result = await self.session.execute(select(ClauseLibrary).order_by(ClauseLibrary.name))
        clauses = result.scalars().all()
        return [ClauseResponse.model_validate(c) for c in clauses]
