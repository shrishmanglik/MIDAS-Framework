---
name: "secure-coding-patterns"
studio: "security-studio"
---

# Secure Coding Patterns

## Input Validation
- Whitelist over blacklist
- Validate on the server, sanitize on output
- Use parameterized queries for ALL database access
- Validate file types by content, not extension

## Authentication
- Use established libraries (don't roll your own)
- bcrypt or Argon2 for password hashing
- JWT with short expiration + refresh tokens
- Rate limit all authentication endpoints

## Authorization
- Check permissions server-side on every request
- Use role-based access control (RBAC)
- Deny by default, grant explicitly
- Log all access control failures

## Secrets Management
- Never commit secrets to version control
- Use environment variables or secret managers
- Rotate secrets regularly
- Different secrets per environment

