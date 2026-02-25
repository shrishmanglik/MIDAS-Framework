---
name: "security-review-protocol"
studio: "security-studio"
---

# Security Review Severity and Protocol

## Severity Levels
| Level | Description | SLA | Example |
|-------|------------|-----|---------|
| Critical | Actively exploitable, data at risk | Fix immediately | SQL injection, auth bypass |
| High | Exploitable with effort, significant impact | Fix within 1 week | XSS, IDOR |
| Medium | Exploitable with specific conditions | Fix within 1 month | CSRF, info disclosure |
| Low | Minor risk, defense in depth | Fix in next cycle | Missing headers, verbose errors |
| Info | Best practice recommendation | Consider | Code quality, documentation |

