# Code Review Checklist

> Complete this checklist BEFORE merging any pull request. Every item must be verified. The reviewer must NOT be the same agent that wrote the code.

## Correctness

- [ ] **Code does what the requirements say** -- Every acceptance criterion is satisfied by the implementation
- [ ] **Edge cases are handled** -- Empty inputs, null values, zero quantities, maximum lengths, concurrent writes
- [ ] **Error cases return proper responses** -- HTTP status codes match the error type (400, 401, 403, 404, 409, 422, 500)
- [ ] **Business logic is correct** -- Domain rules are properly enforced (e.g., salary_max >= salary_min)
- [ ] **Data types are correct** -- No string where int is expected, no implicit type coercion in critical paths

## Security

- [ ] **Authentication is enforced** -- Every state-changing endpoint requires authentication
- [ ] **Authorization is checked** -- Users can only access/modify their own resources (ownership verification)
- [ ] **Input is validated** -- All user inputs go through Pydantic/Zod validation before processing
- [ ] **SQL injection is prevented** -- All database queries use parameterized statements or ORM methods
- [ ] **XSS is prevented** -- User-provided text is escaped/sanitized before rendering in HTML
- [ ] **Secrets are not in code** -- No API keys, passwords, tokens, or connection strings in source files
- [ ] **CORS is restricted** -- Allowed origins are explicitly listed, not wildcard in production
- [ ] **Rate limiting exists** -- Login and sensitive endpoints have rate limiting configured
- [ ] **Sensitive data is not logged** -- Passwords, tokens, and PII are excluded from log output

## Performance

- [ ] **No N+1 queries** -- List endpoints use eager loading or batch queries, not loops with individual DB calls
- [ ] **Indexes exist for query patterns** -- Every column used in WHERE, ORDER BY, or JOIN has an index
- [ ] **Pagination is implemented** -- List endpoints use skip/limit with a maximum limit cap
- [ ] **No unnecessary re-renders** -- React components are memoized where appropriate (useMemo, useCallback)
- [ ] **Bundle size is reasonable** -- No unnecessary large dependencies imported on the client
- [ ] **Database connections are managed** -- Sessions are properly opened, used, and closed (no leaks)

## Code Quality

- [ ] **Functions are single-responsibility** -- Each function does one thing. No function longer than 50 lines.
- [ ] **Names are clear and descriptive** -- Variables, functions, and classes have names that explain their purpose
- [ ] **No dead code** -- No commented-out code, unused imports, or unreachable branches
- [ ] **No code duplication** -- Same logic is not copy-pasted in multiple places (extract to shared utility)
- [ ] **Error messages are helpful** -- Error responses tell the user what went wrong and how to fix it
- [ ] **Types are explicit** -- TypeScript has no `any` types; Python uses type hints on all public functions
- [ ] **Comments explain "why"** -- Comments explain business rules and intent, not what the code does

## Testing

- [ ] **Tests exist** -- Every new endpoint/function has at least one test
- [ ] **Happy path is tested** -- Normal expected behavior is verified
- [ ] **Error paths are tested** -- Invalid input, unauthorized access, not found cases are covered
- [ ] **Auth is tested** -- Protected endpoints are tested with: no token, expired token, wrong role
- [ ] **Coverage meets threshold** -- Backend >= 80%, frontend >= 70%
- [ ] **Tests are independent** -- No test depends on another test's side effects or execution order
- [ ] **Test names describe the scenario** -- `test_create_job_missing_title_returns_422` not `test_create_1`

## API Contract Compliance

- [ ] **Endpoints match the spec** -- Path, method, and status codes match the architecture specification
- [ ] **Request schemas match** -- Field names, types, and validation rules match the API contract
- [ ] **Response schemas match** -- Response shape matches the documented contract exactly
- [ ] **Error format is standard** -- All errors return `{ "detail": string, "code": string }` format
- [ ] **Pagination format is standard** -- List responses include `{ "data": [], "meta": { "total", "skip", "limit" } }`

## Documentation

- [ ] **Public endpoints are documented** -- Docstrings on route handlers describe what the endpoint does
- [ ] **Complex logic has comments** -- Non-obvious business rules are explained inline
- [ ] **README is updated** -- New features, endpoints, or setup steps are reflected in the README
- [ ] **Environment variables are documented** -- New env vars are added to .env.example with descriptions

## Deployment Readiness

- [ ] **No hardcoded URLs** -- All external URLs use environment variables
- [ ] **No console.log / print statements** -- Debug output is removed before merge
- [ ] **Database migrations are included** -- Schema changes have corresponding migration files
- [ ] **Migrations are reversible** -- Downgrade functions exist for every migration

## Review Verdict

| Verdict | Criteria |
|---------|----------|
| **APPROVE** | All items checked, zero critical/high findings |
| **REQUEST CHANGES** | One or more items unchecked, specific fixes listed |
| **BLOCK** | Critical security or data integrity issue found |

**Minimum findings requirement:** Every code review must produce at least 3 specific findings (or an explicit justification for fewer). Generic "looks good" reviews are not acceptable.
