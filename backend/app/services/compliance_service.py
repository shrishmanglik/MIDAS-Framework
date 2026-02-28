"""
Compliance service.

Provides employment standards lookup and compliance checklists.
Pure database queries -- no AI involvement.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.compliance import ComplianceRule, EmploymentStandard
from app.schemas.compliance import (
    ChecklistItem,
    ComplianceChecklistResponse,
    EmploymentStandardResponse,
)


class ComplianceService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_employment_standards(
        self,
        province: str,
        topic: str | None = None,
    ) -> list[EmploymentStandardResponse]:
        """Get employment standards for a province, optionally filtered by topic."""
        query = select(EmploymentStandard).where(EmploymentStandard.province == province)
        if topic:
            query = query.where(EmploymentStandard.topic == topic)
        query = query.order_by(EmploymentStandard.topic, EmploymentStandard.effective_date)

        result = await self.session.execute(query)
        standards = result.scalars().all()
        return [EmploymentStandardResponse.model_validate(s) for s in standards]

    async def get_compliance_checklist(
        self,
        jurisdiction: str,
        category: str | None = None,
    ) -> list[ComplianceChecklistResponse]:
        """Get compliance checklists for a jurisdiction, optionally filtered by category."""
        query = select(ComplianceRule).where(ComplianceRule.jurisdiction == jurisdiction)
        if category:
            query = query.where(ComplianceRule.category == category)
        query = query.order_by(ComplianceRule.category, ComplianceRule.rule_name)

        result = await self.session.execute(query)
        rules = result.scalars().all()

        responses = []
        for rule in rules:
            items = rule.checklist_items if isinstance(rule.checklist_items, list) else []
            responses.append(
                ComplianceChecklistResponse(
                    jurisdiction=rule.jurisdiction,
                    category=rule.category,
                    rule_name=rule.rule_name,
                    description=rule.description,
                    checklist_items=[
                        ChecklistItem(
                            item=item.get("item", ""),
                            description=item.get("description", ""),
                            compliant=item.get("compliant"),
                        )
                        for item in items
                    ],
                )
            )

        return responses
