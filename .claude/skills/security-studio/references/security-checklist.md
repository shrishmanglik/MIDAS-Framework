---
name: "security-checklist"
studio: "security-studio"
---

# Application Security Checklist

## Authentication
- [ ] Passwords hashed with bcrypt/argon2 (not MD5/SHA1)
- [ ] MFA available for sensitive accounts
- [ ] Session tokens are random and expire
- [ ] Rate limiting on login endpoints
- [ ] Account lockout after failed attempts

## Authorization
- [ ] Server-side access control on every endpoint
- [ ] Principle of least privilege
- [ ] No direct object references without auth check
- [ ] Admin functions properly restricted

## Input Validation
- [ ] All user input validated server-side
- [ ] Parameterized queries (no string concatenation)
- [ ] Output encoding for XSS prevention
- [ ] File upload validation (type, size, content)

## Data Protection
- [ ] HTTPS everywhere (HSTS enabled)
- [ ] Sensitive data encrypted at rest
- [ ] No secrets in source code
- [ ] PII minimization

