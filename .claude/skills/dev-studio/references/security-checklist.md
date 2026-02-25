# Security Development Checklist

## Authentication
- [ ] Passwords hashed with bcrypt (cost 12+)
- [ ] JWT with short expiry (15 min access, 7 day refresh)
- [ ] Refresh token rotation
- [ ] Rate limiting on auth endpoints

## Authorization
- [ ] Resource ownership verified on every request
- [ ] Role-based access control where needed
- [ ] No privilege escalation paths

## Input Validation
- [ ] All inputs validated with Pydantic
- [ ] SQL queries use parameterized statements
- [ ] File uploads validated (type, size)
- [ ] No user input in SQL, OS commands, or templates

## OWASP Top 10
- [ ] A01: Broken Access Control — ownership checks
- [ ] A02: Cryptographic Failures — bcrypt, TLS, no plaintext secrets
- [ ] A03: Injection — parameterized queries, input validation
- [ ] A04: Insecure Design — threat modeling done
- [ ] A05: Security Misconfiguration — secure defaults, no debug in prod
- [ ] A06: Vulnerable Components — dependencies audited
- [ ] A07: Auth Failures — strong passwords, rate limiting
- [ ] A08: Data Integrity — signed tokens, CSRF protection
- [ ] A09: Logging Failures — security events logged
- [ ] A10: SSRF — no user-controlled URLs in server requests

## Headers
- [ ] CORS configured correctly (not wildcard in prod)
- [ ] Content-Security-Policy set
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security set