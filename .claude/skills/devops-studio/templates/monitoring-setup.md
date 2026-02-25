---
name: "monitoring-setup"
studio: "devops-studio"
tier: "tier-1"
---

# Monitoring and alerting configuration template
## Monitoring Setup
### SLOs
| Service | SLI | SLO | Error Budget |
|---------|-----|-----|-------------|
| API | Latency p99 | <500ms | 0.1% |
| API | Availability | 99.9% | 43.8 min/month |
| Web | Page Load | <3s | 0.5% |

### Alert Rules
| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | >1% 5xx in 5min | Critical | Page on-call |
| High Latency | p99 >1s for 10min | Warning | Slack notification |
| Disk Usage | >85% | Warning | Slack + auto-scale |

### Dashboard Sections
1. **Overview**: Request rate, error rate, latency
2. **Infrastructure**: CPU, memory, disk, network
3. **Application**: Business metrics, queue depth
4. **Alerts**: Active alerts timeline
