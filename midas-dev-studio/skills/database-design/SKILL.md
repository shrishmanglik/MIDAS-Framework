---
name: database-design
description: "Design database schemas, generate SQLAlchemy models, and create Alembic migrations from architecture specs. Triggers on: database design, schema creation, model generation, migration setup."
---

# Database Design

Transform architecture data model into PostgreSQL schema, SQLAlchemy models, and Alembic migrations.

## Process

1. **Extract entities** from `output/architecture.md` data model section.
2. **Define fields** with types, constraints, defaults for each entity.
3. **Define relationships** with foreign keys and ON DELETE behavior.
4. **Add indexes** based on expected query patterns.
5. **Generate SQLAlchemy models** using the standard template.
6. **Generate Alembic migration** for initial schema.
7. **Generate seed data** for testing.

## Standard Field Types

| Python Type | SQLAlchemy Column | PostgreSQL Type |
|---|---|---|
| int | Integer | INTEGER |
| str | String(N) | VARCHAR(N) |
| str (long) | Text | TEXT |
| bool | Boolean | BOOLEAN |
| float | Float | DOUBLE PRECISION |
| Decimal | Numeric(P,S) | NUMERIC(P,S) |
| datetime | DateTime(timezone=True) | TIMESTAMPTZ |
| date | Date | DATE |
| dict | JSON | JSONB |
| Enum | Enum(PyEnum) | user-defined ENUM |

## Standard Columns (Every Table)

```python
id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), server_default=func.now()
)
updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
)
```

## Relationship Patterns

### One-to-Many
```python
# Parent side
children: Mapped[list["Child"]] = relationship(back_populates="parent")

# Child side
parent_id: Mapped[int] = mapped_column(ForeignKey("parents.id", ondelete="CASCADE"))
parent: Mapped["Parent"] = relationship(back_populates="children")
```

### Many-to-Many
```python
# Association table
entity_a_b = Table(
    "entity_a_b",
    Base.metadata,
    Column("a_id", ForeignKey("entity_a.id", ondelete="CASCADE"), primary_key=True),
    Column("b_id", ForeignKey("entity_b.id", ondelete="CASCADE"), primary_key=True),
)
```

## Index Strategy

- **Always index:** Foreign keys, unique constraints, commonly filtered fields
- **Consider indexing:** Fields used in ORDER BY, date ranges, search fields
- **Composite indexes:** For queries that filter on multiple columns together

## Alembic Setup Template

```
alembic/
├── env.py
├── script.py.mako
└── versions/
    └── 001_initial_schema.py
```

## Validation Rules

- Every entity from requirements has a SQLAlchemy model
- All foreign keys have ON DELETE behavior specified
- No nullable fields without explicit business reason
- Indexes on all foreign keys and commonly queried fields
- Migration has both upgrade() and downgrade() functions
