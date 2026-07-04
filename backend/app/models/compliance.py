from datetime import date

from sqlalchemy import Date, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class EmploymentStandard(Base, UUIDMixin):
    __tablename__ = "employment_standards"

    province: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    topic: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    rule_text: Mapped[str] = mapped_column(Text, nullable=False)
    effective_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)


class ComplianceRule(Base, UUIDMixin):
    __tablename__ = "compliance_rules"

    jurisdiction: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    rule_name: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    checklist_items: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)
