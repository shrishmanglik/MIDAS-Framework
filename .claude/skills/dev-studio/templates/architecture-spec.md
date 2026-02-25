# Architecture Specification

## System Overview
[1-2 sentence description of the system]

### Tech Stack
| Layer | Technology | Justification |
|-------|-----------|---------------|
| Backend | FastAPI + Python 3.11 | [reason] |
| Frontend | Next.js 14 + React 18 | [reason] |
| Database | PostgreSQL 15 | [reason] |
| ORM | SQLAlchemy 2.0 | [reason] |
| Auth | JWT + bcrypt | [reason] |

### Component Architecture
```
[Client] → [Next.js Frontend] → [FastAPI Backend] → [PostgreSQL]
                                      ↓
                               [Auth Middleware]
```

### API Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/auth/register | User registration | Public |
| POST | /api/auth/login | User login | Public |
| GET | /api/[resource] | List resources | Required |
| POST | /api/[resource] | Create resource | Required |
| GET | /api/[resource]/{id} | Get resource | Required |
| PUT | /api/[resource]/{id} | Update resource | Required |
| DELETE | /api/[resource]/{id} | Delete resource | Required |

### Database Schema
| Table | Columns | Relationships |
|-------|---------|---------------|
| users | id, email, password_hash, created_at | has_many: [resources] |
| [resource] | id, [fields], user_id, created_at | belongs_to: users |

### Authentication Flow
1. User registers with email/password
2. Password hashed with bcrypt (12 rounds)
3. JWT issued on login (access + refresh tokens)
4. Access token: 15min expiry, refresh token: 7d expiry
5. Protected routes verify JWT in Authorization header