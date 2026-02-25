---
name: "etl-pipeline"
studio: "data-studio"
tier: "tier-1/tier-2"
---

# ETL pipeline design template
## ETL Pipeline Specification
**Name**: [Pipeline name]
**Source(s)**: [Data sources]
**Destination**: [Target warehouse/database]
**Schedule**: [Cron schedule or trigger]

### Extract
| Source | Type | Connection | Incremental? |
|--------|------|-----------|-------------|
| | API/DB/File | | Yes/No |

### Transform
| Step | Description | Logic |
|------|------------|-------|
| 1 | | |
| 2 | | |

### Load
- **Target**: [Table/collection name]
- **Strategy**: [Upsert / Append / Replace]
- **Partitioning**: [If applicable]

### Quality Checks
- [ ] Row count validation
- [ ] Null check on required fields
- [ ] Referential integrity
- [ ] Freshness SLA

### Monitoring
- **Alerts**: [Failure, SLA breach, data quality]
- **Dashboard**: [Monitoring dashboard link]
