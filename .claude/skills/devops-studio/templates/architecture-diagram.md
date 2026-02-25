---
name: "architecture-diagram"
studio: "devops-studio"
tier: "tier-1"
---

# Infrastructure architecture documentation template
## Infrastructure Architecture
**Project**: [Name]
**Environment**: [Production/Staging/Dev]
**Cloud Provider**: [AWS/GCP/Azure]
**Last Updated**: [Date]

### Architecture Overview
```
[Load Balancer]
    |
[Web Servers (Auto-scaling)]
    |
[Application Servers]
    |
[Database] --- [Cache] --- [Queue]
    |
[Object Storage]
```

### Components
| Component | Service | Specs | Purpose |
|-----------|---------|-------|---------|
| Load Balancer | ALB | | Traffic distribution |
| Web Server | EC2/ECS | | Request handling |
| Database | RDS PostgreSQL | | Data persistence |
| Cache | ElastiCache Redis | | Session/data cache |
| Queue | SQS | | Async processing |
| Storage | S3 | | File storage |

### Network
- VPC CIDR: 10.0.0.0/16
- Public subnets: 10.0.1.0/24, 10.0.2.0/24
- Private subnets: 10.0.10.0/24, 10.0.20.0/24

### Security Groups
| Name | Inbound | Outbound | Attached To |
|------|---------|----------|------------|
| | | | |
