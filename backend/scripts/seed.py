"""
Database seeding script.

Usage:
    python -m scripts.seed
"""

import asyncio
import sys
from datetime import date
from pathlib import Path
from uuid import uuid4

# Ensure the backend root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory, engine
from app.core.security import hash_password
from app.data.clause_library import CLAUSE_LIBRARY
from app.data.employment_standards import EMPLOYMENT_STANDARDS
from app.data.immigration_programs import IMMIGRATION_PROGRAMS
from app.models import Base
from app.models.compliance import EmploymentStandard
from app.models.contracts import ClauseLibrary
from app.models.immigration import ImmigrationProgram
from app.models.user import User, UserRole


async def seed_users(session: AsyncSession) -> None:
    result = await session.execute(select(User).limit(1))
    if result.scalar_one_or_none() is not None:
        print("Users already seeded, skipping.")
        return

    users = [
        User(
            id=uuid4(),
            email="admin@legalai.dev",
            password_hash=hash_password("admin1234"),
            name="Admin User",
            role=UserRole.admin,
        ),
        User(
            id=uuid4(),
            email="user@legalai.dev",
            password_hash=hash_password("user1234"),
            name="Regular User",
            role=UserRole.user,
        ),
    ]
    session.add_all(users)
    await session.flush()
    print(f"Seeded {len(users)} users.")


async def seed_immigration_programs(session: AsyncSession) -> None:
    result = await session.execute(select(ImmigrationProgram).limit(1))
    if result.scalar_one_or_none() is not None:
        print("Immigration programs already seeded, skipping.")
        return

    programs = []
    for prog in IMMIGRATION_PROGRAMS:
        programs.append(
            ImmigrationProgram(
                id=uuid4(),
                name=prog["name"],
                province=prog["province"],
                program_type=prog["program_type"],
                min_crs_score=prog.get("min_crs_score"),
                requirements_json=prog["requirements"],
                active=True,
            )
        )
    session.add_all(programs)
    await session.flush()
    print(f"Seeded {len(programs)} immigration programs.")


async def seed_employment_standards(session: AsyncSession) -> None:
    result = await session.execute(select(EmploymentStandard).limit(1))
    if result.scalar_one_or_none() is not None:
        print("Employment standards already seeded, skipping.")
        return

    standards = []
    for std in EMPLOYMENT_STANDARDS:
        eff_date = std.get("effective_date")
        if isinstance(eff_date, str):
            eff_date = date.fromisoformat(eff_date)
        standards.append(
            EmploymentStandard(
                id=uuid4(),
                province=std["province"],
                topic=std["topic"],
                rule_text=std["rule_text"],
                effective_date=eff_date,
                source_url=std.get("source_url"),
            )
        )
    session.add_all(standards)
    await session.flush()
    print(f"Seeded {len(standards)} employment standards.")


async def seed_clause_library(session: AsyncSession) -> None:
    result = await session.execute(select(ClauseLibrary).limit(1))
    if result.scalar_one_or_none() is not None:
        print("Clause library already seeded, skipping.")
        return

    clauses = []
    for cl in CLAUSE_LIBRARY:
        clauses.append(
            ClauseLibrary(
                id=uuid4(),
                clause_type=cl["clause_type"],
                name=cl["name"],
                description=cl["description"],
                risk_level=cl["risk_level"],
                example_text=cl["example_text"],
            )
        )
    session.add_all(clauses)
    await session.flush()
    print(f"Seeded {len(clauses)} clause library entries.")


async def main() -> None:
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.")

    async with async_session_factory() as session:
        async with session.begin():
            await seed_users(session)
            await seed_immigration_programs(session)
            await seed_employment_standards(session)
            await seed_clause_library(session)

    await engine.dispose()
    print("Seeding complete.")


if __name__ == "__main__":
    asyncio.run(main())
