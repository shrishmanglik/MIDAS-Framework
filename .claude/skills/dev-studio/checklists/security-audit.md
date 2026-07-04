# Security Audit Checklist

> Comprehensive security review checklist based on OWASP Top 10 and common web application vulnerabilities. Every item must be verified before production deployment.

## A01: Broken Access Control

- [ ] **Authentication on all protected endpoints** -- Every endpoint that reads or modifies user data requires a valid JWT token
- [ ] **Authorization checks on resource access** -- Users can only access resources they own or are authorized to view
- [ ] **Role-based access control enforced** -- Admin-only endpoints reject non-admin tokens with 403
- [ ] **Direct object reference protection** -- Users cannot access resources by guessing UUIDs of other users' data
- [ ] **HTTP method enforcement** -- Endpoints only accept documented HTTP methods; others return 405
- [ ] **CORS configured restrictively** -- Only known frontend origins allowed; no wildcard `*` in production
- [ ] **Rate limiting on sensitive endpoints** -- Login, registration, password reset limited to prevent brute force

## A02: Cryptographic Failures

- [ ] **Passwords hashed with bcrypt** -- Cost factor >= 12; never stored in plaintext or with weak hashing (MD5, SHA1)
- [ ] **JWT secret is strong** -- At least 256 bits of entropy (32 bytes hex); not a dictionary word
- [ ] **JWT secret is unique per environment** -- Development, staging, and production use different secrets
- [ ] **Tokens have expiration** -- Access tokens expire in <= 15 minutes; refresh tokens expire in <= 7 days
- [ ] **HTTPS enforced** -- All production traffic encrypted; HTTP redirects to HTTPS
- [ ] **Sensitive data not in URLs** -- Tokens, passwords, and PII never appear in query parameters or URL paths
- [ ] **Database credentials use strong passwords** -- Not defaults like `postgres/postgres` in production

## A03: Injection

- [ ] **SQL injection prevented** -- All database queries use ORM methods or parameterized statements; zero raw SQL with string concatenation
- [ ] **XSS prevented** -- User-provided text is escaped before rendering; React's JSX auto-escaping is not bypassed with `dangerouslySetInnerHTML`
- [ ] **Command injection prevented** -- No user input is passed to `os.system()`, `subprocess.run()`, or `exec()`
- [ ] **Template injection prevented** -- No user input is used in server-side template rendering without escaping
- [ ] **Path traversal prevented** -- File paths are validated; user input cannot navigate to `../../etc/passwd`
- [ ] **LDAP injection prevented** -- If LDAP is used, inputs are properly escaped
- [ ] **NoSQL injection prevented** -- If MongoDB is used, query operators in user input are sanitized

## A04: Insecure Design

- [ ] **Input validation at API boundary** -- Pydantic models validate type, length, format, and range on every input
- [ ] **Business rules enforced in code** -- Constraints like "max 5 active subscriptions" are enforced, not just documented
- [ ] **Error messages do not leak internals** -- 500 errors return a generic message, not stack traces or SQL queries
- [ ] **Enumeration attacks prevented** -- Login returns the same error for "email not found" and "wrong password"
- [ ] **Account lockout exists** -- After N failed login attempts, account is temporarily locked or CAPTCHA required

## A05: Security Misconfiguration

- [ ] **Debug mode disabled in production** -- `DEBUG=false`, `NODE_ENV=production`
- [ ] **Default credentials removed** -- No default admin accounts, no default database passwords
- [ ] **Unnecessary endpoints disabled** -- No `/debug`, `/test`, or `/admin` routes in production
- [ ] **Directory listing disabled** -- Web server does not expose directory contents
- [ ] **Error pages are custom** -- 404 and 500 pages do not reveal framework version or stack trace
- [ ] **Security headers set** -- Response includes:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Content-Security-Policy: default-src 'self'`
  - `Referrer-Policy: strict-origin-when-cross-origin`

## A06: Vulnerable and Outdated Components

- [ ] **No critical CVEs in dependencies** -- `npm audit` and `pip audit` report zero critical/high vulnerabilities
- [ ] **Dependencies are up to date** -- No dependency is more than 2 major versions behind latest
- [ ] **Unused dependencies removed** -- Every package in the manifest is actually imported in code
- [ ] **Docker base images are current** -- Base images use the latest patch version of their major/minor line
- [ ] **Dependency lock files committed** -- `package-lock.json` and `poetry.lock` are in version control

## A07: Identification and Authentication Failures

- [ ] **Password complexity enforced** -- Minimum 8 characters; recommend using a password strength meter
- [ ] **JWT token validation is complete** -- Verify signature, expiration, and issuer on every request
- [ ] **Refresh token rotation** -- Old refresh tokens are invalidated when a new one is issued
- [ ] **Session management is stateless** -- JWT-based auth does not rely on server-side sessions (or sessions are properly managed)
- [ ] **Logout invalidates tokens** -- A token denylist or short expiration ensures logged-out tokens cannot be reused
- [ ] **Password reset is secure** -- Reset tokens are single-use, time-limited (15 min), and sent only to verified email

## A08: Software and Data Integrity Failures

- [ ] **CI/CD pipeline is trusted** -- Only authorized branches can trigger deployment
- [ ] **Dependencies installed from trusted sources** -- npm registry and PyPI only; no unknown third-party registries
- [ ] **Database migrations are code-reviewed** -- Schema changes go through the same review process as application code
- [ ] **No auto-update of dependencies in production** -- Lock files ensure deterministic builds

## A09: Security Logging and Monitoring Failures

- [ ] **Authentication events are logged** -- Login success, login failure, and token refresh are recorded
- [ ] **Authorization failures are logged** -- 401 and 403 responses include the requested resource and user ID
- [ ] **Sensitive data is excluded from logs** -- Passwords, tokens, and PII are never written to log files
- [ ] **Logs are structured** -- JSON format with timestamp, level, request_id, user_id, and message
- [ ] **Log retention policy exists** -- Logs are retained for at least 30 days and archived for compliance
- [ ] **Alerting is configured** -- Spike in 401/403 responses triggers an alert to the operations team

## A10: Server-Side Request Forgery (SSRF)

- [ ] **User-provided URLs are validated** -- If the application fetches URLs from user input, only allowed domains are permitted
- [ ] **Internal network access blocked** -- Outbound requests from the application cannot reach internal services (169.254.x.x, 10.x.x.x, etc.)
- [ ] **URL scheme restricted** -- Only `http` and `https` schemes are allowed; `file://`, `ftp://`, `gopher://` are blocked

## Additional Checks

- [ ] **File upload validation** -- Uploaded files are validated by content type (magic bytes), not just extension
- [ ] **File size limits enforced** -- Maximum upload size is configured to prevent denial of service
- [ ] **CSRF protection on forms** -- State-changing form submissions include anti-CSRF tokens (if using cookies)
- [ ] **API versioning in place** -- `/api/v1/` prefix allows future breaking changes without affecting existing clients
- [ ] **Graceful degradation** -- Service returns 503 with retry-after header when overloaded, not crash

## Severity Classification

| Severity | Definition | SLA |
|----------|-----------|-----|
| CRITICAL | Active exploit possible, data breach risk | Fix immediately, block deployment |
| HIGH | Significant vulnerability, exploit requires specific conditions | Fix before next deployment |
| MEDIUM | Vulnerability exists but exploitation is unlikely | Fix within 1 sprint |
| LOW | Best practice violation, no direct exploit path | Fix when convenient |

## Audit Verdict

| Result | Action |
|--------|--------|
| Zero CRITICAL/HIGH findings | Approve for production |
| HIGH findings only | Fix or document accept-risk with human approval |
| Any CRITICAL finding | **BLOCK** -- fix immediately, no exceptions |
