# API Design Conventions

## URL Structure
- Base: `/api/v1/`
- Resources: plural nouns (`/users`, `/products`)
- Nested: `/users/{id}/orders`
- Actions: POST to `/resources/{id}/[action]`

## HTTP Methods
- GET: Read (list or detail)
- POST: Create
- PUT: Full update
- PATCH: Partial update
- DELETE: Remove

## Response Format
```json
{
  "data": {},
  "meta": {"total": 100, "page": 1}
}
```

## Error Format
```json
{
  "detail": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "errors": [{"field": "email", "message": "Invalid format"}]
}
```

## Status Codes
- 200: Success
- 201: Created
- 204: No content (successful delete)
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict
- 422: Validation error
- 500: Server error

## Pagination
- Query params: `?skip=0&limit=100`
- Default limit: 100, max: 1000
- Response includes total count in meta