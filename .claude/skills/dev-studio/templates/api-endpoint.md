# API Endpoint Template

## Endpoint: [METHOD] /api/[path]

### Description
[What this endpoint does]

### Request
```python
# Path parameters
[param]: [type]  # [description]

# Query parameters (for GET/LIST)
skip: int = 0
limit: int = 100

# Request body (for POST/PUT)
class [Resource]Create(BaseModel):
    field1: str
    field2: int | None = None
```

### Response
```python
# Success (200/201)
class [Resource]Response(BaseModel):
    id: int
    field1: str
    created_at: datetime

# Error (4xx)
{"detail": "Error message"}
```

### Authorization
- Required role: [public/authenticated/admin]
- Resource ownership check: [yes/no]