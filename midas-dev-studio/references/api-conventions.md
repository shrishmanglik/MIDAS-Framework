# API Conventions — MIDAS Dev Studio

Standards for REST API design across all MIDAS-built applications.

---

## URL Naming

- **Plural nouns:** `/api/v1/books`, not `/api/v1/book`
- **Lowercase, hyphen-separated:** `/api/v1/book-categories`, not `/api/v1/bookCategories`
- **No verbs in URLs:** `/api/v1/books` with POST, not `/api/v1/createBook`
- **Versioned:** Always prefix with `/api/v1/`
- **Nested resources (max 1 level):** `/api/v1/authors/5/books`, never deeper

## HTTP Methods

| Method | Purpose | Idempotent | Response Code |
|---|---|---|---|
| GET | Read (single or list) | Yes | 200 |
| POST | Create | No | 201 |
| PUT | Full update | Yes | 200 |
| PATCH | Partial update | Yes | 200 |
| DELETE | Remove | Yes | 204 |

## Request/Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "optional success message"
}
```

For list endpoints:
```json
{
  "data": [ ... ],
  "total": 42,
  "skip": 0,
  "limit": 20
}
```

### Error Response
```json
{
  "detail": "Human-readable error description",
  "status_code": 404
}
```

### Validation Error (422)
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Pagination

- Query parameters: `?skip=0&limit=20`
- Default limit: 20
- Maximum limit: 100
- Response includes: total count, skip, limit

## Filtering and Sorting

- Filter: `?status=active&genre=fiction`
- Sort: `?sort_by=created_at&sort_order=desc`
- Search: `?q=search+term` (for text search across relevant fields)

## Authentication

- Bearer token in Authorization header: `Authorization: Bearer <jwt>`
- Token endpoints: `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/refresh`
- Protected endpoints return 401 without token, 403 without permission

## Error Codes

| Code | When |
|---|---|
| 400 | Bad request (malformed body, invalid parameters) |
| 401 | Missing or invalid authentication token |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate unique field) |
| 422 | Validation error (Pydantic/FastAPI auto-generates) |
| 500 | Internal server error (should never happen in production) |

## Versioning Strategy

- URL versioning: `/api/v1/`, `/api/v2/`
- Major version bump only for breaking changes
- Minor changes (new fields, new endpoints) don't require version bump
- Deprecation: announce in response headers, remove after 2 minor versions
