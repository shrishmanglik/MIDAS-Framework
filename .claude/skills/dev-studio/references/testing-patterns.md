# Testing Patterns and Standards

## Test Structure
```
tests/
├── unit/           # Isolated function tests
├── integration/    # API endpoint tests
├── e2e/            # Full flow tests
└── conftest.py     # Shared fixtures
```

## Coverage Thresholds
- Backend: 80% minimum
- Frontend: 70% minimum
- Critical paths: 100% (auth, payments)

## Test Naming
- `test_[feature]_[scenario]_[expected_result]`
- Example: `test_login_invalid_password_returns_401`

## Fixture Pattern
```python
@pytest.fixture
def test_user(db_session):
    user = User(email="test@example.com")
    db_session.add(user)
    db_session.commit()
    yield user
    db_session.delete(user)
```

## What to Test
- Happy path (expected usage)
- Edge cases (empty, max, boundary)
- Error cases (invalid input, auth failures)
- Security (injection, unauthorized access)