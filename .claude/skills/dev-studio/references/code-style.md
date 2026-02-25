# Code Style Guide

## Python (Backend)
- Formatter: Ruff
- Line length: 88
- Quotes: double
- Imports: sorted by ruff (isort compatible)
- Type hints: required for function signatures
- Docstrings: Google style for public functions

## TypeScript (Frontend)
- Formatter: Prettier
- Linter: ESLint
- Semicolons: yes
- Quotes: single
- Components: functional with hooks
- Types: explicit interfaces, avoid `any`

## Naming Conventions
| Context | Convention | Example |
|---------|-----------|---------|
| Python variables | snake_case | user_name |
| Python classes | PascalCase | UserService |
| Python constants | UPPER_SNAKE | MAX_RETRIES |
| TS variables | camelCase | userName |
| TS components | PascalCase | UserProfile |
| TS interfaces | PascalCase | UserProps |
| DB tables | snake_case plural | user_profiles |
| DB columns | snake_case | created_at |
| API paths | kebab-case | /user-profiles |
| Env vars | UPPER_SNAKE | DATABASE_URL |