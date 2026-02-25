---
name: "runbook"
studio: "devops-studio"
tier: "tier-1"
---

# Operational runbook template
## Runbook: [Service/Incident Type]
**Service**: [Service name]
**Owner**: [Team]
**Last Updated**: [Date]

### Symptoms
- [What does the alert/issue look like?]
- [What metrics are affected?]

### Diagnosis Steps
1. Check [metric/log] at [location]
2. Verify [component] is healthy
3. Review recent deployments

### Resolution Steps
#### Scenario A: [Common cause]
1. [Step 1]
2. [Step 2]
3. Verify resolution: [How to confirm]

#### Scenario B: [Less common cause]
1. [Step 1]
2. [Step 2]

### Escalation
- If not resolved in [X] minutes → escalate to [team/person]
- If data loss suspected → follow incident response playbook

### Post-Resolution
- [ ] Update status page
- [ ] Write incident report
- [ ] Update this runbook if needed
