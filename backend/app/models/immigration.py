from datetime import date

from sqlalchemy import Boolean, Date, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class ImmigrationProgram(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "immigration_programs"

    name: Mapped[str] = mapped_column(String(300), nullable=False)
    province: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    program_type: Mapped[str] = mapped_column(String(100), nullable=False)
    min_crs_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    requirements_json: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class EEDraw(Base, UUIDMixin):
    __tablename__ = "ee_draws"

    draw_number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    draw_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    min_score: Mapped[int] = mapped_column(Integer, nullable=False)
    invitations: Mapped[int] = mapped_column(Integer, nullable=False)
    program_type: Mapped[str] = mapped_column(String(200), nullable=False)
