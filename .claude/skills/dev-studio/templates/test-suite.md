# Test Suite Template

## Test Suite: [Feature/Module]

### Unit Tests
```python
class Test[Feature]:
    def test_[happy_path](self):
        """[What this tests]"""
        # Arrange
        # Act
        # Assert

    def test_[edge_case](self):
        """[What this tests]"""

    def test_[error_case](self):
        """[What this tests]"""
```

### Integration Tests
```python
class Test[Feature]Integration:
    def test_[api_endpoint](self, client):
        """[End-to-end test description]"""

    def test_[auth_required](self, client):
        """Verify auth is enforced"""

    def test_[database_interaction](self, db_session):
        """Verify data persistence"""
```

### Edge Cases to Cover
- [ ] Empty input
- [ ] Maximum length input
- [ ] Invalid types
- [ ] Concurrent access
- [ ] Network failures (for external calls)