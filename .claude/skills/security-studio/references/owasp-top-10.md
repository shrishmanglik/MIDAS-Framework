---
name: "owasp-top-10"
studio: "security-studio"
---

# OWASP Top 10 Quick Reference

| # | Risk | Description | Prevention |
|---|------|------------|------------|
| 1 | Broken Access Control | Unauthorized access to functions/data | Deny by default, validate server-side |
| 2 | Cryptographic Failures | Sensitive data exposure | Encrypt at rest and transit, use strong algorithms |
| 3 | Injection | SQL/NoSQL/OS/LDAP injection | Parameterized queries, input validation |
| 4 | Insecure Design | Missing security in design | Threat modeling, secure design patterns |
| 5 | Security Misconfiguration | Default configs, open cloud storage | Hardened configs, minimal permissions |
| 6 | Vulnerable Components | Outdated dependencies | Regular updates, dependency scanning |
| 7 | Auth Failures | Broken authentication | MFA, strong password policies, rate limiting |
| 8 | Data Integrity Failures | Untrusted deserialization, CI/CD | Verify integrity, secure pipeline |
| 9 | Logging Failures | Insufficient monitoring | Comprehensive logging, alerting |
| 10 | SSRF | Server-side request forgery | Input validation, network segmentation |

