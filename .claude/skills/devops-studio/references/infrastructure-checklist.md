---
name: "infrastructure-checklist"
studio: "devops-studio"
---

# Infrastructure Review Checklist

## Security
- [ ] No hardcoded credentials
- [ ] Secrets in secret manager
- [ ] Least privilege IAM policies
- [ ] Network segmentation (public/private subnets)
- [ ] Encryption at rest and in transit
- [ ] Security groups properly scoped

## Reliability
- [ ] Multi-AZ deployment
- [ ] Auto-scaling configured
- [ ] Health checks on all services
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented
- [ ] Rollback procedure tested

## Monitoring
- [ ] Logging centralized
- [ ] Metrics dashboards created
- [ ] Alerts configured (actionable, not noisy)
- [ ] SLOs defined
- [ ] Runbooks for common incidents

## Cost
- [ ] Right-sized instances
- [ ] Reserved capacity for predictable workloads
- [ ] Unused resources identified
- [ ] Cost alerts configured
- [ ] Tags for cost allocation

