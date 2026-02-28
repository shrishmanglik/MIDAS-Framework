# Testing Strategy

> How, what, and how much to test in dev-studio projects. This document defines the testing pyramid, naming conventions, coverage targets, and patterns for each test type.

## Testing Pyramid

```
        /  E2E  \          ~5% of tests   — Full user flows in browser
       /----------\
      / Integration \      ~25% of tests  — API endpoints with real database
     /----------------\
    /    Unit Tests     \  ~70% of tests  — Isolated functions and services
   /____________________\
```

### Layer Definitions

| Layer | What It Tests | Speed | Reliability | Maintenance Cost |
|-------|--------------|-------|-------------|-----------------|
| Unit | Single function or method in isolation | Fast (~1ms) | Very high | Low |
| Integration | API endpoint with database | Medium (~50ms) | High | Medium |
| E2E | Full user workflow in browser | Slow (~5s) | Medium | High |

### Rules

- The majority of tests should be **unit tests** (fast, isolated, cheap).
- **Integration tests** verify that endpoints work with a real database and auth.
- **E2E tests** cover only the critical user paths (login, core workflow, payment).
- If a bug is found, write a **regression test** at the lowest pyramid level that reproduces it.

## Coverage Targets

| Component | Minimum Coverage | Critical Path Coverage |
|-----------|-----------------|----------------------|
| Backend services | 80% | 100% |
| Backend routes | 70% | 100% |
| Frontend components | 70% | 90% |
| Auth logic | 100% | 100% |
| Payment logic | 100% | 100% |
| Database models | 60% (ORM, less logic) | 90% |

### What "Critical Path" Means

Critical paths are code paths where a bug would cause:
- **Data loss** (delete without confirmation, overwrite without backup)
- **Security breach** (auth bypass, privilege escalation, data leak)
- **Financial loss** (incorrect billing, payment processing errors)
- **Complete service outage** (health check, startup, database connection)

These paths require 100% test coverage with no exceptions.

## Test Naming Convention

### Pattern
```
test_[feature]_[scenario]_[expected_result]
```

### Examples (Python)
```python
# Unit tests
test_hash_password_returns_bcrypt_hash
test_verify_password_correct_returns_true
test_verify_password_incorrect_returns_false
test_create_access_token_includes_expiration

# Integration tests
test_register_valid_input_returns_201
test_register_duplicate_email_returns_409
test_register_missing_password_returns_422
test_login_valid_credentials_returns_token
test_login_wrong_password_returns_401

# Security tests
test_sql_injection_in_search_returns_empty
test_xss_in_title_is_escaped
test_delete_job_without_auth_returns_401
test_delete_other_users_job_returns_404
```

### Examples (TypeScript/Jest)
```typescript
// Component tests
describe("LoginForm", () => {
  it("submits with valid email and password");
  it("shows error message for invalid email");
  it("disables submit button while loading");
  it("displays server error message on 401");
});

// API client tests
describe("apiClient.get", () => {
  it("includes auth header when token exists");
  it("throws ApiError on non-2xx response");
  it("retries on 503 with exponential backoff");
});
```

## Test Structure

### Backend (pytest)
```
tests/
  __init__.py
  conftest.py              # Shared fixtures
  unit/
    __init__.py
    test_auth_service.py   # Business logic tests
    test_job_service.py
    test_security.py       # Password hashing, JWT tests
    test_validators.py     # Pydantic model validation
  integration/
    __init__.py
    test_auth_routes.py    # API endpoint tests
    test_job_routes.py
    test_health.py
  security/
    __init__.py
    test_injection.py      # SQL injection, XSS
    test_auth_bypass.py    # Token manipulation, role escalation
    test_rate_limiting.py
```

### Frontend (Jest)
```
__tests__/
  setup.ts                 # Jest setup
  components/
    ui/
      button.test.tsx
      input.test.tsx
    jobs/
      job-card.test.tsx
      job-form.test.tsx
      job-list.test.tsx
  lib/
    api/
      client.test.ts
      jobs.test.ts
    hooks/
      use-auth.test.ts
    utils/
      format.test.ts
```

### E2E (Playwright)
```
e2e/
  auth.spec.ts             # Login, register, logout flows
  jobs.spec.ts             # Create, search, apply flows
  fixtures/
    auth.ts                # Login helper
```

## Fixture Patterns

### Database Session Fixture
```python
@pytest.fixture
async def db():
    """Provide a clean database session for each test."""
    async with TestSessionFactory() as session:
        yield session
    # Cleanup happens automatically via autouse setup_database fixture
```

### Factory Fixture (for creating test data)
```python
@pytest.fixture
def make_user(db):
    """Factory fixture for creating users with defaults."""
    async def _make_user(
        email: str = "user@test.com",
        role: UserRole = UserRole.CANDIDATE,
        password: str = "TestPass123!",
    ) -> User:
        user = User(
            id=uuid4(),
            email=email,
            password_hash=hash_password(password),
            name="Test User",
            role=role,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    return _make_user
```

### Auth Headers Fixture
```python
@pytest.fixture
def auth_headers(test_user):
    """Provide Authorization headers for authenticated requests."""
    token = create_access_token(str(test_user.id))
    return {"Authorization": f"Bearer {token}"}
```

### Mock API Fixture (Frontend)
```typescript
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

function mockApiResponse(data: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  });
}
```

## What to Test (by endpoint type)

### CRUD Endpoint Test Matrix

| Scenario | POST (Create) | GET (Read) | PATCH (Update) | DELETE |
|----------|:---:|:---:|:---:|:---:|
| Valid input, authenticated | Yes | Yes | Yes | Yes |
| Missing required fields | Yes | -- | -- | -- |
| Invalid field values | Yes | -- | Yes | -- |
| Unauthenticated | Yes | Depends | Yes | Yes |
| Wrong role | Yes | Depends | Yes | Yes |
| Resource not found | -- | Yes | Yes | Yes |
| Duplicate (unique constraint) | Yes | -- | Yes | -- |
| Owns resource (authorization) | -- | Depends | Yes | Yes |
| Pagination (skip/limit) | -- | Yes | -- | -- |
| Empty result set | -- | Yes | -- | -- |

### Auth Endpoint Test Matrix

| Scenario | Register | Login | Refresh | Logout |
|----------|:---:|:---:|:---:|:---:|
| Valid credentials | Yes | Yes | Yes | Yes |
| Invalid credentials | -- | Yes | -- | -- |
| Duplicate email | Yes | -- | -- | -- |
| Weak password | Yes | -- | -- | -- |
| Expired token | -- | -- | Yes | Yes |
| Invalid token | -- | -- | Yes | Yes |
| Missing fields | Yes | Yes | -- | -- |

## Mocking Guidelines

### When to Mock

- **External APIs** (payment processors, email services, third-party APIs) -- always mock
- **Time** (for testing token expiration) -- mock `datetime.now()`
- **File system** (for upload tests) -- mock or use temp directories
- **Background tasks** (for async processing) -- mock task submission, test task logic separately

### When NOT to Mock

- **Database** in integration tests -- use a real test database
- **Pydantic validation** -- test with actual model instantiation
- **Auth middleware** -- test the full auth chain, do not mock `get_current_user`
- **ORM queries** -- test with real database queries, not mocked results

## Performance Testing

### When to Performance Test

- Search endpoints with >10k records
- List endpoints with complex joins
- File upload/download endpoints
- Endpoints called >100 times per user session

### Performance Targets

| Endpoint Type | p50 Target | p95 Target | p99 Target |
|--------------|-----------|-----------|-----------|
| Simple CRUD | < 50ms | < 100ms | < 200ms |
| Search with full-text | < 100ms | < 300ms | < 500ms |
| Complex aggregation | < 200ms | < 500ms | < 1000ms |
| File upload (10MB) | < 2s | < 5s | < 10s |

### How to Measure
```python
@pytest.mark.slow
async def test_search_performance(client, seed_10k_jobs):
    """Search should respond within 500ms at p95 with 10k records."""
    import time
    times = []
    for _ in range(100):
        start = time.perf_counter()
        response = await client.get("/api/v1/jobs?q=python&location=austin")
        elapsed = (time.perf_counter() - start) * 1000  # ms
        times.append(elapsed)
        assert response.status_code == 200

    times.sort()
    p95 = times[94]  # 95th percentile of 100 samples
    assert p95 < 500, f"p95 response time {p95:.0f}ms exceeds 500ms target"
```

## Continuous Integration

### Test Order in CI Pipeline

1. **Lint** -- Fast feedback on style issues (fails in <10s)
2. **Type Check** -- Catch type errors (fails in <30s)
3. **Unit Tests** -- Fast, isolated tests (fails in <60s)
4. **Integration Tests** -- API tests with database (fails in <120s)
5. **Build** -- Verify the application compiles/bundles (fails in <120s)
6. **E2E Tests** -- Browser tests (fails in <300s, runs only on main/staging)

### Test Parallelization

- Unit tests: run in parallel with `pytest-xdist` (`pytest -n auto`)
- Integration tests: run sequentially (shared database state)
- Frontend tests: Jest runs in parallel by default (per-file)
- E2E tests: Playwright runs in parallel (configurable workers)
