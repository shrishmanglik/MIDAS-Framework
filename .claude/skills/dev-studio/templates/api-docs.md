# API Documentation Template

## [API Name] Documentation

### Base URL
`http://localhost:8000/api`

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Create account | No |
| POST | /auth/login | Get tokens | No |
| POST | /auth/refresh | Refresh token | Yes |

#### [Resource]
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /[resource] | List all | Yes |
| POST | /[resource] | Create new | Yes |
| GET | /[resource]/{id} | Get by ID | Yes |
| PUT | /[resource]/{id} | Update | Yes |
| DELETE | /[resource]/{id} | Delete | Yes |

### Error Responses
| Code | Description |
|------|-------------|
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 422 | Unprocessable entity |
| 500 | Internal server error |