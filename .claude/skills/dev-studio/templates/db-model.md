# Database Model Template

## Model: [Name]

### Schema
```python
class [Name](Base):
    __tablename__ = "[table_name]"

    id = Column(Integer, primary_key=True, index=True)
    # fields
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # relationships
    # owner = relationship("User", back_populates="[items]")
```

### Indexes
- Primary: id
- [Additional indexes for common queries]

### Constraints
- [Unique constraints]
- [Foreign key constraints]
- [Check constraints]