# API Design Conventions

> Standard patterns for REST API design in dev-studio. All endpoints follow these conventions unless explicitly overridden by the architecture specification.

## URL Structure

```
Base URL:      /api/v1
Resources:     /api/v1/{resource}          (plural nouns: /users, /jobs, /comments)
Single:        /api/v1/{resource}/{id}     (UUID identifier)
Nested:        /api/v1/{parent}/{id}/{child}  (/users/{id}/applications)
Actions:       POST /api/v1/{resource}/{id}/{action}  (/jobs/{id}/publish)
```

### Rules

- Resources are always **plural nouns**: `/jobs` not `/job`, `/users` not `/user`
- Use **kebab-case** for multi-word resources: `/job-applications` not `/jobApplications`
- IDs are always **UUIDs**: `/jobs/550e8400-e29b-41d4-a716-446655440000`
- Nesting is limited to **one level**: `/users/{id}/jobs` is fine; `/users/{id}/jobs/{id}/applications` should be `/applications?job_id=...`
- API version is in the URL path: `/api/v1/` not in headers

## HTTP Methods

| Method | Usage | Idempotent | Request Body | Response |
|--------|-------|-----------|-------------|----------|
| GET | Read a resource or list | Yes | No | 200 with data |
| POST | Create a new resource | No | Yes | 201 with created resource |
| PUT | Full replacement of a resource | Yes | Yes | 200 with updated resource |
| PATCH | Partial update of a resource | Yes | Yes (partial) | 200 with updated resource |
| DELETE | Remove a resource | Yes | No | 204 with no body |

### Rules

- **GET** never modifies data. It is always safe to retry.
- **POST** is for creation. It is not idempotent (calling it twice creates two resources).
- **PATCH** is preferred over **PUT** for updates. Only send the fields that changed.
- **DELETE** returns 204 with no body on success. Deleting a non-existent resource returns 404.

## Request Format

### Create (POST)
```json
{
  "title": "Senior Python Developer",
  "description": "Build scalable APIs with FastAPI.",
  "location": "Austin, TX",
  "salary_min": 120000,
  "salary_max": 180000
}
```

### Update (PATCH)
```json
{
  "title": "Lead Python Developer",
  "salary_max": 200000
}
```

Only include the fields that are changing. Omitted fields are not modified.

### Query Parameters (GET)
```
GET /api/v1/jobs?q=python&location=austin&salary_min=100000&skip=0&limit=20&sort=-created_at
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Full-text search query |
| `skip` | integer | Number of records to skip (default: 0) |
| `limit` | integer | Maximum records to return (default: 100, max: 1000) |
| `sort` | string | Sort field with optional `-` prefix for descending |
| `[field]` | varies | Filter by specific field value |

## Response Format

### Success: Single Resource
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Senior Python Developer",
  "description": "Build scalable APIs with FastAPI.",
  "location": "Austin, TX",
  "salary_min": 120000,
  "salary_max": 180000,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

Note: Single resource responses return the object directly, not wrapped in a `data` key. This is simpler and more common in modern APIs.

### Success: List of Resources
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Senior Python Developer",
      "location": "Austin, TX",
      "salary_min": 120000,
      "salary_max": 180000,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "skip": 0,
    "limit": 20
  }
}
```

List responses always include `meta` with pagination information.

### Success: Delete
```
HTTP 204 No Content
(empty body)
```

## Error Response Format

All errors follow this structure:

```json
{
  "detail": "Human-readable error message explaining what went wrong",
  "code": "MACHINE_READABLE_ERROR_CODE",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "type": "value_error"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `detail` | string | Yes | Human-readable error message |
| `code` | string | Yes | Machine-readable error code (UPPER_SNAKE_CASE) |
| `errors` | array | No | Field-level validation errors (only for 422) |

## HTTP Status Codes

### Success Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST that creates a resource |
| 204 | No Content | Successful DELETE |

### Client Error Codes

| Code | Meaning | When to Use | Error Code Example |
|------|---------|-------------|-------------------|
| 400 | Bad Request | Malformed JSON, invalid query params | `BAD_REQUEST` |
| 401 | Unauthorized | Missing or invalid authentication token | `INVALID_TOKEN`, `TOKEN_EXPIRED` |
| 403 | Forbidden | Authenticated but not authorized for this action | `INSUFFICIENT_PERMISSIONS` |
| 404 | Not Found | Resource does not exist | `RESOURCE_NOT_FOUND` |
| 409 | Conflict | Duplicate resource (unique constraint violation) | `DUPLICATE_EMAIL`, `ALREADY_EXISTS` |
| 422 | Unprocessable Entity | Input validation failed (valid JSON but invalid values) | `VALIDATION_ERROR` |
| 429 | Too Many Requests | Rate limit exceeded | `RATE_LIMIT_EXCEEDED` |

### Server Error Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 500 | Internal Server Error | Unhandled exception (log the stack trace, return generic message) |
| 503 | Service Unavailable | Database down, external dependency unavailable |

### Rules

- **Never return 200 for errors.** If something went wrong, use an error status code.
- **Never return 500 with a stack trace.** Log it internally, return a generic message to the client.
- **401 vs 403:** 401 means "who are you?" (no/invalid token). 403 means "I know who you are, but you're not allowed" (valid token, wrong role).
- **404 vs 403 for unauthorized access:** Return 404 (not 403) when a user tries to access a resource they don't own. This prevents resource enumeration attacks.

## Authentication

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Lifecycle

| Token Type | Lifetime | Storage | Refresh |
|-----------|----------|---------|---------|
| Access Token | 15 minutes | Memory (frontend) | Use refresh token |
| Refresh Token | 7 days | HttpOnly cookie or secure storage | Re-authenticate |

### Auth Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/auth/register` | POST | None | Create new account |
| `/api/v1/auth/login` | POST | None | Authenticate and get tokens |
| `/api/v1/auth/refresh` | POST | Refresh token | Get new access token |
| `/api/v1/auth/logout` | POST | Access token | Invalidate tokens |
| `/api/v1/auth/me` | GET | Access token | Get current user profile |

## Pagination

### Request
```
GET /api/v1/jobs?skip=20&limit=10
```

### Rules

- Default `skip`: 0
- Default `limit`: 100
- Maximum `limit`: 1000
- `skip` must be >= 0
- `limit` must be >= 1 and <= 1000
- Response always includes `meta.total` for client-side pagination UI

## Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| URL paths | kebab-case | `/api/v1/job-applications` |
| Query parameters | snake_case | `?salary_min=50000` |
| Request/response fields | snake_case | `"created_at": "2024-01-15T10:30:00Z"` |
| Error codes | UPPER_SNAKE_CASE | `"code": "DUPLICATE_EMAIL"` |
| Headers | Title-Case | `Authorization`, `Content-Type` |

## Timestamps

- All timestamps use **ISO 8601 format** with UTC timezone: `2024-01-15T10:30:00Z`
- All timestamps are returned in **UTC**. The client is responsible for converting to local time.
- Field names use the `_at` suffix: `created_at`, `updated_at`, `deleted_at`, `published_at`

## Health Check Endpoint

```
GET /health
```

```json
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

This endpoint requires no authentication and is used by load balancers and monitoring systems.
