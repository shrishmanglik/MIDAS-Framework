---
name: "sql-best-practices"
studio: "data-studio"
---

# SQL Best Practices and Patterns

## Query Guidelines
- Always use explicit JOINs (never implicit comma joins)
- Use CTEs for readability over nested subqueries
- Always handle NULLs explicitly
- Use window functions over self-joins
- Index-aware query writing
- Always include WHERE clauses with date ranges

## Anti-Patterns
- SELECT * in production
- Functions on indexed columns in WHERE
- Correlated subqueries when JOINs work
- Missing GROUP BY validation
- Implicit type conversions

