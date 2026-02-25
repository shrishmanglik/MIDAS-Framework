---
name: "devops-review-protocol"
studio: "devops-studio"
---

# DevOps Review Severity and Protocol

## Review Severity Levels
| Level | Description | Action |
|-------|------------|--------|
| Critical | Security vulnerability, data loss risk | Block deployment, fix immediately |
| High | Reliability risk, missing rollback | Fix before production deployment |
| Medium | Performance concern, missing monitoring | Fix within sprint |
| Low | Best practice deviation | Backlog item |

## Review Areas
1. **Security**: Credentials, IAM, network, encryption
2. **Reliability**: HA, failover, backups, rollback
3. **Performance**: Scaling, resource limits, caching
4. **Cost**: Right-sizing, waste, optimization
5. **Operations**: Monitoring, logging, runbooks
6. **Documentation**: Architecture docs, change records

